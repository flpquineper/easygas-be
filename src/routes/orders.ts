import { Router } from 'express';
import {
  createOrder,
  listOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  listAllOrders
} from '../controllers/order.controller';
import { authMiddleware } from '../middlewares/auth';
import { isAdmin } from '../middlewares/isAdmin';

const router = Router();
const adminOnly = [authMiddleware, isAdmin];

// Rotas usuários
router.get('/', authMiddleware, listOrders);
router.post('/', authMiddleware, createOrder); 

router.get('/:id', authMiddleware, getOrder);

// Rotas admin
router.get('/orders/all', adminOnly, listAllOrders);
router.patch('/:id/status', authMiddleware, isAdmin, updateOrderStatus);
router.patch('/:id/cancel', authMiddleware, isAdmin, cancelOrder);

export default router;