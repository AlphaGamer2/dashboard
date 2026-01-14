-- Allow 'chapter_complete' as a valid type in tracking_logs logic (implicitly supported by varchar)
-- No changes needed to the actual table structure, just ensuring the logic in the app matches.

-- Optional: Add a 'score' column to daily_logs for future gamification if requested
-- ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS score integer DEFAULT 0;
