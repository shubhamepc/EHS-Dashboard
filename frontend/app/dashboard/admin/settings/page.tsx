"use client";

import { useState } from 'react';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">System Settings</h2>

            <div className="flex gap-6">
                {/* Sidebar Settings Nav */}
                <div className="w-64 flex flex-col gap-1">
                    {['Profile', 'Notifications', 'Security', 'Company Info', 'Integrations'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab.toLowerCase())}
                            className={`text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.toLowerCase()
                                    ? 'bg-white dark:bg-zinc-800 text-[#0059b2] shadow-sm font-bold'
                                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-8 shadow-sm">
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-4">Profile Settings</h3>
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-full bg-slate-200 border-2 border-white dark:border-zinc-800 shadow-md"></div>
                                <button className="text-sm font-bold text-[#0059b2]">Change Avatar</button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                                    <input type="text" defaultValue="Deepak" className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                                    <input type="text" defaultValue="Sharma" className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                                    <input type="email" defaultValue="deepak.sharma@shubhamepc.com" className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800" />
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button className="bg-[#0059b2] text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-[#0059b2]/90 transition-colors">Save Changes</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-4">Notification Preferences</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-2">
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">Daily Report Summaries</p>
                                        <p className="text-xs text-slate-500">Receive a daily digest of all site activities at 6 PM.</p>
                                    </div>
                                    <input type="checkbox" defaultChecked className="toggle-checkbox" />
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">Critical Incident Alerts</p>
                                        <p className="text-xs text-slate-500">Immediate email notifications for severe incidents.</p>
                                    </div>
                                    <input type="checkbox" defaultChecked className="toggle-checkbox" />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab !== 'profile' && activeTab !== 'notifications' && (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <span className="material-symbols-outlined text-4xl mb-2">construction</span>
                            <p>This setting module is currently under development.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
