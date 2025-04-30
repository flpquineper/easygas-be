import multer from 'multer';
import crypto from 'crypto';
import path from 'path';

export const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/', // pasta raiz do projeto
    filename: (req, file, cb) => {
      const hash = crypto.randomBytes(16).toString('hex');
      const ext = path.extname(file.originalname);
      cb(null, `${hash}${ext}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Formato de imagem inválido.'));
  },
  limits: {
    fileSize: 5 * 1024 * 1024 
  }
});