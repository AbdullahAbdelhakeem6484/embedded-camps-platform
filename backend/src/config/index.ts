import dotenv from 'dotenv';
dotenv.config();

function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        console.error(`FATAL: Missing required environment variable: ${name}`);
        process.exit(1);
    }
    return value;
}

// Required — crash on startup if missing
export const JWT_SECRET = requireEnv('JWT_SECRET');
export const JWT_REFRESH_SECRET = requireEnv('JWT_REFRESH_SECRET');
export const DATABASE_URL = requireEnv('DATABASE_URL');

// Server
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PORT = parseInt(process.env.PORT || '3001', 10);

// JWT
export const JWT_ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m';
export const JWT_REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '30d';

// CORS
export const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((s) => s.trim());

// Bunny.net CDN
export const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE || '';
export const BUNNY_STORAGE_API_KEY = process.env.BUNNY_STORAGE_API_KEY || '';
export const BUNNY_CDN_URL = (process.env.BUNNY_CDN_URL || '').replace(/\/$/, '');
export const BUNNY_TOKEN_SECRET = process.env.BUNNY_TOKEN_SECRET || '';

// SMTP / Email
export const SMTP_HOST = process.env.SMTP_HOST || '';
export const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
export const SMTP_USER = process.env.SMTP_USER || '';
export const SMTP_PASS = process.env.SMTP_PASS || '';
export const EMAIL_FROM = process.env.EMAIL_FROM || 'EmbeddedCamps <noreply@embeddedcamps.com>';
export const APP_URL = (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');
export const API_URL = (process.env.API_URL || 'http://localhost:3001').replace(/\/$/, '');
