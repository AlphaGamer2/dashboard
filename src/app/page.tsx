import DailyTimeLogger from '@/components/DailyTimeLogger';
import { BookOpen, Target, Flame } from 'lucide-react';

export default function Home() {
  return (
    <div className="dashboard-home">
      <header className="page-header">
        <h1>Welcome back, <span className="highlight">JEE Warrior</span></h1>
        <p className="text-muted">Keep pushing. Consistency is key.</p>
      </header>

      <div className="dashboard-grid">
        <DailyTimeLogger />

        <div className="glass-card status-card">
          <div className="status-item">
            <Flame className="icon-orange" />
            <div>
              <p className="label">Daily Streak</p>
              <p className="value">0 Days</p>
            </div>
          </div>
          <div className="status-item">
            <Target className="icon-green" />
            <div>
              <p className="label">Topics to Go</p>
              <p className="value">Syllabus Loaded</p>
            </div>
          </div>
        </div>
      </div>

      <section className="quick-stats">
        <h2>Weekly Overview</h2>
        <div className="stats-grid">
          <div className="glass-card stat-item">
            <p className="label">Hours Studied</p>
            <p className="valueLarge">0.0</p>
          </div>
          <div className="glass-card stat-item">
            <p className="label">Questions Solved</p>
            <p className="valueLarge">0</p>
          </div>
          <div className="glass-card stat-item">
            <p className="label">Overall Progress</p>
            <p className="valueLarge">0%</p>
          </div>
        </div>
      </section>
    </div>
  );
}
