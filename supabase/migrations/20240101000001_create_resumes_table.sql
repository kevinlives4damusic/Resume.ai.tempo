-- Create resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_analyzed BOOLEAN DEFAULT FALSE,
  is_enhanced BOOLEAN DEFAULT FALSE
);

-- Create resume_analyses table
CREATE TABLE IF NOT EXISTS resume_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  completeness_score INTEGER,
  ats_compatibility_score INTEGER,
  technical_skills_score INTEGER,
  soft_skills_score INTEGER,
  keywords_score INTEGER,
  strengths JSONB,
  weaknesses JSONB,
  improvement_suggestions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enhanced_resumes table
CREATE TABLE IF NOT EXISTS enhanced_resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  enhancement_type TEXT NOT NULL,
  is_premium BOOLEAN DEFAULT FALSE
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL,
  status TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enhanced_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own resumes" ON resumes;
CREATE POLICY "Users can view their own resumes"
  ON resumes FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own resumes" ON resumes;
CREATE POLICY "Users can insert their own resumes"
  ON resumes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own resumes" ON resumes;
CREATE POLICY "Users can update their own resumes"
  ON resumes FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own resumes" ON resumes;
CREATE POLICY "Users can delete their own resumes"
  ON resumes FOR DELETE
  USING (auth.uid() = user_id);

-- Resume analyses policies
DROP POLICY IF EXISTS "Users can view their own resume analyses" ON resume_analyses;
CREATE POLICY "Users can view their own resume analyses"
  ON resume_analyses FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM resumes
    WHERE resumes.id = resume_analyses.resume_id
    AND resumes.user_id = auth.uid()
  ));

-- Enhanced resumes policies
DROP POLICY IF EXISTS "Users can view their own enhanced resumes" ON enhanced_resumes;
CREATE POLICY "Users can view their own enhanced resumes"
  ON enhanced_resumes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM resumes
    WHERE resumes.id = enhanced_resumes.original_resume_id
    AND resumes.user_id = auth.uid()
  ));

-- Subscriptions policies
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Enable realtime
alter publication supabase_realtime add table resumes;
alter publication supabase_realtime add table resume_analyses;
alter publication supabase_realtime add table enhanced_resumes;
alter publication supabase_realtime add table subscriptions;