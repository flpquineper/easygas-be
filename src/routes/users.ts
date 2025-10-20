import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth';
import { isAdmin } from '../middlewares/isAdmin';


const prisma = new PrismaClient();
const router = Router();
const adminOnly = [authMiddleware, isAdmin];

// Rotas públicas
router.post('/register', userController.register);
router.post('/login', userController.login);
// Rotas privada usuário
router.get('/profile', authMiddleware, userController.profile); // rota privada para visualizar o perfil do usuário autenticado
router.patch('/profile', authMiddleware, userController.updateProfile); // rota privada para atualizar o perfil do usuário autenticado

//Rotas Privadas de Admin 
router.get('/', adminOnly, userController.listAllUsers); // Listar todos os usuários
router.get('/:id', adminOnly, userController.getUserById); // Obter um usuário por ID
router.patch('/:id', adminOnly, userController.updateUser); // Atualizar um usuário
router.delete('/:id', adminOnly, userController.deleteUser); // Deletar um usuário
router.get('/:id/orders', adminOnly, userController.listUserOrders); // Listar pedidos de um usuário específico



export default router;