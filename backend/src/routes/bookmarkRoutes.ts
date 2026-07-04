import { Router } from 'express';
import { toggleBookmark, getMyBookmarks, getMyBookmarkIds } from '../controllers/bookmarkController';
import { authenticate } from '../middlewares/auth';
import { z } from 'zod';
import { validate } from '../middlewares/validate';

const router = Router();

const toggleSchema = z.object({ materialId: z.string().uuid() });

router.get('/', authenticate, getMyBookmarks);
router.get('/ids', authenticate, getMyBookmarkIds);
router.post('/toggle', authenticate, validate(toggleSchema), toggleBookmark);

export default router;
