-- Create a storage bucket for resumes
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for the resumes bucket
-- Allow users to read their own resumes
CREATE POLICY "Users can view their own resumes" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to upload their own resumes
CREATE POLICY "Users can upload their own resumes" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to update their own resumes
CREATE POLICY "Users can update their own resumes" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own resumes
CREATE POLICY "Users can delete their own resumes" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
