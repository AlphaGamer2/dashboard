'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Clock, Save } from 'lucide-react';

export default function DailyTimeLogger() {
    const [time, setTime] = useState<number>(0);
    const [suggestedTime, setSuggestedTime] = useState<number>(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTodayData();
    }, []);

    async function fetchTodayData() {
        const today = new Date().toISOString().split('T')[0];

        // Fetch manual log
        const { data: log } = await supabase
            .from('daily_logs')
            .select('total_study_time')
            .eq('date', today)
            .single();

        if (log) setTime(log.total_study_time);

        // Fetch tracking logs to suggest time
        const { data: trackers } = await supabase
            .from('tracking_logs')
            .select('time_taken')
            .eq('date', today);

        const sum = trackers?.reduce((acc, curr) => acc + curr.time_taken, 0) || 0;
        setSuggestedTime(sum);

        // Auto-update if manual is less than sum
        if (sum > (log?.total_study_time || 0)) {
            handleSave(sum);
        }
    }

    async function handleSave(newTime: number = time) {
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];

        const { error } = await supabase
            .from('daily_logs')
            .upsert({ date: today, total_study_time: Math.max(newTime, suggestedTime) });

        if (!error) setTime(Math.max(newTime, suggestedTime));
        setLoading(false);
    }

    return (
        <div className="glass-card logger-card">
            <div className="logger-header">
                <Clock className="icon" />
                <h3>Daily Study Time</h3>
            </div>

            <div className="logger-body">
                <input
                    type="number"
                    value={time}
                    onChange={(e) => setTime(parseInt(e.target.value) || 0)}
                    placeholder="Minutes"
                />
                <span>min</span>

                <button
                    onClick={() => handleSave()}
                    disabled={loading}
                    className="glow-btn"
                >
                    <Save size={16} />
                    {loading ? 'Saving...' : 'Save'}
                </button>
            </div>

            {suggestedTime > 0 && (
                <p className="suggested-text">
                    Suggested based on Lectures/DPPs: <strong>{suggestedTime} min</strong>
                </p>
            )}
        </div>
    );
}
