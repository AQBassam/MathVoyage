CREATE TABLE "badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"badge_id" text NOT NULL,
	"unlocked_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "daily_claims" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"claim_date" text NOT NULL,
	"streak" integer NOT NULL,
	"stars_awarded" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "facts_mastery" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"fact_key" text NOT NULL,
	"factor_a" integer NOT NULL,
	"factor_b" integer NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"correct" integer DEFAULT 0 NOT NULL,
	"consecutive_correct" integer DEFAULT 0 NOT NULL,
	"is_mastered" boolean DEFAULT false NOT NULL,
	"common_mistakes" text DEFAULT '[]' NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "game_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"game_type" text NOT NULL,
	"table_number" integer NOT NULL,
	"score" integer NOT NULL,
	"total_questions" integer NOT NULL,
	"stars_earned" integer NOT NULL,
	"accuracy_percent" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"email" text NOT NULL,
	"display_name" text,
	"level" integer DEFAULT 1 NOT NULL,
	"stars" integer DEFAULT 0 NOT NULL,
	"sound_enabled" boolean DEFAULT true NOT NULL,
	"reduced_motion" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
ALTER TABLE "badges" ADD CONSTRAINT "badges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_claims" ADD CONSTRAINT "daily_claims_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facts_mastery" ADD CONSTRAINT "facts_mastery_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "badges_user_badge_uq" ON "badges" USING btree ("user_id","badge_id");--> statement-breakpoint
CREATE UNIQUE INDEX "daily_claims_user_date_uq" ON "daily_claims" USING btree ("user_id","claim_date");--> statement-breakpoint
CREATE UNIQUE INDEX "facts_mastery_user_fact_uq" ON "facts_mastery" USING btree ("user_id","fact_key");