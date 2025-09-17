import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
const prisma = new PrismaClient();
router.get("/admins", async (req, res) => {
  try {
    const users = await prisma.admin.findMany({
    })
    res.status(200).json(users)
  } catch (error) {
    res.status(400).json(error)
  }
})

router.post('/register', adminController.register);
router.post('/login', adminController.login);

router.get('/profile/listing/:id', authMiddleware, adminController.profile);
router.put('/profile/update/:id', authMiddleware, adminController.update);
router.delete('/profile/delete/:id', authMiddleware, adminController.remove);



export default router;