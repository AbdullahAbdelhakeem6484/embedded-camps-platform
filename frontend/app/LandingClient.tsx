'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import InfotainmentShowcase from '@/components/InfotainmentShowcase';
import {
    BookOpen, Shield, Cpu, Layers, Bug, Rocket, Briefcase, HelpCircle,
    MessageCircle, Clock, ChevronRight, Terminal, Zap,
    CheckCircle2, Sun, Moon, ArrowRight, Menu, X,
} from 'lucide-react';
import { getStoredUser, logout } from '@/lib/auth';
import axios from 'axios';

const WA = '201023460370';

interface BrandDef {
    id: string;
    name: string;
    icon: string;
    tagline: string;
    desc?: string;
    topics: string[];
    courses?: { title: string }[];
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
        price: '$110',
        origPrice: '$220',
        priceEGP: '6,000 EGP',
        origEGP: '12,000 EGP',
        status: 'live',
        href: '/camps/aosp',
        enrollMsg: 'Hi! I want to enroll in AOSPCamp (AOSP & Android Automotive). Please send me the payment details.',
    },
    {
        id: 'pcode',
        name: 'PCodeCamp',
        icon: '🧩',
        tagline: 'DSA, Problem Solving & System Design Bootcamp',
        desc: 'Master data structures, algorithm patterns, and system design through 150+ real interview problems. Built for engineers targeting FAANG, MAANG, and top-tier companies.',
        topics: ['Data Structures & Algorithms', 'LeetCode Mastery', 'Dynamic Programming', 'System Design (HLD + LLD)', 'FAANG Interview Prep', 'Mock Interviews'],
        courses: [
            { title: 'Programming Foundations & Complexity Analysis' },
            { title: 'Data Structures (Arrays, Trees, Graphs, Heaps)' },
            { title: 'Algorithm Patterns (Sliding Window, Two Pointers, BFS/DFS)' },
            { title: 'Dynamic Programming & Backtracking' },
            { title: 'LeetCode Mastery — 150+ Problems by Pattern' },
            { title: 'System Design Fundamentals (Scalability, Caching, DBs)' },
            { title: 'Embedded & Mobile System Design' },
            { title: 'Mock Interviews & Career Coaching' },
        ],
        stats: { Courses: '8', Hours: '50+', Problems: '150+', Mocks: '10+' },
        status: 'coming-soon',
        href: '/camps/pcode',
        color: { border: 'border-amber-500/20', bg: 'bg-amber-500/5', text: 'text-amber-400' },
        notifyMsg: 'Hi! I\'m interested in PCodeCamp (Coding Problem Solving & System Design). Please notify me when it launches.',
    },
    {
        id: 'ai',
        name: 'AICamp',
        icon: '🤖',
        tagline: 'AI, LLMs & AI Agents Bootcamp',
        desc: 'Build production AI systems — LLMs, RAG pipelines, AI agents, and deployed ML models. Not just notebooks.',
        topics: ['Python for AI & ML', 'Deep Learning & Neural Networks', 'LLMs & Transformers', 'LangChain, RAG & Vector DBs', 'AI Agents & Orchestration', 'Generative AI (Text & Image)', 'MLOps & Model Deployment', 'AI System Design'],
        courses: [
            { title: 'Python & ML Foundations' },
            { title: 'Deep Learning & Neural Networks' },
            { title: 'LLMs, Transformers & Fine-Tuning' },
            { title: 'LangChain, RAG & Vector Databases' },
            { title: 'AI Agents & Agentic Workflows' },
            { title: 'Generative AI & Computer Vision' },
            { title: 'MLOps, APIs & Model Deployment' },
            { title: 'AI System Design & Career Coaching' },
        ],
        stats: { Courses: '8', Hours: '60+', Labs: '25+', Projects: '10' },
        status: 'coming-soon',
        href: '/camps/ai',
        color: { border: 'border-sky-500/20', bg: 'bg-sky-500/5', text: 'text-sky-400' },
        notifyMsg: 'Hi! I\'m interested in AICamp (AI, LLMs & AI Agents). Please notify me when it launches.',
    },
    {
        id: 'en',
        name: 'EnglishFluencyCamp',
        icon: '🌍',
        tagline: 'English Fluency & Business Communication for Engineers',
        desc: 'Speak and write English with confidence at work. Every lesson uses real engineering contexts — no generic grammar drills.',
        topics: ['Technical Writing & Docs', 'Email & Slack Communication', 'Engineering Presentations', 'Code Review Language', 'Technical Interviews in English', 'Meeting Leadership', 'LinkedIn & Resume Writing', 'Business Negotiation'],
        courses: [
            { title: 'Technical English Foundations' },
            { title: 'Email, Slack & Async Writing' },
            { title: 'Engineering Presentations & Demos' },
            { title: 'Technical Interviews in English' },
            { title: 'Meeting Leadership & Discussion' },
            { title: 'Resume, LinkedIn & Career Docs' },
        ],
        stats: { Courses: '6', Hours: '40+', Projects: '20+', Level: 'All' },
        status: 'coming-soon',
        href: '/camps/en',
        color: { border: 'border-emerald-500/20', bg: 'bg-emerald-500/5', text: 'text-emerald-400' },
        notifyMsg: 'Hi! I\'m interested in EnglishFluencyCamp (English Fluency for Engineers). Please notify me when it launches.',
    },
];

