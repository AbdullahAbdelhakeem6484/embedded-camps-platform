'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { 
    Award, Plus, Trash2, ExternalLink, Loader2, Search, X, 
    RefreshCw, ShieldAlert, ShieldCheck, Download, Filter, 
    Eye, BarChart3, Users, Zap
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface Certificate {
    id: string;
    certificateId: string | null;
    createdAt: string;
    status: string;
    downloadsCount: number;
    verificationScansCount: number;
    user: { id: string; name: string; email: string };
    camp: { id: string; title: string; slug: string };
}

interface Camp { id: string; title: string; }
interface User { id: string; name: string; email: string; }

const inputCls = 'w-full px-4 py-2.5 bg-[#1a1a1c] border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/50 text-sm transition-all';

export default function AdminCertificatesPage() {
    const toast = useToast();
    const [certs, setCerts] = useState<Certificate[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'REVOKED'>('ALL');
    const [showIssueModal, setShowIssueModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Certificate | null>(null);
    const [statusTarget, setStatusTarget] = useState<{ cert: Certificate; nextStatus: string } | null>(null);
    const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
    const [camps, setCamps] = useState<Camp[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [issueForm, setIssueForm] = useState({ userId: '', campId: '' });
    const [issuing, setIssuing] = useState(false);

    const load = useCallback(async (p = 1) => {
        setLoading(true);
        try {
            const { data } = await api.get(`/certificates?page=${p}`);
            setCerts(data.data);
            setTotal(data.total);
            setPage(data.page);
            setPages(data.pages);
        } catch {
            toast.error('Failed to load certificates');
        } finally {
            setLoading(false);
        }
    }, [toast]);

    const loadFormData = async () => {
        try {
            const [campsRes, usersRes] = await Promise.all([
                api.get('/camps?limit=100'),
                api.get('/users?limit=200'),
            ]);
            setCamps(campsRes.data.data ?? campsRes.data);
            setUsers(usersRes.data.data ?? usersRes.data);
        } catch { /* non-critical */ }
    };

    useEffect(() => { load(); }, [load]);

    const openIssue = () => {
        loadFormData();
        setIssueForm({ userId: '', campId: '' });
        setShowIssueModal(true);
    };

    const handleIssue = async () => {
        if (!issueForm.userId || !issueForm.campId) {
            toast.error('Select a student and camp');
            return;
        }
        setIssuing(true);
        try {
            await api.post('/certificates/issue', issueForm);
            toast.success('Certificate issued');
            setShowIssueModal(false);
            load(1);
        } catch (e: any) {
            toast.error(e.response?.data?.message ?? 'Failed to issue certificate');
        } finally {
            setIssuing(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!statusTarget) return;
        const { cert, nextStatus } = statusTarget;
        try {
            await api.put('/certificates/status', { id: cert.id, status: nextStatus });
            toast.success(`Certificate ${nextStatus === 'ACTIVE' ? 'activated' : 'revoked'}`);
            setStatusTarget(null);
            load(page);
        } catch {
            toast.error('Failed to update certificate status');
        }
    };

    const handleRegenerate = async (cert: Certificate) => {
        setRegeneratingId(cert.id);
        try {
            await api.post(`/certificates/regenerate/${cert.id}`);
            toast.success('Certificate PDF regenerated & uploaded successfully');
            load(page);
        } catch {
            toast.error('Failed to regenerate certificate PDF');
        } finally {
            setRegeneratingId(null);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await api.delete(`/certificates/${deleteTarget.id}`);
            toast.success('Certificate deleted permanently');
            setDeleteTarget(null);
            load(page);
        } catch {
            toast.error('Failed to delete certificate');
        }
    };

    // Client-side Search and Filter
    const filtered = certs.filter(c => {
        const query = search.toLowerCase();
        const matchesSearch = 
            c.user.name.toLowerCase().includes(query) ||
            c.user.email.toLowerCase().includes(query) ||
            c.camp.title.toLowerCase().includes(query) ||
            (c.certificateId || '').toLowerCase().includes(query) ||
            c.id.toLowerCase().includes(query);
        
        const matchesStatus = 
            statusFilter === 'ALL' || 
            (statusFilter === 'ACTIVE' && c.status === 'ACTIVE') ||
            (statusFilter === 'REVOKED' && c.status === 'REVOKED');

        return matchesSearch && matchesStatus;
    });

    // Loaded-list Analytics Sums (useful for quick diagnostics)
    const totalDownloads = certs.reduce((sum, c) => sum + (c.downloadsCount || 0), 0);
    const totalScans = certs.reduce((sum, c) => sum + (c.verificationScansCount || 0), 0);
    const activeCount = certs.filter(c => c.status === 'ACTIVE').length;

    return (
        <div className="space-y-8 select-none">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Award className="w-8 h-8 text-amber-400" /> Certificates Manager
                    </h1>
                    <p className="text-gray-400 mt-1">{total} total certificates issued on the platform</p>
                </div>
                <button onClick={openIssue}
                    className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold text-sm transition-all self-start sm:self-auto">
                    <Plus className="w-4 h-4" /> Issue Certificate
                </button>
            </div>

            {/* Local Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Active (Current Page)', value: activeCount, color: 'text-emerald-400', icon: ShieldCheck },
                    { label: 'Revoked (Current Page)', value: certs.length - activeCount, color: 'text-red-400', icon: ShieldAlert },
                    { label: 'Downloads (Current Page)', value: totalDownloads, color: 'text-sky-400', icon: Download },
                    { label: 'Verification Scans (Current Page)', value: totalScans, color: 'text-amber-400', icon: BarChart3 },
                ].map(({ label, value, color, icon: Icon }) => (
                    <div key={label} className="bg-[#111113] rounded-2xl border border-white/5 p-4 flex items-center gap-4">
                        <div className={`p-2 bg-white/5 rounded-xl ${color}`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-white">{value}</p>
                            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Search */}
                <div className="relative w-full md:max-w-sm">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        className="w-full pl-10 pr-4 py-2.5 bg-[#111113] border border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/50"
                        placeholder="Search by student, course, or ID…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                {/* Filter Controls */}
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500 shrink-0" />
                    <div className="flex bg-[#111113] border border-white/10 rounded-xl p-1 text-xs">
                        {(['ALL', 'ACTIVE', 'REVOKED'] as const).map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setStatusFilter(filter)}
                                className={`px-4 py-1.5 rounded-lg font-semibold transition-all ${statusFilter === filter ? 'bg-amber-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#111113] rounded-2xl border border-white/5 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">No certificates found matching your criteria.</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="border-b border-white/5 bg-white/[0.01]">
                            <tr className="text-left">
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Student / Email</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Camp Course</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Credential ID</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Downloads / Scans</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.map(cert => {
                                const certId = cert.certificateId || cert.id;
                                const isRevoked = cert.status === 'REVOKED';

                                return (
                                    <tr key={cert.id} className="hover:bg-white/[0.01] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-white">{cert.user.name}</div>
                                            <div className="text-xs text-gray-500 font-medium">{cert.user.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-white">{cert.camp.title}</div>
                                            <div className="text-xs text-gray-500 font-medium">/{cert.camp.slug}</div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-gray-300">
                                            {certId}
                                        </td>
                                        <td className="px-6 py-4">
                                            {isRevoked ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                    <ShieldAlert className="w-3 h-3" /> Revoked
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                    <ShieldCheck className="w-3 h-3" /> Active
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-xs font-semibold text-gray-400">
                                            {cert.downloadsCount || 0} / {cert.verificationScansCount || 0}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <a href={`/verify/${certId}`} target="_blank" rel="noopener noreferrer"
                                                    className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 rounded-xl transition-all"
                                                    title="View Verification Page">
                                                    <Eye className="w-3.5 h-3.5" />
                                                </a>
                                                
                                                {!isRevoked && (
                                                    <a href={`${api.defaults.baseURL || ''}/certificates/download/${certId}`} target="_blank" rel="noopener noreferrer"
                                                        className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 rounded-xl transition-all"
                                                        title="Download PDF">
                                                        <Download className="w-3.5 h-3.5" />
                                                    </a>
                                                )}

                                                <button
                                                    onClick={() => handleRegenerate(cert)}
                                                    disabled={regeneratingId === cert.id}
                                                    className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 rounded-xl transition-all disabled:opacity-50"
                                                    title="Regenerate Certificate PDF">
                                                    <RefreshCw className={`w-3.5 h-3.5 ${regeneratingId === cert.id ? 'animate-spin text-amber-400' : ''}`} />
                                                </button>

                                                <button
                                                    onClick={() => setStatusTarget({ cert, nextStatus: isRevoked ? 'ACTIVE' : 'REVOKED' })}
                                                    className={`p-2 border rounded-xl transition-all ${isRevoked ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'}`}
                                                    title={isRevoked ? 'Activate Certificate' : 'Revoke Certificate'}>
                                                    {isRevoked ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                                                </button>

                                                <button
                                                    onClick={() => setDeleteTarget(cert)}
                                                    className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/20 transition-all"
                                                    title="Delete Permanently">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {pages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                        <button key={p} onClick={() => load(p)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${p === page ? 'bg-amber-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                            {p}
                        </button>
                    ))}
                </div>
            )}

            {/* Issue Modal */}
            {showIssueModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-[#111113] rounded-3xl border border-white/10 shadow-2xl p-8 space-y-6 relative">
                        <button onClick={() => setShowIssueModal(false)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                            <X className="w-5 h-5 text-gray-400" />
                        </button>

                        <div className="space-y-1">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Award className="w-5 h-5 text-amber-400" /> Issue Certificate
                            </h2>
                            <p className="text-xs text-gray-400">Select a student and a camp program to manually issue a verifiable certificate credential.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Student</label>
                                <select className={inputCls} value={issueForm.userId}
                                    onChange={e => setIssueForm(f => ({ ...f, userId: e.target.value }))}>
                                    <option value="">Select student…</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.name} — {u.email}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Camp</label>
                                <select className={inputCls} value={issueForm.campId}
                                    onChange={e => setIssueForm(f => ({ ...f, campId: e.target.value }))}>
                                    <option value="">Select camp program…</option>
                                    {camps.map(c => (
                                        <option key={c.id} value={c.id}>{c.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setShowIssueModal(false)}
                                className="px-4 py-2.5 text-xs text-gray-400 border border-white/10 rounded-xl hover:bg-white/5 font-semibold transition-all">
                                Cancel
                            </button>
                            <button onClick={handleIssue} disabled={issuing}
                                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-all disabled:opacity-50">
                                {issuing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />} Issue Credential
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Status Confirm */}
            {statusTarget && (
                <ConfirmModal
                    title={`${statusTarget.nextStatus === 'ACTIVE' ? 'Activate' : 'Revoke'} Certificate`}
                    message={statusTarget.nextStatus === 'ACTIVE' 
                        ? `Are you sure you want to activate the certificate credential for ${statusTarget.cert.user.name}? This will restore access to public verification.`
                        : `Are you sure you want to revoke the certificate credential for ${statusTarget.cert.user.name}? It will show as invalid/revoked on the public verification page.`
                    }
                    confirmLabel={statusTarget.nextStatus === 'ACTIVE' ? 'Activate' : 'Revoke'}
                    danger={statusTarget.nextStatus !== 'ACTIVE'}
                    onConfirm={handleToggleStatus}
                    onCancel={() => setStatusTarget(null)}
                />
            )}

            {/* Delete Confirm */}
            {deleteTarget && (
                <ConfirmModal
                    title="Delete Certificate"
                    message={`Are you sure you want to permanently delete ${deleteTarget.user.name}'s certificate for "${deleteTarget.camp.title}"? This cannot be undone.`}
                    confirmLabel="Delete Permanently"
                    danger
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </div>
    );
}
