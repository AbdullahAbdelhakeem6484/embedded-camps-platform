'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { Users, Filter, Loader2, Search, Edit2, Trash2, Award, X, Check } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface Enrollment {
    id: string;
    status: string;
    enrolledAt: string;
    expiresAt: string | null;
    user: { id: string; name: string; email: string };
    camp: { id: string; title: string; slug: string };
}

const STATUS_COLORS: Record<string, string> = {
    ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    EXPIRED: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const inputCls = 'w-full px-4 py-2.5 bg-[#1a1a1c] border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/50 text-sm transition-all';

export default function AdminEnrollmentsPage() {
    const toast = useToast();
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [editTarget, setEditTarget] = useState<Enrollment | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Enrollment | null>(null);
    const [editForm, setEditForm] = useState({ status: '', expiresAt: '' });
    const [saving, setSaving] = useState(false);
    const [issuingCert, setIssuingCert] = useState<string | null>(null);

    const load = useCallback(async (p = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(p) });
            if (statusFilter) params.set('status', statusFilter);
            const { data } = await api.get(`/users/enrollments?${params}`);
            setEnrollments(data.data);
            setTotal(data.total);
            setPage(data.page);
            setPages(data.pages);
        } catch {
            toast.error('Failed to load enrollments');
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => { load(1); }, [load]);

    const openEdit = (e: Enrollment) => {
        setEditTarget(e);
        setEditForm({
            status: e.status,
            expiresAt: e.expiresAt ? e.expiresAt.slice(0, 10) : '',
        });
    };

    const handleSave = async () => {
        if (!editTarget) return;
        setSaving(true);
        try {
            await api.patch(`/users/enrollments/${editTarget.id}`, {
                status: editForm.status,
                expiresAt: editForm.expiresAt ? new Date(editForm.expiresAt).toISOString() : null,
            });
            toast.success('Enrollment updated');
            setEditTarget(null);
            load(page);
        } catch (e: any) {
            toast.error(e.response?.data?.message ?? 'Failed to update enrollment');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await api.delete(`/users/enrollments/${deleteTarget.id}`);
            toast.success('Enrollment removed');
            setDeleteTarget(null);
            load(page);
        } catch {
            toast.error('Failed to remove enrollment');
        }
    };

    const handleIssueCert = async (enrollment: Enrollment) => {
        setIssuingCert(enrollment.id);
        try {
            await api.post('/certificates/issue', {
                userId: enrollment.user.id,
                campId: enrollment.camp.id,
            });
            toast.success(`Certificate issued to ${enrollment.user.name}`);
        } catch (e: any) {
            toast.error(e.response?.data?.message ?? 'Failed to issue certificate');
        } finally {
            setIssuingCert(null);
        }
    };

    const filtered = search
        ? enrollments.filter(e =>
            e.user.name.toLowerCase().includes(search.toLowerCase()) ||
            e.user.email.toLowerCase().includes(search.toLowerCase()) ||
            e.camp.title.toLowerCase().includes(search.toLowerCase())
        )
        : enrollments;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Users className="w-8 h-8 text-violet-400" />Enrollments
                    </h1>
                    <p className="text-gray-400 mt-1">{total} total enrollments</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input className="w-full pl-9 pr-4 py-2.5 bg-[#111113] border border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/50"
                        placeholder="Search student or camp…"
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select className="px-3 py-2.5 bg-[#111113] border border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/50"
                        value={statusFilter} onChange={e => { setStatusFilter(e.target.value); }}>
                        <option value="">All Statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="PENDING">Pending</option>
                        <option value="EXPIRED">Expired</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#111113] rounded-2xl border border-white/5 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-violet-500" /></div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">No enrollments found.</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="border-b border-white/5">
                            <tr className="text-left">
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Student</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Camp</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Enrolled</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Expires</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.map(enr => (
                                <tr key={enr.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white">{enr.user.name}</div>
                                        <div className="text-xs text-gray-500">{enr.user.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white">{enr.camp.title}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${STATUS_COLORS[enr.status] ?? 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                                            {enr.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 text-xs">
                                        {new Date(enr.enrolledAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 text-xs">
                                        {enr.expiresAt ? new Date(enr.expiresAt).toLocaleDateString() : '—'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <button onClick={() => openEdit(enr)}
                                                className="flex items-center gap-1 px-2.5 py-1.5 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-lg text-xs font-medium hover:bg-violet-500/20 transition-all">
                                                <Edit2 className="w-3 h-3" />Edit
                                            </button>
                                            <button onClick={() => handleIssueCert(enr)}
                                                disabled={issuingCert === enr.id}
                                                className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-xs font-medium hover:bg-amber-500/20 transition-all disabled:opacity-50">
                                                {issuingCert === enr.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Award className="w-3 h-3" />}Cert
                                            </button>
                                            <button onClick={() => setDeleteTarget(enr)}
                                                className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-all">
                                                <Trash2 className="w-3 h-3" />
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

            {/* Edit Modal */}
            {editTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-[#111113] rounded-2xl border border-white/10 shadow-2xl p-8 space-y-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold">Edit Enrollment</h2>
                            <button onClick={() => setEditTarget(null)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <div className="text-sm text-gray-400">
                            <span className="text-white font-medium">{editTarget.user.name}</span> → {editTarget.camp.title}
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Status</label>
                                <select className={inputCls} value={editForm.status}
                                    onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}>
                                    <option value="ACTIVE">ACTIVE</option>
                                    <option value="PENDING">PENDING</option>
                                    <option value="EXPIRED">EXPIRED</option>
                                    <option value="CANCELLED">CANCELLED</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Expiry Date</label>
                                <input type="date" className={inputCls} value={editForm.expiresAt}
                                    onChange={e => setEditForm(f => ({ ...f, expiresAt: e.target.value }))} />
                                <p className="text-[10px] text-gray-600 mt-1">Leave blank for no expiry.</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setEditTarget(null)}
                                className="px-4 py-2 text-sm text-gray-400 border border-white/10 rounded-xl hover:bg-white/5 transition-all">
                                Cancel
                            </button>
                            <button onClick={handleSave} disabled={saving}
                                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white rounded-xl transition-all disabled:opacity-50">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {deleteTarget && (
                <ConfirmModal
                    title="Remove Enrollment"
                    message={`Remove ${deleteTarget.user.name}'s enrollment in "${deleteTarget.camp.title}"? The student will lose access.`}
                    confirmLabel="Remove"
                    danger
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </div>
    );
}
