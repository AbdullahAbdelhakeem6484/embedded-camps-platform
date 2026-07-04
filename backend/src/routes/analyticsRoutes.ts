import { Router } from 'express';
import { getOverview } from '../controllers/analyticsController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.get('/overview', authenticate, authorize(['ADMIN']), getOverview);

export default router;
