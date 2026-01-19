"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function BenchmarksPage() {
    const data = [
        { name: 'Ayurvedic', score: 92, industry: 85 },
        { name: 'River View', score: 88, industry: 85 },
        { name: 'NMDC-03', score: 76, industry: 85 },
        { name: 'Emaar', score: 95, industry: 85 },
        { name: 'Auditorium', score: 82, industry: 85 },
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Project Benchmarking</h2>
                    <p className="text-sm text-slate-500">Compare site performance against industry standards</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-6">Safety Compliance Score vs Industry Avg</h4>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="industry" fill="#cbd5e1" barSize={12} radius={[0, 4, 4, 0]} name="Industry Avg" />
                                <Bar dataKey="score" barSize={12} radius={[0, 4, 4, 0]} name="Site Score">
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.score >= 85 ? '#10b981' : entry.score >= 75 ? '#f59e0b' : '#ef4444'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex items-center justify-center gap-6 mt-4 text-xs font-medium text-slate-500">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div> Above Standard</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div> Needs Improvement</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> Critical</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-300"></div> Industry Avg (85%)</div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Top Performing Site</h4>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                                <span className="material-symbols-outlined text-2xl">emoji_events</span>
                            </div>
                            <div>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">Emaar Case Venero</p>
                                <p className="text-xs text-green-600 font-bold">98/100 Score</p>
                            </div>
                        </div>
                        <hr className="my-4 border-slate-100 dark:border-zinc-800" />
                        <div className="space-y-2 text-xs text-slate-500">
                            <div className="flex justify-between"><span>TBT Compliance</span><span className="font-bold text-slate-800 dark:text-white">100%</span></div>
                            <div className="flex justify-between"><span>Incident Free Days</span><span className="font-bold text-slate-800 dark:text-white">142</span></div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Critical Focus Area</h4>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                <span className="material-symbols-outlined text-2xl">warning</span>
                            </div>
                            <div>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">NMDC-03</p>
                                <p className="text-xs text-red-600 font-bold">Requires Audit</p>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-3 italic">"High rate of PTW deviations reported in last quarter."</p>
                        <button className="mt-4 w-full py-2 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors">Schedule Audit</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
