-- Seed Fitness Exercises

INSERT INTO fitness_exercises (name, family, category, difficulty, main_muscles, support_muscles) VALUES
-- PUSH STATIC
('Plank', 'Push Static', 'Bodyweight', 2, ARRAY['Abs'], ARRAY['Shoulders']),
('L-Sit', 'Push Static', 'Bodyweight', 5, ARRAY['Abs', 'Triceps'], ARRAY['Shoulders']),
('Planche Lean', 'Push Static', 'Bodyweight', 6, ARRAY['Shoulders'], ARRAY['Chest', 'Triceps']),

-- PUSH HORIZONTAL
('Pushups', 'Push Horizontal', 'Bodyweight', 3, ARRAY['Chest', 'Triceps'], ARRAY['Shoulders']),
('Diamond Pushups', 'Push Horizontal', 'Bodyweight', 4, ARRAY['Triceps'], ARRAY['Chest']),
('Bench Press', 'Push Horizontal', 'Free Weight', 5, ARRAY['Chest'], ARRAY['Triceps', 'Shoulders']),
('Dips', 'Push Horizontal', 'Bodyweight', 5, ARRAY['Chest', 'Triceps'], ARRAY['Shoulders']),

-- PUSH VERTICAL
('Pike Pushups', 'Push Vertical', 'Bodyweight', 4, ARRAY['Shoulders'], ARRAY['Triceps']),
('Overhead Press', 'Push Vertical', 'Free Weight', 5, ARRAY['Shoulders'], ARRAY['Triceps']),
('Handstand Pushups (Wall)', 'Push Vertical', 'Bodyweight', 7, ARRAY['Shoulders', 'Triceps'], ARRAY['Core']),

-- PULL VERTICAL
('Pullups', 'Pull Vertical', 'Bodyweight', 5, ARRAY['Lats'], ARRAY['Biceps', 'Forearms']),
('Chin-ups', 'Pull Vertical', 'Bodyweight', 4, ARRAY['Biceps', 'Lats'], ARRAY['Forearms']),
('Lat Pulldown', 'Pull Vertical', 'Free Weight', 3, ARRAY['Lats'], ARRAY['Biceps']),

-- PULL HORIZONTAL
('Inverted Rows', 'Pull Horizontal', 'Bodyweight', 3, ARRAY['Mid-Back'], ARRAY['Biceps']),
('Barbell Rows', 'Pull Horizontal', 'Free Weight', 5, ARRAY['Back'], ARRAY['Biceps', 'Core']),
('Face Pulls', 'Pull Horizontal', 'Free Weight', 2, ARRAY['Rear Delts'], ARRAY['Traps']),

-- PULL STATIC
('Dead Hang', 'Pull Static', 'Bodyweight', 2, ARRAY['Forearms'], ARRAY['Lats']),
('Front Lever Tuck', 'Pull Static', 'Bodyweight', 6, ARRAY['Lats', 'Core'], ARRAY['Biceps']),
('Back Lever', 'Pull Static', 'Bodyweight', 7, ARRAY['Back', 'Shoulders'], ARRAY['Core']),

-- SKILLS
('Handstand Hold', 'Skill', 'Bodyweight', 6, ARRAY['Shoulders'], ARRAY['Core', 'Forearms']);
