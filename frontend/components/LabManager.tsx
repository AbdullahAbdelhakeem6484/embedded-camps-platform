'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { Plus, Loader2, FileText, Link2, BookOpen } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface LabManagerProps {
    sessionId: string;
    onUpdate: () => void;
}

interface LabForm {
    title: string;
    description: string;
    instructionsUrl: string;
    solutionContent: string;
    solutionUrl: string;
    dueDate: string;
}

const EMPTY_FORM: LabForm = {
    title: '',
    description: '',
    instructionsUrl: '',
    solutionContent: '',
    solutionUrl: '',
    dueDate: '',
};

export default function LabManager({ sessionId, onUpdate }: LabManagerProps) {
    const toast = useToast();
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<LabForm>(EMPTY_FORM);
    const [activeTab, setActiveTab] = useState<'details' | 'solution'>('details');

    const set = (field: keyof LabForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setFormData(f => ({ ...f, [field]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/labs', {
                masterSessionId: sessionId,
                title: formData.title,
                description: formData.description || undefined,
                instructionsUrl: formData.instructionsUrl || undefined,
                solutionContent: formData.solutionContent || undefined,
                solutionUrl: formData.solutionUrl || undefined,
                dueDate: formData.dueDate || undefined,
            });
            setFormData(EMPTY_FORM);
            setShowForm(false);
            setActiveTab('details');
            onUpdate();
        } catch {
            toast.error('Failed to add lab');
        } finally {
            setLoading(false);
        }
    };

    const inputCls = 'w-full px-3 py-2 bg-black/40 border border-white/5 rounded-lg outline-none text-sm focus:ring-1 focus:ring-violet-500/50 placeholder:text-gray-600';
    const textareaCls = `${inputCls} h-28 resize-none`;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500">Hands-on Labs</h4>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center space-x-1 transition-colors"
                >
                    <Plus className="w-3 h-3" />
                    <span>{showForm ? 'Cancel' : 'Add Lab'}</span>
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4">
                    {/* Tabs */}
                    <div className="flex border-b border-white/10">
                        <button
                            type="button"
                            onClick={() => setActiveTab('details')}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'details' ? 'border-violet-500 text-violet-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                        >
                            <FileText className="w-3.5 h-3.5 inline mr-1" />
                            Details
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('solution')}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'solution' ? 'border-violet-500 text-violet-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                        >
                            <BookOpen className="w-3.5 h-3.5 inline mr-1" />
                            Solution
                        </button>
                    </div>

                    {activeTab === 'details' && (
                        <div className="space-y-3">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Title *</label>
                                <input required placeholder="Lab title" className={inputCls} value={formData.title} onChange={set('title')} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Description</label>
                                <textarea placeholder="Lab description..." className={textareaCls} value={formData.description} onChange={set('description')} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Instructions URL</label>
                                <input placeholder="https://..." className={inputCls} value={formData.instructionsUrl} onChange={set('instructionsUrl')} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Due Date</label>
                                <input type="date" className={inputCls} value={formData.dueDate} onChange={set('dueDate')} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'solution' && (
                        <div className="space-y-3">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Solution Notes</label>
                                <textarea placeholder="Solution explanation, hints, or walkthrough..." className={textareaCls} value={formData.solutionContent} onChange={set('solutionContent')} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Solution URL</label>
                                <input placeholder="https://github.com/..." className={inputCls} value={formData.solutionUrl} onChange={set('solutionUrl')} />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white border border-white/10 rounded-lg transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-xs font-bold bg-violet-600 hover:bg-violet-500 rounded-lg transition-all disabled:opacity-50 flex items-center gap-1.5"
                        >
                            {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                            Add Lab
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
