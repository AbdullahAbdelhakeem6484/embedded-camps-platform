import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AppError } from '../middlewares/errorHandler';
import { AuthRequest } from '../middlewares/auth';

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

export const createOrderSchema = z.object({
    studentName: z.string().min(1).max(200),
    studentEmail: z.string().email(),
    campId: z.string().uuid(),
    amount: z.number().positive(),
    currency: z.enum(['USD', 'EGP', 'EUR', 'GBP']).optional(),
    paymentMethod: z.enum(['INSTAPAY', 'IBAN', 'WALLET', 'OTHER']).optional(),
    paymentRef: z.string().max(500).optional(),
    notes: z.string().max(2000).optional(),
});

export const updateOrderSchema = z.object({
    status: z.enum(['PENDING', 'VERIFIED', 'REFUNDED', 'CANCELLED']).optional(),
    paymentRef: z.string().max(500).optional(),
    notes: z.string().max(2000).optional(),
    paymentMethod: z.enum(['INSTAPAY', 'IBAN', 'WALLET', 'OTHER']).optional(),
});

// ─── Controllers ─────────────────────────────────────────────────────────────

const PAGE_SIZE = 25;

// GET /api/orders — admin only, paginated + filters
export const getOrders = async (req: AuthRequest, res: Response) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const take = Math.min(100, parseInt(req.query.limit as string) || PAGE_SIZE);
    const skip = (page - 1) * take;
    const status = req.query.status as string | undefined;
    const campId = req.query.campId as string | undefined;
    const search = req.query.search as string | undefined;

    const where: any = {};
    if (status) where.status = status;
    if (campId) where.campId = campId;
    if (search) where.OR = [
        { studentName: { contains: search, mode: 'insensitive' } },
        { studentEmail: { contains: search, mode: 'insensitive' } },
        { paymentRef: { contains: search, mode: 'insensitive' } },
    ];

    const [orders, total] = await prisma.$transaction([
        prisma.order.findMany({
            where,
            skip,
            take,
            orderBy: { createdAt: 'desc' },
            include: {
                camp: { select: { id: true, title: true } },
                verifiedBy: { select: { id: true, name: true } },
            },
        }),
        prisma.order.count({ where }),
    ]);

    res.json({ data: orders, total, page, pages: Math.ceil(total / take) });
};

// POST /api/orders — admin creates order record after verifying WhatsApp payment
export const createOrder = async (req: AuthRequest, res: Response) => {
    const { studentName, studentEmail, campId, amount, currency, paymentMethod, paymentRef, notes } = req.body;

    const camp = await prisma.camp.findUnique({ where: { id: campId } });
    if (!camp) throw new AppError('Camp not found', 404);

    const order = await prisma.order.create({
        data: { studentName, studentEmail, campId, amount, currency, paymentMethod, paymentRef, notes },
        include: { camp: { select: { id: true, title: true } } },
    });
    res.status(201).json(order);
};

// PATCH /api/orders/:id — update status / notes / ref
export const updateOrder = async (req: AuthRequest, res: Response) => {
    const { status, paymentRef, notes, paymentMethod } = req.body;

    const existing = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError('Order not found', 404);

    const data: any = { status, paymentRef, notes, paymentMethod };

    // If marking as verified, record who verified and when
    if (status === 'VERIFIED' && existing.status !== 'VERIFIED') {
        data.verifiedById = req.user.id;
        data.verifiedAt = new Date();
    }

    const order = await prisma.order.update({
        where: { id: req.params.id },
        data,
        include: {
            camp: { select: { id: true, title: true } },
            verifiedBy: { select: { id: true, name: true } },
        },
    });
    res.json(order);
};

// DELETE /api/orders/:id — admin only
export const deleteOrder = async (req: AuthRequest, res: Response) => {
    await prisma.order.delete({ where: { id: req.params.id } })
        .catch(() => { throw new AppError('Order not found', 404); });
    res.json({ message: 'Order deleted' });
};

// GET /api/orders/stats — quick revenue summary
export const getOrderStats = async (_req: AuthRequest, res: Response) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
        totalEGP,
        totalUSD,
        monthEGP,
        monthUSD,
        pending,
        verified,
        paidCount,
        freeCount
    ] = await prisma.$transaction([
        prisma.order.aggregate({ where: { status: 'VERIFIED', currency: 'EGP' }, _sum: { amount: true }, _count: true }),
        prisma.order.aggregate({ where: { status: 'VERIFIED', currency: 'USD' }, _sum: { amount: true }, _count: true }),
        prisma.order.aggregate({ where: { status: 'VERIFIED', currency: 'EGP', verifiedAt: { gte: startOfMonth } }, _sum: { amount: true }, _count: true }),
        prisma.order.aggregate({ where: { status: 'VERIFIED', currency: 'USD', verifiedAt: { gte: startOfMonth } }, _sum: { amount: true }, _count: true }),
        prisma.order.count({ where: { status: 'PENDING' } }),
        prisma.order.count({ where: { status: 'VERIFIED' } }),
        prisma.order.count({ where: { status: 'VERIFIED', amount: { gt: 0 } } }),
        prisma.order.count({ where: { status: 'VERIFIED', amount: 0 } }),
    ]);

    const totalRevenueEGP = Number(totalEGP._sum.amount ?? 0);
    const totalOrdersEGP = totalEGP._count;
    const totalRevenueUSD = Number(totalUSD._sum.amount ?? 0);
    const totalOrdersUSD = totalUSD._count;

    const monthRevenueEGP = Number(monthEGP._sum.amount ?? 0);
    const monthOrdersEGP = monthEGP._count;
    const monthRevenueUSD = Number(monthUSD._sum.amount ?? 0);
    const monthOrdersUSD = monthUSD._count;

    res.json({
        totalRevenue: totalRevenueUSD, // backward compatibility
        totalOrders: totalOrdersEGP + totalOrdersUSD, // backward compatibility
        monthRevenue: monthRevenueUSD, // backward compatibility
        monthOrders: monthOrdersEGP + monthOrdersUSD, // backward compatibility
        totalRevenueEGP,
        totalRevenueUSD,
        totalOrdersEGP,
        totalOrdersUSD,
        monthRevenueEGP,
        monthRevenueUSD,
        monthOrdersEGP,
        monthOrdersUSD,
        paidCount,
        freeCount,
        pending,
        verified,
    });
};
