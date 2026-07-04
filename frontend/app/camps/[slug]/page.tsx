'use client';

import { use, useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, ChevronUp, MessageCircle, CheckCircle2, BookOpen, Code2, Star, Clock, Cpu, Shield, Bug, Layers, Rocket, Briefcase, HelpCircle, Terminal, Zap } from 'lucide-react';

const WA = '201023460370';

/* ─── AOSPCamp full curriculum ─────────────────────────────────── */
const AOSP_COURSES = [
    {
        num: '00', icon: '🛠️', title: 'Android Studio & Dev Environment',
        duration: '3 hrs', color: 'violet',
        desc: 'Set up your professional development environment for AOSP and Android platform engineering work.',
        modules: [
            'Android Studio Installation & Configuration',
            'ADB & Fastboot Setup and Commands',
            'Emulator & QEMU Configuration',
            'SDK, NDK & Platform Tools Overview',
        ],
        labs: [
            'Lab 0.1: Environment Verification & First ADB Commands',
            'Lab 0.2: Device Connection, Shell & Debugging',
        ],
        skills: ['ADB', 'Fastboot', 'Android SDK', 'NDK', 'Emulator'],
    },
    {
        num: '01', icon: '🔧', title: 'AOSP Fundamentals',
        duration: '8 hrs', color: 'violet',
        desc: 'Master the AOSP codebase structure, build system (Soong & Make), repo tool, and flash your first custom build.',
        modules: [
            'Introduction to AOSP & Android History',
            'Android Architecture Layers (Application, Framework, HAL, Kernel)',
            'Source Code Structure: system/, frameworks/, hardware/, packages/',
            'Repo & Git Tools: repo init, sync, forall, branches',
            'Build System: Soong, Blueprints, Android.bp & Makefiles',
        ],
        labs: [
            'Lab 1.1: Environment Setup & Prerequisites',
            'Lab 1.2: Source Code Download & Repo Sync',
            'Lab 1.3: Building AOSP from Scratch',
            'Lab 1.4: Source Code Exploration (find, grep in AOSP)',
            'Lab 1.5: Build Variants & Lunch Targets (eng, userdebug, user)',
        ],
        skills: ['Soong/Blueprint', 'repo tool', 'lunch targets', 'adb flash', 'build variants', 'fastboot'],
    },
    {
        num: '02', icon: '⚙️', title: 'AOSP Internals',
        duration: '10 hrs', color: 'violet',
        desc: 'Deep dive into Android boot process, Binder IPC, Zygote spawning, system services, and package management internals.',
        modules: [
            'Android Boot Flow: Bootloader → Kernel → init → Zygote → SystemServer',
            'Init System & RC Files (init.rc, service declarations, properties)',
            'Binder IPC Architecture & AIDL Interface Definition',
            'Zygote Process & Application Spawning Mechanism',
            'System Services Architecture (ServiceManager, SystemServer)',
            'Package Manager & App Installation Flow',
        ],
        labs: [
            'Lab 2.1: Boot Flow Tracing with Logcat',
            'Lab 2.2: Creating Custom Init Services',
            'Lab 2.3: Binder IPC Client-Server Communication',
            'Lab 2.4: Writing a Custom System Service',
            'Lab 2.5: Package Installation Deep Dive',
            'Lab 2.6: App Launch Profiling & Timing',
        ],
        skills: ['Binder', 'AIDL', 'Zygote', 'ServiceManager', 'init.rc', 'SystemServer'],
    },
    {
        num: '03', icon: '🔍', title: 'Debugging & Tracing',
        duration: '6 hrs', color: 'violet',
        desc: 'Master the complete Android debugging toolkit: advanced ADB, logcat, tombstones, ANR analysis, Perfetto & systrace.',
        modules: [
            'Advanced ADB Techniques & Shell Scripting',
            'Logcat Deep Dive: filters, buffers, log analysis at scale',
            'Native Crash Analysis: Tombstones, coredumps, addr2line',
            'Memory Leak Detection: Heaptrack, AddressSanitizer, Meminfo',
            'Perfetto & Systrace: performance profiling and trace analysis',
        ],
        labs: [
            'Lab 3.1: Advanced ADB Scripting & Automation',
            'Lab 3.2: Crash Analysis & Tombstone Reading',
            'Lab 3.3: Perfetto Profiling & Trace Visualization',
            'Lab 3.4: Memory Leak Detection with Heaptrack',
            'Lab 3.5: Native Debugging with LLDB',
        ],
        skills: ['ADB scripting', 'Perfetto', 'Systrace', 'LLDB', 'AddressSanitizer', 'addr2line'],
    },
    {
        num: '04', icon: '🔒', title: 'Security, Boot & OTA',
        duration: '8 hrs', color: 'violet',
        desc: 'Implement full Android security stack: SELinux policies, verified boot chain, dm-verity, FBE, and A/B OTA system.',
        modules: [
            'Android Security Model & Sandboxing Architecture',
            'SELinux Policy Writing, Auditing & audit2allow',
            'Verified Boot Chain & dm-verity Configuration',
            'File-Based Encryption (FBE) & Credential Encrypted Storage',
            'A/B Seamless OTA Update System & Update Engine',
        ],
        labs: [
            'Lab 4.1: SELinux Policy Writing & Debugging',
            'Lab 4.2: OTA Update Package Creation',
            'Lab 4.3: Verified Boot Configuration & Testing',
            'Lab 4.4: File-Based Encryption Setup',
        ],
        skills: ['SELinux', 'dm-verity', 'A/B OTA', 'Keymaster', 'FBE', 'Strongbox', 'audit2allow'],
    },
    {
        num: '05', icon: '🏗️', title: 'System Design for Platform Engineers',
        duration: '7 hrs', color: 'violet',
        desc: 'Design production-grade Android platform systems: HAL architecture, Vehicle HAL (VHAL), Treble, and performance patterns.',
        modules: [
            'Requirements Engineering for Embedded & Automotive Systems',
            'HAL Architecture: HIDL vs AIDL HAL (Treble compliance)',
            'Clean Architecture & MVVM for Android Platform Apps',
            'Vehicle HAL (VHAL) Design for Automotive Android',
            'Performance Optimization: jank, frame drops, boot time',
        ],
        labs: [
            'Lab 5.1: System Requirements Document',
            'Lab 5.2: HAL Architecture Design & Documentation',
            'Lab 5.3: AIDL HAL Implementation on Raspberry Pi',
            'Lab 5.4: System Integration & VTS Testing',
        ],
        skills: ['HAL design', 'HIDL/AIDL', 'VHAL', 'VTS testing', 'Treble architecture', 'GKI'],
    },
    {
        num: '06', icon: '🎓', title: 'Graduation Projects',
        duration: '10+ hrs', color: 'fuchsia',
        desc: 'Choose and complete one of 30 professional-grade projects to build your portfolio and prove your skills.',
        modules: [
            'Project Selection Framework & Evaluation Criteria',
            'Automotive HUD Dashboard (AOSP + VHAL + CarService)',
            'Custom LED HAL Implementation (AIDL HAL)',
            'A/B OTA Update Engine with Rollback',
            'Enterprise MDM Security System',
            'Android TV Smart Launcher',
            'Custom System Service with Binder IPC',
            'WearOS Health Watch Face',
            '+ 22 more professional projects',
        ],
        labs: [
            'Individual project implementation (guided)',
            'Code review & peer feedback sessions',
            'Final demo presentation & documentation',
        ],
        skills: ['End-to-end AOSP projects', 'Documentation', 'Code review', 'Demo skills', 'GitHub portfolio'],
    },
    {
        num: '07', icon: '💼', title: 'Career Coaching',
        duration: '5 hrs', color: 'violet',
        desc: 'Land your dream embedded Android role: master technical interviews, system design, resume, and salary negotiation.',
        modules: [
            'Technical Interview Preparation Framework for Platform Engineers',
            'System Design Interviews: AOSP component design on the whiteboard',
            'Coding Challenges Specific to Embedded & Platform Roles',
            'Resume & GitHub Portfolio Building for AOSP Engineers',
            'Career Roadmap, Offer Evaluation & Salary Negotiation',
        ],
        labs: [
            'Recorded mock technical interview with feedback',
            'Resume review & LinkedIn profile optimization',
            'Live mock system design session',
        ],
        skills: ['Interview technique', 'Salary negotiation', 'Portfolio building', 'System design communication'],
    },
    {
        num: '08', icon: '📋', title: 'Interview Questions Bank',
        duration: '4 hrs', color: 'violet',
        desc: '100+ real Android platform interview questions with detailed answers — theory, debugging, design, implementation, behavioral.',
        modules: [
            'Theory Q&A: AOSP architecture, Binder, Security, Boot flow',
            'Debugging Scenario Questions: How would you debug X?',
            'System Design Questions: Design a custom HAL for Y',
            'Implementation & Coding Challenges',
            'Behavioral Questions: STAR Method for Engineering Roles',
        ],
        labs: [
            'Self-assessment tests per topic',
            'Timed mock Q&A sessions',
            'Peer interview practice pairs',
        ],
        skills: ['Comprehensive AOSP knowledge', 'Technical communication', 'Problem-solving under pressure'],
    },
];

