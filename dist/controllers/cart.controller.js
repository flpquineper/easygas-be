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
exports.addItemToUserCart = exports.clearUserCart = exports.clearCart = exports.removeItem = exports.updateItem = exports.addItem = exports.getCart = exports.createCart = exports.associateUser = exports.getUserCart = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getUserCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).json({ error: "Usuário não autenticado." });
    }
    const userId = req.user.id;
    try {
        let cart = yield prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: { product: true },
                    orderBy: { id: "asc" },
                },
            },
        });
        if (!cart) {
            cart = yield prisma.cart.create({
                data: { userId },
                include: {
                    items: {
                        include: { product: true },
                        orderBy: { id: "asc" },
                    },
                },
            });
        }
        return res.status(200).json(cart);
    }
    catch (error) {
        console.error("Erro ao buscar o carrinho do usuário:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
});
exports.getUserCart = getUserCart;
const associateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).json({ error: "Usuário não autenticado." });
    }
    const userId = req.user.id;
    const anonymousCartId = parseInt(req.params.cartId, 10);
    if (isNaN(anonymousCartId)) {
        return res.status(400).json({ error: "ID de carrinho inválido." });
    }
    try {
        const userCart = yield prisma.cart.findUnique({ where: { userId } });
        const anonymousCart = yield prisma.cart.findUnique({
            where: { id: anonymousCartId },
            include: { items: true },
        });
        if (!anonymousCart || anonymousCart.userId) {
            return res.status(404).json({ error: "Carrinho de visitante não encontrado ou já associado." });
        }
        if (!userCart) {
            yield prisma.cart.update({
                where: { id: anonymousCartId },
                data: { userId: userId },
            });
            return res.status(200).json({ message: "Carrinho associado com sucesso." });
        }
        if (anonymousCart.items.length > 0) {
            yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
                for (const item of anonymousCart.items) {
                    yield tx.cartItem.upsert({
                        where: { cartId_productId: { cartId: userCart.id, productId: item.productId } },
                        update: { quantity: { increment: item.quantity } },
                        create: { cartId: userCart.id, productId: item.productId, quantity: item.quantity },
                    });
                }
                yield tx.cart.delete({ where: { id: anonymousCartId } });
            }));
        }
        else {
            yield prisma.cart.delete({ where: { id: anonymousCartId } });
        }
        res.status(200).json({ message: "Carrinhos fundidos com sucesso." });
    }
    catch (error) {
        res.status(500).json({ error: "Erro ao associar/fundir carrinhos." });
    }
});
exports.associateUser = associateUser;
const createCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cart = yield prisma.cart.create({ data: {} });
        res.status(201).json({ id: cart.id });
    }
    catch (error) {
        res.status(500).json({ error: "Erro ao criar carrinho." });
    }
});
exports.createCart = createCart;
const getCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cartId = parseInt(req.params.cartId, 10);
        const cart = yield prisma.cart.findUnique({
            where: { id: cartId },
            include: { items: { include: { product: true } } }
        });
        if (!cart)
            return res.status(404).json({ error: "Carrinho não encontrado" });
        res.json(cart);
    }
    catch (error) {
        res.status(500).json({ error: "Erro ao buscar carrinho" });
    }
});
exports.getCart = getCart;
const addItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cartId = parseInt(req.params.cartId, 10);
        const { productId, quantity } = req.body;
        const item = yield prisma.cartItem.upsert({
            where: { cartId_productId: { cartId, productId } },
            update: { quantity: { increment: quantity } },
            create: { cartId, productId, quantity }
        });
        res.status(201).json(item);
    }
    catch (error) {
        res.status(500).json({ error: "Erro ao adicionar item" });
    }
});
exports.addItem = addItem;
const updateItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const itemId = parseInt(req.params.itemId, 10);
        const { quantity } = req.body;
        if (quantity <= 0) {
            yield prisma.cartItem.delete({ where: { id: itemId } });
            return res.status(204).send();
        }
        const item = yield prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity }
        });
        res.json(item);
    }
    catch (error) {
        res.status(500).json({ error: "Erro ao atualizar item" });
    }
});
exports.updateItem = updateItem;
const removeItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const itemId = parseInt(req.params.itemId, 10);
        yield prisma.cartItem.delete({ where: { id: itemId } });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: "Erro ao remover item" });
    }
});
exports.removeItem = removeItem;
const clearCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cartId = parseInt(req.params.cartId, 10);
        yield prisma.cartItem.deleteMany({ where: { cartId } });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: "Erro ao limpar carrinho" });
    }
});
exports.clearCart = clearCart;
const clearUserCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user)
        return res.status(401).json({ error: "Não autenticado" });
    const userId = req.user.id;
    try {
        const cart = yield prisma.cart.findUnique({ where: { userId } });
        if (cart) {
            yield prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
        }
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: "Erro ao limpar o carrinho do usuário." });
    }
});
exports.clearUserCart = clearUserCart;
const addItemToUserCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user)
        return res.status(401).json({ error: "Não autenticado" });
    const { productId, quantity } = req.body;
    const userId = req.user.id;
    try {
        const cart = yield prisma.cart.upsert({
            where: { userId },
            update: {},
            create: { userId },
        });
        const item = yield prisma.cartItem.upsert({
            where: { cartId_productId: { cartId: cart.id, productId } },
            update: { quantity: { increment: quantity } },
            create: { cartId: cart.id, productId, quantity }
        });
        res.status(201).json(item);
    }
    catch (error) {
        console.error("Erro ao adicionar item ao carrinho do usuário:", error);
        res.status(500).json({ error: "Erro ao adicionar item ao carrinho do usuário." });
    }
});
exports.addItemToUserCart = addItemToUserCart;
