import { boolean, integer, pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  level: integer('level').default(1).notNull(),
  stars: integer('stars').default(0).notNull(),
  soundEnabled: boolean('sound_enabled').default(true).notNull(),
  reducedMotion: boolean('reduced_motion').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const factsMastery = pgTable('facts_mastery', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  factKey: text('fact_key').notNull(),
  factorA: integer('factor_a').notNull(),
  factorB: integer('factor_b').notNull(),
  attempts: integer('attempts').default(0).notNull(),
  correct: integer('correct').default(0).notNull(),
  consecutiveCorrect: integer('consecutive_correct').default(0).notNull(),
  isMastered: boolean('is_mastered').default(false).notNull(),
  commonMistakes: text('common_mistakes').default('[]').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => [uniqueIndex('facts_mastery_user_fact_uq').on(t.userId, t.factKey)]);

export const gameSessions = pgTable('game_sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  gameType: text('game_type').notNull(),
  tableNumber: integer('table_number').notNull(),
  score: integer('score').notNull(),
  totalQuestions: integer('total_questions').notNull(),
  starsEarned: integer('stars_earned').notNull(),
  accuracyPercent: integer('accuracy_percent').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const badges = pgTable('badges', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  badgeId: text('badge_id').notNull(),
  unlockedAt: timestamp('unlocked_at').defaultNow(),
}, (t) => [uniqueIndex('badges_user_badge_uq').on(t.userId, t.badgeId)]);

// One row per user per UTC day. The unique index makes the daily reward idempotent.
export const dailyClaims = pgTable('daily_claims', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  claimDate: text('claim_date').notNull(), // YYYY-MM-DD (UTC)
  streak: integer('streak').notNull(),
  starsAwarded: integer('stars_awarded').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => [uniqueIndex('daily_claims_user_date_uq').on(t.userId, t.claimDate)]);

export const usersRelations = relations(users, ({ many }) => ({
  factsMastery: many(factsMastery),
  gameSessions: many(gameSessions),
  badges: many(badges),
}));

export const factsMasteryRelations = relations(factsMastery, ({ one }) => ({
  user: one(users, {
    fields: [factsMastery.userId],
    references: [users.id],
  }),
}));

export const gameSessionsRelations = relations(gameSessions, ({ one }) => ({
  user: one(users, {
    fields: [gameSessions.userId],
    references: [users.id],
  }),
}));

export const badgesRelations = relations(badges, ({ one }) => ({
  user: one(users, {
    fields: [badges.userId],
    references: [users.id],
  }),
}));
