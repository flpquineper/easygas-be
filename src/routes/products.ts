import { Router } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import { createProduct, deleteProduct, listProducts, updateProduct } from '../controllers/product.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', 'uploads'),
  filename: (req, file, cb) => {
    const hash = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${hash}${ext}`);
  }
});

const upload = multer({ storage });

router.post('/', authMiddleware, upload.single('image'), createProduct);
router.get('/', listProducts);
router.put('/:id', authMiddleware, updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);

export default router;
