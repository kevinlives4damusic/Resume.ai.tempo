-- Drop existing RLS policies if they exist
DROP POLICY IF EXISTS "Users can view their own resume analyses" ON resume_analyses;
DROP POLICY IF EXISTS "Users can create their own resume analyses" ON resume_analyses;

-- Enable RLS on the resume_analyses table
ALTER TABLE resume_analyses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own resume analyses
CREATE POLICY "Users can view their own resume analyses"
ON resume_analyses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM resumes
    WHERE resumes.id = resume_analyses.resume_id
    AND resumes.user_id = auth.uid()
  )
);

-- Create policy to allow users to create their own resume analyses
CREATE POLICY "Users can create their own resume analyses"
ON resume_analyses
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM resumes
    WHERE resumes.id = resume_analyses.resume_id
    AND resumes.user_id = auth.uid()
  )
);

-- Create policy to allow users to update their own resume analyses
CREATE POLICY "Users can update their own resume analyses"
ON resume_analyses
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM resumes
    WHERE resumes.id = resume_analyses.resume_id
    AND resumes.user_id = auth.uid()
  )
);
