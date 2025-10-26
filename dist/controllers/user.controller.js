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
exports.deleteUser = exports.updateProfile = exports.updateUserByAdmin = exports.getUserById = exports.listAllUsers = exports.profile = exports.logout = exports.login = exports.register = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_1 = __importDefault(require("../config/jwt"));
const prisma = new client_1.PrismaClient();
const userPublicData = {
    id: true,
    name: true,
    email: true,
    cpf: true,
    phone: true,
    address: true,
    complementAddress: true,
    orders: true,
};
const userListSelect = {
    id: true,
    name: true,
    email: true,
    cpf: true,
    phone: true,
    address: true,
    complementAddress: true,
};
const userDetailSelect = Object.assign(Object.assign({}, userListSelect), { orders: {
        orderBy: {
            orderDate: 'desc',
        },
    } });
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, phone, cpf, address, complementAddress } = req.body;
    try {
        const existingUser = yield prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ erro: 'Email já cadastrado.' });
            return;
        }
        const existingPhone = yield prisma.user.findUnique({ where: { phone } });
        if (existingPhone) {
            res.status(400).json({ erro: 'Este telefone já está em uso.' });
            return;
        }
        const existingCpf = yield prisma.user.findUnique({ where: { cpf } });
        if (existingCpf) {
            res.status(400).json({ erro: 'Este CPF já está em uso.' });
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
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, jwt_1.default, { expiresIn: '7d' });
        res.cookie('easygas.token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/',
            maxAge: 1000 * 60 * 60 * 24 * 7
        });
        res.status(200).json({
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
const logout = (req, res) => {
    res.cookie('easygas.token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logout realizado com sucesso.' });
};
exports.logout = logout;
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
const listAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma.user.findMany({
            select: userPublicData,
        });
        res.status(200).json(users);
    }
    catch (error) {
        console.error("Erro ao listar usuários:", error);
        res.status(500).json({ erro: "Erro ao listar usuários." });
    }
});
exports.listAllUsers = listAllUsers;
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const user = yield prisma.user.findUnique({
            where: { id: Number(id) },
            select: userPublicData,
        });
        if (!user) {
            return res.status(404).json({ erro: "Usuário não encontrado" });
        }
        res.status(200).json(user);
    }
    catch (error) {
        console.error("Erro ao buscar usuário:", error);
        res.status(500).json({ erro: "Erro ao buscar usuário." });
    }
});
exports.getUserById = getUserById;
const updateUserByAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, email, password, cpf, address, phone, role } = req.body;
    const data = {};
    if (name)
        data.name = name;
    if (email)
        data.email = email;
    if (password) {
        data.password = bcrypt_1.default.hashSync(password, 10);
    }
    if (cpf)
        data.cpf = cpf;
    if (address)
        data.address = address;
    if (phone)
        data.phone = phone;
    try {
        const user = yield prisma.user.update({
            where: { id: Number(id) },
            data,
            select: userPublicData,
        });
        res.status(200).json(user);
    }
    catch (error) {
        console.error("Erro ao atualizar usuário:", error);
        res.status(500).json({ erro: "Erro ao atualizar usuário." });
    }
});
exports.updateUserByAdmin = updateUserByAdmin;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { name, email, password, cpf, address, phone } = req.body;
    const data = {};
    if (name)
        data.name = name;
    if (email)
        data.email = email;
    if (password) {
        data.password = bcrypt_1.default.hashSync(password, 10);
    }
    if (cpf)
        data.cpf = cpf;
    if (address)
        data.address = address;
    if (phone)
        data.phone = phone;
    try {
        const user = yield prisma.user.update({
            where: { id: userId },
            data,
            select: userPublicData, // <-- AJUSTE DE SEGURANÇA
        });
        res.status(200).json(user);
    }
    catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        res.status(500).json({ erro: "Erro ao atualizar perfil." });
    }
});
exports.updateProfile = updateProfile;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield prisma.user.delete({
            where: { id: Number(id) }
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(400).json(error);
    }
});
exports.deleteUser = deleteUser;
