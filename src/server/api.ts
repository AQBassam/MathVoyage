import express, { Request, Response } from 'express';
import { optionalAuth, requireAuth, AuthRequest } from '../middleware/auth.ts';
import {
  getOrCreateUser,
  getUserProfile,
  recordGameSession,
  updateFactMastery,
  unlockBadge,
  updateUserSettings,
  resetUserProgress,
} from '../db/users.ts';
import { db } from '../db/index.ts';
import { factsMastery, gameSessions, users } from '../db/schema.ts';
import { eq, sql } from 'drizzle-orm';

export const apiApp = express();
apiApp.use(express.json());

// Helper to get effective UID (either from authenticated Firebase token or guest fallback identifier)
function getUid(req: Request): string {
  const authReq = req as AuthRequest;
  if (authReq.user?.uid) {
    return authReq.user.uid;
  }
  const clientUid = req.headers['x-guest-uid'] as string;
  if (clientUid && clientUid.trim().length > 0) {
    return `guest_${clientUid.trim()}`;
  }
  return 'guest_default_player';
}

function getEmail(req: Request): string {
  const authReq = req as AuthRequest;
  if (authReq.user?.email) {
    return authReq.user.email;
  }
  const uid = getUid(req);
  return `${uid}@guest.local`;
}

// GET /api/me
apiApp.get('/api/me', optionalAuth, async (req: Request, res: Response) => {
  try {
    const uid = getUid(req);
    const email = getEmail(req);
    const authReq = req as AuthRequest;
    const displayName = authReq.user?.name || req.headers['x-player-name'] as string || 'بطل الرياضيات';

    const user = await getOrCreateUser(uid, email, displayName);
    const profile = await getUserProfile(uid);

    res.json({
      user,
      profile,
    });
  } catch (error) {
    console.error('API /api/me error:', error);
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

// POST /api/sync
apiApp.post('/api/sync', optionalAuth, async (req: Request, res: Response) => {
  try {
    const uid = getUid(req);
    const email = getEmail(req);
    const { guestFacts, guestSessions, guestStars, guestBadges, displayName } = req.body;

    const user = await getOrCreateUser(uid, email, displayName);

    if (Array.isArray(guestFacts)) {
      for (const f of guestFacts) {
        if (f.factorA && f.factorB) {
          await updateFactMastery(uid, {
            factorA: f.factorA,
            factorB: f.factorB,
            isCorrect: f.correct > 0,
            wrongAnswer: f.lastMistake,
          });
        }
      }
    }

    if (Array.isArray(guestBadges)) {
      for (const badgeId of guestBadges) {
        await unlockBadge(uid, badgeId);
      }
    }

    const updatedProfile = await getUserProfile(uid);
    res.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.error('API /api/sync error:', error);
    res.status(500).json({ error: 'Failed to sync progress' });
  }
});

// POST /api/facts/record
apiApp.post('/api/facts/record', optionalAuth, async (req: Request, res: Response) => {
  try {
    const uid = getUid(req);
    const { factorA, factorB, isCorrect, wrongAnswer } = req.body;

    if (typeof factorA !== 'number' || typeof factorB !== 'number' || typeof isCorrect !== 'boolean') {
      return res.status(400).json({ error: 'Invalid fact record payload' });
    }

    await updateFactMastery(uid, {
      factorA,
      factorB,
      isCorrect,
      wrongAnswer,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('API /api/facts/record error:', error);
    res.status(500).json({ error: 'Failed to record fact attempt' });
  }
});

// POST /api/sessions
apiApp.post('/api/sessions', optionalAuth, async (req: Request, res: Response) => {
  try {
    const uid = getUid(req);
    const { gameType, tableNumber, score, totalQuestions, starsEarned, accuracyPercent } = req.body;

    if (!gameType || typeof score !== 'number' || typeof totalQuestions !== 'number') {
      return res.status(400).json({ error: 'Invalid session payload' });
    }

    const result = await recordGameSession(uid, {
      gameType,
      tableNumber: tableNumber || 0,
      score,
      totalQuestions,
      starsEarned: starsEarned || 0,
      accuracyPercent: accuracyPercent || 0,
    });

    res.json(result);
  } catch (error) {
    console.error('API /api/sessions error:', error);
    res.status(500).json({ error: 'Failed to record game session' });
  }
});

// GET /api/progress
apiApp.get('/api/progress', optionalAuth, async (req: Request, res: Response) => {
  try {
    const uid = getUid(req);
    const profile = await getUserProfile(uid);
    if (!profile) {
      return res.json({
        totalMastered: 0,
        accuracy: 100,
        stars: 0,
        level: 1,
        tableStats: {},
        strugglingFacts: [],
        reviewRecommendations: [],
      });
    }

    const { facts, user, sessions, badges: unlockedBadges } = profile;

    // Build fact stats map
    const factMap: Record<string, any> = {};
    let totalAttempts = 0;
    let totalCorrect = 0;
    let masteredCount = 0;
    const strugglingFacts: any[] = [];

    facts.forEach((f) => {
      factMap[f.factKey] = f;
      totalAttempts += f.attempts;
      totalCorrect += f.correct;
      if (f.isMastered) masteredCount++;

      const acc = f.attempts > 0 ? (f.correct / f.attempts) * 100 : 0;
      if (f.attempts >= 2 && acc < 70) {
        let mistakes: number[] = [];
        try {
          mistakes = JSON.parse(f.commonMistakes);
        } catch {}
        strugglingFacts.push({
          factorA: f.factorA,
          factorB: f.factorB,
          accuracy: Math.round(acc),
          attempts: f.attempts,
          mistakes,
        });
      }
    });

    // Compute stats per table (1 to 10)
    const tableStats: Record<number, { mastered: number; total: number; percent: number }> = {};
    for (let t = 1; t <= 10; t++) {
      let masteredInT = 0;
      for (let j = 1; j <= 10; j++) {
        const key = `${t}x${j}`;
        if (factMap[key]?.isMastered) {
          masteredInT++;
        }
      }
      tableStats[t] = {
        mastered: masteredInT,
        total: 10,
        percent: Math.round((masteredInT / 10) * 100),
      };
    }

    // Identify recommendations: struggling facts first, then unmastered facts from lowest table
    const recommendations: Array<{ factorA: number; factorB: number; reason: string }> = [];
    strugglingFacts.slice(0, 3).forEach((sf) => {
      recommendations.push({
        factorA: sf.factorA,
        factorB: sf.factorB,
        reason: 'بحاجة لمزيد من التدريب لتثبيت الإتقان',
      });
    });

    if (recommendations.length < 5) {
      for (let t = 1; t <= 10 && recommendations.length < 5; t++) {
        for (let j = 1; j <= 10 && recommendations.length < 5; j++) {
          const key = `${t}x${j}`;
          if (!factMap[key]?.isMastered && !recommendations.some((r) => r.factorA === t && r.factorB === j)) {
            recommendations.push({
              factorA: t,
              factorB: j,
              reason: `المسألة التالية في جدول الضرب في ${t}`,
            });
          }
        }
      }
    }

    const overallAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 100;

    res.json({
      stars: user.stars,
      level: user.level,
      totalMastered: masteredCount,
      totalFacts: 100,
      overallAccuracy,
      totalAttempts,
      tableStats,
      strugglingFacts,
      reviewRecommendations: recommendations,
      unlockedBadges,
      recentSessions: sessions.slice(0, 10),
    });
  } catch (error) {
    console.error('API /api/progress error:', error);
    res.status(500).json({ error: 'Failed to calculate progress' });
  }
});

// POST /api/badges/unlock
apiApp.post('/api/badges/unlock', optionalAuth, async (req: Request, res: Response) => {
  try {
    const uid = getUid(req);
    const { badgeId } = req.body;
    if (!badgeId) return res.status(400).json({ error: 'badgeId required' });
    await unlockBadge(uid, badgeId);
    res.json({ success: true });
  } catch (error) {
    console.error('API /api/badges/unlock error:', error);
    res.status(500).json({ error: 'Failed to unlock badge' });
  }
});

// POST /api/daily-reward/claim
apiApp.post('/api/daily-reward/claim', optionalAuth, async (req: Request, res: Response) => {
  try {
    const uid = getUid(req);
    const email = getEmail(req);
    const { streak, bonusStars } = req.body;
    const starsToAdd = typeof bonusStars === 'number' ? bonusStars : 3;

    const user = await getOrCreateUser(uid, email);
    const newStars = user.stars + starsToAdd;
    const newLevel = Math.max(1, Math.floor(newStars / 15) + 1);

    await db
      .update(users)
      .set({
        stars: newStars,
        level: newLevel,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    if (typeof streak === 'number') {
      if (streak >= 3) {
        await unlockBadge(uid, 'daily_streak_3');
      }
      if (streak >= 7) {
        await unlockBadge(uid, 'daily_streak_7');
      }
    }

    res.json({ success: true, stars: newStars, level: newLevel, streak });
  } catch (error) {
    console.error('API /api/daily-reward/claim error:', error);
    res.status(500).json({ error: 'Failed to claim daily reward' });
  }
});

// PATCH /api/settings
apiApp.patch('/api/settings', optionalAuth, async (req: Request, res: Response) => {
  try {
    const uid = getUid(req);
    const { soundEnabled, reducedMotion, displayName } = req.body;
    const updated = await updateUserSettings(uid, { soundEnabled, reducedMotion, displayName });
    res.json({ success: true, user: updated });
  } catch (error) {
    console.error('API /api/settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// GET /api/dashboard
apiApp.get('/api/dashboard', optionalAuth, async (req: Request, res: Response) => {
  try {
    const uid = getUid(req);
    const profile = await getUserProfile(uid);

    const allSessions = profile?.sessions || [];
    const allFacts = profile?.facts || [];

    const totalPracticed = allSessions.length;
    const totalTimeApproxMinutes = Math.round(totalPracticed * 2.5); // avg 2.5 min per activity

    // Common tricky facts
    const hardest = allFacts
      .filter((f) => f.attempts > 1)
      .map((f) => ({
        fact: `${f.factorA} × ${f.factorB} = ${f.factorA * f.factorB}`,
        factorA: f.factorA,
        factorB: f.factorB,
        attempts: f.attempts,
        correct: f.correct,
        accuracy: Math.round((f.correct / f.attempts) * 100),
      }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5);

    // Distribution by game type
    const gameTypeCounts: Record<string, number> = {};
    allSessions.forEach((s) => {
      gameTypeCounts[s.gameType] = (gameTypeCounts[s.gameType] || 0) + 1;
    });

    res.json({
      player: profile?.user || { displayName: 'بطل الرياضيات', level: 1, stars: 0 },
      totalPracticed,
      totalTimeApproxMinutes,
      hardestFacts: hardest,
      gameTypeBreakdown: gameTypeCounts,
      recentSessions: allSessions.slice(0, 15),
    });
  } catch (error) {
    console.error('API /api/dashboard error:', error);
    res.status(500).json({ error: 'Failed to generate dashboard' });
  }
});

// POST /api/progress/reset
apiApp.post('/api/progress/reset', optionalAuth, async (req: Request, res: Response) => {
  try {
    const uid = getUid(req);
    await resetUserProgress(uid);
    res.json({ success: true, message: 'Progress reset successfully' });
  } catch (error) {
    console.error('API /api/progress/reset error:', error);
    res.status(500).json({ error: 'Failed to reset progress' });
  }
});

