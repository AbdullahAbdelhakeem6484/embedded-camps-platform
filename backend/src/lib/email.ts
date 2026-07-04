import nodemailer from 'nodemailer';
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM, APP_URL } from '../config';
import logger from './logger';

// ─── Transporter ─────────────────────────────────────────────────────────────
// Configure SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS in .env.
// Works with Gmail, Brevo, Resend SMTP, Mailgun, etc.
const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
});

// ─── Email service ────────────────────────────────────────────────────────────
export const EmailService = {
    async sendPasswordReset(toEmail: string, name: string, token: string) {
        const resetUrl = `${APP_URL}/reset-password/${token}`;
        return this._send({
            to: toEmail,
            subject: 'Reset your EmbeddedCamps password',
            html: `
                <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#0a0a0b;color:#fff;border-radius:12px;">
                    <h2 style="color:#60a5fa;margin-bottom:8px;">Password Reset</h2>
                    <p>Hi <strong>${name || toEmail}</strong>,</p>
                    <p>We received a request to reset your EmbeddedCamps password. Click the button below within <strong>1 hour</strong>:</p>
                    <a href="${resetUrl}" style="display:inline-block;margin:24px 0;padding:14px 28px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
                        Reset Password
                    </a>
                    <p style="color:#9ca3af;font-size:13px;">If you didn't request this, ignore this email — your password won't change.</p>
                    <p style="color:#9ca3af;font-size:13px;">Or copy this link:<br/><a href="${resetUrl}" style="color:#60a5fa;">${resetUrl}</a></p>
                </div>
            `,
        });
    },

    async sendWelcome(toEmail: string, name: string) {
        return this._send({
            to: toEmail,
            subject: 'Welcome to EmbeddedCamps! 🚀',
            html: `
                <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#0a0a0b;color:#fff;border-radius:12px;">
                    <h2 style="color:#60a5fa;">Welcome aboard, ${name || 'Engineer'}!</h2>
                    <p>Your EmbeddedCamps account is ready. Once your enrollment is confirmed (after payment), you'll have full access to all course content.</p>
                    <p>To enroll, send your payment proof to our WhatsApp:</p>
                    <a href="https://wa.me/201023460370" style="display:inline-block;margin:20px 0;padding:14px 28px;background:#16a34a;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
                        Message Us on WhatsApp
                    </a>
                    <p style="color:#9ca3af;font-size:13px;">Questions? Reply to this email or contact us on WhatsApp.</p>
                </div>
            `,
        });
    },

    async sendEnrollmentConfirmation(toEmail: string, name: string, campTitle: string, expiresAt: Date) {
        const loginUrl = `${APP_URL}/login`;
        return this._send({
            to: toEmail,
            subject: `You're enrolled in ${campTitle}! 🎓`,
            html: `
                <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#0a0a0b;color:#fff;border-radius:12px;">
                    <h2 style="color:#60a5fa;">Enrollment Confirmed!</h2>
                    <p>Hi <strong>${name || toEmail}</strong>,</p>
                    <p>Your enrollment in <strong>${campTitle}</strong> is now active!</p>
                    <p style="color:#9ca3af;">Access expires: <strong style="color:#fff;">${expiresAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></p>
                    <a href="${loginUrl}" style="display:inline-block;margin:24px 0;padding:14px 28px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
                        Go to Dashboard →
                    </a>
                    <p style="color:#9ca3af;font-size:13px;">Good luck with your journey into AOSP! 🚀</p>
                </div>
            `,
        });
    },

    async sendCertificate(toEmail: string, name: string, campTitle: string, certificateId: string) {
        const verifyUrl = `${APP_URL}/verify/${certificateId}`;
        return this._send({
            to: toEmail,
            subject: `Your EmbeddedCamps Certificate — ${campTitle} 🏆`,
            html: `
                <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#0a0a0b;color:#fff;border-radius:12px;">
                    <h2 style="color:#f59e0b;">Congratulations, ${name || 'Engineer'}! 🏆</h2>
                    <p>You've successfully completed <strong>${campTitle}</strong>!</p>
                    <p>Your certificate is ready. Share it on LinkedIn to showcase your achievement:</p>
                    <a href="${verifyUrl}" style="display:inline-block;margin:24px 0;padding:14px 28px;background:#d97706;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
                        View Certificate
                    </a>
                    <p style="color:#9ca3af;font-size:13px;">Certificate ID: <code>${certificateId}</code></p>
                </div>
            `,
        });
    },

    async _send({ to, subject, html }: { to: string; subject: string; html: string }) {
        // If SMTP is not configured, log instead of throwing
        if (!SMTP_HOST || !SMTP_USER) {
            logger.warn(`[Email] SMTP not configured. Would have sent "${subject}" to ${to}`);
            return;
        }
        try {
            const info = await transporter.sendMail({ from: EMAIL_FROM, to, subject, html });
            logger.info(`[Email] Sent "${subject}" to ${to} (messageId: ${info.messageId})`);
        } catch (err) {
            logger.error(`[Email] Failed to send "${subject}" to ${to}:`, err);
            // Don't throw — email failure shouldn't crash the request
        }
    },
};

// Alias for convenience
export const emailService = EmailService;
