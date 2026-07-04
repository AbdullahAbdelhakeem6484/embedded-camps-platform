import { Router } from 'express';
import {
    verifyCertificate, getMyCertificates,
    getAllCertificates, issueCertificate, revokeCertificate,
} from '../controllers/progressController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

// ─── Public ───────────────────────────────────────────────────────────────────
router.get('/verify/:id', verifyCertificate);

// ─── Student ──────────────────────────────────────────────────────────────────
router.get('/my-certificates', authenticate, getMyCertificates);

// ─── Admin ────────────────────────────────────────────────────────────────────
router.get('/', authenticate, authorize(['ADMIN']), getAllCertificates);
router.post('/issue', authenticate, authorize(['ADMIN']), issueCertificate);
router.delete('/:id', authenticate, authorize(['ADMIN']), revokeCertificate);

export default router;
