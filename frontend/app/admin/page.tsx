'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import {
    Users, BookOpen, GraduationCap, HelpCircle, FlaskConical,
    TrendingUp, TrendingDown, Minus, Clock, CheckCircle2,
    ChevronRight, Megaphone,
} from 'lucide-react';
import Link from 'next/link';
import { StatCardSkeleton } from '@/components/ui/Skeleton';

interface Analytics {
    users: { total: number };
    enrollments: { active: number; thisWeek: number; thisMonth: number; lastMonth: number; growthPct: number | null };
    quizzes: { totalAttempts: number; passed: number; passRate: number };
    labs: { totalSubmissions: number; graded: number; pendingGrade: number };
    progress: { completedMaterials: number };
    monthlyTrend: { month: string; count: number }[];
    campStats: { id: string; title: string; status: string; brand: { name: string; icon: string | null } | null; enrollments: number }[];
    activityFeed: { type: 'enrollment' | 'lab' | 'quiz'; label: string; time: string }[];
}

const ACTIVITY_ICONS: Record<string, { icon: typeof Users; color: string }> = {
    enrollment: { icon: GraduationCap, color: 'text-violet-400' },
    lab: { icon: FlaskConical, color: 'text-amber-400' },
    quiz: { icon: HelpCircle, color: 'text-sky-400' },
};

function MiniBarChart({ data }: { data: { month: string; count: number }[] }) {
    const max = Math.max(...data.map(d => d.count), 1);
    return (
        <div className="flex items-end gap-1.5 h-20">
            {data.map((d, i) => {
                const h = Math.max(4, Math.round((d.count / max) * 80));
                const isLast = i === data.length - 1;
                return (
                    <div key={d.month} className="flex flex-col items-center gap-1 flex-1">
                        <div
                            className={`w-full rounded-t-sm transition-all ${isLast ? 'bg-violet-500' : 'bg-white/10'}`}
                            style={{ height: `${h}px` }}
                            title={`${d.month}: ${d.count}`}
                        />
                        <span className="text-[9px] text-gray-600 leading-none">{d.month.split(' ')[0]}</span>
                    </div>
                );
            })}
        </div>
    );
}

function GrowthBadge({ pct }: { pct: number | null }) {
    if (pct === null) return null;
    if (pct > 0) return (
        <span className="flex items-center gap-0.5 text-xs text-emerald-400 font-bold">
            <TrendingUp className="w-3 h-3" />+{pct}%
        </span>
    );
    if (pct < 0) return (
        <span className="flex items-center gap-0.5 text-xs text-red-400 font-bold">
            <TrendingDown className="w-3 h-3" />{pct}%
        </span>
    );
    return <span className="flex items-center gap-0.5 text-xs text-gray-500"><Minus className="w-3 h-3" />0%</span>;
}

