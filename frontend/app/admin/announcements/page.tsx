'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Plus, Loader2, Megaphone, Pin, Pencil, Trash2, Globe, BookOpen } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmModal';

interface Camp { id: string; title: string; }
interface Announcement {
    id: string;
    title: string;
    content: string;
    campId: string | null;
    pinned: boolean;
    createdAt: string;
    camp: { id: string; title: string } | null;
    createdBy: { id: string; name: string | null };
}

const EMPTY_FORM = { title: '', content: '', campId: '', pinned: false };

export default function AdminAnnouncementsPage() {
    const toast = useToast();
    const confirm = useConfirm();
    const [items, setItems] = useState<Announcement[]>([]);
    const [camps, setCamps] = useState<Camp[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({ ...EMPTY_FORM });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [annRes, campsRes] = await Promise.all([
                api.get('/announcements'),
                api.get('/camps'),
            ]);
            setItems(annRes.data);
            setCamps(campsRes.data.data ?? campsRes.data);
        } catch {
            toast.error('Failed to load announcements');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const openCreate = () => {
        setEditingId(null);
        setForm({ ...EMPTY_FORM });
        setShowForm(true);
    };

    const openEdit = (item: Announcement) => {
        setEditingId(item.id);
        setForm({ title: item.title, content: item.content, campId: item.campId ?? '', pinned: item.pinned });
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...form, campId: form.campId || null };
            if (editingId) {
                await api.patch(`/announcements/${editingId}`, payload);
                toast.success('Announcement updated');
            } else {
                await api.post('/announcements', payload);
                toast.success('Announcement published');
            }
            setShowForm(false);
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to save announcement');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (item: Announcement) => {
        const ok = await confirm({
            title: 'Delete Announcement',
            message: `Delete "${item.title}"? This cannot be undone.`,
            confirmLabel: 'Delete',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/announcements/${item.id}`);
            toast.success('Announcement deleted');
            fetchData();
        } catch {
            toast.error('Failed to delete announcement');
        }
    };

    const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm(f => ({ ...f, [field]: e.target.value }));

    const inputCls = 'w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl outline-none text-sm focus:ring-1 focus:ring-violet-500/50 placeholder:text-gray-600';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Announcements</h1>
                    <p className="text-gray-400 text-sm mt-1">Broadcast messages to all students or specific camps.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-xl text-sm font-bold transition-all"
                >
                    <Plus className="w-4 h-4" /> New Announcement
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="p-6 bg-[#111113] border border-white/10 rounded-2xl space-y-4">
                    <h2 className="font-bold text-lg">{editingId ? 'Edit Announcement' : 'New Announcement'}</h2>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Title *</label>
                        <input required placeholder="e.g. Week 3 content is now live!" className={inputCls} value={form.title} onChange={set('title')} />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Content *</label>
                        <textarea required rows={5} placeholder="Announcement body..." className={`${inputCls} resize-none`} value={form.content} onChange={set('content')} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Target Camp (leave blank for global)</label>
                            <select className={inputCls} value={form.campId} onChange={set('campId')}>
                                <option value="">🌍 Global — all students</option>
                                {camps.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <label className="flex items-center gap-3 cursor-pointer select-none">
                                <div className={`relative w-10 h-5 rounded-full transition-all ${form.pinned ? 'bg-violet-600' : 'bg-white/10'}`}
                                    onClick={() => setForm(f => ({ ...f, pinned: !f.pinned }))}>
                                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.pinned ? 'left-5' : 'left-0.5'}`} />
                                </div>
                                <span className="text-sm font-medium">Pin to top</span>
                            </label>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button type="submit" disabled={saving}
                            className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2">
                            {saving && <Loader2 className="animate-spin w-4 h-4" />}
                            {editingId ? 'Save Changes' : 'Publish'}
                        </button>
                        <button type="button" onClick={() => setShowForm(false)}
                            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold transition-all">
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin w-6 h-6 text-gray-500" /></div>
            ) : items.length === 0 ? (
                <div className="text-center py-14 text-gray-500">
                    <Megaphone className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No announcements yet.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {items.map(item => (
                        <div key={item.id} className={`p-5 rounded-2xl border transition-all ${item.pinned ? 'border-violet-500/20 bg-violet-500/5' : 'border-white/5 bg-[#111113]'}`}>
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                                        {item.campId ? <BookOpen className="w-4 h-4 text-violet-400" /> : <Globe className="w-4 h-4 text-sky-400" />}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            {item.pinned && <Pin className="w-3 h-3 text-violet-400" />}
                                            <span className="font-semibold truncate">{item.title}</span>
                                        </div>
                                        <p className="text-sm text-gray-400 line-clamp-2">{item.content}</p>
                                        <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-600">
                                            <span>{item.camp ? `📌 ${item.camp.title}` : '🌍 Global'}</span>
                                            <span>·</span>
                                            <span>{new Date(item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                            {item.createdBy.name && <><span>·</span><span>{item.createdBy.name}</span></>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button onClick={() => openEdit(item)} className="p-1.5 text-gray-500 hover:text-violet-400 transition-colors">
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(item)} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
