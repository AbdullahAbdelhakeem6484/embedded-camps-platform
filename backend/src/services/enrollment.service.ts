import { prisma } from '../lib/prisma';
import { AppError } from '../middlewares/errorHandler';

export const EnrollmentService = {
    /**
     * Returns active enrollment for a user in a camp, or throws 403.
     */
    async findActive(userId: string, campId: string) {
        const enrollment = await prisma.enrollment.findFirst({
            where: {
                userId,
                campId,
                status: 'ACTIVE',
                OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
            },
        });
        if (!enrollment) throw new AppError('You are not enrolled in this camp', 403);
        return enrollment;
    },

    /**
     * Returns active enrollment for a user in any camp that contains
     * the given masterSession (visible). Used for material/lab/quiz access.
     */
    async findActiveForSession(userId: string, masterSessionId: string) {
        const campSessions = await prisma.campSession.findMany({
            where: { masterSessionId, isVisible: true },
            select: { campId: true },
        });
        const campIds = campSessions.map((cs) => cs.campId);
        if (campIds.length === 0) throw new AppError('This session is not available', 404);

        const enrollment = await prisma.enrollment.findFirst({
            where: {
                userId,
                campId: { in: campIds },
                status: 'ACTIVE',
                OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
            },
        });
        if (!enrollment) throw new AppError('You are not enrolled in a camp containing this session', 403);
        return enrollment;
    },

    /**
     * Checks camp access — throws if student is not enrolled.
     * Admins should bypass this check in the controller.
     */
    async checkCampAccess(userId: string, campId: string) {
        return this.findActive(userId, campId);
    },
};
