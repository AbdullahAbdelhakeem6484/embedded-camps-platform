import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AppError } from '../middlewares/errorHandler';
import { AuthRequest } from '../middlewares/auth';

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

export const upsertNoteSchema = z.object({
    materialId: z.string().uuid(),
    content: z.string().min(1).max(10000),
});

// ─── Controllers ─────────────────────────────────────────────────────────────

// GET /api/notes?materialId= — get note for a material
export const getNoteForMaterial = async (req: AuthRequest, res: Response) => {
    const { materialId } = req.query;
    if (!materialId) throw new AppError('materialId is required', 400);

    const note = await prisma.note.findUnique({
        where: { userId_materialId: { userId: req.user.id, materialId: materialId as string } },
    });
    res.json(note ?? null);
};

// POST /api/notes — create or update note (upsert)
export const upsertNote = async (req: AuthRequest, res: Response) => {
    const { materialId, content } = req.body;

    const note = await prisma.note.upsert({
        where: { userId_materialId: { userId: req.user.id, materialId } },
        update: { content },
        create: { userId: req.user.id, materialId, content },
    });
    res.json(note);
};

// DELETE /api/notes/:materialId — delete note for a material
export const deleteNote = async (req: AuthRequest, res: Response) => {
    await prisma.note.delete({
        where: { userId_materialId: { userId: req.user.id, materialId: req.params.materialId } },
    }).catch(() => { throw new AppError('Note not found', 404); });
    res.json({ message: 'Note deleted' });
};

// GET /api/notes/my-notes — all notes for the logged-in user
export const getMyNotes = async (req: AuthRequest, res: Response) => {
    const notes = await prisma.note.findMany({
        where: { userId: req.user.id },
        include: { material: { select: { id: true, title: true, masterSession: { select: { id: true, title: true } } } } },
        orderBy: { updatedAt: 'desc' },
    });
    res.json(notes);
};
