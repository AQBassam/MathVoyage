export type GameType =
  | 'visuals'
  | 'equation'
  | 'choice'
  | 'missing'
  | 'pairs'
  | 'build'
  | 'race'
  | 'mixed'
  | 'truefalse'
  | 'memory'
  | 'maze'
  | 'bingo'
  | 'detective'
  | 'timechallenge';

export type ScreenType =
  | 'home'
  | 'learn'
  | 'table_select'
  | 'game_select'
  | 'game_play'
  | 'results'
  | 'progress'
  | 'settings'
  | 'dashboard';

export interface MultiplicationFact {
  factorA: number;
  factorB: number;
  product: number;
  repeatedAddition: string; // e.g. "3 + 3 + 3 + 3 = 12"
  realLifeExample: string; // e.g. "4 tricycles have 4 × 3 = 12 wheels!"
  visualTheme?: 'stars' | 'apples' | 'cookies' | 'gems' | 'fish';
}

export interface FactMasteryData {
  factKey: string; // "factorA x factorB"
  factorA: number;
  factorB: number;
  attempts: number;
  correct: number;
  consecutiveCorrect: number;
  isMastered: boolean;
  commonMistakes: number[];
  lastPracticed?: string;
}

export interface GameSessionResult {
  gameType: GameType;
  tableNumber: number; // 1-10 or 0 for mixed
  score: number;
  totalQuestions: number;
  starsEarned: number;
  accuracyPercent: number;
  mistakes: Array<{
    factorA: number;
    factorB: number;
    givenAnswer: number;
    correctAnswer: number;
  }>;
  completedAt: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  category: 'table' | 'mastery' | 'streak' | 'explorer' | 'questions';
  targetTable?: number;
  targetQuestions?: number;
  targetStreak?: number;
  colorTheme?: 'emerald' | 'amber' | 'blue' | 'purple' | 'rose' | 'teal' | 'gold';
}

export interface DailyRewardState {
  lastClaimDate: string; // YYYY-MM-DD format
  currentStreakDays: number; // e.g. 1 to 7+
  totalDailyClaims: number;
  lastClaimBonusStars: number;
}

export interface UserProgress {
  stars: number;
  level: number;
  playerName: string;
  soundEnabled: boolean;
  soundVolume?: number; // 0.1 to 1.0 (default 0.8)
  reducedMotion: boolean;
  unlockedStages: number[]; // 1 to 6
  factsMastery: Record<string, FactMasteryData>;
  unlockedBadges: string[];
  recentSessions: GameSessionResult[];
  dailyGoal: {
    targetQuestions: number;
    completedQuestions: number;
    date: string;
  };
  dailyReward?: DailyRewardState;
}

export interface StageInfo {
  stageNumber: number;
  title: string;
  subtitle: string;
  tables: number[];
  description: string;
  minStarsToUnlock: number;
}
