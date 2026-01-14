'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Plus, Minus } from 'lucide-react';

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
    const [lecturesCompleted, setLecturesCompleted] = useState(chapter.lectures_completed || 0);
    const [dppsCompleted, setDppsCompleted] = useState(chapter.dpps_completed || 0);

    const books = BOOK_CONFIG[subject] || ["Module"];

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
                    <div className="progress-mini">
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
                                        <button key={i} className={`track-btn ${i < lecturesCompleted ? 'done' : ''}`} onClick={() => setLecturesCompleted(i + 1)}>
                                            {i < lecturesCompleted ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                                            L{i + 1}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="track-col">
                                <h5>DPPs</h5>
                                <div className="track-items">
                                    {Array.from({ length: chapter.total_dpps }).map((_, i) => (
                                        <button key={i} className={`track-btn ${i < dppsCompleted ? 'done' : ''}`} onClick={() => setDppsCompleted(i + 1)}>
                                            {i < dppsCompleted ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                                            D{i + 1}
                                        </button>
                                    ))}
                                </div>
                            </div>
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
                                                    <button className="cnt-btn"><Minus size={12} /></button>
                                                    <input type="number" defaultValue={0} readOnly />
                                                    <button className="cnt-btn"><Plus size={12} /></button>
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
