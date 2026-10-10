import express, { Request, Response } from 'express';
import { optionalAuth, AuthRequest } from '../middleware/auth.ts';
import { guestIdentity, GuestRequest } from './identity.ts';
import {
  getOrCreateUser,
  getUserProfile,
  recordGameSession,
  updateFactMastery,
  unlockBadge,
  updateUserSettings,
  resetUserProgress,
  claimDailyReward,
} from '../db/users.ts';
import { db } from '../db/index.ts';
import { sql } from 'drizzle-orm';
import { ALL_BADGES } from '../data/multiplicationData.ts';
import type { GameType } from '../types/game.ts';

export const apiApp = express();
apiApp.disable('x-powered-by');
apiApp.use('/api', express.json({ limit: '64kb' }));
apiApp.use('/api', guestIdentity);

// ---------- identity ----------

/** Verified Firebase uid when signed in; otherwise the server-issued guest id from the signed cookie. */
function getUid(req: Request): string {
  const authReq = req as AuthRequest;
  if (authReq.user?.uid) return authReq.user.uid;
  const guestId = (req as GuestRequest).guestId;
  if (!guestId) throw new Error('guestIdentity middleware did not run');
  return `g_${guestId}`;
}

function isAuthenticated(req: Request): boolean {
  return Boolean((req as AuthRequest).user?.uid);
}

function getEmail(req: Request): string {
  const authReq = req as AuthRequest;
  return authReq.user?.email || `${getUid(req)}@guest.local`;
}

// ---------- validation ----------

const VALID_BADGES = new Set(ALL_BADGES.map((b) => b.id));
const VALID_GAME_TYPES = new Set<GameType>([
  'visuals', 'equation', 'choice', 'missing', 'pairs', 'build', 'race',
  'mixed', 'truefalse', 'memory', 'maze', 'bingo', 'detective', 'timechallenge',
]);

function isInt(v: unknown, min: number, max: number): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max;
}

/** Trims, strips control characters and caps length. Returns undefined when nothing usable remains. */
function sanitizeName(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined;
  const clean = v.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 40);
  return clean.length ? clean : undefined;
}

/** The client sends the name URI-encoded, because HTTP headers cannot carry Arabic characters. */
function nameFromHeader(req: Request): string | undefined {
  const raw = req.headers['x-player-name'];
  if (typeof raw !== 'string') return undefined;
  try {
    return sanitizeName(decodeURIComponent(raw));
  } catch {
    return undefined;
  }
}

function parseFact(f: any) {
  if (!f || !isInt(f.factorA, 0, 12) || !isInt(f.factorB, 0, 12)) return null;
  return {
    factorA: f.factorA as number,
    factorB: f.factorB as number,
  };
}

function parseWrongAnswer(v: unknown): number | undefined {
  return isInt(v, -1000, 100000) ? v : undefined;
}

/** Stars per session, recomputed on the server with the same thresholds as GamePlayScreen. */
function starsForAccuracy(accuracy: number): number {
  if (accuracy >= 90) return 3;
  if (accuracy >= 60) return 2;
  return 1;
}

function fail(res: Response, label: string, error: unknown, message: string) {
  console.error(`API ${label} error:`, error);
  res.status(500).json({ error: message });
}

// ---------- routes ----------

// GET /api/health — liveness and database connectivity
apiApp.get('/api/health', async (_req: Request, res: Response) => {
  try {
    await db.execute(sql`select 1`);
    res.json({ ok: true });
  } catch {
    res.status(503).json({ ok: false });
  }
});

// GET /api/me — read-only for guests, so crawlers and one-off visits do not create rows
apiApp.get('/api/me', optionalAuth, async (req: Request, res: Response) => {
  try {
    const uid = getUid(req);
    const authReq = req as AuthRequest;
    let user = null;
    if (isAuthenticated(req)) {
      user = await getOrCreateUser(uid, getEmail(req), sanitizeName(authReq.user?.name) || nameFromHeader(req));
    }
    const profile = await getUserProfile(uid);
    res.json({ user: user ?? profile?.user ?? null, profile });
  } catch (error) {
    fail(res, '/api/me', error, 'Failed to retrieve profile');
  }
});

// POST /api/sync — merges local guest progress into the signed-in account
apiApp.post('/api/sync', optionalAuth, async (req: Request, res: Response) => {
  try {
    const uid = getUid(req);
    const { guestFacts, guestBadges, displayName } = req.body ?? {};

    await getOrCreateUser(uid, getEmail(req), sanitizeName(displayName));

    if (Array.isArray(guestFacts)) {
      for (const f of guestFacts.slice(0, 144)) {
        const fact = parseFact(f);
        if (!fact) continue;
        await updateFactMastery(uid, {
          ...fact,
          isCorrect: typeof f.correct === 'number' && f.correct > 0,
          wrongAnswer: Array.isArray(f.commonMistakes) ? parseWrongAnswer(f.commonMistakes.at(-1)) : undefined,
        });
      }
    }

    if (Array.isArray(guestBadges)) {
      for (const badgeId of guestBadges.slice(0, 100)) {
        if (typeof badgeId === 'string' && VALID_BADGES.has(badgeId)) {
          await unlockBadge(uid, badgeId);
        }
      }
    }

    const updatedProfile = await getUserProfile(uid);
    res.json({ success: true, profile: updatedProfile });
  } catch (error) {
    fail(res, '/api/sync', error, 'Failed to sync progress');
  }
});

