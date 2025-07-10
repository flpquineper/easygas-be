"use strict";
// Substitua todo o seu arquivo por este código
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.profile = exports.login = exports.register = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'easygas_secret_key';
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, phone, cpf, address, complementAddress } = req.body;
    try {
        const existingUser = yield prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ erro: 'Email já cadastrado.' });
            return;
        }
        const hashedPassword = bcrypt_1.default.hashSync(password, 10);
        const newUser = yield prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone,
                cpf,
                address,
                complementAddress,
            }
        });
        res.status(201).json({ id: newUser.id, name: newUser.name, email: newUser.email });
    }
    catch (error) {
        console.error("Erro no registro:", error);
        res.status(500).json({ erro: 'Erro ao registrar usuário.' });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const mensagemPadrao = 'Email ou senha incorretos.';
    try {
        const user = yield prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) {
            res.status(400).json({ erro: mensagemPadrao });
            return;
        }
        const senhaValida = bcrypt_1.default.compareSync(password, user.password);
        if (!senhaValida) {
            res.status(400).json({ erro: mensagemPadrao });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                complementAddress: user.complementAddress,
            }
        });
    }
    catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({ erro: 'Erro ao fazer login.' });
    }
});
exports.login = login;
const profile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ erro: 'Usuário não autenticado.' });
            return;
        }
        const user = yield prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                cpf: true,
                phone: true,
                address: true,
                complementAddress: true
            }
        });
        if (!user) {
            res.status(404).json({ erro: 'Usuário não encontrado.' });
            return;
        }
        res.status(200).json(user);
    }
    catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar perfil.' });
    }
});
exports.profile = profile;
