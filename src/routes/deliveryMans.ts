import { Router } from 'express';
import {
  registerDeliveryMan,
  loginDeliveryMan,
  profileDeliveryMan,
  listDeliveryMen,
  getDeliveryManById,
  updateDeliveryMan,
  deleteDeliveryMan
} from '../controllers/deliveryMan.controller';
import { authMiddleware } from '../middlewares/auth';
import { isAdmin } from '../middlewares/isAdmin';

const router = Router();
const adminOnly = [authMiddleware, isAdmin];

// Rotas públicas
router.post('/deliveryman/login', loginDeliveryMan);

// Rota privada entregador
router.get('/deliveryman/profile', authMiddleware, profileDeliveryMan);


// Rotas privadas admin
router.post('/deliveryman/register', adminOnly, registerDeliveryMan);
router.get('/deliverymen', adminOnly, listDeliveryMen);
router.get('/deliverymen/:id', adminOnly, getDeliveryManById);
router.put('/deliverymen/:id', adminOnly, updateDeliveryMan);
router.delete('/deliverymen/:id', adminOnly, deleteDeliveryMan);

export default router;