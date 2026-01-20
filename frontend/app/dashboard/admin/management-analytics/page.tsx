"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ManagementAnalyticsPage() {
    const [activeTab, setActiveTab] = useState('yearly');
    const [yearlyData, setYearlyData] = useState<any[]>([]);
    const [quarterlyData, setQuarterlyData] = useState<any[]>([]);
    const [heatmapData, setHeatmapData] = useState<any>({});
    const [riskData, setRiskData] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchData();
    }, [selectedYear]);

    const fetchData = async () => {
        try {
            const [yearly, quarterly, heatmap, risk, summaryRes] = await Promise.all([
                api.get(`/analytics/management/yearly-comparison?years=${selectedYear},${selectedYear - 1}`),
                api.get(`/analytics/management/quarterly?year=${selectedYear}`),
                api.get(`/analytics/management/incident-heatmap?year=${selectedYear}`),
                api.get('/analytics/management/risk-classification'),
                api.get(`/analytics/management/summary?year=${selectedYear}`)
            ]);

            setYearlyData(yearly.data.comparison);
            setQuarterlyData(quarterly.data.quarters);
            setHeatmapData(heatmap.data.heatmap);
            setRiskData(risk.data.projects);
            setSummary(summaryRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = () => {
        const doc = new jsPDF();

        // Title
        doc.setFontSize(20);
        doc.text('EHS Management Report', 14, 20);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);
        doc.text(`Period: ${selectedYear}`, 14, 34);

        // Summary Statistics
        doc.setFontSize(14);
        doc.text('Executive Summary', 14, 45);
        doc.setFontSize(10);

        if (summary) {
            const stats = [
                ['Total Projects', summary.statistics.total_projects],
                ['Total TBT Sessions', summary.statistics.total_tbt],
                ['Total Training Sessions', summary.statistics.total_training],
                ['First Aid Cases', summary.statistics.total_first_aid],
                ['Near Miss Cases', summary.statistics.total_near_miss],
                ['Average Safety Score', Math.round(summary.statistics.avg_safety_score || 0)],
            ];

            autoTable(doc, {
                startY: 50,
                head: [['Metric', 'Value']],
                body: stats,
                theme: 'grid'
            });
        }

        // Top Performers
        doc.addPage();
        doc.setFontSize(14);
        doc.text('Top Performing Projects', 14, 20);

        if (summary?.top_performers) {
            autoTable(doc, {
                startY: 25,
                head: [['Project Name', 'Safety Score']],
                body: summary.top_performers.map((p: any) => [p.name, Math.round(p.safety_score)]),
                theme: 'striped'
            });
        }

        // Risk Projects
        doc.setFontSize(14);
        doc.text('Projects Requiring Attention', 14, (doc as any).lastAutoTable.finalY + 15);

        if (summary?.risk_projects && summary.risk_projects.length > 0) {
            autoTable(doc, {
                startY: (doc as any).lastAutoTable.finalY + 20,
                head: [['Project Name', 'Total Incidents', 'Safety Score']],
                body: summary.risk_projects.map((p: any) => [
                    p.name,
                    p.total_incidents,
                    Math.round(p.safety_score)
                ]),
                theme: 'striped'
            });
        }

        // Risk Classification
        doc.addPage();
        doc.setFontSize(14);
        doc.text('Project Risk Classification', 14, 20);

        autoTable(doc, {
            startY: 25,
            head: [['Project', 'Risk Level', 'Avg Incidents/Month', 'Safety Score']],
            body: riskData.map(p => [
                p.name,
                p.risk_level,
                p.avg_incidents_per_month,
                p.avg_safety_score
            ]),
            theme: 'grid',
            didParseCell: function (data: any) {
                if (data.column.index === 1 && data.cell.section === 'body') {
                    const risk = data.cell.raw;
                    if (risk === 'Critical') data.cell.styles.fillColor = [239, 68, 68];
                    else if (risk === 'High') data.cell.styles.fillColor = [251, 146, 60];
                    else if (risk === 'Medium') data.cell.styles.fillColor = [250, 204, 21];
                    else data.cell.styles.fillColor = [34, 197, 94];
                    data.cell.styles.textColor = [255, 255, 255];
                }
            }
        });

        doc.save(`EHS_Management_Report_${selectedYear}.pdf`);
    };

    const getHeatmapColor = (value: number) => {
        if (value === 0) return 'bg-green-100';
        if (value <= 2) return 'bg-yellow-100';
        if (value <= 5) return 'bg-orange-200';
        return 'bg-red-300';
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Management Analytics</h2>
                    <p className="text-sm text-slate-500">Advanced insights and comparative analysis</p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="px-4 py-2 border border-slate-200 rounded-lg text-sm"
                    >
                        {[2026, 2025, 2024, 2023].map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                    <button
                        onClick={downloadPDF}
                        className="bg-[#0059b2] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-bold shadow-sm hover:bg-[#0059b2]/90"
                    >
                        <span className="material-symbols-outlined text-lg">download</span>
                        Download PDF Report
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <div className="flex gap-6">
                    {['yearly', 'quarterly', 'heatmap', 'risk'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 px-2 text-sm font-bold capitalize transition-colors ${activeTab === tab
                                ? 'text-[#0059b2] border-b-2 border-[#0059b2]'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {tab === 'yearly' && 'Yearly Comparison'}
                            {tab === 'quarterly' && 'Quarterly Analysis'}
                            {tab === 'heatmap' && 'Incident Heatmap'}
                            {tab === 'risk' && 'Risk Classification'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Yearly Comparison */}
            {activeTab === 'yearly' && (
                <div className="space-y-6">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-6">Year-over-Year Comparison</h4>
                        <div className="h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={yearlyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="report_year" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="total_tbt" fill="#0059b2" name="TBT Sessions" />
                                    <Bar dataKey="total_training" fill="#10b981" name="Training Sessions" />
                                    <Bar dataKey="total_first_aid" fill="#f59e0b" name="First Aid" />
                                    <Bar dataKey="total_near_miss" fill="#ef4444" name="Near Miss" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {yearlyData.map(year => (
                            <div key={year.report_year} className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800">
                                <h4 className="text-2xl font-bold text-[#0059b2] mb-4">{year.report_year}</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between"><span className="text-slate-500">Active Projects:</span><span className="font-bold">{year.active_projects}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-500">Total Man Hours:</span><span className="font-bold">{(year.total_man_hours || 0).toLocaleString()}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-500">TBT Sessions:</span><span className="font-bold">{year.total_tbt}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-500">Training:</span><span className="font-bold">{year.total_training}</span></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Quarterly Analysis */}
            {activeTab === 'quarterly' && (
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-6">Quarterly Performance - {selectedYear}</h4>
                    <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={quarterlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="quarter" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="tbt_sessions" stroke="#0059b2" strokeWidth={2} name="TBT" />
                                <Line yAxisId="left" type="monotone" dataKey="training_sessions" stroke="#10b981" strokeWidth={2} name="Training" />
                                <Line yAxisId="right" type="monotone" dataKey="avg_safety_score" stroke="#f59e0b" strokeWidth={3} name="Safety Score" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Incident Heatmap */}
            {activeTab === 'heatmap' && (
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-x-auto">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-6">Incident Heatmap - {selectedYear}</h4>
                    <table className="w-full text-xs">
                        <thead>
                            <tr>
                                <th className="text-left p-2 font-bold">Project</th>
                                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => (
                                    <th key={month} className="p-2 text-center font-bold">{month}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(heatmapData).map(([project, months]: [string, any]) => (
                                <tr key={project} className="border-t border-slate-100">
                                    <td className="p-2 font-medium text-slate-700">{project}</td>
                                    {months.map((count: number, idx: number) => (
                                        <td key={idx} className="p-2">
                                            <div className={`w-full h-8 flex items-center justify-center rounded ${getHeatmapColor(count)} font-bold`}>
                                                {count || '-'}
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="flex gap-4 mt-4 text-xs">
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-100 rounded"></div> 0 incidents</div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-100 rounded"></div> 1-2 incidents</div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-orange-200 rounded"></div> 3-5 incidents</div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-300 rounded"></div> 5+ incidents</div>
                    </div>
                </div>
            )}

            {/* Risk Classification */}
            {activeTab === 'risk' && (
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-zinc-800/50 border-b">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Project</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Risk Level</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Avg Incidents/Month</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Safety Score</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Total Incidents</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {riskData.map(project => (
                                <tr key={project.id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 font-bold text-sm">{project.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${project.risk_color === 'red' ? 'bg-red-100 text-red-700' :
                                            project.risk_color === 'orange' ? 'bg-orange-100 text-orange-700' :
                                                project.risk_color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-green-100 text-green-700'
                                            }`}>
                                            {project.risk_level}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">{project.avg_incidents_per_month}</td>
                                    <td className="px-6 py-4 text-lg font-bold text-[#0059b2]">{project.avg_safety_score}</td>
                                    <td className="px-6 py-4 text-sm">{project.total_first_aid + project.total_near_miss}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
