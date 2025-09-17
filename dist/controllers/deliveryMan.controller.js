"use strict";
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
exports.profileDeliveryMan = exports.loginDeliveryMan = exports.registerDeliveryMan = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'easygas_secret_key';
const registerDeliveryMan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    try {
        const existingDeliveryMan = yield prisma.deliveryMan.findUnique({ where: { email } });
        if (existingDeliveryMan) {
            res.status(400).json({ erro: 'Email já cadastrado para entregador.' });
            return;
        }
        const hashedPassword = bcrypt_1.default.hashSync(password, 10);
        const deliveryMan = yield prisma.deliveryMan.create({
            data: { name, email, password: hashedPassword }
        });
        res.status(201).json({ id: deliveryMan.id, name: deliveryMan.name, email: deliveryMan.email });
    }
    catch (error) {
        res.status(500).json({ erro: 'Erro ao registrar entregador.', detalhes: error });
    }
});
exports.registerDeliveryMan = registerDeliveryMan;
const loginDeliveryMan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const mensagemPadrao = 'Email ou senha inválidos.';
    try {
        const deliveryMan = yield prisma.deliveryMan.findUnique({ where: { email } });
        if (!deliveryMan || typeof deliveryMan.password !== 'string' || !bcrypt_1.default.compareSync(password, deliveryMan.password)) {
            res.status(400).json({ erro: mensagemPadrao });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: deliveryMan.id, email: deliveryMan.email, role: 'delivery' }, JWT_SECRET, {
            expiresIn: '7d'
        });
        res.status(200).json({
            token,
            deliveryMan: {
                id: deliveryMan.id,
                name: deliveryMan.name,
                email: deliveryMan.email
            }
        });
    }
    catch (error) {
        res.status(500).json({ erro: 'Erro ao fazer login de entregador.', detalhes: error });
    }
});
exports.loginDeliveryMan = loginDeliveryMan;
const profileDeliveryMan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const deliveryManId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!deliveryManId) {
            res.status(401).json({ erro: 'Entregador não autenticado.' });
            return;
        }
        const deliveryMan = yield prisma.deliveryMan.findUnique({
            where: { id: deliveryManId },
            select: { id: true, name: true, email: true }
        });
        if (!deliveryMan) {
            res.status(404).json({ erro: 'Entregador não encontrado.' });
            return;
        }
        res.status(200).json(deliveryMan);
    }
    catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar perfil do entregador.', detalhes: error });
    }
});
exports.profileDeliveryMan = profileDeliveryMan;
