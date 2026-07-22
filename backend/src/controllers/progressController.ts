import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../middlewares/errorHandler';
import { EnrollmentService } from '../services/enrollment.service';
import { emailService } from '../lib/email';
import logger from '../lib/logger';
import { AuthRequest } from '../middlewares/auth';
import { generateCertificateId, generateCertificatePdf } from '../services/certificateGenerator';
import { uploadToCloudinary } from '../lib/cloudinary';
import { APP_URL } from '../config';
import https from 'https';

// POST /api/progress/material — mark a material as watched
export const markMaterialProgress = async (req: AuthRequest, res: Response) => {
    const { materialId, watchTime } = req.body;

    const material = await prisma.material.findUnique({
        where: { id: materialId },
        include: { masterSession: true },
    });
    if (!material) throw new AppError('Material not found', 404);

    const enrollment = await EnrollmentService.findActiveForSession(
        req.user.id,
        material.masterSessionId,
    );

    const progress = await prisma.materialProgress.upsert({
        where: { userId_materialId: { userId: req.user.id, materialId } },
        update: { completed: true, watchTime: watchTime || 0 },
        create: { userId: req.user.id, materialId, completed: true, watchTime: watchTime || 0 },
    });

    // Auto-issue certificate if all materials in this camp are complete
    await checkAndIssueCertificate(req.user.id, enrollment.campId);

    res.json(progress);
};

// GET /api/progress/camp/:campId — get progress for the authenticated user in a camp
export const getCampProgress = async (req: AuthRequest, res: Response) => {
    const { campId } = req.params;
    await EnrollmentService.checkCampAccess(req.user.id, campId);

    const camp = await prisma.camp.findUnique({
        where: { id: campId },
        include: {
            campSessions: {
                include: {
                    masterSession: { include: { materials: true } },
                },
            },
        },
    });
    if (!camp) throw new AppError('Camp not found', 404);

    const allMaterialIds = camp.campSessions.flatMap((cs) =>
        cs.masterSession.materials.map((m) => m.id),
    );

    const completedProgress = await prisma.materialProgress.findMany({
        where: {
            userId: req.user.id,
            materialId: { in: allMaterialIds },
            completed: true,
        },
    });

    const completedIds = new Set(completedProgress.map((p) => p.materialId));
    const total = allMaterialIds.length;
    const completed = completedIds.size;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({ total, completed, percentage, completedMaterialIds: [...completedIds] });
};

// ─── Internal helper ──────────────────────────────────────────────────────────

async function createAndUploadCertificate(userId: string, campId: string, studentName: string, courseName: string, studentEmail: string) {
    const certificateId = generateCertificateId();
    const verificationUrl = `${APP_URL}/verify/${certificateId}`;
    
    // Generate PDF Buffer
    const pdfBuffer = await generateCertificatePdf({
        studentName,
        courseName,
        completionDate: new Date(),
        certificateId,
        verificationUrl,
    });
    
    // Upload to Cloudinary
    const uploadRes = await uploadToCloudinary(
        pdfBuffer,
        'embeddedcamps/certificates',
        'raw',
        `Certificate_${certificateId}.pdf`
    );
    
    // Create database entry
    const cert = await prisma.certificate.create({
        data: {
            userId,
            campId,
            certificateId,
            studentName,
            courseName,
            verificationUrl,
            pdfUrl: uploadRes.url,
            status: 'ACTIVE',
            completionDate: new Date(),
            issueDate: new Date(),
        },
        include: {
            user: { select: { id: true, name: true, email: true } },
            camp: { select: { id: true, title: true, slug: true } },
        }
    });

    // Send email with attachment
    emailService.sendCertificate(studentEmail, studentName, courseName, certificateId, pdfBuffer).catch((err) => {
        logger.error(`[emailService] Error sending certificate email for ${studentEmail}:`, err);
    });

    return cert;
}

async function regenerateCertificatePdfBuffer(certId: string) {
    const cert = await prisma.certificate.findUnique({
        where: { id: certId },
        include: {
            user: { select: { name: true, email: true } },
            camp: { select: { title: true } },
        }
    });
    if (!cert) throw new AppError('Certificate not found', 404);
    
    const studentName = cert.studentName || cert.user.name || 'Student';
    const courseName = cert.courseName || cert.camp.title;
    const certificateId = cert.certificateId || generateCertificateId();
    const verificationUrl = `${APP_URL}/verify/${certificateId}`;
    
    const pdfBuffer = await generateCertificatePdf({
        studentName,
        courseName,
        completionDate: cert.completionDate,
        certificateId,
        verificationUrl,
    });
    
    const uploadRes = await uploadToCloudinary(
        pdfBuffer,
        'embeddedcamps/certificates',
        'raw',
        `Certificate_${certificateId}.pdf`
    );
    
    return prisma.certificate.update({
        where: { id: certId },
        data: {
            certificateId,
            studentName,
            courseName,
            verificationUrl,
            pdfUrl: uploadRes.url,
        },
        include: {
            user: { select: { id: true, name: true, email: true } },
            camp: { select: { id: true, title: true, slug: true } },
        }
    });
}

