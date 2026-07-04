import rateLimit from 'express-rate-limit';

// ─── Auth rate limiter ────────────────────────────────────────────────────────
// Prevents brute-force attacks on login/register/reset endpoints.
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,                   // max 10 attempts per window per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many attempts from this IP. Please try again in 15 minutes.' },
    skipSuccessfulRequests: true, // only count failed attempts
});

// ─── General API limiter ──────────────────────────────────────────────────────
// Prevents API abuse and DoS.
export const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 120,                  // 120 requests/minute per IP — generous for normal use
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests. Please slow down.' },
});

// ─── Video stream limiter ─────────────────────────────────────────────────────
// Limits how often a signed CDN URL can be requested per user.
export const streamLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many stream requests. Please wait a moment.' },
});
