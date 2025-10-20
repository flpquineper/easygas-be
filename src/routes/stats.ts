// src/routes/stats.ts
import { Router } from 'express';
import * as statsController from '../controllers/stats.controller';
import { authMiddleware } from '../middlewares/auth';
import {  isAdmin } from '../middlewares/isAdmin'; 

const router = Router();

router.get(
  '/stats/order-summary',
  authMiddleware,
  isAdmin,
  statsController.getOrderSummary
);

export default router;