function timeAgo(dateStr: string) {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

const STATUS_COLORS: Record<string, string> = {
    ACTIVE: 'bg-emerald-500/10 text-emerald-400',
    UPCOMING: 'bg-amber-500/10 text-amber-400',
    COMPLETED: 'bg-gray-500/10 text-gray-400',
};

export default function AdminOverview() {
    const [data, setData] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/analytics/overview')
            .then(res => setData(res.data))
            .catch(() => setError('Failed to load analytics'))
            .finally(() => setLoading(false));
    }, []);

    const quickActions = [
        { href: '/admin/users', label: 'Add Engineer', sub: 'After WhatsApp payment', color: 'text-violet-400', bg: 'bg-violet-500/10' },
        { href: '/admin/camps', label: 'New Camp', sub: 'Create a cohort batch', color: 'text-sky-400', bg: 'bg-sky-500/10' },
        { href: '/admin/announcements', label: 'Broadcast', sub: 'Send announcement', color: 'text-amber-400', bg: 'bg-amber-500/10' },
        { href: '/admin/labs', label: 'Grade Labs', sub: `${data?.labs.pendingGrade ?? 0} pending`, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    ];

    if (error) return (
        <div className="text-center py-20 text-red-400">{error}</div>
    );

    return (
        <div className="space-y-8">
            {/* ─── Header ─── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-gray-400 mt-1">EmbeddedCamps platform overview</p>
                </div>
                <Link href="/admin/announcements"
                    className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-xl text-sm font-bold transition-all">
                    <Megaphone className="w-4 h-4" /> Announce
                </Link>
            </div>

            {/* ─── Stat Cards ─── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {loading ? (
                    [...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)
                ) : data && [
                    {
                        label: 'Total Students', value: data.users.total,
                        sub: `${data.enrollments.thisWeek} enrolled this week`,
                        icon: Users, color: 'text-violet-400', bg: 'bg-violet-500/10',
                        href: '/admin/users',
                    },
                    {
                        label: 'Active Enrollments', value: data.enrollments.active,
                        sub: <GrowthBadge pct={data.enrollments.growthPct} />,
                        icon: GraduationCap, color: 'text-sky-400', bg: 'bg-sky-500/10',
                        href: '/admin/users',
                    },
                    {
                        label: 'Quiz Pass Rate', value: `${data.quizzes.passRate}%`,
                        sub: `${data.quizzes.passed}/${data.quizzes.totalAttempts} passed`,
                        icon: HelpCircle, color: 'text-amber-400', bg: 'bg-amber-500/10',
                        href: '/admin/labs',
                    },
                    {
                        label: 'Materials Done', value: data.progress.completedMaterials,
                        sub: `${data.labs.pendingGrade} labs pending review`,
                        icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10',
                        href: '/admin/labs',
                    },
                ].map((card) => (
                    <Link key={card.label} href={card.href}
                        className="bg-surface border border-border rounded-2xl p-5 hover:border-violet-500/30 transition-all group">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-gray-400">{card.label}</span>
                            <div className={`w-9 h-9 ${card.bg} rounded-xl flex items-center justify-center`}>
                                <card.icon className={`w-4 h-4 ${card.color}`} />
                            </div>
                        </div>
                        <div className="text-3xl font-bold mb-1">{card.value}</div>
                        <div className="text-xs text-gray-500">{card.sub}</div>
                    </Link>
                ))}
            </div>

            {/* ─── Middle Row: Trend + Quick Actions ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Monthly Trend */}
                <div className="lg:col-span-2 bg-surface border border-border rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-lg">Monthly Enrollments</h2>
                        {data && (
                            <span className="text-xs text-gray-500">
                                This month: <span className="text-violet-400 font-bold">{data.enrollments.thisMonth}</span>
                            </span>
                        )}
                    </div>
                    {loading ? (
                        <div className="h-20 bg-white/5 rounded-xl animate-pulse" />
                    ) : data?.monthlyTrend?.length ? (
                        <MiniBarChart data={data.monthlyTrend} />
                    ) : (
                        <div className="h-20 flex items-center justify-center text-gray-600 text-sm">No trend data yet</div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="bg-surface border border-border rounded-2xl p-6">
                    <h2 className="font-bold text-lg mb-4">Quick Actions</h2>
                    <div className="space-y-2">
                        {quickActions.map(a => (
                            <Link key={a.label} href={a.href}
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-hover transition-all group">
                                <div className={`w-8 h-8 ${a.bg} rounded-lg flex items-center justify-center shrink-0`}>
                                    <ChevronRight className={`w-4 h-4 ${a.color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm">{a.label}</p>
                                    <p className="text-xs text-gray-500 truncate">{a.sub}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* ─── Bottom Row: Camps + Activity ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Camp Stats */}
                <div className="bg-surface border border-border rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-lg">Camps</h2>
                        <Link href="/admin/camps" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">View all</Link>
                    </div>
                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : !data?.campStats?.length ? (
                        <div className="text-center py-8 text-gray-600 text-sm">No camps yet</div>
                    ) : (
                        <div className="space-y-2">
                            {data.campStats.slice(0, 5).map(camp => (
                                <Link key={camp.id} href={`/admin/camps/${camp.id}`}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-hover transition-all">
                                    <div className="w-8 h-8 bg-violet-500/10 rounded-lg flex items-center justify-center shrink-0">
                                        <BookOpen className="w-4 h-4 text-violet-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{camp.title}</p>
                                        <p className="text-xs text-gray-500">{camp.brand?.name ?? 'No brand'}</p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                            <Users className="w-3 h-3" />{camp.enrollments}
                                        </span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${STATUS_COLORS[camp.status] ?? 'bg-gray-500/10 text-gray-400'}`}>
                                            {camp.status}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Activity Feed */}
                <div className="bg-surface border border-border rounded-2xl p-6">
                    <h2 className="font-bold text-lg mb-4">Recent Activity</h2>
                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-10 bg-white/5 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : !data?.activityFeed?.length ? (
                        <div className="text-center py-8 text-gray-600 text-sm">No recent activity</div>
                    ) : (
                        <div className="space-y-1">
                            {data.activityFeed.slice(0, 8).map((item, i) => {
                                const meta = ACTIVITY_ICONS[item.type] ?? ACTIVITY_ICONS.enrollment;
                                const Icon = meta.icon;
                                return (
                                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-hover transition-all">
                                        <div className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center shrink-0">
                                            <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                                        </div>
                                        <p className="flex-1 text-sm text-gray-300 truncate">{item.label}</p>
                                        <span className="text-[10px] text-gray-600 shrink-0 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />{timeAgo(item.time)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
