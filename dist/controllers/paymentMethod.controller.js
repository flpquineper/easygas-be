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
exports.removePaymentMethod = exports.updatePaymentMethod = exports.listPaymentMethods = exports.createPaymentMethod = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createPaymentMethod = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { methodName } = req.body;
    try {
        const method = yield prisma.paymentMethod.create({
            data: { methodName }
        });
        res.status(201).json(method);
    }
    catch (error) {
        res.status(500).json({ erro: 'Erro ao criar método de pagamento.', detalhes: error });
    }
});
exports.createPaymentMethod = createPaymentMethod;
const listPaymentMethods = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const methods = yield prisma.paymentMethod.findMany();
        res.status(200).json(methods);
    }
    catch (error) {
        res.status(500).json({ erro: 'Erro ao listar métodos de pagamento.', detalhes: error });
    }
});
exports.listPaymentMethods = listPaymentMethods;
const updatePaymentMethod = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { methodName } = req.body;
    try {
        const updated = yield prisma.paymentMethod.update({
            where: { id: Number(id) },
            data: { methodName }
        });
        res.status(200).json(updated);
    }
    catch (error) {
        res.status(500).json({ erro: 'Erro ao atualizar método de pagamento.', detalhes: error });
    }
});
exports.updatePaymentMethod = updatePaymentMethod;
const removePaymentMethod = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield prisma.paymentMethod.delete({ where: { id: Number(id) } });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ erro: 'Erro ao remover método de pagamento.', detalhes: error });
    }
});
exports.removePaymentMethod = removePaymentMethod;
