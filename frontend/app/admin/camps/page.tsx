'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { Plus, BookOpen, Calendar, DollarSign, Users, ChevronRight, Loader2, Pencil, Trash2, Search, SlidersHorizontal, Globe, Tag } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmModal';
import { CampCardSkeleton } from '@/components/ui/Skeleton';

interface Brand { id: string; name: string; slug: string; icon: string | null; }

const EMPTY_FORM = {
    title: '', slug: '', description: '', thumbnail: '',
    price: 200, startDate: '', endDate: '',
    status: 'UPCOMING', level: 'BEGINNER', language: 'English',
    brandId: '', whatYouLearn: '', prerequisites: '',
};

const STATUS_COLORS: Record<string, string> = {
    ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    UPCOMING: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    COMPLETED: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

const LEVEL_COLORS: Record<string, string> = {
    BEGINNER: 'text-emerald-400',
    INTERMEDIATE: 'text-amber-400',
    ADVANCED: 'text-red-400',
};

function autoSlug(s: string) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export default function AdminCampsPage() {
    const toast = useToast();
    const confirm = useConfirm();
    const [camps, setCamps] = useState<any[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedCamp, setSelectedCamp] = useState<any>(null);
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [campsRes, brandsRes] = await Promise.all([
                api.get('/camps'),
                api.get('/brands'),
            ]);
            setCamps(campsRes.data.data ?? campsRes.data);
            setBrands(brandsRes.data);
        } catch {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm(f => ({ ...f, [field]: e.target.value }));

    const openCreate = () => {
        setSelectedCamp(null);
        setForm({ ...EMPTY_FORM });
        setShowModal(true);
    };

    const openEdit = (camp: any) => {
        setSelectedCamp(camp);
        const wyl = Array.isArray(camp.whatYouLearn) ? camp.whatYouLearn.join('\n') : '';
        const pre = Array.isArray(camp.prerequisites) ? camp.prerequisites.join('\n') : '';
        setForm({
            title: camp.title ?? '',
            slug: camp.slug ?? '',
            description: camp.description ?? '',
            thumbnail: camp.thumbnail ?? '',
            price: Number(camp.price) || 0,
            startDate: camp.startDate ? new Date(camp.startDate).toISOString().split('T')[0] : '',
            endDate: camp.endDate ? new Date(camp.endDate).toISOString().split('T')[0] : '',
            status: camp.status ?? 'UPCOMING',
            level: camp.level ?? 'BEGINNER',
            language: camp.language ?? 'English',
            brandId: camp.brandId ?? '',
            whatYouLearn: wyl,
            prerequisites: pre,
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                title: form.title,
                slug: form.slug || undefined,
                description: form.description || undefined,
                thumbnail: form.thumbnail || undefined,
                price: Number(form.price),
                startDate: form.startDate || undefined,
                endDate: form.endDate || undefined,
                status: form.status,
                level: form.level,
                language: form.language,
                brandId: form.brandId || undefined,
                whatYouLearn: form.whatYouLearn ? form.whatYouLearn.split('\n').map(s => s.trim()).filter(Boolean) : undefined,
                prerequisites: form.prerequisites ? form.prerequisites.split('\n').map(s => s.trim()).filter(Boolean) : undefined,
            };
            if (selectedCamp) {
                await api.patch(`/camps/${selectedCamp.id}`, payload);
                toast.success('Camp updated');
            } else {
                await api.post('/camps', payload);
                toast.success('Camp created');
            }
            setShowModal(false);
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || (selectedCamp ? 'Failed to update camp' : 'Failed to create camp'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (camp: any) => {
        const ok = await confirm({
            title: 'Delete Camp',
            message: `Delete "${camp.title}"? This will permanently delete all enrollments, progress, and certificates linked to this camp.`,
            confirmLabel: 'Delete',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/camps/${camp.id}`);
            toast.success('Camp deleted');
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete camp');
        }
    };

    const filtered = camps
        .filter(c => {
            const q = searchQuery.toLowerCase();
            const matchQ = !q || c.title.toLowerCase().includes(q) || (c.description ?? '').toLowerCase().includes(q);
            const matchS = statusFilter === 'ALL' || c.status === statusFilter;
            return matchQ && matchS;
        });

    const inputCls = 'w-full px-3 py-2.5 bg-surface-hover/50 border border-border rounded-xl outline-none text-sm focus:ring-2 focus:ring-violet-500/50 text-foreground placeholder:text-text-muted';

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Camp Management</h1>
                    <p className="text-gray-400 mt-1">Create and manage camp batches across all brands.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-xl transition-all font-semibold shadow-lg shadow-violet-600/20 self-start"
                >
                    <Plus className="w-5 h-5" />
                    Create Camp
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface p-4 rounded-2xl border border-border">
                <div className="relative w-full md:max-w-md">
                    <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                        placeholder="Search camps..."
                        className="w-full pl-10 pr-4 py-2.5 bg-surface-hover/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-violet-500/50 text-sm text-foreground placeholder:text-text-muted"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-surface-hover/50 border border-border rounded-xl px-3 py-1">
                        <SlidersHorizontal className="w-4 h-4 text-text-muted" />
                        <select
                            className="bg-transparent outline-none text-sm text-foreground py-1.5 cursor-pointer"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="ACTIVE">Active</option>
                            <option value="UPCOMING">Upcoming</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Camp grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                    <><CampCardSkeleton /><CampCardSkeleton /><CampCardSkeleton /><CampCardSkeleton /></>
                ) : filtered.length === 0 ? (
                    <div className="col-span-2 bg-surface p-12 rounded-2xl border border-border text-center text-text-muted">
                        No camps found matching your criteria.
                    </div>
                ) : (
                    filtered.map((camp) => (
                        <div key={camp.id} className="bg-surface border border-border rounded-2xl overflow-hidden hover:border-violet-500/30 transition-all flex flex-col group shadow-md text-foreground">
                            {camp.thumbnail && (
                                <div className="h-36 overflow-hidden">
                                    <img src={camp.thumbnail} alt={camp.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                </div>
                            )}
                            <div className="p-6 flex-1 space-y-3">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            {camp.brand?.icon && <span className="text-base">{camp.brand.icon}</span>}
                                            {camp.brand?.name && <span className="text-[11px] text-text-muted font-mono">{camp.brand.name}</span>}
                                        </div>
                                        <h3 className="text-lg font-bold group-hover:text-violet-400 transition-colors truncate">{camp.title}</h3>
                                        {camp.slug && <p className="text-[11px] text-text-muted/80 font-mono">/{camp.slug}</p>}
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border flex-shrink-0 ${STATUS_COLORS[camp.status] ?? ''}`}>
                                        {camp.status}
                                    </span>
                                </div>

                                {camp.description && (
                                    <p className="text-text-muted/95 text-sm line-clamp-2">{camp.description}</p>
                                )}

                                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-text-muted pt-1">
                                    <span className={`font-medium ${LEVEL_COLORS[camp.level ?? 'BEGINNER']}`}>{camp.level ?? 'BEGINNER'}</span>
                                    <span>{camp.language ?? 'English'}</span>
                                    <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{Number(camp.price).toLocaleString()}</span>
                                    {camp.startDate && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(camp.startDate).toLocaleDateString()}</span>}
                                </div>
                            </div>

                            <div className="px-6 py-3 border-t border-border flex justify-between items-center group-hover:bg-violet-600/5 transition-all">
                                <Link
                                    href={`/admin/camps/${camp.id}`}
                                    className="text-sm font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1"
                                >
                                    Manage Sessions
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => openEdit(camp)}
                                        className="text-xs text-text-muted hover:text-foreground font-bold flex items-center gap-1 transition-colors"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(camp)}
                                        className="text-xs text-red-500/70 hover:text-red-400 font-bold flex items-center gap-1 transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="w-full max-w-2xl bg-surface rounded-2xl border border-border shadow-2xl p-8 space-y-5 max-h-[90vh] overflow-y-auto text-foreground">
                        <h2 className="text-2xl font-bold">{selectedCamp ? 'Edit Camp' : 'Create Camp'}</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Row 1: Title + Slug */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Camp Title *</label>
                                    <input
                                        required
                                        placeholder="e.g. AOSPCamp — June 2026"
                                        className={inputCls}
                                        value={form.title}
                                        onChange={(e) => setForm(f => ({
                                            ...f,
                                            title: e.target.value,
                                            slug: f.slug || autoSlug(e.target.value),
                                        }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Slug (URL)</label>
                                    <input
                                        placeholder="aosp-june-2026"
                                        className={inputCls}
                                        value={form.slug}
                                        onChange={set('slug')}
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Description</label>
                                <textarea
                                    rows={3}
                                    className={`${inputCls} resize-none`}
                                    value={form.description}
                                    onChange={set('description')}
                                />
                            </div>

                            {/* Thumbnail */}
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Thumbnail URL</label>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    className={inputCls}
                                    value={form.thumbnail}
                                    onChange={set('thumbnail')}
                                />
                            </div>

                            {/* Brand + Level + Language */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Brand</label>
                                    <select className={inputCls} value={form.brandId} onChange={set('brandId')}>
                                        <option value="">No Brand</option>
                                        {brands.map(b => (
                                            <option key={b.id} value={b.id}>{b.icon} {b.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Level</label>
                                    <select className={inputCls} value={form.level} onChange={set('level')}>
                                        <option value="BEGINNER">Beginner</option>
                                        <option value="INTERMEDIATE">Intermediate</option>
                                        <option value="ADVANCED">Advanced</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Language</label>
                                    <input
                                        placeholder="English"
                                        className={inputCls}
                                        value={form.language}
                                        onChange={set('language')}
                                    />
                                </div>
                            </div>

                            {/* Price + Status + Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                    
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Price (EGP)</label>
                                    <input
                                        type="number"
                                        min={0}
                                        placeholder="200"
                                        className={inputCls}
                                        value={form.price}
                                        onChange={(e) => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Status</label>
                                    <select className={inputCls} value={form.status} onChange={set('status')}>
                                        <option value="UPCOMING">Upcoming</option>
                                        <option value="ACTIVE">Active</option>
                                        <option value="COMPLETED">Completed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Start Date</label>
                                    <input
                                        type="date"
                                        className={inputCls}
                                        value={form.startDate}
                                        onChange={set('startDate')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">End Date</label>
                                    <input
                                        type="date"
                                        className={inputCls}
                                        value={form.endDate}
                                        onChange={set('endDate')}
                                    />
                                </div>
                            </div>

                            {/* What You Learn */}
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">What You'll Learn</label>
                                <textarea
                                    rows={3}
                                    placeholder="One item per line..."
                                    className={inputCls + ' resize-none'}
                                    value={form.whatYouLearn}
                                    onChange={set('whatYouLearn')}
                                />
                            </div>

                            {/* Prerequisites */}
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Prerequisites</label>
                                <textarea
                                    rows={2}
                                    placeholder="One item per line..."
                                    className={inputCls + ' resize-none'}
                                    value={form.prerequisites}
                                    onChange={set('prerequisites')}
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white border border-white/10 hover:border-white/20 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-violet-600/20"
                                >
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {selectedCamp ? 'Save Changes' : 'Create Camp'}
                                </button>
                            </div>
                    </form>
                </div>
            </div>
            )}
        </div>
    );
}
