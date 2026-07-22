import { Router } from 'express';
import {
    verifyCertificate, getMyCertificates,
    getAllCertificates, issueCertificate, revokeCertificate,
    downloadCertificate, regenerateCertificate, updateCertificateStatus
} from '../controllers/progressController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

// ─── Public ───────────────────────────────────────────────────────────────────
router.get('/verify/:certificateId', verifyCertificate);
router.get('/download/:certificateId', downloadCertificate);

// ─── Student ──────────────────────────────────────────────────────────────────
router.get('/my-certificates', authenticate, getMyCertificates);

// ─── Admin ────────────────────────────────────────────────────────────────────
router.get('/', authenticate, authorize(['ADMIN']), getAllCertificates);
router.post('/issue', authenticate, authorize(['ADMIN']), issueCertificate);
router.post('/regenerate/:id', authenticate, authorize(['ADMIN']), regenerateCertificate);
router.put('/status', authenticate, authorize(['ADMIN']), updateCertificateStatus);
router.delete('/:id', authenticate, authorize(['ADMIN']), revokeCertificate);

export default router;
