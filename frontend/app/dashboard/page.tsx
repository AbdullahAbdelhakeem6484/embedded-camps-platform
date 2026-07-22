'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import {
    BookOpen, Clock, ChevronRight, Award, MessageCircle,
    Play, CheckCircle2, Zap, BarChart2, Calendar, Megaphone, Pin,
} from 'lucide-react';
import Link from 'next/link';
import { getCachedUser } from '@/lib/auth';
import { StatCardSkeleton, DashboardCampSkeleton } from '@/components/ui/Skeleton';

interface CampSummary {
    enrollmentId: string;
    campId: string;
    campTitle: string;
    campStatus: string;
    level: string | null;
    thumbnail: string | null;
    enrolledAt: string;
    expiresAt: string | null;
    progress: { total: number; completed: number; percentage: number };
    lastMaterial: { id: string; title: string; sessionTitle: string; sessionId: string } | null;
    nextMaterial: { id: string; title: string; sessionTitle: string; sessionId: string } | null;
    upcomingLabs: { id: string; title: string; dueDate: string; sessionTitle: string; campSessionId: string }[];
}

interface Announcement {
    id: string;
    title: string;
    content: string;
    pinned: boolean;
    createdAt: string;
    camp: { id: string; title: string } | null;
}

interface Certificate {
    id: string;
    issuedAt: string;
    camp: { id: string; title: string };
}

const LEVEL_COLORS: Record<string, string> = {
    BEGINNER: 'text-emerald-400 bg-emerald-500/10',
    INTERMEDIATE: 'text-amber-400 bg-amber-500/10',
    ADVANCED: 'text-red-400 bg-red-500/10',
};

function ProgressRing({ pct, size = 56 }: { pct: number; size?: number }) {
    const r = (size - 8) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;
    return (
        <svg width={size} height={size} className="rotate-[-90deg] shrink-0">
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={4} />
            <circle
                cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke={pct === 100 ? '#10b981' : '#8b5cf6'}
                strokeWidth={4} strokeLinecap="round"
                strokeDasharray={circ} strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
                fill={pct === 100 ? '#10b981' : '#fff'}
                fontSize={size * 0.22} fontWeight="700"
                style={{ transform: 'rotate(90deg)', transformOrigin: '50% 50%' }}>
                {pct}%
            </text>
        </svg>
    );
}

function daysLeft(expiresAt: string | null) {
    if (!expiresAt) return null;
    return Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000);
}

function daysUntil(date: string) {
    return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}

