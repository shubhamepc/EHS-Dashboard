"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Cookies from 'js-cookie';
import { User, Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
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
            <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="text-[#0059b2] h-6 w-6">
                        <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path clipRule="evenodd" d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z" fill="currentColor" fillRule="evenodd"></path>
                        </svg>
                    </div>
                    <h2 className="text-lg font-bold leading-tight tracking-tight text-slate-900">Shubham EPC</h2>
                </div>
                <div className="flex items-center gap-4">
                    <button className="text-sm font-medium text-slate-500 hover:text-[#0059b2] transition-colors">Support</button>
                    <div className="h-4 w-[1px] bg-gray-200"></div>
                    <span className="text-xs font-semibold text-[#0059b2] uppercase tracking-widest opacity-70">Enterprise v4.2</span>
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

                    <div className="bg-white border border-gray-100 rounded-xl shadow-[0_4px_6px_-1px_rgb(0_0_0/0.1),0_2px_4px_-2px_rgb(0_0_0/0.1)] overflow-hidden">
                        <div className="h-1.5 w-full bg-[#0059b2]"></div>
                        <div className="p-8">
                            {error && (
                                <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4" /> {/* Alert icon alternative */}
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleLogin} className="flex flex-col gap-5">
                                {/* Username */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-slate-900 text-sm font-semibold">Username or Employee ID</label>
                                    <div className="relative flex items-center">
                                        <div className="absolute left-3 text-slate-400">
                                            <User size={20} />
                                        </div>
                                        <input
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-white text-slate-900 focus:border-[#0059b2] focus:ring-2 focus:ring-[#0059b2]/10 transition-all text-sm font-normal placeholder:text-slate-400"
                                            placeholder="e.g. manager1"
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
                                            className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-200 bg-white text-slate-900 focus:border-[#0059b2] focus:ring-2 focus:ring-[#0059b2]/10 transition-all text-sm font-normal placeholder:text-slate-400"
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
                                    className="w-full bg-[#0059b2] hover:bg-[#0059b2]/90 text-white font-bold py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
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
                                Secure Multi-Factor Authentication Enabled
                            </p>
                        </div>
                    </div>

                    {/* Contextual Branding Image */}
                    <div className="rounded-xl h-24 overflow-hidden relative shadow-sm">
                        <div className="absolute inset-0 bg-[#0059b2]/10 mix-blend-multiply"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0059b2]/40 to-transparent"></div>
                        <div
                            className="w-full h-full bg-center bg-cover"
                            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBoEZkMwgwXwOBbmFNVY1rff3bnhKujHUfgUz-gYFAq7q4YdVBl_3FjXTvqp59HlN47D5k0b4h9HWGJF-Ozle2hf_b_crbGxMyZcgI9dQtvwjcg483MToRDRFmVZvsyPRS07Ru-M7oKSmctMNsTM_aXJAZsEYEt8SWpNeBm6VoMl_lb__iJir7678Two1nG2CARSfv3DJuD_GnONp0k3BmkhyRJR01bkW73AIXWhnV_EYNqPYtLGSuw3SckDQ00fcSDvCyxFN7VCAc')" }}
                        ></div>
                        <div className="absolute inset-0 flex items-center px-6">
                            <p className="text-white text-xs font-bold uppercase tracking-widest drop-shadow-md">Safety First. Quality Always.</p>
                        </div>
                    </div>

                    <footer className="text-center text-[11px] text-slate-400 uppercase tracking-[0.2em]">
                        © 2024 Shubham EPC Private Limited. Authorized Access Only.
                    </footer>
                </div>
            </main>
        </div>
    );
}
