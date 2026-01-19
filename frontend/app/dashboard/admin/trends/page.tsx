"use client";

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

export default function TrendsPage() {
    // Mock data for trends - normally fetched from API
    const data = [
        { month: 'Jan', incidents: 4, training: 12, compliance: 95 },
        { month: 'Feb', incidents: 3, training: 15, compliance: 92 },
        { month: 'Mar', incidents: 5, training: 18, compliance: 88 },
        { month: 'Apr', incidents: 2, training: 20, compliance: 96 },
        { month: 'May', incidents: 1, training: 22, compliance: 98 },
        { month: 'Jun', incidents: 3, training: 25, compliance: 94 },
        { month: 'Jul', incidents: 2, training: 24, compliance: 97 },
        { month: 'Aug', incidents: 1, training: 28, compliance: 99 },
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Safety Trends Analysis</h2>
                    <p className="text-sm text-slate-500">Long-term performance and predictive insights</p>
                </div>
                <div className="flex gap-2">
                    <select className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm p-2">
                        <option>Last 6 Months</option>
                        <option>Last 12 Months</option>
                        <option>YTD</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Incident Trend */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-6">Incident Frequency Rate (IFR)</h4>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="incidents" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} name="Total Incidents" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Training Effectiveness */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-6">Training vs Compliance</h4>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Legend />
                                <Bar yAxisId="left" dataKey="training" fill="#0059b2" radius={[4, 4, 0, 0]} name="Training Sessions" />
                                <Line yAxisId="right" type="monotone" dataKey="compliance" stroke="#10b981" strokeWidth={2} name="Compliance %" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* AI Insights (Mock) */}
            <div className="bg-[#0059b2]/5 border border-[#0059b2]/20 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-[#0059b2] text-white rounded-lg shadow-md">
                        <span className="material-symbols-outlined text-2xl">auto_awesome</span>
                    </div>
                    <div>
                        <h4 className="text-base font-bold text-[#0059b2] mb-1">AI Safety Insights</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            Based on current trends, there is a <strong>15% positive correlation</strong> between TBT sessions and reduced near-miss reporting.
                            However, incident rates typically spike in <strong>May and June</strong> historically.
                            Recommended action: Increase heat-stress awareness campaigns for the upcoming month.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
