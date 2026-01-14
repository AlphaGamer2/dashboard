import { Dumbbell, TrendingUp, Activity } from 'lucide-react';

export default function Fitness() {
    return (
        <div className="fitness-page">
            <header className="page-header">
                <h1>Fitness Tracker <span className="text-muted">/ Volume</span></h1>
                <p className="text-muted">Track your workouts and physical progress.</p>
            </header>

            <div className="glass-card placeholder-card">
                <Dumbbell size={64} className="icon-muted" />
                <h2>Workout Tracker Coming Soon</h2>
                <p>This module will feature progress logs and volume tracking.</p>

                <div className="stats-grid">
                    <div className="glass-card stat-item">
                        <Activity className="icon" />
                        <p className="label">Total Volume</p>
                        <p className="value">0 kg</p>
                    </div>
                    <div className="glass-card stat-item">
                        <TrendingUp className="icon" />
                        <p className="label">PRs Set</p>
                        <p className="value">0</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
