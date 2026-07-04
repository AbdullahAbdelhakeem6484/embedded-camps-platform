import { Router } from 'express';
import multer from 'multer';
import {
    createMasterSession, getAllMasterSessions, getMasterSessionById,
    updateMasterSession, deleteMasterSession,
    createMaterial, updateMaterial, deleteMaterial,
    uploadPdf, uploadImage, uploadVideo, registerVideoUrl,
} from '../controllers/sessionController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

// All uploads use memory storage Ã¢â¬â files are streamed to Cloudinary, never written to disk
const memUpload = multer({ storage: multer.memoryStorage() });

const pdfUpload   = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50  * 1024 * 1024 }, fileFilter: (_r, f, cb) => f.mimetype === 'application/pdf'      ? cb(null, true) : cb(new Error('Only PDF files allowed'))   }).single('file');
const imageUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10  * 1024 * 1024 }, fileFilter: (_r, f, cb) => f.mimetype.startsWith('image/')        ? cb(null, true) : cb(new Error('Only image files allowed')) }).single('file');
const videoUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 200 * 1024 * 1024 }, fileFilter: (_r, f, cb) => f.mimetype.startsWith('video/')        ? cb(null, true) : cb(new Error('Only video files allowed')) }).single('file');

// Upload routes
router.post('/upload/pdf',       authenticate, authorize(['ADMIN']), pdfUpload,   uploadPdf);
router.post('/upload/image',     authenticate, authorize(['ADMIN']), imageUpload,  uploadImage);
router.post('/upload/video',     authenticate, authorize(['ADMIN']), videoUpload,  uploadVideo);
router.post('/upload/video-url', authenticate, authorize(['ADMIN']),               registerVideoUrl);

// Material routes (before /:id to avoid conflicts)
router.put('/materials/:materialId',    authenticate, authorize(['ADMIN']), updateMaterial);
router.delete('/materials/:materialId', authenticate, authorize(['ADMIN']), deleteMaterial);

// Master session CRUD
router.get('/',               authenticate, authorize(['ADMIN']), getAllMasterSessions);
router.post('/',              authenticate, authorize(['ADMIN']), createMasterSession);
router.get('/:id',            authenticate, authorize(['ADMIN']), getMasterSessionById);
router.put('/:id',            authenticate, authorize(['ADMIN']), updateMasterSession);
router.delete('/:id',         authenticate, authorize(['ADMIN']), deleteMasterSession);
router.post('/:sessionId/materials', authenticate, authorize(['ADMIN']), createMaterial);

export default router;
