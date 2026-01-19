"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SafetyScorePage() {
    const [scoreData, setScoreData] = useState<any>(null);
    const [trendData, setTrendData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [scoresRes, trendRes] = await Promise.all([
                api.get('/analytics/safety-scores'),
                api.get('/analytics/safety-scores/trend?months=12')
            ]);

            setScoreData(scoresRes.data);
            setTrendData(trendRes.data.trend.map((t: any) => ({
                name: `${t.month}/${t.year}`,
                score: t.score
            })));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number | null) => {
        if (score === null) return 'text-slate-400';
        if (score >= 80) return 'text-green-600';
        if (score >= 50) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getStatusBadge = (status: string) => {
        const colors: any = {
            'Good': 'bg-green-100 text-green-700 border-green-200',
            'Medium': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'High Risk': 'bg-red-100 text-red-700 border-red-200',
            'No Data': 'bg-slate-100 text-slate-500 border-slate-200'
        };
        return colors[status] || colors['No Data'];
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Safety Score Analytics</h2>
                <p className="text-sm text-slate-500">Performance-based safety scoring across all projects</p>
            </div>

            {/* Overall Average KPI */}
            <div className="bg-gradient-to-br from-[#0059b2] to-blue-700 p-8 rounded-xl shadow-lg text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium opacity-90 mb-1">Overall Average Safety Score</p>
                        <p className="text-5xl font-bold">{scoreData?.overall_average || 0}</p>
                        <p className="text-xs opacity-75 mt-2">Based on all active projects</p>
                    </div>
                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-5xl">shield</span>
                    </div>
                </div>
            </div>

            {/* Trend Chart */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-6">12-Month Safety Score Trend</h4>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                            <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="score" stroke="#0059b2" strokeWidth={3} dot={{ r: 5 }} name="Safety Score" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Project Scores Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-zinc-800">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">Project Safety Scores</h4>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-800">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Rank</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Project</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Score</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                        {scoreData?.projects.map((project: any) => (
                            <tr key={project.project_id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    {project.rank && (
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${project.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                                                project.rank === 2 ? 'bg-slate-200 text-slate-700' :
                                                    project.rank === 3 ? 'bg-orange-100 text-orange-700' :
                                                        'bg-slate-100 text-slate-500'
                                            }`}>
                                            {project.rank}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <p className="font-bold text-sm text-slate-900 dark:text-white">{project.project_name}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <p className={`text-3xl font-bold ${getScoreColor(project.score)}`}>
                                        {project.score !== null ? project.score : 'N/A'}
                                    </p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(project.status)}`}>
                                        {project.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Formula Reference */}
            <div className="bg-slate-50 dark:bg-zinc-800/50 p-6 rounded-xl border border-slate-200 dark:border-zinc-800">
                <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Scoring Formula</h4>
                <div className="text-xs font-mono text-slate-600 dark:text-slate-300 space-y-1">
                    <p>Score = 100</p>
                    <p className="text-red-600">- (First Aid Cases × 2)</p>
                    <p className="text-red-600">- (Near Miss Cases × 3)</p>
                    <p className="text-red-600">- (PTW Open × 1)</p>
                    <p className="text-green-600">+ (Training Sessions × 2)</p>
                    <p className="text-green-600">+ (TBT Sessions × 1)</p>
                    <p className="mt-2 text-slate-500">Range: 0-100 | Good: 80-100 | Medium: 50-79 | High Risk: &lt;50</p>
                </div>
            </div>
        </div>
    );
}
