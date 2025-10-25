"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'easygas_secret_key';
const authMiddleware = (req, res, next) => {
    const { 'easygas.token': token } = req.cookies;
    if (!token) {
        res.status(401).json({ erro: 'Token de acesso não fornecido.' });
        return;
    }
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            res.status(403).json({ erro: 'Token inválido ou expirado.' });
            return;
        }
        if (typeof decoded !== 'object' || !decoded) {
            res.status(403).json({ erro: 'Formato de token inválido.' });
            return;
        }
        req.user = decoded;
        next();
    });
};
exports.authMiddleware = authMiddleware;
