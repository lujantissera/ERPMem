import { Router } from 'express';
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierOrders,
  createSupplierOrder,
  updateSupplierOrderStatus,
  getLowStockSuggestions,
} from '../controllers/suppliers.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Suppliers
router.get('/', authenticate, requireAdmin, getSuppliers);
router.post('/', authenticate, requireAdmin, createSupplier);
router.put('/:id', authenticate, requireAdmin, updateSupplier);
router.delete('/:id', authenticate, requireAdmin, deleteSupplier);

// Supplier Orders
router.get('/orders', authenticate, requireAdmin, getSupplierOrders);
router.post('/orders', authenticate, requireAdmin, createSupplierOrder);
router.patch('/orders/:id/status', authenticate, requireAdmin, updateSupplierOrderStatus);
router.get('/orders/suggestions', authenticate, requireAdmin, getLowStockSuggestions);

export default router;
