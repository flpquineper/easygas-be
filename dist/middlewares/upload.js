"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const crypto_1 = __importDefault(require("crypto"));
const path_1 = __importDefault(require("path"));
exports.upload = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: 'uploads/', // pasta raiz do projeto
        filename: (req, file, cb) => {
            const hash = crypto_1.default.randomBytes(16).toString('hex');
            const ext = path_1.default.extname(file.originalname);
            cb(null, `${hash}${ext}`);
        }
    }),
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowed.includes(file.mimetype))
            cb(null, true);
        else
            cb(new Error('Formato de imagem inválido.'));
    },
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});
