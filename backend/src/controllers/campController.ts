import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AppError } from '../middlewares/errorHandler';
import { EnrollmentService } from '../services/enrollment.service';
import { AuthRequest } from '../middlewares/auth';

const PAGE_SIZE = 20;

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

export const createCampSchema = z.object({
    title: z.string().min(1).max(200),
    slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens').optional(),
    description: z.string().optional(),
    thumbnail: z.string().url().optional().or(z.literal('')),
    price: z.number().min(0).optional(),
    status: z.enum(['UPCOMING', 'ACTIVE', 'COMPLETED']).optional(),
    level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
    language: z.string().max(50).optional(),
    whatYouLearn: z.array(z.string()).optional(),
    prerequisites: z.array(z.string()).optional(),
    brandId: z.string().uuid().optional().nullable(),
    // Accept ISO datetime ("2026-08-01T00:00:00.000Z") or plain date ("2026-08-01")
    startDate: z.string().optional().nullable(),
    endDate: z.string().optional().nullable(),
});

export const updateCampSchema = createCampSchema.partial();

// ─── Controllers ─────────────────────────────────────────────────────────────

// GET /api/camps
export const getAllCamps = async (req: AuthRequest, res: Response) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const take = Math.min(100, parseInt(req.query.limit as string) || PAGE_SIZE);
    const skip = (page - 1) * take;
    const brandId = req.query.brandId as string | undefined;
    const status = req.query.status as string | undefined;

    const where: any = {};
    if (brandId) where.brandId = brandId;
    if (status) where.status = status;

    const [camps, total] = await prisma.$transaction([
        prisma.camp.findMany({
            where,
            skip,
            take,
            orderBy: { createdAt: 'desc' },
            include: {
                brand: { select: { id: true, name: true, slug: true, icon: true } },
                campSessions: {
                    where: { isVisible: true },
                    include: { masterSession: true },
                    orderBy: { order: 'asc' },
                },
            },
        }),
        prisma.camp.count({ where }),
    ]);

    res.json({ data: camps, total, page, pages: Math.ceil(total / take) });
};

// GET /api/camps/:id
export const getCampById = async (req: AuthRequest, res: Response) => {
    const camp = await prisma.camp.findUnique({
        where: { id: req.params.id },
        include: {
            brand: { select: { id: true, name: true, slug: true, icon: true, color: true } },
            campSessions: {
                where: req.user.role === 'ADMIN' ? {} : { isVisible: true },
                include: {
                    masterSession: {
                        include: { materials: { orderBy: { order: 'asc' } }, labs: true },
                    },
                },
                orderBy: { order: 'asc' },
            },
        },
    });
    if (!camp) throw new AppError('Camp not found', 404);

    // For students: verify enrollment
    if (req.user.role !== 'ADMIN') {
        await EnrollmentService.checkCampAccess(req.user.id, camp.id);
    }

    res.json(camp);
};

// POST /api/camps
export const createCamp = async (req: Request, res: Response) => {
    const {
        title, slug, description, status, thumbnail, price,
        level, language, whatYouLearn, prerequisites, brandId,
        startDate, endDate,
    } = req.body;

    // Auto-generate slug if not provided
    const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check slug uniqueness
    const existing = await prisma.camp.findUnique({ where: { slug: finalSlug } });
    if (existing) throw new AppError('A camp with this slug already exists', 409);

    const camp = await prisma.camp.create({
        data: {
            title,
            slug: finalSlug,
            description,
            status: status || 'UPCOMING',
            thumbnail,
            price: price !== undefined ? price : 0,
            level: level || 'BEGINNER',
            language: language || 'Arabic',
            whatYouLearn: whatYouLearn || [],
            prerequisites: prerequisites || [],
            brandId: brandId || null,
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null,
        },
        include: {
            brand: { select: { id: true, name: true, slug: true, icon: true } },
            campSessions: true,
        },
    });

    res.status(201).json(camp);
};

