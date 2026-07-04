import { Router } from 'express';
import { getNoteForMaterial, upsertNote, deleteNote, getMyNotes, upsertNoteSchema } from '../controllers/noteController';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';

const router = Router();

router.get('/my-notes', authenticate, getMyNotes);
router.get('/', authenticate, getNoteForMaterial);
router.post('/', authenticate, validate(upsertNoteSchema), upsertNote);
router.delete('/:materialId', authenticate, deleteNote);

export default router;
