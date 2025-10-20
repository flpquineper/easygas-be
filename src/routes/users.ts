import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth';
import { isAdmin } from '../middlewares/isAdmin';

const router = Router();
const adminOnly = [authMiddleware, isAdmin];

// Rotas públicas
router.post('/register', userController.register); // rota cadastro 
router.post('/login', userController.login); // rota login


// Rota privada usuário
router.get('/profile', authMiddleware, userController.profile); // rota privada para visualização dos dados do usuário autenticada com middleware
router.patch('/:id', authMiddleware, userController.updateProfile)  // atualizar dados da conta do usuário

// Rotas privadas de admin
router.get('/', adminOnly, userController.listAllUsers); // listar usuários cadastrados
router.get('/:id', adminOnly, userController.getUserById); // listar usuário específico
router.patch('/:id', adminOnly, userController.updateUserByAdmin); // atualizar dados usuário específico
router.delete('/:id', adminOnly, userController.deleteUser); // excluir dados usuário


export default router;