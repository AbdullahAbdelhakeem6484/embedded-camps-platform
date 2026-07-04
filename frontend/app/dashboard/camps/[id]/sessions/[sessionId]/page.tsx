'use client';

import { useEffect, useState, use } from 'react';
import api from '@/lib/api';
import { ChevronLeft, Loader2, Play, FileText, ShieldAlert, Code2, Send, MessageSquare, HelpCircle, CheckCircle, Paperclip, X, BookOpen, Link2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';
import NoteEditor from '@/components/NoteEditor';
import BookmarkButton from '@/components/BookmarkButton';
import MarkdownRenderer from '@/components/MarkdownRenderer';

export default function SessionPlayerPage({ params }: { params: any }) {
    const { id, sessionId } = (use(params) as any);
    const toast = useToast();
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [labContent, setLabContent] = useState('');
    const [submittingLab, setSubmittingLab] = useState(false);
    const [labFile, setLabFile] = useState<File | null>(null);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
    const [mySubmissions, setMySubmissions] = useState<any[]>([]);
    const [completedMaterials, setCompletedMaterials] = useState<Set<string>>(new Set());
    const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
    const [isExpired, setIsExpired] = useState(false);
    const [contentSortBy, setContentSortBy] = useState('DEFAULT');

    const handleCompleteMaterial = async (materialId: string) => {
        try {
            await api.post(`/progress/materials/${materialId}/complete`);
            setCompletedMaterials(new Set(completedMaterials).add(materialId));
            toast.success('Material marked as completed!');
        } catch (err) {
            console.error('Failed to complete material', err);
        }
    };

    const fetchSessionData = async () => {
        try {
            const { data } = await api.get(`/camps/${id}`);
            const foundCampSession = data.campSessions?.find((cs: any) => cs.masterSession?.id === sessionId);
            if (foundCampSession) {
                setSession({ ...foundCampSession.masterSession, order: foundCampSession.order });
            }

            // Also fetch my submissions for labs in this session
            const subRes = await api.get('/labs/my-submissions');
            setMySubmissions(subRes.data);

            const [progRes, bkmRes] = await Promise.all([
                api.get(`/progress/camps/${id}`),
                api.get('/bookmarks/ids'),
            ]);
            setCompletedMaterials(new Set(progRes.data.completedMaterialIds || []));
            setBookmarkedIds(new Set(bkmRes.data));
        } catch (err: any) {
            console.error('Failed to fetch session data', err);
            if (err.response?.status === 403) {
                setIsExpired(true);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessionData();
    }, [id, sessionId]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setLabFile(file);
        setUploadingFile(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await api.post('/uploads', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setUploadedFileUrl(res.data.url);
            toast.success('File uploaded');
        } catch {
            toast.error('Failed to upload file');
        } finally {
            setUploadingFile(false);
        }
    };

    const handleSubmitLab = async (labId: string) => {
        if (!labContent.trim() && !uploadedFileUrl) return;
        setSubmittingLab(true);
        try {
            await api.post('/labs/submit', { labId, content: labContent, fileUrl: uploadedFileUrl });
            setLabContent('');
            setLabFile(null);
            setUploadedFileUrl(null);
            toast.success('Lab submitted successfully!');
            fetchSessionData(); // Refresh submissions
        } catch (err) {
            toast.error('Failed to submit lab');
        } finally {
            setSubmittingLab(false);
        }
    };

    const [quizAttemptStatus, setQuizAttemptStatus] = useState<'IDLE' | 'TAKING' | 'COMPLETED'>('IDLE');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
    const [score, setScore] = useState(0);

    const handleStartQuiz = () => {
        setQuizAttemptStatus('TAKING');
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
    };

    const handleAnswerQuestion = (oIndex: number) => {
        setSelectedAnswers({ ...selectedAnswers, [currentQuestionIndex]: oIndex });
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < (session.quizzes[0].questions.length - 1)) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            // Calculate score
            const quiz = session.quizzes[0];
            let correctCount = 0;
            quiz.questions.forEach((q: any, idx: number) => {
                if (selectedAnswers[idx] === q.correctOption) correctCount++;
            });
            const finalScore = Math.round((correctCount / quiz.questions.length) * 100);
            setScore(finalScore);
            setQuizAttemptStatus('COMPLETED');
            // Submit to backend
            api.post('/quizzes/submit', { quizId: quiz.id, score: finalScore });
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin w-10 h-10 text-blue-500" /></div>;

    if (isExpired) {
        return (
            <div className="space-y-8 pb-20">
                <div className="flex items-center space-x-4">
                    <Link href={`/dashboard/camps/${id}`} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                        <ChevronLeft className="w-5 h-5 text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold uppercase tracking-wide">Access Locked</h1>
                        <p className="text-gray-400">Classroom Restricted</p>
                    </div>
                </div>

                <div className="max-w-2xl mx-auto pt-10 text-center bg-[#111113] p-8 rounded-3xl border border-white/5 space-y-6">
                    <div className="inline-flex p-4 bg-red-500/10 rounded-full text-red-400 border border-red-500/20 mb-2">
                        <ShieldAlert className="w-12 h-12" />
                    </div>
                    <h3 className="font-bold text-2xl text-white">Enrollment Expired</h3>
                    <p className="text-gray-300 leading-relaxed">
                        Access to the active learning materials, labs, quizzes, and stream protected videos in this session has expired.
                    </p>
                    <div className="pt-4">
                        <Link 
                            href={`/dashboard/camps/${id}`} 
                            className="inline-flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white transition-all"
                        >
                            Return to Class Page
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!session) return <div className="text-center py-20">Session not found.</div>;

    const sortByNameOrDate = (arr: any[]) => {
        if (!arr) return [];
        return [...arr].sort((a: any, b: any) => {
            if (contentSortBy === 'NAME_ASC') return a.title.localeCompare(b.title);
            if (contentSortBy === 'NAME_DESC') return b.title.localeCompare(a.title);
            if (contentSortBy === 'DATE_ASC') return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
            if (contentSortBy === 'DATE_DESC') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
            return 0;
        });
    };

    const videoMaterials = sortByNameOrDate(session.materials?.filter((m: any) => m.type === 'VIDEO') || []);
    const resourceMaterials = sortByNameOrDate(session.materials?.filter((m: any) => m.type !== 'VIDEO') || []);
    const articleMaterials = resourceMaterials.filter((m: any) => m.type === 'ARTICLE');
    const otherMaterials = resourceMaterials.filter((m: any) => m.type !== 'ARTICLE');
    const labs = sortByNameOrDate(session.labs || []);
    const quizzes = sortByNameOrDate(session.quizzes || []);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex items-center space-x-4">
                    <Link href={`/dashboard/camps/${id}`} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                        <ChevronLeft className="w-5 h-5 text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold uppercase tracking-wide">{session.title}</h1>
                        <p className="text-gray-400">Section {session.order}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2 bg-[#111113] border border-white/5 rounded-xl px-3 py-1 self-start sm:self-auto shadow-sm">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Sort Content:</span>
                    <select
                        className="bg-transparent border-0 outline-none text-xs text-gray-300 py-1.5 cursor-pointer"
                        value={contentSortBy}
                        onChange={(e) => setContentSortBy(e.target.value)}
                    >
                        <option value="DEFAULT">Default Order</option>
                        <option value="NAME_ASC">Name (A-Z)</option>
                        <option value="NAME_DESC">Name (Z-A)</option>
                        <option value="DATE_DESC">Date Added (Newest)</option>
                        <option value="DATE_ASC">Date Added (Oldest)</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-8">
                    {videoMaterials.length > 0 ? (
                        <div className="space-y-6">
                            {videoMaterials.map((videoMaterial: any, index: number) => (
                                <div key={videoMaterial.id} className="space-y-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <h3 className="text-lg font-bold text-gray-200">Video {index + 1}: {videoMaterial.title}</h3>
                                        <BookmarkButton materialId={videoMaterial.id} initialBookmarked={bookmarkedIds.has(videoMaterial.id)} />
                                    </div>
                                    <div className="aspect-video bg-black rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative group">
                                        {videoMaterial.url.includes('youtube.com') || videoMaterial.url.includes('youtu.be') ? (
                                            <iframe
                                                className="w-full h-full"
                                                src={videoMaterial.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                                                title="YouTube video player"
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            ></iframe>
                                        ) : (
                                            <video
                                                className="w-full h-full"
                                                controls
                                                controlsList="nodownload"
                                                onContextMenu={(e) => e.preventDefault()}
                                                src={videoMaterial.url.startsWith('http') ? videoMaterial.url : `http://localhost:5000/api/streaming/video/${videoMaterial.id}`}
                                            >
                                                Your browser does not support the video tag.
                                            </video>
                                        )}
                                        <div className="absolute top-4 right-4 translate-x-12 group-hover:translate-x-0 transition-transform duration-300">
                                            <div className="flex items-center space-x-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                                                <ShieldAlert className="w-4 h-4 text-blue-400" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-white">Protected Stream</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        {!completedMaterials.has(videoMaterial.id) ? (
                                            <button
                                                onClick={() => handleCompleteMaterial(videoMaterial.id)}
                                                className="px-4 py-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white rounded-xl transition-all text-sm font-bold"
                                            >
                                                Mark "{videoMaterial.title}" as Complete
                                            </button>
                                        ) : (
                                            <div className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-sm font-bold flex items-center space-x-2">
                                                <CheckCircle className="w-4 h-4" />
                                                <span>Completed</span>
                                            </div>
                                        )}
                                    </div>
                                    <NoteEditor materialId={videoMaterial.id} materialTitle={videoMaterial.title} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="aspect-video bg-black rounded-3xl border border-white/5 flex flex-col items-center justify-center space-y-4 text-gray-500">
                            <Play className="w-16 h-16 opacity-20" />
                            <p className="font-medium">No video available for this session.</p>
                        </div>
                    )}

                    <div className="bg-[#111113] p-8 rounded-3xl border border-white/5 space-y-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold border-b border-white/5 pb-4 mb-4">Session Overview</h2>
                                <p className="text-gray-400 leading-relaxed">{session.description || 'Watch the videos and complete the materials below.'}</p>
                            </div>
                        </div>

                        {quizzes.length > 0 && (
                            <div className="p-8 bg-indigo-600/5 rounded-3xl border border-indigo-500/10 space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-bold flex items-center space-x-2">
                                        <HelpCircle className="w-6 h-6 text-indigo-400" />
                                        <span>Knowledge Check</span>
                                    </h2>
                                    {quizAttemptStatus === 'IDLE' && (
                                        <button
                                            onClick={handleStartQuiz}
                                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all text-sm font-bold"
                                        >
                                            Start Quiz
                                        </button>
                                    )}
                                </div>

                                {quizAttemptStatus === 'TAKING' && (
                                    <div className="space-y-6 animate-in slide-in-from-bottom-2">
                                        <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                                            <span>Question {currentQuestionIndex + 1} of {quizzes[0].questions.length}</span>
                                        </div>
                                        <h3 className="text-lg font-medium">{quizzes[0].questions[currentQuestionIndex].text}</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {quizzes[0].questions[currentQuestionIndex].options.map((option: string, i: number) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleAnswerQuestion(i)}
                                                    className={`p-4 text-left rounded-2xl border transition-all ${selectedAnswers[currentQuestionIndex] === i ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' : 'bg-white/5 border-white/5 hover:border-white/20 text-gray-400'}`}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex justify-end pt-4">
                                            <button
                                                disabled={selectedAnswers[currentQuestionIndex] === undefined}
                                                onClick={handleNextQuestion}
                                                className="px-8 py-3 bg-white text-black hover:bg-gray-200 rounded-xl font-bold transition-all disabled:opacity-50"
                                            >
                                                {currentQuestionIndex === quizzes[0].questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {quizAttemptStatus === 'COMPLETED' && (
                                    <div className="text-center py-8 space-y-4 animate-in zoom-in-95">
                                        <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/10 rounded-full border border-emerald-500/20 mb-2">
                                            <span className="text-3xl font-bold text-emerald-400">{score}%</span>
                                        </div>
                                        <h3 className="text-2xl font-bold">Quiz Completed!</h3>
                                        <p className="text-gray-400">Great job! Your score has been recorded.</p>
                                        <button
                                            onClick={() => setQuizAttemptStatus('IDLE')}
                                            className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-sm font-medium"
                                        >
                                            Retake Quiz
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {labs.length > 0 && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold flex items-center space-x-2 border-b border-white/5 pb-4">
                                    <Code2 className="w-6 h-6 text-emerald-400" />
                                    <span>Hands-on Labs</span>
                                </h2>
                                <div className="space-y-6">
                                    {labs.map((lab: any) => {
                                        const submission = mySubmissions.find(s => s.labId === lab.id);
                                        return (
                                            <div key={lab.id} className="bg-white/5 p-6 rounded-2xl border border-white/5 space-y-4">
                                                <div>
                                                    <h3 className="font-bold text-lg">{lab.title}</h3>
                                                    <p className="text-gray-400 text-sm mt-1">{lab.description}</p>
                                                </div>

                                                {submission ? (
                                                    <div className="space-y-4">
                                                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2">
                                                            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Your Submission</p>
                                                            {submission.content && <p className="text-sm text-gray-300">{submission.content}</p>}
                                                            {submission.fileUrl && (
                                                                <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors">
                                                                    <Paperclip className="w-3 h-3" />View attached file
                                                                </a>
                                                            )}
                                                            <p className="text-[10px] text-gray-500">Submitted at {new Date(submission.submittedAt).toLocaleString()}</p>
                                                        </div>
                                                        {submission.feedbacks?.length > 0 && (
                                                            <div className="space-y-3">
                                                                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center space-x-2">
                                                                    <MessageSquare className="w-3.5 h-3.5" />
                                                                    <span>Instructor Feedback</span>
                                                                </h4>
                                                                {submission.feedbacks.map((f: any) => (
                                                                    <div key={f.id} className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                                                                        <p className="text-sm text-gray-300">{f.text}</p>
                                                                        <p className="text-[10px] text-gray-500 mt-1">{new Date(f.createdAt).toLocaleString()}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Submit Lab</label>
                                                        <textarea
                                                            className="w-full px-4 py-3 bg-black/40 border border-white/5 rounded-xl focus:ring-2 focus:ring-violet-500/50 outline-none text-sm min-h-[80px] resize-none"
                                                            placeholder="Paste GitHub link, solution notes, or lab result here..."
                                                            value={labContent}
                                                            onChange={(e) => setLabContent(e.target.value)}
                                                        />
                                                        {/* File upload */}
                                                        <div className="flex items-center gap-3">
                                                            <label className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 hover:bg-white/10 cursor-pointer transition-all">
                                                                <Paperclip className="w-3.5 h-3.5" />
                                                                {uploadingFile ? 'Uploading…' : 'Attach file'}
                                                                <input type="file" className="hidden" onChange={handleFileChange} disabled={uploadingFile} />
                                                            </label>
                                                            {labFile && (
                                                                <div className="flex items-center gap-2 px-3 py-2 bg-violet-500/10 border border-violet-500/20 rounded-lg text-xs text-violet-300">
                                                                    <span className="truncate max-w-[160px]">{labFile.name}</span>
                                                                    <button onClick={() => { setLabFile(null); setUploadedFileUrl(null); }} className="shrink-0">
                                                                        <X className="w-3 h-3 text-gray-400 hover:text-red-400" />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => handleSubmitLab(lab.id)}
                                                            disabled={submittingLab || uploadingFile || (!labContent.trim() && !uploadedFileUrl)}
                                                            className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-xl transition-all disabled:opacity-50 text-sm font-semibold"
                                                        >
                                                            {submittingLab ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
                                                            Submit Lab
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-[#111113] p-6 rounded-3xl border border-white/5 space-y-6">
                        <h3 className="font-bold flex items-center space-x-2">
                            <FileText className="w-5 h-5 text-indigo-400" />
                            <span>Resources</span>
                        </h3>

                        <div className="space-y-4">
                            {resourceMaterials.length === 0 ? (
                                <p className="text-sm text-gray-500 italic">No additional resources.</p>
                            ) : (
                                <>
                                {/* Articles - rendered inline */}
                                {articleMaterials.map((m: any) => (
                                    <details key={m.id} className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                                        <summary className="flex items-center gap-3 p-4 cursor-pointer hover:bg-white/5 transition-colors list-none">
                                            <BookOpen className="w-4 h-4 text-violet-400 flex-shrink-0" />
                                            <span className="flex-1 text-sm font-medium">{m.title}</span>
                                            <BookmarkButton materialId={m.id} initialBookmarked={bookmarkedIds.has(m.id)} />
                                            {completedMaterials.has(m.id) ? (
                                                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                            ) : (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleCompleteMaterial(m.id); }}
                                                    className="px-3 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white rounded-lg transition-all text-xs font-bold shrink-0"
                                                >
                                                    Complete
                                                </button>
                                            )}
                                        </summary>
                                        <div className="border-t border-white/10 p-6">
                                            {m.content ? <MarkdownRenderer content={m.content} /> : <p className="text-gray-500 text-sm">No content.</p>}
                                        </div>
                                    </details>
                                ))}
                                {/* Links, PDFs, Resources */}
                                {otherMaterials.map((m: any) => {
                                    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
                                    const href = m.url?.startsWith('http') ? m.url : `${apiBase}${m.url}`;
                                    const icon = m.type === 'PDF' ? <FileText className="w-4 h-4 text-rose-400" /> : m.type === 'LINK' ? <Link2 className="w-4 h-4 text-amber-400" /> : <BookOpen className="w-4 h-4 text-emerald-400" />;
                                    return (
                                        <div key={m.id} className="flex items-center space-x-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all group">
                                            <a href={href} target="_blank" rel="noreferrer" className="flex items-center space-x-3 flex-1 min-w-0">
                                                {icon}
                                                <span className="text-sm font-medium truncate">{m.title}</span>
                                                <ExternalLink className="w-3 h-3 text-gray-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </a>
                                            <BookmarkButton materialId={m.id} initialBookmarked={bookmarkedIds.has(m.id)} />
                                            {!completedMaterials.has(m.id) ? (
                                                <button onClick={() => handleCompleteMaterial(m.id)}
                                                    className="px-3 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white rounded-lg transition-all text-xs font-bold shrink-0">
                                                    Complete
                                                </button>
                                            ) : (
                                                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                                            )}
                                        </div>
                                    );
                                })}
                                </>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
