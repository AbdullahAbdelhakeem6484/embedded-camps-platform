'use client';

import { useEffect, useState, use } from 'react';
import api from '@/lib/api';
import { PlayCircle, FileText, Lock, ChevronLeft, Loader2, BookOpen, Award, ExternalLink } from 'lucide-react';
import { CampViewSkeleton } from '@/components/ui/Skeleton';
import Link from 'next/link';

export default function StudentClassroom({ params }: { params: any }) {
    const { id } = (use(params) as any);
    const [camp, setCamp] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [errorData, setErrorData] = useState<any>(null);
    const [sessionSortBy, setSessionSortBy] = useState('SEQUENCE');
    const [progressData, setProgressData] = useState<any>(null);

    useEffect(() => {
        async function fetchCampAndProgress() {
            try {
                const [campRes, progressRes] = await Promise.all([
                    api.get(`/camps/${id}`),
                    api.get(`/progress/camps/${id}`)
                ]);
                setCamp(campRes.data);
                setProgressData(progressRes.data);
            } catch (err: any) {
                console.error('Failed to fetch camp details', err);
                if (err.response?.status === 403 && err.response?.data) {
                    setErrorData(err.response.data);
                } else {
                    setErrorData({ message: 'Camp details could not be loaded.' });
                }
            } finally {
                setLoading(false);
            }
        }
        fetchCampAndProgress();
    }, [id]);

    if (loading) return <CampViewSkeleton />;

    if (errorData) {
        return (
            <div className="space-y-8 pb-20">
                <div className="flex items-center space-x-4">
                    <Link href="/dashboard" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                        <ChevronLeft className="w-5 h-5 text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold uppercase tracking-tight">Access Locked</h1>
                        <p className="text-gray-400">Classroom Restricted</p>
                    </div>
                </div>

                <div className="max-w-2xl mx-auto pt-10">
                    {errorData.isExpired && errorData.certificateId ? (
                        <div className="bg-gradient-to-br from-emerald-600/20 to-teal-700/20 p-8 rounded-3xl border border-emerald-500/30 space-y-6 text-center shadow-xl">
                            <div className="inline-flex p-4 bg-emerald-500/20 rounded-full text-emerald-400 mb-2">
                                <Award className="w-12 h-12" />
                            </div>
                            <h3 className="font-bold text-2xl text-emerald-400">Congratulations, Graduate!</h3>
                            <p className="text-gray-300 leading-relaxed">
                                Your active course enrollment has expired, but you have successfully completed the curriculum and graduated! 
                            </p>
                            <p className="text-sm text-gray-400">
                                Your verified graduate certificate remains available permanently. You can view, download, or share it via the link below:
                            </p>
                            <div className="pt-4">
                                <Link 
                                    href={`/verify/${errorData.certificateId}`} 
                                    target="_blank" 
                                    className="inline-flex items-center space-x-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-white transition-all shadow-lg shadow-emerald-950/20"
                                >
                                    <span>View Verified Certificate</span>
                                    <ExternalLink className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-[#111113] p-8 rounded-3xl border border-white/5 space-y-6 text-center">
                            <div className="inline-flex p-4 bg-red-500/10 rounded-full text-red-400 mb-2 border border-red-500/20">
                                <Lock className="w-12 h-12" />
                            </div>
                            <h3 className="font-bold text-2xl text-white">Enrollment Expired</h3>
                            <p className="text-gray-300 leading-relaxed">
                                Your enrollment in this camp is no longer active. 
                            </p>
                            <p className="text-sm text-gray-400">
                                Access to active learning materials, videos, labs, and quizzes is restricted. If you need to renew your enrollment, please contact the administrator.
                            </p>
                            <div className="pt-4">
                                <Link 
                                    href="/dashboard" 
                                    className="inline-flex items-center space-x-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold text-white transition-all"
                                >
                                    Return to Dashboard
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (!camp) return <div className="text-center py-20 text-gray-400">Camp not found.</div>;

    const visibleSessions = (camp.campSessions?.filter((cs: any) => cs.isVisible) || [])
        .sort((a: any, b: any) => {
            if (sessionSortBy === 'SEQUENCE') return a.order - b.order;
            if (sessionSortBy === 'NAME_ASC') return a.masterSession.title.localeCompare(b.masterSession.title);
            if (sessionSortBy === 'NAME_DESC') return b.masterSession.title.localeCompare(a.masterSession.title);
            if (sessionSortBy === 'DATE_ASC') return new Date(a.masterSession.createdAt).getTime() - new Date(b.masterSession.createdAt).getTime();
            if (sessionSortBy === 'DATE_DESC') return new Date(b.masterSession.createdAt).getTime() - new Date(a.masterSession.createdAt).getTime();
            return 0;
        });

    const progressPercent = progressData?.progress || 0;

    return (
        <div className="space-y-8 pb-20">
            <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                    <ChevronLeft className="w-5 h-5 text-gray-400" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold uppercase tracking-tight">{camp.title}</h1>
                    <p className="text-gray-400">Classroom & Curriculum</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#111113] p-8 rounded-2xl border border-white/5 space-y-4 shadow-sm">
                        <div className="flex items-center space-x-3 text-blue-400">
                            <BookOpen className="w-6 h-6" />
                            <h2 className="text-xl font-bold">About this Camp</h2>
                        </div>
                        <p className="text-gray-300 leading-relaxed text-lg">{camp.description}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center pl-1">
                            <h2 className="text-xl font-bold">Curriculum</h2>
                            <div className="flex items-center space-x-2 bg-white/5 border border-white/5 rounded-xl px-3 py-1">
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Sort Modules:</span>
                                <select
                                    className="bg-transparent border-0 outline-none text-xs text-gray-300 py-1 cursor-pointer"
                                    value={sessionSortBy}
                                    onChange={(e) => setSessionSortBy(e.target.value)}
                                >
                                    <option value="SEQUENCE">Default Sequence</option>
                                    <option value="NAME_ASC">Name (A-Z)</option>
                                    <option value="NAME_DESC">Name (Z-A)</option>
                                    <option value="DATE_DESC">Date Added (Newest)</option>
                                    <option value="DATE_ASC">Date Added (Oldest)</option>
                                </select>
                            </div>
                        </div>
                        {visibleSessions.length === 0 ? (
                            <div className="p-8 bg-white/5 rounded-2xl border border-dashed border-white/10 text-center text-gray-500">
                                No sessions are visible yet. Please check back later!
                            </div>
                        ) : (
                            visibleSessions.map((campSession: any) => {
                                const session = campSession.masterSession;
                                return (
                                <div key={campSession.id} className="bg-[#111113] border border-white/5 rounded-2xl overflow-hidden group">
                                    <div className="p-6 flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-blue-600/10 rounded-full flex items-center justify-center text-blue-500 font-bold border border-blue-600/20">
                                                {campSession.order}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold group-hover:text-blue-400 transition-all">{session.title}</h3>
                                                <p className="text-sm text-gray-400">{session.description || 'Module details.'}</p>
                                            </div>
                                        </div>
                                        <Link
                                            href={`/dashboard/camps/${camp.id}/sessions/${session.id}`}
                                            className="px-6 py-2 bg-white/5 hover:bg-blue-600 rounded-xl transition-all font-semibold text-sm flex items-center space-x-2"
                                        >
                                            <PlayCircle className="w-4 h-4" />
                                            <span>Start Session</span>
                                        </Link>
                                    </div>
                                </div>
                            )})
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-[#111113] p-6 rounded-2xl border border-white/5 space-y-6 shadow-sm">
                        <h3 className="text-lg font-bold">Your Progress</h3>
                        <div className="space-y-4">
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className={`h-full bg-blue-600 transition-all duration-1000`} style={{ width: `${progressPercent}%` }}></div>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400 font-medium">{progressPercent}% Completed</span>
                                <span className="text-gray-400 font-medium">{progressData?.completedItems || 0} / {progressData?.totalItems || 0} Items</span>
                            </div>
                        </div>
                    </div>

                    {progressData?.isCompleted && progressData.certificate ? (
                        <div className="bg-gradient-to-br from-emerald-600/20 to-teal-700/20 p-6 rounded-2xl border border-emerald-500/30 space-y-4 text-center">
                            <div className="inline-flex p-3 bg-emerald-500/20 rounded-full text-emerald-400 mb-2">
                                <Lock className="w-8 h-8" />
                            </div>
                            <h3 className="font-bold text-xl text-emerald-400">Congratulations!</h3>
                            <p className="text-sm text-gray-300 leading-relaxed pb-4">
                                You have successfully completed this camp.
                            </p>
                            <Link href={`/verify/${progressData.certificate.id}`} target="_blank" className="block w-full py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-white transition-all">
                                View Certificate
                            </Link>
                        </div>
                    ) : (
                        <div className="bg-gradient-to-br from-blue-600/20 to-indigo-700/20 p-6 rounded-2xl border border-blue-500/10 space-y-4">
                            <h3 className="font-bold flex items-center space-x-2">
                                <Lock className="w-4 h-4" />
                                <span>Certification Locked</span>
                            </h3>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                Complete all videos, labs, and quizzes to receive your official certificate.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
