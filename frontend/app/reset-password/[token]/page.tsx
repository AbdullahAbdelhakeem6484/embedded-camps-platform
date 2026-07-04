'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Lock, Loader2, CheckCircle2 } from 'lucide-react';

export default function ResetPasswordPage() {
    const { token } = useParams<{ token: string }>();
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirm) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', { token, password });
            setSuccess(true);
            setTimeout(() => router.push('/login'), 3000);
        } catch (err: any) {
            const errors = err.response?.data?.errors;
            if (errors?.length) setError(errors.map((e: any) => e.message).join('. '));
            else setError(err.response?.data?.message || 'Failed to reset password. The link may be expired.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b] text-white p-4">
                <div className="w-full max-w-md bg-[#111113] p-8 rounded-2xl border border-white/5 text-center">
                    <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Password Updated!</h2>
                    <p className="text-gray-400 mb-6">Redirecting you to login in 3 seconds...</p>
                    <Link href="/login" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                        Go to Login →
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
                        Reset Password
                    </h1>
                    <p className="mt-2 text-gray-400">Enter your new password below.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <input
                            type="password"
                            placeholder="New password (min 8 chars, 1 uppercase, 1 number)"
                            required
                            className="w-full pl-10 pr-4 py-3 bg-[#1a1a1c] border border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <input
                            type="password"
                            placeholder="Confirm new password"
                            required
                            className="w-full pl-10 pr-4 py-3 bg-[#1a1a1c] border border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
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
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Set New Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}
