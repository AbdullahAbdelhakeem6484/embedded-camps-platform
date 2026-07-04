'use client';

import { useEffect, useState, use, useCallback } from 'react';
import api from '@/lib/api';
import {
    Plus, Play, FileText, Eye, EyeOff, Loader2, ArrowLeft,
    Code2, HelpCircle, Trash2, Link2, Folder,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmModal';

interface MasterSession {
    id: string;
    title: string;
    description: string | null;
    category: string;
    materials?: any[];
    labs?: any[];
    quizzes?: any[];
}

interface CampSession {
    id: string;
    order: number;
    isVisible: boolean;
    masterSession: MasterSession;
}

const CATEGORY_COLORS: Record<string, string> = {
    aospcamp: 'text-violet-400',
    pcodamp: 'text-sky-400',
    AICamp: 'text-emerald-400',
    EFluencyCamp: 'text-amber-400',
    General: 'text-gray-400',
};

export default function AdminCampSessionsPage({ params }: { params: any }) {
    const { id } = (use(params) as any);
    const toast = useToast();
    const confirm = useConfirm();

    const [camp, setCamp] = useState<any>(null);
    const [allSessions, setAllSessions] = useState<MasterSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [linkForm, setLinkForm] = useState({ sessionId: '', order: 1 });

    const fetchData = useCallback(async () => {
        try {
            const [campRes, sessionsRes] = await Promise.all([
                api.get(`/camps/${id}`),
                api.get('/sessions'),
            ]);
            setCamp(campRes.data);
            setAllSessions(sessionsRes.data.data ?? sessionsRes.data);
        } catch {
            toast.error('Failed to load camp data');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleLinkSession = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!linkForm.sessionId) { toast.error('Select a session first'); return; }
        setSubmitting(true);
        try {
            await api.post(`/camps/${id}/sessions`, linkForm);
            setShowModal(false);
            toast.success('Session linked to camp');
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to link session');
        } finally {
            setSubmitting(false);
        }
    };

    const toggleVisibility = async (cs: CampSession) => {
        try {
            await api.patch(`/camps/camp-sessions/${cs.id}/visibility`, { isVisible: !cs.isVisible });
            toast.success(cs.isVisible ? 'Session hidden from students' : 'Session now visible');
            fetchData();
        } catch {
            toast.error('Failed to update visibility');
        }
    };

    const handleUnlink = async (cs: CampSession) => {
        const ok = await confirm({
            title: 'Unlink Session',
            message: `Remove "${cs.masterSession.title}" from this camp? The master session and all its content are preserved.`,
            confirmLabel: 'Unlink',
            variant: 'warning',
        });
        if (!ok) return;
        try {
            await api.delete(`/camps/camp-sessions/${cs.id}`);
            toast.success('Session unlinked');
            fetchData();
        } catch {
            toast.error('Failed to unlink session');
        }
    };

    const linkedIds = new Set((camp?.campSessions ?? []).map((cs: CampSession) => cs.masterSession.id));
    const available = allSessions.filter(s => !linkedIds.has(s.id));
    const grouped: Record<string, MasterSession[]> = {};
    available.forEach(s => {
        const cat = s.category || 'General';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(s);
    });
    const groupedEntries = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));

    if (loading) return (
        <div className="flex justify-center py-20">
            <Loader2 className="animate-spin w-8 h-8 text-gray-500" />
        </div>
    );
    if (!camp) return <div className="text-gray-500 p-8">Camp not found.</div>;

    const campSessions: CampSession[] = [...(camp.campSessions ?? [])].sort((a: CampSession, b: CampSession) => a.order - b.order);

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Link href="/admin/camps" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                    <ArrowLeft className="w-5 h-5 text-gray-400" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">{camp.title}</h1>
                    <p className="text-gray-400 text-sm">Manage which sessions are linked and visible to enrolled engineers.</p>
                </div>
            </div>

            {/* Stats bar */}
            <div className="flex items-center justify-between bg-[#111113] border border-white/5 rounded-2xl px-6 py-4">
                <div className="flex items-center gap-6 text-sm text-gray-400">
                    <span><strong className="text-white">{campSessions.length}</strong> sessions linked</span>
                    <span><strong className="text-emerald-400">{campSessions.filter(cs => cs.isVisible).length}</strong> visible</span>
                    <span><strong className="text-amber-400">{campSessions.filter(cs => !cs.isVisible).length}</strong> hidden</span>
                </div>
                <button
                    onClick={() => {
                        setLinkForm({ sessionId: '', order: campSessions.length + 1 });
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-xl text-sm font-bold transition-all"
                >
                    <Link2 className="w-4 h-4" /> Link Session
                </button>
            </div>

            {/* Session list */}
            {campSessions.length === 0 ? (
                <div className="text-center py-16 bg-[#111113] rounded-2xl border border-dashed border-white/5 text-gray-500">
                    <Folder className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p>No sessions linked yet. Click "Link Session" to add one.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {campSessions.map(cs => {
                        const s = cs.masterSession;
                        const catColor = CATEGORY_COLORS[s.category] ?? 'text-gray-400';
                        return (
                            <div key={cs.id}
                                className={`bg-[#111113] border rounded-2xl overflow-hidden transition-all ${cs.isVisible ? 'border-white/5' : 'border-white/[0.03] opacity-70'}`}>
                                <div className="flex items-center gap-4 px-5 py-4">
                                    <span className="text-xs font-bold text-gray-600 w-6 text-center shrink-0">#{cs.order}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-semibold truncate">{s.title}</p>
                                            <span className={`text-[10px] font-bold uppercase ${catColor}`}>{s.category}</span>
                                        </div>
                                        {s.description && (
                                            <p className="text-xs text-gray-500 truncate mt-0.5">{s.description}</p>
                                        )}
                                    </div>

                                    <div className="hidden sm:flex items-center gap-3 text-xs text-gray-600 shrink-0">
                                        {(s.materials?.length ?? 0) > 0 && (
                                            <span className="flex items-center gap-1"><Play className="w-3 h-3" />{s.materials!.length}</span>
                                        )}
                                        {(s.labs?.length ?? 0) > 0 && (
                                            <span className="flex items-center gap-1"><Code2 className="w-3 h-3" />{s.labs!.length}</span>
                                        )}
                                        {(s.quizzes?.length ?? 0) > 0 && (
                                            <span className="flex items-center gap-1"><HelpCircle className="w-3 h-3" />{s.quizzes!.length}</span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={() => toggleVisibility(cs)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                                                cs.isVisible
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                                    : 'bg-white/5 text-gray-500 border-white/10 hover:bg-white/10 hover:text-white'
                                            }`}
                                            title={cs.isVisible ? 'Click to hide' : 'Click to make visible'}
                                        >
                                            {cs.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                            {cs.isVisible ? 'Visible' : 'Hidden'}
                                        </button>

                                        <Link
                                            href={`/admin/sessions/${s.id}`}
                                            className="px-3 py-1.5 bg-violet-600/20 hover:bg-violet-600 text-violet-400 hover:text-white border border-violet-500/30 rounded-lg text-xs font-bold transition-all"
                                        >
                                            Edit Content
                                        </Link>

                                        <button
                                            onClick={() => handleUnlink(cs)}
                                            className="p-1.5 text-gray-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                                            title="Unlink from this camp"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {(s.materials?.length ?? 0) > 0 && (
                                    <div className="border-t border-white/5 px-5 py-3 bg-black/20 flex gap-4 flex-wrap">
                                        {s.materials!.slice(0, 6).map((m: any) => (
                                            <span key={m.id} className="flex items-center gap-1 text-xs text-gray-600">
                                                {m.type === 'VIDEO' ? <Play className="w-3 h-3 text-violet-500" /> : <FileText className="w-3 h-3 text-sky-500" />}
                                                {m.title}
                                            </span>
                                        ))}
                                        {s.materials!.length > 6 && (
                                            <span className="text-xs text-gray-700">+{s.materials!.length - 6} more</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Link modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-[#111113] rounded-2xl border border-white/10 shadow-2xl p-8 space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold">Link Master Session</h2>
                                <p className="text-sm text-gray-500 mt-1">Sessions grouped by track/category.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors">✕</button>
                        </div>
                        <form onSubmit={handleLinkSession} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Select Session</label>
                                {available.length === 0 ? (
                                    <p className="text-sm text-gray-500 py-4 text-center border border-white/5 rounded-xl">All sessions are already linked.</p>
                                ) : (
                                    <select
                                        required
                                        className="w-full px-4 py-2.5 bg-[#1a1a1c] border border-white/5 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                                        value={linkForm.sessionId}
                                        onChange={e => setLinkForm({ ...linkForm, sessionId: e.target.value })}
                                    >
                                        <option value="">Choose a session...</option>
                                        {groupedEntries.map(([cat, sessions]) => (
                                            <optgroup key={cat} label={`── ${cat} ──`}>
                                                {sessions.map(s => (
                                                    <option key={s.id} value={s.id}>{s.title}</option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                )}
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Order Position</label>
                                <input
                                    type="number"
                                    min={1}
                                    required
                                    className="w-full px-4 py-2.5 bg-[#1a1a1c] border border-white/5 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                                    value={linkForm.order}
                                    onChange={e => setLinkForm({ ...linkForm, order: Number(e.target.value) })}
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={submitting || available.length === 0}
                                    className="flex-1 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl font-bold transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                                >
                                    {submitting && <Loader2 className="animate-spin w-4 h-4" />}
                                    Link Session
                                </button>
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-all">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
