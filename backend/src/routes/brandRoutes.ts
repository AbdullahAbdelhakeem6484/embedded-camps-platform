import { Router } from 'express';
import {
    getBrands, getBrandBySlug, createBrand, updateBrand, deleteBrand,
    createBrandSchema, updateBrandSchema,
} from '../controllers/brandController';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';

const router = Router();

// Public
router.get('/', getBrands);
router.get('/:slug', getBrandBySlug);

// Admin only
router.post('/', authenticate, authorize(['ADMIN']), validate(createBrandSchema), createBrand);
router.patch('/:id', authenticate, authorize(['ADMIN']), validate(updateBrandSchema), updateBrand);
router.delete('/:id', authenticate, authorize(['ADMIN']), deleteBrand);

export default router;
