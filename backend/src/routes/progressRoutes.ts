import { Router } from 'express';
import { getCampProgress, completeMaterial, getDashboardSummary, markMaterialProgress } from '../controllers/progressController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get('/my-summary', authenticate, getDashboardSummary);
router.get('/camps/:campId', authenticate, getCampProgress);
router.post('/material', authenticate, markMaterialProgress);
router.post('/materials/:materialId/complete', authenticate, completeMaterial);

export default router;
