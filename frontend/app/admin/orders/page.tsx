'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import {
    Plus, Loader2, Search, DollarSign, CheckCircle2, Clock,
    XCircle, Pencil, Trash2, ChevronRight, TrendingUp, AlertCircle,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmModal';

interface Order {
    id: string;
    studentName: string;
    studentEmail: string;
    campId: string;
    amount: string;
    currency: string;
    paymentMethod: string;
    paymentRef: string | null;
    status: 'PENDING' | 'VERIFIED' | 'REFUNDED' | 'CANCELLED';
    notes: string | null;
    verifiedAt: string | null;
    createdAt: string;
    camp: { id: string; title: string };
    verifiedBy: { id: string; name: string | null } | null;
}

interface Stats {
    totalRevenue: number;
    totalOrders: number;
    monthRevenue: number;
    monthOrders: number;
    pending: number;
    verified: number;
}

interface Camp { id: string; title: string; }

const STATUS_CONFIG = {
    PENDING: { label: 'Pending', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: Clock },
    VERIFIED: { label: 'Verified', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
    REFUNDED: { label: 'Refunded', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20', icon: TrendingUp },
    CANCELLED: { label: 'Cancelled', color: 'text-gray-400 bg-gray-500/10 border-gray-500/20', icon: XCircle },
};

const METHOD_LABELS: Record<string, string> = {
    INSTAPAY: 'InstaPay', IBAN: 'IBAN', WALLET: 'Wallet', OTHER: 'Other',
};

const EMPTY_FORM = {
    studentName: '', studentEmail: '', campId: '', amount: '',
    currency: 'USD', paymentMethod: 'INSTAPAY', paymentRef: '', notes: '',
};

export default function AdminOrdersPage() {
    const toast = useToast();
    const confirm = useConfirm();
    const [orders, setOrders] = useState<Order[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [camps, setCamps] = useState<Camp[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params: any = { page, limit: 25 };
            if (statusFilter !== 'ALL') params.status = statusFilter;
            if (search) params.search = search;

            const [ordersRes, statsRes, campsRes] = await Promise.all([
                api.get('/orders', { params }),
                api.get('/orders/stats'),
                api.get('/camps'),
            ]);
            setOrders(ordersRes.data.data);
            setTotalPages(ordersRes.data.pages);
            setStats(statsRes.data);
            setCamps(campsRes.data.data ?? campsRes.data);
        } catch {
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, search]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm(prev => ({ ...prev, [f]: e.target.value }));

    const openCreate = () => { setEditingId(null); setForm({ ...EMPTY_FORM }); setShowForm(true); };
    const openEdit = (o: Order) => {
        setEditingId(o.id);
        setForm({
            studentName: o.studentName, studentEmail: o.studentEmail, campId: o.campId,
            amount: o.amount, currency: o.currency, paymentMethod: o.paymentMethod,
            paymentRef: o.paymentRef ?? '', notes: o.notes ?? '',
        });
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...form, amount: Number(form.amount), paymentRef: form.paymentRef || undefined, notes: form.notes || undefined };
            if (editingId) {
                await api.patch(`/orders/${editingId}`, payload);
                toast.success('Order updated');
            } else {
                await api.post('/orders', payload);
                toast.success('Order created');
            }
            setShowForm(false);
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to save order');
        } finally {
            setSaving(false);
        }
    };

    const handleVerify = async (order: Order) => {
        try {
            await api.patch(`/orders/${order.id}`, { status: 'VERIFIED' });
            toast.success('Payment verified');
            fetchData();
        } catch {
            toast.error('Failed to verify order');
        }
    };

    const handleDelete = async (order: Order) => {
        const ok = await confirm({
            title: 'Delete Order',
            message: `Delete order for ${order.studentName}? This cannot be undone.`,
            confirmLabel: 'Delete', variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/orders/${order.id}`);
            toast.success('Order deleted');
            fetchData();
        } catch {
            toast.error('Failed to delete order');
        }
    };

    const inputCls = 'w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl outline-none text-sm focus:ring-1 focus:ring-violet-500/50 placeholder:text-gray-600';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Payment Orders</h1>
                    <p className="text-gray-400 text-sm mt-1">Track manual WhatsApp payments (InstaPay / IBAN).</p>
                </div>
                <button onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-xl text-sm font-bold transition-all">
                    <Plus className="w-4 h-4" /> New Order
                </button>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, color: 'text-emerald-400', sub: `${stats.totalOrders} verified orders` },
                        { label: 'This Month', value: `$${stats.monthRevenue.toLocaleString()}`, color: 'text-violet-400', sub: `${stats.monthOrders} orders` },
                        { label: 'Pending', value: stats.pending, color: 'text-amber-400', sub: 'awaiting verification' },
                        { label: 'Verified', value: stats.verified, color: 'text-sky-400', sub: 'all time' },
                    ].map(s => (
                        <div key={s.label} className="bg-[#111113] border border-white/5 rounded-2xl p-5">
                            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                            <p className="text-xs font-medium text-gray-400 mt-0.5">{s.label}</p>
                            <p className="text-[11px] text-gray-600 mt-0.5">{s.sub}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Pending alert */}
            {stats && stats.pending > 0 && (
                <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-400">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span><strong>{stats.pending}</strong> payment{stats.pending > 1 ? 's' : ''} pending verification. Verify once you confirm receipt.</span>
                </div>
            )}

            {/* Create/Edit form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="p-6 bg-[#111113] border border-white/10 rounded-2xl space-y-4">
                    <h2 className="font-bold text-lg">{editingId ? 'Edit Order' : 'Record Payment'}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Student Name *</label>
                            <input required placeholder="Ahmed Hassan" className={inputCls} value={form.studentName} onChange={set('studentName')} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Student Email *</label>
                            <input required type="email" placeholder="ahmed@example.com" className={inputCls} value={form.studentEmail} onChange={set('studentEmail')} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Camp *</label>
                            <select required className={inputCls} value={form.campId} onChange={set('campId')}>
                                <option value="">Select camp...</option>
                                {camps.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Amount *</label>
                                <input required type="number" min={1} step="0.01" placeholder="100" className={inputCls} value={form.amount} onChange={set('amount')} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Currency</label>
                                <select className={inputCls} value={form.currency} onChange={set('currency')}>
                                    <option value="USD">USD</option>
                                    <option value="EGP">EGP</option>
                                    <option value="EUR">EUR</option>
                                    <option value="GBP">GBP</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Payment Method</label>
                            <select className={inputCls} value={form.paymentMethod} onChange={set('paymentMethod')}>
                                <option value="INSTAPAY">InstaPay</option>
                                <option value="IBAN">IBAN Bank Transfer</option>
                                <option value="WALLET">Mobile Wallet</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Payment Reference / Note</label>
                            <input placeholder="Transaction ID or screenshot note" className={inputCls} value={form.paymentRef} onChange={set('paymentRef')} />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Internal Notes</label>
                            <textarea rows={2} placeholder="Any admin notes..." className={`${inputCls} resize-none`} value={form.notes} onChange={set('notes')} />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button type="submit" disabled={saving}
                            className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2">
                            {saving && <Loader2 className="animate-spin w-4 h-4" />}
                            {editingId ? 'Save Changes' : 'Record Payment'}
                        </button>
                        <button type="button" onClick={() => setShowForm(false)}
                            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold transition-all">
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    <input
                        placeholder="Search by name, email, or ref..."
                        className="w-full pl-10 pr-4 py-2.5 bg-[#111113] border border-white/5 rounded-xl outline-none text-sm focus:ring-1 focus:ring-violet-500/50 placeholder:text-gray-600"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>
                <select
                    className="px-4 py-2.5 bg-[#111113] border border-white/5 rounded-xl outline-none text-sm"
                    value={statusFilter}
                    onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                >
                    <option value="ALL">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="VERIFIED">Verified</option>
                    <option value="REFUNDED">Refunded</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin w-6 h-6 text-gray-500" /></div>
            ) : orders.length === 0 ? (
                <div className="text-center py-14 text-gray-500 bg-[#111113] rounded-2xl border border-white/5">
                    <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p>No orders found.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {orders.map(order => {
                        const { label, color, icon: StatusIcon } = STATUS_CONFIG[order.status];
                        return (
                            <div key={order.id} className="bg-[#111113] border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="flex-1 min-w-0 space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[11px] font-bold ${color}`}>
                                            <StatusIcon className="w-3 h-3" />{label}
                                        </span>
                                        <span className="text-xs text-gray-500">{METHOD_LABELS[order.paymentMethod]}</span>
                                        <span className="text-xs text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="font-semibold text-sm">{order.studentName} <span className="text-gray-500 font-normal">({order.studentEmail})</span></p>
                                    <p className="text-xs text-gray-500">{order.camp.title}</p>
                                    {order.paymentRef && <p className="text-xs text-gray-600 font-mono">Ref: {order.paymentRef}</p>}
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                    <span className="font-bold text-emerald-400 text-sm">{order.currency} {Number(order.amount).toLocaleString()}</span>

                                    {order.status === 'PENDING' && (
                                        <button onClick={() => handleVerify(order)}
                                            className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 rounded-lg text-xs font-bold transition-all">
                                            ✓ Verify
                                        </button>
                                    )}
                                    <button onClick={() => openEdit(order)} className="p-1.5 text-gray-500 hover:text-violet-400 transition-colors">
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(order)} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 pt-2">
                            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs disabled:opacity-30 transition-all">
                                ← Prev
                            </button>
                            <span className="px-3 py-1.5 text-xs text-gray-500">{page} / {totalPages}</span>
                            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs disabled:opacity-30 transition-all">
                                Next →
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
