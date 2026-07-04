import { Router } from 'express';
import { getOrders, createOrder, updateOrder, deleteOrder, getOrderStats, createOrderSchema, updateOrderSchema } from '../controllers/orderController';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';

const router = Router();

router.get('/stats', authenticate, authorize(['ADMIN']), getOrderStats);
router.get('/', authenticate, authorize(['ADMIN']), getOrders);
router.post('/', authenticate, authorize(['ADMIN']), validate(createOrderSchema), createOrder);
router.patch('/:id', authenticate, authorize(['ADMIN']), validate(updateOrderSchema), updateOrder);
router.delete('/:id', authenticate, authorize(['ADMIN']), deleteOrder);

export default router;
