import { Router } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import { 
  createProduct, 
  deleteProduct, 
  listProducts, 
  updateProduct,
  getProductById 
} from '../controllers/product.controller';
import { authMiddleware } from '../middlewares/auth';
import { isAdmin } from '../middlewares/isAdmin'; 

const router = Router();
const adminOnly = [authMiddleware, isAdmin];

const storage = multer.diskStorage({
  destination: path.join(__dirname,'uploads'),
  filename: (req, file, cb) => {
    const hash = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${hash}${ext}`);
  }
});

const upload = multer({ storage });

// Rotas públicas
router.get('/', listProducts);

// Rotas privadas para admins
router.post('/products', adminOnly, upload.single('image'), createProduct);
router.put('/:id', adminOnly, updateProduct);
router.delete('/:id', adminOnly, deleteProduct);
router.get('/:id', adminOnly, getProductById);

export default router;
