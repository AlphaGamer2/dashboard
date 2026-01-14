'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
    CheckCircle2, Circle, ChevronDown, ChevronUp,
    RotateCcw, Trophy, CheckCheck,
    Zap, Book, ClipboardCheck, Sparkles, Clock, Calendar,
    History, Plus, Minus, Info, ClipboardList, Timer, Undo2
} from 'lucide-react';

interface ChapterTrackerProps {
    chapter: any;
    subject: string;
}

const GLOBAL_LEVELS = [
    "School Level",
    "Topic Wise Questions",
    "JEE Mains Level",
    "JEE Advanced Level",
    "JEE Advanced Plus Level"
];

const BOOK_CONFIG: Record<string, string[]> = {
    "Physics": ["Module", "KPP", "HC Verma", "IE Irodov", "SS Krotov", "Physics Galaxy", "PYQs"],
    "Math": ["Module", "DIBY", "Cengage", "PYQs"],
    "Physical Chemistry": ["Module", "Homework", "Narendra Avasthi", "PYQs"],
    "Inorganic Chemistry": ["Module", "Homework", "PYQs"],
    "Organic Chemistry": ["Module", "Homework", "PYQs"],
};

const LEVEL_CONSTRAINTS: Record<string, string[]> = {
    "IE Irodov": ["JEE Advanced Plus Level"],
    "SS Krotov": ["JEE Advanced Plus Level"],
    "HC Verma": ["JEE Mains Level", "JEE Advanced Level"],
    "Physics Galaxy": ["JEE Mains Level", "JEE Advanced Level"],
};

