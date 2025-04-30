import { Router } from 'express';
import {
  createOrder,
  listOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder
} from '../controllers/order.controller';
import { authMiddleware } from '../middlewares/auth';
import { isAdmin } from '../middlewares/isAdmin';

const router = Router();

router.post('/orders', authMiddleware, createOrder);
router.get('/orders', authMiddleware, listOrders); 
router.get('/orders/:id', authMiddleware, getOrder);


router.patch('/orders/:id/status', authMiddleware, isAdmin, updateOrderStatus); 
router.patch('/orders/:id/cancel', authMiddleware, isAdmin, cancelOrder);    

export default router;
