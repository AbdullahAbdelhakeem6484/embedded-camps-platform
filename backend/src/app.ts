import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { NODE_ENV, ALLOWED_ORIGINS } from './config';
import { apiLimiter } from './middlewares/rateLimiter';
import { errorHandler } from './middlewares/errorHandler';
import logger from './lib/logger';
import routes from './routes';

const app = express();

app.use(
    helmet({
        crossOriginEmbedderPolicy: false,
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", 'data:', 'https:'],
                mediaSrc: ["'self'", 'https://*.b-cdn.net'],
                connectSrc: ["'self'", ...ALLOWED_ORIGINS],
            },
        },
    })
);

app.use(
    cors({
        origin: (origin, callback) => {
            // No origin = direct browser nav, curl, health checks — always allow
            if (!origin) return callback(null, true);
            if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
            callback(new Error(`CORS: Origin ${origin} not allowed`));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

if (NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
}

// Files are stored on Cloudinary Ã¢â¬â no local /uploads static serving needed

app.use('/api', apiLimiter);

app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', env: NODE_ENV, timestamp: new Date().toISOString() });
});

app.use('/api', routes);

app.use((_req: Request, res: Response) => {
    res.status(404).json({ message: 'Route not found' });
});

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    errorHandler(err, req, res, next);
});

export default app;
