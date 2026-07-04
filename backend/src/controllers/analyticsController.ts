import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// GET /api/analytics/overview — admin only
export const getOverview = async (_req: Request, res: Response) => {
    try {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now.getTime() - 7 * 86400000);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        const [
            totalUsers,
            activeEnrollments,
            enrollmentsThisMonth,
            enrollmentsLastMonth,
            enrollmentsThisWeek,
            totalQuizAttempts,
            passedQuizAttempts,
            totalLabSubmissions,
            gradedLabSubmissions,
            totalMaterialProgress,
            recentEnrollments,
            recentLabSubmissions,
            recentQuizAttempts,
            campStats,
        ] = await prisma.$transaction([
            // Users
            prisma.user.count({ where: { role: 'STUDENT' } }),

            // Enrollments
            prisma.enrollment.count({ where: { status: 'ACTIVE' } }),
            prisma.enrollment.count({ where: { enrolledAt: { gte: startOfMonth } } }),
            prisma.enrollment.count({ where: { enrolledAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
            prisma.enrollment.count({ where: { enrolledAt: { gte: startOfWeek } } }),

            // Quizzes
            prisma.quizAttempt.count(),
            prisma.quizAttempt.count({ where: { passed: true } }),

            // Labs
            prisma.labSubmission.count(),
            prisma.feedback.count(),

            // Progress
            prisma.materialProgress.count({ where: { completed: true } }),

            // Recent activity feeds
            prisma.enrollment.findMany({
                orderBy: { enrolledAt: 'desc' },
                take: 8,
                include: {
                    user: { select: { name: true, email: true } },
                    camp: { select: { title: true } },
                },
            }),
            prisma.labSubmission.findMany({
                orderBy: { submittedAt: 'desc' },
                take: 5,
                include: {
                    user: { select: { name: true } },
                    lab: { select: { title: true } },
                },
            }),
            prisma.quizAttempt.findMany({
                orderBy: { createdAt: 'desc' },
                take: 5,
                include: {
                    user: { select: { name: true } },
                    quiz: { select: { title: true } },
                },
            }),

            // Per-camp enrollment counts
            prisma.camp.findMany({
                include: {
                    _count: { select: { enrollments: true } },
                    brand: { select: { name: true, icon: true } },
                },
                orderBy: { createdAt: 'desc' },
            }),
        ]);

        // Monthly enrollment trend: last 6 months
        const monthlyTrend = await Promise.all(
            Array.from({ length: 6 }, (_, i) => {
                const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
                const end = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 0, 23, 59, 59);
                return prisma.enrollment.count({ where: { enrolledAt: { gte: d, lte: end } } })
                    .then(count => ({
                        month: d.toLocaleDateString('en', { month: 'short', year: '2-digit' }),
                        count,
                    }));
            })
        );

        const quizPassRate = totalQuizAttempts > 0
            ? Math.round((passedQuizAttempts / totalQuizAttempts) * 100)
            : 0;

        const enrollmentGrowth = enrollmentsLastMonth > 0
            ? Math.round(((enrollmentsThisMonth - enrollmentsLastMonth) / enrollmentsLastMonth) * 100)
            : null;

        // Merge recent activity into a single feed sorted by time
        const activityFeed = [
            ...recentEnrollments.filter(e => e.user && e.camp).map(e => ({
                type: 'enrollment' as const,
                label: `${e.user?.name || e.user?.email || 'Student'} enrolled in ${e.camp?.title || 'Camp'}`,
                time: e.enrolledAt,
            })),
            ...recentLabSubmissions.filter(l => l.user && l.lab).map(l => ({
                type: 'lab' as const,
                label: `${l.user?.name || 'Student'} submitted "${l.lab?.title || 'Lab'}"`,
                time: l.submittedAt,
            })),
            ...recentQuizAttempts.filter(q => q.user && q.quiz).map(q => ({
                type: 'quiz' as const,
                label: `${q.user?.name || 'Student'} attempted "${q.quiz?.title || 'Quiz'}" — ${q.passed ? 'PASSED' : 'failed'}`,
                time: q.createdAt,
            })),
        ]
            .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
            .slice(0, 12);

        res.json({
            users: { total: totalUsers },
            enrollments: {
                active: activeEnrollments,
                thisWeek: enrollmentsThisWeek,
                thisMonth: enrollmentsThisMonth,
                lastMonth: enrollmentsLastMonth,
                growthPct: enrollmentGrowth,
                monthlyTrend,
            },
            quizzes: {
                total: totalQuizAttempts,
                passed: passedQuizAttempts,
                passRate: quizPassRate,
            },
            labs: {
                total: totalLabSubmissions,
                graded: gradedLabSubmissions,
                pendingGrade: totalLabSubmissions - gradedLabSubmissions,
            },
            progress: { completedMaterials: totalMaterialProgress },
            campStats: campStats.map(c => ({
                id: c.id,
                title: c.title,
                status: c.status,
                brand: c.brand,
                enrollments: c._count.enrollments,
            })),
            activityFeed,
        });
    } catch (error) {
        res.status(500).json({ message: 'Analytics error', error: String(error) });
    }
};
