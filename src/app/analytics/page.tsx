'use client';

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export default function Analytics() {
    const [timeData, setTimeData] = useState<any[]>([]);
    const [subjectData, setSubjectData] = useState<any[]>([]);

    useEffect(() => {
        // Mock data for demo since real data might be empty
        setTimeData([
            { name: 'Mon', hours: 4 },
            { name: 'Tue', hours: 6 },
            { name: 'Wed', hours: 5.5 },
            { name: 'Thu', hours: 8 },
            { name: 'Fri', hours: 7 },
            { name: 'Sat', hours: 9 },
            { name: 'Sun', hours: 4 },
        ]);

        setSubjectData([
            { name: 'Physics', value: 400 },
            { name: 'Math', value: 300 },
            { name: 'P-Chem', value: 200 },
            { name: 'O-Chem', value: 150 },
            { name: 'I-Chem', value: 100 },
        ]);
    }, []);

    return (
        <div className="analytics-page">
            <header className="page-header">
                <h1>Analytics <span className="text-muted">/ Performance</span></h1>
                <p className="text-muted">Visualizing your study patterns and progress.</p>
            </header>

            <div className="analytics-grid">
                <div className="glass-card chart-container">
                    <h3>Study Hours (Last 7 Days)</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <LineChart data={timeData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{ background: '#1e2947', border: 'none', borderRadius: '8px' }}
                                    itemStyle={{ color: '#f8fafc' }}
                                />
                                <Line type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card chart-container">
                    <h3>Questions by Subject</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={subjectData}
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {subjectData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: '#1e2947', border: 'none', borderRadius: '8px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card chart-container full-width">
                    <h3>Syllabus Completion %</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={subjectData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{ background: '#1e2947', border: 'none', borderRadius: '8px' }}
                                />
                                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
