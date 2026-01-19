"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function ProjectsPage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [managers, setManagers] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProject, setCurrentProject] = useState<any>(null); // For editing
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        site_manager_id: '',
        status: 'active'
    });
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchProjects();
        fetchManagers();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await api.get('/projects');
            setProjects(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchManagers = async () => {
        try {
            const res = await api.get('/auth/managers');
            setManagers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentProject) {
                await api.put(`/projects/${currentProject.id}`, formData);
            } else {
                await api.post('/projects', formData);
            }
            setIsModalOpen(false);
            setCurrentProject(null);
            setFormData({ name: '', location: '', site_manager_id: '', status: 'active' });
            fetchProjects();
        } catch (err) {
            console.error(err);
            alert('Failed to save project');
        }
    };

    const handleEdit = (project: any) => {
        setCurrentProject(project);
        setFormData({
            name: project.name,
            location: project.location,
            site_manager_id: project.site_manager_id,
            status: project.status
        });
        setIsModalOpen(true);
    };

    const getInitials = (name: string) => {
        return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : '??';
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active': return 'bg-green-100 text-green-700 border-green-200';
            case 'under review': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'on hold': return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'completed': return 'bg-gray-100 text-gray-500 border-gray-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Project Management</h2>
                <button
                    onClick={() => {
                        setCurrentProject(null);
                        setFormData({ name: '', location: '', site_manager_id: '', status: 'active' });
                        setIsModalOpen(true);
                    }}
                    className="bg-[#0059b2] hover:bg-[#0059b2]/90 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-bold transition-all shadow-sm"
                >
                    <span className="material-symbols-outlined text-lg">add</span>
                    <span>Add Project</span>
                </button>
            </div>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="hover:text-[#0059b2] transition-colors cursor-pointer">Enterprise</span>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span className="font-medium text-slate-900 dark:text-white">Project Management</span>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Projects</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{projects.length}</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Active Sites</p>
                    <p className="text-2xl font-bold text-green-600">{projects.filter(p => p.status === 'active').length}</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Under Review</p>
                    <p className="text-2xl font-bold text-[#0059b2]">{projects.filter(p => p.status === 'under review').length}</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">On Hold</p>
                    <p className="text-2xl font-bold text-slate-500">{projects.filter(p => p.status === 'on hold').length}</p>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-800">
                                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-widest">Project Name</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-widest">Location</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-widest">Site Manager</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                            {projects.map((project) => (
                                <tr key={project.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-slate-900 dark:text-white">{project.name}</span>
                                            <span className="text-xs text-slate-500">ID: PRJ-{project.id.toString().padStart(4, '0')}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                                            <span className="material-symbols-outlined text-base">location_on</span>
                                            {project.location}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2 text-sm bg-slate-50 dark:bg-zinc-800/50 border border-transparent hover:border-[#0059b2]/30 px-3 py-1.5 rounded-lg transition-all w-fit">
                                            <div className="size-6 rounded-full bg-[#0059b2]/20 flex items-center justify-center text-[10px] font-bold text-[#0059b2]">
                                                {getInitials(project.site_manager_name)}
                                            </div>
                                            <span className="font-medium text-slate-700 dark:text-slate-300">{project.site_manager_name || 'Unassigned'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(project.status || 'active')}`}>
                                            {project.status || 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(project)}
                                                className="size-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-[#0059b2]/10 hover:text-[#0059b2] transition-colors"
                                                title="Edit"
                                            >
                                                <span className="material-symbols-outlined text-lg">edit</span>
                                            </button>
                                            <button
                                                className="size-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                                                title="Delete"
                                            >
                                                <span className="material-symbols-outlined text-lg">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {projects.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-slate-400 text-sm">No projects found. Create one to get started.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-zinc-800/50 border-t border-slate-200 dark:border-zinc-800">
                    <p className="text-sm text-slate-500">Showing <span className="font-bold text-slate-900 dark:text-white">{projects.length}</span> projects</p>
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-xl w-full max-w-md shadow-2xl">
                        <h3 className="text-lg font-bold mb-6 text-slate-900 dark:text-white">{currentProject ? 'Edit Project' : 'Create New Project'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Project Name</label>
                                <input
                                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0059b2]/20 focus:border-[#0059b2]"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location</label>
                                <input
                                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0059b2]/20 focus:border-[#0059b2]"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Assign Manager</label>
                                <select
                                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0059b2]/20 focus:border-[#0059b2]"
                                    value={formData.site_manager_id}
                                    onChange={(e) => setFormData({ ...formData, site_manager_id: e.target.value })}
                                >
                                    <option value="">Select Manager</option>
                                    {managers.map(m => (
                                        <option key={m.id} value={m.id}>{m.full_name} ({m.username})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                                <select
                                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0059b2]/20 focus:border-[#0059b2]"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="active">Active</option>
                                    <option value="under review">Under Review</option>
                                    <option value="on hold">On Hold</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-zinc-800 rounded-lg transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[#0059b2] hover:bg-[#0059b2]/90 text-white rounded-lg transition-colors font-bold shadow-sm"
                                >
                                    Save Project
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
