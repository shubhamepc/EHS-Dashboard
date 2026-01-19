"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        full_name: '',
        role: 'manager'
    });

    useEffect(() => {
        fetchUsers();
    }, [page, search, roleFilter]);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users', {
                params: { page, limit: 10, search, role: roleFilter }
            });
            setUsers(res.data.users);
            setTotalPages(Math.ceil(res.data.total / 10));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentUser) {
                await api.put(`/users/${currentUser.id}`, formData);
            } else {
                await api.post('/users', formData);
            }
            setIsModalOpen(false);
            setCurrentUser(null);
            setFormData({ username: '', password: '', full_name: '', role: 'manager' });
            fetchUsers();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleEdit = (user: any) => {
        setCurrentUser(user);
        setFormData({
            username: user.username,
            password: '', // Leave blank to keep unchanged
            full_name: user.full_name,
            role: user.role
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/users/${id}`);
            fetchUsers();
        } catch (err: any) {
            alert('Failed to delete user');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">User Management</h2>
                <button
                    onClick={() => {
                        setCurrentUser(null);
                        setFormData({ username: '', password: '', full_name: '', role: 'manager' });
                        setIsModalOpen(true);
                    }}
                    className="bg-[#0059b2] hover:bg-[#0059b2]/90 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-bold shadow-sm"
                >
                    <span className="material-symbols-outlined text-lg">add</span>
                    <span>Create User</span>
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400">search</span>
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="p-2 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm bg-slate-50 dark:bg-zinc-800"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                >
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-800">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">User Details</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Role</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Assigned Projects</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#0059b2]/10 text-[#0059b2] flex items-center justify-center text-xs font-bold">
                                            {user.full_name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{user.full_name}</p>
                                            <p className="text-xs text-slate-500">@{user.username}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">{user.assigned_projects_count} Projects</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleEdit(user)} className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600">
                                            <span className="material-symbols-outlined text-lg">edit</span>
                                        </button>
                                        <button onClick={() => handleDelete(user.id)} className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-red-600">
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={4} className="text-center py-8 text-slate-400 text-sm">No users found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-xl w-full max-w-md shadow-2xl">
                        <h3 className="text-lg font-bold mb-6 text-slate-900 dark:text-white">{currentUser ? 'Edit User' : 'Create User'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Full Name</label>
                                <input type="text" className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Username</label>
                                <input type="text" className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required disabled={!!currentUser} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Password {currentUser && '(Leave blank to keep unchanged)'}</label>
                                <input type="password" className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required={!currentUser} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Role</label>
                                <select className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                                    <option value="manager">Manager</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-[#0059b2] text-white rounded-lg font-bold">Save User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
