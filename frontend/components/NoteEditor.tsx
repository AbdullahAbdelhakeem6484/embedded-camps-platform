'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { StickyNote, Save, Trash2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface NoteEditorProps {
    materialId: string;
    materialTitle?: string;
}

export default function NoteEditor({ materialId, materialTitle }: NoteEditorProps) {
    const toast = useToast();
    const [open, setOpen] = useState(false);
    const [content, setContent] = useState('');
    const [savedContent, setSavedContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const dirty = content !== savedContent;

    // Load note when panel opens
    useEffect(() => {
        if (!open || loading) return;
        setLoading(true);
        api.get(`/notes?materialId=${materialId}`)
            .then(res => {
                const text = res.data?.content ?? '';
                setContent(text);
                setSavedContent(text);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [open, materialId]);

    // Auto-save after 1.5s of inactivity
    useEffect(() => {
        if (!open || !dirty) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => { handleSave(true); }, 1500);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [content]);

    const handleSave = async (silent = false) => {
        if (!content.trim()) return;
        setSaving(true);
        try {
            await api.post('/notes', { materialId, content });
            setSavedContent(content);
            if (!silent) toast.success('Note saved');
        } catch {
            if (!silent) toast.error('Failed to save note');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await api.delete(`/notes/${materialId}`);
            setContent('');
            setSavedContent('');
            toast.success('Note deleted');
        } catch {
            toast.error('Failed to delete note');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="mt-3 border border-white/5 rounded-xl overflow-hidden">
            {/* Toggle header */}
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-500 hover:text-gray-300 hover:bg-white/3 transition-all"
            >
                <span className="flex items-center gap-2">
                    <StickyNote className="w-3.5 h-3.5" />
                    My Notes
                    {savedContent && <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />}
                </span>
                {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {open && (
                <div className="border-t border-white/5 p-3 space-y-2 bg-black/20">
                    {loading ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="animate-spin w-4 h-4 text-gray-500" />
                        </div>
                    ) : (
                        <>
                            <textarea
                                rows={5}
                                placeholder="Write your notes here... (auto-saved)"
                                className="w-full px-3 py-2 bg-black/40 border border-white/5 rounded-lg outline-none text-sm text-gray-200 placeholder:text-gray-700 focus:ring-1 focus:ring-violet-500/50 resize-none font-mono leading-relaxed"
                                value={content}
                                onChange={e => setContent(e.target.value)}
                            />
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] text-gray-600">
                                    {saving ? 'Saving...' : dirty ? 'Unsaved changes' : savedContent ? '✓ Saved' : ''}
                                </span>
                                <div className="flex gap-2">
                                    {savedContent && (
                                        <button
                                            onClick={handleDelete}
                                            disabled={deleting}
                                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-red-500/70 hover:text-red-400 transition-colors disabled:opacity-50"
                                        >
                                            {deleting ? <Loader2 className="animate-spin w-3 h-3" /> : <Trash2 className="w-3 h-3" />}
                                            Clear
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleSave(false)}
                                        disabled={saving || !dirty || !content.trim()}
                                        className="flex items-center gap-1 px-3 py-1 text-[11px] font-bold bg-violet-600/80 hover:bg-violet-600 rounded-lg transition-all disabled:opacity-40"
                                    >
                                        {saving ? <Loader2 className="animate-spin w-3 h-3" /> : <Save className="w-3 h-3" />}
                                        Save
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