// POST /api/facts/record
apiApp.post('/api/facts/record', optionalAuth, async (req: Request, res: Response) => {
  try {
    const body = req.body ?? {};
    const fact = parseFact(body);
    if (!fact || typeof body.isCorrect !== 'boolean') {
      return res.status(400).json({ error: 'Invalid fact record payload' });
    }

    await updateFactMastery(getUid(req), {
      ...fact,
      isCorrect: body.isCorrect,
      wrongAnswer: parseWrongAnswer(body.wrongAnswer),
    });

    res.json({ success: true });
  } catch (error) {
    fail(res, '/api/facts/record', error, 'Failed to record fact attempt');
  }
});

// POST /api/sessions — stars and accuracy are recomputed on the server
apiApp.post('/api/sessions', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { gameType, tableNumber, score, totalQuestions } = req.body ?? {};

    if (
      typeof gameType !== 'string' ||
      !VALID_GAME_TYPES.has(gameType as GameType) ||
      !isInt(totalQuestions, 0, 500) ||
      !isInt(score, 0, 100000)
    ) {
      return res.status(400).json({ error: 'Invalid session payload' });
    }

    const boundedScore = Math.min(score, totalQuestions);
    const accuracyPercent = totalQuestions > 0 ? Math.round((boundedScore / totalQuestions) * 100) : 100;

    const result = await recordGameSession(getUid(req), {
      gameType,
      tableNumber: isInt(tableNumber, 0, 10) ? tableNumber : 0,
      score: boundedScore,
      totalQuestions,
      starsEarned: starsForAccuracy(accuracyPercent),
      accuracyPercent,
    });

    res.json(result);
  } catch (error) {
    fail(res, '/api/sessions', error, 'Failed to record game session');
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

    const tableStats: Record<number, { mastered: number; total: number; percent: number }> = {};
    for (let t = 1; t <= 10; t++) {
      let masteredInT = 0;
      for (let j = 1; j <= 10; j++) {
        if (factMap[`${t}x${j}`]?.isMastered) masteredInT++;
      }
      tableStats[t] = {
        mastered: masteredInT,
        total: 10,
        percent: Math.round((masteredInT / 10) * 100),
      };
    }

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
    fail(res, '/api/progress', error, 'Failed to calculate progress');
  }
});

// POST /api/badges/unlock — only known badge ids are accepted
apiApp.post('/api/badges/unlock', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { badgeId } = req.body ?? {};
    if (typeof badgeId !== 'string' || !VALID_BADGES.has(badgeId)) {
      return res.status(400).json({ error: 'Unknown badgeId' });
    }
    await unlockBadge(getUid(req), badgeId);
    res.json({ success: true });
  } catch (error) {
    fail(res, '/api/badges/unlock', error, 'Failed to unlock badge');
  }
});

// POST /api/daily-reward/claim — streak and stars are computed on the server; the body is ignored
apiApp.post('/api/daily-reward/claim', optionalAuth, async (req: Request, res: Response) => {
  try {
    const result = await claimDailyReward(getUid(req));
    res.json({ success: true, ...result });
  } catch (error) {
    fail(res, '/api/daily-reward/claim', error, 'Failed to claim daily reward');
  }
});

// PATCH /api/settings
apiApp.patch('/api/settings', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { soundEnabled, reducedMotion, displayName, playerName } = req.body ?? {};
    const updated = await updateUserSettings(getUid(req), {
      soundEnabled: typeof soundEnabled === 'boolean' ? soundEnabled : undefined,
      reducedMotion: typeof reducedMotion === 'boolean' ? reducedMotion : undefined,
      displayName: sanitizeName(displayName ?? playerName),
    });
    res.json({ success: true, user: updated });
  } catch (error) {
    fail(res, '/api/settings', error, 'Failed to update settings');
  }
});

// GET /api/dashboard — scoped to the caller's own identity
apiApp.get('/api/dashboard', optionalAuth, async (req: Request, res: Response) => {
  try {
    const profile = await getUserProfile(getUid(req));

    const allSessions = profile?.sessions || [];
    const allFacts = profile?.facts || [];

    const totalPracticed = allSessions.length;
    const totalTimeApproxMinutes = Math.round(totalPracticed * 2.5);

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
    fail(res, '/api/dashboard', error, 'Failed to generate dashboard');
  }
});

// POST /api/progress/reset — resets only the caller's own progress
apiApp.post('/api/progress/reset', optionalAuth, async (req: Request, res: Response) => {
  try {
    await resetUserProgress(getUid(req));
    res.json({ success: true, message: 'Progress reset successfully' });
  } catch (error) {
    fail(res, '/api/progress/reset', error, 'Failed to reset progress');
  }
});

// Unknown API routes return JSON 404 instead of falling through to index.html
apiApp.use('/api', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});
