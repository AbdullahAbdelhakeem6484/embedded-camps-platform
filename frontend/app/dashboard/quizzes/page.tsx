'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { CheckCircle2, XCircle, Clock, HelpCircle, ChevronDown, ChevronUp, Award } from 'lucide-react';

interface QuizAttempt {
    id: string;
    score: number;
    passed: boolean;
    answers: number[];
    createdAt: string;
    quiz: { id: string; title: string; passMark: number };
}

function ScoreBadge({ score, passed }: { score: number; passed: boolean }) {
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-bold border ${
            passed
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-red-500/10 text-red-400 border-red-500/20'
        }`}>
            {passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
            {score}%
        </span>
    );
}

export default function QuizHistoryPage() {
    const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<string | null>(null);

    useEffect(() => {
        api.get('/quizzes/my-attempts')
            .then(res => setAttempts(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const toggle = (id: string) => setExpanded(e => e === id ? null : id);

    const passed = attempts.filter(a => a.passed).length;
    const avgScore = attempts.length > 0
        ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length)
        : 0;

    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-white/5 rounded-2xl" />)}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Quiz History</h1>
                <p className="text-gray-400 text-sm mt-1">All your quiz attempts across all camps.</p>
            </div>

            {/* Stats */}
            {attempts.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-[#111113] border border-white/5 rounded-2xl p-5 text-center">
                        <p className="text-2xl font-bold text-violet-400">{attempts.length}</p>
                        <p className="text-xs text-gray-500 mt-1">Total Attempts</p>
                    </div>
                    <div className="bg-[#111113] border border-white/5 rounded-2xl p-5 text-center">
                        <p className="text-2xl font-bold text-emerald-400">{passed}</p>
                        <p className="text-xs text-gray-500 mt-1">Passed</p>
                    </div>
                    <div className="bg-[#111113] border border-white/5 rounded-2xl p-5 text-center">
                        <p className="text-2xl font-bold text-amber-400">{avgScore}%</p>
                        <p className="text-xs text-gray-500 mt-1">Avg Score</p>
                    </div>
                </div>
            )}

            {attempts.length === 0 ? (
                <div className="bg-[#111113] border border-white/5 rounded-2xl p-12 text-center space-y-3">
                    <HelpCircle className="w-12 h-12 text-gray-600 mx-auto" />
                    <p className="font-semibold">No quiz attempts yet</p>
                    <p className="text-sm text-gray-500">Complete sessions in your camps to unlock quizzes.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {attempts.map(attempt => {
                        const isOpen = expanded === attempt.id;
                        return (
                            <div key={attempt.id}
                                className={`bg-[#111113] border rounded-2xl overflow-hidden transition-all ${
                                    attempt.passed ? 'border-emerald-500/10' : 'border-white/5'
                                }`}>
                                <button
                                    onClick={() => toggle(attempt.id)}
                                    className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/3 transition-colors"
                                >
                                    {/* Pass/fail icon */}
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                        attempt.passed ? 'bg-emerald-500/15' : 'bg-red-500/10'
                                    }`}>
                                        {attempt.passed
                                            ? <Award className="w-5 h-5 text-emerald-400" />
                                            : <XCircle className="w-5 h-5 text-red-400" />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold truncate">{attempt.quiz.title}</p>
                                        <div className="flex items-center gap-3 mt-0.5">
                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(attempt.createdAt).toLocaleDateString(undefined, {
                                                    year: 'numeric', month: 'short', day: 'numeric',
                                                })}
                                            </span>
                                            <span className="text-xs text-gray-600">Pass mark: {attempt.quiz.passMark}%</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                        <ScoreBadge score={attempt.score} passed={attempt.passed} />
                                        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                                    </div>
                                </button>

                                {isOpen && (
                                    <div className="px-5 pb-5 pt-1 border-t border-white/5">
                                        <div className="space-y-2">
                                            {/* Score bar */}
                                            <div>
                                                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                                                    <span>Score</span>
                                                    <span>{attempt.score}% / {attempt.quiz.passMark}% required</span>
                                                </div>
                                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${attempt.passed ? 'bg-emerald-500' : 'bg-red-500'}`}
                                                        style={{ width: `${attempt.score}%` }}
                                                    />
                                                </div>
                                                {/* Pass mark indicator */}
                                                <div className="relative h-0" style={{ marginTop: '-8px' }}>
                                                    <div
                                                        className="absolute w-0.5 h-3 bg-amber-400 rounded-full"
                                                        style={{ left: `${attempt.quiz.passMark}%` }}
                                                        title={`Pass mark: ${attempt.quiz.passMark}%`}
                                                    />
                                                </div>
                                            </div>

                                            <p className="text-xs text-gray-500 pt-2">
                                                {attempt.passed
                                                    ? '✅ You passed this quiz. Well done!'
                                                    : `❌ You needed ${attempt.quiz.passMark}% to pass. Keep studying and try again.`}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
