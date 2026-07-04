'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Plus, Loader2, Pencil, Trash2, Globe, ChevronUp, ChevronDown } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmModal';

interface Brand {
    id: string;
    name: string;
    slug: string;
    tagline: string | null;
    description: string | null;
    icon: string | null;
    color: string | null;
    status: 'LIVE' | 'COMING_SOON' | 'ARCHIVED';
    order: number;
    camps: { id: string; title: string; slug: string | null; status: string }[];
}

interface BrandFormState {
    name: string;
    slug: string;
    tagline: string;
    description: string;
    icon: string;
    color: string;
    status: 'LIVE' | 'COMING_SOON' | 'ARCHIVED';
    order: number;
}

const EMPTY_FORM: BrandFormState = {
    name: '', slug: '', tagline: '', description: '', icon: '', color: '', status: 'COMING_SOON', order: 0,
};

const STATUS_COLORS: Record<string, string> = {
    LIVE: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    COMING_SOON: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    ARCHIVED: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
};

const STATUS_LABELS: Record<string, string> = {
    LIVE: 'Live',
    COMING_SOON: 'Coming Soon',
    ARCHIVED: 'Archived',
};

export default function AdminBrandsPage() {
    const toast = useToast();
    const confirm = useConfirm();
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<BrandFormState>({ ...EMPTY_FORM });

    const fetchBrands = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/brands');
            setBrands(res.data);
        } catch {
            toast.error('Failed to load brands');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchBrands(); }, [fetchBrands]);

    const openCreate = () => {
        setEditingId(null);
        setForm({ ...EMPTY_FORM, order: brands.length });
        setShowForm(true);
    };

    const openEdit = (brand: Brand) => {
        setEditingId(brand.id);
        setForm({
            name: brand.name,
            slug: brand.slug,
            tagline: brand.tagline ?? '',
            description: brand.description ?? '',
            icon: brand.icon ?? '',
            color: brand.color ?? '',
            status: brand.status,
            order: brand.order,
        });
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...form,
                tagline: form.tagline || undefined,
                description: form.description || undefined,
                icon: form.icon || undefined,
                color: form.color || undefined,
            };
            if (editingId) {
                await api.patch(`/brands/${editingId}`, payload);
                toast.success('Brand updated');
            } else {
                await api.post('/brands', payload);
                toast.success('Brand created');
            }
            setShowForm(false);
            setEditingId(null);
            setForm({ ...EMPTY_FORM });
            fetchBrands();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to save brand');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (brand: Brand) => {
        const ok = await confirm({
            title: 'Delete Brand',
            message: `Delete "${brand.name}"? This will unlink all associated camps but won't delete them.`,
            confirmLabel: 'Delete',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/brands/${brand.id}`);
            toast.success('Brand deleted');
            fetchBrands();
        } catch {
            toast.error('Failed to delete brand');
        }
    };

    const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm(f => ({ ...f, [field]: e.target.value }));

    const autoSlug = (name: string) =>
        name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    const inputCls = 'w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl outline-none text-sm focus:ring-1 focus:ring-violet-500/50 placeholder:text-gray-600';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Brands</h1>
                    <p className="text-gray-400 text-sm mt-1">Manage camp brands (AOSPCamp, PCodeCamp, AICamp, EnglishFluencyCamp)</p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-xl text-sm font-bold transition-all"
                >
                    <Plus className="w-4 h-4" />
                    New Brand
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="p-6 bg-[#111113] border border-white/10 rounded-2xl space-y-4">
                    <h2 className="font-bold text-lg">{editingId ? 'Edit Brand' : 'New Brand'}</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Brand Name *</label>
                            <input
                                required
                                placeholder="e.g. AOSPCamp"
                                className={inputCls}
                                value={form.name}
                                onChange={(e) => {
                                    setForm(f => ({ ...f, name: e.target.value, slug: f.slug || autoSlug(e.target.value) }));
                                }}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Slug * (URL-safe)</label>
                            <input
                                required
                                placeholder="e.g. aosp"
                                className={inputCls}
                                value={form.slug}
                                onChange={set('slug')}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Icon (emoji)</label>
                            <input
                                placeholder="⚙️"
                                className={inputCls}
                                value={form.icon}
                                onChange={set('icon')}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Color Hint</label>
                            <input
                                placeholder="violet / #8b5cf6 / emerald-500"
                                className={inputCls}
                                value={form.color}
                                onChange={set('color')}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Tagline</label>
                            <input
                                placeholder="Short pitch line shown on landing page"
                                className={inputCls}
                                value={form.tagline}
                                onChange={set('tagline')}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Description</label>
                            <textarea
                                rows={3}
                                placeholder="Full description of this brand..."
                                className={`${inputCls} resize-none`}
                                value={form.description}
                                onChange={set('description')}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Status</label>
                            <select className={inputCls} value={form.status} onChange={set('status')}>
                                <option value="LIVE">Live</option>
                                <option value="COMING_SOON">Coming Soon</option>
                                <option value="ARCHIVED">Archived</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Display Order</label>
                            <input
                                type="number"
                                min={0}
                                className={inputCls}
                                value={form.order}
                                onChange={(e) => setForm(f => ({ ...f, order: Number(e.target.value) }))}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {saving && <Loader2 className="animate-spin w-4 h-4" />}
                            {editingId ? 'Save Changes' : 'Create Brand'}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setShowForm(false); setEditingId(null); }}
                            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Brand list */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
                </div>
            ) : brands.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                    <Globe className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No brands yet. Create your first brand to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {brands.map((brand) => (
                        <div key={brand.id} className="p-5 bg-[#111113] border border-white/10 rounded-2xl space-y-3">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    {brand.icon && (
                                        <span className="text-2xl flex-shrink-0">{brand.icon}</span>
                                    )}
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-white truncate">{brand.name}</h3>
                                        <p className="text-xs text-gray-500 font-mono">/{brand.slug}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[brand.status]}`}>
                                        {STATUS_LABELS[brand.status]}
                                    </span>
                                    <button
                                        onClick={() => openEdit(brand)}
                                        className="p-1.5 text-gray-500 hover:text-violet-400 transition-colors"
                                        title="Edit"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(brand)}
                                        className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {brand.tagline && (
                                <p className="text-sm text-gray-400">{brand.tagline}</p>
                            )}

                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span>{brand.camps.length} camp{brand.camps.length !== 1 ? 's' : ''}</span>
                                <span>·</span>
                                <span>Order: {brand.order}</span>
                            </div>

                            {brand.camps.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {brand.camps.map(camp => (
                                        <span key={camp.id} className="px-2 py-0.5 bg-white/5 rounded-lg text-[11px] text-gray-400 border border-white/5">
                                            {camp.title}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
