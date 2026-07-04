import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../middlewares/errorHandler';
import { EnrollmentService } from '../services/enrollment.service';
import { AuthRequest } from '../middlewares/auth';

// POST /api/labs — admin creates a lab for a master session
export const createLab = async (req: Request, res: Response) => {
    const { title, description, instructionsUrl, solutionContent, solutionUrl, masterSessionId, dueDate } = req.body;
    const lab = await prisma.lab.create({
        data: {
            title,
            description,
            instructionsUrl,
            solutionContent,
            solutionUrl,
            masterSessionId,
            dueDate: dueDate ? new Date(dueDate) : undefined,
        },
    });
    res.status(201).json(lab);
};

// DELETE /api/labs/:id
export const deleteLab = async (req: Request, res: Response) => {
    await prisma.lab.delete({ where: { id: req.params.id } })
        .catch(() => { throw new AppError('Lab not found', 404); });
    res.json({ message: 'Lab deleted' });
};

// POST /api/labs/submit — student submits a lab
export const submitLab = async (req: AuthRequest, res: Response) => {
    const { labId, content, fileUrl } = req.body;

    const lab = await prisma.lab.findUnique({ where: { id: labId } });
    if (!lab) throw new AppError('Lab not found', 404);

    // Verify enrollment via the camp session that owns this master session
    await EnrollmentService.findActiveForSession(req.user.id, lab.masterSessionId);

    const existing = await prisma.labSubmission.findFirst({
        where: { labId, userId: req.user.id },
    });
    if (existing) throw new AppError('You have already submitted this lab', 409);

    const submission = await prisma.labSubmission.create({
        data: { labId, userId: req.user.id, content, fileUrl },
    });
    res.status(201).json(submission);
};

// GET /api/labs/:labId/submissions — admin views all submissions for a lab
export const getSubmissionsByLab = async (req: Request, res: Response) => {
    const submissions = await prisma.labSubmission.findMany({
        where: { labId: req.params.labId },
        include: {
            user: { select: { id: true, name: true, email: true } },
            feedback: true,
        },
        orderBy: { submittedAt: 'desc' },
    });
    res.json(submissions);
};

// GET /api/labs/my-submissions — student views their own submissions
export const getMySubmissions = async (req: AuthRequest, res: Response) => {
    const submissions = await prisma.labSubmission.findMany({
        where: { userId: req.user.id },
        include: { lab: true, feedback: true },
        orderBy: { submittedAt: 'desc' },
    });
    res.json(submissions);
};

// POST /api/labs/feedback — admin provides feedback on a submission
export const createFeedback = async (req: AuthRequest, res: Response) => {
    const { submissionId, content, grade } = req.body;

    const submission = await prisma.labSubmission.findUnique({ where: { id: submissionId } });
    if (!submission) throw new AppError('Submission not found', 404);

    const existing = await prisma.feedback.findFirst({ where: { submissionId } });
    if (existing) throw new AppError('Feedback already exists for this submission', 409);

    const feedback = await prisma.feedback.create({
        data: {
            submissionId,
            content,
            grade: grade !== undefined ? parseFloat(grade) : null,
            instructorId: req.user.id,
        },
    });


    res.status(201).json(feedback);
};

// GET /api/labs/all-submissions — admin views ALL submissions across all labs
export const getAllSubmissions = async (req: Request, res: Response) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const take = Math.min(100, parseInt(req.query.limit as string) || 20);
    const skip = (page - 1) * take;

    const [submissions, total] = await prisma.$transaction([
        prisma.labSubmission.findMany({
            skip,
            take,
            orderBy: { submittedAt: 'desc' },
            include: {
                user: { select: { id: true, name: true, email: true } },
                lab: { select: { id: true, title: true, masterSessionId: true } },
                feedback: true,
            },
        }),
        prisma.labSubmission.count(),
    ]);

    res.json({ data: submissions, total, page, pages: Math.ceil(total / take) });
};
