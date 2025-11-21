-- Migration: Remove magic link authentication and enforce password requirements
-- This migration transitions from magic link to password-based authentication

-- Step 1: Drop magic_links table (no longer needed)
-- Safe for both fresh installs and existing databases
DROP TABLE IF EXISTS "magic_links" CASCADE;

-- Step 2: Delete dependent records for users without passwords
-- Only run if all required tables exist (safe for fresh/partial installs)
DO $$
BEGIN
  -- Only proceed if users, messages, and payments tables all exist
  IF to_regclass('public.users') IS NOT NULL 
     AND to_regclass('public.messages') IS NOT NULL 
     AND to_regclass('public.payments') IS NOT NULL THEN
    
    -- Delete payments for messages from legacy users
    DELETE FROM "payments" WHERE "message_id" IN (
      SELECT m.id FROM "messages" m 
      INNER JOIN "users" u ON m.user_id = u.id 
      WHERE u.password_hash IS NULL
    );

    -- Delete messages from legacy users
    DELETE FROM "messages" WHERE "user_id" IN (
      SELECT id FROM "users" WHERE "password_hash" IS NULL
    );

    -- Delete legacy users without passwords
    DELETE FROM "users" WHERE "password_hash" IS NULL;
  END IF;
END $$;

-- Step 3: Enforce password requirement at database level
-- Only run if users table exists and column is nullable
DO $$
BEGIN
  IF to_regclass('public.users') IS NOT NULL THEN
    -- Make password_hash NOT NULL (idempotent - safe if already NOT NULL)
    ALTER TABLE "users" ALTER COLUMN "password_hash" SET NOT NULL;
  END IF;
END $$;
