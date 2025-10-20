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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductById = exports.deleteProduct = exports.updateProduct = exports.listProducts = exports.createProduct = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, price } = req.body;
        const image = (_a = req.file) === null || _a === void 0 ? void 0 : _a.filename;
        if (!name || !price || !image) {
            res.status(400).json({ error: 'Nome, preço e imagem são obrigatórios.' });
            return;
        }
        const product = yield prisma.product.create({
            data: {
                name,
                price,
                image
            }
        });
        res.status(201).json(product);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao criar produto.' });
    }
});
exports.createProduct = createProduct;
const listProducts = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield prisma.product.findMany();
        res.status(200).json(products);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao listar produtos.' });
    }
});
exports.listProducts = listProducts;
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, price } = req.body;
        const updated = yield prisma.product.update({
            where: { id: Number(id) },
            data: { name, price }
        });
        res.status(200).json(updated);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar produto.' });
    }
});
exports.updateProduct = updateProduct;
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma.product.delete({
            where: { id: Number(id) }
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao deletar produto.' });
    }
});
exports.deleteProduct = deleteProduct;
const getProductById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const product = yield prisma.product.findUnique({
            where: { id: Number(id) },
        });
        if (!product) {
            res.status(404).json({ error: 'Produto não encontrado.' });
            return;
        }
        res.status(200).json(product);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao buscar produto.' });
    }
});
exports.getProductById = getProductById;