/* ─── Coming-soon camp stubs ─────────────────────────────────── */
const CAMP_META: Record<string, {
    name: string; icon: string; tagline: string; status: 'live' | 'coming-soon';
    color: { border: string; bg: string; text: string; btn: string; glow: string };
    topics?: string[];
}> = {
    aosp: {
        name: 'AOSPCamp', icon: '⚙️', status: 'live',
        tagline: 'Android Platform Engineering Bootcamp',
        color: { border: 'border-violet-500/30', bg: 'bg-violet-500/5', text: 'text-violet-400', btn: 'bg-violet-600 hover:bg-violet-500', glow: 'rgba(139,92,246,0.12)' },
    },
    pcode: {
        name: 'PCodeCamp', icon: '🧩', status: 'coming-soon',
        tagline: 'DSA, Problem Solving & System Design',
        color: { border: 'border-amber-500/20', bg: 'bg-amber-500/5', text: 'text-amber-400', btn: 'bg-amber-600 hover:bg-amber-500', glow: 'rgba(245,158,11,0.08)' },
        topics: ['Data Structures & Algorithms', 'LeetCode / Codeforces Patterns', 'System Design (HLD + LLD)', 'FAANG-style Problem Solving', 'Competitive Programming', 'Dynamic Programming', 'Graph Algorithms', 'Database Design'],
    },
    ai: {
        name: 'AICamp', icon: '🤖', status: 'coming-soon',
        tagline: 'ML, Deep Learning, LLMs & AI Agents',
        color: { border: 'border-sky-500/20', bg: 'bg-sky-500/5', text: 'text-sky-400', btn: 'bg-sky-600 hover:bg-sky-500', glow: 'rgba(14,165,233,0.08)' },
        topics: ['Machine Learning Fundamentals', 'Deep Learning & Neural Networks', 'Natural Language Processing (NLP)', 'Computer Vision (CV)', 'Large Language Models (LLMs)', 'AI Agents & Tool Use', 'Reinforcement Learning', 'Recommendation Systems'],
    },
    en: {
        name: 'EnglishFluencyCamp', icon: '🌍', status: 'coming-soon',
        tagline: 'Business English for Engineers',
        color: { border: 'border-emerald-500/20', bg: 'bg-emerald-500/5', text: 'text-emerald-400', btn: 'bg-emerald-600 hover:bg-emerald-500', glow: 'rgba(16,185,129,0.08)' },
        topics: ['Technical Communication & Writing', 'Business English for Emails', 'Presentation & Public Speaking', 'Interview English & Storytelling', 'Meeting Leadership & Facilitation', 'Professional Networking', 'Technical Documentation', 'Cross-Cultural Communication', 'LinkedIn & Personal Branding', 'Negotiation in English'],
    },
};

