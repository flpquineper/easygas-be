import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();


router.post('/register', adminController.register);
router.post('/login', adminController.login);


router.get('/profile', authMiddleware, adminController.profile);
router.put('/profile', authMiddleware, adminController.update);
router.delete('/profile', authMiddleware, adminController.remove);



export default router;