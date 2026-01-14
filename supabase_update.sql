-- Add unique constraints to support upsert in ChapterTracker

-- 1. For tracking_logs: One entry per chapter, type, and index
ALTER TABLE tracking_logs 
ADD CONSTRAINT tracking_logs_unique_item UNIQUE (chapter_id, type, item_index);

-- 2. For book_questions: One entry per chapter, book, and level
ALTER TABLE book_questions 
ADD CONSTRAINT book_questions_unique_level UNIQUE (chapter_id, book_name, level_name);
