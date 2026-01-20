"use client";

import Sidebar from '@/components/Sidebar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isManager = pathname?.includes('/manager');
    const title = isManager ? 'Manager Portal' : 'Admin Dashboard';
    const subtitle = isManager ? 'Site Overview' : 'HQ Overview';

    return (
        <div className="flex min-h-screen bg-[#fafafa]">
            <Sidebar />
            <div className="ml-64 flex-1 flex flex-col min-h-screen">
                {/* Top Header */}
                <header
                    className="h-16 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-8 flex items-center justify-between sticky top-0 z-40"
                    style={{ boxShadow: 'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px' }}
                >
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h2>
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-[11px] font-bold text-slate-500 rounded-[5px] uppercase tracking-tighter">{subtitle}</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-[5px] relative">
                                <span className="material-symbols-outlined">notifications</span>
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900"></span>
                            </button>
                            <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-[5px]">
                                <span className="material-symbols-outlined">chat_bubble</span>
                            </button>
                        </div>
                        <div className="h-8 w-px bg-slate-200 dark:bg-zinc-800"></div>
                        <div className="flex items-center gap-3 cursor-pointer group">
                            <div className="text-right">
                                <p className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-[#0059b2] transition-colors">{isManager ? 'Site Manager' : 'Super Admin'}</p>
                                <p className="text-[10px] text-slate-500 font-medium">{isManager ? 'Site Team' : 'System Administrator'}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center border-2 border-slate-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                                <span className="material-symbols-outlined text-slate-400">person</span>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-8">
                    {children}
                </main>

                <footer className="p-8 border-t border-slate-200 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900 mt-auto">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">© 2024 Shubham EPC Enterprise Solutions</p>
                    <div className="flex gap-6">
                        <Link href="/dashboard/admin/privacy-policy" className="text-[10px] text-slate-500 font-bold uppercase hover:text-[#0059b2] transition-colors">Privacy Policy</Link>
                        <Link href="/dashboard/admin/ehs-standards" className="text-[10px] text-slate-500 font-bold uppercase hover:text-[#0059b2] transition-colors">EHS Standards</Link>
                        <Link href="/dashboard/admin/support" className="text-[10px] text-slate-500 font-bold uppercase hover:text-[#0059b2] transition-colors">Support</Link>
                    </div>
                </footer>
            </div>
        </div>
    );
}
