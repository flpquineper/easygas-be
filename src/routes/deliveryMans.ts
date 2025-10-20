// src/routes/deliveryMans.ts
import { Router } from 'express';
import {
  registerDeliveryMan,
  loginDeliveryMan,
  profileDeliveryMan,
  listDeliveryMen,
  updateDeliveryMan,
  deleteDeliveryMan,
} from '../controllers/deliveryMan.controller';

import { authMiddleware } from '../middlewares/auth';
import { isAdmin } from '../middlewares/isAdmin';

const router = Router();
const adminOnly = [authMiddleware, isAdmin];


// ROTAS DE GERENCIAMENTO DE ENTREGADORES

// POST Cria um novo entregador
router.post('/deliverymen', adminOnly, registerDeliveryMan);

// GET Lista todos os entregadores
router.get('/deliverymen', adminOnly, listDeliveryMen);

// PATCH Atualiza um entregador
router.patch('/deliverymen/:id', adminOnly, updateDeliveryMan);

// DELETE Deleta um entregador
router.delete('/deliverymen/:id', adminOnly, deleteDeliveryMan);

// ROTAS DE AUTENTICAÇÃO
router.post('/deliverymen/login', loginDeliveryMan);
router.get('/deliverymen/profile', authMiddleware, profileDeliveryMan);


export default router;