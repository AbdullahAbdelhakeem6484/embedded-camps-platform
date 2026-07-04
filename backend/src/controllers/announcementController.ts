import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AppError } from '../middlewares/errorHandler';
import { AuthRequest } from '../middlewares/auth';

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

export const createAnnouncementSchema = z.object({
    title: z.string().min(1).max(200),
    content: z.string().min(1),
    campId: z.string().uuid().optional().nullable(),
    pinned: z.boolean().optional(),
});

export const updateAnnouncementSchema = createAnnouncementSchema.partial();

// ─── Controllers ─────────────────────────────────────────────────────────────

// GET /api/announcements — students see their relevant ones; admin sees all
// Query: ?campId=  ?limit=10
export const getAnnouncements = async (req: AuthRequest, res: Response) => {
    const { campId, limit } = req.query;
    const take = Math.min(50, parseInt(limit as string) || 20);

    if (req.user?.role === 'ADMIN') {
        // Admin sees all
        const items = await prisma.announcement.findMany({
            where: campId ? { campId: campId as string } : undefined,
            include: {
                camp: { select: { id: true, title: true } },
                createdBy: { select: { id: true, name: true } },
            },
            orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
            take,
        });
        return res.json(items);
    }

    let enrolledCampIds: string[] = [];
    if (req.user?.id) {
        const enrollments = await prisma.enrollment.findMany({
            where: { userId: req.user.id, status: 'ACTIVE' },
            select: { campId: true },
        });
        enrolledCampIds = enrollments.map(e => e.campId);
    }

    const items = await prisma.announcement.findMany({
        where: {
            OR: [
                { campId: null },                               // global
                ...(enrolledCampIds.length > 0 ? [{ campId: { in: enrolledCampIds } }] : []),
            ],
        },
        include: {
            camp: { select: { id: true, title: true } },
        },
        orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
        take,
    });

    res.json(items);
};

// POST /api/announcements — admin only
export const createAnnouncement = async (req: AuthRequest, res: Response) => {
    const { title, content, campId, pinned } = req.body;

    const item = await prisma.announcement.create({
        data: {
            title, content,
            campId: campId ?? null,
            pinned: pinned ?? false,
            createdById: req.user.id,
        },
        include: { camp: { select: { id: true, title: true } }, createdBy: { select: { id: true, name: true } } },
    });
    res.status(201).json(item);
};

// PATCH /api/announcements/:id — admin only
export const updateAnnouncement = async (req: AuthRequest, res: Response) => {
    const { title, content, campId, pinned } = req.body;

    const item = await prisma.announcement.update({
        where: { id: req.params.id },
        data: {
            title, content,
            campId: campId === null ? null : (campId ?? undefined),
            pinned,
        },
        include: { camp: { select: { id: true, title: true } }, createdBy: { select: { id: true, name: true } } },
    }).catch(() => { throw new AppError('Announcement not found', 404); });

    res.json(item);
};

// DELETE /api/announcements/:id — admin only
export const deleteAnnouncement = async (req: Request, res: Response) => {
    await prisma.announcement.delete({ where: { id: req.params.id } })
        .catch(() => { throw new AppError('Announcement not found', 404); });
    res.json({ message: 'Announcement deleted' });
};
