"use client";

import { useEffect, useState, useMemo } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';

export default function AdminDashboard() {
    const [reports, setReports] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]); // New state for projects
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [reportsRes, projectsRes] = await Promise.all([
                    api.get('/reports'),
                    api.get('/projects')
                ]);
                setReports(reportsRes.data);
                setProjects(projectsRes.data);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Filter Logic
    const filteredProjects = useMemo(() => {
        return projects.filter(project => {
            const query = searchQuery.toLowerCase();
            const matchesSearch = project.name?.toLowerCase().includes(query) || false;

            // Region filter (Mock logic based on location)
            let matchesFilter = true;
            if (filter === 'region_north' && project.location) {
                // simple mock
                matchesFilter = project.location.toLowerCase().includes('delhi') || project.location.toLowerCase().includes('noida');
            }

            return matchesSearch && matchesFilter;
        });
    }, [projects, searchQuery, filter]);


    const projectSummaries = useMemo(() => {
        return filteredProjects.map(project => {
            // Find all reports for this project
            const projectReports = reports.filter(r => r.project_id === project.id);

            // Calculate stats
            const total_tbt = projectReports.reduce((sum, r) => sum + (r.tbt_sessions || 0), 0);
            const total_incidents = projectReports.reduce((sum, r) => sum + (r.first_aid_cases || 0) + (r.near_miss_cases || 0), 0);

            // Find latest report
            let last_report = { month: 0, year: 0 };
            if (projectReports.length > 0) {
                // Reports are ordered by backend? Or sort here just in case
                const sorted = [...projectReports].sort((a, b) => {
                    return (b.report_year - a.report_year) || (b.report_month - a.report_month);
                });
                last_report = { month: sorted[0].report_month, year: sorted[0].report_year };
            }

            return {
                id: project.id,
                name: project.name,
                total_tbt,
                total_incidents,
                last_report,
                status: project.status || 'Active' // Use project status from DB or default
            };
        });
    }, [filteredProjects, reports]);

    const kpiStats = useMemo(() => {
        // Calculate global stats based on ALL reports (not just filtered projects, usually KPI is global unless filtered)
        // Adjust based on filteredProjects if KPIs should reflect search/filter
        // Let's reflect filtered projects for better interactivity

        const relevantReports = reports.filter(r => filteredProjects.some(p => p.id === r.project_id));

        return {
            total_tbt: relevantReports.reduce((acc, r) => acc + (r.tbt_sessions || 0), 0),
            total_training: relevantReports.reduce((acc, r) => acc + (r.training_sessions || 0), 0),
            total_first_aid: relevantReports.reduce((acc, r) => acc + (r.first_aid_cases || 0), 0),
            total_near_miss: relevantReports.reduce((acc, r) => acc + (r.near_miss_cases || 0), 0),
            total_ptw_closed: relevantReports.reduce((acc, r) => acc + (r.ptw_closed || 0), 0)
        };
    }, [filteredProjects, reports]);

    const chartData = useMemo(() => {
        const relevantReports = reports.filter(r => filteredProjects.some(p => p.id === r.project_id));

        const data = relevantReports.reduce((acc: any[], report) => {
            const date = new Date(report.report_year, report.report_month - 1);
            const key = date.toLocaleString('default', { month: 'short', year: 'numeric' });

            const existing = acc.find((item: any) => item.name === key);
            if (existing) {
                existing.tbt += report.tbt_sessions;
                existing.incidents += (report.first_aid_cases + report.near_miss_cases);
            } else {
                acc.push({
                    name: key,
                    date: date,
                    tbt: report.tbt_sessions,
                    incidents: report.first_aid_cases + report.near_miss_cases
                });
            }
            return acc;
        }, []);

        return data.sort((a: any, b: any) => a.date - b.date);
    }, [filteredProjects, reports]);

    const handleExport = () => {
        const dataToExport = projectSummaries.map(p => ({
            "Project Name": p.name,
            "Total TBT": p.total_tbt,
            "Total Incidents": p.total_incidents,
            "Last Report": p.last_report.year > 0 ? `${p.last_report.month}/${p.last_report.year}` : 'N/A',
            "Status": p.status
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Project Performance");
        XLSX.writeFile(workbook, `Project_Performance_${new Date().toISOString().split('T')[0]}.xlsx`);
    };



    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-8">
            {/* KPI Section */}
            <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {/* TBT */}
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <span className="material-symbols-outlined text-[#0059b2] text-[20px]">groups</span>
                        </div>
                        <span className="text-green-600 text-xs font-bold flex items-center">+5.2% <span className="material-symbols-outlined text-[14px]">trending_up</span></span>
                    </div>
                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">TBT Conducted</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{kpiStats.total_tbt}</h3>
                </div>
                {/* Training Hours */}
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600">
                            <span className="material-symbols-outlined text-[20px]">school</span>
                        </div>
                        <span className="text-red-500 text-xs font-bold flex items-center">-2.1% <span className="material-symbols-outlined text-[14px]">trending_down</span></span>
                    </div>
                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Training Sessions</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{kpiStats.total_training}</h3>
                </div>
                {/* First Aid */}
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600">
                            <span className="material-symbols-outlined text-[20px]">medical_services</span>
                        </div>
                        <span className="text-green-600 text-xs font-bold flex items-center">-10.5% <span className="material-symbols-outlined text-[14px]">trending_down</span></span>
                    </div>
                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">First Aid Cases</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{kpiStats.total_first_aid}</h3>
                </div>
                {/* Near Miss */}
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600">
                            <span className="material-symbols-outlined text-[20px]">warning</span>
                        </div>
                        <span className="text-green-600 text-xs font-bold flex items-center">+12.0% <span className="material-symbols-outlined text-[14px]">trending_up</span></span>
                    </div>
                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Near Miss Reports</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{kpiStats.total_near_miss}</h3>
                </div>
                {/* PTW Compliance */}
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-[#0059b2]/20 bg-[#0059b2]/5 dark:border-[#0059b2]/20 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-[#0059b2] rounded-lg text-white">
                            <span className="material-symbols-outlined text-[20px]">verified_user</span>
                        </div>
                        <span className="text-green-600 text-xs font-bold flex items-center">+0.5% <span className="material-symbols-outlined text-[14px]">trending_up</span></span>
                    </div>
                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">PTW Closed</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{kpiStats.total_ptw_closed}</h3>
                </div>
            </section>

            {/* Filter Bar */}
            <section className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-slate-200 dark:border-zinc-800 flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2 pr-4 border-r border-slate-200 dark:border-zinc-800">
                    <span className="material-symbols-outlined text-slate-400">filter_alt</span>
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">Quick Filters</span>
                </div>
                <div className="flex gap-2 flex-wrap flex-1">
                    <button
                        onClick={() => setFilter('all')}
                        className={`flex h-9 items-center justify-between gap-x-3 rounded-lg px-4 transition-colors ${filter === 'all' ? 'bg-[#0059b2] text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-white hover:bg-slate-200'}`}
                    >
                        <span className="text-xs font-bold">All Projects</span>
                        <span className="material-symbols-outlined text-[18px]">expand_more</span>
                    </button>
                    <button
                        onClick={() => setFilter('current_month')}
                        className={`flex h-9 items-center justify-between gap-x-3 rounded-lg px-4 transition-colors ${filter === 'current_month' ? 'bg-[#0059b2] text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-white hover:bg-slate-200'}`}
                    >
                        <span className="text-xs font-bold">Current Month</span>
                        <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                    </button>
                    <button
                        onClick={() => setFilter('region_north')}
                        className={`flex h-9 items-center justify-between gap-x-3 rounded-lg px-4 transition-colors ${filter === 'region_north' ? 'bg-[#0059b2] text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-white hover:bg-slate-200'}`}
                    >
                        <span className="text-xs font-bold">Region: North</span>
                        <span className="material-symbols-outlined text-[18px]">expand_more</span>
                    </button>
                </div>
                <button
                    onClick={handleExport}
                    className="bg-[#0059b2] text-white px-5 py-2 rounded-lg text-xs font-bold hover:bg-[#0059b2]/90 transition-all flex items-center gap-2 shadow-lg shadow-[#0059b2]/20"
                >
                    <span className="material-symbols-outlined text-[18px]">download</span> Export Report
                </button>
            </section>

            {/* Charts Section */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Monthly Trend */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white">Monthly Safety Incident Trend</h4>
                            <p className="text-[11px] text-slate-500">Trailing 12-month overview of site incidents</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                <span className="w-2 h-2 rounded-full bg-[#0059b2]"></span> Incidents
                            </span>
                        </div>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                <Tooltip />
                                <Line type="monotone" dataKey="incidents" stroke="#0059b2" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bar Chart TBT */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white">TBT Sessions by Timeline</h4>
                            <p className="text-[11px] text-slate-500">Training Engagement</p>
                        </div>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="tbt" fill="#0059b2" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            {/* Table Section */}
            <section className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">Detailed Project-wise Performance</h4>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">search</span>
                            <input
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-zinc-800 border-none rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#0059b2]/20 transition-all border-slate-200"
                                placeholder="Search projects..."
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button className="p-2 bg-slate-100 dark:bg-zinc-800 rounded-lg text-slate-500 hover:bg-slate-200 transition-colors">
                            <span className="material-symbols-outlined">filter_list</span>
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-zinc-800/50">
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Project Name</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Last Report</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Total TBT</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Total Incidents</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                            {projectSummaries.map((project: any) => (
                                <tr key={project.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-[#0059b2] flex items-center justify-center rounded-lg text-xs font-bold">
                                                {project.name?.substring(0, 2).toUpperCase() || 'PR'}
                                            </div>
                                            <span className="text-xs font-bold text-slate-800 dark:text-white">{project.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                                        {new Date(0, project.last_report.month - 1).toLocaleString('default', { month: 'short' })} {project.last_report.year}
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-slate-800 dark:text-white text-right">{project.total_tbt}</td>
                                    <td className="px-6 py-4 text-xs font-medium text-slate-600 dark:text-slate-400 text-center">{project.total_incidents}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-bold rounded-full uppercase">Active</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/dashboard/admin/projects/${project.id}`} className="text-[#0059b2] hover:text-[#0059b2]/80 text-xs font-bold flex items-center gap-1">
                                            Details <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {projectSummaries.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-400 text-xs">No projects found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination Header (Mock) */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-zinc-800/50 flex items-center justify-between border-t border-slate-100 dark:border-zinc-800">
                    <p className="text-[11px] font-bold text-slate-500 uppercase">Showing {projectSummaries.length} projects</p>
                    <div className="flex items-center gap-2">
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-400 hover:bg-white transition-colors">
                            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#0059b2] text-white text-xs font-bold">1</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-400 hover:bg-white transition-colors">
                            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                        </button>
                    </div>
                </div>
            </section>
        </div >
    );
}
