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
const router = (0, express_1.Router)();
const storage = multer_1.default.diskStorage({
    destination: path_1.default.join(__dirname, 'uploads'),
    filename: (req, file, cb) => {
        const hash = crypto_1.default.randomBytes(8).toString('hex');
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${hash}${ext}`);
    }
});
const upload = (0, multer_1.default)({ storage });
router.post('/', auth_1.authMiddleware, upload.single('image'), product_controller_1.createProduct);
router.get('/', product_controller_1.listProducts);
router.put('/:id', auth_1.authMiddleware, product_controller_1.updateProduct);
router.delete('/:id', auth_1.authMiddleware, product_controller_1.deleteProduct);
exports.default = router;
