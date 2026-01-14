-- Migration V7: Calisthenics Mastery

-- 1. Relax Session Constraints (Allow multiple sessions per day)
ALTER TABLE IF EXISTS fitness_sessions DROP CONSTRAINT IF EXISTS fitness_sessions_date_key;

-- 2. Enhance Exercise Master (Add Sub-Types)
ALTER TABLE IF EXISTS fitness_exercises ADD COLUMN IF NOT EXISTS sub_type VARCHAR(50); -- 'Vertical', 'Horizontal', 'Static'
ALTER TABLE IF EXISTS fitness_exercises ADD COLUMN IF NOT EXISTS base_type VARCHAR(50); -- 'Push', 'Pull', 'Balance'

-- 3. Goal Tracking Table
CREATE TABLE IF NOT EXISTS fitness_goals (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(20) NOT NULL, -- 'Push', 'Pull', 'Balance'
    sub_category VARCHAR(20), -- 'Vertical', 'Horizontal', 'Static'
    type VARCHAR(20) NOT NULL, -- 'Main' (Move/Skill), 'Mini' (Rep/Hold)
    target_value DECIMAL(10,2) NOT NULL, -- Target reps or seconds
    current_value DECIMAL(10,2) DEFAULT 0,
    deadline DATE,
    is_achieved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update existing exercises with sub-types
UPDATE fitness_exercises SET base_type = 'Push', sub_type = 'Static' WHERE family = 'Push Static';
UPDATE fitness_exercises SET base_type = 'Push', sub_type = 'Horizontal' WHERE family = 'Push Horizontal';
UPDATE fitness_exercises SET base_type = 'Push', sub_type = 'Vertical' WHERE family = 'Push Vertical';
UPDATE fitness_exercises SET base_type = 'Pull', sub_type = 'Static' WHERE family = 'Pull Static';
UPDATE fitness_exercises SET base_type = 'Pull', sub_type = 'Horizontal' WHERE family = 'Pull Horizontal';
UPDATE fitness_exercises SET base_type = 'Pull', sub_type = 'Vertical' WHERE family = 'Pull Vertical';
UPDATE fitness_exercises SET base_type = 'Balance', sub_type = 'Static' WHERE family = 'Skill' OR family = 'Balance';