export default function ChapterTracker({ chapter, subject }: ChapterTrackerProps) {
    const [expanded, setExpanded] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [loading, setLoading] = useState(true);

    // Basic Progress
    const [doneLectures, setDoneLectures] = useState<Map<number, any>>(new Map());
    const [doneDPPs, setDoneDPPs] = useState<Map<number, any>>(new Map());
    const [isCompleted, setIsCompleted] = useState(false);
    const [isOneShot, setIsOneShot] = useState(false);

    // Advanced Progress
    const [revisionCycles, setRevisionCycles] = useState(0);
    const [notesCycles, setNotesCycles] = useState(0);
    const [bookStates, setBookStates] = useState<Record<string, { cycle: number, limit: number }>>({});
    const [bookCounts, setBookCounts] = useState<Record<string, Record<string, number>>>({});

    // History & Meta
    const [logs, setLogs] = useState<any[]>([]);
    const [startDate, setStartDate] = useState<string | null>(null);
    const [totalTime, setTotalTime] = useState(0);

    const books = BOOK_CONFIG[subject] || ["Module"];
    const allLecturesDone = doneLectures.size === chapter.total_lectures;
    const allDPPsDone = doneDPPs.size === chapter.total_dpps;
    const canMarkComplete = (allLecturesDone && allDPPsDone && !isCompleted);

    useEffect(() => {
        fetchInitialData();
    }, []);

    async function fetchInitialData() {
        setLoading(true);
        const { data: trackLogs } = await supabase
            .from('tracking_logs')
            .select('*')
            .eq('chapter_id', chapter.id)
            .eq('status', true)
            .order('date', { ascending: false });

        setLogs(trackLogs || []);

        const lMap = new Map();
        const dMap = new Map();
        const bStates: any = {};
        let revMax = 0;
        let notesMax = 0;
        let completed = false;
        let oneShot = false;
        let start: string | null = null;
        let timeSum = 0;

        trackLogs?.forEach(l => {
            timeSum += (l.time_taken || 0);
            if (l.type === 'lecture') lMap.set(l.item_index, { time: l.time_taken, date: l.date });
            else if (l.type === 'dpp') dMap.set(l.item_index, { time: l.time_taken, date: l.date });
            else if (l.type === 'completion') { completed = true; if (l.item_index === 99) oneShot = true; }
            else if (l.type === 'revision_cycle') revMax = Math.max(revMax, l.item_index);
            else if (l.type === 'notes_revision') notesMax = Math.max(notesMax, l.item_index);
            else if (l.type === 'chapter_start') start = l.date;
            else if (l.type.startsWith('book_state:')) {
                const bName = l.type.split(':')[1];
                bStates[bName] = { cycle: l.item_index, limit: l.time_taken };
            }
        });

        setDoneLectures(lMap);
        setDoneDPPs(dMap);
        setIsCompleted(completed);
        setIsOneShot(oneShot);
        setRevisionCycles(revMax);
        setNotesCycles(notesMax);
        setBookStates(bStates);
        setStartDate(start);
        setTotalTime(timeSum);

        const { data: questions } = await supabase.from('book_questions').select('*').eq('chapter_id', chapter.id);
        const counts: any = {};
        questions?.forEach(q => {
            if (!counts[q.book_name]) counts[q.book_name] = {};
            counts[q.book_name][q.level_name] = q.count;
        });
        setBookCounts(counts);
        setLoading(false);
    }

    async function logActivity(type: string, index: number, timeVal: number, customDate?: string) {
        const logDate = customDate || new Date().toISOString().split('T')[0];

        if (!startDate && type !== 'chapter_start') {
            await supabase.from('tracking_logs').upsert({ chapter_id: chapter.id, type: 'chapter_start', item_index: 0, status: true, date: logDate, time_taken: 0 });
            setStartDate(logDate);
        }

        const { error } = await supabase
            .from('tracking_logs')
            .upsert({
                chapter_id: chapter.id,
                type,
                item_index: index,
                status: true,
                date: logDate,
                time_taken: timeVal
            }, { onConflict: 'chapter_id,type,item_index' });

        if (!error) {
            fetchInitialData();
        }
    }

    async function undoBookComplete(book: string) {
        const currentState = bookStates[book];
        if (!currentState || currentState.cycle === 0) return;

        // Delete the book_state log
        await supabase.from('tracking_logs').delete().match({ chapter_id: chapter.id, type: `book_state:${book}`, item_index: currentState.cycle });

        // Optionally restoring counts would be complex without a deep snapshot, so we just restore the state cycle.
        fetchInitialData();
    }

    async function markBookComplete(book: string) {
        const currentTotals = getBookLevels(book).reduce((sum, level) => sum + (bookCounts[book]?.[level] || 0), 0);
        const currentState = bookStates[book] || { cycle: 0, limit: 0 };
        await logActivity(`book_state:${book}`, currentState.cycle + 1, currentTotals);

        const resetPromises = GLOBAL_LEVELS.map(level =>
            supabase.from('book_questions').upsert({
                chapter_id: chapter.id, book_name: book, level_name: level, count: 0, date: new Date().toISOString().split('T')[0]
            }, { onConflict: 'chapter_id,book_name,level_name' })
        );
        await Promise.all(resetPromises);
        fetchInitialData();
    }

    async function handleQuestionChange(book: string, level: string, value: string) {
        const newVal = Math.max(0, parseInt(value) || 0);
        const today = new Date().toISOString().split('T')[0];
        await supabase.from('book_questions').upsert({
            chapter_id: chapter.id, book_name: book, level_name: level, count: newVal, date: today
        }, { onConflict: 'chapter_id,book_name,level_name' });

        await supabase.from('tracking_logs').insert({
            chapter_id: chapter.id,
            type: `questions:${book}:${level}`,
            item_index: newVal,
            status: true,
            date: today,
            time_taken: 0
        });
        fetchInitialData();
    }

    const getBookLevels = (book: string) => LEVEL_CONSTRAINTS[book] || GLOBAL_LEVELS;

    return (
        <div className={`glass-card chapter-card v4 ${isCompleted ? 'chapter-completed' : ''}`}>
            <div className="chapter-header" onClick={() => setExpanded(!expanded)}>
                <div className="chapter-info">
                    <div className="chapter-no-pill">{chapter.chapter_no}</div>
                    <div className="title-area">
                        <h3 className="chapter-name-text">{chapter.name}</h3>
                        <div className="meta-row">
                            {startDate && <span className="meta-item"><Calendar size={12} /> {startDate}</span>}
                            <span className="meta-item"><Timer size={12} /> {(totalTime / 60).toFixed(1)}h</span>
                            {isOneShot && <span className="badge-v4 orange">ONE-SHOT</span>}
                        </div>
                    </div>
                </div>

                <div className="chapter-header-stats">
                    <div className="stat-badges">
                        {isCompleted && <span className="badge-v4 green"><CheckCheck size={12} /> MASTERED</span>}
                        {revisionCycles > 0 && <span className="badge-v4 blue">REV x{revisionCycles}</span>}
                    </div>
                    <div className="progress-pills">
                        <div className="pill">L: {doneLectures.size}/{chapter.total_lectures}</div>
                        <div className="pill">D: {doneDPPs.size}/{chapter.total_dpps}</div>
                    </div>
                    <div className="expand-trigger">
                        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                </div>
            </div>

            {expanded && (
                <div className="chapter-details-v4">
                    <div className="details-header-tabs">
                        <button className={`tab-btn ${!showHistory ? 'active' : ''}`} onClick={() => setShowHistory(false)}>Tracking</button>
                        <button className={`tab-btn ${showHistory ? 'active' : ''}`} onClick={() => setShowHistory(true)}><History size={14} /> Journey</button>
                    </div>

                    {!showHistory ? (
                        <div className="v4-main-grid">
                            {/* Syllabus Tracking */}
                            <div className="v4-card syllabus-box">
                                <div className="box-head">
                                    <h4><Zap size={16} /> Progression</h4>
                                    {!isCompleted && (
                                        <button className="one-shot-v5" onClick={() => {
                                            const t = prompt("Avg mins per item?", "60");
                                            if (t) {
                                                const date = prompt("Date? (Leave blank for None)", new Date().toISOString().split('T')[0]);
                                                const dateVal = date ? date : '1970-01-01'; // Marker for date-less
                                                // Mark as 99 index to signify One-Shot completion log
                                                logActivity('completion', 99, 0, date || undefined);
                                            }
                                        }}>Completed by One-Shot</button>
                                    )}
                                </div>

                                <div className="log-groups">
                                    <div className="log-group">
                                        <p>Lectures</p>
                                        <div className="log-grid">
                                            {Array.from({ length: chapter.total_lectures }).map((_, i) => (
                                                <div key={i} className={`log-item ${doneLectures.has(i) ? 'active' : ''}`} onClick={() => {
                                                    if (!doneLectures.has(i)) {
                                                        const t = prompt("Minutes spent?", "60");
                                                        const d = prompt("Date? (Leave blank for None)", new Date().toISOString().split('T')[0]);
                                                        if (t) logActivity('lecture', i, parseInt(t), d || undefined);
                                                    }
                                                }}>
                                                    L{i + 1}
                                                    {doneLectures.has(i) && doneLectures.get(i).date !== '1970-01-01' && <span className="item-date">{doneLectures.get(i).date.split('-').slice(1).join('/')}</span>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="log-group">
                                        <p>DPPs</p>
                                        <div className="log-grid">
                                            {Array.from({ length: chapter.total_dpps }).map((_, i) => (
                                                <div key={i} className={`log-item ${doneDPPs.has(i) ? 'active' : ''}`} onClick={() => {
                                                    if (!doneDPPs.has(i)) {
                                                        const t = prompt("Minutes spent?", "60");
                                                        const d = prompt("Date? (Leave blank for None)", new Date().toISOString().split('T')[0]);
                                                        if (t) logActivity('dpp', i, parseInt(t), d || undefined);
                                                    }
                                                }}>
                                                    D{i + 1}
                                                    {doneDPPs.has(i) && doneDPPs.get(i).date !== '1970-01-01' && <span className="item-date">{doneDPPs.get(i).date.split('-').slice(1).join('/')}</span>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="mastery-actions">
                                    {isCompleted ? (
                                        <div className="cycle-row-v5">
                                            <button className="master-btn-v5 high" onClick={() => logActivity('revision_cycle', revisionCycles + 1, parseInt(prompt("Minutes?", "60") || "0"))}>
                                                <RotateCcw size={16} /> One-Shot Revision {revisionCycles + 1}
                                            </button>
                                            <button className="master-btn-v5 purple" onClick={() => logActivity('notes_revision', notesCycles + 1, parseInt(prompt("Minutes?", "30") || "0"))}>
                                                <ClipboardCheck size={16} /> Notes Revision {notesCycles + 1}
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            className={`complete-chapter-btn ${canMarkComplete ? 'ready' : 'locked'}`}
                                            disabled={!canMarkComplete}
                                            onClick={() => logActivity('completion', 1, 0)}
                                        >
                                            <Trophy size={18} /> Mark Chapter Complete
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Question Practice */}
                            <div className="v4-card question-box">
                                <div className="box-head">
                                    <h4><Book size={16} /> Question Bank</h4>
                                </div>
                                <div className="book-scroller-v4">
                                    {books.map(book => {
                                        const state = bookStates[book] || { cycle: 0, limit: 0 };
                                        const currentTotal = getBookLevels(book).reduce((sum, lvl) => sum + (bookCounts[book]?.[lvl] || 0), 0);

                                        return (
                                            <div key={book} className="book-panel v5">
                                                <div className="book-panel-head">
                                                    <div className="book-title-group">
                                                        <p>{book}</p>
                                                        {state.cycle > 0 && <button className="undo-btn" title="Undo Complete" onClick={() => undoBookComplete(book)}><Undo2 size={12} /></button>}
                                                    </div>
                                                    <button className={`book-complete-btn ${state.cycle > 0 ? 'repeat' : ''}`} onClick={() => markBookComplete(book)}>
                                                        {state.cycle > 0 ? `Repeat Cycle ${state.cycle + 1}` : 'Book Completed'}
                                                    </button>
                                                </div>
                                                <div className="book-metrics-v5">
                                                    <div className="m-pill">Total: {currentTotal + state.limit}</div>
                                                    {state.cycle > 0 && <div className="m-pill purple">Rev: {currentTotal}</div>}
                                                </div>
                                                <div className="level-inputs-v5">
                                                    {getBookLevels(book).map(level => (
                                                        <div key={level} className="level-row-v5">
                                                            <span className="lvl-name">{level}</span>
                                                            <div className="v5-input-group">
                                                                <button onClick={() => handleQuestionChange(book, level, ((bookCounts[book]?.[level] || 0) - 1).toString())}>-</button>
                                                                <input
                                                                    type="number"
                                                                    value={bookCounts[book]?.[level] || 0}
                                                                    onChange={(e) => handleQuestionChange(book, level, e.target.value)}
                                                                />
                                                                <button onClick={() => handleQuestionChange(book, level, ((bookCounts[book]?.[level] || 0) + 1).toString())}>+</button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="v4-history-view">
                            <div className="history-header-v5">
                                <h4><History size={16} /> Study Timeline</h4>
                                <p className="text-muted">Tracking every step toward mastery.</p>
                            </div>
                            <div className="timeline-list-v5">
                                {logs.map((l, i) => (
                                    <div key={i} className="timeline-entry-v5">
                                        <div className="t-marker"></div>
                                        <div className="t-body">
                                            <div className="t-time-box">
                                                <span className="t-date-v5">{l.date === '1970-01-01' ? 'Legacy' : l.date}</span>
                                                {l.time_taken > 0 && <span className="t-dur">{l.time_taken}m</span>}
                                            </div>
                                            <div className="t-details">
                                                <span className="t-type-v5">{l.type.replace(':', ' ').toUpperCase()}</span>
                                                {l.item_index > 0 && l.item_index < 99 && <span className="t-val">#{l.item_index}</span>}
                                                {l.item_index === 99 && <span className="t-val tint">ONE-SHOT</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
