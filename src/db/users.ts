import { db } from './index.ts';
import { users, factsMastery, gameSessions, badges } from './schema.ts';
import { eq, and, sql } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, displayName?: string) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        displayName: displayName || email.split('@')[0],
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          ...(displayName ? { displayName } : {}),
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database getOrCreateUser failed:', error);
    throw new Error('Database user lookup failed', { cause: error });
  }
}

export async function getUserProfile(uid: string) {
  try {
    const userRows = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    if (!userRows.length) return null;
    const user = userRows[0];

    const facts = await db.select().from(factsMastery).where(eq(factsMastery.userId, user.id));
    const sessions = await db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.userId, user.id))
      .orderBy(sql`${gameSessions.createdAt} DESC`)
      .limit(50);
    const userBadges = await db.select().from(badges).where(eq(badges.userId, user.id));

    return {
      user,
      facts,
      sessions,
      badges: userBadges.map((b) => b.badgeId),
    };
  } catch (error) {
    console.error('Database getUserProfile failed:', error);
    throw new Error('Database get profile failed', { cause: error });
  }
}

export async function recordGameSession(
  uid: string,
  sessionData: {
    gameType: string;
    tableNumber: number;
    score: number;
    totalQuestions: number;
    starsEarned: number;
    accuracyPercent: number;
  }
) {
  try {
    const user = await getOrCreateUser(uid, `${uid}@guest.local`);
    const newStars = user.stars + sessionData.starsEarned;
    const newLevel = Math.max(1, Math.floor(newStars / 15) + 1);

    await db
      .update(users)
      .set({
        stars: newStars,
        level: newLevel,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    const insertedSession = await db
      .insert(gameSessions)
      .values({
        userId: user.id,
        gameType: sessionData.gameType,
        tableNumber: sessionData.tableNumber,
        score: sessionData.score,
        totalQuestions: sessionData.totalQuestions,
        starsEarned: sessionData.starsEarned,
        accuracyPercent: sessionData.accuracyPercent,
      })
      .returning();

    return {
      session: insertedSession[0],
      stars: newStars,
      level: newLevel,
    };
  } catch (error) {
    console.error('Database recordGameSession failed:', error);
    throw new Error('Database record session failed', { cause: error });
  }
}

export async function updateFactMastery(
  uid: string,
  data: {
    factorA: number;
    factorB: number;
    isCorrect: boolean;
    wrongAnswer?: number;
  }
) {
  try {
    const user = await getOrCreateUser(uid, `${uid}@guest.local`);
    const factKey = `${data.factorA}x${data.factorB}`;

    const existingRows = await db
      .select()
      .from(factsMastery)
      .where(and(eq(factsMastery.userId, user.id), eq(factsMastery.factKey, factKey)))
      .limit(1);

    if (existingRows.length > 0) {
      const current = existingRows[0];
      const attempts = current.attempts + 1;
      const correct = current.correct + (data.isCorrect ? 1 : 0);
      const consecutiveCorrect = data.isCorrect ? current.consecutiveCorrect + 1 : 0;
      // Mastered if at least 3 consecutive correct and overall accuracy >= 80%
      const isMastered = consecutiveCorrect >= 3 && correct / attempts >= 0.75;

      let mistakes: number[] = [];
      try {
        mistakes = JSON.parse(current.commonMistakes || '[]');
      } catch {
        mistakes = [];
      }
      if (!data.isCorrect && data.wrongAnswer !== undefined) {
        mistakes.push(data.wrongAnswer);
        if (mistakes.length > 5) mistakes.shift();
      }

      await db
        .update(factsMastery)
        .set({
          attempts,
          correct,
          consecutiveCorrect,
          isMastered,
          commonMistakes: JSON.stringify(mistakes),
          updatedAt: new Date(),
        })
        .where(eq(factsMastery.id, current.id));
    } else {
      const attempts = 1;
      const correct = data.isCorrect ? 1 : 0;
      const consecutiveCorrect = data.isCorrect ? 1 : 0;
      const mistakes = !data.isCorrect && data.wrongAnswer !== undefined ? [data.wrongAnswer] : [];

      await db.insert(factsMastery).values({
        userId: user.id,
        factKey,
        factorA: data.factorA,
        factorB: data.factorB,
        attempts,
        correct,
        consecutiveCorrect,
        isMastered: false,
        commonMistakes: JSON.stringify(mistakes),
      });
    }
  } catch (error) {
    console.error('Database updateFactMastery failed:', error);
    throw new Error('Database update fact failed', { cause: error });
  }
}

export async function unlockBadge(uid: string, badgeId: string) {
  try {
    const user = await getOrCreateUser(uid, `${uid}@guest.local`);
    const existing = await db
      .select()
      .from(badges)
      .where(and(eq(badges.userId, user.id), eq(badges.badgeId, badgeId)))
      .limit(1);

    if (!existing.length) {
      await db.insert(badges).values({
        userId: user.id,
        badgeId,
      });
    }
  } catch (error) {
    console.error('Database unlockBadge failed:', error);
    throw new Error('Database unlock badge failed', { cause: error });
  }
}

export async function updateUserSettings(
  uid: string,
  settings: { soundEnabled?: boolean; reducedMotion?: boolean; displayName?: string }
) {
  try {
    const user = await getOrCreateUser(uid, `${uid}@guest.local`);
    const updated = await db
      .update(users)
      .set({
        ...(settings.soundEnabled !== undefined ? { soundEnabled: settings.soundEnabled } : {}),
        ...(settings.reducedMotion !== undefined ? { reducedMotion: settings.reducedMotion } : {}),
        ...(settings.displayName ? { displayName: settings.displayName } : {}),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();
    return updated[0];
  } catch (error) {
    console.error('Database updateUserSettings failed:', error);
    throw new Error('Database update settings failed', { cause: error });
  }
}

export async function resetUserProgress(uid: string) {
  try {
    const user = await getOrCreateUser(uid, `${uid}@guest.local`);
    await db.delete(factsMastery).where(eq(factsMastery.userId, user.id));
    await db.delete(gameSessions).where(eq(gameSessions.userId, user.id));
    await db.delete(badges).where(eq(badges.userId, user.id));
    await db
      .update(users)
      .set({
        stars: 0,
        level: 1,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));
    return true;
  } catch (error) {
    console.error('Database resetUserProgress failed:', error);
    throw new Error('Database reset user progress failed', { cause: error });
  }
}
