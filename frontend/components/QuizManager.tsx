'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { Plus, Loader2, HelpCircle, Trash2, X, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface QuizManagerProps {
    sessionId: string;
    onUpdate: () => void;
}

export default function QuizManager({ sessionId, onUpdate }: QuizManagerProps) {
    const toast = useToast();
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [quizTitle, setQuizTitle] = useState('');
    const [passMark, setPassMark] = useState(70);
    const [questions, setQuestions] = useState<any[]>([
        { text: '', options: ['', '', '', ''], correctOption: 0 }
    ]);

    const addQuestion = () => {
        setQuestions([...questions, { text: '', options: ['', '', '', ''], correctOption: 0 }]);
    };

    const removeQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const updateQuestion = (index: number, field: string, value: any) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuestions(newQuestions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/quizzes', { masterSessionId: sessionId, title: quizTitle, passMark, questions });
            setQuizTitle('');
            setPassMark(70);
            setQuestions([{ text: '', options: ['', '', '', ''], correctOption: 0 }]);
            setShowForm(false);
            onUpdate();
        } catch (err) {
            toast.error('Failed to create quiz');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500">Knowledge Quizzes</h4>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center space-x-1"
                >
                    <Plus className="w-3 h-3" />
                    <span>{showForm ? 'Cancel' : 'Add Quiz'}</span>
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Quiz Title</label>
                            <input
                                required
                                placeholder="e.g. Session 1 Review"
                                className="w-full px-4 py-2 bg-black/40 border border-white/5 rounded-xl outline-none text-sm focus:ring-1 focus:ring-violet-500/50"
                                value={quizTitle}
                                onChange={(e) => setQuizTitle(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Pass Mark (%)</label>
                            <input
                                type="number"
                                min={1}
                                max={100}
                                required
                                className="w-full px-4 py-2 bg-black/40 border border-white/5 rounded-xl outline-none text-sm focus:ring-1 focus:ring-violet-500/50"
                                value={passMark}
                                onChange={(e) => setPassMark(Number(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        {questions.map((q, qIndex) => (
                            <div key={qIndex} className="p-4 bg-black/20 rounded-xl border border-white/5 space-y-4 relative">
                                <button
                                    type="button"
                                    onClick={() => removeQuestion(qIndex)}
                                    className="absolute top-4 right-4 text-gray-500 hover:text-red-400"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Question {qIndex + 1}</label>
                                    <input
                                        required
                                        placeholder="Enter question text..."
                                        className="w-full px-3 py-2 bg-white/5 border border-white/5 rounded-lg outline-none text-sm focus:ring-1 focus:ring-violet-500/50"
                                        value={q.text}
                                        onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {q.options.map((option: string, oIndex: number) => (
                                        <div key={oIndex} className="flex items-center space-x-2">
                                            <button
                                                type="button"
                                                onClick={() => updateQuestion(qIndex, 'correctOption', oIndex)}
                                                className={`p-1.5 rounded-lg transition-all ${q.correctOption === oIndex ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                            </button>
                                            <input
                                                required
                                                placeholder={`Option ${oIndex + 1}`}
                                                className="flex-1 px-3 py-1.5 bg-black/20 border border-white/5 rounded-lg outline-none text-xs focus:ring-1 focus:ring-violet-500/50"
                                                value={option}
                                                onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={addQuestion}
                        className="w-full py-2.5 border border-dashed border-white/10 rounded-xl text-xs font-bold text-gray-500 hover:text-violet-400 hover:border-violet-500/30 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add Another Question
                    </button>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-5 py-2 text-xs font-semibold text-gray-400 hover:text-white border border-white/10 rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2 text-xs font-bold bg-violet-600 hover:bg-violet-500 rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-lg shadow-violet-600/20"
                        >
                            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            Create Quiz
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
