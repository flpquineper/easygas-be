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
exports.listStatuses = listStatuses;
exports.createStatus = createStatus;
exports.updateStatus = updateStatus;
exports.deleteStatus = deleteStatus;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function listStatuses(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const statuses = yield prisma.orderStatus.findMany();
        res.json(statuses);
    });
}
function createStatus(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { statusName } = req.body;
        const status = yield prisma.orderStatus.create({
            data: { statusName }
        });
        res.status(201).json(status);
    });
}
function updateStatus(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { statusName } = req.body;
        const { id } = req.params;
        const status = yield prisma.orderStatus.update({
            where: { id: Number(id) },
            data: { statusName }
        });
        res.json(status);
    });
}
function deleteStatus(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = req.params;
        const statusId = Number(id);
        // Verifica se o status está sendo usado em algum pedido
        const ordersCount = yield prisma.order.count({ where: { statusId } });
        if (ordersCount > 0) {
            return res.status(400).json({ error: 'Não é possível deletar um status em uso.' });
        }
        // Faz o delete e responde!
        yield prisma.orderStatus.delete({ where: { id: statusId } });
        return res.status(204).send();
    });
}
