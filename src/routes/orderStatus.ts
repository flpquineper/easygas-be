import { Router } from 'express';
import { 
  listStatuses, 
  createStatus, 
  updateStatus, 
  deleteStatus 
} from '../controllers/orderStatus.controller';
import { authMiddleware } from '../middlewares/auth';
import { isAdmin } from '../middlewares/isAdmin';

const router = Router();

// Listar todos os status (para exibir em selects, etc)
router.get('/', authMiddleware, isAdmin, listStatuses);

// Criar novo status
router.post('/', authMiddleware, isAdmin, createStatus);

// Editar status existente
router.put('/:id', authMiddleware, isAdmin, updateStatus);

// Deletar status (cuidado! só permita se não está em uso)
router.delete('/:id', authMiddleware, isAdmin, deleteStatus);

export default router;
