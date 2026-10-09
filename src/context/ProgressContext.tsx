import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProgress, FactMasteryData, GameSessionResult, GameType } from '../types/game.ts';
import { sound } from '../utils/audio.ts';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';

interface ProgressContextValue {
  progress: UserProgress;
  currentUser: User | null;
  idToken: string | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  recordFactAttempt: (factorA: number, factorB: number, isCorrect: boolean, wrongAnswer?: number) => Promise<void>;
  recordSessionResult: (session: Omit<GameSessionResult, 'completedAt'>) => Promise<void>;
  updateSettings: (settings: { soundEnabled?: boolean; soundVolume?: number; reducedMotion?: boolean; playerName?: string }) => Promise<void>;
  unlockBadge: (badgeId: string) => Promise<void>;
  resetProgress: () => Promise<void>;
  refreshProgress: () => Promise<void>;
  canClaimDailyReward: () => boolean;
  claimDailyReward: () => Promise<{ starsAdded: number; streak: number }>;
}

const LOCAL_STORAGE_KEY = 'mathvoyage_progress_v1';
const GUEST_UID_KEY = 'mathvoyage_guest_uid';

function getOrCreateGuestId(): string {
  if (typeof window === 'undefined') return 'guest_default';
  let id = localStorage.getItem(GUEST_UID_KEY);
  if (!id) {
    id = 'guest_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem(GUEST_UID_KEY, id);
  }
  return id;
}

const defaultProgress: UserProgress = {
  stars: 0,
  level: 1,
  playerName: 'بطل الرياضيات',
  soundEnabled: true,
  reducedMotion: false,
  unlockedStages: [1],
  factsMastery: {},
  unlockedBadges: [],
  recentSessions: [],
  dailyGoal: {
    targetQuestions: 15,
    completedQuestions: 0,
    date: new Date().toISOString().split('T')[0],
  },
};

/**
 * تقييم جميع الشارات والأوسمة التلقائية بناءً على إنجازات الطالب:
 * - خبير جدول الضرب 5 (وجميع الجداول من 1 إلى 10)
 * - أكملت 100 مسألة (و 10، 50، 250 مسألة)
 * - التحديات والسرعة والاستمرارية
 */
