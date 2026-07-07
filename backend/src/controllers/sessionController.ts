import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../middlewares/errorHandler';
import { uploadToCloudinary } from '../lib/cloudinary';

const PAGE_SIZE = 20;

// GET /api/sessions
export const getAllMasterSessions = async (req: Request, res: Response) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const take = Math.min(100, parseInt(req.query.limit as string) || PAGE_SIZE);
    const skip = (page - 1) * take;
    const [sessions, total] = await prisma.$transaction([
        prisma.masterSession.findMany({
            skip, take,
            orderBy: { createdAt: 'desc' },
            include: { _count: { select: { materials: true, labs: true, quizzes: true } } },
        }),
        prisma.masterSession.count(),
    ]);
    res.json({ data: sessions, total, page, pages: Math.ceil(total / take) });
};

// GET /api/sessions/:id
export const getMasterSessionById = async (req: Request, res: Response) => {
    const session = await prisma.masterSession.findUnique({
        where: { id: req.params.id },
        include: {
            materials: { orderBy: { order: 'asc' } },
            labs: true,
            quizzes: { include: { questions: { orderBy: { order: 'asc' } } } },
        },
    });
    if (!session) throw new AppError('Session not found', 404);
    res.json(session);
};

// POST /api/sessions
export const createMasterSession = async (req: Request, res: Response) => {
    const { title, description, category } = req.body;
    const session = await prisma.masterSession.create({ data: { title, description, category } });
    res.status(201).json(session);
};

// PUT /api/sessions/:id
export const updateMasterSession = async (req: Request, res: Response) => {
    const { title, description, category } = req.body;
    const session = await prisma.masterSession.update({
        where: { id: req.params.id },
        data: {
            ...(title !== undefined && { title }),
            ...(description !== undefined && { description }),
            ...(category !== undefined && { category }),
        },
    }).catch(() => { throw new AppError('Session not found', 404); });
    res.json(session);
};

// DELETE /api/sessions/:id
export const deleteMasterSession = async (req: Request, res: Response) => {
    await prisma.masterSession.delete({ where: { id: req.params.id } })
        .catch(() => { throw new AppError('Session not found', 404); });
    res.json({ message: 'Session deleted' });
};

// POST /api/sessions/:sessionId/materials
export const createMaterial = async (req: Request, res: Response) => {
    const { title, type, url, order, duration, content } = req.body;
    const material = await (prisma.material.create as any)({
        data: {
            title,
            type,
            url: url || null,
            content: content || null,
            order: order ?? 0,
            duration: duration || null,
            masterSessionId: req.params.sessionId,
        },
    });
    res.status(201).json(material);
};

// PUT /api/sessions/materials/:materialId
export const updateMaterial = async (req: Request, res: Response) => {
    const { title, type, url, order, duration, content } = req.body;
    const material = await (prisma.material.update as any)({
        where: { id: req.params.materialId },
        data: {
            ...(title !== undefined && { title }),
            ...(type !== undefined && { type }),
            ...(url !== undefined && { url }),
            ...(content !== undefined && { content }),
            ...(order !== undefined && { order }),
            ...(duration !== undefined && { duration }),
        },
    }).catch(() => { throw new AppError('Material not found', 404); });
    res.json(material);
};

// DELETE /api/sessions/materials/:materialId
export const deleteMaterial = async (req: Request, res: Response) => {
    await prisma.material.delete({ where: { id: req.params.materialId } })
        .catch(() => { throw new AppError('Material not found', 404); });
    res.json({ message: 'Material deleted' });
};

// POST /api/sessions/upload/pdf  -> Cloudinary (raw)
export const uploadPdf = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) return next(new AppError('No file uploaded', 400));
        const result = await uploadToCloudinary(req.file.buffer, 'embeddedcamps/pdfs', 'raw', req.file.originalname);
        res.json({ url: result.url, originalName: req.file.originalname, size: result.bytes });
    } catch (err) {
        next(err);
    }
};

// POST /api/sessions/upload/image  -> Cloudinary (image)
export const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) return next(new AppError('No file uploaded', 400));
        const result = await uploadToCloudinary(req.file.buffer, 'embeddedcamps/images', 'image', req.file.originalname);
        res.json({ url: result.url, originalName: req.file.originalname, size: result.bytes });
    } catch (err) {
        next(err);
    }
};

// POST /api/sessions/upload/video -> Cloudinary (video)
export const uploadVideo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) return next(new AppError('No file uploaded', 400));
        const result = await uploadToCloudinary(req.file.buffer, 'embeddedcamps/videos', 'video', req.file.originalname);
        res.json({ url: result.url, originalName: req.file.originalname, size: result.bytes });
    } catch (err) {
        next(err);
    }
};

// POST /api/sessions/upload/video-url
export const registerVideoUrl = (req: Request, res: Response, next: NextFunction) => {
    const { url, title } = req.body;
    if (!url) return next(new AppError('URL is required', 400));
    res.json({ url, title: title || 'Video' });
};
