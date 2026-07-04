import { Router } from 'express';
import { z } from 'zod';
import {
    register,
    registerUser,
    login,
    refreshToken,
    logout,
    forgotPassword,
    resetPassword,
    getMe,
} from '../controllers/authController';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { authLimiter } from '../middlewares/rateLimiter';

const router = Router();

// ─── Schemas ──────────────────────────────────────────────────────────────────

const registerSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(8).max(100),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

const forgotSchema = z.object({
    email: z.string().email(),
});

const resetSchema = z.object({
    token: z.string().min(1),
    password: z.string().min(8).max(100),
});

const adminCreateSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(8).max(100).optional(),
    role: z.enum(['STUDENT', 'ADMIN']).optional(),
});

// ─── Public routes ────────────────────────────────────────────────────────────

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.post('/forgot-password', authLimiter, validate(forgotSchema), forgotPassword);
router.post('/reset-password', authLimiter, validate(resetSchema), resetPassword);

// ─── Protected routes ─────────────────────────────────────────────────────────

router.get('/me', authenticate, getMe);
router.post('/admin/create-user', authenticate, authorize(['ADMIN']), validate(adminCreateSchema), registerUser);

export default router;
