-- Consolidated Fitness Mastery Schema (V8 - FIXED)
-- Instructions: Run this in your Supabase SQL Editor to initialize/fix your fitness system.

-- 0. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Exercises Master
CREATE TABLE IF NOT EXISTS fitness_exercises (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE, -- Added UNIQUE for ON CONFLICT support
    family VARCHAR(100) NOT NULL, -- 'Push Static', 'Pull Horizontal', etc.
    base_type VARCHAR(50), -- 'Push', 'Pull', 'Balance'
    sub_type VARCHAR(50), -- 'Vertical', 'Horizontal', 'Static'
    category VARCHAR(50) NOT NULL, -- 'Bodyweight', 'Free Weight'
    difficulty INTEGER DEFAULT 1,
    target_muscles TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Sessions
CREATE TABLE IF NOT EXISTS fitness_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    date DATE NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'Push', 'Pull', 'Rest'
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    is_completed BOOLEAN DEFAULT FALSE,
    body_weight DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Workout Blocks
CREATE TABLE IF NOT EXISTS fitness_blocks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES fitness_sessions(id) ON DELETE CASCADE,
    block_type VARCHAR(50) NOT NULL, -- 'Warmup', 'Main', 'Accessory', 'Skill'
    is_skipped BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Exercise Logs
CREATE TABLE IF NOT EXISTS fitness_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    block_id UUID REFERENCES fitness_blocks(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES fitness_exercises(id),
    set_number INTEGER NOT NULL,
    reps INTEGER,
    weight DECIMAL(10,2),
    resistance_level VARCHAR(50), -- Bands, Tuck, etc.
    duration_seconds INTEGER,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Goals
CREATE TABLE IF NOT EXISTS fitness_goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE, -- Added UNIQUE for consistency
    category VARCHAR(20) NOT NULL, -- 'Push', 'Pull', 'Balance'
    sub_category VARCHAR(20), -- 'Vertical', 'Horizontal', 'Static'
    type VARCHAR(20) NOT NULL, -- 'Main', 'Mini'
    target_value DECIMAL(10,2) NOT NULL,
    current_value DECIMAL(10,2) DEFAULT 0,
    deadline DATE,
    is_achieved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Initial Seed Data (Exercises)
INSERT INTO fitness_exercises (name, family, base_type, sub_type, category, difficulty)
VALUES 
-- Push
('Planche Lean', 'Push Static', 'Push', 'Static', 'Bodyweight', 4),
('Pseudo Pushups', 'Push Horizontal', 'Push', 'Horizontal', 'Bodyweight', 3),
('Overhead Press', 'Push Vertical', 'Push', 'Vertical', 'Free Weight', 4),
('Dips', 'Push Vertical', 'Push', 'Vertical', 'Bodyweight', 2),
('Pushups', 'Push Horizontal', 'Push', 'Horizontal', 'Bodyweight', 1),
('Tuck Planche', 'Push Static', 'Push', 'Static', 'Bodyweight', 6),
-- Pull
('Front Lever Tuck', 'Pull Static', 'Pull', 'Static', 'Bodyweight', 5),
('Pullups', 'Pull Vertical', 'Pull', 'Vertical', 'Bodyweight', 2),
('Australian Rows', 'Pull Horizontal', 'Pull', 'Horizontal', 'Bodyweight', 1),
('Barbell Rows', 'Pull Horizontal', 'Pull', 'Horizontal', 'Free Weight', 3),
('Weighted Pullups', 'Pull Vertical', 'Pull', 'Vertical', 'Bodyweight', 4),
-- Skill / Balance
('Handstand Kick-ups', 'Balance', 'Balance', 'Static', 'Bodyweight', 3),
('Wall Handstand', 'Balance', 'Balance', 'Static', 'Bodyweight', 2),
('Freestanding Handstand', 'Balance', 'Balance', 'Static', 'Bodyweight', 5)
ON CONFLICT (name) DO NOTHING;
