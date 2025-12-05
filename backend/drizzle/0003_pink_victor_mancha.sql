CREATE TABLE "oauth_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(64) NOT NULL,
	"access_token" text NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "oauth_sessions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "logo" SET DATA TYPE text;--> statement-breakpoint
CREATE INDEX "oauth_sessions_code_idx" ON "oauth_sessions" USING btree ("code");--> statement-breakpoint
CREATE INDEX "oauth_sessions_expires_at_idx" ON "oauth_sessions" USING btree ("expires_at");