async function checkAndIssueCertificate(userId: string, campId: string) {
    const existing = await prisma.certificate.findFirst({ where: { userId, campId } });
    if (existing) return;

    const camp = await prisma.camp.findUnique({
        where: { id: campId },
        include: {
            campSessions: {
                include: { masterSession: { include: { materials: true } } },
            },
        },
    });
    if (!camp) return;

    const allMaterialIds = camp.campSessions.flatMap((cs) =>
        cs.masterSession.materials.map((m) => m.id),
    );
    if (allMaterialIds.length === 0) return;

    const completedCount = await prisma.materialProgress.count({
        where: {
            userId,
            materialId: { in: allMaterialIds },
            completed: true,
        },
    });

    if (completedCount < allMaterialIds.length) return;

    // All materials complete — issue certificate
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    try {
        const cert = await createAndUploadCertificate(
            userId,
            campId,
            user.name || 'Student',
            camp.title,
            user.email
        );
        logger.info(`Certificate auto-issued: user=${userId} camp=${campId} cert=${cert.id} certificateId=${cert.certificateId}`);
    } catch (err) {
        logger.error(`Error auto-issuing certificate for user=${userId} camp=${campId}:`, err);
    }
}

// POST /api/progress/materials/:materialId/complete (route alias)
export const completeMaterial = async (req: AuthRequest, res: Response) => {
    req.body.materialId = req.params.materialId;
    return markMaterialProgress(req, res);
};

// GET /api/progress/my-summary — all-camps progress summary for the dashboard
export const getDashboardSummary = async (req: AuthRequest, res: Response) => {
    // 1. Get all active enrollments
    const enrollments = await prisma.enrollment.findMany({
        where: { userId: req.user.id, status: 'ACTIVE' },
        include: {
            camp: {
                include: {
                    campSessions: {
                        where: { isVisible: true },
                        include: {
                            masterSession: {
                                include: {
                                    materials: { select: { id: true }, orderBy: { order: 'asc' } },
                                    labs: { select: { id: true, title: true, dueDate: true } },
                                },
                            },
                        },
                        orderBy: { order: 'asc' },
                    },
                    brand: { select: { id: true, name: true, icon: true, color: true } },
                },
            },
        },
    });

    // 2. Get all material IDs across enrolled camps
    const allMaterialIds = enrollments.flatMap((e) =>
        e.camp.campSessions.flatMap((cs) => cs.masterSession.materials.map((m) => m.id)),
    );

    // 3. Fetch completed material progress
    const completedProgress = await prisma.materialProgress.findMany({
        where: {
            userId: req.user.id,
            materialId: { in: allMaterialIds },
            completed: true,
        },
        select: { materialId: true },
    });
    const completedSet = new Set(completedProgress.map((p) => p.materialId));

    // 4. Fetch lab submissions
    const labIds = enrollments.flatMap((e) =>
        e.camp.campSessions.flatMap((cs) => cs.masterSession.labs.map((l) => l.id)),
    );
    const submissions = await prisma.labSubmission.findMany({
        where: { userId: req.user.id, labId: { in: labIds } },
        select: { labId: true },
    });
    const submittedLabIds = new Set(submissions.map((s) => s.labId));

    // 5. Build per-camp summary
    const camps = enrollments.map((e) => {
        const totalMaterials = e.camp.campSessions.flatMap((cs) =>
            cs.masterSession.materials,
        ).length;
        const completedMaterials = e.camp.campSessions
            .flatMap((cs) => cs.masterSession.materials)
            .filter((m) => completedSet.has(m.id)).length;
        const percentage = totalMaterials > 0
            ? Math.round((completedMaterials / totalMaterials) * 100)
            : 0;

        const totalLabs = e.camp.campSessions.flatMap((cs) => cs.masterSession.labs).length;
        const submittedLabs = e.camp.campSessions
            .flatMap((cs) => cs.masterSession.labs)
            .filter((l) => submittedLabIds.has(l.id)).length;

        // Upcoming labs: not submitted yet, has a dueDate, due in the future
        const upcomingLabs = e.camp.campSessions
            .flatMap((cs) => cs.masterSession.labs)
            .filter(
                (l) =>
                    !submittedLabIds.has(l.id) &&
                    l.dueDate &&
                    new Date(l.dueDate) > new Date(),
            );

        return {
            campId: e.camp.id,
            campTitle: e.camp.title,
            campSlug: e.camp.slug,
            brand: e.camp.brand,
            enrolledAt: e.enrolledAt,
            totalMaterials,
            completedMaterials,
            percentage,
            totalLabs,
            submittedLabs,
            upcomingLabs,
            sessions: e.camp.campSessions.map((cs) => ({
                id: cs.id,
                masterSessionId: cs.masterSession.id,
                title: cs.masterSession.title,
                order: cs.order,
                totalMaterials: cs.masterSession.materials.length,
                completedMaterials: cs.masterSession.materials.filter((m) =>
                    completedSet.has(m.id),
                ).length,
            })),
        };
    });

    res.json({ camps });
};

