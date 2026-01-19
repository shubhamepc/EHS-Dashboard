"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Upload, Save, Calendar, BarChart2 } from 'lucide-react';

function DailyReportForm({ projects }: { projects: any[] }) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('success');
    const [photos, setPhotos] = useState<FileList | null>(null);
    const [formData, setFormData] = useState({
        project_id: projects.length > 0 ? projects[0].id : '',
        report_date: new Date().toISOString().split('T')[0],
        tbt_sessions: 0,
        tbt_participants: 0,
        training_sessions: 0,
        training_participants: 0,
        training_topic: '',
        persons_rewarded: 0,
        rewarded_person_name: '',
        inspection_conducted_of: '',
        medical_examination_count: 0,
        hira_count: 0,
        first_aid_cases: 0,
        near_miss_cases: 0,
        safety_committee_meetings: 0,
        cctv_installed: false,
        cctv_functioning: false,
        ptw_issued: 0,
        ptw_closed: 0,
    });

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? Math.max(0, Number(value)) : value)
        }));
    };

    const handleFileChange = (e: any) => {
        if (e.target.files) {
            // Check file size (max 5MB per file)
            const validFiles = Array.from(e.target.files as FileList).every(file => file.size <= 5 * 1024 * 1024);
            if (!validFiles) {
                setMessage('Some files are too large. Max size is 5MB.');
                setMessageType('error');
                return;
            }
            setPhotos(e.target.files);
            setMessage('');
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setMessage('');

        // Validation
        if (formData.ptw_closed > formData.ptw_issued) {
            setMessage('PTW Closed cannot be greater than PTW Issued.');
            setMessageType('error');
            return;
        }

        setLoading(true);

        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => data.append(key, String(value)));
        if (photos) {
            for (let i = 0; i < photos.length; i++) data.append('photos', photos[i]);
        }

        try {
            await api.post('/reports/daily', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            setMessage('Daily Report submitted successfully!');
            setMessageType('success');
            // Reset numerical fields
            setFormData(prev => ({
                ...prev,
                tbt_sessions: 0, tbt_participants: 0, training_sessions: 0,
                training_participants: 0, training_topic: '', ptw_issued: 0, ptw_closed: 0
            }));
            setPhotos(null);
        } catch (err: any) {
            setMessage(err.response?.data?.message || 'Error submitting report. Please check if report for this date already exists.');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {message && <div className={`p-4 rounded-lg border ${messageType === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{message}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Project Site</label>
                    <select name="project_id" value={formData.project_id} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white">
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Report Date</label>
                    <input type="date" name="report_date" value={formData.report_date} onChange={handleChange} required className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white" />
                </div>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-800/50 p-6 rounded-xl border border-slate-200 dark:border-zinc-800">
                <h3 className="font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-zinc-700 pb-2 mb-4 text-sm uppercase tracking-wide">Daily Activities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-medium mb-1">TBT Sessions</label><input type="number" min="0" name="tbt_sessions" value={formData.tbt_sessions} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700" /></div>
                    <div><label className="block text-sm font-medium mb-1">Training Sessions</label><input type="number" min="0" name="training_sessions" value={formData.training_sessions} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700" /></div>
                    <div><label className="block text-sm font-medium mb-1">Training Topic</label><input type="text" name="training_topic" value={formData.training_topic} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700" /></div>
                    <div><label className="block text-sm font-medium mb-1">Inspection Conducted Of</label><input type="text" name="inspection_conducted_of" value={formData.inspection_conducted_of} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700" /></div>
                </div>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-800/50 p-6 rounded-xl border border-slate-200 dark:border-zinc-800">
                <h3 className="font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-zinc-700 pb-2 mb-4 text-sm uppercase tracking-wide">Incidents & Permissions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div><label className="block text-sm font-medium mb-1">First Aid Cases</label><input type="number" min="0" name="first_aid_cases" value={formData.first_aid_cases} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700" /></div>
                    <div><label className="block text-sm font-medium mb-1">Near Miss Cases</label><input type="number" min="0" name="near_miss_cases" value={formData.near_miss_cases} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700" /></div>
                    <div><label className="block text-sm font-medium mb-1 text-red-600">PTW Issued</label><input type="number" min="0" name="ptw_issued" value={formData.ptw_issued} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700" /></div>
                    <div><label className="block text-sm font-medium mb-1 text-green-600">PTW Closed</label><input type="number" min="0" name="ptw_closed" value={formData.ptw_closed} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700" /></div>
                </div>
                <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">Evidence Photos (Max 5MB)</label>
                    <input type="file" multiple accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#0059b2]/10 file:text-[#0059b2] hover:file:bg-[#0059b2]/20" />
                </div>
            </div>

            <div className="flex justify-end">
                <button type="submit" disabled={loading} className="bg-[#0059b2] text-white px-8 py-3 rounded-lg font-bold shadow-md hover:bg-[#0059b2]/90 disabled:opacity-70 transition-colors flex items-center gap-2">
                    {loading && <span className="material-symbols-outlined animate-spin text-sm">autorenew</span>}
                    {loading ? 'Submitting...' : 'Submit Daily Report'}
                </button>
            </div>
        </form>
    );
}

function MonthlyReportForm({ projects }: { projects: any[] }) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('success');
    const [formData, setFormData] = useState({
        project_id: projects.length > 0 ? projects[0].id : '',
        report_month: new Date().getMonth() + 1,
        report_year: new Date().getFullYear(),
        avg_staff: 0,
        avg_workers: 0,
        working_days: 0,
        working_hours: 8,
        man_days: 0,
        man_hours: 0,
        safety_induction_sessions: 0,
        safety_induction_attendees: 0,
        ehs_personnel_count: 0
    });

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: Math.max(0, Number(value)) // Ensure non-negative
        }));
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            await api.post('/reports/monthly', formData);
            setMessage('Monthly Report submitted successfully!');
            setMessageType('success');
        } catch (err: any) {
            // Handle duplicate entry error (Unique Constraint)
            if (err.response?.status === 500 && err.response?.data?.message?.includes('UNIQUE')) {
                setMessage('A report for this Month and Project already exists.');
            } else {
                setMessage(err.response?.data?.message || 'Error submitting report');
            }
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {message && <div className={`p-4 rounded-lg border ${messageType === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{message}</div>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Project Site</label>
                    <select name="project_id" value={formData.project_id} onChange={(e) => setFormData({ ...formData, project_id: e.target.value })} className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white">
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Month</label>
                    <select name="report_month" value={formData.report_month} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white">
                        {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Year</label>
                    <input type="number" name="report_year" value={formData.report_year} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white" />
                </div>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-800/50 p-6 rounded-xl border border-slate-200 dark:border-zinc-800">
                <h3 className="font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-zinc-700 pb-2 mb-4 text-sm uppercase tracking-wide">Manpower & Hours</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-medium mb-1">Avg Staff</label><input type="number" min="0" name="avg_staff" value={formData.avg_staff} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700" /></div>
                    <div><label className="block text-sm font-medium mb-1">Avg Workers</label><input type="number" min="0" name="avg_workers" value={formData.avg_workers} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700" /></div>
                    <div><label className="block text-sm font-medium mb-1">Working Days</label><input type="number" min="0" max="31" name="working_days" value={formData.working_days} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700" /></div>
                    <div><label className="block text-sm font-medium mb-1">Working Hours</label><input type="number" min="0" max="24" name="working_hours" value={formData.working_hours} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700" /></div>
                    <div><label className="block text-sm font-medium mb-1">Man-days Worked</label><input type="number" min="0" name="man_days" value={formData.man_days} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700" /></div>
                    <div><label className="block text-sm font-medium mb-1">Man-hours Worked</label><input type="number" min="0" name="man_hours" value={formData.man_hours} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700" /></div>
                </div>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-800/50 p-6 rounded-xl border border-slate-200 dark:border-zinc-800">
                <h3 className="font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-zinc-700 pb-2 mb-4 text-sm uppercase tracking-wide">Safety Inductions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div><label className="block text-sm font-medium mb-1">Induction Sessions</label><input type="number" min="0" name="safety_induction_sessions" value={formData.safety_induction_sessions} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700" /></div>
                    <div><label className="block text-sm font-medium mb-1">Induction Attendees</label><input type="number" min="0" name="safety_induction_attendees" value={formData.safety_induction_attendees} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700" /></div>
                    <div><label className="block text-sm font-medium mb-1">EHS Personnel On Site</label><input type="number" min="0" name="ehs_personnel_count" value={formData.ehs_personnel_count} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700" /></div>
                </div>
            </div>

            <div className="flex justify-end">
                <button type="submit" disabled={loading} className="bg-[#0059b2] text-white px-8 py-3 rounded-lg font-bold shadow-md hover:bg-[#0059b2]/90 disabled:opacity-70 transition-colors flex items-center gap-2">
                    {loading && <span className="material-symbols-outlined animate-spin text-sm">autorenew</span>}
                    {loading ? 'Submitting...' : 'Submit Monthly Report'}
                </button>
            </div>
        </form>
    );
}

export default function ManagerReportPage() {
    const [projects, setProjects] = useState([]);
    const [activeTab, setActiveTab] = useState<'daily' | 'monthly'>('daily');

    useEffect(() => {
        api.get('/projects').then(res => setProjects(res.data));
    }, []);

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Site EHS Reporting</h2>
                <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('daily')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'daily' ? 'bg-white dark:bg-zinc-900 text-[#0059b2] shadow-sm' : 'text-slate-500'}`}
                    >
                        Daily Report
                    </button>
                    <button
                        onClick={() => setActiveTab('monthly')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'monthly' ? 'bg-white dark:bg-zinc-900 text-[#0059b2] shadow-sm' : 'text-slate-500'}`}
                    >
                        Monthly Report
                    </button>
                </div>
            </div>

            <Suspense fallback={<div>Loading form...</div>}>
                {activeTab === 'daily' ? <DailyReportForm projects={projects} /> : <MonthlyReportForm projects={projects} />}
            </Suspense>
        </div>
    );
}
