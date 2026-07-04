import Link from 'next/link';
import { MessageCircle, CreditCard, UserCheck, ArrowRight, Phone } from 'lucide-react';

const WHATSAPP_URL = 'https://wa.me/201023460370';

const steps = [
    {
        icon: MessageCircle,
        step: '01',
        title: 'Contact Us on WhatsApp',
        desc: 'Send us a message on WhatsApp. We will confirm available seats, answer your questions, and send you the payment details.',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
        icon: CreditCard,
        step: '02',
        title: 'Send Payment',
        desc: 'Egypt: Send via InstaPay or wallet to +201060178099.\nInternational: We will provide IBAN bank transfer details.\nThen send a screenshot of the payment on WhatsApp.',
        color: 'text-blue-400',
        bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
        icon: UserCheck,
        step: '03',
        title: 'Get Your Account',
        desc: 'We create your account and send you the credentials within 24 hours. You get 1-year access to all course content, labs, and live sessions.',
        color: 'text-purple-400',
        bg: 'bg-purple-500/10 border-purple-500/20',
    },
];

export default function EnrollPage() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4 py-16">
            <div className="w-full max-w-2xl space-y-10">
                {/* Header */}
                <div className="text-center space-y-3">
                    <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wider uppercase">
                        Enrollment Process
                    </span>
                    <h1 className="text-4xl font-bold">Join EmbeddedCamps</h1>
                    <p className="text-gray-400 text-lg max-w-md mx-auto">
                        We verify each engineer personally. Follow these 3 steps to get access.
                    </p>
                </div>

                {/* Steps */}
                <div className="space-y-4">
                    {steps.map(({ icon: Icon, step, title, desc, color, bg }) => (
                        <div key={step} className={`flex gap-5 p-6 rounded-2xl border ${bg} bg-opacity-50`}>
                            <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${bg} border`}>
                                <Icon className={`w-6 h-6 ${color}`} />
                            </div>
                            <div>
                                <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${color}`}>Step {step}</p>
                                <h3 className="font-semibold text-white text-lg">{title}</h3>
                                <p className="text-gray-400 text-sm mt-1 whitespace-pre-line">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center space-y-4">
                    <a
                        href={WHATSAPP_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-emerald-500/20"
                    >
                        <MessageCircle className="w-6 h-6" />
                        Start on WhatsApp
                        <ArrowRight className="w-5 h-5" />
                    </a>

                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                        <Phone className="w-4 h-4" />
                        <span>+20 102 346 0370</span>
                    </div>

                    <p className="text-gray-500 text-sm">
                        Already have an account?{' '}
                        <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
