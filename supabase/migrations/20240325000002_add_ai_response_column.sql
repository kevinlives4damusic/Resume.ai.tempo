-- Add ai_response column to resume_analyses table
ALTER TABLE resume_analyses ADD COLUMN IF NOT EXISTS ai_response TEXT;
