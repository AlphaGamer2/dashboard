'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Plus, Minus, Loader2 } from 'lucide-react';

interface ChapterTrackerProps {
    chapter: any;
    subject: string;
}

const GLOBAL_LEVELS = ["School Level", "JEE Mains Level", "JEE Advanced Level", "JEE Advanced Plus Level"];

const BOOK_CONFIG: Record<string, string[]> = {
    "Physics": ["Module", "HC Verma", "IE Irodov", "SS Krotov", "Physics Galaxy", "PYQs"],
    "Math": ["Module", "Cengage", "PYQs"],
    "Physical Chemistry": ["Module", "Narendra Avasthi", "PYQs"],
    "Inorganic Chemistry": ["Module", "PYQs"],
    "Organic Chemistry": ["Module", "PYQs"],
};

export default function ChapterTracker({ chapter, subject }: ChapterTrackerProps) {
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [lecturesCompleted, setLecturesCompleted] = useState(0);
    const [dppsCompleted, setDppsCompleted] = useState(0);
    const [bookCounts, setBookCounts] = useState<Record<string, Record<string, number>>>({});

    const books = BOOK_CONFIG[subject] || ["Module"];

    useEffect(() => {
        fetchInitialData();
    }, []);

    async function fetchInitialData() {
        // Fetch lecture/DPP completion
        const { data: logs } = await supabase
            .from('tracking_logs')
            .select('*')
            .eq('chapter_id', chapter.id);

        const lCount = logs?.filter(l => l.type === 'lecture' && l.status).length || 0;
        const dCount = logs?.filter(l => l.type === 'dpp' && l.status).length || 0;
        setLecturesCompleted(lCount);
        setDppsCompleted(dCount);

        // Fetch question counts
        const { data: questions } = await supabase
            .from('book_questions')
            .select('*')
            .eq('chapter_id', chapter.id);

        const counts: any = {};
        questions?.forEach(q => {
            if (!counts[q.book_name]) counts[q.book_name] = {};
            counts[q.book_name][q.level_name] = q.count;
        });
        setBookCounts(counts);
    }

    async function toggleProgress(type: 'lecture' | 'dpp', index: number) {
        const today = new Date().toISOString().split('T')[0];
        const { error } = await supabase
            .from('tracking_logs')
            .upsert({
                chapter_id: chapter.id,
                type,
                item_index: index,
                status: true,
                date: today,
                time_taken: 60 // Default 1 hour per session for now, user can adjust in "Daily Log"
            }, { onConflict: 'chapter_id,type,item_index' });

        if (!error) {
            if (type === 'lecture') setLecturesCompleted(index + 1);
            else setDppsCompleted(index + 1);
        }
    }

    async function updateQuestionCount(book: string, level: string, delta: number) {
        const current = (bookCounts[book]?.[level] || 0);
        const newVal = Math.max(0, current + delta);

        const today = new Date().toISOString().split('T')[0];
        const { error } = await supabase
            .from('book_questions')
            .upsert({
                chapter_id: chapter.id,
                book_name: book,
                level_name: level,
                count: newVal,
                date: today
            }, { onConflict: 'chapter_id,book_name,level_name' });

        if (!error) {
            setBookCounts(prev => ({
                ...prev,
                [book]: { ...prev[book], [level]: newVal }
            }));
        }
    }

    return (
        <div className="glass-card chapter-card">
            <div className="chapter-header" onClick={() => setExpanded(!expanded)}>
                <div className="chapter-info">
                    <span className="chapter-no">{chapter.chapter_no}</span>
                    <h3>{chapter.name}</h3>
                </div>

                <div className="chapter-progress">
                    <div className="progress-mini">
                        <span>Lectures: {lecturesCompleted}/{chapter.total_lectures}</span>
                        <div className="progress-bar"><div className="fill" style={{ width: `${(lecturesCompleted / chapter.total_lectures) * 100}%` }}></div></div>
                    </div>
                    <div className="progress-mini" style={{ opacity: chapter.total_dpps ? 1 : 0 }}>
                        <span>DPPs: {dppsCompleted}/{chapter.total_dpps}</span>
                        <div className="progress-bar"><div className="fill" style={{ width: `${(dppsCompleted / chapter.total_dpps) * 100}%` }}></div></div>
                    </div>
                </div>

                {expanded ? <ChevronUp /> : <ChevronDown />}
            </div>

            {expanded && (
                <div className="chapter-details">
                    <section className="section">
                        <h4>Syllabus Tracking</h4>
                        <div className="track-grid">
                            <div className="track-col">
                                <h5>Lectures</h5>
                                <div className="track-items">
                                    {Array.from({ length: chapter.total_lectures }).map((_, i) => (
                                        <button
                                            key={i}
                                            className={`track-btn ${i < lecturesCompleted ? 'done' : ''}`}
                                            onClick={() => toggleProgress('lecture', i)}
                                        >
                                            {i < lecturesCompleted ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                                            L{i + 1}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {chapter.total_dpps > 0 && (
                                <div className="track-col">
                                    <h5>DPPs</h5>
                                    <div className="track-items">
                                        {Array.from({ length: chapter.total_dpps }).map((_, i) => (
                                            <button
                                                key={i}
                                                className={`track-btn ${i < dppsCompleted ? 'done' : ''}`}
                                                onClick={() => toggleProgress('dpp', i)}
                                            >
                                                {i < dppsCompleted ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                                                D{i + 1}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="section">
                        <h4>Question Tracking</h4>
                        <div className="book-grid">
                            {books.map(book => (
                                <div key={book} className="book-item">
                                    <p className="book-name">{book}</p>
                                    <div className="level-list">
                                        {GLOBAL_LEVELS.map(level => (
                                            <div key={level} className="level-row">
                                                <span className="level-label">{level}</span>
                                                <div className="counter">
                                                    <button className="cnt-btn" onClick={() => updateQuestionCount(book, level, -1)}><Minus size={12} /></button>
                                                    <input type="number" value={bookCounts[book]?.[level] || 0} readOnly />
                                                    <button className="cnt-btn" onClick={() => updateQuestionCount(book, level, 1)}><Plus size={12} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}
