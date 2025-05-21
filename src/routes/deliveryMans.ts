import { Router } from 'express';
import {
  registerDeliveryMan,
  loginDeliveryMan,
  profileDeliveryMan,
} from '../controllers/deliveryMan.controller';

import { authMiddleware } from '../middlewares/auth';
import { isAdmin } from '../middlewares/isAdmin';

const router = Router();

router.post('/deliveryman/register', authMiddleware, isAdmin, registerDeliveryMan);
router.post('/deliveryman/login', loginDeliveryMan);
router.get('/deliveryman/profile', authMiddleware, profileDeliveryMan);

export default router;