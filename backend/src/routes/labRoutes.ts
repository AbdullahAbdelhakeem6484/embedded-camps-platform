import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { createLab, deleteLab, submitLab, getSubmissionsByLab, getMySubmissions, createFeedback, getAllSubmissions } from '../controllers/labController';
import { authenticate, authorize } from '../middlewares/auth';
import { uploadToCloudinary } from '../lib/cloudinary';

const router = Router();

// Memory storage â files go to Cloudinary, never hit disk
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
    fileFilter: (_req, file, cb) => {
        const allowed = [
            '.c', '.cpp', '.h', '.py', '.sh', '.mk', '.bp', '.java', '.kt',
            '.txt', '.md', '.pdf', '.zip', '.tar', '.gz', '.log', '.patch',
        ];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) cb(null, true);
        else cb(new Error(`File type ${ext} not allowed`));
    },
});

// POST /api/labs/upload â upload lab file to Cloudinary, return URL
router.post('/upload', authenticate, upload.single('file'), async (req: any, res: any) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    try {
        const result = await uploadToCloudinary(req.file.buffer, 'embeddedcamps/labs', 'raw', req.file.originalname);
        res.json({ url: result.url, originalName: req.file.originalname, size: result.bytes });
    } catch (err) {
        res.status(500).json({ error: 'Upload failed', detail: String(err) });
    }
});

// âââ Admin âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
router.post('/', authenticate, authorize(['ADMIN']), createLab);
router.delete('/:id', authenticate, authorize(['ADMIN']), deleteLab);
router.get('/all-submissions', authenticate, authorize(['ADMIN']), getAllSubmissions);
router.get('/:labId/submissions', authenticate, authorize(['ADMIN']), getSubmissionsByLab);
router.post('/feedback', authenticate, authorize(['ADMIN']), createFeedback);

// âââ Student ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
router.post('/submit', authenticate, submitLab);
router.get('/my-submissions', authenticate, getMySubmissions);

export default router;
