'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { Plus, Play, FileText, Loader2, X } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function MaterialManager({ sessionId, onUpdate }: { sessionId: string, onUpdate: () => void }) {
    const toast = useToast();
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ title: '', type: 'VIDEO', url: '' });

    const handleAddMaterial = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // In a real app, 'url' might be the filename after upload. For MVP, we'll manually enter it.
            await api.post('/sessions/materials', { ...formData, sessionId });
            setShowModal(false);
            setFormData({ title: '', type: 'VIDEO', url: '' });
            onUpdate();
        } catch (err) {
            toast.error('Failed to add material');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                    onClick={() => { setFormData({ ...formData, type: 'VIDEO' }); setShowModal(true); }}
                    className="p-4 bg-white/5 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center space-y-2 group hover:bg-white/10 transition-all"
                >
                    <Play className="w-6 h-6 text-gray-500 group-hover:text-blue-400" />
                    <span className="text-xs font-semibold text-gray-400 group-hover:text-white uppercase tracking-wider">Add Video</span>
                </button>
                <button
                    onClick={() => { setFormData({ ...formData, type: 'PDF' }); setShowModal(true); }}
                    className="p-4 bg-white/5 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center space-y-2 group hover:bg-white/10 transition-all"
                >
                    <FileText className="w-6 h-6 text-gray-500 group-hover:text-indigo-400" />
                    <span className="text-xs font-semibold text-gray-400 group-hover:text-white uppercase tracking-wider text-center">Add Material<br/>(PDF/Link)</span>
                </button>
                <button
                    onClick={() => { setFormData({ ...formData, type: 'RESOURCE' }); setShowModal(true); }}
                    className="p-4 bg-white/5 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center space-y-2 group hover:bg-white/10 transition-all"
                >
                    <FileText className="w-6 h-6 text-gray-500 group-hover:text-emerald-400" />
                    <span className="text-xs font-semibold text-gray-400 group-hover:text-white uppercase tracking-wider text-center">Add Resource<br/>(Link)</span>
                </button>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-[#111113] rounded-2xl border border-white/10 p-8 space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Add {formData.type}</h2>
                            <button onClick={() => setShowModal(false)}><X className="w-6 h-6 text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleAddMaterial} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
                                <input
                                    required
                                    placeholder="e.g. Intro Video"
                                    className="w-full px-4 py-2.5 bg-[#1a1a1c] border border-white/5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Filename / URL</label>
                                <input
                                    required
                                    placeholder="e.g. session1.mp4"
                                    className="w-full px-4 py-2.5 bg-[#1a1a1c] border border-white/5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50"
                                    value={formData.url}
                                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                />
                            </div>
                            <p className="text-xs text-gray-500 italic">For MVP, place the file in the &quot;backend/uploads&quot; folder and enter the filename here.</p>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all font-bold disabled:opacity-50 flex justify-center"
                            >
                                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Save Material'}
                            </button>
                        </form>
                </div>
            </div>
        )}
        </div>
    );
}
