import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { emailService } from '../lib/email';
import logger from '../lib/logger';
import { AppError } from '../middlewares/errorHandler';
import {
    JWT_SECRET,
    JWT_REFRESH_SECRET,
    JWT_ACCESS_EXPIRES,
    JWT_REFRESH_EXPIRES,
    NODE_ENV,
    APP_URL,
} from '../config';
import { AuthRequest } from '../middlewares/auth';

const DUMMY_HASH = '$2a$12$dummyhashfordummypurposestopreventtimingattacks000000000';

const COOKIE_OPTS = {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: (NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
    path: '/api/auth',
};

function signAccess(payload: object) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_ACCESS_EXPIRES as any });
}
function signRefresh(payload: object) {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES as any });
}

// POST /api/auth/register
export const register = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError('Email already registered', 409);
    const hash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
        data: { name, email, password: hash, role: 'STUDENT' as any },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    emailService.sendWelcome(user.email, user.name ?? '').catch(() => {});
    logger.info(`New registration: ${user.email}`);
    res.status(201).json({ message: 'Registration successful.', user });
};

// POST /api/auth/admin/create-user
export const registerUser = async (req: AuthRequest, res: Response) => {
    const { name, email, password, role } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError('Email already registered', 409);
    const hash = await bcrypt.hash(password || crypto.randomBytes(12).toString('hex'), 12);
    const user = await prisma.user.create({
        data: { name, email, password: hash, role: (role || 'STUDENT') as any },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    emailService.sendWelcome(user.email, user.name ?? '').catch(() => {});
    res.status(201).json(user);
};

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

// POST /api/auth/login
export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (user && user.lockedUntil && user.lockedUntil > new Date()) {
        const remaining = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
        throw new AppError(`Account is locked. Try again in ${remaining} minute(s).`, 429);
    }

    const hash = user?.password || DUMMY_HASH;
    const valid = await bcrypt.compare(password, hash);

    if (!user || !valid) {
        if (user) {
            const attempts = user.loginAttempts + 1;
            const shouldLock = attempts >= MAX_LOGIN_ATTEMPTS;
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    loginAttempts: attempts,
                    lockedUntil: shouldLock ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000) : user.lockedUntil,
                },
            });
            if (shouldLock) throw new AppError(`Too many failed attempts. Account locked for ${LOCKOUT_MINUTES} minutes.`, 429);
        }
        throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) throw new AppError('Account has been deactivated. Contact support.', 403);

    if (user.loginAttempts > 0 || user.lockedUntil) {
        await prisma.user.update({ where: { id: user.id }, data: { loginAttempts: 0, lockedUntil: null } });
    }

    const payload = { id: user.id, email: user.email, name: user.name, role: user.role };
    const accessToken = signAccess(payload);
    const refreshToken = signRefresh({ id: user.id });
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } });

    res.cookie('refreshToken', refreshToken, COOKIE_OPTS);
    res.json({ accessToken, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
};

// POST /api/auth/refresh
export const refreshToken = async (req: Request, res: Response) => {
    const token = req.cookies?.refreshToken;
    if (!token) throw new AppError('No refresh token', 401);
    let payload: any;
    try { payload = jwt.verify(token, JWT_REFRESH_SECRET); }
    catch { throw new AppError('Invalid or expired refresh token', 401); }

    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expiresAt < new Date()) {
        res.clearCookie('refreshToken', COOKIE_OPTS);
        throw new AppError('Refresh token revoked or expired', 401);
    }
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user || !user.isActive) throw new AppError('User not found or deactivated', 401);

    const newRefresh = signRefresh({ id: user.id });
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await prisma.$transaction([
        prisma.refreshToken.delete({ where: { token } }),
        prisma.refreshToken.create({ data: { token: newRefresh, userId: user.id, expiresAt } }),
    ]);
    const accessToken = signAccess({ id: user.id, email: user.email, name: user.name, role: user.role });
    res.cookie('refreshToken', newRefresh, COOKIE_OPTS);
    res.json({ accessToken });
};

// POST /api/auth/logout
export const logout = async (req: Request, res: Response) => {
    const token = req.cookies?.refreshToken;
    if (token) await prisma.refreshToken.deleteMany({ where: { token } }).catch(() => {});
    res.clearCookie('refreshToken', COOKIE_OPTS);
    res.json({ message: 'Logged out' });
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    const SAFE = { message: 'If an account with that email exists, a reset link has been sent.' };
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.json(SAFE);

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.passwordReset.deleteMany({ where: { userId: user.id } });
    await prisma.passwordReset.create({ data: { token: hashedToken, userId: user.id, expiresAt } });

    const resetUrl = `${APP_URL}/reset-password/${rawToken}`;
    emailService.sendPasswordReset(user.email, user.name ?? '', resetUrl).catch(() => {});

    logger.info(`Password reset requested: ${email}`);
    return res.json(SAFE);
};

// POST /api/auth/reset-password
export const resetPassword = async (req: Request, res: Response) => {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const record = await prisma.passwordReset.findUnique({ where: { token: hashedToken } });
    if (!record || record.used || record.expiresAt < new Date()) {
        throw new AppError('Invalid or expired reset token', 400);
    }

    const hash = await bcrypt.hash(password, 12);
    await prisma.$transaction([
        prisma.user.update({ where: { id: record.userId }, data: { password: hash } }),
        prisma.passwordReset.update({ where: { token: hashedToken }, data: { used: true } }),
        prisma.refreshToken.deleteMany({ where: { userId: record.userId } }),
    ]);

    res.json({ message: 'Password reset successful. Please log in.' });
};

// GET /api/auth/me
export const getMe = async (req: AuthRequest, res: Response) => {
    const user = await prisma.user.findUnique({
        where: { id: (req as any).user.id },
        select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    });
    if (!user) throw new AppError('User not found', 404);
    res.json(user);
};
