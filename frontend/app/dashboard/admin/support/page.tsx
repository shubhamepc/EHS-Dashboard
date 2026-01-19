"use client";

import { useState } from 'react';

export default function SupportPage() {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">How can we help?</h2>
                <p className="text-slate-500">Submit a ticket for technical issues or feature requests.</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-8 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-md relative overflow-hidden">
                {submitted ? (
                    <div className="absolute inset-0 bg-green-50 flex flex-col items-center justify-center animate-fadeIn">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                            <span className="material-symbols-outlined text-3xl">check</span>
                        </div>
                        <h3 className="text-lg font-bold text-green-800">Ticket Submitted!</h3>
                        <p className="text-sm text-green-600">Our IT team will contact you shortly.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Name</label>
                                <input type="text" className="w-full p-3 rounded-lg border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 focus:ring-2 focus:ring-[#0059b2]" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email</label>
                                <input type="email" className="w-full p-3 rounded-lg border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 focus:ring-2 focus:ring-[#0059b2]" required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Issue Category</label>
                            <select className="w-full p-3 rounded-lg border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 focus:ring-2 focus:ring-[#0059b2]">
                                <option>Technical Issue / Bug</option>
                                <option>Feature Request</option>
                                <option>Account Access</option>
                                <option>Data Correction</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Description</label>
                            <textarea rows={4} className="w-full p-3 rounded-lg border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 focus:ring-2 focus:ring-[#0059b2]" placeholder="Describe the issue in detail..." required></textarea>
                        </div>
                        <button type="submit" className="w-full bg-[#0059b2] text-white font-bold py-3.5 rounded-lg shadow-lg shadow-[#0059b2]/20 hover:bg-[#0059b2]/90 transition-all">
                            Submit Ticket
                        </button>
                    </form>
                )}
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-lg">
                    <span className="material-symbols-outlined text-slate-400 mb-2">mail</span>
                    <p className="text-xs font-bold text-slate-600">support@shubham.com</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-lg">
                    <span className="material-symbols-outlined text-slate-400 mb-2">call</span>
                    <p className="text-xs font-bold text-slate-600">+91 123 456 7890</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-lg">
                    <span className="material-symbols-outlined text-slate-400 mb-2">chat</span>
                    <p className="text-xs font-bold text-slate-600">Live Chat (Offline)</p>
                </div>
            </div>
        </div>
    );
}
