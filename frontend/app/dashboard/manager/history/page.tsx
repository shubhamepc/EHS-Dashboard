"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { Edit } from 'lucide-react';

export default function HistoryPage() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/reports').then(res => {
            setReports(res.data);
            setLoading(false);
        });
    }, []);

    const getStatusColor = (status: string) => {
        // Mock status logic since we don't have status in DB yet, assuming 'submitted'
        return 'bg-green-100 text-green-700 border-green-200';
    };

    if (loading) return <div>Loading records...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Submission History</h2>
                <Link href="/dashboard/manager">
                    <button className="bg-[#0059b2] hover:bg-[#0059b2]/90 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-bold transition-all shadow-sm">
                        <span className="material-symbols-outlined text-lg">add</span>
                        <span>New Report</span>
                    </button>
                </Link>
            </div>

            {/* Stats Summary Mock */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Reports</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{reports.length}</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Pending Review</p>
                    <p className="text-2xl font-bold text-[#0059b2]">0</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Approved</p>
                    <p className="text-2xl font-bold text-green-600">{reports.length}</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Rejected</p>
                    <p className="text-2xl font-bold text-red-500">0</p>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-800">
                                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-widest">Project Name</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-widest">Period</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-widest text-center">TBT / Incidents</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                            {reports.map((report) => (
                                <tr key={report.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-slate-900 dark:text-white">{report.project_name}</span>
                                            <span className="text-xs text-slate-500">Submitted: {new Date(report.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-sm font-medium text-slate-600 dark:text-slate-400">
                                        {new Date(0, report.report_month - 1).toLocaleString('default', { month: 'short' })} {report.report_year}
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className="inline-flex items-center gap-3">
                                            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">TBT: {report.tbt_sessions}</span>
                                            <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded">INC: {report.first_aid_cases + report.near_miss_cases}</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor('submitted')}`}>
                                            Submitted
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <Link
                                            href={`/dashboard/manager?id=${report.id}`}
                                            className="inline-flex items-center justify-center size-8 rounded-lg text-slate-500 hover:bg-[#0059b2]/10 hover:text-[#0059b2] transition-colors"
                                            title="Edit Report"
                                        >
                                            <Edit size={16} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {reports.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-slate-400 text-sm">No reports submitted yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-zinc-800/50 border-t border-slate-200 dark:border-zinc-800">
                    <p className="text-sm text-slate-500">Showing <span className="font-bold text-slate-900 dark:text-white">{reports.length}</span> records</p>
                    <div className="flex items-center gap-1">
                        <button className="size-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-white dark:hover:bg-zinc-700 border border-transparent disabled:opacity-50">
                            <span className="material-symbols-outlined text-lg">chevron_left</span>
                        </button>
                        <button className="size-9 rounded-lg flex items-center justify-center bg-[#0059b2] text-white text-sm font-bold shadow-sm">1</button>
                        <button className="size-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-white dark:hover:bg-zinc-700 border border-transparent disabled:opacity-50">
                            <span className="material-symbols-outlined text-lg">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
