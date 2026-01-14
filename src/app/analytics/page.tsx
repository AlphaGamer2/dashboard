'use client';

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart,
    ScatterChart, Scatter, ZAxis, ReferenceLine
} from 'recharts';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import {
    BookOpen, Clock, Target, Award, RotateCcw,
    Dumbbell, TrendingUp, Calendar, Zap, Brain, Loader2,
    CheckCheck, ClipboardCheck, History, Flame, Star, Trophy, ClipboardList,
    Compass, Activity, BarChart3, Sparkles, LineChart as LineChartIcon, Timer,
    AlertTriangle, ChevronRight, TrendingDown, Layers, Map, Zap as ZapIcon,
    ShieldCheck, LayoutGrid, ListFilter
} from 'lucide-react';
import '../fitness.css';

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function Analytics() {
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState<'academic' | 'fitness'>('academic');

    // High-Density Data States
    const [academicTrend, setAcademicTrend] = useState<any[]>([]);
    const [subjectMatrix, setSubjectMatrix] = useState<any[]>([]);
    const [chapterMastery, setChapterMastery] = useState<any[]>([]);
    const [fitnessMix, setFitnessMix] = useState<any[]>([]);
    const [volumeTimeline, setVolumeTimeline] = useState<any[]>([]);
    const [performanceHero, setPerformanceHero] = useState({
        points: 0,
        streak: 0,
        avgStudy: 0,
        avgQs: 0,
        totalQs: 0
    });

    useEffect(() => {
        fetchComprehensiveData();
    }, []);

    async function fetchComprehensiveData() {
        setLoading(true);

        // 1. Data Fetching
        const [
            { data: dailyLogs },
            { data: trackLogs },
            { data: chapters },
            { data: questions },
            { data: sessions }
        ] = await Promise.all([
            supabase.from('daily_logs').select('*').order('date', { ascending: true }),
            supabase.from('tracking_logs').select('*').eq('status', true),
            supabase.from('chapters').select('*, subjects(name)'),
            supabase.from('book_questions').select('*'),
            supabase.from('fitness_sessions').select('*, fitness_blocks(*, fitness_logs(*, fitness_exercises(*)))').order('date', { ascending: true })
        ]);

        // 2. Academic Metrics & Streaks
        // Academic Streak: 3h threshold
        let academicStreak = 0;
        const reversedLogs = [...(dailyLogs || [])].reverse();
        for (const log of reversedLogs) {
            if (log.total_study_time >= 180) academicStreak++;
            else break;
        }

        // 3. Fitness Streak: 30m threshold or Sunday
        let fitnessStreak = 0;
        const today = new Date();
        const thirtyDays = Array.from({ length: 30 }, (_, i) => {
            const d = new Date(); d.setDate(today.getDate() - i);
            return d.toISOString().split('T')[0];
        });

        for (const dateStr of thirtyDays) {
            const dayOfWeek = new Date(dateStr).getDay();
            const sessionForDay = sessions?.find(s => s.date === dateStr);
            const duration = sessionForDay?.start_time && sessionForDay?.end_time
                ? (new Date(sessionForDay.end_time).getTime() - new Date(sessionForDay.start_time).getTime()) / 60000
                : 0;

            if (dayOfWeek === 0 || duration >= 30) fitnessStreak++;
            else break;
        }

        const totalStudyMins = dailyLogs?.reduce((acc, l) => acc + l.total_study_time, 0) || 0;
        const avgStudy = Math.round((totalStudyMins / (dailyLogs?.length || 1)) / 60 * 10) / 10;
        const totalQs = questions?.reduce((acc, q) => acc + q.count, 0) || 0;
        const avgQs = Math.round(totalQs / (dailyLogs?.length || 1));

        // 4. Subject Strategy Analyzer (Time vs Questions)
        const subjStats: Record<string, { time: number, qs: number }> = {};
        dailyLogs?.forEach(l => {
            // This is a simplified mapping; usually we'd need study_sessions by subject
            // For now, we'll aggregate questions and estimate time weight
        });

        const subjQs: Record<string, number> = {};
        questions?.forEach(q => {
            const ch = chapters?.find(c => c.id === q.chapter_id);
            if (ch) {
                const sName = (ch.subjects as any).name;
                subjQs[sName] = (subjQs[sName] || 0) + q.count;
            }
        });

        // 5. Hybrid Mastery (70% Questions, 30% Theory)
        const masteryData = chapters?.map(ch => {
            const chQs = questions?.filter(q => q.chapter_id === ch.id) || [];
            const chTrack = trackLogs?.filter(t => t.chapter_id === ch.id) || [];

            const hard = chQs.filter(q => q.level_name.toLowerCase().includes('hard') || q.level_name.toLowerCase().includes('level 3')).reduce((acc, q) => acc + q.count, 0);
            const med = chQs.filter(q => q.level_name.toLowerCase().includes('med') || q.level_name.toLowerCase().includes('level 2')).reduce((acc, q) => acc + q.count, 0);
            const easy = chQs.filter(q => q.level_name.toLowerCase().includes('easy') || q.level_name.toLowerCase().includes('level 1')).reduce((acc, q) => acc + q.count, 0);

            const qScore = (hard * 2.5 + med * 1.0 + easy * 0.4);
            const qPerc = Math.min(70, (qScore / 100) * 70);
            const totalLec = ch.total_lectures || 1;
            const doneLec = chTrack.filter(t => t.type === 'lecture').length;
            const theoryPerc = Math.min(30, (doneLec / totalLec) * 30);
            const finalPerc = Math.round(qPerc + theoryPerc);

            return { name: ch.name, subject: (ch.subjects as any).name, percentage: finalPerc };
        }).sort((a, b) => b.percentage - a.percentage).slice(0, 10) || [];
        setChapterMastery(masteryData);

        setPerformanceHero({
            points: Math.round(totalQs * 0.5 + academicStreak * 100),
            streak: activeView === 'academic' ? academicStreak : fitnessStreak,
            avgStudy,
            avgQs,
            totalQs
        });

        // Subject Strategy (Time weight vs Qs)
        const strat: Record<string, { time: number, qs: number }> = {};
        trackLogs?.forEach(t => {
            const ch = chapters?.find(c => c.id === t.chapter_id);
            if (ch) {
                const sName = (ch.subjects as any).name;
                if (!strat[sName]) strat[sName] = { time: 0, qs: 0 };
                strat[sName].time += (t.time_taken || 0);
            }
        });
        questions?.forEach(q => {
            const ch = chapters?.find(c => c.id === q.chapter_id);
            if (ch) {
                const sName = (ch.subjects as any).name;
                if (!strat[sName]) strat[sName] = { time: 0, qs: 0 };
                strat[sName].qs += q.count;
            }
        });
        setSubjectMatrix(Object.keys(strat).map(s => ({
            subject: s,
            time: Math.round(strat[s].time / 60 * 10) / 10,
            qs: strat[s].qs
        })));

        setAcademicTrend(dailyLogs?.slice(-14).map(l => ({
            date: l.date.split('-').slice(1).join('/'),
            study: (l.total_study_time / 60).toFixed(1),
            qs: questions?.filter(q => q.date === l.date).reduce((acc, q) => acc + q.count, 0) || 0
        })) || []);

        // 6. Fitness Mix & Timeline
        let push = 0; let pull = 0; let bal = 0;
        const fVolTimeline: any[] = [];
        sessions?.forEach(s => {
            let sVol = 0;
            s.fitness_blocks?.forEach((b: any) => {
                b.fitness_logs?.forEach((l: any) => {
                    const val = (l.reps || 1) + (l.duration_seconds || 0);
                    if (l.fitness_exercises.base_type === 'Push') push += val;
                    else if (l.fitness_exercises.base_type === 'Pull') pull += val;
                    else bal += val;
                    sVol += val;
                });
            });
            fVolTimeline.push({ date: s.date.split('-').slice(1).join('/'), volume: sVol });
        });
        setFitnessMix([{ name: 'Push', value: push }, { name: 'Pull', value: pull }, { name: 'Balance', value: bal }]);
        setVolumeTimeline(fVolTimeline.slice(-14));

        setLoading(false);
    }

    if (loading) return (
        <div className="loading-v7 luxury-navy">
            <div className="loader-royal"><Sparkles className="animate-pulse icon-gold" size={64} /></div>
            <p className="platinum-text">Parsing High-Resolution Metrics...</p>
        </div>
    );

    return (
        <div className="analytics-page v11 luxury-navy">
            {/* 🚀 V11 Segregated Header */}
            <header className="page-header-v11">
                <div className="hero-branding">
                    <h1 className="h1-royal">Neural <span className="highlight-gold">Matrix</span></h1>
                    <p className="p-luxury">Dual-domain performance analysis and mastery tracking.</p>
                </div>

                <div className="view-toggle-v11">
                    <button className={`toggle-btn ${activeView === 'academic' ? 'active' : ''}`} onClick={() => setActiveView('academic')}>
                        <Brain size={16} /> Academic Lab
                    </button>
                    <button className={`toggle-btn ${activeView === 'fitness' ? 'active' : ''}`} onClick={() => setActiveView('fitness')}>
                        <Dumbbell size={16} /> Cali Cockpit
                    </button>
                </div>
            </header>

            {/* 📊 High-Density Metric Bar */}
            <div className="metric-shelf-v11">
                <div className="m-card luxury">
                    <span className="m-label">Study Streak (&gt;3h)</span>
                    <span className="m-val">{performanceHero.streak} Days</span>
                    <div className="m-bar"><div className="fill gold" style={{ width: `${Math.min(100, performanceHero.streak * 10)}%` }}></div></div>
                </div>
                <div className="m-card luxury">
                    <span className="m-label">Avg Daily Study</span>
                    <span className="m-val">{performanceHero.avgStudy} Hours</span>
                </div>
                <div className="m-card luxury">
                    <span className="m-label">Avg Questions Solved</span>
                    <span className="m-val">{performanceHero.avgQs} Qs</span>
                </div>
                <div className="m-card luxury">
                    <span className="m-label">Global Mastery</span>
                    <span className="m-val">{performanceHero.points} Pts</span>
                </div>
            </div>

            {activeView === 'academic' ? (
                <div className="analytics-content-v11 anim-fade-in">
                    <div className="grid-v11">
                        <div className="glass-card chart-card span-2">
                            <div className="chart-info"><Clock size={18} className="icon-blue" /> <h3>Focus Velocity: Study vs. Questions</h3></div>
                            <ResponsiveContainer width="100%" height={240}>
                                <ComposedChart data={academicTrend}>
                                    <defs><linearGradient id="v11Study" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient></defs>
                                    <XAxis dataKey="date" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                                    <YAxis yAxisId="left" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ background: '#0a0f1e', border: 'none', borderRadius: '12px' }} />
                                    <Area yAxisId="left" type="monotone" dataKey="study" stroke="#3b82f6" strokeWidth={3} fill="url(#v11Study)" />
                                    <Bar yAxisId="right" dataKey="qs" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={20} />
                                    <ReferenceLine yAxisId="left" y={3} stroke="#ef4444" strokeDasharray="3 3" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="glass-card chart-card">
                            <div className="chart-info"><ShieldCheck size={18} className="icon-gold" /> <h3>Top Chapter Mastery</h3></div>
                            <div className="mastery-list-v11">
                                {chapterMastery.map((ch, i) => (
                                    <div key={i} className="m-item">
                                        <div className="i-head"><span>{ch.name}</span><span>{ch.percentage}%</span></div>
                                        <div className="i-track"><div className="i-fill" style={{ width: `${ch.percentage}%`, background: COLORS[i % COLORS.length] }}></div></div>
                                        <span className="i-sub">{ch.subject}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-card chart-card span-3">
                            <div className="chart-info"><LayoutGrid size={18} className="text-muted" /> <h3>Subject Strategy Analyzer: Time vs Questions</h3></div>
                            <p className="chart-subtext pl-8">Compare your time investment (hours) against question practice volume per subject.</p>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={subjectMatrix}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="subject" stroke="#64748b" fontSize={11} />
                                    <YAxis yAxisId="left" stroke="#64748b" fontSize={10} label={{ value: 'Hours', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={10} label={{ value: 'Questions', angle: 90, position: 'insideRight', fontSize: 10, fill: '#64748b' }} />
                                    <Tooltip contentStyle={{ background: '#0a0f1e', border: 'none', borderRadius: '12px' }} />
                                    <Bar yAxisId="left" dataKey="time" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} name="Time (hrs)" />
                                    <Bar yAxisId="right" dataKey="qs" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={30} name="Questions" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="analytics-content-v11 anim-fade-in fitness-mode">
                    <div className="grid-v11">
                        <div className="glass-card chart-card span-2">
                            <div className="chart-info"><Flame size={18} className="icon-orange" /> <h3>Volume Momentum Tracker</h3></div>
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={volumeTimeline}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                                    <YAxis stroke="#64748b" fontSize={10} />
                                    <Tooltip contentStyle={{ background: '#0a0f1e', border: 'none' }} />
                                    <Bar dataKey="volume" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="glass-card chart-card">
                            <div className="chart-info"><Target size={18} className="icon-gold" /> <h3>Structural Distribution</h3></div>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={fitnessMix} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {fitnessMix.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="v11-mini-legend">
                                {fitnessMix.map((f, i) => <div key={i} className="li"><div className="dot" style={{ background: COLORS[i % COLORS.length] }}></div> {f.name}</div>)}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
