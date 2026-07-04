'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import {
    Plus, Folder, FolderOpen, Video, FileText, Code2, HelpCircle,
    X, Loader2, Trash2, Edit2, Search, ChevronDown, ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmModal';

// ─── Types ───────────────────────────────────────────────────────────────────

interface MasterSession {
    id: string;
    title: string;
    description: string | null;
    category: string;
    createdAt: string;
    materials?: any[];
    labs?: any[];
    quizzes?: any[];
    _count?: { campSessions: number };
}

const CATEGORIES = ['General', 'aospcamp', 'pcodamp', 'AICamp', 'EFluencyCamp'];

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    aospcamp:     { bg: 'bg-violet-500/10',  text: 'text-violet-400',  border: 'border-violet-500/20',  dot: 'bg-violet-400' },
    pcodamp:      { bg: 'bg-sky-500/10',     text: 'text-sky-400',     border: 'border-sky-500/20',     dot: 'bg-sky-400' },
    AICamp:       { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
    EFluencyCamp: { bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500/20',   dot: 'bg-amber-400' },
    General:      { bg: 'bg-gray-500/10',    text: 'text-gray-400',    border: 'border-gray-500/20',    dot: 'bg-gray-400' },
};

function getCat(cat: string) {
    return CATEGORY_COLORS[cat] ?? CATEGORY_COLORS['General'];
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SessionsPage() {
    const toast = useToast();
    const confirm = useConfirm();

    const [sessions, setSessions] = useState<MasterSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', category: 'General' });
    const [selectedSession, setSelectedSession] = useState<MasterSession | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Track which category folders are open (all open by default)
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

    const fetchSessions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/sessions');
            const data: MasterSession[] = res.data.data ?? res.data;
            setSessions(data);

            // Auto-open all categories on first load
            const cats = [...new Set(data.map(s => s.category || 'General'))];
            setOpenCategories(prev => {
                const next = { ...prev };
                cats.forEach(c => { if (next[c] === undefined) next[c] = true; });
                return next;
            });
        } catch {
            toast.error('Failed to load sessions');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchSessions(); }, [fetchSessions]);

    const toggleCategory = (cat: string) =>
        setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));

    const handleOpenModal = (session: MasterSession | null = null, defaultCategory?: string) => {
        if (session) {
            setSelectedSession(session);
            setFormData({ title: session.title, description: session.description || '', category: session.category || 'General' });
        } else {
            setSelectedSession(null);
            setFormData({ title: '', description: '', category: defaultCategory || 'General' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (selectedSession) {
                await api.put(`/sessions/${selectedSession.id}`, formData);
                toast.success('Session updated');
            } else {
                await api.post('/sessions', formData);
                toast.success('Session created');
            }
            setShowModal(false);
            fetchSessions();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to save session');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (session: MasterSession) => {
        const ok = await confirm({
            title: 'Delete Master Session',
            message: `Delete "${session.title}"? This will permanently remove all videos, PDFs, labs, and quizzes across ALL linked camps. This cannot be undone.`,
            confirmLabel: 'Delete Session',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/sessions/${session.id}`);
            toast.success('Session deleted');
            fetchSessions();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete session');
        }
    };

    // Group and filter
    const filtered = sessions.filter(s => {
        const q = searchQuery.toLowerCase();
        return !q || s.title.toLowerCase().includes(q) || (s.description ?? '').toLowerCase().includes(q);
    });

    const grouped: Record<string, MasterSession[]> = {};
    filtered.forEach(s => {
        const cat = s.category || 'General';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(s);
    });

    // Consistent order: known categories first, then any extras alphabetically
    const orderedCats = [
        ...CATEGORIES.filter(c => grouped[c]),
        ...Object.keys(grouped).filter(c => !CATEGORIES.includes(c)).sort(),
    ];

    const totalSessions = sessions.length;

    const inputCls = 'w-full px-4 py-2.5 bg-[#1a1a1c] border border-white/5 rounded-xl focus:ring-2 focus:ring-violet-500/50 outline-none text-sm text-white placeholder-gray-500';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Master Sessions Library</h1>
                    <p className="text-gray-400 text-sm mt-1">{totalSessions} sessions across {orderedCats.length} tracks — reusable across all camps.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-xl transition-all font-semibold self-start"
                >
                    <Plus className="w-5 h-5" /> New Session
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                    placeholder="Search sessions..."
                    className={`pl-10 pr-4 ${inputCls}`}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Category folder view */}
            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="animate-spin w-8 h-8 text-gray-600" /></div>
            ) : orderedCats.length === 0 ? (
                <div className="text-center py-16 bg-[#111113] rounded-2xl border border-dashed border-white/5 text-gray-500">
                    <Folder className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p>No sessions yet. Create your first master session.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {orderedCats.map(cat => {
                        const catSessions = grouped[cat];
                        const { bg, text, border, dot } = getCat(cat);
                        const isOpen = openCategories[cat] !== false;

                        return (
                            <div key={cat} className={`rounded-2xl border ${border} overflow-hidden`}>
                                {/* Category header (folder) */}
                                <div
                                    onClick={() => toggleCategory(cat)}
                                    className={`w-full flex items-center justify-between px-5 py-4 ${bg} hover:brightness-125 transition-all cursor-pointer`}
                                >
                                    <div className="flex items-center gap-3">
                                        {isOpen
                                            ? <FolderOpen className={`w-5 h-5 ${text}`} />
                                            : <Folder className={`w-5 h-5 ${text}`} />
                                        }
                                        <span className={`font-bold text-sm uppercase tracking-widest ${text}`}>{cat}</span>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${border} ${text}`}>
                                            {catSessions.length} session{catSessions.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span
                                            role="button"
                                            onClick={e => { e.stopPropagation(); handleOpenModal(null, cat); }}
                                            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border ${border} ${text} text-xs font-bold hover:brightness-125 transition-all cursor-pointer`}
                                        >
                                            <Plus className="w-3.5 h-3.5" /> Add
                                        </span>
                                        {isOpen
                                            ? <ChevronDown className={`w-4 h-4 ${text}`} />
                                            : <ChevronRight className={`w-4 h-4 ${text}`} />
                                        }
                                    </div>
                                </div>

                                {/* Sessions list inside folder */}
                                {isOpen && (
                                    <div className="divide-y divide-white/5">
                                        {catSessions.map(session => (
                                            <div key={session.id}
                                                className="flex items-center gap-4 px-5 py-4 bg-[#0e0e10] hover:bg-white/[0.02] transition-all group">
                                                {/* dot */}
                                                <div className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />

                                                {/* title + description */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-sm truncate">{session.title}</p>
                                                    {session.description && (
                                                        <p className="text-xs text-gray-500 truncate mt-0.5">{session.description}</p>
                                                    )}
                                                </div>

                                                {/* counts */}
                                                <div className="hidden sm:flex items-center gap-3 text-xs text-gray-600 shrink-0">
                                                    {(session.materials?.length ?? 0) > 0 && (
                                                        <span className="flex items-center gap-1">
                                                            <Video className="w-3 h-3" /> {session.materials!.length}
                                                        </span>
                                                    )}
                                                    {(session.labs?.length ?? 0) > 0 && (
                                                        <span className="flex items-center gap-1">
                                                            <Code2 className="w-3 h-3" /> {session.labs!.length}
                                                        </span>
                                                    )}
                                                    {(session.quizzes?.length ?? 0) > 0 && (
                                                        <span className="flex items-center gap-1">
                                                            <HelpCircle className="w-3 h-3" /> {session.quizzes!.length}
                                                        </span>
                                                    )}
                                                    {(session._count?.campSessions ?? 0) > 0 && (
                                                        <span className={`font-semibold ${text}`}>
                                                            {session._count!.campSessions} camp{session._count!.campSessions !== 1 ? 's' : ''}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* actions */}
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                    <Link
                                                        href={`/admin/sessions/${session.id}`}
                                                        className="px-3 py-1.5 bg-violet-600/20 hover:bg-violet-600 text-violet-400 hover:text-white border border-violet-500/30 rounded-lg text-xs font-bold transition-all"
                                                    >
                                                        Content
                                                    </Link>
                                                    <button
                                                        onClick={() => handleOpenModal(session)}
                                                        className="p-1.5 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(session)}
                                                        className="p-1.5 text-gray-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            
            {/* Create / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-[#111113] rounded-2xl border border-white/10 shadow-2xl p-8 space-y-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold">{selectedSession ? 'Edit Session' : 'Create Master Session'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Title *</label>
                                <input
                                    required
                                    placeholder="e.g. Introduction to AOSP"
                                    className={inputCls}
                                    value={formData.title}
                                    onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Category</label>
                                <select
                                    className={inputCls}
                                    value={formData.category}
                                    onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                                >
                                    {CATEGORIES.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Description</label>
                                <textarea
                                    rows={3}
                                    placeholder="Brief summary of this session's content..."
                                    className={inputCls + ' resize-none'}
                                    value={formData.description}
                                    onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                                />
                            </div>

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
                                    className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-violet-600 hover:bg-violet-500 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-violet-600/20"
                                >
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {selectedSession ? 'Save Changes' : 'Create Session'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}