'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Bookmark, Play, FileText, Link2, Loader2, ExternalLink, Trash2 } from 'lucide-react';
import { BookmarkRowSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';

interface BookmarkedMaterial {
    id: string;
    createdAt: string;
    material: {
        id: string;
        title: string;
        type: string;
        url: string;
        duration: number | null;
        masterSession: {
            id: string;
            title: string;
            category: string;
            campSessions: { camp: { id: string; title: string } }[];
        };
    };
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
    VIDEO: <Play className="w-4 h-4 text-violet-400" />,
    PDF: <FileText className="w-4 h-4 text-sky-400" />,
    LINK: <Link2 className="w-4 h-4 text-emerald-400" />,
    RESOURCE: <FileText className="w-4 h-4 text-amber-400" />,
};

function fmtDuration(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
}

export default function BookmarksPage() {
    const toast = useToast();
    const [bookmarks, setBookmarks] = useState<BookmarkedMaterial[]>([]);
    const [loading, setLoading] = useState(true);
    const [removing, setRemoving] = useState<string | null>(null);

    const fetchBookmarks = async () => {
        try {
            const res = await api.get('/bookmarks');
            setBookmarks(Array.isArray(res.data) ? res.data : (res.data?.data ?? []));
        } catch {
            toast.error('Failed to load bookmarks');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBookmarks(); }, []);

    const removeBookmark = async (materialId: string) => {
        setRemoving(materialId);
        try {
            await api.post('/bookmarks/toggle', { materialId });
            setBookmarks(prev => prev.filter(b => b.material.id !== materialId));
        } catch {
            toast.error('Failed to remove bookmark');
        } finally {
            setRemoving(null);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Bookmark className="w-6 h-6 text-amber-400 fill-amber-400" />
                    My Bookmarks
                </h1>
                <p className="text-gray-400 text-sm mt-1">Materials you've saved for quick access.</p>
            </div>

            {loading ? (
                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => <BookmarkRowSkeleton key={i} />)}
                </div>
            ) : bookmarks.length === 0 ? (
                <div className="text-center py-20 bg-[#111113] rounded-2xl border border-dashed border-white/5">
                    <Bookmark className="w-12 h-12 mx-auto mb-4 text-gray-700" />
                    <p className="text-gray-500 font-medium">No bookmarks yet</p>
                    <p className="text-gray-700 text-sm mt-1">Click the bookmark icon on any material while studying.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {bookmarks.map(b => {
                        const m = b.material;
                        const session = m.masterSession;
                        const camp = session.campSessions?.[0]?.camp;

                        return (
                            <div key={b.id}
                                className="flex items-center gap-4 bg-[#111113] border border-white/5 rounded-xl px-5 py-4 hover:border-white/10 transition-all group">
                                {/* Icon */}
                                <div className="shrink-0">
                                    {TYPE_ICONS[m.type] ?? <FileText className="w-4 h-4 text-gray-500" />}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm truncate">{m.title}</p>
                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                        <span className="text-xs text-gray-500">{session.title}</span>
                                        {camp && (
                                            <>
                                                <span className="text-gray-700 text-xs">·</span>
                                                <span className="text-xs text-violet-400">{camp.title}</span>
                                            </>
                                        )}
                                        {m.duration && (
                                            <>
                                                <span className="text-gray-700 text-xs">·</span>
                                                <span className="text-xs text-gray-600">{fmtDuration(m.duration)}</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Bookmark date */}
                                <span className="text-xs text-gray-700 shrink-0 hidden sm:block">
                                    {new Date(b.createdAt).toLocaleDateString()}
                                </span>

                                {/* Actions */}
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                                    <a
                                        href={m.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 text-gray-500 hover:text-violet-400 transition-colors rounded-lg hover:bg-violet-500/10"
                                        title="Open material"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                    <button
                                        onClick={() => removeBookmark(m.id)}
                                        disabled={removing === m.id}
                                        className="p-1.5 text-gray-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10 disabled:opacity-50"
                                        title="Remove bookmark"
                                    >
                                        {removing === m.id
                                            ? <Loader2 className="w-4 h-4 animate-spin" />
                                            : <Trash2 className="w-4 h-4" />
                                        }
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
