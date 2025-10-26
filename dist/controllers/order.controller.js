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
exports.assignDeliveryMan = exports.listAllOrders = exports.cancelOrder = exports.updateOrderStatus = exports.getOrder = exports.listOrders = exports.createOrder = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado.' });
        return;
    }
    const userId = req.user.id;
    const { address, complementAddress, paymentMethodId, items, scheduledAt } = req.body;
    if (!address || !paymentMethodId || !items || !Array.isArray(items) || items.length === 0) {
        res.status(400).json({ erro: 'Dados do pedido incompletos.' });
        return;
    }
    try {
        const newOrder = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const fullAddressForNote = `${address}${complementAddress ? ` - ${complementAddress}` : ''}`;
            const order = yield tx.order.create({
                data: {
                    userId,
                    paymentMethodId,
                    statusId: 1,
                    orderNote: fullAddressForNote,
                    deliveryTime: scheduledAt ? new Date(scheduledAt) : null,
                    statusHistory: {
                        create: {
                            statusId: 1,
                        },
                    },
                },
            });
            yield tx.orderItem.createMany({
                data: items.map((item) => ({
                    orderId: order.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                })),
            });
            const userCart = yield tx.cart.findUnique({ where: { userId } });
            if (userCart) {
                yield tx.cartItem.deleteMany({ where: { cartId: userCart.id } });
            }
            const completeOrder = yield tx.order.findUnique({
                where: { id: order.id },
                include: {
                    user: { select: { name: true } },
                    paymentMethod: { select: { methodName: true } },
                    items: { include: { product: { select: { name: true } } } },
                },
            });
            if (!completeOrder) {
                throw new Error("Falha ao buscar o pedido recém-criado para retorno.");
            }
            const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            return Object.assign(Object.assign({}, completeOrder), { total });
        }));
        res.status(201).json(newOrder);
    }
    catch (error) {
        console.error("Erro ao criar pedido:", error);
        res.status(500).json({ erro: 'Erro ao criar pedido.', detalhes: error.message });
    }
});
exports.createOrder = createOrder;
const listOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const orders = yield prisma.order.findMany({
            where: { userId },
            include: {
                items: { include: { product: true } },
                paymentMethod: true,
                status: true,
            },
            orderBy: { orderDate: 'desc' }
        });
        res.status(200).json(orders);
    }
    catch (error) {
        res.status(500).json({
            erro: 'Erro ao listar todos os pedidos.',
            detalhes: error.message
        });
    }
});
exports.listOrders = listOrders;
const getOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const user = req.user;
    try {
        const order = yield prisma.order.findUnique({
            where: { id: Number(id) },
            include: {
                items: { include: { product: true } },
                paymentMethod: true,
                status: true,
                user: {
                    select: {
                        name: true,
                        phone: true,
                        address: true,
                        complementAddress: true
                    }
                },
                deliveryMan: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
        });
        if (!order) {
            res.status(404).json({ erro: 'Pedido não encontrado.' });
            return;
        }
        if (user.role !== 'admin' && order.userId !== userId) {
            res.status(403).json({ erro: 'Acesso negado. Este pedido não pertence a você.' });
            return;
        }
        res.status(200).json(order);
    }
    catch (error) {
        res.status(500).json({
            erro: 'Erro ao listar todos os pedidos.',
            detalhes: error.message
        });
    }
});
exports.getOrder = getOrder;
const updateOrderStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { statusId } = req.body;
    try {
        const order = yield prisma.order.update({
            where: { id: Number(id) },
            data: {
                statusId,
                statusHistory: { create: { statusId } },
            },
        });
        res.status(200).json({ mensagem: 'Status atualizado com sucesso.', order });
    }
    catch (error) {
        res.status(500).json({
            erro: 'Erro ao listar todos os pedidos.',
            detalhes: error.message
        });
    }
});
exports.updateOrderStatus = updateOrderStatus;
const cancelOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const order = yield prisma.order.findUnique({
            where: { id: Number(id) },
            include: { status: true }
        });
        if (!order) {
            res.status(404).json({ erro: 'Pedido não encontrado.' });
            return;
        }
        if (order.status && order.status.statusName.toLowerCase() === 'entregue') {
            res.status(400).json({ erro: 'Pedido já entregue, não pode ser cancelado.' });
            return;
        }
        const cancelStatus = yield prisma.orderStatus.findFirst({
            where: { statusName: 'Cancelado' }
        });
        if (!cancelStatus) {
            res.status(400).json({ erro: 'Status "Cancelado" não está cadastrado.' });
            return;
        }
        const updated = yield prisma.order.update({
            where: { id: Number(id) },
            data: {
                statusId: cancelStatus.id,
                statusHistory: { create: { statusId: cancelStatus.id } },
            },
        });
        res.status(200).json({ mensagem: 'Pedido cancelado com sucesso.', pedido: updated });
    }
    catch (error) {
        res.status(500).json({
            erro: 'Erro ao listar todos os pedidos.',
            detalhes: error.message
        });
    }
});
exports.cancelOrder = cancelOrder;
const listAllOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield prisma.order.findMany({
            include: {
                user: { select: { name: true, phone: true } }, // É útil para o admin ver o nome do cliente
                items: { include: { product: true } },
                paymentMethod: true,
                status: true,
            },
            orderBy: { orderDate: 'desc' }
        });
        res.status(200).json(orders);
    }
    catch (error) {
        res.status(500).json({
            erro: 'Erro ao listar todos os pedidos.',
            detalhes: error.message
        });
    }
});
exports.listAllOrders = listAllOrders;
const assignDeliveryMan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { deliveryManId } = req.body;
    const deliveryId = deliveryManId ? Number(deliveryManId) : null;
    try {
        const updatedOrder = yield prisma.order.update({
            where: { id: Number(id) },
            data: {
                deliveryManId: deliveryId,
            },
        });
        res.status(200).json({ mensagem: 'Entregador atribuído com sucesso.', order: updatedOrder });
    }
    catch (error) {
        res.status(500).json({ erro: 'Erro ao atribuir entregador.', detalhes: error.message });
    }
});
exports.assignDeliveryMan = assignDeliveryMan;
