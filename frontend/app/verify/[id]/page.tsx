'use client';

import { useEffect, useState, use } from 'react';
import api from '@/lib/api';
import { 
    Loader2, CheckCircle2, XCircle, Award, Calendar, User, 
    ShieldCheck, Download, Copy, Share2, Linkedin, Twitter, Facebook, ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default function VerificationPage({ params }: { params: any }) {
    const { id } = (use(params) as any);
    const [cert, setCert] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [copied, setCopied] = useState(false);

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

    const handleCopy = () => {
        const url = `${window.location.origin}/verify/${cert?.certificateId || cert?.id}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#07080a] text-white flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
                <p className="text-gray-400 font-medium tracking-wide">Verifying Credential Authenticity...</p>
            </div>
        );
    }

    if (error || !cert) {
        return (
            <div className="min-h-screen bg-[#07080a] text-white flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-red-500/10 rounded-full border border-red-500/20 flex items-center justify-center mb-6">
                    <XCircle className="w-12 h-12 text-red-500" />
                </div>
                <h1 className="text-3xl font-bold text-red-500 mb-4">Verification Failed</h1>
                <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
                    We could not find or verify this certificate. It may be invalid, or the ID is incorrect.
                </p>
                <Link href="/" className="mt-8 px-8 py-3 bg-[#111113] hover:bg-[#1a1a1c] border border-white/5 rounded-xl transition-all font-bold text-sm">
                    Return Home
                </Link>
            </div>
        );
    }

    const isRevoked = cert.status === 'REVOKED';
    const studentName = cert.studentName || cert.user?.name || 'Graduate Student';
    const courseName = cert.courseName || cert.camp?.title || 'Bootcamp Course';
    const certificateId = cert.certificateId || cert.id;
    const issueDate = cert.issueDate || cert.createdAt;
    const completionDate = cert.completionDate || cert.createdAt;
    const verifyUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${certificateId}`;
    const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verifyUrl)}&color=0f172a&bgcolor=ffffff`;

    const shareOnLinkedIn = () => {
        const url = encodeURIComponent(verifyUrl);
        const title = encodeURIComponent(`I completed the ${courseName} course at EmbeddedCamps!`);
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
    };

    const shareOnX = () => {
        const text = encodeURIComponent(`Completed the ${courseName} specialization program at @EmbeddedCamps! 🏆 Check out my digital credential:`);
        const url = encodeURIComponent(verifyUrl);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    };

    const shareOnFacebook = () => {
        const url = encodeURIComponent(verifyUrl);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-[#07080a] text-white flex flex-col items-center justify-center p-6 md:py-16 selection:bg-amber-500/30">
            <div className="w-full max-w-3xl bg-[#0f1013] rounded-3xl border border-white/5 shadow-2xl overflow-hidden relative">
                
                {/* Visual Accent Top Bar */}
                <div className={`h-2 w-full ${isRevoked ? 'bg-red-600' : 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600'}`}></div>

                <div className="p-8 md:p-12 relative z-10 flex flex-col items-center">
                    
                    {/* Brand Header */}
                    <div className="w-full flex flex-col items-center md:flex-row md:justify-between border-b border-white/5 pb-8 mb-8 gap-4">
                        <Logo variant="horizontal" className="h-12 w-auto" />
                        <div className="flex items-center gap-2">
                            {isRevoked ? (
                                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 font-bold text-xs uppercase tracking-widest">
                                    <XCircle className="w-3.5 h-3.5" /> Revoked / Invalid
                                </div>
                            ) : (
                                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 font-bold text-xs uppercase tracking-widest">
                                    <ShieldCheck className="w-3.5 h-3.5" /> Valid Certificate
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Certificate Badge */}
                    <div className="relative mb-6">
                        <div className={`w-28 h-28 rounded-full border flex items-center justify-center shadow-lg ${isRevoked ? 'bg-red-500/10 border-red-500/20 shadow-red-500/5' : 'bg-amber-500/10 border-amber-500/20 shadow-amber-500/5'}`}>
                            <Award className={`w-14 h-14 ${isRevoked ? 'text-red-400' : 'text-amber-400'}`} />
                        </div>
                    </div>

                    <div className="text-center space-y-3 max-w-xl mb-10">
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                            {isRevoked ? 'Certificate Verification Details' : 'Officially Verifiable Credential'}
                        </h1>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            {isRevoked 
                                ? 'This credential was revoked by the platform administrator and is no longer valid.' 
                                : 'This certificate proves that the recipient successfully completed all requirements and modules of the specified camp program.'
                            }
                        </p>
                    </div>

                    {/* Main Credential Grid */}
                    <div className="w-full grid md:grid-cols-3 gap-8 mb-10">
                        
                        {/* Info details (2/3 width) */}
                        <div className="md:col-span-2 space-y-4">
                            <div className="bg-[#131418] p-5 rounded-2xl border border-white/5 space-y-4">
                                <div className="flex items-start gap-3.5">
                                    <User className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Graduate Engineer</p>
                                        <p className="text-lg font-bold mt-0.5 text-white">{studentName}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3.5 pt-4 border-t border-white/5">
                                    <Award className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Bootcamp / Program Spec</p>
                                        <p className="text-lg font-bold mt-0.5 text-white">{courseName}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3.5 pt-4 border-t border-white/5">
                                    <Calendar className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                    <div className="grid grid-cols-2 gap-4 w-full">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Completion Date</p>
                                            <p className="text-sm font-semibold mt-0.5 text-white">
                                                {new Date(completionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Issue Date</p>
                                            <p className="text-sm font-semibold mt-0.5 text-white">
                                                {new Date(issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#131418] p-5 rounded-2xl border border-white/5 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Instructor</p>
                                        <p className="text-sm font-bold text-white mt-1">Abdullah Abdelhakeem</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Credential Status</p>
                                        <p className={`text-sm font-bold mt-1 ${isRevoked ? 'text-red-400' : 'text-emerald-400'}`}>
                                            {isRevoked ? 'REVOKED' : 'ACTIVE'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* QR Code and Meta (1/3 width) */}
                        <div className="flex flex-col items-center justify-between bg-[#131418] p-6 rounded-2xl border border-white/5 text-center gap-4">
                            <div>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Verification QR</p>
                                <div className="p-2 bg-white rounded-xl shadow-lg inline-block">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={qrCodeApiUrl} alt="Verification QR Code" className="w-28 h-28 select-none" />
                                </div>
                            </div>
                            <div className="w-full">
                                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Credential ID</p>
                                <p className="text-xs font-mono font-bold text-white mt-1 select-all break-all">{certificateId}</p>
                            </div>
                        </div>

                    </div>

                    {/* Verification Actions */}
                    <div className="w-full border-t border-white/5 pt-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                            {!isRevoked && (
                                <a 
                                    href={`${api.defaults.baseURL || ''}/certificates/download/${certificateId}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all"
                                >
                                    <Download className="w-3.5 h-3.5" /> Download PDF
                                </a>
                            )}
                            <button 
                                onClick={handleCopy}
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1a1b20] hover:bg-[#25262c] text-gray-300 rounded-xl text-xs font-bold border border-white/5 transition-all"
                            >
                                <Copy className="w-3.5 h-3.5" /> {copied ? 'Copied!' : 'Copy Link'}
                            </button>
                        </div>

                        {!isRevoked && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-1">Share</span>
                                <button 
                                    onClick={shareOnLinkedIn}
                                    className="p-2.5 bg-[#1a1b20] hover:bg-[#0077b5]/10 border border-white/5 text-gray-400 hover:text-[#0077b5] rounded-xl transition-all"
                                    title="Share on LinkedIn"
                                >
                                    <Linkedin className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={shareOnX}
                                    className="p-2.5 bg-[#1a1b20] hover:bg-white/5 border border-white/5 text-gray-400 hover:text-white rounded-xl transition-all"
                                    title="Share on X"
                                >
                                    <Twitter className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={shareOnFacebook}
                                    className="p-2.5 bg-[#1a1b20] hover:bg-[#1877f2]/10 border border-white/5 text-gray-400 hover:text-[#1877f2] rounded-xl transition-all"
                                    title="Share on Facebook"
                                >
                                    <Facebook className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-2 text-center text-xs text-gray-600 font-medium">
                <p>Securely verified by Embedded Camps Cryptographic System</p>
                <div className="flex items-center gap-2 text-gray-500 mt-1">
                    <span>Scans: {cert.verificationScansCount || 0}</span>
                    <span>•</span>
                    <span>Downloads: {cert.downloadsCount || 0}</span>
                </div>
            </div>
        </div>
    );
}