// PATCH /api/camps/:id
export const updateCamp = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        title, slug, description, status, thumbnail, price,
        level, language, whatYouLearn, prerequisites, brandId,
        startDate, endDate,
    } = req.body;

    // Check slug uniqueness if slug is being updated
    if (slug) {
        const conflict = await prisma.camp.findFirst({ where: { slug, id: { not: id } } });
        if (conflict) throw new AppError('A camp with this slug already exists', 409);
    }

    const camp = await prisma.camp.update({
        where: { id },
        data: {
            ...(title !== undefined && { title }),
            ...(slug !== undefined && { slug }),
            ...(description !== undefined && { description }),
            ...(status !== undefined && { status }),
            ...(thumbnail !== undefined && { thumbnail }),
            ...(price !== undefined && { price }),
            ...(level !== undefined && { level }),
            ...(language !== undefined && { language }),
            ...(whatYouLearn !== undefined && { whatYouLearn }),
            ...(prerequisites !== undefined && { prerequisites }),
            ...(brandId !== undefined && { brandId: brandId || null }),
            ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
            ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        },
        include: {
            brand: { select: { id: true, name: true, slug: true, icon: true } },
            campSessions: {
                include: { masterSession: true },
                orderBy: { order: 'asc' },
            },
        },
    }).catch(() => { throw new AppError('Camp not found', 404); });

    res.json(camp);
};

// DELETE /api/camps/:id
export const deleteCamp = async (req: Request, res: Response) => {
    await prisma.camp.delete({ where: { id: req.params.id } })
        .catch(() => { throw new AppError('Camp not found', 404); });
    res.json({ message: 'Camp deleted' });
};

// POST /api/camps/:campId/sessions — link a master session to a camp
export const linkSessionToCamp = async (req: Request, res: Response) => {
    const { campId } = req.params;
    const { sessionId, order, isVisible } = req.body;

    const camp = await prisma.camp.findUnique({ where: { id: campId } });
    if (!camp) throw new AppError('Camp not found', 404);

    const session = await prisma.masterSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new AppError('Session not found', 404);

    const existing = await prisma.campSession.findFirst({
        where: { campId, masterSessionId: sessionId },
    });
    if (existing) throw new AppError('Session already linked to this camp', 409);

    const campSession = await prisma.campSession.create({
        data: {
            campId,
            masterSessionId: sessionId,
            order: order ?? 0,
            isVisible: isVisible !== undefined ? isVisible : true,
        },
        include: { masterSession: true },
    });

    res.status(201).json(campSession);
};

// PATCH /api/camps/camp-sessions/:campSessionId/visibility
export const updateCampSessionVisibility = async (req: Request, res: Response) => {
    const { campSessionId } = req.params;
    const { isVisible } = req.body;

    if (typeof isVisible !== 'boolean') throw new AppError('isVisible must be a boolean', 400);

    const campSession = await prisma.campSession.update({
        where: { id: campSessionId },
        data: { isVisible },
        include: { masterSession: true },
    }).catch(() => { throw new AppError('Camp session not found', 404); });

    res.json(campSession);
};

// DELETE /api/camps/camp-sessions/:campSessionId — unlink (not delete master session)
export const unlinkSessionFromCamp = async (req: Request, res: Response) => {
    await prisma.campSession.delete({ where: { id: req.params.campSessionId } })
        .catch(() => { throw new AppError('Camp session not found', 404); });
    res.json({ message: 'Session unlinked from camp' });
};

// ─── Public (unauthenticated) endpoints ──────────────────────────────────────

// GET /api/camps/public — active camps for landing page
export const getPublicCamps = async (req: Request, res: Response) => {
    const camps = await prisma.camp.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'asc' },
        select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            thumbnail: true,
            price: true,
            level: true,
            language: true,
            status: true,
            startDate: true,
            endDate: true,
            brand: { select: { id: true, name: true, slug: true, icon: true, color: true } },
            campSessions: {
                where: { isVisible: true },
                select: { id: true },
            },
        },
    });

    res.json(camps);
};

// GET /api/camps/slug/:slug — public camp detail by slug
export const getCampBySlugPublic = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const camp = await prisma.camp.findUnique({
            where: { slug: req.params.slug },
            include: {
                brand: { select: { id: true, name: true, slug: true, icon: true, color: true } },
                campSessions: {
                    where: { isVisible: true },
                    include: {
                        masterSession: {
                            include: {
                                materials: { orderBy: { order: 'asc' }, select: { id: true, title: true, type: true, duration: true } },
                                labs: { select: { id: true, title: true } },
                            },
                        },
                    },
                    orderBy: { order: 'asc' },
                },
            },
        });
        if (!camp) {
            return next ? next(Object.assign(new Error('Camp not found'), { statusCode: 404 })) : res.status(404).json({ message: 'Camp not found' });
        }
        res.json(camp);
    } catch (err) {
        next ? next(err) : res.status(500).json({ message: 'Server error' });
    }
};
