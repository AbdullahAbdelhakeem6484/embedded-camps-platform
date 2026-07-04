import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

// ─── Zod validation middleware ────────────────────────────────────────────────
// Usage: router.post('/path', validate(MySchema), controller)
export const validate =
    (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') =>
    (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req[source]);

        if (!result.success) {
            const errors = result.error.errors.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
            }));
            return res.status(422).json({
                message: 'Validation failed',
                errors,
            });
        }

        // Replace req[source] with parsed (and possibly transformed) data
        req[source] = result.data;
        next();
    };
