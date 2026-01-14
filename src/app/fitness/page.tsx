'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Dumbbell, TrendingUp, Activity, Play,
    RotateCcw, History, Plus, Brain,
    Timer, Calendar, ChevronRight,
    AlertCircle, CheckCircle2, Flame, User,
    Target, Award, Zap, Compass, Info, Trash2,
    ShieldCheck, LayoutGrid, ListFilter, ClipboardList, Loader2
} from 'lucide-react';
import FitnessLogger from '@/components/FitnessLogger';
import '../fitness.css';

export default function Fitness() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [activeSession, setActiveSession] = useState<any | null>(null);
    const [goals, setGoals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastSessionType, setLastSessionType] = useState<string | null>(null);
    const [showStartModal, setShowStartModal] = useState(false);
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [bodyWeight, setBodyWeight] = useState<string>('');
    const [dbError, setDbError] = useState<string | null>(null);
    const [fitnessStreak, setFitnessStreak] = useState<number>(0);

    // Goal Form
    const [newGoal, setNewGoal] = useState({
        name: '', type: 'Main', category: 'Push', sub_category: 'Horizontal', target_value: '', deadline: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        setDbError(null);
        try {
            const { data: sData, error: sErr } = await supabase
                .from('fitness_sessions')
                .select('*')
                .order('date', { ascending: false })
                .order('created_at', { ascending: false })
                .limit(10);

            if (sErr) throw sErr;

            const { data: gData, error: gErr } = await supabase
                .from('fitness_goals')
                .select('*')
                .eq('is_achieved', false);

            if (gErr) throw gErr;

            setSessions(sData || []);
            const active = sData?.find(s => !s.is_completed);
            setActiveSession(active || null);
            setGoals(gData || []);

            if (sData && sData.length > 0) {
                setLastSessionType(sData[0].type);
            }

            // Calculate Fitness Streak (30min+ OR Sunday)
            let streak = 0;
            const today = new Date();
            for (let i = 0; i < 30; i++) {
                const d = new Date(); d.setDate(today.getDate() - i);
                const dStr = d.toISOString().split('T')[0];
                const isSunday = d.getDay() === 0;
                const session = sData?.find(s => s.date === dStr);
                const duration = session?.start_time && session?.end_time
                    ? (new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) / 60000
                    : 0;
                if (isSunday || duration >= 30) streak++;
                else break;
            }
            setFitnessStreak(streak);
        } catch (err: any) {
            console.error(err);
            if (err.code === 'PGRST116' || err.message?.includes('not found') || err.message?.includes('does not exist')) {
                setDbError("Database Schema Mismatch. The fitness tables are missing.");
            } else {
                setDbError(err.message || "Database connection error.");
            }
        }
        setLoading(false);
    }

    async function startSession(type: string) {
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];
        try {
            const { data, error } = await supabase
                .from('fitness_sessions')
                .insert({
                    date: today,
                    type,
                    start_time: new Date().toISOString(),
                    body_weight: parseFloat(bodyWeight) || 0,
                    is_completed: false
                })
                .select()
                .single();

            if (error) throw error;
            if (data) {
                const blocks = [
                    { session_id: data.id, block_type: 'Warmup' },
                    { session_id: data.id, block_type: 'Main' },
                    { session_id: data.id, block_type: 'Accessory' },
                    { session_id: data.id, block_type: 'Skill' }
                ];
                const { error: bErr } = await supabase.from('fitness_blocks').insert(blocks);
                if (bErr) throw bErr;

                setShowStartModal(false);
                await fetchData();
            }
        } catch (err: any) {
            console.error("Initialization Error:", err);
            setDbError("Critical Failure: Could not initialize squadron blocks.");
        }
        setLoading(false);
    }

    async function createGoal() {
        if (!newGoal.name || !newGoal.target_value) return;
        const { error } = await supabase.from('fitness_goals').insert({
            ...newGoal,
            target_value: parseFloat(newGoal.target_value),
            current_value: 0
        });
        if (!error) {
            setShowGoalModal(false);
            setNewGoal({ name: '', type: 'Main', category: 'Push', sub_category: 'Horizontal', target_value: '', deadline: '' });
            fetchData();
        }
    }

    async function deleteGoal(id: string) {
        await supabase.from('fitness_goals').delete().eq('id', id);
        fetchData();
    }

    const isSunday = new Date().getDay() === 0;

    const getAvailableTypes = () => {
        if (!lastSessionType || lastSessionType === 'Rest') return ['Push', 'Pull', 'Rest'];
        if (lastSessionType === 'Push') return ['Pull', 'Rest'];
        if (lastSessionType === 'Pull') return ['Push', 'Rest'];
        return ['Push', 'Pull', 'Rest'];
    };

    if (loading) return (
        <div className="loading-v7 luxury-navy">
            <div className="loader-royal"><Dumbbell className="animate-bounce icon-gold" size={64} /></div>
            <p className="platinum-text">Calibrating Symmetry Matrix...</p>
        </div>
    );

    return (
        <div className="fitness-page v11 luxury-navy">
            {dbError && (
                <div className="error-banner">
                    <strong>SYNC REQUIRED</strong>
                    <p>{dbError}</p>
                    <p className="mt-4">Please copy and run the entire <code>consolidated_fitness_v8.sql</code> script in your <strong>Supabase SQL Editor</strong> to initialize the system.</p>
                    <button className="glow-btn gold-btn mt-4" onClick={fetchData}>I have run the script</button>
                </div>
            )}

            {/* 🚀 V11 Header: Symmetry Matrix */}
            <header className="page-header-v10">
                <div className="hero-branding">
                    <h1 className="h1-royal">Symmetry <span className="highlight-gold">Matrix</span></h1>
                    <p className="p-luxury">Elite calisthenics tracking & skill progression suite.</p>
                </div>
                {!activeSession && (
                    <div className="hero-actions-v11">
                        <button className="v10-recap-btn secondary mr-3" onClick={() => setShowGoalModal(true)}>
                            <Target size={18} /> Define Objective
                        </button>
                        <button className="v10-recap-btn" onClick={() => setShowStartModal(true)}>
                            <Play size={18} fill="currentColor" /> Initialize Session
                        </button>
                    </div>
                )}
            </header>

            {activeSession ? (
                <FitnessLogger session={activeSession} onComplete={fetchData} />
            ) : (
                <div className="analytics-grid-v10">

                    {/* Goal Command Center - Span 2 */}
                    <div className="glass-card chart-card span-2">
                        <div className="chart-info">
                            <Compass className="icon-gold" size={20} />
                            <h3>Mastery Objectives</h3>
                        </div>
                        <div className="goals-matrix-v11">
                            {goals.length === 0 && <p className="text-muted italic">No active objectives detected. Define your path.</p>}
                            {goals.map(g => (
                                <div key={g.id} className="goal-strip glass-card">
                                    <div className="g-top">
                                        <div className="g-meta">
                                            <span className={`g-tag ${g.type.toLowerCase()}`}>{g.type}</span>
                                            <span className="g-plane">{g.category} • {g.sub_category}</span>
                                        </div>
                                        <button className="del-btn" onClick={() => deleteGoal(g.id)}><Trash2 size={14} /></button>
                                    </div>
                                    <div className="g-body">
                                        <h4>{g.name}</h4>
                                        <div className="g-bar-box">
                                            <div className="b-info">
                                                <span>{Math.round((g.current_value / g.target_value) * 100)}% to {g.target_value}{g.type === 'Mini' ? 'r' : 's'}</span>
                                            </div>
                                            <div className="b-track"><div className="b-fill" style={{ width: `${Math.min(100, (g.current_value / g.target_value) * 100)}%` }}></div></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stats & Status */}
                    <div className="glass-card chart-card">
                        <div className="chart-info"><Activity className="icon-blue" size={20} /> <h3>System Status</h3></div>
                        <div className="system-grid-v11">
                            <div className="s-box">
                                <span className="s-lab">Fitness Streak</span>
                                <span className="s-val highlight-gold">{fitnessStreak} Days</span>
                            </div>
                            <div className="s-box">
                                <span className="s-lab">Ready for</span>
                                <span className="s-val highlight-gold">{isSunday ? 'Rest Day' : getAvailableTypes().join(' / ')}</span>
                            </div>
                            <div className="s-box">
                                <span className="s-lab">Last Weight</span>
                                <span className="s-val">{sessions[0]?.body_weight || '--'} kg</span>
                            </div>
                            <div className="s-box">
                                <span className="s-lab">Completed</span>
                                <span className="s-val">{sessions.filter(s => s.is_completed).length} Logs</span>
                            </div>
                        </div>
                        <button className="v10-recap-btn secondary mt-auto" onClick={() => fetchData()}><RotateCcw size={16} /> Refresh Grid</button>
                    </div>

                    {/* Training History - Span 3 */}
                    <div className="glass-card chart-card span-3">
                        <div className="chart-info"><HistoryIcon className="text-muted" size={20} /> <h3>Training Archive</h3></div>
                        <div className="history-matrix-v11">
                            {sessions.map(s => (
                                <div key={s.id} className="h-row glass-card">
                                    <div className="h-date-box">
                                        <Calendar size={14} className="icon-gold" />
                                        <span>{s.date}</span>
                                    </div>
                                    <div className="h-type-box">
                                        <span className={`h-type ${s.type.toLowerCase()}`}>{s.type}</span>
                                        <span className="h-weight">{s.body_weight}kg</span>
                                    </div>
                                    <div className="h-status">
                                        {s.is_completed ? <CheckCircle2 size={16} className="text-green" /> : <Loader2 size={16} className="animate-spin text-blue" />}
                                    </div>
                                    <button className="h-view-btn" onClick={() => setActiveSession(s)}><ChevronRight size={16} /></button>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            )}

            {/* Modals - Polished V11 */}
            {showStartModal && (
                <div className="modal-overlay">
                    <div className="glass-card royal-modal v11-modal">
                        <h2 className="h1-royal small">Select <span className="highlight-gold">Archetype</span></h2>
                        <div className="input-field mt-8">
                            <label>Current Mass (kg)</label>
                            <input type="number" value={bodyWeight} onChange={(e) => setBodyWeight(e.target.value)} placeholder="0.0" className="v11-input" />
                        </div>
                        <div className="type-selection-v11">
                            <p className="label">Available Training Protocols</p>
                            <div className="protocol-grid">
                                {getAvailableTypes().map(t => (
                                    <button key={t} className={`protocol-btn ${t.toLowerCase()}`} onClick={() => startSession(t)}>
                                        <Zap size={16} /> {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button className="close-btn-v11" onClick={() => setShowStartModal(false)}>Bypass</button>
                    </div>
                </div>
            )}

            {showGoalModal && (
                <div className="modal-overlay">
                    <div className="glass-card royal-modal v11-modal wide">
                        <h2 className="h1-royal small">Define <span className="highlight-gold">Objective</span></h2>
                        <div className="v11-form-grid">
                            <div className="input-field full">
                                <label>Codename (Skill)</label>
                                <input type="text" value={newGoal.name} onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })} placeholder="e.g. Imperial Planche" />
                            </div>
                            <div className="input-field">
                                <label>Vector</label>
                                <select value={newGoal.category} onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })} className="v11-input">
                                    <option value="Push">Push</option><option value="Pull">Pull</option><option value="Balance">Balance</option>
                                </select>
                            </div>
                            <div className="input-field">
                                <label>Domain</label>
                                <select value={newGoal.type} onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value })} className="v11-input">
                                    <option value="Main">Main (Skill)</option><option value="Mini">Mini (Reps)</option>
                                </select>
                            </div>
                            <div className="input-field">
                                <label>Plane</label>
                                <select value={newGoal.sub_category} onChange={(e) => setNewGoal({ ...newGoal, sub_category: e.target.value })} className="v11-input">
                                    <option value="Horizontal">Horizontal</option><option value="Vertical">Vertical</option><option value="Static">Static</option>
                                </select>
                            </div>
                            <div className="input-field">
                                <label>Target ({newGoal.type === 'Main' ? 's' : 'r'})</label>
                                <input type="number" value={newGoal.target_value} onChange={(e) => setNewGoal({ ...newGoal, target_value: e.target.value })} className="v11-input" />
                            </div>
                        </div>
                        <button className="v10-recap-btn mt-8" onClick={createGoal}>Establish Directive</button>
                        <button className="close-btn-v11 mt-4" onClick={() => setShowGoalModal(false)}>Dismiss</button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Internal History Icon Conflict Fix
function HistoryIcon(props: any) {
    return <History {...props} />;
}
