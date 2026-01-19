"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        action: '',
        entity_type: '',
        start_date: '',
        end_date: ''
    });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedLog, setSelectedLog] = useState<any>(null); // For details modal

    useEffect(() => {
        fetchLogs();
    }, [page, filters]);

    const fetchLogs = async () => {
        try {
            const res = await api.get('/audit-logs', {
                params: { page, limit: 15, ...filters }
            });
            setLogs(res.data.logs);
            setTotalPages(Math.ceil(res.data.total / 15));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
        setPage(1); // Reset to first page
    };

    const formatJSON = (jsonString: string) => {
        try {
            return JSON.stringify(JSON.parse(jsonString), null, 2);
        } catch {
            return jsonString || 'N/A';
        }
    };

    if (loading) return <div>Loading logs...</div>;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">System Audit Logs</h2>
                <p className="text-sm text-slate-500">Track all user activities and system changes.</p>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                <select name="action" className="p-2 border border-slate-200 rounded-lg text-sm" onChange={handleFilterChange}>
                    <option value="">All Actions</option>
                    <option value="LOGIN">LOGIN</option>
                    <option value="CREATE">CREATE</option>
                    <option value="UPDATE">UPDATE</option>
                    <option value="DELETE">DELETE</option>
                </select>
                <select name="entity_type" className="p-2 border border-slate-200 rounded-lg text-sm" onChange={handleFilterChange}>
                    <option value="">All Entities</option>
                    <option value="AUTH">Auth</option>
                    <option value="USER">User</option>
                    <option value="PROJECT">Project</option>
                    <option value="DAILY_REPORT">Daily Report</option>
                    <option value="MONTHLY_REPORT">Monthly Report</option>
                </select>
                <input type="date" name="start_date" className="p-2 border border-slate-200 rounded-lg text-sm" onChange={handleFilterChange} />
                <input type="date" name="end_date" className="p-2 border border-slate-200 rounded-lg text-sm" onChange={handleFilterChange} />
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-800">
                        <tr>
                            <th className="px-6 py-4 font-bold uppercase text-slate-500 text-xs">Timestamp</th>
                            <th className="px-6 py-4 font-bold uppercase text-slate-500 text-xs">User</th>
                            <th className="px-6 py-4 font-bold uppercase text-slate-500 text-xs">Action</th>
                            <th className="px-6 py-4 font-bold uppercase text-slate-500 text-xs">Entity</th>
                            <th className="px-6 py-4 font-bold uppercase text-slate-500 text-xs">IP Address</th>
                            <th className="px-6 py-4 font-bold uppercase text-slate-500 text-xs text-right">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 text-slate-600">{new Date(log.created_at).toLocaleString()}</td>
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                    {log.full_name} <span className="text-slate-400 text-xs">({log.username})</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${log.action === 'CREATE' ? 'bg-green-100 text-green-700' :
                                            log.action === 'UPDATE' ? 'bg-blue-100 text-blue-700' :
                                                log.action === 'DELETE' ? 'bg-red-100 text-red-700' :
                                                    'bg-purple-100 text-purple-700'
                                        }`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{log.entity_type}</span>
                                    {log.entity_id && <span className="text-xs text-slate-500 ml-1">#{log.entity_id}</span>}
                                </td>
                                <td className="px-6 py-4 text-slate-500 text-xs font-mono">{log.ip_address || 'N/A'}</td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => setSelectedLog(log)}
                                        className="text-[#0059b2] hover:bg-[#0059b2]/10 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                    >
                                        View Changes
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Pagination - Simplified */}
                <div className="flex justify-between items-center p-4 border-t border-slate-200">
                    <button disabled={page === 1} onClick={() => setPage(page - 1)} className="text-sm font-bold text-slate-500 disabled:opacity-50">Previous</button>
                    <span className="text-xs text-slate-400">Page {page} of {totalPages}</span>
                    <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="text-sm font-bold text-slate-500 disabled:opacity-50">Next</button>
                </div>
            </div>

            {/* Details Modal */}
            {selectedLog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-xl w-full max-w-2xl shadow-2xl max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Audit Details #{selectedLog.id}</h3>
                            <button onClick={() => setSelectedLog(null)} className="material-symbols-outlined text-slate-500 hover:text-red-500">close</button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                            <div><span className="font-bold text-slate-500">User:</span> {selectedLog.full_name}</div>
                            <div><span className="font-bold text-slate-500">Action:</span> {selectedLog.action}</div>
                            <div><span className="font-bold text-slate-500">IP:</span> {selectedLog.ip_address}</div>
                            <div><span className="font-bold text-slate-500">Date:</span> {new Date(selectedLog.created_at).toLocaleString()}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 dark:bg-zinc-800 p-4 rounded-lg overflow-x-auto">
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Old Value</h4>
                                <pre className="text-xs font-mono text-red-600">{formatJSON(selectedLog.old_value)}</pre>
                            </div>
                            <div className="bg-slate-50 dark:bg-zinc-800 p-4 rounded-lg overflow-x-auto">
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">New Value</h4>
                                <pre className="text-xs font-mono text-green-600">{formatJSON(selectedLog.new_value)}</pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