export function evaluateAllBadges(
  progress: UserProgress,
  options?: {
    latestSession?: GameSessionResult;
    currentStreak?: number;
  }
): string[] {
  const badgeSet = new Set(progress.unlockedBadges || []);
  const factsList = Object.values(progress.factsMastery || {});

  // 1. حساب إجمالي المسائل المحلولة
  const totalQuestionsAnswered = factsList.reduce((acc, f) => acc + (f.attempts || 0), 0);

  if (totalQuestionsAnswered >= 10) badgeSet.add('questions_10');
  if (totalQuestionsAnswered >= 50) badgeSet.add('questions_50');
  if (totalQuestionsAnswered >= 100) badgeSet.add('questions_100'); // أكملت 100 مسألة
  if (totalQuestionsAnswered >= 250) badgeSet.add('questions_250');

  // 2. إتقان الجداول الفردية من 1 إلى 10 (وخاصة جدول 5)
  for (let table = 1; table <= 10; table++) {
    let masteredCount = 0;
    for (let b = 1; b <= 10; b++) {
      const key = `${table}x${b}`;
      if (progress.factsMastery[key]?.isMastered) {
        masteredCount++;
      }
    }
    // إتقان 8 أو أكثر من حقائق الجدول يمنح شارة خبير الجدول
    if (masteredCount >= 8) {
      badgeSet.add(`table${table}_master`);
    }
  }

  // 3. فارس الحساب الأكبر (100 حقيقة متقنة كاملة)
  const totalMastered = factsList.filter((f) => f.isMastered).length;
  if (totalMastered >= 100) {
    badgeSet.add('table_grandmaster');
  }

  // 4. السلاسل المتتالية للإجابات الصحيحة
  const maxConsecutive = Math.max(
    0,
    ...factsList.map((f) => f.consecutiveCorrect || 0),
    options?.currentStreak || 0
  );
  if (maxConsecutive >= 5) badgeSet.add('streak_5');
  if (maxConsecutive >= 15) badgeSet.add('streak_15');

  // 5. الاستمرارية اليومية
  const streakDays = progress.dailyReward?.currentStreakDays || 0;
  if (streakDays >= 3) badgeSet.add('daily_streak_3');
  if (streakDays >= 7) badgeSet.add('daily_streak_7');

  // 6. الألعاب الخاصة
  if (options?.latestSession) {
    if (options.latestSession.gameType === 'timechallenge' && options.latestSession.accuracyPercent >= 50) {
      badgeSet.add('speed_champion');
    }
    if (options.latestSession.gameType === 'bingo') {
      badgeSet.add('bingo_winner');
    }
    if (options.latestSession.gameType === 'detective') {
      badgeSet.add('detective_pro');
    }
  }

  // 7. المعالم العامة
  if (progress.stars >= 1) badgeSet.add('first_star');
  if (progress.unlockedStages?.includes(2)) badgeSet.add('stage1_clear');

  return Array.from(badgeSet);
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<UserProgress>(() => {
    if (typeof window === 'undefined') return defaultProgress;
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = { ...defaultProgress, ...JSON.parse(stored) };
        const updatedBadges = evaluateAllBadges(parsed);
        return { ...parsed, unlockedBadges: updatedBadges };
      }
    } catch {}
    return defaultProgress;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync sound engine with progress
  useEffect(() => {
    sound.setEnabled(progress.soundEnabled);
    if (progress.soundVolume !== undefined) {
      sound.setVolume(progress.soundVolume);
    }
  }, [progress.soundEnabled, progress.soundVolume]);

  // Persist locally
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(progress));
    } catch {}
  }, [progress]);

  // Firebase auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const token = await user.getIdToken();
          setIdToken(token);
          // Sync with cloud backend
          await syncWithCloud(token, user);
        } catch (e) {
          console.error('Failed to get token on auth change:', e);
        }
      } else {
        setIdToken(null);
        // Load guest profile from API or use local
        await fetchGuestProfile();
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getHeaders = (tokenOverride?: string | null) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-guest-uid': getOrCreateGuestId(),
      'x-player-name': progress.playerName,
    };
    const t = tokenOverride !== undefined ? tokenOverride : idToken;
    if (t) {
      headers['Authorization'] = `Bearer ${t}`;
    }
    return headers;
  };

  const fetchGuestProfile = async () => {
    try {
      const res = await fetch('/api/me', { headers: getHeaders(null) });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          integrateBackendProfile(data.profile);
        }
      }
    } catch (e) {
      console.warn('Backend unavailable, running offline with localStorage:', e);
    }
  };

  const syncWithCloud = async (token: string, user: User) => {
    try {
      const factsArray = Object.values(progress.factsMastery);
      await fetch('/api/sync', {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify({
          displayName: user.displayName || progress.playerName,
          guestFacts: factsArray,
          guestBadges: progress.unlockedBadges,
          guestStars: progress.stars,
        }),
      });

      const res = await fetch('/api/me', { headers: getHeaders(token) });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          integrateBackendProfile(data.profile);
        }
      }
    } catch (err) {
      console.error('Sync failed:', err);
    }
  };

  const integrateBackendProfile = (profile: any) => {
    const { user, facts, sessions, badges } = profile;
    setProgress((prev) => {
      const newFactMap = { ...prev.factsMastery };
      if (Array.isArray(facts)) {
        facts.forEach((f: any) => {
          let mistakes: number[] = [];
          try {
            mistakes = JSON.parse(f.commonMistakes || '[]');
          } catch {}
          newFactMap[f.factKey] = {
            factKey: f.factKey,
            factorA: f.factorA,
            factorB: f.factorB,
            attempts: f.attempts,
            correct: f.correct,
            consecutiveCorrect: f.consecutiveCorrect,
            isMastered: f.isMastered,
            commonMistakes: mistakes,
            lastPracticed: f.updatedAt,
          };
        });
      }

      const totalStars = Math.max(prev.stars, user?.stars || 0);
      const level = Math.max(1, Math.floor(totalStars / 15) + 1);

      // Calculate unlocked stages based on stars
      const stages = [1];
      if (totalStars >= 5) stages.push(2);
      if (totalStars >= 20) stages.push(3);
      if (totalStars >= 45) stages.push(4);
      if (totalStars >= 75) stages.push(5);
      if (totalStars >= 110) stages.push(6);

      const mergedBadges = Array.from(new Set([...prev.unlockedBadges, ...(badges || [])]));

      return {
        ...prev,
        stars: totalStars,
        level,
        playerName: user?.displayName || prev.playerName,
        soundEnabled: user?.soundEnabled ?? prev.soundEnabled,
        reducedMotion: user?.reducedMotion ?? prev.reducedMotion,
        factsMastery: newFactMap,
        unlockedStages: stages,
        unlockedBadges: mergedBadges,
      };
    });
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const token = await result.user.getIdToken();
      setIdToken(token);
      await syncWithCloud(token, result.user);
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setIdToken(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const recordFactAttempt = async (factorA: number, factorB: number, isCorrect: boolean, wrongAnswer?: number) => {
    const factKey = `${factorA}x${factorB}`;

    setProgress((prev) => {
      const current = prev.factsMastery[factKey] || {
        factKey,
        factorA,
        factorB,
        attempts: 0,
        correct: 0,
        consecutiveCorrect: 0,
        isMastered: false,
        commonMistakes: [],
      };

      const attempts = current.attempts + 1;
      const correct = current.correct + (isCorrect ? 1 : 0);
      const consecutiveCorrect = isCorrect ? current.consecutiveCorrect + 1 : 0;
      const isMastered = consecutiveCorrect >= 3 && correct / attempts >= 0.75;

      const mistakes = [...current.commonMistakes];
      if (!isCorrect && wrongAnswer !== undefined && !mistakes.includes(wrongAnswer)) {
        mistakes.push(wrongAnswer);
        if (mistakes.length > 5) mistakes.shift();
      }

      const updatedFact: FactMasteryData = {
        ...current,
        attempts,
        correct,
        consecutiveCorrect,
        isMastered,
        commonMistakes: mistakes,
        lastPracticed: new Date().toISOString(),
      };

      // Check daily goal
      const today = new Date().toISOString().split('T')[0];
      const dailyGoal =
        prev.dailyGoal.date === today
          ? { ...prev.dailyGoal, completedQuestions: prev.dailyGoal.completedQuestions + 1 }
          : { targetQuestions: 15, completedQuestions: 1, date: today };

      const updatedFactsMastery = {
        ...prev.factsMastery,
        [factKey]: updatedFact,
      };

      const interimProgress: UserProgress = {
        ...prev,
        dailyGoal,
        factsMastery: updatedFactsMastery,
      };

      const newBadges = evaluateAllBadges(interimProgress);
      if (newBadges.length > prev.unlockedBadges.length) {
        sound.playBadgeUnlocked();
      }

      return {
        ...interimProgress,
        unlockedBadges: newBadges,
      };
    });

    // Cloud record
    try {
      await fetch('/api/facts/record', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          factorA,
          factorB,
          isCorrect,
          wrongAnswer,
        }),
      });
    } catch (e) {
      console.warn('Fact attempt offline fallback:', e);
    }
  };

  const recordSessionResult = async (sessionData: Omit<GameSessionResult, 'completedAt'>) => {
    const fullSession: GameSessionResult = {
      ...sessionData,
      completedAt: new Date().toISOString(),
    };

    setProgress((prev) => {
      const newStars = prev.stars + sessionData.starsEarned;
      const newLevel = Math.max(1, Math.floor(newStars / 15) + 1);

      const stages = [1];
      if (newStars >= 5) stages.push(2);
      if (newStars >= 20) stages.push(3);
      if (newStars >= 45) stages.push(4);
      if (newStars >= 75) stages.push(5);
      if (newStars >= 110) stages.push(6);

      const interimProgress: UserProgress = {
        ...prev,
        stars: newStars,
        level: newLevel,
        unlockedStages: stages,
        recentSessions: [fullSession, ...prev.recentSessions].slice(0, 25),
      };

      const newBadges = evaluateAllBadges(interimProgress, {
        latestSession: fullSession,
      });

      if (newBadges.length > prev.unlockedBadges.length) {
        sound.playBadgeUnlocked();
      }

      return {
        ...interimProgress,
        unlockedBadges: newBadges,
      };
    });

    try {
      await fetch('/api/sessions', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(sessionData),
      });
    } catch (e) {
      console.warn('Session record offline fallback:', e);
    }
  };

  const updateSettings = async (settings: { soundEnabled?: boolean; soundVolume?: number; reducedMotion?: boolean; playerName?: string }) => {
    setProgress((prev) => ({
      ...prev,
      soundEnabled: settings.soundEnabled !== undefined ? settings.soundEnabled : prev.soundEnabled,
      soundVolume: settings.soundVolume !== undefined ? settings.soundVolume : prev.soundVolume,
      reducedMotion: settings.reducedMotion !== undefined ? settings.reducedMotion : prev.reducedMotion,
      playerName: settings.playerName !== undefined ? settings.playerName : prev.playerName,
    }));

    try {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(settings),
      });
    } catch (e) {
      console.warn('Settings update offline fallback:', e);
    }
  };

  const unlockBadge = async (badgeId: string) => {
    if (progress.unlockedBadges.includes(badgeId)) return;
    setProgress((prev) => ({
      ...prev,
      unlockedBadges: [...prev.unlockedBadges, badgeId],
    }));

    try {
      await fetch('/api/badges/unlock', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ badgeId }),
      });
    } catch (e) {
      console.warn('Badge unlock offline fallback:', e);
    }
  };

  const resetProgress = async () => {
    setProgress(defaultProgress);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {}

    try {
      await fetch('/api/progress/reset', {
        method: 'POST',
        headers: getHeaders(),
      });
    } catch (e) {
      console.warn('Reset progress backend sync failed:', e);
    }
  };

  const getTodayDateString = () => new Date().toISOString().split('T')[0];

  const canClaimDailyReward = (): boolean => {
    const today = getTodayDateString();
    return progress.dailyReward?.lastClaimDate !== today;
  };

  const claimDailyReward = async (): Promise<{ starsAdded: number; streak: number }> => {
    const today = getTodayDateString();
    const lastClaim = progress.dailyReward?.lastClaimDate;

    let newStreak = 1;
    if (lastClaim) {
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterday = yesterdayDate.toISOString().split('T')[0];

      if (lastClaim === yesterday) {
        newStreak = (progress.dailyReward?.currentStreakDays || 0) + 1;
      } else if (lastClaim === today) {
        // Already claimed today
        return {
          starsAdded: 0,
          streak: progress.dailyReward?.currentStreakDays || 1,
        };
      } else {
        // Gap of more than 1 day: resets streak to 1
        newStreak = 1;
      }
    }

    // Determine bonus stars based on streak in 7-day cycle:
    // Day 1: 3, Day 2: 4, Day 3: 5, Day 4: 6, Day 5: 7, Day 6: 8, Day 7: 10
    const cycleDay = ((newStreak - 1) % 7) + 1;
    const bonusStars = cycleDay === 7 ? 10 : 2 + cycleDay;

    let unlockedStreakBadges: string[] = [];
    if (newStreak >= 3 && !progress.unlockedBadges.includes('daily_streak_3')) {
      unlockedStreakBadges.push('daily_streak_3');
    }
    if (newStreak >= 7 && !progress.unlockedBadges.includes('daily_streak_7')) {
      unlockedStreakBadges.push('daily_streak_7');
    }

    setProgress((prev) => {
      const newTotalStars = prev.stars + bonusStars;
      const newLevel = Math.max(1, Math.floor(newTotalStars / 15) + 1);

      const stages = [1];
      if (newTotalStars >= 5) stages.push(2);
      if (newTotalStars >= 20) stages.push(3);
      if (newTotalStars >= 45) stages.push(4);
      if (newTotalStars >= 75) stages.push(5);
      if (newTotalStars >= 110) stages.push(6);

      const updatedBadges = Array.from(new Set([...prev.unlockedBadges, ...unlockedStreakBadges]));

      return {
        ...prev,
        stars: newTotalStars,
        level: newLevel,
        unlockedStages: stages,
        unlockedBadges: updatedBadges,
        dailyReward: {
          lastClaimDate: today,
          currentStreakDays: newStreak,
          totalDailyClaims: (prev.dailyReward?.totalDailyClaims || 0) + 1,
          lastClaimBonusStars: bonusStars,
        },
      };
    });

    // Notify backend
    try {
      await fetch('/api/daily-reward/claim', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ streak: newStreak, bonusStars }),
      });

      for (const badgeId of unlockedStreakBadges) {
        unlockBadge(badgeId);
      }
    } catch (e) {
      console.warn('Daily reward claim offline fallback:', e);
    }

    return { starsAdded: bonusStars, streak: newStreak };
  };

  const refreshProgress = async () => {
    try {
      const res = await fetch('/api/me', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          integrateBackendProfile(data.profile);
        }
      }
    } catch (e) {
      console.error('Refresh progress failed:', e);
    }
  };

  return (
    <ProgressContext.Provider
      value={{
        progress,
        currentUser,
        idToken,
        isLoading,
        signInWithGoogle,
        signOutUser,
        recordFactAttempt,
        recordSessionResult,
        updateSettings,
        unlockBadge,
        resetProgress,
        refreshProgress,
        canClaimDailyReward,
        claimDailyReward,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};
