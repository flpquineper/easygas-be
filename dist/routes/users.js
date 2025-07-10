"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const client_1 = require("@prisma/client");
const express_1 = require("express");
const userController = __importStar(require("../controllers/user.controller"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const auth_1 = require("../middlewares/auth");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
// Rotas públicas
router.post('/register', userController.register);
router.post('/login', userController.login);
// Rota privada
router.get('/profile', auth_1.authMiddleware, userController.profile); // rota privada autenticada com middleware
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma.user.findMany({
            include: {
                orders: true
            }
        });
        res.status(200).json(users);
    }
    catch (error) {
        res.status(400).json(error);
    }
}));
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const user = yield prisma.user.findUnique({
            where: { id: Number(id) },
            include: {
                orders: true
            }
        });
        if (user == null) {
            res.status(400).json({ erro: "Usuário não cadastrado" });
        }
        else {
            res.status(200).json({
                id: user.id,
                name: user.name,
                email: user.email,
                cpf: user.cpf,
                phone: user.phone,
                address: user.address,
                orders: user.orders
            });
        }
    }
    catch (error) {
        res.status(400).json(error);
    }
}));
router.patch("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, email, password, cpf, address, phone } = req.body;
    const data = {};
    if (name)
        data.name = name;
    if (email)
        data.email = email;
    if (password) {
        const salt = bcrypt_1.default.genSaltSync(12);
        data.password = bcrypt_1.default.hashSync(password, salt);
    }
    if (cpf)
        data.cpf = cpf;
    if (address)
        data.address = address;
    if (phone)
        data.phone = phone;
    if (Object.keys(data).length === 0) {
        res.status(400).json({ erro: "Informe ao menos um campo para atualizar" });
        return;
    }
    try {
        const user = yield prisma.user.update({
            where: { id: Number(id) },
            data
        });
        res.status(200).json(user);
    }
    catch (error) {
        res.status(400).json(error);
    }
}));
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const user = yield prisma.user.delete({
            where: { id: Number(id) }
        });
        res.status(200).json(user);
    }
    catch (error) {
        res.status(400).json(error);
    }
}));
router.get("/:id/orders", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const orders = yield prisma.order.findMany({
            where: { userId: Number(id) }
        });
        if (orders.length === 0) {
            res.status(400).json({ erro: "Nenhum pedido encontrado para este usuário" });
        }
        else {
            res.status(200).json(orders);
        }
    }
    catch (error) {
        res.status(400).json(error);
    }
}));
router.get("/pesquisa/:termo", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { termo } = req.params;
    const termoNumero = Number(termo);
    if (isNaN(termoNumero)) {
        try {
            const users = yield prisma.user.findMany({
                where: {
                    OR: [
                        { name: { contains: termo } },
                    ]
                }
            });
            res.status(200).json(users);
        }
        catch (error) {
            res.status(400).json(error);
        }
    }
}));
exports.default = router;
