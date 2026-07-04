import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../middlewares/errorHandler';
import { AuthRequest } from '../middlewares/auth';

// POST /api/bookmarks/toggle — add if not exists, remove if exists
export const toggleBookmark = async (req: AuthRequest, res: Response) => {
    const { materialId } = req.body;
    if (!materialId) throw new AppError('materialId required', 400);

    const material = await prisma.material.findUnique({ where: { id: materialId } });
    if (!material) throw new AppError('Material not found', 404);

    const existing = await prisma.bookmark.findUnique({
        where: { userId_materialId: { userId: req.user.id, materialId } },
    });

    if (existing) {
        await prisma.bookmark.delete({ where: { id: existing.id } });
        return res.json({ bookmarked: false });
    }

    await prisma.bookmark.create({ data: { userId: req.user.id, materialId } });
    return res.json({ bookmarked: true });
};

// GET /api/bookmarks — get current user's bookmarks
export const getMyBookmarks = async (req: AuthRequest, res: Response) => {
    const bookmarks = await prisma.bookmark.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            material: {
                select: {
                    id: true,
                    title: true,
                    type: true,
                    url: true,
                    duration: true,
                    masterSession: {
                        select: {
                            id: true,
                            title: true,
                            category: true,
                            campSessions: {
                                select: {
                                    camp: { select: { id: true, title: true } },
                                },
                                take: 1,
                            },
                        },
                    },
                },
            },
        },
    });

    res.json(bookmarks);
};

// GET /api/bookmarks/ids — just the materialIds the user has bookmarked (lightweight)
export const getMyBookmarkIds = async (req: AuthRequest, res: Response) => {
    const bookmarks = await prisma.bookmark.findMany({
        where: { userId: req.user.id },
        select: { materialId: true },
    });
    res.json(bookmarks.map((b) => b.materialId));
};
