-- Fitness Mastery Schema

-- 1. Exercise Master Definitions
CREATE TABLE IF NOT EXISTS fitness_exercises (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    family VARCHAR(50) NOT NULL, -- 'Push Static', 'Push Horizontal', 'Push Vertical', etc.
    category VARCHAR(50) NOT NULL, -- 'Bodyweight' or 'Free Weight'
    difficulty INTEGER DEFAULT 1, -- 1-10 scale
    main_muscles TEXT[], -- Array of muscle names
    support_muscles TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Workout Sessions (Push/Pull/Rest)
CREATE TABLE IF NOT EXISTS fitness_sessions (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL, -- 'Push', 'Pull', 'Rest'
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    body_weight DECIMAL(5,2), -- User weight at start of workout
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Workout Blocks (Warmup, Main, Accessory, Skill)
CREATE TABLE IF NOT EXISTS fitness_blocks (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES fitness_sessions(id) ON DELETE CASCADE,
    block_type VARCHAR(20) NOT NULL, -- 'Warmup', 'Main', 'Accessory', 'Skill' (Handstand)
    duration_minutes INTEGER,
    is_skipped BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. In-Session Movement Logs
CREATE TABLE IF NOT EXISTS fitness_logs (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    block_id UUID REFERENCES fitness_blocks(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES fitness_exercises(id),
    set_number INTEGER NOT NULL,
    reps INTEGER,
    weight DECIMAL(10,2), -- Actual weight used (Free Weight)
    resistance_level VARCHAR(50), -- Bands, assistance level, etc. (Optional)
    duration_seconds INTEGER, -- For static holds
    is_completed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_fitness_sessions_date ON fitness_sessions(date);
CREATE INDEX IF NOT EXISTS idx_fitness_logs_block ON fitness_logs(block_id);