const THEMES: Record<string, {
    border: string; glow: string; accent: string;
    tagStyle: string; btn: string; btnOutline: string; iconBg: string; numColor: string;
}> = {
    pcode: {
        border: 'border-amber-500/30',
        glow: '0 0 80px rgba(245,158,11,0.08)',
        accent: 'text-amber-400',
        tagStyle: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
        btn: 'bg-amber-600 hover:bg-amber-500 text-white',
        btnOutline: 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20',
        iconBg: 'bg-amber-500/20',
        numColor: '#f59e0b',
    },
    ai: {
        border: 'border-sky-500/30',
        glow: '0 0 80px rgba(14,165,233,0.08)',
        accent: 'text-sky-400',
        tagStyle: 'bg-sky-500/10 border-sky-500/20 text-sky-300',
        btn: 'bg-sky-600 hover:bg-sky-500 text-white',
        btnOutline: 'bg-sky-500/10 border-sky-500/30 text-sky-300 hover:bg-sky-500/20',
        iconBg: 'bg-sky-500/20',
        numColor: '#0ea5e9',
    },
    en: {
        border: 'border-emerald-500/30',
        glow: '0 0 80px rgba(16,185,129,0.08)',
        accent: 'text-emerald-400',
        tagStyle: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
        btn: 'bg-emerald-600 hover:bg-emerald-500 text-white',
        btnOutline: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20',
        iconBg: 'bg-emerald-500/20',
        numColor: '#10b981',
    },
};

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

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <Logo variant="horizontal" className="h-10 sm:h-12" />
                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Desktop links */}
                        <a href="#camps" className="text-sm text-text-muted hover:text-foreground transition-colors hidden md:block">Camps</a>
                        <a href="#curriculum" className="text-sm text-text-muted hover:text-foreground transition-colors hidden md:block">Curriculum</a>
                        <a href="#pricing" className="text-sm text-text-muted hover:text-foreground transition-colors hidden md:block">Pricing</a>
                        {mounted && (
                            <button onClick={toggleTheme} className="p-2 rounded-lg bg-surface-hover/50 border border-border hover:bg-surface-hover transition-all" aria-label="Toggle theme">
                                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-violet-500" />}
                            </button>
                        )}
                        {/* Desktop auth buttons */}
                        {mounted && isLoggedIn ? (
                            <div className="hidden sm:flex items-center gap-3">
                                <Link href={dashboardUrl} className="text-sm px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-all font-medium">Dashboard</Link>
                                <button onClick={() => logout()} className="text-sm px-4 py-2 rounded-lg bg-surface-hover/50 border border-border hover:bg-red-500/20 hover:text-red-500 transition-all text-text-muted">Log Out</button>
                            </div>
                        ) : (
                            <div className="hidden sm:flex items-center gap-2">
                                <Link href="/login" className="text-sm px-4 py-2 rounded-lg bg-surface-hover/50 border border-border hover:bg-surface-hover transition-all text-foreground">Login</Link>
                                <a href={`https://wa.me/${WA}?text=${encodeURIComponent(aosp.enrollMsg ?? '')}`} target="_blank" rel="noopener noreferrer" className="text-sm px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all font-medium">Enroll via WhatsApp</a>
                            </div>
                        )}
                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="sm:hidden p-2 rounded-lg bg-surface-hover/50 border border-border hover:bg-surface-hover transition-all"
                            aria-label="Open menu"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* ─── Mobile Menu Drawer ─── */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-[60] sm:hidden">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
                    <div className="absolute top-0 right-0 bottom-0 w-72 bg-background border-l border-border flex flex-col p-6 overflow-y-auto">
                        <div className="flex items-center justify-between mb-8">
                            <Logo variant="horizontal" className="h-9" />
                            <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-surface-hover text-text-muted">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Nav links */}
                        <div className="space-y-1 mb-6">
                            {[
                                { label: 'Camps', href: '#camps' },
                                { label: 'Curriculum', href: '#curriculum' },
                                { label: 'Pricing & FAQ', href: '#pricing' },
                            ].map(({ label, href }) => (
                                <a key={label} href={href} onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-text-muted hover:bg-surface-hover hover:text-foreground transition-all font-medium">
                                    {label}
                                </a>
                            ))}
                        </div>

                        <div className="h-px bg-border mb-6" />

                        {/* Auth section */}
                        {mounted && isLoggedIn ? (
                            <div className="space-y-3">
                                <Link href={dashboardUrl} onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-all">
                                    Dashboard
                                </Link>
                                <button onClick={() => { logout(); setMobileMenuOpen(false); }}
                                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-border text-text-muted hover:bg-red-500/10 hover:text-red-400 font-medium transition-all">
                                    Log Out
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <a href={`https://wa.me/${WA}?text=${encodeURIComponent(aosp.enrollMsg ?? '')}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all">
                                    <MessageCircle className="w-4 h-4" />Enroll via WhatsApp
                                </a>
                                <Link href="/login" onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-border text-foreground hover:bg-surface-hover font-medium transition-all">
                                    Login
                                </Link>
                            </div>
                        )}

                        {/* Theme toggle */}
                        {mounted && (
                            <button onClick={() => { toggleTheme(); }} className="mt-6 flex items-center gap-3 px-3 py-3 rounded-xl text-text-muted hover:bg-surface-hover transition-all font-medium">
                                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-violet-500" />}
                                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                            </button>
                        )}
                    </div>
                </div>
            )}

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
                    <div className="space-y-8">
                        {comingSoon.map((brand) => {
                        const isLiveInDb = activatedSlugs.has(brand.id);
                        const dbCamp = dbCamps.find(c => c.slug === brand.id);
                        const theme = THEMES[brand.id] ?? THEMES.ai;
                        return (
                            <div key={brand.id}
                                className={`relative rounded-3xl border ${theme.border} bg-surface/50 p-6 sm:p-8 overflow-hidden`}
                                style={{ boxShadow: theme.glow }}>

                                {/* Badges */}
                                <div className="relative lg:absolute lg:top-6 lg:right-6 flex flex-row lg:flex-col items-center lg:items-end gap-2 mb-6 lg:mb-0 z-10 flex-wrap">
                                    <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/20">50% OFF at launch</span>
                                    {isLiveInDb
                                        ? <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/20">● ENROLLING NOW</span>
                                        : <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/20">● COMING SOON</span>
                                    }
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                                    {/* ── Left: details ── */}
                                    <div>
                                        <div className="flex items-center gap-3 mb-5">
                                            <span className="text-4xl sm:text-5xl">{brand.icon}</span>
                                            <div>
                                                <h3 className="text-2xl sm:text-3xl font-bold text-foreground">{brand.name}</h3>
                                                <p className={`text-sm ${theme.accent} mt-0.5`}>{brand.tagline}</p>
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        {brand.stats && (
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                                                {Object.entries(brand.stats).map(([k, v]) => (
                                                    <div key={k} className="bg-surface-hover/30 rounded-xl p-3 text-center border border-border">
                                                        <div className="text-xl font-bold text-foreground">{v}</div>
                                                        <div className="text-[10px] text-text-muted uppercase tracking-wider mt-0.5">{k}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Topic Tags */}
                                        <div className="