'use client';

import { useEffect, useState, useRef, use } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import {
    ArrowLeft, Loader2, Play, FileText, Link2, BookOpen, FlaskConical,
    HelpCircle, Trash2, Eye, EyeOff, Plus, X, Upload, ChevronDown,
    ChevronRight, CheckCircle2, Code2, Image as ImageIcon, ExternalLink,
    Video, Pencil, Check, AlertCircle
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmModal';

// ─── Types ────────────────────────────────────────────────────────────────────

type MaterialType = 'VIDEO' | 'PDF' | 'LINK' | 'RESOURCE' | 'ARTICLE';

interface Material {
    id: string;
    title: string;
    type: MaterialType;
    url: string | null;
    content: string | null;
    order: number;
    duration: number | null;
}

interface Lab {
    id: string;
    title: string;
    description: string | null;
    difficulty: string | null;
}

interface Question {
    id: string;
    text: string;
    options: string[];
    order: number;
}

interface Quiz {
    id: string;
    title: string;
    passMark: number | null;
    questions: Question[];
}

interface Session {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    materials: Material[];
    labs: Lab[];
    quizzes: Quiz[];
}

// ─── Icon helper ─────────────────────────────────────────────────────────────

function MaterialIcon({ type }: { type: MaterialType }) {
    const map: Record<MaterialType, { icon: React.ReactNode; color: string }> = {
        VIDEO: { icon: <Video className="w-5 h-5" />, color: 'text-blue-400' },
        PDF: { icon: <FileText className="w-5 h-5" />, color: 'text-rose-400' },
        LINK: { icon: <Link2 className="w-5 h-5" />, color: 'text-amber-400' },
        RESOURCE: { icon: <BookOpen className="w-5 h-5" />, color: 'text-emerald-400' },
        ARTICLE: { icon: <Code2 className="w-5 h-5" />, color: 'text-violet-400' },
    };
    const { icon, color } = map[type] || map.LINK;
    return <span className={color}>{icon}</span>;
}

// ─── Video Preview ────────────────────────────────────────────────────────────

function VideoPreview({ url }: { url: string }) {
    if (!url) return null;
    // Bunny.net embed or direct video
    const isBunnyEmbed = url.includes('iframe.mediadelivery.net') || url.includes('bunny.net');
    if (isBunnyEmbed) {
        return (
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                <iframe src={url} className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
        );
    }
    // Direct video file
    const isVideoFile = /\.(mp4|webm|ogg|mov)$/i.test(url);
    if (isVideoFile || url.startsWith('/uploads')) {
        const src = url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${url}`;
        return (
            <video controls className="w-full rounded-xl bg-black aspect-video" src={src}>
                Your browser does not support HTML5 video.
            </video>
        );
    }
    // Fallback link
    return (
        <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-400 hover:underline p-4 bg-white/5 rounded-xl">
            <ExternalLink className="w-4 h-4" /> Open Video
        </a>
    );
}

// ─── PDF Preview ──────────────────────────────────────────────────────────────

function PdfPreview({ url }: { url: string }) {
    if (!url) return null;
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const src = url.startsWith('http') ? url : `${API}${url}`;
    return (
        <div className="rounded-xl overflow-hidden border border-white/10 bg-zinc-900 flex flex-col" style={{ height: 620 }}>
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10 shrink-0">
                <span className="text-xs text-gray-400 truncate">{url.split('/').pop()}</span>
                <a
                    href={src}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300"
                >
                    <ExternalLink className="w-3 h-3" /> Open in new tab
                </a>
            </div>
            <iframe src={src} className="w-full flex-1" title="PDF Preview" />
        </div>
    );
}

// ─── Article Preview (markdown rendered with marked.js from CDN) ───────────

function ArticlePreview({ content }: { content: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [html, setHtml] = useState('');

    useEffect(() => {
        if (!content) { setHtml(''); return; }
        // Load marked from CDN if not already loaded
        const render = () => {
            const w = window as any;
            if (w.marked) {
                setHtml(w.marked.parse(content));
            }
        };
        const w = window as any;
        if (w.marked) {
            render();
        } else {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
            script.onload = render;
            document.head.appendChild(script);
        }
    }, [content]);

    if (!html) return <p className="text-gray-500 italic">No content yet.</p>;
    return (
        <div
            ref={ref}
            className="prose prose-invert prose-violet max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

// ─── Material Preview Panel ───────────────────────────────────────────────────

function MaterialPreview({ material }: { material: Material | null }) {
    if (!material) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 text-gray-500">
                <Eye className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm">Select a material to preview it here</p>
            </div>
        );
    }
    return (
        <div className="space-y-4 p-4">
            <div className="flex items-center gap-3">
                <MaterialIcon type={material.type} />
                <div>
                    <h3 className="font-semibold">{material.title}</h3>
                    <span className="text-xs text-gray-500 uppercase">{material.type}</span>
                </div>
            </div>
            {material.type === 'VIDEO' && material.url && <VideoPreview url={material.url} />}
            {material.type === 'PDF' && material.url && <PdfPreview url={material.url} />}
            {material.type === 'ARTICLE' && material.content && (
                <div className="bg-white/5 rounded-xl p-6 overflow-auto max-h-[600px]">
                    <ArticlePreview content={material.content} />
                </div>
            )}
            {(material.type === 'LINK' || material.type === 'RESOURCE') && material.url && (
                <a href={material.url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 text-violet-400 hover:text-violet-300 p-4 bg-white/5 rounded-xl transition-colors">
                    <ExternalLink className="w-4 h-4" /> {material.url}
                </a>
            )}
        </div>
    );
}

// ─── Add/Edit Material Modal ──────────────────────────────────────────────────

interface MaterialModalProps {
    sessionId: string;
    onClose: () => void;
    onSaved: () => void;
    editing?: Material | null;
}

function MaterialModal({ sessionId, onClose, onSaved, editing }: MaterialModalProps) {
    const toast = useToast();
    const [type, setType] = useState<MaterialType>(editing?.type || 'VIDEO');
    const [title, setTitle] = useState(editing?.title || '');
    const [url, setUrl] = useState(editing?.url || '');
    const [content, setContent] = useState(editing?.content || '');
    const [duration, setDuration] = useState(editing?.duration?.toString() || '');
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [previewContent, setPreviewContent] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLInputElement>(null);

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setUploadProgress(0);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const { data } = await api.post('/sessions/upload/video', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (p) => setUploadProgress(Math.round((p.loaded / (p.total || 1)) * 100)),
            });
            setUrl(data.url);
            if (!title) setTitle(data.originalName.replace(/\.[^.]+$/, ''));
            toast.success('Video uploaded');
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Failed to upload video';
            toast.error(`Video upload failed: ${msg}`);
            console.error('Video upload error:', err?.response?.data || err);
        } finally {
            setUploading(false);
        }
    };

    const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setUploadProgress(0);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const { data } = await api.post('/sessions/upload/pdf', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (p) => setUploadProgress(Math.round((p.loaded / (p.total || 1)) * 100)),
            });
            setUrl(data.url);
            if (!title) setTitle(data.originalName.replace(/\.[^.]+$/, ''));
            toast.success('PDF uploaded');
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Failed to upload PDF';
            toast.error(`PDF upload failed: ${msg}`);
            console.error('PDF upload error:', err?.response?.data || err);
        } finally {
            setUploading(false);
        }
    };

    const handleImageInsert = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            const { data } = await api.post('/sessions/upload/image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            setContent(prev => prev + `\n\n![Image](${baseUrl}${data.url})\n`);
            toast.success('Image inserted');
        } catch {
            toast.error('Failed to upload image');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const payload: any = { title, type, duration: duration ? parseInt(duration) : undefined };
        if (type !== 'ARTICLE') payload.url = url;
        if (type === 'ARTICLE') payload.content = content;

        try {
            if (editing) {
                await api.put(`/sessions/materials/${editing.id}`, payload);
                toast.success('Material updated');
            } else {
                await api.post(`/sessions/${sessionId}/materials`, payload);
                toast.success('Material added');
            }
            onSaved();
            onClose();
        } catch {
            toast.error('Failed to save material');
        } finally {
            setSaving(false);
        }
    };

    const TYPE_OPTIONS: { value: MaterialType; label: string; desc: string; color: string }[] = [
        { value: 'VIDEO', label: 'Video', desc: 'Bunny.net stream URL or direct video link', color: 'blue' },
        { value: 'PDF', label: 'PDF', desc: 'Upload a PDF file', color: 'rose' },
        { value: 'LINK', label: 'Link', desc: 'External URL or resource link', color: 'amber' },
        { value: 'RESOURCE', label: 'Resource', desc: 'Downloadable resource or reference', color: 'emerald' },
        { value: 'ARTICLE', label: 'Article', desc: 'Rich Markdown content with images, code, tables', color: 'violet' },
    ];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#111113] rounded-2xl border border-white/10">
                <div className="sticky top-0 bg-[#111113] border-b border-white/10 px-6 py-4 flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold">{editing ? 'Edit' : 'Add'} Material</h2>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Type selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-3">Material Type</label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                            {TYPE_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setType(opt.value)}
                                    className={`p-3 rounded-xl border text-center transition-all ${type === opt.value
                                        ? `border-${opt.color}-500 bg-${opt.color}-500/10 text-${opt.color}-400`
                                        : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'}`}
                                >
                                    <div className="text-sm font-semibold">{opt.label}</div>
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">{TYPE_OPTIONS.find(o => o.value === type)?.desc}</p>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Title *</label>
                        <input
                            required value={title} onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. AOSP Build System Overview"
                            className="w-full px-4 py-2.5 bg-[#1a1a1c] border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/50 text-white"
                        />
                    </div>

                    {/* Duration (for videos) */}
                    {type === 'VIDEO' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Duration (minutes)</label>
                            <input
                                type="number" min="0" value={duration} onChange={e => setDuration(e.target.value)}
                                placeholder="e.g. 45"
                                className="w-full px-4 py-2.5 bg-[#1a1a1c] border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/50 text-white"
                            />
                        </div>
                    )}

                    {/* Video — upload or URL */}
                    {type === 'VIDEO' && (
                        <div className="space-y-4">
                            {/* Upload option */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Upload Video File (mp4, webm — max 500 MB)</label>
                                <input
                                    ref={videoRef}
                                    type="file"
                                    accept="video/*"
                                    className="hidden"
                                    onChange={handleVideoUpload}
                                />
                                <button
                                    type="button"
                                    onClick={() => videoRef.current?.click()}
                                    disabled={uploading}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400 hover:bg-blue-500/20 transition-all disabled:opacity-50"
                                >
                                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                    {uploading ? `Uploading ${uploadProgress}%` : 'Choose Video File'}
                                </button>
                                {uploading && (
                                    <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                                        <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                                    </div>
                                )}
                            </div>
                            {/* Divider */}
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px bg-white/10" />
                                <span className="text-xs text-gray-500">or paste an embed URL</span>
                                <div className="flex-1 h-px bg-white/10" />
                            </div>
                            {/* URL input */}
                            <div>
                                <input
                                    value={url} onChange={e => setUrl(e.target.value)}
                                    placeholder="https://iframe.mediadelivery.net/embed/... or YouTube embed URL"
                                    className="w-full px-4 py-2.5 bg-[#1a1a1c] border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                                />
                                <p className="text-xs text-gray-500 mt-1">Bunny.net, YouTube, Vimeo embed URLs — or leave empty if uploading a file above</p>
                            </div>
                            {url && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-2">Preview:</p>
                                    <VideoPreview url={url} />
                                </div>
                            )}
                        </div>
                    )}

                    {/* PDF Upload */}
                    {type === 'PDF' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">PDF File</label>
                            <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handlePdfUpload} />
                            <div className="space-y-3">
                                <button
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                    disabled={uploading}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 hover:bg-rose-500/20 transition-all disabled:opacity-50"
                                >
                                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                    {uploading ? `Uploading ${uploadProgress}%` : 'Choose PDF File'}
                                </button>
                                {uploading && (
                                    <div className="w-full bg-white/10 rounded-full h-2">
                                        <div className="bg-rose-500 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                                    </div>
                                )}
                                {url && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-emerald-400">
                                            <CheckCircle2 className="w-4 h-4" /> File uploaded: {url.split('/').pop()}
                                        </div>
                                        <PdfPreview url={url} />
                                    </div>
                                )}
                                <p className="text-xs text-gray-500">Or enter a URL directly:</p>
                                <input
                                    value={url} onChange={e => setUrl(e.target.value)}
                                    placeholder="https://example.com/file.pdf"
                                    className="w-full px-4 py-2.5 bg-[#1a1a1c] border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-rose-500/50 text-white"
                                />
                            </div>
                        </div>
                    )}

                    {/* Link/Resource URL */}
                    {(type === 'LINK' || type === 'RESOURCE') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">URL *</label>
                            <input
                                required value={url} onChange={e => setUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full px-4 py-2.5 bg-[#1a1a1c] border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/50 text-white"
                            />
                        </div>
                    )}

                    {/* Article / Markdown editor */}
                    {type === 'ARTICLE' && (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-gray-400">Content (Markdown)</label>
                                <div className="flex items-center gap-2">
                                    {/* Image upload for articles */}
                                    <label className="cursor-pointer flex items-center gap-1 text-xs text-gray-400 hover:text-white px-3 py-1 bg-white/5 rounded-lg border border-white/10 transition-colors">
                                        <ImageIcon className="w-3 h-3" /> Insert Image
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageInsert} />
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setPreviewContent(p => !p)}
                                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-white px-3 py-1 bg-white/5 rounded-lg border border-white/10 transition-colors"
                                    >
                                        {previewContent ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                        {previewContent ? 'Editor' : 'Preview'}
                                    </button>
                                </div>
                            </div>
                            {previewContent ? (
                                <div className="min-h-[400px] max-h-[600px] overflow-auto bg-white/5 rounded-xl border border-white/10 p-6">
                                    <ArticlePreview content={content} />
                                </div>
                            ) : (
                                <textarea
                                    value={content} onChange={e => setContent(e.target.value)}
                                    rows={18}
                                    placeholder={`# Session Title\n\nWrite your article content in Markdown...\n\n## Section\n\nParagraph with **bold** and \`code\`.\n\n\`\`\`bash\n# Code block\nadb devices\n\`\`\``}
                                    className="w-full px-4 py-3 bg-[#1a1a1c] border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/50 text-white font-mono text-sm resize-y"
                                />
                            )}
                            <p className="text-xs text-gray-500 mt-2">Supports: headings, bold, italic, code blocks, tables, images, lists</p>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold transition-all">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving || uploading} className="flex-1 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            {saving ? 'Saving...' : 'Save Material'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Materials Tab ────────────────────────────────────────────────────────────

function MaterialsTab({ session, onUpdate }: { session: Session; onUpdate: () => void }) {
    const toast = useToast();
    const confirm = useConfirm();
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Material | null>(null);
    const [preview, setPreview] = useState<Material | null>(null);

    const handleDelete = async (m: Material) => {
        const ok = await confirm({ title: 'Delete Material', message: `Remove "${m.title}"?`, confirmLabel: 'Delete', variant: 'danger' });
        if (!ok) return;
        await api.delete(`/sessions/materials/${m.id}`);
        toast.success('Deleted');
        if (preview?.id === m.id) setPreview(null);
        onUpdate();
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Material list */}
            <div className="lg:col-span-2 space-y-3">
                <button
                    onClick={() => { setEditing(null); setShowModal(true); }}
                    className="w-full py-3 flex items-center justify-center gap-2 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 rounded-xl text-violet-400 font-semibold transition-all"
                >
                    <Plus className="w-4 h-4" /> Add Material
                </button>

                {session.materials.length === 0 && (
                    <div className="text-center py-12 text-gray-600">
                        <Play className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No materials yet</p>
                    </div>
                )}

                {session.materials.map((m) => (
                    <div
                        key={m.id}
                        onClick={() => setPreview(prev => prev?.id === m.id ? null : m)}
                        className={`group flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${preview?.id === m.id
                            ? 'border-violet-500/50 bg-violet-500/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'}`}
                    >
                        <MaterialIcon type={m.type} />
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{m.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-gray-500 uppercase">{m.type}</span>
                                {m.duration && <span className="text-xs text-gray-600">· {m.duration}min</span>}
                            </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={e => { e.stopPropagation(); setEditing(m); setShowModal(true); }}
                                className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                            >
                                <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={e => { e.stopPropagation(); handleDelete(m); }}
                                className="p-1.5 hover:bg-rose-500/20 rounded-lg text-gray-400 hover:text-rose-400 transition-colors"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Preview panel */}
            <div className="lg:col-span-3 bg-white/5 border border-white/10 rounded-2xl min-h-[400px] overflow-auto">
                <div className="border-b border-white/10 px-4 py-3 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-400">Preview</span>
                    {preview && <span className="ml-auto text-xs text-gray-600 truncate max-w-[200px]">{preview.title}</span>}
                </div>
                <MaterialPreview material={preview} />
            </div>

            {showModal && (
                <MaterialModal
                    sessionId={session.id}
                    onClose={() => { setShowModal(false); setEditing(null); }}
                    onSaved={onUpdate}
                    editing={editing}
                />
            )}
        </div>
    );
}

// ─── Labs Tab ─────────────────────────────────────────────────────────────────

function LabsTab({ session, onUpdate }: { session: Session; onUpdate: () => void }) {
    const toast = useToast();
    const confirm = useConfirm();
    const [expanded, setExpanded] = useState<string | null>(null);
    const [showAdd, setShowAdd] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', difficulty: 'MEDIUM', starterCode: '', solution: '', maxScore: 100 });

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/labs', { ...form, masterSessionId: session.id });
            toast.success('Lab added');
            setShowAdd(false);
            setForm({ title: '', description: '', difficulty: 'MEDIUM', starterCode: '', solution: '', maxScore: 100 });
            onUpdate();
        } catch {
            toast.error('Failed to add lab');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (lab: Lab) => {
        const ok = await confirm({ title: 'Delete Lab', message: `Remove "${lab.title}"?`, confirmLabel: 'Delete', variant: 'danger' });
        if (!ok) return;
        await api.delete(`/labs/${lab.id}`);
        toast.success('Lab deleted');
        onUpdate();
    };

    return (
        <div className="space-y-4">
            <button
                onClick={() => setShowAdd(s => !s)}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-xl text-emerald-400 font-semibold transition-all"
            >
                <Plus className="w-4 h-4" /> {showAdd ? 'Cancel' : 'Add Lab'}
            </button>

            {showAdd && (
                <form onSubmit={handleAdd} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                    <h3 className="font-bold text-lg">New Lab</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Title *</label>
                            <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                                className="w-full px-3 py-2 bg-[#1a1a1c] border border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/50" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Difficulty</label>
                            <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}
                                className="w-full px-3 py-2 bg-[#1a1a1c] border border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/50">
                                <option>EASY</option><option>MEDIUM</option><option>HARD</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block">Description / Instructions</label>
                        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                            rows={4} className="w-full px-3 py-2 bg-[#1a1a1c] border border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 resize-y" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Starter Code</label>
                            <textarea value={form.starterCode} onChange={e => setForm({ ...form, starterCode: e.target.value })}
                                rows={5} className="w-full px-3 py-2 bg-[#1a1a1c] border border-white/10 rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-emerald-500/50 resize-y" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Solution (admin only)</label>
                            <textarea value={form.solution} onChange={e => setForm({ ...form, solution: e.target.value })}
                                rows={5} className="w-full px-3 py-2 bg-[#1a1a1c] border border-white/10 rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-emerald-500/50 resize-y" />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm">Cancel</button>
                        <button type="submit" disabled={saving} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
                            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Lab
                        </button>
                    </div>
                </form>
            )}

            {session.labs.length === 0 && !showAdd && (
                <div className="text-center py-12 text-gray-600">
                    <FlaskConical className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No labs yet</p>
                </div>
            )}

            {session.labs.map(lab => (
                <div key={lab.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <div
                        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-white/5 transition-colors"
                        onClick={() => setExpanded(expanded === lab.id ? null : lab.id)}
                    >
                        <FlaskConical className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                        <div className="flex-1">
                            <span className="font-medium">{lab.title}</span>
                            {lab.difficulty && (
                                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${lab.difficulty === 'EASY' ? 'bg-emerald-500/20 text-emerald-400' : lab.difficulty === 'HARD' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                    {lab.difficulty}
                                </span>
                            )}
                        </div>
                        <button onClick={e => { e.stopPropagation(); handleDelete(lab); }} className="p-1.5 hover:bg-rose-500/20 rounded-lg text-gray-500 hover:text-rose-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                        {expanded === lab.id ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                    </div>
                    {expanded === lab.id && lab.description && (
                        <div className="border-t border-white/10 p-4 bg-[#0f0f11]">
                            <p className="text-sm text-gray-300 whitespace-pre-wrap">{lab.description}</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

// ─── Quizzes Tab ──────────────────────────────────────────────────────────────

function QuizzesTab({ session, onUpdate }: { session: Session; onUpdate: () => void }) {
    const toast = useToast();
    const confirm = useConfirm();
    const [expanded, setExpanded] = useState<string | null>(null);
    const [showAdd, setShowAdd] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ title: '', passMark: 70 });
    const [questions, setQuestions] = useState([{ text: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }]);

    const addQuestion = () => setQuestions(prev => [...prev, { text: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }]);
    const removeQuestion = (i: number) => setQuestions(prev => prev.filter((_, idx) => idx !== i));
    const updateQ = (i: number, field: string, val: any) => setQuestions(prev => prev.map((q, idx) => idx === i ? { ...q, [field]: val } : q));
    const updateOption = (qi: number, oi: number, val: string) => setQuestions(prev => prev.map((q, idx) => idx === qi ? { ...q, options: q.options.map((o, i) => i === oi ? val : o) } : q));

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Backend expects correctOption, frontend uses correctIndex
            const normalizedQuestions = questions.map(q => ({
                text: q.text,
                options: q.options.filter(o => o.trim()),
                correctOption: q.correctIndex,
                explanation: q.explanation || undefined,
            }));
            await api.post('/quizzes', { ...form, masterSessionId: session.id, questions: normalizedQuestions });
            toast.success('Quiz added');
            setShowAdd(false);
            setForm({ title: '', passMark: 70 });
            setQuestions([{ text: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }]);
            onUpdate();
        } catch {
            toast.error('Failed to add quiz');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (quiz: Quiz) => {
        const ok = await confirm({ title: 'Delete Quiz', message: `Remove "${quiz.title}"?`, confirmLabel: 'Delete', variant: 'danger' });
        if (!ok) return;
        await api.delete(`/quizzes/${quiz.id}`);
        toast.success('Quiz deleted');
        onUpdate();
    };

    return (
        <div className="space-y-4">
            <button
                onClick={() => setShowAdd(s => !s)}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 rounded-xl text-amber-400 font-semibold transition-all"
            >
                <Plus className="w-4 h-4" /> {showAdd ? 'Cancel' : 'Add Quiz'}
            </button>

            {showAdd && (
                <form onSubmit={handleAdd} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
                    <h3 className="font-bold text-lg">New Quiz</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Title *</label>
                            <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                                className="w-full px-3 py-2 bg-[#1a1a1c] border border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500/50" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Pass Mark (%)</label>
                            <input type="number" min="0" max="100" value={form.passMark} onChange={e => setForm({ ...form, passMark: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 bg-[#1a1a1c] border border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500/50" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-300">Questions ({questions.length})</h4>
                            <button type="button" onClick={addQuestion} className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">
                                <Plus className="w-3 h-3" /> Add Question
                            </button>
                        </div>
                        {questions.map((q, qi) => (
                            <div key={qi} className="bg-[#0f0f11] border border-white/10 rounded-xl p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-500">Q{qi + 1}</span>
                                    <input value={q.text} onChange={e => updateQ(qi, 'text', e.target.value)}
                                        placeholder="Question text..." required
                                        className="flex-1 px-3 py-2 bg-[#1a1a1c] border border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500/50" />
                                    {questions.length > 1 && (
                                        <button type="button" onClick={() => removeQuestion(qi)} className="p-1.5 hover:bg-rose-500/20 rounded-lg text-gray-500 hover:text-rose-400">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-5">
                                    {q.options.map((opt, oi) => (
                                        <div key={oi} className="flex items-center gap-2">
                                            <input
                                                type="radio" name={`correct-${qi}`}
                                                checked={q.correctIndex === oi}
                                                onChange={() => updateQ(qi, 'correctIndex', oi)}
                                                className="accent-emerald-500"
                                            />
                                            <input value={opt} onChange={e => updateOption(qi, oi, e.target.value)}
                                                placeholder={`Option ${oi + 1}`}
                                                className="flex-1 px-2 py-1.5 bg-[#1a1a1c] border border-white/10 rounded-lg text-xs outline-none focus:ring-1 focus:ring-amber-500/50" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-3">
                        <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm">Cancel</button>
                        <button type="submit" disabled={saving} className="px-6 py-2 bg-amber-600 hover:bg-amber-500 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
                            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Quiz
                        </button>
                    </div>
                </form>
            )}

            {session.quizzes.length === 0 && !showAdd && (
                <div className="text-center py-12 text-gray-600">
                    <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No quizzes yet</p>
                </div>
            )}

            {session.quizzes.map(quiz => (
                <div key={quiz.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <div
                        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-white/5 transition-colors"
                        onClick={() => setExpanded(expanded === quiz.id ? null : quiz.id)}
                    >
                        <HelpCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                        <div className="flex-1">
                            <span className="font-medium">{quiz.title}</span>
                            <span className="ml-2 text-xs text-gray-500">{quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''}</span>
                            {quiz.passMark && <span className="ml-2 text-xs text-gray-500">· {quiz.passMark}% pass</span>}
                        </div>
                        <button onClick={e => { e.stopPropagation(); handleDelete(quiz); }} className="p-1.5 hover:bg-rose-500/20 rounded-lg text-gray-500 hover:text-rose-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                        {expanded === quiz.id ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                    </div>
                    {expanded === quiz.id && (
                        <div className="border-t border-white/10 p-4 bg-[#0f0f11] space-y-3">
                            {quiz.questions.map((q, i) => (
                                <div key={q.id} className="text-sm">
                                    <p className="font-medium text-gray-300 mb-1.5">
                                        <span className="text-gray-500 mr-2">Q{i + 1}.</span>{q.text}
                                    </p>
                                    <div className="grid grid-cols-2 gap-1 pl-5">
                                        {q.options.map((opt, oi) => (
                                            <span key={oi} className="text-xs text-gray-500 flex items-center gap-1">
                                                <span className="w-4 h-4 inline-flex items-center justify-center rounded-full bg-white/5 text-[10px] font-bold">
                                                    {String.fromCharCode(65 + oi)}
                                                </span>
                                                {opt}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = 'materials' | 'labs' | 'quizzes';

export default function MasterSessionDetailsPage({ params }: { params: any }) {
    const { id } = (use(params) as any);
    const toast = useToast();
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<Tab>('materials');

    const fetchSession = async () => {
        try {
            const { data } = await api.get(`/sessions/${id}`);
            setSession(data);
        } catch {
            toast.error('Failed to load session');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSession(); }, [id]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
        </div>
    );

    if (!session) return (
        <div className="flex items-center justify-center min-h-screen text-gray-400">
            Session not found.
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/admin/sessions" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">{session.title}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 bg-violet-500/20 text-violet-400 rounded-full">{session.category || 'General'}</span>
                            {session.description && <span className="text-sm text-gray-400">{session.description}</span>}
                        </div>
                    </div>
                    <div className="ml-auto flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1"><Play className="w-4 h-4 text-blue-400" /> {session.materials.length} Materials</span>
                        <span className="flex items-center gap-1"><FlaskConical className="w-4 h-4 text-emerald-400" /> {session.labs.length} Labs</span>
                        <span className="flex items-center gap-1"><HelpCircle className="w-4 h-4 text-amber-400" /> {session.quizzes.length} Quizzes</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-white/10 pb-0">
                    {(['materials', 'labs', 'quizzes'] as Tab[]).map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-5 py-2.5 rounded-t-xl font-semibold text-sm capitalize transition-all border-b-2 -mb-px ${
                                tab === t
                                    ? 'border-violet-500 text-violet-400 bg-violet-500/10'
                                    : 'border-transparent text-gray-400 hover:text-white'
                            }`}
                        >
                            {t === 'materials' && `Materials ${session.materials.length}`}
                            {t === 'labs' && `Labs ${session.labs.length}`}
                            {t === 'quizzes' && `Quizzes ${session.quizzes.length}`}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {tab === 'materials' && (
                    <MaterialsTab session={session} onUpdate={fetchSession} />
                )}
                {tab === 'labs' && (
                    <LabsTab session={session} onUpdate={fetchSession} />
                )}
                {tab === 'quizzes' && (
                    <QuizzesTab session={session} onUpdate={fetchSession} />
                )}
            </div>
        </div>
    );
}
