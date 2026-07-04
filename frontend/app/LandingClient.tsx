'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import InfotainmentShowcase from '@/components/InfotainmentShowcase';
import {
    BookOpen, Shield, Cpu, Layers, Bug, Rocket, Briefcase, HelpCircle,
    MessageCircle, Clock, ChevronRight, Terminal, Zap,
    CheckCircle2, Sun, Moon, ArrowRight,
} from 'lucide-react';
import { getStoredUser, logout } from '@/lib/auth';
import axios from 'axios';

const WA = '201023460370';

interface BrandDef {
    id: string;
    name: string;
    icon: string;
    tagline: string;
    topics: string[];
    stats?: Record<string, string>;
    price?: string;
    origPrice?: string;
    priceEGP?: string;
    origEGP?: string;
    status: 'live' | 'coming-soon';
    href?: string;
    enrollMsg?: string;
    notifyMsg?: string;
    color?: { border: string; bg: string; text: string };
}

const BRANDS: BrandDef[] = [
    {
        id: 'aosp',
        name: 'AOSPCamp',
        icon: '⚙️',
        tagline: 'AOSP & Android Automotive (AAOS) Bootcamp',
        topics: ['AOSP & AAOS Internals', 'Android Automotive (AAOS)', 'HAL Development', 'Binder IPC', 'Android Boot Flow', 'SELinux Policy', 'A/B OTA Updates', 'Career Coaching'],
        stats: { Courses: '9', Hours: '55+', Labs: '35+', Hardware: 'RPi4' },
        price: '$100',
        origPrice: '$200',
        priceEGP: '5,500 EGP',
        origEGP: '10,500 EGP',
        status: 'live',
        href: '/camps/aosp',
        enrollMsg: 'Hi! I want to enroll in AOSPCamp (AOSP & Android Automotive). Please send me the payment details.',
    },
    {
        id: 'pcode',
        name: 'PCodeCamp',
        icon: '🧩',
        tagline: 'Coding Problem Solving & System Design',
        topics: ['Algorithms & DSA', 'Coding Problem Solving', 'LeetCode Patterns', 'System Design', 'FAANG Prep', 'Competitive Programming'],
        status: 'coming-soon',
        color: { border: 'border-amber-500/20', bg: 'bg-amber-500/5', text: 'text-amber-400' },
        notifyMsg: 'Hi! I\'m interested in PCodeCamp (Coding Problem Solving & System Design). Please notify me when it launches.',
    },
    {
        id: 'ai',
        name: 'AICamp',
        icon: '🤖',
        tagline: 'AI, LLMs & AI Agents Bootcamp',
        topics: ['AI, LLMs & AI Agents', 'Machine Learning', 'Deep Learning', 'Generative AI', 'NLP', 'Computer Vision', 'Agentic Workflows', 'Recommendation Systems'],
        status: 'coming-soon',
        color: { border: 'border-sky-500/20', bg: 'bg-sky-500/5', text: 'text-sky-400' },
        notifyMsg: 'Hi! I\'m interested in AICamp (AI, LLMs & AI Agents). Please notify me when it launches.',
    },
    {
        id: 'en',
        name: 'EnglishFluencyCamp',
        icon: '🌍',
        tagline: 'English Fluency & Business Communication',
        topics: ['English Fluency', 'Technical Communication', 'Business Writing', 'Presentation Skills', 'Interview Prep', 'Meeting Leadership', 'Technical Documentation', 'Professional Networking'],
        status: 'coming-soon',
        color: { border: 'border-emerald-500/20', bg: 'bg-emerald-500/5', text: 'text-emerald-400' },
        notifyMsg: 'Hi! I\'m interested in EnglishFluencyCamp (English Fluency for Engineers). Please notify me when it launches.',
    },
];

const ICON_MAP: Record<string, React.ElementType> = {
    '00': Terminal, '01': Terminal, '02': Cpu, '03': Bug, '04': Shield,
    '05': Layers, '06': Rocket, '07': Briefcase, '08': HelpCircle,
};

interface Course { num: string; title: string; desc: string; modules: number; labs?: number; }
interface Faq { q: string; a: string; }
interface Props { courses: Course[]; faqs: Faq[]; whatsappUrl: string; enrollUrl: string; }

