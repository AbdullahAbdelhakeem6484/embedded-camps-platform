import type { Metadata } from 'next';
import LandingClient from './LandingClient';

const WHATSAPP_NUMBER = '201023460370';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
const WHATSAPP_ENROLL = `${WHATSAPP_URL}?text=Hi!%20I%20want%20to%20enroll%20in%20the%20Embedded%20Android%20(AOSP)%20Camp.%20Please%20send%20me%20the%20details.`;

export const metadata: Metadata = {
    title: 'EmbeddedCamps | AOSP & Android Platform Engineering Bootcamp',
    description: 'Master AOSP, Android HAL, Binder IPC, SELinux, BSP porting, and Android security. Hands-on bootcamp for embedded engineers — real hardware labs on Raspberry Pi 4.',
    keywords: ['AOSP', 'Android Platform Engineering', 'Embedded Android', 'Android HAL', 'Binder IPC', 'BSP porting', 'Android bootcamp', 'EmbeddedCamps'],
    openGraph: {
        title: 'EmbeddedCamps — Master AOSP & Android Platform Engineering',
        description: 'Hands-on AOSP bootcamp. 8 courses, 50+ hours, real hardware labs. Join 200+ engineers.',
        type: 'website',
        url: 'https://embeddedcamps.com',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'EmbeddedCamps | AOSP Bootcamp',
        description: 'Master Android Platform Engineering with real hardware labs.',
    },
};

const COURSES = [
    { num: '00', title: 'Android Studio & Dev Environment', desc: 'Configure ADB, Fastboot, SDK, NDK, emulators — your professional embedded Android dev environment.', modules: 4, labs: 2 },
    { num: '01', title: 'AOSP Fundamentals', desc: 'Build system (Soong/Make), repo sync, source structure, lunch targets, build variants, flashing your first image.', modules: 5, labs: 5 },
    { num: '02', title: 'AOSP Internals', desc: 'Boot flow, Binder IPC, Zygote, ServiceManager, init.rc, package manager, system services deep dive.', modules: 6, labs: 6 },
    { num: '03', title: 'Debugging & Tracing', desc: 'Advanced ADB, logcat, tombstones, ANR traces, native crash analysis, Perfetto & systrace profiling.', modules: 5, labs: 5 },
    { num: '04', title: 'Security, Boot & OTA', desc: 'SELinux policies, verified boot, dm-verity, file-based encryption, A/B seamless OTA update system.', modules: 5, labs: 4 },
    { num: '05', title: 'System Design for Platform', desc: 'HAL architecture (HIDL/AIDL), Vehicle HAL, Treble, clean architecture, performance optimization patterns.', modules: 5, labs: 4 },
    { num: '06', title: 'Graduation Projects', desc: 'Choose from 30 professional projects: automotive HUD, custom LED HAL, enterprise MDM, OTA engine, and more.', modules: 6, labs: 3 },
    { num: '07', title: 'Career Coaching', desc: 'Technical interviews, system design sessions, AOSP coding challenges, resume building, salary negotiation.', modules: 5, labs: 3 },
    { num: '08', title: 'Interview Questions Bank', desc: '100+ real AOSP interview Q&A: theory, debugging scenarios, system design, implementation, behavioral (STAR).', modules: 5, labs: 2 },
];

const FAQS = [
    { q: 'Who is this bootcamp for?', a: 'Engineers who want to work in automotive, consumer electronics, or any product using Android as an OS platform. No prior AOSP experience needed — just solid Linux and C/C++ basics.' },
    { q: 'How do I enroll?', a: 'Message us on WhatsApp (+201023460370). After confirming your seat, pay via InstaPay (+201060178099) if you are in Egypt, or IBAN bank transfer for international students. Send the payment screenshot and we create your account within 24 hours.' },
    { q: 'What hardware do I need?', a: 'A PC with at least 32GB RAM and 500GB free disk for building AOSP. We also use Raspberry Pi 4 for hardware labs — we provide guidance on what to buy.' },
    { q: 'Is there live support?', a: 'Yes. You get access to a private Discord/WhatsApp group with all enrolled engineers and direct access to the instructor. Weekly live Q&A sessions are included.' },
    { q: 'How long do I have access?', a: 'Lifetime access to all course materials, lab guides, and future updates for the cohort you enroll in. No subscription or recurring fees.' },
    { q: 'Do I get a certificate?', a: 'Yes. Upon completing all sessions you receive a verifiable digital certificate with a unique public URL you can share on LinkedIn and your resume.' },
];


export default function Page() {
    return (
        <LandingClient
            courses={COURSES}
            faqs={FAQS}
            whatsappUrl={WHATSAPP_URL}
            enrollUrl={WHATSAPP_ENROLL}
        />
    );
}
