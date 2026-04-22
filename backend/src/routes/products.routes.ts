import { Router } from 'express';
import {
  getProducts,
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
} from '../controllers/products.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', getProducts);
router.get('/admin/all', authenticate, requireAdmin, getAllProducts);
router.get('/admin/low-stock', authenticate, requireAdmin, getLowStockProducts);
router.get('/:id', getProduct);
router.post('/', authenticate, requireAdmin, createProduct);
router.put('/:id', authenticate, requireAdmin, updateProduct);
router.delete('/:id', authenticate, requireAdmin, deleteProduct);

export default router;
