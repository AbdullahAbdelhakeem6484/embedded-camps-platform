import { Router } from 'express';
import { uploadVideo, getVideoUrl, deleteVideo, videoUploadMiddleware } from '../controllers/streamingController';
import { authenticate, authorize } from '../middlewares/auth';
import { streamLimiter } from '../middlewares/rateLimiter';

const router = Router();

// Get signed CDN URL for a video (enrolled students + admins)
router.get('/url/:materialId', authenticate, streamLimiter, getVideoUrl);

// Upload video to Bunny.net (admin only)
router.post('/upload', authenticate, authorize(['ADMIN']), videoUploadMiddleware, uploadVideo);

// Delete video from Bunny.net + DB (admin only)
router.delete('/video/:materialId', authenticate, authorize(['ADMIN']), deleteVideo);

export default router;
