"use client";

import { useEffect, useState, use } from 'react';
import api from '@/lib/api';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import Link from 'next/link';

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [project, setProject] = useState<any>(null);
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch project details
                const projectRes = await api.get(`/projects/${id}`);
                setProject(projectRes.data);

                // Fetch reports for this project
                // Ideally backend supports filtering by project_id, if not we filter client side
                const reportsRes = await api.get('/reports');
                const projectReports = reportsRes.data.filter((r: any) => r.project_id === parseInt(id));
                setReports(projectReports);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const chartData = reports.map(report => ({
        name: `${new Date(0, report.report_month - 1).toLocaleString('default', { month: 'short' })} ${report.report_year}`,
        tbt: report.tbt_sessions,
        incidents: report.first_aid_cases + report.near_miss_cases,
        training: report.training_sessions
    }));

    if (loading) return <div>Loading project details...</div>;
    if (!project) return <div>Project not found</div>;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <Link href="/dashboard/admin" className="hover:text-[#0059b2] transition-colors">Admin Dashboard</Link>
                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                    <span className="font-medium text-slate-900 dark:text-white">{project.name}</span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{project.name} Dashboard</h2>
                <p className="text-slate-500">{project.location} • Manager: {project.site_manager_name || 'N/A'}</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Reports</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{reports.length}</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total TBT Sessions</p>
                    <p className="text-2xl font-bold text-[#0059b2]">{reports.reduce((acc, r) => acc + r.tbt_sessions, 0)}</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Incidents</p>
                    <p className="text-2xl font-bold text-red-500">{reports.reduce((acc, r) => acc + r.first_aid_cases + r.near_miss_cases, 0)}</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Man Hours</p>
                    <p className="text-2xl font-bold text-green-600">{reports.reduce((acc, r) => acc + (r.man_hours || 0), 0)}</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Incidents Trend */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-6">Incident Trends (Monthly)</h4>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                <Tooltip />
                                <Line type="monotone" dataKey="incidents" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Training Trend */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-6">Training & TBT Sessions</h4>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="tbt" fill="#0059b2" radius={[4, 4, 0, 0]} name="TBT" />
                                <Bar dataKey="training" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Training" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Detailed Reports Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 dark:border-zinc-800">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">Monthly Reports Log</h4>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-zinc-800/50">
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Month/Year</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">TBT</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Training</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Incidents</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Man Hours</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                            {reports.map((report) => (
                                <tr key={report.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                                    <td className="px-6 py-4 text-xs font-medium text-slate-900 dark:text-white">
                                        {new Date(0, report.report_month - 1).toLocaleString('default', { month: 'long' })} {report.report_year}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400 text-right">{report.tbt_sessions}</td>
                                    <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400 text-right">{report.training_sessions}</td>
                                    <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400 text-right">{report.first_aid_cases + report.near_miss_cases}</td>
                                    <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400 text-right">{report.man_hours}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-bold rounded-full uppercase">Submitted</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
