import { Router } from 'express';
import {
  createOrder,
  listOrders,
  listAllOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  assignDeliveryMan,
} from '../controllers/order.controller';
import { authMiddleware } from '../middlewares/auth';
import { isAdmin } from '../middlewares/isAdmin';

const router = Router();
const adminOnly = [authMiddleware, isAdmin];


// rotas privadas admin
router.get('/all', adminOnly, listAllOrders);
router.patch('/:id/status', adminOnly, updateOrderStatus); 
router.patch('/:id/cancel', adminOnly, cancelOrder);
router.patch('/:id/assign-delivery', adminOnly, assignDeliveryMan);    

// rotas privadas user
router.get('/', authMiddleware, listOrders);
router.post('/', authMiddleware, createOrder); 
router.get('/:id', authMiddleware, getOrder);


export default router;