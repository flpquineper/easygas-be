import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import * as cartController from '../controllers/cart.controller';


const router = Router();

router.post('/cart/add', authMiddleware, cartController.addToCart);          
router.get('/cart', authMiddleware, cartController.getCart);                  
router.patch('/cart/item/:id', authMiddleware, cartController.updateItem);    
router.delete('/cart/item/:id', authMiddleware, cartController.removeItem);   


export default router;