import { Router } from 'express';
import {
    getAllUsers, enrollUser, getUserEnrollments, deleteUser, deleteEnrollment,
    deactivateUser, activateUser, updateMyProfile, getMyEnrollments,
    getAllEnrollments, updateEnrollment,
} from '../controllers/userController';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { z } from 'zod';

const router = Router();

const enrollSchema = z.object({
    userId: z.string().uuid(),
    campId: z.string().uuid(),
    expiresAt: z.string().datetime().optional(),
});

// ─── Self-service ─────────────────────────────────────────────────────────────
router.patch('/me', authenticate, updateMyProfile);
router.get('/me/enrollments', authenticate, getMyEnrollments);

// ─── Admin — enrollments ──────────────────────────────────────────────────────
router.get('/enrollments', authenticate, authorize(['ADMIN']), getAllEnrollments);
router.patch('/enrollments/:id', authenticate, authorize(['ADMIN']), updateEnrollment);
router.delete('/enrollments/:enrollmentId', authenticate, authorize(['ADMIN']), deleteEnrollment);
router.post('/enroll', authenticate, authorize(['ADMIN']), validate(enrollSchema), enrollUser);

// ─── Admin — users ────────────────────────────────────────────────────────────
router.get('/', authenticate, authorize(['ADMIN']), getAllUsers);
router.get('/:id/enrollments', authenticate, getUserEnrollments);
router.patch('/:id/deactivate', authenticate, authorize(['ADMIN']), deactivateUser);
router.patch('/:id/activate', authenticate, authorize(['ADMIN']), activateUser);
router.delete('/:id', authenticate, authorize(['ADMIN']), deleteUser);

export default router;