/* ─── Icon helper ─────────────────────────────────────────── */
const ICON_MAP: Record<string, React.ElementType> = {
    '00': Terminal, '01': Terminal, '02': Cpu, '03': Bug, '04': Shield,
    '05': Layers, '06': Rocket, '07': Briefcase, '08': HelpCircle,
};

export default function CampDetailPage({ params }: { params: any }) {
    const { slug } = use(params) as { slug: string };
    const meta = CAMP_META[slug];
    const [dbCamp, setDbCamp] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`/api/camps/slug/${slug}`)
            .then(r => setDbCamp(r.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#07050e] flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // If slug not in CAMP_META but exists in DB — render generic page
    if (!meta) {
        if (!dbCamp) {
            return (
                <div className="min-h-screen bg-[#07050e] flex flex-col items-center justify-center text-white">
                    <p className="text-gray-400 mb-4">Camp not found.</p>
                    <Link href="/" className="text-violet-400 hover:text-violet-300 flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />Back to Home
                    </Link>
                </div>
            );
        }
        return <GenericCampPage camp={dbCamp} />;
    }

    if (meta.status === 'coming-soon') {
        return <ComingSoonPage slug={slug} meta={meta} />;
    }

    return <AOSPCampPage meta={meta} dbCamp={dbCamp} />;
}


/* ─── Generic Camp Page (DB-only camps not in CAMP_META) ──── */
function GenericCampPage({ camp }: { camp: any }) {
    const WA_NUM = '201023460370';
    const enrollMsg = encodeURIComponent(`Hi! I want to enroll in ${camp.title}. Please send me the payment details.`);
    const sessions = camp.campSessions ?? [];
    const totalMaterials = sessions.reduce((s: number, cs: any) => s + (cs.masterSession?.materials?.length ?? 0), 0);
    const totalLabs = sessions.reduce((s: number, cs: any) => s + (cs.masterSession?.labs?.length ?? 0), 0);

    return (
        <div className="min-h-screen bg-[#07050e] text-white">
            <div className="border-b border-white/5 bg-[#0a0812]">
                <div className="max-w-5xl mx-auto px-6 py-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm">
                        <ArrowLeft className="w-4 h-4" />Back to EmbeddedCamps
                    </Link>
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4 flex-wrap">
                                <h1 className="text-3xl font-bold">{camp.title}</h1>
                                {camp.status === 'ACTIVE' && <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/20">● ENROLLING NOW</span>}
                            </div>
                            {camp.brand && <p className="text-violet-400 mb-3">{camp.brand.icon} {camp.brand.name}</p>}
                            <p className="text-gray-400 max-w-2xl leading-relaxed mb-6">{camp.description}</p>
                            <div className="flex flex-wrap gap-4 text-sm">
                                {sessions.length > 0 && <div className="flex items-center gap-1.5 text-gray-400"><BookOpen className="w-4 h-4 text-violet-400" />{sessions.length} sessions</div>}
                                {totalMaterials > 0 && <div className="flex items-center gap-1.5 text-gray-400"><Clock className="w-4 h-4 text-violet-400" />{totalMaterials} materials</div>}
                                {totalLabs > 0 && <div className="flex items-center gap-1.5 text-gray-400"><Code2 className="w-4 h-4 text-violet-400" />{totalLabs} labs</div>}
                                <div className="flex items-center gap-1.5 text-gray-400"><Star className="w-4 h-4 text-violet-400" />{camp.level}</div>
                            </div>
                        </div>
                        <div className="lg:w-72 bg-[#111113] border border-violet-500/20 rounded-2xl p-6 shrink-0">
                            <div className="text-3xl font-bold mb-1">{Number(camp.price).toLocaleString()} EGP</div>
                            <p className="text-sm text-gray-400 mb-5">{camp.language} · {camp.level}</p>
                            <a href={`https://wa.me/${WA_NUM}?text=${enrollMsg}`} target="_blank" rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-all text-sm">
                                <MessageCircle className="w-4 h-4" />Enroll via WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {sessions.length > 0 && (
                <div className="max-w-5xl mx-auto px-6 py-16">
                    <h2 className="text-2xl font-bold mb-8">Curriculum</h2>
                    <div className="space-y-4">
                        {sessions.map((cs: any) => (
                            <div key={cs.id} className="rounded-2xl border border-white/5 bg-[#0f0b1a] p-5">
                                <h3 className="font-semibold text-white">{cs.masterSession?.title}</h3>
                                {cs.masterSession?.description && <p className="text-sm text-gray-400 mt-1">{cs.masterSession.description}</p>}
                                <div className="flex gap-4 mt-3 text-xs text-gray-500">
                                    {cs.masterSession?.materials?.length > 0 && <span>{cs.masterSession.materials.length} materials</span>}
                                    {cs.masterSession?.labs?.length > 0 && <span>{cs.masterSession.labs.length} labs</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── Coming Soon Page ─────────────────────────────────────── */
function ComingSoonPage({ slug, meta }: { slug: string; meta: typeof CAMP_META[string] }) {
    return (
        <div className="min-h-screen bg-[#07050e] text-white">
            <div className="max-w-3xl mx-auto px-6 py-20">
                <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-12 text-sm">
                    <ArrowLeft className="w-4 h-4" />Back to all camps
                </Link>
                <div className={`rounded-3xl border ${meta.color.border} ${meta.color.bg} p-12 text-center`}
                    style={{ boxShadow: `0 0 80px ${meta.color.glow}` }}>
                    <span className="text-7xl mb-6 block">{meta.icon}</span>
                    <h1 className="text-4xl font-bold mb-3">{meta.name}</h1>
                    <p className={`text-lg ${meta.color.text} mb-8`}>{meta.tagline}</p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-10">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-sm text-gray-300">Coming Soon — 50% off at launch</span>
                    </div>
                    {meta.topics && (
                        <div className="mb-10">
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">What you'll learn</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {meta.topics.map(t => (
                                    <span key={t} className={`text-sm px-3 py-1.5 rounded-xl ${meta.color.bg} border ${meta.color.border} ${meta.color.text}`}>{t}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    <a href={`https://wa.me/${WA}?text=${encodeURIComponent(`Hi! I'm interested in ${meta.name} (${meta.tagline}). Please notify me when it launches.`)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2.5 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-all">
                        <MessageCircle className="w-5 h-5" />Notify Me on WhatsApp
                    </a>
                </div>
            </div>
        </div>
    );
}

/* ─── AOSPCamp Full Detail Page ────────────────────────────── */
function AOSPCampPage({ meta, dbCamp }: { meta: typeof CAMP_META[string]; dbCamp?: any }) {
    const [openCourse, setOpenCourse] = useState<string | null>('01');
    const toggle = (num: string) => setOpenCourse(o => o === num ? null : num);

    const totalModules = AOSP_COURSES.reduce((s, c) => s + c.modules.length, 0);
    const totalLabs = AOSP_COURSES.reduce((s, c) => s + c.labs.length, 0);

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: 'AOSPCamp — Android Platform Engineering Bootcamp',
        description: 'The most intensive hands-on bootcamp for engineers who want to work on Android internals, HAL development, automotive systems, and embedded Android.',
        provider: { '@type': 'Organization', name: 'EmbeddedCamps', url: 'https://embeddedcamps.com' },
        url: 'https://embeddedcamps.com/camps/aosp',
        hasCourseInstance: [{
            '@type': 'CourseInstance',
            courseMode: 'online',
            courseWorkload: 'PT55H',
            offers: {
                '@type': 'Offer',
                price: '100',
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
            },
        }],
        teaches: ['AOSP Build System', 'Binder IPC', 'Android Boot Flow', 'HAL Development', 'SELinux Policy', 'A/B OTA Updates', 'System Services'],
        numberOfCredits: 9,
        educationalLevel: 'Intermediate',
        inLanguage: 'en',
        image: 'https://embeddedcamps.com/og-aosp.jpg',
    };

    return (
        <div className="min-h-screen bg-[#07050e] text-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* ─── Header ─── */}
            <div className="border-b border-white/5 bg-[#0a0812]">
                <div className="max-w-5xl mx-auto px-6 py-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm">
                        <ArrowLeft className="w-4 h-4" />Back to EmbeddedCamps
                    </Link>

                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-5xl">{meta.icon}</span>
                                <div>
                                    <div className="flex items-center gap-3 flex-wrap mb-1">
                                        <h1 className="text-3xl font-bold">{meta.name}</h1>
                                        {dbCamp?.status === 'ACTIVE'
                                        ? <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/20">● ENROLLING NOW</span>
                                        : dbCamp?.status === 'COMPLETED'
                                            ? <span className="px-3 py-0.5 rounded-full bg-gray-500/20 text-gray-400 text-xs font-bold border border-gray-500/20">● COMPLETED</span>
                                            : <span className="px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/20">● UPCOMING</span>
                                    }
                                        <span className="px-3 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/20">50% OFF</span>
                                    </div>
                                    <p className="text-violet-400">{meta.tagline}</p>
                                </div>
                            </div>
                            <p className="text-gray-400 max-w-2xl leading-relaxed mb-6">
                                The most intensive hands-on bootcamp for engineers who want to work on Android internals, HAL development, automotive systems, and embedded Android. Go from fundamentals to interview-ready in one structured program.
                            </p>
                            {/* Stats row */}
                            <div className="flex flex-wrap gap-4 text-sm">
                                {[
                                    { icon: BookOpen, label: '9 Courses' },
                                    { icon: Clock, label: '55+ Hours' },
                                    { icon: Code2, label: `${totalLabs} Labs` },
                                    { icon: Star, label: `${totalModules} Modules` },
                                    { icon: Cpu, label: 'RPi4 Hardware' },
                                ].map(({ icon: Icon, label }) => (
                                    <div key={label} className="flex items-center gap-1.5 text-gray-400">
                                        <Icon className="w-4 h-4 text-violet-400" />{label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Price Card */}
                        <div className="lg:w-72 bg-[#111113] border border-violet-500/20 rounded-2xl p-6 shrink-0"
                            style={{ boxShadow: '0 0 40px rgba(139,92,246,0.1)' }}>
                            <div className="flex items-baseline gap-2 mb-1">
                                {dbCamp ? (
                                    <span className="text-4xl font-bold">{Number(dbCamp.price).toLocaleString()} EGP</span>
                                ) : (
                                    <>
                                        <span className="text-4xl font-bold">$100</span>
                                        <span className="text-gray-500 line-through text-lg">$200</span>
                                    </>
                                )}
                            </div>
                            <p className="text-sm text-gray-400 mb-4">{dbCamp ? dbCamp.level : '🇪🇬 5,500 EGP'} {!dbCamp && <span className="line-through text-gray-600">10,500 EGP</span>}</p>
                            <ul className="space-y-2 mb-5 text-sm">
                                {['All 9 courses', '1-year access', 'RPi4 hardware labs', 'Career coaching', 'Certificate'].map(i => (
                                    <li key={i} className="flex items-center gap-2 text-gray-300">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-violet-400 shrink-0" />{i}
                                    </li>
                                ))}
                            </ul>
                            <a href={`https://wa.me/${WA}?text=${encodeURIComponent('Hi! I want to enroll in AOSPCamp (Android Platform Engineering). Please send me the payment details.')}`}
                                target="_blank" rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-all text-sm mb-2">
                                <MessageCircle className="w-4 h-4" />Enroll via WhatsApp
                            </a>
                            <p className="text-center text-xs text-gray-600">7-day money back guarantee</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Curriculum ─── */}
            <div className="max-w-5xl mx-auto px-6 py-16">
                <div className="mb-10">
                    <h2 className="text-2xl font-bold mb-2">Full Curriculum</h2>
                    <p className="text-gray-400 text-sm">Click any course to expand modules, labs, and skills.</p>
                </div>

                <div className="space-y-4">
                    {AOSP_COURSES.map((course) => {
                        const Icon = ICON_MAP[course.num] ?? Terminal;
                        const isOpen = openCourse === course.num;
                        return (
                            <div key={course.num}
                                className={`rounded-2xl border transition-all overflow-hidden ${isOpen ? 'border-violet-500/30 bg-violet-500/5' : 'border-white/5 bg-[#0f0b1a] hover:border-white/10'}`}>
                                {/* Header */}
                                <button
                                    onClick={() => toggle(course.num)}
                                    className="w-full flex items-center gap-4 p-5 text-left"
                                >
                                    <div className={`w-10 h-10 rounded-xl ${isOpen ? 'bg-violet-500/20' : 'bg-white/5'} flex items-center justify-center shrink-0 transition-all`}>
                                        <Icon className={`w-5 h-5 ${isOpen ? 'text-violet-400' : 'text-gray-500'}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 flex-wrap mb-0.5">
                                            <span className="text-xs font-mono text-gray-500">Course {course.num}</span>
                                            <span className="text-sm">{course.icon}</span>
                                            <span className="text-xs text-gray-500">{course.duration}</span>
                                        </div>
                                        <h3 className="font-semibold text-base text-white">{course.title}</h3>
                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{course.desc}</p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="text-right hidden sm:block">
                                            <div className="text-xs text-gray-500">{course.modules.length} modules</div>
                                            <div className="text-xs text-violet-600">{course.labs.length} labs</div>
                                        </div>
                                        {isOpen ? <ChevronUp className="w-4 h-4 text-violet-400" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                                    </div>
                                </button>

                                {/* Expanded Content */}
                                {isOpen && (
                                    <div className="px-5 pb-6 border-t border-violet-500/10">
                                        <p className="text-sm text-gray-400 mt-4 mb-6 leading-relaxed">{course.desc}</p>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {/* Modules */}
                                            <div>
                                                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-1.5">
                                                    <BookOpen className="w-3.5 h-3.5" />Modules
                                                </h4>
                                                <ul className="space-y-2">
                                                    {course.modules.map((m, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                                            <span className="text-violet-500 font-mono text-xs mt-0.5 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                                                            <span>{m}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Labs */}
                                            <div>
                                                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-1.5">
                                                    <Code2 className="w-3.5 h-3.5" />Hands-on Labs
                                                </h4>
                                                <ul className="space-y-2">
                                                    {course.labs.map((l, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 mt-1.5 shrink-0" />
                                                            <span>{l}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Skills */}
                                            <div>
                                                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-1.5">
                                                    <Zap className="w-3.5 h-3.5" />Skills Gained
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {course.skills.map(s => (
                                                        <span key={s} className="text-xs px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300">{s}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Bottom CTA */}
                <div className="mt-16 text-center bg-[#0f0b1a] border border-violet-500/20 rounded-3xl p-12"
                    style={{ boxShadow: '0 0 60px rgba(139,92,246,0.08)' }}>
                    <Zap className="w-10 h-10 text-violet-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-3">Ready to Master Android Platform Engineering?</h2>
                    <p className="text-gray-400 mb-2">{totalModules} modules · {totalLabs} labs · 55+ hours · Raspberry Pi 4 hardware</p>
                    <p className="text-gray-500 text-sm mb-8">{dbCamp ? <><strong className="text-white">{Number(dbCamp.price).toLocaleString()} EGP</strong></> : <>50% launch discount — <strong className="text-white">$100 USD</strong> / <strong className="text-white">5,500 EGP</strong></>}</p>
                    <a href={`https://wa.me/${WA}?text=${encodeURIComponent('Hi! I want to enroll in AOSPCamp (Android Platform Engineering). Please send me the payment details.')}`}
                        target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2.5 px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-lg transition-all">
                        <MessageCircle className="w-5 h-5" />Enroll Now via WhatsApp
                    </a>
                </div>
            </div>
        </div>
    );
}
