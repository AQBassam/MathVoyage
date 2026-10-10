import { db } from './index.ts';
import { users, factsMastery, gameSessions, badges, dailyClaims } from './schema.ts';
import { eq, and, sql } from 'drizzle-orm';

const STARS_PER_LEVEL = 15;

/** SQL fragments that add stars atomically and recompute the level from the new total. */
function addStarsSet(delta: number) {
  return {
    stars: sql`${users.stars} + ${delta}`,
    level: sql`GREATEST(1, (${users.stars} + ${delta}) / ${STARS_PER_LEVEL} + 1)`,
    updatedAt: new Date(),
  };
}

/**
 * Upserts the user row. Only an authenticated caller passes a real email;
 * guests never overwrite an existing email or display name.
 */
export async function getOrCreateUser(uid: string, email: string, displayName?: string) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        displayName:
          displayName || (email.endsWith('@guest.local') ? 'بطل الرياضيات' : email.split('@')[0]),
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          ...(email.endsWith('@guest.local') ? {} : { email }),
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

/** Returns the user row, creating a guest row if missing, without touching existing fields. */
async function ensureUser(uid: string) {
  await db
    .insert(users)
    .values({ uid, email: `${uid}@guest.local`, displayName: 'بطل الرياضيات' })
    .onConflictDoNothing({ target: users.uid });
  const rows = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
  return rows[0];
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

    // Daily-reward state lives on the server so every device of the same account agrees.
    const [lastClaim] = await db
      .select()
      .from(dailyClaims)
      .where(eq(dailyClaims.userId, user.id))
      .orderBy(sql`${dailyClaims.claimDate} DESC`)
      .limit(1);
    const [{ total }] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(dailyClaims)
      .where(eq(dailyClaims.userId, user.id));
    // A streak is still alive only if the last claim was today or yesterday (UTC).
    const streakAlive = lastClaim && lastClaim.claimDate >= utcDate(-1);
    const dailyReward = lastClaim
      ? {
          lastClaimDate: lastClaim.claimDate,
          currentStreakDays: streakAlive ? lastClaim.streak : 0,
          totalDailyClaims: total,
          lastClaimBonusStars: lastClaim.starsAwarded,
        }
      : null;

    return {
      user,
      facts,
      sessions,
      badges: userBadges.map((b) => b.badgeId),
      dailyReward,
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
    const user = await ensureUser(uid);

    return await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(users)
        .set(addStarsSet(sessionData.starsEarned))
        .where(eq(users.id, user.id))
        .returning();

      const [session] = await tx
        .insert(gameSessions)
        .values({ userId: user.id, ...sessionData })
        .returning();

      return { session, stars: updated.stars, level: updated.level };
    });
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
    const user = await ensureUser(uid);
    const factKey = `${data.factorA}x${data.factorB}`;

    await db.transaction(async (tx) => {
      await tx
        .insert(factsMastery)
        .values({ userId: user.id, factKey, factorA: data.factorA, factorB: data.factorB })
        .onConflictDoNothing({ target: [factsMastery.userId, factsMastery.factKey] });

      // Row lock: concurrent attempts on the same fact are applied one after the other.
      const [current] = await tx
        .select()
        .from(factsMastery)
        .where(and(eq(factsMastery.userId, user.id), eq(factsMastery.factKey, factKey)))
        .for('update');

      const attempts = current.attempts + 1;
      const correct = current.correct + (data.isCorrect ? 1 : 0);
      const consecutiveCorrect = data.isCorrect ? current.consecutiveCorrect + 1 : 0;
      // Mastered after 3 consecutive correct answers with overall accuracy >= 75%
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

      await tx
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
    });
  } catch (error) {
    console.error('Database updateFactMastery failed:', error);
    throw new Error('Database update fact failed', { cause: error });
  }
}

