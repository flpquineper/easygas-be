// Substitua o conteúdo de src/routes/orders.ts por este

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


router.get('/', authMiddleware, listOrders);
router.post('/', authMiddleware, createOrder); 

router.get('/:id', authMiddleware, getOrder);

router.patch('/:id/status', authMiddleware, isAdmin, updateOrderStatus); 
router.patch('/:id/cancel', authMiddleware, isAdmin, cancelOrder);    

export default router;