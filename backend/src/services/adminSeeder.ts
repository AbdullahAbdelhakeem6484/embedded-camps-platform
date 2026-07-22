import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import logger from '../lib/logger';

export async function seedAdminUsers() {
    try {
        const adminEmails = [
            'admin@embeddedcamps.com',
            'abdullah.abdelhakeem657@gmail.com',
            'abdullah.abdelhakeem25@gmail.com'
        ];
        const passwordHash = await bcrypt.hash('admin123', 10);
        
        for (const email of adminEmails) {
            const existing = await prisma.user.findUnique({ where: { email } });
            if (!existing) {
                await prisma.user.create({
                    data: {
                        email,
                        password: passwordHash,
                        name: email === 'admin@embeddedcamps.com' ? 'Super Admin' : 'Abdullah Abdelhakeem',
                        role: 'ADMIN',
                    }
                });
                logger.info(`[startup] Seeded admin user: ${email}`);
            } else if (existing.role !== 'ADMIN') {
                await prisma.user.update({
                    where: { id: existing.id },
                    data: { role: 'ADMIN' }
                });
                logger.info(`[startup] Updated role of ${email} to ADMIN`);
            }
        }
    } catch (err) {
        logger.error('[startup] Error seeding admin users:', err);
    }
}
