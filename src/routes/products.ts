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

// Aqui estamos configurando o multer para salvar arquivos em disco, utilizando o crypto.randomBytes
const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', 'uploads'),
  filename: (req, file, cb) => {
    const hash = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${hash}${ext}`);
  }
});

const upload = multer({ storage });
const adminOnly = [authMiddleware, isAdmin];

// Rotas públicas
router.get('/', listProducts)

// Rota protegidas 
router.get('/:id', adminOnly, getProductById);
router.post('/', adminOnly, upload.single('image'), createProduct);
router.put('/:id', adminOnly,  updateProduct);
router.delete('/:id', adminOnly, isAdmin, deleteProduct);

export default router;
