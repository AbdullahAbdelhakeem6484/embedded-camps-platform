'use client';

import { useEffect, useState, use } from 'react';
import api from '@/lib/api';
import { Loader2, CheckCircle, ShieldCheck, Calendar, User, Award, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default function VerificationPage({ params }: { params: any }) {
    const { id } = (use(params) as any);
    const [cert, setCert] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function fetchVerification() {
            try {
                const { data } = await api.get(`/certificates/verify/${id}`);
                setCert(data);
            } catch (err) {
                setError(true);
            } finally {
                setLoading(false);
            }
        }
        fetchVerification();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center space-y-4 transition-all duration-300">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                <p className="text-text-muted font-medium">Verifying Certificate...</p>
            </div>
        );
    }

    if (error || !cert) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center transition-all duration-300">
                <div className="w-20 h-20 bg-red-500/10 rounded-full border border-red-500/20 flex items-center justify-center mb-6">
                    <ShieldCheck className="w-10 h-10 text-red-500 opacity-50" />
                </div>
                <h1 className="text-3xl font-bold text-red-500 mb-4">Verification Failed</h1>
                <p className="text-text-muted max-w-md mx-auto leading-relaxed">
                    We could not verify this certificate. It may be invalid, expired, or the ID is incorrect.
                </p>
                <Link href="/" className="mt-8 px-8 py-3 bg-surface hover:bg-surface-hover border border-border rounded-xl transition-all font-bold">
                    Return Home
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 transition-all duration-300">
            <div className="w-full max-w-2xl bg-surface rounded-3xl border border-emerald-500/20 shadow-2xl overflow-hidden relative">
                
                {/* Decorative Background */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-emerald-600/20 to-transparent pointer-events-none"></div>

                <div className="p-12 relative z-10 flex flex-col items-center text-center space-y-8">
                    {/* Brand Logo */}
                    <Logo variant="horizontal" className="h-12 w-auto mb-2" />

                    <div className="w-24 h-24 bg-emerald-500/10 rounded-full border border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                        <Award className="w-12 h-12 text-emerald-400" />
                    </div>

                    <div className="space-y-2">
                        <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 mb-4">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Officially Verified</span>
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight">Certificate of Completion</h1>
                    </div>

                    <div className="w-full space-y-6 pt-6 border-t border-border text-left">
                        <div className="bg-background/40 p-6 rounded-2xl border border-border space-y-6">
                            <div className="flex items-center space-x-4">
                                <User className="w-6 h-6 text-blue-500" />
                                <div>
                                    <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Engineer</p>
                                    <p className="text-xl font-bold mt-1">{cert.engineerName}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <ShieldCheck className="w-6 h-6 text-indigo-500" />
                                <div>
                                    <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Bootcamp / Specialization</p>
                                    <p className="text-xl font-bold mt-1">{cert.campTitle}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <Calendar className="w-6 h-6 text-emerald-500" />
                                <div>
                                    <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Issue Date</p>
                                    <p className="text-xl font-bold mt-1">{new Date(cert.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 w-full">
                        <div className="flex items-center justify-between px-6 py-4 bg-surface-hover rounded-2xl border border-border text-left">
                            <div>
                                <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Credential ID</p>
                                <p className="text-sm font-medium text-text-muted font-mono mt-1">{cert.id}</p>
                            </div>
                            <Link href="/" className="p-3 bg-surface hover:bg-surface-hover border border-border rounded-xl transition-all">
                                <ExternalLink className="w-5 h-5 text-text-muted" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            
            <p className="mt-8 text-sm text-text-muted font-medium tracking-wide">
                Securely verified by Embedded Camps Platform
            </p>
        </div>
    );
}
