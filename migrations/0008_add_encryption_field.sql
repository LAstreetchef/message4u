-- Add is_encrypted field to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_encrypted BOOLEAN NOT NULL DEFAULT false;
