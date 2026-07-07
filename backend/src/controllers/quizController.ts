import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AppError } from '../middlewares/errorHandler';
import { EnrollmentService } from '../services/enrollment.service';
import { AuthRequest } from '../middlewares/auth';

// ─── Zod Schemas (exported for routes) ────────────────────────────────────────

export const createQuizSchema = z.object({
    title: z.string().min(1).max(200),
    masterSessionId: z.string().uuid(),
    passMark: z.number().int().min(0).max(100).default(70),
    questions: z.array(z.object({
        text: z.string().min(1),
        options: z.array(z.string()).min(2).max(6),
        correctOption: z.number().int().min(0),
        explanation: z.string().optional(),
    })).min(1),
});

export const submitQuizSchema = z.object({
    quizId: z.string().uuid(),
    answers: z.array(z.number().int().min(0)),
});

// ─── Controllers ──────────────────────────────────────────────────────────────

// POST /api/quizzes — admin creates a quiz
export const createQuiz = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, masterSessionId, passMark, questions } = req.body;

        const quiz = await prisma.quiz.create({
            data: {
                title,
                masterSessionId,
                passMark,
                questions: {
                    create: questions.map((q: any, i: number) => ({
                        text: q.text,
                        options: q.options,
                        correctOption: q.correctOption,
                        explanation: q.explanation,
                        order: i,
                    })),
                },
            },
            include: { questions: { orderBy: { order: 'asc' } } },
        });
        res.status(201).json(quiz);
    } catch (err) {
        next(err);
    }
};

// DELETE /api/quizzes/:id
export const deleteQuiz = async (req: Request, res: Response) => {
    await prisma.quiz.delete({ where: { id: req.params.id } })
        .catch(() => { throw new AppError('Quiz not found', 404); });
    res.json({ message: 'Quiz deleted' });
};

// GET /api/quizzes/session/:sessionId
export const getQuizBySession = async (req: AuthRequest, res: Response) => {
    const quiz = await prisma.quiz.findFirst({
        where: { masterSessionId: req.params.sessionId },
        include: {
            questions: {
                select: {
                    id: true,
                    text: true,
                    options: true,
                    order: true,
                    ...(req.user.role === 'ADMIN' && {
                        correctOption: true,
                        explanation: true,
                    }),
                },
                orderBy: { order: 'asc' },
            },
        },
    });
    if (!quiz) throw new AppError('No quiz found for this session', 404);

    if (req.user.role !== 'ADMIN') {
        await EnrollmentService.findActiveForSession(req.user.id, req.params.sessionId);
    }

    res.json(quiz);
};

// POST /api/quizzes/submit — server-side grading
export const submitQuizAttempt = async (req: AuthRequest, res: Response) => {
    const { quizId, answers } = req.body as { quizId: string; answers: number[] };

    const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: { questions: { orderBy: { order: 'asc' } } },
    });
    if (!quiz) throw new AppError('Quiz not found', 404);

    await EnrollmentService.findActiveForSession(req.user.id, quiz.masterSessionId);

    const previousPass = await prisma.quizAttempt.findFirst({
        where: { quizId, userId: req.user.id, passed: true },
    });
    if (previousPass) throw new AppError('You have already passed this quiz', 409);

    if (answers.length !== quiz.questions.length) {
        throw new AppError(`Expected ${quiz.questions.length} answers, got ${answers.length}`, 422);
    }

    const breakdown = quiz.questions.map((q, i) => ({
        questionId: q.id,
        studentAnswer: answers[i],
        correctAnswer: q.correctOption,
        isCorrect: answers[i] === q.correctOption,
        explanation: (q as any).explanation || null,
    }));

    const correct = breakdown.filter((b) => b.isCorrect).length;
    const score = Math.round((correct / quiz.questions.length) * 100);
    const passed = score >= quiz.passMark;

    const attempt = await prisma.quizAttempt.create({
        data: {
            quizId,
            userId: req.user.id,
            score,
            passed,
            answers: answers as any,
        },
    });

    res.json({ attemptId: attempt.id, score, passed, passMark: quiz.passMark, breakdown });
};

// GET /api/quizzes/my-attempts
export const getMyQuizAttempts = async (req: AuthRequest, res: Response) => {
    const attempts = await prisma.quizAttempt.findMany({
        where: { userId: req.user.id },
        include: { quiz: { select: { id: true, title: true, passMark: true } } },
        orderBy: { createdAt: 'desc' },
    });
    res.json(attempts);
};
