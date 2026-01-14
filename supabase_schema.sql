-- Create tables for JEE Preparation Dashboard

-- 1. Subjects
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE
);

-- 2. Chapters
CREATE TABLE chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  chapter_no TEXT NOT NULL,
  name TEXT NOT NULL,
  total_lectures INTEGER DEFAULT 0,
  total_dpps INTEGER DEFAULT 0,
  UNIQUE(subject_id, chapter_no)
);

-- 3. Tracking Logs (Lectures & DPPs)
CREATE TABLE tracking_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('lecture', 'dpp')),
  item_index INTEGER NOT NULL,
  status BOOLEAN DEFAULT FALSE,
  time_taken INTEGER DEFAULT 0, -- in minutes
  date DATE DEFAULT CURRENT_DATE
);

-- 4. Book Questions
CREATE TABLE book_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  book_name TEXT NOT NULL,
  level_name TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE
);

-- 5. Daily Logs
CREATE TABLE daily_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE UNIQUE DEFAULT CURRENT_DATE,
  total_study_time INTEGER DEFAULT 0 -- in minutes
);

-- 6. Fitness Logs (Placeholder)
CREATE TABLE fitness_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE DEFAULT CURRENT_DATE,
  type TEXT,
  volume INTEGER,
  notes TEXT
);

-- Add some initial subjects
INSERT INTO subjects (name) VALUES 
('Physics'), ('Math'), ('Physical Chemistry'), ('Inorganic Chemistry'), ('Organic Chemistry')
ON CONFLICT DO NOTHING;
