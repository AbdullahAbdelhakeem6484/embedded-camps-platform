'use client';
import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Mail, Loader2, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/forgot-password', { email });
            setSubmitted(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b] text-white p-4">
                <div className="w-full max-w-md bg-[#111113] p-8 rounded-2xl border border-white/5 text-center">
                    <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Check Your Email</h2>
                    <p className="text-gray-400 mb-6 leading-relaxed">
                        If an account exists for <strong className="text-white">{email}</strong>, we sent a password reset link. Check your inbox (and spam folder).
                    </p>
                    <Link href="/login" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                        Back to Login →
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b] text-white p-4">
            <div className="w-full max-w-md bg-[#111113] p-8 rounded-2xl border border-white/5 shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                        Forgot Password
                    </h1>
                    <p className="mt-2 text-gray-400">Enter your email and we will send you a reset link.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <input
                            type="email"
                            placeholder="Your email address"
                            required
                            className="w-full pl-10 pr-4 py-3 bg-[#1a1a1c] border border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">{error}</div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 font-semibold rounded-xl transition-all flex items-center justify-center disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Send Reset Link'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-400 mt-6">
                    Remember your password?{' '}
                    <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">Log in</Link>
                </p>
            </div>
        </div>
    );
}