export async function unlockBadge(uid: string, badgeId: string) {
  try {
    const user = await ensureUser(uid);
    await db
      .insert(badges)
      .values({ userId: user.id, badgeId })
      .onConflictDoNothing({ target: [badges.userId, badges.badgeId] });
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
    const user = await ensureUser(uid);
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

/**
 * Clears learning progress. Daily-claim history is kept on purpose, so a reset
 * cannot be used to claim the same day's reward again.
 */
export async function resetUserProgress(uid: string) {
  try {
    const rows = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    if (!rows.length) return true;
    const user = rows[0];
    await db.transaction(async (tx) => {
      await tx.delete(factsMastery).where(eq(factsMastery.userId, user.id));
      await tx.delete(gameSessions).where(eq(gameSessions.userId, user.id));
      await tx.delete(badges).where(eq(badges.userId, user.id));
      await tx
        .update(users)
        .set({ stars: 0, level: 1, updatedAt: new Date() })
        .where(eq(users.id, user.id));
    });
    return true;
  } catch (error) {
    console.error('Database resetUserProgress failed:', error);
    throw new Error('Database reset user progress failed', { cause: error });
  }
}

/**
 * Moves everything a guest earned into a signed-in account, then deletes the
 * guest row. Runs entirely on the server: the guest id comes from the signed
 * cookie and the account uid from the verified Firebase token, so nothing in
 * the request body is trusted.
 *
 * - Stars: the guest's stars are added, minus the reward for any UTC day the
 *   account had already claimed (no double daily reward per person).
 * - Daily claims and game sessions: moved; same-day duplicate claims dropped.
 * - Facts: moved; when both sides practised the same fact, attempts and
 *   correct answers are summed and mastery is recomputed with the usual rule.
 * - Badges: union.
 *
 * Idempotent and safe under concurrent calls (sign-in fires two syncs): the
 * guest row is locked first, and a second caller finds it already gone.
 */
export async function mergeGuestIntoUser(guestUid: string, accountUid: string) {
  if (!guestUid.startsWith('g_') || guestUid === accountUid) return { merged: false };
  try {
    return await db.transaction(async (tx) => {
      // Lock order is always guest then account, so concurrent merges cannot deadlock.
      const [guest] = await tx.select().from(users).where(eq(users.uid, guestUid)).limit(1).for('update');
      if (!guest) return { merged: false };
      const [account] = await tx.select().from(users).where(eq(users.uid, accountUid)).limit(1).for('update');
      if (!account) throw new Error('Account row must exist before merging');

      // Daily claims
      const accountDates = new Set(
        (await tx.select({ d: dailyClaims.claimDate }).from(dailyClaims).where(eq(dailyClaims.userId, account.id)))
          .map((r) => r.d)
      );
      const guestClaims = await tx.select().from(dailyClaims).where(eq(dailyClaims.userId, guest.id));
      let duplicateStars = 0;
      for (const c of guestClaims) {
        if (accountDates.has(c.claimDate)) {
          duplicateStars += c.starsAwarded;
          await tx.delete(dailyClaims).where(eq(dailyClaims.id, c.id));
        } else {
          await tx.update(dailyClaims).set({ userId: account.id }).where(eq(dailyClaims.id, c.id));
        }
      }

      // Game sessions
      await tx.update(gameSessions).set({ userId: account.id }).where(eq(gameSessions.userId, guest.id));

      // Facts
      const accountFacts = new Map(
        (await tx.select().from(factsMastery).where(eq(factsMastery.userId, account.id))).map((f) => [f.factKey, f])
      );
      const guestFacts = await tx.select().from(factsMastery).where(eq(factsMastery.userId, guest.id));
      for (const g of guestFacts) {
        const a = accountFacts.get(g.factKey);
        if (!a) {
          await tx.update(factsMastery).set({ userId: account.id }).where(eq(factsMastery.id, g.id));
          continue;
        }
        const attempts = a.attempts + g.attempts;
        const correct = a.correct + g.correct;
        const guestIsNewer = (g.updatedAt?.getTime() ?? 0) > (a.updatedAt?.getTime() ?? 0);
        const consecutiveCorrect = guestIsNewer ? g.consecutiveCorrect : a.consecutiveCorrect;
        const isMastered = consecutiveCorrect >= 3 && attempts > 0 && correct / attempts >= 0.75;
        const parse = (s: string | null) => {
          try {
            const v = JSON.parse(s || '[]');
            return Array.isArray(v) ? v.filter((n) => Number.isInteger(n)) : [];
          } catch {
            return [];
          }
        };
        const mistakes = [...parse(a.commonMistakes), ...parse(g.commonMistakes)].slice(-5);
        await tx
          .update(factsMastery)
          .set({ attempts, correct, consecutiveCorrect, isMastered, commonMistakes: JSON.stringify(mistakes), updatedAt: new Date() })
          .where(eq(factsMastery.id, a.id));
        await tx.delete(factsMastery).where(eq(factsMastery.id, g.id));
      }

      // Badges
      const guestBadges = await tx.select().from(badges).where(eq(badges.userId, guest.id));
      for (const b of guestBadges) {
        await tx
          .insert(badges)
          .values({ userId: account.id, badgeId: b.badgeId })
          .onConflictDoNothing({ target: [badges.userId, badges.badgeId] });
      }
      await tx.delete(badges).where(eq(badges.userId, guest.id));

      // Stars, then remove the guest so the merge can never run twice.
      const starsMoved = Math.max(0, guest.stars - duplicateStars);
      if (starsMoved > 0) {
        await tx.update(users).set(addStarsSet(starsMoved)).where(eq(users.id, account.id));
      }
      await tx.delete(users).where(eq(users.id, guest.id));

      return { merged: true, starsMoved };
    });
  } catch (error) {
    console.error('Database mergeGuestIntoUser failed:', error);
    throw new Error('Database guest merge failed', { cause: error });
  }
}

function utcDate(offsetDays = 0): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

/** Stars for a given streak day, on a 7-day cycle: 3, 4, 5, 6, 7, 8, 10. Mirrors the client. */
export function dailyBonusForStreak(streak: number): number {
  const cycleDay = ((streak - 1) % 7) + 1;
  return cycleDay === 7 ? 10 : 2 + cycleDay;
}

/**
 * Server-authoritative daily reward. The streak and the stars are computed
 * here; nothing from the request body is trusted. Repeated or concurrent
 * claims on the same UTC day award nothing (unique index on user + date).
 */
export async function claimDailyReward(uid: string) {
  try {
    const user = await ensureUser(uid);
    const today = utcDate(0);
    const yesterday = utcDate(-1);

    return await db.transaction(async (tx) => {
      const prev = await tx
        .select()
        .from(dailyClaims)
        .where(and(eq(dailyClaims.userId, user.id), eq(dailyClaims.claimDate, yesterday)))
        .limit(1);
      const streak = prev.length ? prev[0].streak + 1 : 1;
      const bonus = dailyBonusForStreak(streak);

      const inserted = await tx
        .insert(dailyClaims)
        .values({ userId: user.id, claimDate: today, streak, starsAwarded: bonus })
        .onConflictDoNothing({ target: [dailyClaims.userId, dailyClaims.claimDate] })
        .returning();

      if (!inserted.length) {
        const [todayRow] = await tx
          .select()
          .from(dailyClaims)
          .where(and(eq(dailyClaims.userId, user.id), eq(dailyClaims.claimDate, today)))
          .limit(1);
        const [current] = await tx.select().from(users).where(eq(users.id, user.id)).limit(1);
        return {
          alreadyClaimed: true,
          starsAdded: 0,
          streak: todayRow?.streak ?? 1,
          stars: current.stars,
          level: current.level,
        };
      }

      const [updated] = await tx
        .update(users)
        .set(addStarsSet(bonus))
        .where(eq(users.id, user.id))
        .returning();

      const streakBadges = [
        ...(streak >= 3 ? ['daily_streak_3'] : []),
        ...(streak >= 7 ? ['daily_streak_7'] : []),
      ];
      for (const badgeId of streakBadges) {
        await tx
          .insert(badges)
          .values({ userId: user.id, badgeId })
          .onConflictDoNothing({ target: [badges.userId, badges.badgeId] });
      }

      return {
        alreadyClaimed: false,
        starsAdded: bonus,
        streak,
        stars: updated.stars,
        level: updated.level,
      };
    });
  } catch (error) {
    console.error('Database claimDailyReward failed:', error);
    throw new Error('Database daily reward claim failed', { cause: error });
  }
}
