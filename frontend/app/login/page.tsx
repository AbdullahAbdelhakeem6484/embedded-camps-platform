'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { setToken, setStoredUser, getStoredUser, clearToken } from '@/lib/auth';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPass, setShowPass] = useState(false);
    const router = useRouter();

    // Already logged in — redirect
    useEffect(() => {
        const user = getStoredUser();
        if (user) router.replace(user.role === 'ADMIN' ? '/admin' : '/dashboard');
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/login', form);
            setToken(res.data.accessToken);
            if (res.data.user) setStoredUser(res.data.user);
            const role = res.data.user?.role;
            router.push(role === 'ADMIN' ? '/admin' : '/dashboard');
        } catch (err: any) {
            clearToken();
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold">Sign in</h1>
                    <p className="text-gray-400 text-sm">Access your EmbeddedCamps account</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-[#111113] rounded-2xl border border-white/5 p-8 space-y-5 shadow-xl">
                    {error && (
                        <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-400">Email Address</label>
                        <div className="relative">
                            <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="email"
                                required
                                autoComplete="email"
                                placeholder="you@example.com"
                                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/50 text-sm transition-all"
                                value={form.email}
                                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-400">Password</label>
                            <Link href="/forgot-password" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative">
                            <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type={showPass ? 'text' : 'password'}
                                required
                                autoComplete="current-password"
                                placeholder="••••••••"
                                className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/50 text-sm transition-all"
                                value={form.password}
                                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass((s) => !s)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                            >
                                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Sign In'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500">
                    Don&apos;t have an account?{' '}
                    <a
                        href="https://wa.me/201023460370"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                    >
                        Contact us on WhatsApp to enroll
                    </a>
                </p>
            </div>
        </div>
    );
}
