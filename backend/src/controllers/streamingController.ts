import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { prisma } from '../lib/prisma';
import { BunnyStorage, signedCdnUrl, cdnPathFromUrl } from '../lib/bunny';
import { AppError } from '../middlewares/errorHandler';
import { EnrollmentService } from '../services/enrollment.service';
import logger from '../lib/logger';
import { AuthRequest } from '../middlewares/auth';

// ─── Multer (memory storage — buffer goes straight to Bunny) ─────────────────

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 * 1024 }, // 5 GB
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only video files are allowed'));
        }
    },
});

export const videoUploadMiddleware = upload.single('video');

// ─── Controllers ──────────────────────────────────────────────────────────────

// POST /api/streaming/upload — admin uploads a video to Bunny.net
export const uploadVideo = async (req: AuthRequest, res: Response) => {
    if (!req.file) throw new AppError('No video file provided', 400);
    const { sessionId, title, order, duration } = req.body;

    if (!sessionId) throw new AppError('sessionId is required', 400);

    // Sanitize filename
    const ext = path.extname(req.file.originalname).toLowerCase() || '.mp4';
    const safe = req.file.originalname
        .replace(/[^a-zA-Z0-9._-]/g, '-')
        .replace(/-+/g, '-')
        .toLowerCase();
    const remotePath = `videos/${sessionId}/${Date.now()}-${safe}`;

    const cdnUrl = await BunnyStorage.upload(remotePath, req.file.buffer, req.file.mimetype);

    const material = await prisma.material.create({
        data: {
            title: title || safe.replace(ext, ''),
            type: 'VIDEO',
            url: cdnUrl,
            order: parseInt(order) || 0,
            duration: duration ? parseInt(duration) : undefined,
            masterSessionId: sessionId,
        },
    });

    logger.info(`[Stream] Video uploaded: material=${material.id} cdn=${cdnUrl}`);
    res.status(201).json(material);
};

// GET /api/streaming/url/:materialId — returns a 2-hour signed CDN URL
export const getVideoUrl = async (req: AuthRequest, res: Response) => {
    const material = await prisma.material.findUnique({
        where: { id: req.params.materialId },
    });
    if (!material) throw new AppError('Material not found', 404);
    if (material.type !== 'VIDEO') throw new AppError('Material is not a video', 400);

    // Verify enrollment (admins bypass)
    if (req.user.role !== 'ADMIN') {
        await EnrollmentService.findActiveForSession(req.user.id, material.masterSessionId);
    }

    if (!material.url) throw new AppError('Material has no video URL', 400);
    const cdnPath = cdnPathFromUrl(material.url);
    const signedUrl = signedCdnUrl(cdnPath, 7200);

    res.json({ url: signedUrl, expiresIn: 7200 });
};

// DELETE /api/streaming/video/:materialId — admin deletes video from Bunny + DB
export const deleteVideo = async (req: Request, res: Response) => {
    const material = await prisma.material.findUnique({ where: { id: req.params.materialId } });
    if (!material) throw new AppError('Material not found', 404);

    // Delete from Bunny storage
    try {
        const cdnPath = cdnPathFromUrl(material.url || '').replace(/^\//, '');
        await BunnyStorage.delete(cdnPath);
    } catch (err) {
        logger.warn(`[Stream] Bunny delete failed for material ${material.id}: ${err}`);
    }

    // Cascade in DB deletes MaterialProgress records too
    await prisma.material.delete({ where: { id: material.id } });
    res.json({ message: 'Video deleted' });
};
