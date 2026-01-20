"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        setRole(Cookies.get('role') || null);
    }, []);

    const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

    const navLinkClass = (path: string) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-[5px] transition-colors ${isActive(path)
            ? 'bg-[#0059b2]/10 text-[#0059b2] border-r-[3px] border-[#0059b2]'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800'
        }`;

    const handleLogout = () => {
        Cookies.remove('token');
        Cookies.remove('role');
        Cookies.remove('username');
        router.push('/login');
    };

    return (
        <aside
            className="w-64 bg-white dark:bg-zinc-900 flex flex-col fixed h-full z-50"
            style={{ boxShadow: 'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px' }}
        >
            <div className="p-6 flex items-center justify-center">
                <div className="relative h-12 w-48">
                    <Image
                        src="/shubham_logo.jpg"
                        alt="Shubham EPC Logo"
                        fill
                        className="object-contain"
                        priority
                        sizes="192px"
                    />
                </div>
            </div>

            <nav className="flex-1 mt-4 px-3 space-y-1">
                {role === 'admin' && (
                    <>
                        <Link href="/dashboard/admin" className={navLinkClass('/dashboard/admin')}>
                            <span className="material-symbols-outlined text-[20px]">dashboard</span>
                            <span className="text-sm font-semibold">Dashboard</span>
                        </Link>
                        <Link href="/dashboard/admin/projects" className={navLinkClass('/dashboard/admin/projects')}>
                            <span className="material-symbols-outlined text-[20px]">hard_drive</span>
                            <span className="text-sm font-medium">Projects</span>
                        </Link>
                        <Link href="/dashboard/admin/users" className={navLinkClass('/dashboard/admin/users')}>
                            <span className="material-symbols-outlined text-[20px]">group</span>
                            <span className="text-sm font-medium">Manage Users</span>
                        </Link>
                        <Link href="/dashboard/admin/audit-logs" className={navLinkClass('/dashboard/admin/audit-logs')}>
                            <span className="material-symbols-outlined text-[20px]">security</span>
                            <span className="text-sm font-medium">Audit Logs</span>
                        </Link>
                        <div className="pt-6 pb-2 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Analytics</div>
                        <Link href="/dashboard/admin/safety-score" className={navLinkClass('/dashboard/admin/safety-score')}>
                            <span className="material-symbols-outlined text-[20px]">shield</span>
                            <span className="text-sm font-medium">Safety Score</span>
                        </Link>
                        <Link href="/dashboard/admin/management-analytics" className={navLinkClass('/dashboard/admin/management-analytics')}>
                            <span className="material-symbols-outlined text-[20px]">analytics</span>
                            <span className="text-sm font-medium">Management Analytics</span>
                        </Link>
                        <Link href="/dashboard/admin/trends" className={navLinkClass('/dashboard/admin/trends')}>
                            <span className="material-symbols-outlined text-[20px]">insights</span>
                            <span className="text-sm font-medium">Trends</span>
                        </Link>
                        <Link href="/dashboard/admin/benchmarks" className={navLinkClass('/dashboard/admin/benchmarks')}>
                            <span className="material-symbols-outlined text-[20px]">bar_chart</span>
                            <span className="text-sm font-medium">Benchmarks</span>
                        </Link>
                    </>
                )}

                {role === 'manager' && (
                    <>
                        <Link href="/dashboard/manager" className={navLinkClass('/dashboard/manager')}>
                            <span className="material-symbols-outlined text-[20px]">description</span>
                            <span className="text-sm font-medium">Submit Report</span>
                        </Link>
                        <Link href="/dashboard/manager/history" className={navLinkClass('/dashboard/manager/history')}>
                            <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
                            <span className="text-sm font-medium">History</span>
                        </Link>
                    </>
                )}
            </nav>

            <div className="p-4 border-t border-slate-100 dark:border-zinc-800 space-y-2">
                <Link href="/dashboard/admin/settings" className={navLinkClass('/dashboard/admin/settings')}>
                    <span className="material-symbols-outlined text-[20px]">settings</span>
                    <span className="text-sm font-medium">Settings</span>
                </Link>
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-[5px] text-red-600 hover:bg-red-50 transition-colors"
                >
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                    <span className="text-sm font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
}