export default function EngineerDashboard() {
    const [summary, setSummary] = useState<CampSummary[]>([]);
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const user = getCachedUser();

    const fetchData = useCallback(async () => {
        if (!user) return;
        try {
            const [summaryRes, certRes, annRes] = await Promise.all([
                api.get('/progress/my-summary'),
                api.get('/certificates/my-certificates'),
                api.get('/announcements?limit=5'),
            ]);
            setSummary(Array.isArray(summaryRes.data) ? summaryRes.data : (summaryRes.data?.camps ?? []));
            setCertificates(Array.isArray(certRes.data) ? certRes.data : (certRes.data?.data ?? []));
            setAnnouncements(Array.isArray(annRes.data) ? annRes.data : (annRes.data?.data ?? []));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const totalCompleted = summary.reduce((s, c) => s + (c.progress?.completed ?? 0), 0);
    const totalMaterials = summary.reduce((s, c) => s + (c.progress?.total ?? 0), 0);
    const overallPct = totalMaterials > 0 ? Math.round((totalCompleted / totalMaterials) * 100) : 0;
    const allUpcomingLabs = summary.flatMap(c => c.upcomingLabs.map(l => ({ ...l, campTitle: c.campTitle, campId: c.campId })))
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    // Best "continue learning" — camp with lowest progress that has a next material
    const continueCamp = summary.find(c => c.nextMaterial && (c.progress?.percentage ?? 0) < 100) ?? null;

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
                </div>
                <DashboardCampSkeleton />
                <DashboardCampSkeleton />
                <DashboardCampSkeleton />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* ─── Greeting ─── */}
            <div>
                <h1 className="text-3xl font-bold">
                    Welcome back, {user?.name?.split(' ')[0] || 'Engineer'}! 👋
                </h1>
                <p className="text-gray-400 mt-1">
                    {summary.length === 0
                        ? 'Enroll in a camp to start your learning journey.'
                        : `You're ${overallPct}% through your learning path.`}
                </p>
            </div>

            {/* ─── Stats row ─── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Active Camps', value: summary.length, color: 'text-violet-400', icon: BookOpen },
                    { label: 'Materials Done', value: totalCompleted, color: 'text-sky-400', icon: CheckCircle2 },
                    { label: 'Certificates', value: certificates.length, color: 'text-amber-400', icon: Award },
                    { label: 'Overall Progress', value: `${overallPct}%`, color: 'text-emerald-400', icon: BarChart2 },
                ].map(({ label, value, color, icon: Icon }) => (
                    <div key={label} className="bg-[#111113] rounded-2xl border border-white/5 p-5">
                        <Icon className={`w-5 h-5 ${color} mb-2 opacity-70`} />
                        <p className={`text-2xl font-bold ${color}`}>{value}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                    </div>
                ))}
            </div>

            {/* ─── Continue Learning Banner ─── */}
            {continueCamp && continueCamp.nextMaterial && (
                <div className="relative overflow-hidden bg-violet-600/10 border border-violet-500/20 rounded-2xl p-6 flex items-center gap-5"
                    style={{ boxShadow: '0 0 40px rgba(139,92,246,0.08)' }}>
                    <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center shrink-0">
                        <Zap className="w-6 h-6 text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-0.5">Continue Learning</p>
                        <p className="font-bold truncate">{continueCamp.nextMaterial.title}</p>
                        <p className="text-xs text-gray-400 truncate">{continueCamp.campTitle} · {continueCamp.nextMaterial.sessionTitle}</p>
                    </div>
                    <Link
                        href={`/dashboard/camps/${continueCamp.campId}/sessions/${continueCamp.nextMaterial.sessionId}`}
                        className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-xl text-sm font-semibold transition-all"
                    >
                        <Play className="w-4 h-4" /> Resume
                    </Link>
                </div>
            )}

            {/* ─── Announcements ─── */}
            {announcements.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                        <Megaphone className="w-3.5 h-3.5" /> Announcements
                    </h2>
                    <div className="space-y-2">
                        {announcements.map(ann => (
                            <div key={ann.id} className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${ann.pinned ? 'border-violet-500/20 bg-violet-500/5' : 'border-white/5 bg-[#111113]'}`}>
                                {ann.pinned && <Pin className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />}
                                <div className="min-w-0">
                                    <p className="font-semibold">{ann.title}</p>
                                    <p className="text-gray-400 text-xs mt-0.5 line-clamp-2">{ann.content}</p>
                                    <p className="text-[11px] text-gray-600 mt-1">
                                        {ann.camp ? ann.camp.title : 'All students'} · {new Date(ann.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ─── Upcoming Lab Deadlines ─── */}
            {allUpcomingLabs.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">Upcoming Lab Deadlines</h2>
                    <div className="grid gap-2 sm:grid-cols-2">
                        {allUpcomingLabs.slice(0, 4).map(lab => {
                            const days = daysUntil(lab.dueDate);
                            const urgent = days <= 3;
                            return (
                                <div key={lab.id} className={`flex items-center gap-3 p-3.5 rounded-xl border text-sm ${urgent ? 'border-red-500/20 bg-red-500/5' : 'border-white/5 bg-white/3'}`}>
                                                         <Calendar className={`w-4 h-4 shrink-0 ${urgent ? 'text-red-400' : 'text-amber-400'}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{lab.title}</p>
                                        <p className={`text-xs mt-0.5 ${urgent ? 'text-red-400' : 'text-gray-500'}`}>
                                            {days === 0 ? 'Due today' : days === 1 ? 'Due tomorrow' : `Due in ${days} days`}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
