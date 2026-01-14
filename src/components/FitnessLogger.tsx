'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Plus, Play, CheckCircle2, XCircle,
    RotateCcw, Trash2, Clock, ChevronDown,
    ChevronUp, Dumbbell, Zap, Flame,
    Target, Info, Timer, TrendingUp, TrendingDown, Minus,
    Award, Loader2, History as HistoryIcon
} from 'lucide-react';

interface FitnessLoggerProps {
    session: any;
    onComplete: () => void;
}

export default function FitnessLogger({ session, onComplete }: FitnessLoggerProps) {
    const [blocks, setBlocks] = useState<any[]>([]);
    const [exercises, setExercises] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
    const [showExercisePicker, setShowExercisePicker] = useState<string | null>(null);
    const [lastStats, setLastStats] = useState<Record<string, any>>({}); // exercise_id -> { reps, weight, duration }

    useEffect(() => {
        fetchData();
    }, [session.id]);

    async function fetchData() {
        setLoading(true);
        try {
            // 1. Fetch blocks and logs
            const { data: bData } = await supabase
                .from('fitness_blocks')
                .select('*, fitness_logs(*, fitness_exercises(*))')
                .eq('session_id', session.id)
                .order('created_at', { ascending: true });

            // 2. Fetch all exercises for picker
            const { data: eData } = await supabase.from('fitness_exercises').select('*');

            // 3. Fetch "Last Best" stats for exercises in this session
            const exIds = Array.from(new Set(bData?.flatMap(b => b.fitness_logs?.map((l: any) => l.exercise_id)) || []));
            if (exIds.length > 0) {
                const { data: prevLogs } = await supabase
                    .from('fitness_logs')
                    .select('*, fitness_blocks!inner(session_id, fitness_sessions!inner(date))')
                    .in('exercise_id', exIds)
                    .lt('fitness_blocks.fitness_sessions.date', session.date)
                    .order('created_at', { ascending: false });

                const stats: any = {};
                prevLogs?.forEach(l => {
                    if (!stats[l.exercise_id]) {
                        stats[l.exercise_id] = { reps: l.reps, weight: l.weight, duration: l.duration_seconds };
                    } else {
                        // Keep the "best" set
                        if ((l.reps || 0) > (stats[l.exercise_id].reps || 0)) stats[l.exercise_id].reps = l.reps;
                        if ((l.duration_seconds || 0) > (stats[l.exercise_id].duration || 0)) stats[l.exercise_id].duration = l.duration_seconds;
                    }
                });
                setLastStats(stats);
            }

            setBlocks(bData || []);
            setExercises(eData || []);
            if (bData && bData.length > 0 && !activeBlockId) setActiveBlockId(bData[0].id);
        } catch (err) {
            console.error("Fetch Logic Error:", err);
        }
        setLoading(false);
    }

    async function addExerciseToBlock(exerciseId: string, blockId: string) {
        const { error } = await supabase.from('fitness_logs').insert({
            block_id: blockId,
            exercise_id: exerciseId,
            set_number: 1,
            is_completed: false
        });
        if (error) console.error("Add Exercise Error:", error);
        fetchData();
        setShowExercisePicker(null);
    }

    async function updateLog(logId: string, updates: any) {
        const { error } = await supabase.from('fitness_logs').update(updates).eq('id', logId);
        if (error) console.error("Update Log Error:", error);
        fetchData();
    }

    async function addSet(log: any) {
        const { error } = await supabase.from('fitness_logs').insert({
            block_id: log.block_id,
            exercise_id: log.exercise_id,
            set_number: log.set_number + 1,
            is_completed: false,
            weight: log.weight,
            resistance_level: log.resistance_level
        });
        if (error) console.error("Add Set Error:", error);
        fetchData();
    }

    async function deleteLog(logId: string) {
        await supabase.from('fitness_logs').delete().eq('id', logId);
        fetchData();
    }

    async function toggleBlockSkip(blockId: string, current: boolean) {
        await supabase.from('fitness_blocks').update({ is_skipped: !current }).eq('id', blockId);
        fetchData();
    }

    async function finishSession() {
        // Before finishing, potentially update goals based on new PRs
        const { error } = await supabase.from('fitness_sessions').update({
            is_completed: true,
            end_time: new Date().toISOString()
        }).eq('id', session.id);
        if (!error) onComplete();
    }

    const renderProgressIcon = (exerciseId: string, type: 'reps' | 'duration', current: number) => {
        const last = lastStats[exerciseId]?.[type === 'reps' ? 'reps' : 'duration'] || 0;
        if (current === 0) return null;
        if (current > last) return <TrendingUp size={14} className="text-green animate-pulse" />;
        if (current < last && last > 0) return <TrendingDown size={14} className="text-red" />;
        return <Minus size={14} className="text-muted" />;
    };

    const [finishedBlocks, setFinishedBlocks] = useState<Set<string>>(new Set());

    async function toggleBlockFinish(blockId: string) {
        const newSet = new Set(finishedBlocks);
        if (newSet.has(blockId)) newSet.delete(blockId);
        else newSet.add(blockId);
        setFinishedBlocks(newSet);
    }

    if (loading) return <div className="loading-v7 luxury-navy"><Loader2 className="animate-spin" /> Resolving Session Data...</div>;

    const currentBlock = blocks.find(b => b.id === activeBlockId);

    return (
        <div className="fitness-logger-v11 container-royal">
            <header className="logger-masthead">
                <div className="session-meta">
                    <button className="back-btn-v12" onClick={onComplete}><ChevronDown className="rotate-90" /> Exit Cockpit</button>
                    <h2 className="h1-royal"><span className="highlight-gold">{session.type}</span> SQUADRON</h2>
                    <p className="p-luxury"><Timer size={14} /> {session.is_completed ? 'MISSION ARCHIVE' : 'LIVE PERFORMANCE TRACKING'}</p>
                </div>
                {!session.is_completed && <button className="glow-btn finish-btn gold-btn" onClick={finishSession}>TERMINATE SESSION</button>}
            </header>

            <div className="block-stepper-v11">
                {blocks.map(b => (
                    <button
                        key={b.id}
                        className={`step-btn ${activeBlockId === b.id ? 'active' : ''} ${b.is_skipped ? 'skipped' : ''} ${finishedBlocks.has(b.id) || session.is_completed ? 'locked' : ''}`}
                        onClick={() => setActiveBlockId(b.id)}
                    >
                        {(finishedBlocks.has(b.id) || session.is_completed) && <CheckCircle2 size={12} className="text-green mr-2" />}
                        {b.block_type}
                    </button>
                ))}
            </div>

            {currentBlock && (
                <div className="current-block-view glass-card royal-card anim-fade-in">
                    {(finishedBlocks.has(currentBlock.id) || session.is_completed) ? (
                        <div className="block-summary-v11">
                            <div className="s-head">
                                <Award className="icon-gold" size={32} />
                                <h3>{currentBlock.block_type} RECAP</h3>
                            </div>
                            <div className="s-grid">
                                {currentBlock.fitness_logs?.map((l: any, i: number) => (
                                    <div key={i} className="s-item">
                                        <span className="s-ex">{l.fitness_exercises.name}</span>
                                        <span className="s-val">{l.reps}r {l.weight > 0 ? `/ ${l.weight}kg` : ''} {l.duration_seconds > 0 ? `/ ${l.duration_seconds}s` : ''}</span>
                                    </div>
                                ))}
                            </div>
                            {!session.is_completed && <button className="glow-btn secondary w-full mt-4" onClick={() => toggleBlockFinish(currentBlock.id)}>Re-edit Sequence</button>}
                        </div>
                    ) : (
                        <>
                            <div className="block-head">
                                <h3>{currentBlock.block_type} SEQUENCE</h3>
                                <div className="head-actions">
                                    {currentBlock.block_type !== 'Main' && (
                                        <button className="skip-btn" onClick={() => toggleBlockSkip(currentBlock.id, currentBlock.is_skipped)}>
                                            {currentBlock.is_skipped ? 'Restore' : 'Bypass'}
                                        </button>
                                    )}
                                    <button className="finish-block-btn" onClick={() => toggleBlockFinish(currentBlock.id)}>Commit Sequence</button>
                                </div>
                            </div>

                            {!currentBlock.is_skipped && (
                                <div className="logs-container">
                                    {currentBlock.fitness_logs?.length === 0 && (
                                        <div className="placeholder-text luxury">No archetypes initialised in this sequence.</div>
                                    )}
                                    {currentBlock.fitness_logs?.map((l: any) => (
                                        <div key={l.id} className="log-row glass-card">
                                            <div className="log-top">
                                                <div className="ex-info">
                                                    <span className="set-num">SET {l.set_number}</span>
                                                    <div className="ex-meta-box">
                                                        <p className="ex-name">{l.fitness_exercises.name}</p>
                                                        <span className="ex-tag">{l.fitness_exercises.family}</span>
                                                    </div>
                                                </div>
                                                <button className="del-btn" onClick={() => deleteLog(l.id)}><XCircle size={14} /></button>
                                            </div>
                                            <div className="log-inputs">
                                                <div className="l-field">
                                                    <label>Reps {renderProgressIcon(l.exercise_id, 'reps', l.reps || 0)}</label>
                                                    <input type="number" value={l.reps || ''} onChange={(e) => updateLog(l.id, { reps: parseInt(e.target.value) || 0 })} placeholder="0" />
                                                </div>

                                                {l.fitness_exercises.category === 'Bodyweight' ? (
                                                    <div className="l-field">
                                                        <label>Resistance</label>
                                                        <input type="text" value={l.resistance_level || ''} onChange={(e) => updateLog(l.id, { resistance_level: e.target.value })} placeholder="Bands/Tuck" />
                                                    </div>
                                                ) : (
                                                    <div className="l-field">
                                                        <label>Load (kg)</label>
                                                        <input type="number" value={l.weight || ''} onChange={(e) => updateLog(l.id, { weight: parseFloat(e.target.value) || 0 })} placeholder="0.0" />
                                                    </div>
                                                )}

                                                <div className="l-field">
                                                    <label>Secs {renderProgressIcon(l.exercise_id, 'duration', l.duration_seconds || 0)}</label>
                                                    <input type="number" value={l.duration_seconds || ''} onChange={(e) => updateLog(l.id, { duration_seconds: parseInt(e.target.value) || 0 })} placeholder="0s" />
                                                </div>

                                                <button className={`status-chk ${l.is_completed ? 'done' : ''}`} onClick={() => updateLog(l.id, { is_completed: !l.is_completed })}>
                                                    <CheckCircle2 size={20} />
                                                </button>
                                            </div>
                                            <div className="log-footer">
                                                {lastStats[l.exercise_id] && (
                                                    <span className="prev-best"><HistoryIcon size={10} /> Prev Best: {lastStats[l.exercise_id].reps}r {lastStats[l.exercise_id].duration ? `/ ${lastStats[l.exercise_id].duration}s` : ''}</span>
                                                )}
                                                <button className="add-set-btn-v7" onClick={() => addSet(l)}>+ Append Set</button>
                                            </div>
                                        </div>
                                    ))}

                                    <button className="add-ex-btn-v11 glass-card" onClick={() => setShowExercisePicker(currentBlock.id)}>
                                        <Plus size={20} className="icon-gold" />
                                        <span>Initialize New Pattern</span>
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {showExercisePicker && (
                <div className="modal-overlay">
                    <div className="glass-card picker-modal royal-modal scrollable">
                        <div className="modal-head">
                            <h3>Exercise Archetypes</h3>
                            <button onClick={() => setShowExercisePicker(null)}><XCircle /></button>
                        </div>
                        <div className="picker-list">
                            {exercises.filter(e => {
                                if (session.type === 'Push') return e.family.startsWith('Push') || e.family === 'Skill';
                                if (session.type === 'Pull') return e.family.startsWith('Pull') || e.family === 'Skill';
                                return true;
                            }).map(e => (
                                <button key={e.id} className="picker-item glass-card" onClick={() => addExerciseToBlock(e.id, showExercisePicker)}>
                                    <div className="p-icon"><Zap size={16} /></div>
                                    <div className="p-info">
                                        <p className="p-name">{e.name}</p>
                                        <p className="p-fam">{e.family} • Mastery {e.difficulty}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
