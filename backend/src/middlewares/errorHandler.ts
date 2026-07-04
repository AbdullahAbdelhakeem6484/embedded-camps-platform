import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import logger from '../lib/logger';

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

// Must be registered LAST in app.ts as a 4-argument Express middleware.
export const errorHandler = (
    err: unknown,
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    if (err instanceof AppError) {
        logger.warn(`[${err.statusCode}] ${err.message} -- ${req.method} ${req.path}`);
        return res.status(err.statusCode).json({ message: err.message });
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
            const field = (err.meta?.target as string[])?.join(', ') ?? 'field';
            return res.status(409).json({ message: `A record with this ${field} already exists.` });
        }
        if (err.code === 'P2025') {
            return res.status(404).json({ message: 'Record not found.' });
        }
    }

    logger.error('Unhandled error:', err);
    return res.status(500).json({ message: 'An unexpected error occurred. Please try again later.' });
};
