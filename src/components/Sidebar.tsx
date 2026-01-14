'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    BookOpen,
    BarChart2,
    Dumbbell,
    Settings,
    Atom,
    Binary,
    FlaskConical,
    Beaker,
    Zap
} from 'lucide-react';

const subjects = [
    { name: 'Physics', icon: Zap, href: '/subjects/physics' },
    { name: 'Math', icon: Binary, href: '/subjects/math' },
    { name: 'Physical Chemistry', icon: FlaskConical, href: '/subjects/physical-chemistry' },
    { name: 'Inorganic Chemistry', icon: Beaker, href: '/subjects/inorganic-chemistry' },
    { name: 'Organic Chemistry', icon: Atom, href: '/subjects/organic-chemistry' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="sidebar glass-card">
            <div className="sidebar-logo">
                <BookOpen className="logo-icon" />
                <span>JEE DASH</span>
            </div>

            <nav className="sidebar-nav">
                <Link
                    href="/"
                    className={`nav-item ${pathname === '/' ? 'active' : ''}`}
                >
                    <Home size={20} />
                    <span>Overview</span>
                </Link>

                <div className="nav-section">
                    <p className="nav-section-title">Subjects</p>
                    {subjects.map((s) => (
                        <Link
                            key={s.href}
                            href={s.href}
                            className={`nav-item ${pathname.startsWith(s.href) ? 'active' : ''}`}
                        >
                            <s.icon size={18} />
                            <span>{s.name}</span>
                        </Link>
                    ))}
                </div>

                <div className="nav-section">
                    <p className="nav-section-title">Other</p>
                    <Link
                        href="/analytics"
                        className={`nav-item ${pathname === '/analytics' ? 'active' : ''}`}
                    >
                        <BarChart2 size={20} />
                        <span>Analytics</span>
                    </Link>
                    <Link
                        href="/fitness"
                        className={`nav-item ${pathname === '/fitness' ? 'active' : ''}`}
                    >
                        <Dumbbell size={20} />
                        <span>Fitness</span>
                    </Link>
                </div>
            </nav>

            <div className="sidebar-footer">
                <Link href="/settings" className="nav-item">
                    <Settings size={20} />
                    <span>Settings</span>
                </Link>
            </div>
        </div>
    );
}
