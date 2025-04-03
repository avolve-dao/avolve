-- Add group_id column to chats table
ALTER TABLE chats ADD COLUMN IF NOT EXISTS group_id TEXT;

-- Create index on group_id
CREATE INDEX IF NOT EXISTS idx_chats_group_id ON chats(group_id);

