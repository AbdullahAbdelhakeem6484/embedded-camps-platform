'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { Award, Plus, Trash2, ExternalLink, Loader2, Search, X } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface Certificate {
    id: string;
    issuedAt: string;
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
    const [showIssueModal, setShowIssueModal] = useState(false);
    const [revokeTarget, setRevokeTarget] = useState<Certificate | null>(null);
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
    }, []);

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

    const handleRevoke = async () => {
        if (!revokeTarget) return;
        try {
            await api.delete(`/certificates/${revokeTarget.id}`);
            toast.success('Certificate revoked');
            setRevokeTarget(null);
            load(page);
        } catch {
            toast.error('Failed to revoke certificate');
        }
    };

    const filtered = search
        ? certs.filter(c =>
            c.user.name.toLowerCase().includes(search.toLowerCase()) ||
            c.user.email.toLowerCase().includes(search.toLowerCase()) ||
            c.camp.title.toLowerCase().includes(search.toLowerCase())
        )
        : certs;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Award className="w-8 h-8 text-amber-400" />Certificates
                    </h1>
                    <p className="text-gray-400 mt-1">{total} total certificates issued</p>
                </div>
                <button onClick={openIssue}
                    className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold text-sm transition-all">
                    <Plus className="w-4 h-4" />Issue Certificate
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                    className="w-full pl-9 pr-4 py-2.5 bg-[#111113] border border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/50"
                    placeholder="Search by student or camp…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="bg-[#111113] rounded-2xl border border-white/5 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">No certificates found.</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="border-b border-white/5">
                            <tr className="text-left">
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Student</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Camp</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Issued</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.map(cert => (
                                <tr key={cert.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white">{cert.user.name}</div>
                                        <div className="text-xs text-gray-500">{cert.user.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white">{cert.camp.title}</div>
                                        <div className="text-xs text-gray-500">/{cert.camp.slug}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">
                                        {new Date(cert.issuedAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <a href={`/verify/${cert.id}`} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-xs font-medium hover:bg-amber-500/20 transition-all">
                                                <ExternalLink className="w-3 h-3" />Verify
                                            </a>
                                            <button
                                                onClick={() => setRevokeTarget(cert)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-all">
                                                <Trash2 className="w-3 h-3" />Revoke
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {pages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                        <button key={p} onClick={() => load(p)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${p === page ? 'bg-violet-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                            {p}
                        </button>
                    ))}
                </div>
            )}

            {/* Issue Modal */}
            {showIssueModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-[#111113] rounded-2xl border border-white/10 shadow-2xl p-8 space-y-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Award className="w-5 h-5 text-amber-400" />Issue Certificate
                            </h2>
                            <button onClick={() => setShowIssueModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
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
                                    <option value="">Select camp…</option>
                                    {camps.map(c => (
                                        <option key={c.id} value={c.id}>{c.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setShowIssueModal(false)}
                                className="px-4 py-2 text-sm text-gray-400 border border-white/10 rounded-xl hover:bg-white/5 transition-all">
                                Cancel
                            </button>
                            <button onClick={handleIssue} disabled={issuing}
                                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-all disabled:opacity-50">
                                {issuing && <Loader2 className="w-4 h-4 animate-spin" />}Issue Certificate
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Revoke Confirm */}
            {revokeTarget && (
                <ConfirmModal
                    title="Revoke Certificate"
                    message={`Revoke ${revokeTarget.user.name}'s certificate for "${revokeTarget.camp.title}"? This cannot be undone.`}
                    confirmLabel="Revoke"
                    danger
                    onConfirm={handleRevoke}
                    onCancel={() => setRevokeTarget(null)}
                />
            )}
        </div>
    );
}
