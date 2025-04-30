import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// Rotas Públicas
router.post('/register', adminController.register);
router.post('/login', adminController.login);

// Rotas privadas
router.get('/profile', authenticateToken, adminController.profile);
router.get('/profile', authenticateToken, adminController.profile);
router.put('/profile', authenticateToken, adminController.update);
router.delete('/profile', authenticateToken, adminController.remove);



export default router;