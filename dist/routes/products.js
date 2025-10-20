"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const crypto_1 = __importDefault(require("crypto"));
const path_1 = __importDefault(require("path"));
const product_controller_1 = require("../controllers/product.controller");
const auth_1 = require("../middlewares/auth");
const isAdmin_1 = require("../middlewares/isAdmin");
const router = (0, express_1.Router)();
const adminOnly = [auth_1.authMiddleware, isAdmin_1.isAdmin];
// Aqui estamos configurando o multer para salvar arquivos em disco, utilizando o crypto.randomBytes
const storage = multer_1.default.diskStorage({
    destination: path_1.default.join(__dirname, '..', '..', 'uploads'),
    filename: (req, file, cb) => {
        const hash = crypto_1.default.randomBytes(8).toString('hex');
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${hash}${ext}`);
    }
});
const upload = (0, multer_1.default)({ storage });
// Rotas públicas
router.get('/', product_controller_1.listProducts);
// Rota protegidas 
router.get('/:id', adminOnly, product_controller_1.getProductById);
router.post('/', adminOnly, upload.single('image'), product_controller_1.createProduct);
router.put('/:id', adminOnly, product_controller_1.updateProduct);
router.delete('/:id', adminOnly, isAdmin_1.isAdmin, product_controller_1.deleteProduct);
exports.default = router;
