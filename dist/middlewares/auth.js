"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_1 = __importDefault(require("../config/jwt"));
const authMiddleware = (req, res, next) => {
    console.log('--- authMiddleware EXECUTADO ---');
    console.log('Cookies recebidos:', req.cookies); // Log 1
    const { 'easygas.token': token } = req.cookies;
    console.log('Token extraído:', token); // Log 2
    if (!token) {
        console.log('>> ERRO: Token não encontrado nos cookies.'); // Log 3
        res.status(401).json({ erro: 'Token de acesso não fornecido.' });
        return;
    }
    jsonwebtoken_1.default.verify(token, jwt_1.default, (err, decoded) => {
        if (err) {
            console.log('>> ERRO: Falha na verificação do JWT:', err.message); // Log 4
            res.status(403).json({ erro: 'Token inválido ou expirado.' });
            return;
        }
        if (typeof decoded !== 'object' || !decoded) {
            console.log('>> ERRO: Payload decodificado não é um objeto:', decoded); // Log 5
            res.status(403).json({ erro: 'Formato de token inválido.' });
            return;
        }
        console.log('>> SUCESSO: Token verificado. Payload:', decoded); // Log 6
        req.user = decoded;
        next();
    });
};
exports.authMiddleware = authMiddleware;
