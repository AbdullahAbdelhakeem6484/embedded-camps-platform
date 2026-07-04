import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AppError } from '../middlewares/errorHandler';

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

export const createBrandSchema = z.object({
    name: z.string().min(1).max(100),
    slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
    tagline: z.string().max(200).optional(),
    description: z.string().optional(),
    icon: z.string().max(10).optional(),
    color: z.string().max(50).optional(),
    status: z.enum(['LIVE', 'COMING_SOON', 'ARCHIVED']).optional(),
    order: z.number().int().optional(),
});

export const updateBrandSchema = createBrandSchema.partial();

// ─── Controllers ─────────────────────────────────────────────────────────────

// GET /api/brands — public
export const getBrands = async (_req: Request, res: Response) => {
    const brands = await prisma.brand.findMany({
        include: { camps: { select: { id: true, title: true, slug: true, status: true } } },
        orderBy: { order: 'asc' },
    });
    res.json(brands);
};

// GET /api/brands/:slug — public
export const getBrandBySlug = async (req: Request, res: Response) => {
    const brand = await prisma.brand.findUnique({
        where: { slug: req.params.slug },
        include: {
            camps: {
                where: { status: 'ACTIVE' },
                select: { id: true, title: true, slug: true, thumbnail: true, level: true, price: true },
            },
        },
    });
    if (!brand) throw new AppError('Brand not found', 404);
    res.json(brand);
};

// POST /api/brands — admin
export const createBrand = async (req: Request, res: Response) => {
    const { name, slug, tagline, description, icon, color, status, order } = req.body;

    const existing = await prisma.brand.findUnique({ where: { slug } });
    if (existing) throw new AppError('A brand with this slug already exists', 409);

    const brand = await prisma.brand.create({
        data: { name, slug, tagline, description, icon, color, status, order },
    });
    res.status(201).json(brand);
};

// PATCH /api/brands/:id — admin
export const updateBrand = async (req: Request, res: Response) => {
    const { name, slug, tagline, description, icon, color, status, order } = req.body;

    if (slug) {
        const conflict = await prisma.brand.findFirst({ where: { slug, NOT: { id: req.params.id } } });
        if (conflict) throw new AppError('Slug already in use by another brand', 409);
    }

    const brand = await prisma.brand.update({
        where: { id: req.params.id },
        data: { name, slug, tagline, description, icon, color, status, order },
    }).catch(() => { throw new AppError('Brand not found', 404); });

    res.json(brand);
};

// DELETE /api/brands/:id — admin
export const deleteBrand = async (req: Request, res: Response) => {
    // Unlink camps before deleting (brandId → null via SetNull)
    await prisma.brand.delete({ where: { id: req.params.id } })
        .catch(() => { throw new AppError('Brand not found', 404); });
    res.json({ message: 'Brand deleted' });
};
