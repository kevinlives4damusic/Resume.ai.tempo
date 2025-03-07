-- Enable RLS on resumes table
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to insert their own resumes
DROP POLICY IF EXISTS "Users can insert their own resumes" ON resumes;
CREATE POLICY "Users can insert their own resumes"
ON resumes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to select their own resumes
DROP POLICY IF EXISTS "Users can view their own resumes" ON resumes;
CREATE POLICY "Users can view their own resumes"
ON resumes FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create policy to allow users to update their own resumes
DROP POLICY IF EXISTS "Users can update their own resumes" ON resumes;
CREATE POLICY "Users can update their own resumes"
ON resumes FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own resumes
DROP POLICY IF EXISTS "Users can delete their own resumes" ON resumes;
CREATE POLICY "Users can delete their own resumes"
ON resumes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Enable realtime for resumes table
alter publication supabase_realtime add table resumes;
