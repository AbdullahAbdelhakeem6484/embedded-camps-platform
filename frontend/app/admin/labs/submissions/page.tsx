'use client';

import { useEffect, useState, Suspense } from 'react';
import api from '@/lib/api';
import { ChevronLeft, Loader2, MessageSquare, Send, User, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { SubmissionSkeleton } from '@/components/ui/Skeleton';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { useToast } from '@/components/ui/Toast';

interface Submission {
    id: string;
    content: string;
    fileUrl?: string | null;
    submittedAt: string;
    user: { id: string; name: string | null; email: string };
    lab: { id: string; title: string };
    feedback?: { id: string; content: string; grade?: number | null } | null;
}

function LabSubmissionsContent() {
    const toast = useToast();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('sessionId');
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [sessionTitle, setSessionTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [feedbackInputs, setFeedbackInputs] = useState<Record<string, { content: string; grade: string }>>({});
    const [submittingFeedback, setSubmittingFeedback] = useState<Record<string, boolean>>({});
    const [error, setError] = useState('');

    const fetchSubmissions = async () => {
        setLoading(true);
        setError('');
        try {
            if (sessionId) {
                // Fetch session to get labs
                const sessionRes = await api.get(`/sessions/${sessionId}`);
                const session = sessionRes.data;
                setSessionTitle(session.title);

                const labs: { id: string; title: string }[] = session.labs || [];
                if (!labs.length) { setLoading(false); return; }

                const subArrays = await Promise.all(
                    labs.map(async (lab) => {
                        try {
                            const res = await api.get(`/labs/${lab.id}/submissions`);
                            return (res.data as any[]).map((s) => ({ ...s, lab: { id: lab.id, title: lab.title } }));
                        } catch {
                            return [];
                        }
                    })
                );

                setSubmissions(subArrays.flat().sort((a, b) =>
                    new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
                ));
            } else {
                setSessionTitle('All Student Submissions');
                const res = await api.get('/labs/all-submissions?limit=50');
                const data = res.data.data ?? res.data;
                setSubmissions(data);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load submissions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, [sessionId]);

    const handleFeedback = async (submissionId: string) => {
        const input = feedbackInputs[submissionId];
        if (!input?.content?.trim()) return;

        setSubmittingFeedback((s) => ({ ...s, [submissionId]: true }));
        try {
            await api.post('/labs/feedback', {
                submissionId,
                content: input.content,
                grade: input.grade ? Number(input.grade) : undefined,
            });
            toast.success('Feedback submitted successfully');
            setFeedbackInputs((f) => ({ ...f, [submissionId]: { content: '', grade: '' } }));
            await fetchSubmissions();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to submit feedback');
        } finally {
            setSubmittingFeedback((s) => ({ ...s, [submissionId]: false }));
        }
    };

    if (loading) return (
        <div className="space-y-6">
            <SubmissionSkeleton />
            <SubmissionSkeleton />
            <SubmissionSkeleton />
        </div>
    );

    return (
        <div className="space-y-8 pb-20">
            <div className="flex items-center space-x-4">
                <Link href="/admin/sessions" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                    <ChevronLeft className="w-5 h-5 text-gray-400" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Lab Submissions</h1>
                    <p className="text-gray-400 text-sm">{sessionTitle || sessionId}</p>
                </div>
            </div>

            {error && (
                <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
            )}

            <div className="space-y-6">
                {submissions.length === 0 ? (
                    <div className="text-center py-20 bg-[#111113] rounded-3xl border border-white/5 text-gray-500">
                        No submissions yet for this session.
                    </div>
                ) : (
                    submissions.map((sub) => (
                        <div key={sub.id} className="bg-[#111113] border border-white/5 rounded-3xl p-8 space-y-6">
                            {/* Header */}
                            <div className="flex justify-between items-start">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-blue-600/10 rounded-full flex items-center justify-center border border-blue-600/20">
                                        <User className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold">{sub.user?.name || 'Engineer'}</h3>
                                        <p className="text-sm text-gray-400">{sub.user?.email}</p>
                                        <span className="text-xs text-blue-400 font-medium">{sub.lab?.title}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">{new Date(sub.submittedAt).toLocaleString()}</p>
                                    {sub.feedback ? (
                                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium mt-1">
                                            <CheckCircle className="w-3.5 h-3.5" /> Reviewed
                                            {sub.feedback.grade != null && ` · ${sub.feedback.grade}/100`}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-xs text-amber-400 font-medium mt-1">
                                            <XCircle className="w-3.5 h-3.5" /> Pending Review
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Submission Content */}
                            <div className="p-6 bg-black/40 border border-white/5 rounded-2xl relative group">
                                <p className="text-gray-300 whitespace-pre-wrap break-words">{sub.content}</p>
                                {sub.content?.startsWith('http') && (
                                    <a href={sub.content} target="_blank" rel="noopener noreferrer"
                                        className="absolute top-4 right-4 p-2 bg-blue-600/10 hover:bg-blue-600/20 rounded-lg text-blue-400 opacity-0 group-hover:opacity-100 transition-all">
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                )}
                                {sub.fileUrl && (
                                    <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer"
                                        className="mt-3 inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                                        <ExternalLink className="w-3.5 h-3.5" /> Attached File
                                    </a>
                                )}
                            </div>

                            {/* Existing Feedback */}
                            {sub.feedback && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                        <MessageSquare className="w-3.5 h-3.5" /> Your Feedback
                                    </h4>
                                    <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/15">
                                        <p className="text-sm text-gray-300">{sub.feedback.content}</p>
                                    </div>
                                </div>
                            )}

                            {/* New Feedback Form (only if not yet reviewed) */}
                            {!sub.feedback && (
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                        <MessageSquare className="w-3.5 h-3.5" /> Provide Feedback
                                    </h4>
                                    <textarea
                                        rows={3}
                                        placeholder="Write your feedback to the engineer..."
                                        className="w-full px-4 py-3 bg-black/40 border border-white/5 rounded-xl outline-none text-sm focus:ring-1 focus:ring-blue-500/50 resize-none"
                                        value={feedbackInputs[sub.id]?.content || ''}
                                        onChange={(e) => setFeedbackInputs((f) => ({
                                            ...f,
                                            [sub.id]: { ...(f[sub.id] || { grade: '' }), content: e.target.value }
                                        }))}
                                    />
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="number"
                                            min={0}
                                            max={100}
                                            placeholder="Grade (0–100)"
                                            className="w-36 px-4 py-2 bg-black/40 border border-white/5 rounded-xl outline-none text-sm focus:ring-1 focus:ring-blue-500/50"
                                            value={feedbackInputs[sub.id]?.grade || ''}
                                            onChange={(e) => setFeedbackInputs((f) => ({
                                                ...f,
                                                [sub.id]: { ...(f[sub.id] || { content: '' }), grade: e.target.value }
                                            }))}
                                        />
                                        <button
                                            onClick={() => handleFeedback(sub.id)}
                                            disabled={submittingFeedback[sub.id] || !feedbackInputs[sub.id]?.content?.trim()}
                                            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all disabled:opacity-50 text-sm font-medium"
                                        >
                                            {submittingFeedback[sub.id] ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
                                            Send Feedback
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )
            }
        </div>
    </div>
    );
}


export default function LabSubmissionsPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>}>
            <LabSubmissionsContent />
        </Suspense>
    );
}
