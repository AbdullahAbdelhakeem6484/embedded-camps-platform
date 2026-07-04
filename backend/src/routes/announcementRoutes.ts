import { Router } from 'express';
import {
    getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement,
    createAnnouncementSchema, updateAnnouncementSchema,
} from '../controllers/announcementController';
import { authenticate, authorize, optionalAuthenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';

const router = Router();

router.get('/', optionalAuthenticate, getAnnouncements);
router.post('/', authenticate, authorize(['ADMIN']), validate(createAnnouncementSchema), createAnnouncement);
router.patch('/:id', authenticate, authorize(['ADMIN']), validate(updateAnnouncementSchema), updateAnnouncement);
router.delete('/:id', authenticate, authorize(['ADMIN']), deleteAnnouncement);

export default router;
