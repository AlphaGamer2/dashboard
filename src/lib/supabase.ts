import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Subject = {
    id: string;
    name: string;
};

export type Chapter = {
    id: string;
    subject_id: string;
    chapter_no: string;
    name: string;
    total_lectures: number;
    total_dpps: number;
};

export type TrackingLog = {
    id: string;
    chapter_id: string;
    type: 'lecture' | 'dpp';
    item_index: number;
    status: boolean;
    time_taken: number;
    date: string;
};

export type BookQuestion = {
    id: string;
    chapter_id: string;
    book_name: string;
    level_name: string;
    count: number;
    date: string;
};

export type DailyLog = {
    id: string;
    date: string;
    total_study_time: number;
};
