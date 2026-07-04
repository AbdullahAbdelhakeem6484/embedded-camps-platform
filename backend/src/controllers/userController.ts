import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../middlewares/errorHandler';
import { emailService } from '../lib/email';
import { AuthRequest } from '../middlewares/auth';

const PAGE_SIZE = 20;

// GET /api/users — admin, paginated with optional search
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const take = Math.min(100, parseInt(req.query.limit as string) || PAGE_SIZE);
        const skip = (page - 1) * take;
        const search = (req.query.search as string) || '';

        const where = search
            ? {
                  OR: [
                      { name: { contains: search, mode: 'insensitive' as const } },
                      { email: { contains: search, mode: 'insensitive' as const } },
                  ],
              }
            : {};

        const [users, total] = await prisma.$transaction([
            prisma.user.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                    _count: { select: { enrollments: true } },
                },
            }),
            prisma.user.count({ where }),
        ]);

        res.json({ data: users, total, page, pages: Math.ceil(total / take) });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users', error: String(error) });
    }
};

// GET /api/users/:id/enrollments
export const getUserEnrollments = async (req: AuthRequest, res: Response) => {
    // Students can only see their own enrollments
    if (req.user.role !== 'ADMIN' && req.user.id !== req.params.id) {
        throw new AppError('Access denied', 403);
    }

    const enrollments = await prisma.enrollment.findMany({
        where: { userId: req.params.id },
        include: {
            camp: { select: { id: true, title: true, status: true } },
        },
        orderBy: { enrolledAt: 'desc' },
    });

    res.json(enrollments);
};

// POST /api/users/enroll — admin manually enrolls a user (after WhatsApp payment)
export const enrollUser = async (req: AuthRequest, res: Response) => {
    const { userId, campId, expiresAt } = req.body;

    const [user, camp] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId } }),
        prisma.camp.findUnique({ where: { id: campId } }),
    ]);
    if (!user) throw new AppError('User not found', 404);
    if (!camp) throw new AppError('Camp not found', 404);

    const existing = await prisma.enrollment.findFirst({
        where: { userId, campId, status: 'ACTIVE' },
    });
    if (existing) throw new AppError('User is already enrolled in this camp', 409);

    const enrollment = await prisma.enrollment.create({
        data: {
            userId,
            campId,
            status: 'ACTIVE',
            expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        },
    });

    emailService.sendEnrollmentConfirmation(user.email, user.name ?? '', camp.title, enrollment.expiresAt ?? new Date()).catch(() => {});

    res.status(201).json(enrollment);
};

// PATCH /api/users/:id/deactivate — soft-ban a user (preserves all data)
export const deactivateUser = async (req: Request, res: Response) => {
    const user = await prisma.user.update({
        where: { id: req.params.id },
        data: { isActive: false },
        select: { id: true, name: true, email: true, isActive: true },
    }).catch(() => { throw new AppError('User not found', 404); });

    // Revoke all refresh tokens so they're immediately logged out
    await prisma.refreshToken.deleteMany({ where: { userId: req.params.id } });

    res.json({ message: 'User deactivated', user });
};

// PATCH /api/users/:id/activate — re-activate a previously deactivated user
export const activateUser = async (req: Request, res: Response) => {
    const user = await prisma.user.update({
        where: { id: req.params.id },
        data: { isActive: true, loginAttempts: 0, lockedUntil: null },
        select: { id: true, name: true, email: true, isActive: true },
    }).catch(() => { throw new AppError('User not found', 404); });

    res.json({ message: 'User activated', user });
};

// DELETE /api/users/:id — hard delete (cascade handles enrollments, progress, etc.)
export const deleteUser = async (req: Request, res: Response) => {
    await prisma.user.delete({ where: { id: req.params.id } })
        .catch(() => { throw new AppError('User not found', 404); });
    res.json({ message: 'User deleted' });
};

// DELETE /api/users/enrollments/:enrollmentId
export const deleteEnrollment = async (req: Request, res: Response) => {
    await prisma.enrollment.delete({ where: { id: req.params.enrollmentId } })
        .catch(() => { throw new AppError('Enrollment not found', 404); });
    res.json({ message: 'Enrollment removed' });
};


// PATCH /api/users/me — update own profile (name + optional password change)
export const updateMyProfile = async (req: AuthRequest, res: Response) => {
    const { name, currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) throw new AppError('User not found', 404);

    const updateData: any = {};

    if (name !== undefined) {
        if (typeof name !== 'string' || name.trim().length < 2) throw new AppError('Name must be at least 2 characters', 400);
        updateData.name = name.trim();
    }

    if (newPassword !== undefined) {
        if (!currentPassword) throw new AppError('Current password is required to set a new password', 400);
        const bcrypt = await import('bcryptjs');
        const valid = await bcrypt.compare(currentPassword, user.password);
        if (!valid) throw new AppError('Current password is incorrect', 401);
        if (newPassword.length < 8) throw new AppError('New password must be at least 8 characters', 400);
        updateData.password = await bcrypt.hash(newPassword, 12);
    }

    if (Object.keys(updateData).length === 0) throw new AppError('Nothing to update', 400);

    const updated = await prisma.user.update({
        where: { id: req.user.id },
        data: updateData,
        select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    res.json(updated);
};

// GET /api/users/me/enrollments — own enrollments with camp info
export const getMyEnrollments = async (req: AuthRequest, res: Response) => {
    const enrollments = await prisma.enrollment.findMany({
        where: { userId: req.user.id },
        include: {
            camp: {
                select: { id: true, title: true, slug: true, thumbnail: true, level: true, brand: { select: { name: true, icon: true } } },
            },
        },
        orderBy: { enrolledAt: 'desc' },
    });
    res.json(enrollments);
};

// GET /api/users/enrollments — all enrollments (admin)
export const getAllEnrollments = async (req: Request, res: Response) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const take = 30;
    const skip = (page - 1) * take;
    const campId = req.query.campId as string | undefined;
    const status = req.query.status as string | undefined;

    const where: any = {};
    if (campId) where.campId = campId;
    if (status) where.status = status;

    const [enrollments, total] = await prisma.$transaction([
        prisma.enrollment.findMany({
            where, skip, take,
            orderBy: { enrolledAt: 'desc' },
            include: {
                user: { select: { id: true, name: true, email: true } },
                camp: { select: { id: true, title: true, slug: true } },
            },
        }),
        prisma.enrollment.count({ where }),
    ]);

    res.json({ data: enrollments, total, page, pages: Math.ceil(total / take) });
};

// PATCH /api/users/enrollments/:id — update enrollment status/expiry (admin)
export const updateEnrollment = async (req: Request, res: Response) => {
    const { status, expiresAt } = req.body;

    const enrollment = await prisma.enrollment.update({
        where: { id: req.params.id },
        data: {
            ...(status && { status }),
            ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
        },
        include: {
            user: { select: { id: true, name: true, email: true } },
            camp: { select: { id: true, title: true, slug: true } },
        },
    }).catch(() => { throw new AppError('Enrollment not found', 404); });

    res.json(enrollment);
};
