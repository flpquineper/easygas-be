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
exports.deleteAdmin = exports.getAdminById = exports.listAdmins = exports.remove = exports.update = exports.profile = exports.login = exports.register = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_1 = __importDefault(require("../config/jwt"));
const prisma = new client_1.PrismaClient();
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    try {
        const existingAdmin = yield prisma.admin.findUnique({ where: { email } });
        if (existingAdmin) {
            res.status(400).json({ erro: 'Email já cadastrado para administrador.' });
            return;
        }
        const hashedPassword = bcrypt_1.default.hashSync(password, 10);
        const newAdmin = yield prisma.admin.create({
            data: { name, email, password: hashedPassword }
        });
        res.status(201).json({
            id: newAdmin.id,
            name: newAdmin.name,
            email: newAdmin.email
        });
    }
    catch (error) {
        res.status(500).json({ erro: 'Erro ao registrar administrador.', detalhes: error });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const mensagemPadrao = 'Email ou senha inválidos.';
    try {
        const admin = yield prisma.admin.findUnique({ where: { email } });
        if (!admin || typeof admin.password !== 'string' || !bcrypt_1.default.compareSync(password, admin.password)) {
            res.status(400).json({ erro: mensagemPadrao });
            return;
        }
        const token = jsonwebtoken_1.default.sign({
            id: admin.id,
            email: admin.email,
            role: 'admin'
        }, jwt_1.default, { expiresIn: '7d' });
        res.cookie('easygas.token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/',
            maxAge: 1000 * 60 * 60 * 24 * 7
        });
        res.status(200).json({
            admin: {
                id: admin.id,
                name: admin.name,
                email: admin.email
            }
        });
    }
    catch (error) {
        res.status(500).json({ erro: 'Erro ao fazer login de administrador.', detalhes: error });
    }
});
exports.login = login;
const profile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const adminId = req.user.id;
    if (!adminId) {
        res.status(401).json({ erro: 'Administrador não autenticado.' });
        return;
    }
    try {
        const admin = yield prisma.admin.findUnique({
            where: { id: adminId },
            select: { id: true, name: true, email: true }
        });
        if (!admin) {
            res.status(404).json({ erro: 'Administrador não encontrado.' });
            return;
        }
        res.status(200).json(admin);
    }
    catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar perfil do administrador.', detalhes: error });
    }
});
exports.profile = profile;
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { name, email } = req.body;
    try {
        const admin = yield prisma.admin.update({
            where: { id: adminId },
            data: { name, email }
        });
        res.status(200).json({ mensagem: 'Administrador atualizado com sucesso.', admin });
    }
    catch (error) {
        res.status(500).json({ erro: 'Erro ao atualizar administrador.', detalhes: error });
    }
});
exports.update = update;
const remove = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    try {
        yield prisma.admin.delete({ where: { id: adminId } });
        res.status(200).json({ mensagem: 'Administrador removido com sucesso.' });
    }
    catch (error) {
        res.status(500).json({ erro: 'Erro ao remover administrador.', detalhes: error });
    }
});
exports.remove = remove;
const listAdmins = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admins = yield prisma.admin.findMany({
            select: { id: true, name: true, email: true },
        });
        res.status(200).json(admins);
    }
    catch (error) {
        res.status(500).json({ erro: "Erro ao listar administradores." });
    }
});
exports.listAdmins = listAdmins;
const getAdminById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const admin = yield prisma.admin.findUnique({
            where: { id: Number(id) },
            select: { id: true, name: true, email: true },
        });
        if (!admin)
            return res.status(404).json({ erro: "Administrador não encontrado." });
        res.status(200).json(admin);
    }
    catch (error) {
        res.status(500).json({ erro: "Erro ao buscar administrador." });
    }
});
exports.getAdminById = getAdminById;
const deleteAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield prisma.admin.delete({ where: { id: Number(id) } });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ erro: "Erro ao remover administrador." });
    }
});
exports.deleteAdmin = deleteAdmin;
