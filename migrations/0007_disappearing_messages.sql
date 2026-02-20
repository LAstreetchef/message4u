-- Add disappearing message fields to messages table
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "view_count" integer DEFAULT 0 NOT NULL;
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "max_views" integer;
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "first_viewed_at" timestamp;
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "delete_after_minutes" integer;
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "delete_at" timestamp;
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "disappeared" boolean DEFAULT false NOT NULL;