export default function LandingClient({ courses, faqs, whatsappUrl, enrollUrl }: Props) {
    const [userRole, setUserRole] = useState<string | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const [mounted, setMounted] = useState(false);
    const [dbCamps, setDbCamps] = useState<any[]>([]);

    useEffect(() => {
        // Fetch active camps from DB (public — no auth required)
        axios.get('/api/camps/public').then(r => setDbCamps(r.data)).catch(() => {});
    }, []);

    useEffect(() => {
        setMounted(true);
        const user = getStoredUser();
        if (user) setUserRole(user.role);
        const stored = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initial = (stored as 'light' | 'dark') || (prefersDark ? 'dark' : 'light');
        setTheme(initial);
        document.documentElement.classList.toggle('dark', initial === 'dark');
    }, []);

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        localStorage.setItem('theme', next);
        document.documentElement.classList.toggle('dark', next === 'dark');
    };

    const isLoggedIn = !!userRole;
    const dashboardUrl = userRole === 'ADMIN' ? '/admin' : '/dashboard';
    const aosp = BRANDS[0];
    const comingSoon = BRANDS.slice(1);

    // DB-driven overrides
    const aospDb = dbCamps.find(c => c.slug === 'aosp');
    const isAospLive = aospDb?.status === 'ACTIVE';
    const aospSessionCount = aospDb?.campSessions?.length;
    const aospDbPrice = aospDb ? `${Number(aospDb.price).toLocaleString()} EGP` : null;
    // Coming-soon brands that are now ACTIVE in DB
    const activatedSlugs = new Set(dbCamps.filter(c => c.status === 'ACTIVE').map(c => c.slug));
    // DB camps not represented in BRANDS at all → show as bonus active cards
    const brandSlugs = new Set(BRANDS.map(b => b.id));
    const extraActiveCamps = dbCamps.filter(c => c.status === 'ACTIVE' && !brandSlugs.has(c.slug));

    return (
        <div className="min-h-screen bg-background text-foreground transition-all duration-300">

            {/* ─── Nav ─── */}
            <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Logo variant="horizontal" className="h-12" />
                    <div className="flex items-center gap-4">
                        <a href="#camps" className="text-sm text-text-muted hover:text-foreground transition-colors hidden sm:block">Camps</a>
                        <a href="#curriculum" className="text-sm text-text-muted hover:text-foreground transition-colors hidden sm:block">Curriculum</a>
                        <a href="#pricing" className="text-sm text-text-muted hover:text-foreground transition-colors hidden sm:block">Pricing</a>
                        {mounted && (
                            <button onClick={toggleTheme} className="p-2 rounded-lg bg-surface-hover/50 border border-border hover:bg-surface-hover transition-all" aria-label="Toggle theme">
                                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-violet-500" />}
                            </button>
                        )}
                        {mounted && isLoggedIn ? (
                            <div className="flex items-center gap-3">
                                <Link href={dashboardUrl} className="text-sm px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-all font-medium">Dashboard</Link>
                                <button onClick={() => logout()} className="text-sm px-4 py-2 rounded-lg bg-surface-hover/50 border border-border hover:bg-red-500/20 hover:text-red-500 transition-all text-text-muted">Log Out</button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/login" className="text-sm px-4 py-2 rounded-lg bg-surface-hover/50 border border-border hover:bg-surface-hover transition-all text-foreground">Login</Link>
                                <a href={`https://wa.me/${WA}?text=${encodeURIComponent(aosp.enrollMsg ?? '')}`} target="_blank" rel="noopener noreferrer" className="text-sm px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all font-medium hidden sm:block">Enroll via WhatsApp</a>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* ─── Hero ─── */}
            <section className="hero-gradient relative min-h-screen flex items-center justify-center pt-24 overflow-hidden text-foreground">
                <div className="absolute inset-0 opacity-[0.03] z-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                
                <div className="relative max-w-4xl mx-auto px-6 py-20 text-center z-10 space-y-8 flex flex-col items-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
                        <span className="text-sm text-brand">AOSPCamp — Enrolling Now · 50% Launch Discount</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight text-foreground">
                        Level Up Your <span className="brand-gradient-text">Engineering</span> Career
                    </h1>
                    <p className="text-lg sm:text-xl text-text-muted leading-relaxed max-w-3xl">
                        Four premium bootcamps designed to master AOSP/AAOS & Android Automotive internals, algorithmic problem solving & system design, enterprise AI, LLMs & agentic workflows, and professional English communication.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full sm:w-auto">
                        <a href={enrollUrl} target="_blank" rel="noopener noreferrer" className="whatsapp-btn flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl text-white font-semibold text-base shadow-lg w-full sm:w-auto">
                            <MessageCircle className="w-5 h-5" />Enroll via WhatsApp
                        </a>
                        <a href="#camps" className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-border text-foreground hover:bg-surface-hover transition-all font-medium bg-surface w-full sm:w-auto">
                            Explore Camps<ChevronRight className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </section>

            {/* ─── Camp Brands ─── */}
            <section id="camps" className="py-24 px-6 bg-surface/50 border-t border-b border-border">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 mb-4 text-xs font-semibold text-violet-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />4 Specialized Bootcamps
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold">Choose Your Camp</h2>
                        <p className="mt-4 text-gray-400 max-w-xl mx-auto">All camps launch with a <strong className="text-foreground">50% discount</strong>. One platform — unlimited engineering growth.</p>
                    </div>

                    {/* AOSPCamp — Featured Card */}
                    <div className="relative mb-8 rounded-3xl border border-violet-500/30 bg-surface/50 p-6 sm:p-8 overflow-hidden"
                        style={{ boxShadow: '0 0 80px rgba(139,92,246,0.12)' }}>
                        {/* Badges */}
                        <div className="relative lg:absolute lg:top-6 lg:right-6 flex flex-row lg:flex-col items-center lg:items-end gap-2 mb-6 lg:mb-0 z-10 flex-wrap">
                            <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/20">50% OFF</span>
                            {isAospLive
                            ? <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/20">● ENROLLING NOW</span>
                            : <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/20">● COMING SOON</span>
                        }
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                            {/* Left: Details */}
                            <div>
                                <div className="flex items-center gap-3 mb-5">
                                    <span className="text-4xl sm:text-5xl">{aosp.icon}</span>
                                    <div>
                                        <h3 className="text-2xl sm:text-3xl font-bold text-foreground">{aosp.name}</h3>
                                        <p className="text-sm text-violet-400 mt-0.5">{aosp.tagline}</p>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                                    {Object.entries(aosp.stats ?? {}).map(([k, v]) => (
                                        <div key={k} className="bg-surface-hover/30 rounded-xl p-3 text-center border border-border">
                                            <div className="text-xl font-bold text-foreground">{v}</div>
                                            <div className="text-[10px] text-text-muted uppercase tracking-wider mt-0.5">{k}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Topic Tags */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {aosp.topics.map(t => (
                                        <span key={t} className="text-xs px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 font-medium">{t}</span>
                                    ))}
                                </div>

                                {/* Price */}
                                <div className="flex items-baseline gap-3 mb-2">
                                    <span className="text-4xl font-bold text-foreground">{aosp.price}</span>
                                    <span className="text-gray-500 line-through text-xl">{aosp.origPrice}</span>
                                </div>
                                <div className="text-sm text-gray-400 mb-6">
                                    🇪🇬 <strong className="text-foreground">{aospDbPrice ?? aosp.priceEGP}</strong>{' '}
                                    {!aospDbPrice && <span className="line-through text-gray-600">{aosp.origEGP}</span>}
                                </div>

                                {/* CTAs */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <a href={`https://wa.me/${WA}?text=${encodeURIComponent(aosp.enrollMsg ?? '')}`} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-all text-sm w-full sm:w-auto">
                                        <MessageCircle className="w-4 h-4" />Enroll Now
                                    </a>
                                    <Link href={aosp.href ?? '/camps/aosp'}
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-violet-500/10 border border-violet-500/30 text-violet-300 rounded-xl font-semibold transition-all hover:bg-violet-500/20 text-sm w-full sm:w-auto">
                                        View Full Curriculum<ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>

                            {/* Right: Course List Preview */}
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Complete 9-Course Curriculum</p>
                                <div className="space-y-2">
                                    {courses.map((c) => {
                                        const Icon = ICON_MAP[c.num] ?? Terminal;
                                        return (
                                            <div key={c.num} className="flex items-center gap-3 p-3 bg-surface-hover/30 rounded-xl border border-border hover:border-violet-500/20 transition-all group">
                                                <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0">
                                                    <Icon className="w-4 h-4 text-violet-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-[10px] font-mono text-gray-500">Course {c.num}</div>
                                                    <div className="text-sm font-medium text-foreground truncate">{c.title}</div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <div className="text-[10px] text-text-muted">{c.modules} mod</div>
                                                    {c.labs && <div className="text-[10px] text-violet-500">{c.labs} labs</div>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <Link href={aosp.href ?? '/camps/aosp'} className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors">
                                    See all modules, labs & skills →
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Coming Soon / Active secondary Camps */}
                    {extraActiveCamps.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
                            {extraActiveCamps.map((c: any) => (
                                <div key={c.id} className="relative rounded-2xl border border-violet-500/30 bg-surface/50 p-6 overflow-hidden">
                                    <div className="absolute top-4 right-4">
                                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">● LIVE</span>
                                    </div>
                                    <div className="mb-4">
                                        <span className="text-3xl mb-3 block">{c.brand?.icon ?? '🎓'}</span>
                                        <h3 className="text-lg font-bold text-foreground">{c.title}</h3>
                                        <p className="text-xs text-violet-400 mt-0.5">{c.description?.slice(0, 80)}{c.description?.length > 80 ? '…' : ''}</p>
                                    </div>
                                    <div className="flex items-baseline gap-2 mb-4">
                                        <span className="text-2xl font-bold text-foreground">{Number(c.price).toLocaleString()} EGP</span>
                                    </div>
                                    <Link href={`/camps/${c.slug}`}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 rounded-xl text-sm font-medium text-violet-300 transition-all">
                                        <ArrowRight className="w-3.5 h-3.5" />View Camp
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {comingSoon.map((brand) => {
                        const isLiveInDb = activatedSlugs.has(brand.id);
                        const dbCamp = dbCamps.find(c => c.slug === brand.id);
                        const textColor = brand.color?.text ?? 'text-violet-400';
                        return (
                            <div key={brand.id} className={`relative rounded-2xl border ${isLiveInDb ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border bg-surface'} p-6 overflow-hidden`}>
                                <div className="absolute top-4 right-4">
                                    {isLiveInDb
                                        ? <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">● LIVE</span>
                                        : <span className="px-2.5 py-0.5 rounded-full bg-surface-hover border border-border text-text-muted text-[10px] font-bold uppercase tracking-wider">Coming Soon</span>
                                    }
                                </div>
                                <div className="mb-4">
                                    <span className="text-3xl mb-3 block">{brand.icon}</span>
                                    <h3 className="text-lg font-bold text-foreground">{brand.name}</h3>
                                    <p className={`text-xs ${textColor} mt-0.5`}>{brand.tagline}</p>
                                </div>
                                <div className="flex flex-wrap gap-1.5 mb-5">
                                    {brand.topics.slice(0, 5).map(t => (
                                        <span key={t} className="text-[10px] px-2 py-0.5 rounded-md bg-surface-hover border border-border text-text-muted">{t}</span>
                                    ))}
                                    {brand.topics.length > 5 && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-surface-hover border border-border text-text-muted">+{brand.topics.length - 5} more</span>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/20">
                                        50% OFF at launch
                                    </span>
                                </div>
                                {isLiveInDb && dbCamp ? (
                                    <Link href={`/camps/${dbCamp.slug}`}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-sm font-medium text-emerald-300 transition-all">
                                        <ArrowRight className="w-3.5 h-3.5" />View Camp
                                    </Link>
                                ) : (
                                    <a href={`https://wa.me/${WA}?text=${encodeURIComponent(brand.notifyMsg ?? '')}`} target="_blank" rel="noopener noreferrer"
                                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-surface-hover/80 hover:bg-surface-hover border border-border rounded-xl text-sm font-medium text-foreground transition-all">
                                        <MessageCircle className="w-3.5 h-3.5" />Notify Me on WhatsApp
                                    </a>
                                )}
                            </div>
                        );
                        })}
                    </div>
                </div>
            </section>

            {/* ─── Infotainment Demo ─── */}
            <section className="py-20 border-t border-b border-white/5 relative overflow-hidden">
                <div className="max-w-6xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 mb-4 text-xs font-semibold text-violet-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />⚙️ AOSPCamp Demo
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                            Interactive{' '}
                            <span className="brand-gradient-text">AOSPCamp Demo</span>
                        </h2>
                        <p className="text-gray-400 mt-3 max-w-xl mx-auto text-sm">
                            See what you'll build in the graduation project — a real Android infotainment system running on custom AOSP.
                        </p>
                    </div>
                    <div className="max-w-3xl mx-auto">
                        <InfotainmentShowcase />
                    </div>
                </div>
            </section>

            {/* ─── Why EmbeddedCamps ─── */}
            <section id="curriculum" className="py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold">Why Engineers Choose EmbeddedCamps</h2>
                        <p className="mt-4 text-gray-400 max-w-xl mx-auto">Not a theory course. Not a YouTube playlist. Real engineering with real hardware.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: Cpu, color: 'text-violet-400', bg: 'bg-violet-500/10', title: 'Real Hardware Labs', desc: 'Build on Raspberry Pi 4 running custom AOSP. Flash images, write HALs, debug with JTAG — real engineering, not simulation.' },
                            { icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10', title: 'Project-Based Learning', desc: '35+ hands-on labs and 30 graduation project choices. Build a portfolio that proves your skills to automotive and embedded employers.' },
                            { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', title: 'Industry-Current Content', desc: 'AIDL/HIDL, Treble, seamless A/B OTA, SELinux — the exact skills automotive and consumer electronics companies are hiring for now.' },
                            { icon: Clock, color: 'text-sky-400', bg: 'bg-sky-500/10', title: 'Self-Paced + Live Support', desc: 'Watch on your schedule, but never alone. Weekly live Q&A, a private WhatsApp group, and direct instructor access.' },
                            { icon: Briefcase, color: 'text-rose-400', bg: 'bg-rose-500/10', title: 'Career Coaching Included', desc: 'Technical interviews, resume reviews, salary negotiation — Course 07 prepares you for FAANG/automotive job hunts.' },
                            { icon: Shield, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', title: 'Verified Certificate', desc: 'Earn a verifiable certificate tied to a public URL. Share on LinkedIn, include in your resume, prove your expertise.' },
                        ].map(({ icon: Icon, color, bg, title, desc }) => (
                            <div key={title} className="bg-surface border border-border rounded-2xl p-6 hover:border-violet-500/20 transition-all">
                                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-4`}>
                                    <Icon className={`w-5 h-5 ${color}`} />
                                </div>
                                <h3 className="font-bold mb-2">{title}</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── FAQ ─── */}
            <section id="faq" className="py-24 px-6 bg-surface/50 border-t border-b border-border">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
                        <p className="text-gray-400 mt-3">Still have questions? Message us on WhatsApp and we'll reply within hours.</p>
                    </div>
                    <div className="space-y-4">
                        {faqs.map(({ q, a }) => (
                            <div key={q} className="bg-surface border border-border rounded-2xl p-6">
                                <h3 className="font-semibold mb-2 flex items-start gap-2">
                                    <HelpCircle className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                                    {q}
                                </h3>
                                <p className="text-sm text-gray-400 leading-relaxed pl-6">{a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Final CTA ─── */}
            <section id="pricing" className="py-32 px-6 relative overflow-hidden">
                <div className="absolute inset-0 hero-gradient opacity-30" />
                <div className="relative max-w-3xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6 text-xs font-semibold text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />50% Launch Discount — Limited Seats
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
                        Start Your <span className="brand-gradient-text">Engineering</span> Journey Today
                    </h2>
                    <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
                        Message us on WhatsApp. We confirm your seat, you pay, and your account is live within 24 hours.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a href={enrollUrl} target="_blank" rel="noopener noreferrer"
                            className="whatsapp-btn flex items-center gap-2.5 px-8 py-4 rounded-xl text-white font-bold text-base shadow-xl">
                            <MessageCircle className="w-5 h-5" />Enroll Now via WhatsApp
                        </a>
                        <Link href="/login"
                            className="flex items-center gap-2 px-8 py-4 rounded-xl border border-border text-foreground hover:bg-surface-hover transition-all font-medium">
                            Already enrolled? Log in
                        </Link>
                    </div>
                    <p className="mt-6 text-xs text-gray-600">🔒 Secure payment via InstaPay (Egypt) or IBAN bank transfer (international)</p>
                </div>
            </section>

            {/* ─── Footer ─── */}
            <footer className="border-t border-border py-12 px-6">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <Logo variant="horizontal" className="h-8" />
                    </div>
                    <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} EmbeddedCamps. All rights reserved.</p>
                    <div className="flex items-center gap-4">
                        <a href="mailto:info@embeddedcamps.com" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
