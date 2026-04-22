import { Router } from 'express';
import {
  getOrders,
  getMyOrders,
  getOrder,
  createOrder,
  createOrderAdmin,
  updateOrderStatus,
  getDashboardStats,
} from '../controllers/orders.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/dashboard', authenticate, requireAdmin, getDashboardStats);
router.get('/', authenticate, requireAdmin, getOrders);
router.get('/my', authenticate, getMyOrders);
router.get('/:id', authenticate, getOrder);
router.post('/', authenticate, createOrder);
router.post('/admin', authenticate, requireAdmin, createOrderAdmin);
router.patch('/:id/status', authenticate, requireAdmin, updateOrderStatus);

export default router;
