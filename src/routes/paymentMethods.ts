import { Router } from 'express';
import {
  createPaymentMethod,
  listPaymentMethods,
  updatePaymentMethod,
  removePaymentMethod
} from '../controllers/paymentMethod.controller';
import { authMiddleware } from '../middlewares/auth';
import { isAdmin } from '../middlewares/isAdmin';

const router = Router();

router.get('/payment-methods', listPaymentMethods);

router.post('/payment-methods', authMiddleware, isAdmin, createPaymentMethod);
router.patch('/payment-methods/:id', authMiddleware, isAdmin, updatePaymentMethod);
router.delete('/payment-methods/:id', authMiddleware, isAdmin, removePaymentMethod);

export default router;