// GET /api/certificates/my-certificates
export const getMyCertificates = async (req: AuthRequest, res: Response) => {
    const certs = await prisma.certificate.findMany({
        where: { userId: req.user.id },
        include: { camp: { select: { id: true, title: true, slug: true } } },
        orderBy: { createdAt: 'desc' },
    });
    res.json(certs);
};

// GET /api/certificates/verify/:certificateId — public verification
export const verifyCertificate = async (req: Request, res: Response) => {
    const { certificateId } = req.params;
    const cert = await prisma.certificate.findFirst({
        where: {
            OR: [
                { id: certificateId },
                { certificateId }
            ]
        },
        include: {
            user: { select: { name: true, email: true } },
            camp: { select: { title: true } },
        },
    });
    if (!cert) throw new AppError('Certificate not found', 404);
    
    // Increment verification scans only if it's active
    if (cert.status === 'ACTIVE') {
        await prisma.certificate.update({
            where: { id: cert.id },
            data: { verificationScansCount: { increment: 1 } }
        });
    }

    res.json(cert);
};

// GET /api/certificates/download/:certificateId — stream/download PDF securely
export const downloadCertificate = async (req: Request, res: Response) => {
    const { certificateId } = req.params;
    const cert = await prisma.certificate.findFirst({
        where: {
            OR: [
                { id: certificateId },
                { certificateId }
            ]
        }
    });
    if (!cert || !cert.pdfUrl) throw new AppError('Certificate or PDF not found', 404);

    // Increment downloads count
    await prisma.certificate.update({
        where: { id: cert.id },
        data: { downloadsCount: { increment: 1 } }
    });

    // Stream PDF from Cloudinary with proper attachment headers
    https.get(cert.pdfUrl, (pdfStream) => {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Certificate_${cert.certificateId || cert.id}.pdf`);
        pdfStream.pipe(res);
    }).on('error', (err) => {
        logger.error(`Error streaming certificate PDF for ${certificateId}:`, err);
        res.status(500).json({ message: 'Failed to download certificate PDF' });
    });
};

// ─── Admin certificate management ────────────────────────────────────────────

// GET /api/certificates — all certificates (admin)
export const getAllCertificates = async (req: Request, res: Response) => {
    const page = Math.max(1, parseInt((req as any).query.page as string) || 1);
    const take = 30;
    const skip = (page - 1) * take;

    const [certs, total] = await prisma.$transaction([
        prisma.certificate.findMany({
            skip, take,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { id: true, name: true, email: true } },
                camp: { select: { id: true, title: true, slug: true } },
            },
        }),
        prisma.certificate.count(),
    ]);

    res.json({ data: certs, total, page, pages: Math.ceil(total / take) });
};

// POST /api/certificates/issue — manually issue a certificate (admin)
export const issueCertificate = async (req: AuthRequest, res: Response) => {
    const { userId, campId } = req.body;
    if (!userId || !campId) throw new AppError('userId and campId are required', 400);

    const existing = await prisma.certificate.findFirst({ where: { userId, campId } });
    if (existing) throw new AppError('Certificate already issued for this student and camp', 409);

    const [user, camp] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true } }),
        prisma.camp.findUnique({ where: { id: campId }, select: { id: true, title: true } }),
    ]);
    if (!user) throw new AppError('User not found', 404);
    if (!camp) throw new AppError('Camp not found', 404);

    const cert = await createAndUploadCertificate(
        userId,
        campId,
        user.name || 'Student',
        camp.title,
        user.email
    );

    res.status(201).json(cert);
};

// POST /api/certificates/regenerate/:id — manually regenerate a certificate (admin)
export const regenerateCertificate = async (req: Request, res: Response) => {
    const { id } = req.params;
    const cert = await regenerateCertificatePdfBuffer(id);
    res.json(cert);
};

// PUT /api/certificates/status — toggle certificate status (admin)
export const updateCertificateStatus = async (req: Request, res: Response) => {
    const { id, status } = req.body;
    if (!id || !status) throw new AppError('id and status are required', 400);
    if (!['ACTIVE', 'REVOKED'].includes(status)) throw new AppError('Invalid status', 400);

    const cert = await prisma.certificate.update({
        where: { id },
        data: { status },
        include: {
            user: { select: { id: true, name: true, email: true } },
            camp: { select: { id: true, title: true, slug: true } },
        }
    });

    res.json(cert);
};

// DELETE /api/certificates/:id — permanently delete a certificate (admin)
export const revokeCertificate = async (req: Request, res: Response) => {
    await prisma.certificate.delete({ where: { id: req.params.id } })
        .catch(() => { throw new AppError('Certificate not found', 404); });
    res.json({ message: 'Certificate deleted successfully' });
};
