import { Router } from 'express';
import {
    createCamp, getAllCamps, getCampById, updateCamp, deleteCamp,
    linkSessionToCamp, updateCampSessionVisibility, unlinkSessionFromCamp,
    getPublicCamps, getCampBySlugPublic,
    createCampSchema, updateCampSchema,
} from '../controllers/campController';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { z } from 'zod';

const router = Router();

const linkSchema = z.object({
    sessionId: z.string().uuid(),
    order: z.number().int().nonnegative(),
    isVisible: z.boolean().optional(),
});

// ─── Public routes (no auth) ──────────────────────────────────────────────────
router.get('/public', getPublicCamps);
router.get('/slug/:slug', getCampBySlugPublic);

// ─── Authenticated routes ─────────────────────────────────────────────────────
router.get('/', authenticate, getAllCamps);
router.get('/:id', authenticate, getCampById);
router.post('/', authenticate, authorize(['ADMIN']), validate(createCampSchema), createCamp);
router.patch('/:id', authenticate, authorize(['ADMIN']), validate(updateCampSchema), updateCamp);
router.put('/:id', authenticate, authorize(['ADMIN']), validate(updateCampSchema), updateCamp);
router.delete('/:id', authenticate, authorize(['ADMIN']), deleteCamp);

router.post('/:campId/sessions', authenticate, authorize(['ADMIN']), validate(linkSchema), linkSessionToCamp);
router.patch('/camp-sessions/:campSessionId/visibility', authenticate, authorize(['ADMIN']), updateCampSessionVisibility);
router.delete('/camp-sessions/:campSessionId', authenticate, authorize(['ADMIN']), unlinkSessionFromCamp);

export default router;
