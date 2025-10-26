import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authMiddleware } from '../middlewares/auth';
import { isAdmin } from '../middlewares/isAdmin';

const router = Router();
const adminOnly = [authMiddleware, isAdmin];

// POST /admins/register -> Cria um novo admin.
router.post('/register', adminController.register);

// POST /admins/login -> Autentica um admin e retorna um token.
router.post('/login', adminController.login);

// POST /admins/logout -> Encerra a sessão do admin.
router.post('/logout', adminController.logout);

// GET /admins/profile -> Retorna o perfil do admin LOGADO (baseado no token).
router.get('/profile', adminOnly, adminController.profile);

// GET /admins -> Lista todos os administradores (protegido).
router.get('/admins', adminOnly, adminController.listAdmins);

// GET /admins/:id -> Busca um administrador específico (protegido).
router.get('/admins/:id', adminOnly, adminController.getAdminById);

// DELETE /admins/:id -> Deleta um administrador (protegido).
router.delete('/admins/:id', adminOnly, adminController.deleteAdmin);


export default router;