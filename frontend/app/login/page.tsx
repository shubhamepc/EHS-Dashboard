"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Cookies from 'js-cookie';
import { User, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, X, Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [showSupport, setShowSupport] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await api.post('/auth/login', { username, password });
            const { token, role, username: user } = res.data;

            Cookies.set('token', token);
            Cookies.set('role', role);
            Cookies.set('username', user);

            if (role === 'admin') {
                router.push('/dashboard/admin');
            } else {
                router.push('/dashboard/manager');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen font-sans text-slate-900 bg-[#fafafa]">

            {/* Header */}
            <header
                className="flex items-center justify-between px-6 py-4 bg-white"
                style={{ boxShadow: 'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px' }}
            >
                <div className="flex items-center gap-3">
                    <div className="relative h-12 w-48">
                        <Image
                            src="/shubham_logo.jpg"
                            alt="Shubham EPC Logo"
                            fill
                            className="object-contain object-left"
                            priority
                        />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowSupport(true)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-[#0059b2] text-sm font-bold rounded shadow-sm hover:from-blue-100 hover:to-blue-200 transition-all border border-blue-200"
                    >
                        Support
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex items-center justify-center flex-1 p-6 sm:p-12 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px]">
                <div className="w-full max-w-[440px] flex flex-col gap-8">

                    <div className="text-center">
                        <h1 className="text-[#0059b2] text-3xl font-bold leading-tight tracking-tight mb-2">
                            EHS System Access
                        </h1>
                        <p className="text-slate-500 text-sm">
                            Enter your credentials to manage safety and reporting.
                        </p>
                    </div>

                    <div
                        className="bg-white rounded-[5px] overflow-hidden"
                        style={{ boxShadow: 'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px' }}
                    >
                        <div className="flex h-1.5 w-full">
                            <div className="flex-1 h-full bg-[#005e81]"></div>
                            <div className="flex-1 h-full bg-[#12b9b3]"></div>
                            <div className="flex-1 h-full bg-[#a0c460]"></div>
                            <div className="flex-1 h-full bg-[#f57e20]"></div>
                            <div className="flex-1 h-full bg-[#006993]"></div>
                            <div className="flex-1 h-full bg-[#c71d4b]"></div>
                        </div>
                        <div className="p-8">
                            {error && (
                                <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-[5px] text-sm border border-red-100 flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 shrink-0" />
                                    <div>
                                        {error}
                                        {error.includes('User not found') && (
                                            <button
                                                type="button"
                                                className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded hover:bg-red-200 transition-colors"
                                                onClick={() => setShowSupport(true)}
                                            >
                                                Contact Support
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleLogin} className="flex flex-col gap-5">
                                {/* Username */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-slate-900 text-sm font-semibold">Employee ID</label>
                                    <div className="relative flex items-center">
                                        <div className="absolute left-3 text-slate-400">
                                            <User size={20} />
                                        </div>
                                        <input
                                            className="w-full pl-10 pr-4 py-3 rounded-[5px] border border-gray-200 bg-white text-slate-900 focus:border-[#0059b2] focus:ring-2 focus:ring-[#0059b2]/10 transition-all text-sm font-normal placeholder:text-slate-400"
                                            placeholder="e.g. SH1510"
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-slate-900 text-sm font-semibold">Password</label>
                                        <a className="text-[#0059b2] text-xs font-semibold hover:underline cursor-pointer">Forgot Password?</a>
                                    </div>
                                    <div className="relative flex items-center">
                                        <div className="absolute left-3 text-slate-400">
                                            <Lock size={20} />
                                        </div>
                                        <input
                                            className="w-full pl-10 pr-12 py-3 rounded-[5px] border border-gray-200 bg-white text-slate-900 focus:border-[#0059b2] focus:ring-2 focus:ring-[#0059b2]/10 transition-all text-sm font-normal placeholder:text-slate-400"
                                            placeholder="••••••••"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 flex items-center text-slate-400 hover:text-[#0059b2] transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Remember Me */}
                                <div className="flex items-center gap-2 py-1">
                                    <input
                                        className="w-4 h-4 text-[#0059b2] border-gray-200 rounded focus:ring-[#0059b2]"
                                        id="remember"
                                        type="checkbox"
                                    />
                                    <label className="text-xs text-slate-500 font-medium cursor-pointer" htmlFor="remember">Remember this device for 30 days</label>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#0059b2] hover:bg-[#4da83c] text-white font-bold py-3.5 rounded-[5px] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    <span>{loading ? 'Signing In...' : 'Sign In to Dashboard'}</span>
                                    {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                                </button>
                            </form>
                        </div>

                        {/* Footer Info */}
                        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex items-center gap-3">
                            <ShieldCheck className="text-[#0059b2] h-[18px] w-[18px]" />
                            <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                                Secure System Access
                            </p>
                        </div>
                    </div>




                </div>
            </main>

            {/* Footer */}
            <footer className="py-6 text-center space-y-2 bg-white border-t border-slate-100">
                <p className="text-xs font-semibold text-[#0059b2] uppercase tracking-widest opacity-80">SHUBH EHS v2.1</p>
                <p className="text-[10px] text-slate-400 font-medium">Copyright © 2026 Shubham EPC Pvt. Ltd.</p>
            </footer>

            {/* Support Popup Modal */}
            {showSupport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowSupport(false)}>
                    <div
                        className="bg-white rounded-[5px] w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200"
                        style={{ boxShadow: 'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <h3 className="font-bold text-slate-800">IT Support</h3>
                            <button onClick={() => setShowSupport(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-blue-50 p-2.5 rounded-[5px] text-[#0059b2]">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Contact Person</p>
                                    <p className="text-sm font-bold text-slate-800">Vishal Desai</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-blue-50 p-2.5 rounded-[5px] text-[#0059b2]">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Email Address</p>
                                    <a href="mailto:it-support@shubham.biz" className="text-sm font-bold text-[#0059b2] hover:underline">it-support@shubham.biz</a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-blue-50 p-2.5 rounded-[5px] text-[#0059b2]">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Phone Number</p>
                                    <a href="tel:8080153393" className="text-sm font-bold text-slate-800 hover:text-[#0059b2] transition-colors">8080153393</a>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                            <p className="text-[10px] text-slate-400 font-medium">Available Mon-Sat, 9:00 AM - 6:00 PM</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
