'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { 
    Award, Download, Copy, Share2, Eye, QrCode, Loader2,
    Linkedin, Twitter, Facebook, ExternalLink, X, Check
} from 'lucide-react';
import Link from 'next/link';

interface Certificate {
    id: string;
    certificateId: string | null;
    studentName: string | null;
    courseName: string | null;
    status: string;
    pdfUrl: string | null;
    createdAt: string;
    camp: {
        id: string;
        title: string;
        slug: string;
    };
}

export default function StudentCertificatesPage() {
    const [certs, setCerts] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [activeQrCert, setActiveQrCert] = useState<Certificate | null>(null);

    useEffect(() => {
        async function fetchMyCertificates() {
            try {
                const { data } = await api.get('/certificates/my-certificates');
                // Ensure data is array or fallback
                setCerts(Array.isArray(data) ? data : (data?.data ?? []));
            } catch (err) {
                console.error('Failed to load certificates:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchMyCertificates();
    }, []);

    const handleCopy = (cert: Certificate) => {
        const certId = cert.certificateId || cert.id;
        const url = `${window.location.origin}/verify/${certId}`;
        navigator.clipboard.writeText(url);
        setCopiedId(cert.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const getShareUrls = (cert: Certificate) => {
        const certId = cert.certificateId || cert.id;
        const verifyUrl = `${window.location.origin}/verify/${certId}`;
        const courseTitle = cert.courseName || cert.camp.title;
        return {
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`,
            x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Completed the ${courseTitle} course at @EmbeddedCamps! 🏆 Digital credential:`)}&url=${encodeURIComponent(verifyUrl)}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(verifyUrl)}`
        };
    };

    return (
        <div className="space-y-8 select-none">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
                    <Award className="w-8 h-8 text-amber-400" /> My Certificates
                </h1>
                <p className="text-gray-400 mt-1">View, download, and share your earned professional credentials.</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                </div>
            ) : certs.length === 0 ? (
                <div className="bg-[#111113] rounded-2xl border border-white/5 p-12 text-center max-w-xl mx-auto space-y-4">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-gray-500">
                        <Award className="w-8 h-8" />
                    </div>
                    <h2 className="text-lg font-bold text-white">No Certificates Earned Yet</h2>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        Complete 100% of the lessons, labs, and quizzes in any enrolled camp to automatically receive your verifiable certificate.
                    </p>
                    <Link href="/dashboard" className="inline-block px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-semibold transition-all">
                        Go to My Camps
                    </Link>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                    {certs.map((cert) => {
                        const certId = cert.certificateId || cert.id;
                        const verifyUrl = `/verify/${certId}`;
                        const downloadUrl = `${api.defaults.baseURL || ''}/certificates/download/${certId}`;
                        const share = getShareUrls(cert);
                        const isRevoked = cert.status === 'REVOKED';

                        return (
                            <div key={cert.id} className="bg-[#111113] border border-white/5 rounded-2xl hover:border-amber-500/20 transition-all p-6 flex flex-col justify-between relative overflow-hidden group">
                                
                                {/* Background design highlight */}
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/5 to-transparent rounded-bl-full pointer-events-none"></div>

                                <div className="space-y-4">
                                    {/* Badge Status */}
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
                                            <Award className="w-6 h-6" />
                                        </div>
                                        {isRevoked ? (
                                            <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
                                                Revoked
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
                                                Active / Verifiable
                                            </span>
                                        )}
                                    </div>

                                    {/* Credentials info */}
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-bold text-white leading-snug group-hover:text-amber-300 transition-colors">
                                            {cert.courseName || cert.camp.title}
                                        </h3>
                                        <p className="text-xs text-gray-500">
                                            Credential ID: <span className="font-mono">{certId}</span>
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Issued: {new Date(cert.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions Toolbar */}
                                <div className="border-t border-white/5 pt-5 mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <Link href={verifyUrl} target="_blank"
                                            className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-xs transition-all border border-white/5"
                                            title="View Certificate Details">
                                            <Eye className="w-4 h-4" />
                                        </Link>
                                        
                                        {!isRevoked && (
                                            <>
                                                <a href={downloadUrl} target="_blank" rel="noopener noreferrer"
                                                    className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-xs transition-all border border-white/5"
                                                    title="Download PDF Certificate">
                                                    <Download className="w-4 h-4" />
                                                </a>
                                                <button onClick={() => setActiveQrCert(cert)}
                                                    className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-xs transition-all border border-white/5"
                                                    title="View QR Code">
                                                    <QrCode className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}

                                        <button onClick={() => handleCopy(cert)}
                                            className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-xs transition-all border border-white/5 flex items-center gap-1.5 font-semibold"
                                            title="Copy Verification Link">
                                            {copiedId === cert.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                            {copiedId === cert.id && <span className="text-[10px] text-emerald-400">Copied</span>}
                                        </button>
                                    </div>

                                    {!isRevoked && (
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mr-1">Share</span>
                                            <a href={share.linkedin} target="_blank" rel="noopener noreferrer"
                                                className="p-2 bg-white/5 hover:bg-[#0077b5]/10 text-gray-400 hover:text-[#0077b5] border border-white/5 rounded-xl transition-all">
                                                <Linkedin className="w-3.5 h-3.5" />
                                            </a>
                                            <a href={share.x} target="_blank" rel="noopener noreferrer"
                                                className="p-2 bg-white/5 hover:bg-white/5 text-gray-400 hover:text-white border border-white/5 rounded-xl transition-all">
                                                <Twitter className="w-3.5 h-3.5" />
                                            </a>
                                            <a href={share.facebook} target="_blank" rel="noopener noreferrer"
                                                className="p-2 bg-white/5 hover:bg-[#1877f2]/10 text-gray-400 hover:text-[#1877f2] border border-white/5 rounded-xl transition-all">
                                                <Facebook className="w-3.5 h-3.5" />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* QR Code Modal */}
            {activeQrCert && (() => {
                const qId = activeQrCert.certificateId || activeQrCert.id;
                const vUrl = `${window.location.origin}/verify/${qId}`;
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(vUrl)}&color=0f172a&bgcolor=ffffff`;

                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="w-full max-w-sm bg-[#111113] rounded-3xl border border-white/10 shadow-2xl p-6 relative flex flex-col items-center text-center space-y-4">
                            <button onClick={() => setActiveQrCert(null)}
                                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>

                            <div className="pt-2">
                                <div className="p-3 bg-amber-500/10 rounded-full inline-block text-amber-400">
                                    <QrCode className="w-8 h-8" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h3 className="font-bold text-white text-lg">Credential Verification QR</h3>
                                <p className="text-xs text-gray-400 leading-normal px-4">
                                    Anyone scanning this QR code will open the public validation portal proving this certificate is genuine.
                                </p>
                            </div>

                            <div className="p-3 bg-white rounded-2xl shadow-xl select-none my-2">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={qrUrl} alt="Credential QR Code" className="w-44 h-44" />
                            </div>

                            <div className="w-full space-y-1.5 bg-white/3 p-3 rounded-xl border border-white/5">
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Verification URL</p>
                                <a href={vUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:underline font-medium block truncate">
                                    {vUrl} <ExternalLink className="w-3 h-3 inline ml-0.5" />
                                </a>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
