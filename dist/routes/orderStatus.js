"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderStatus_controller_1 = require("../controllers/orderStatus.controller");
const auth_1 = require("../middlewares/auth");
const isAdmin_1 = require("../middlewares/isAdmin");
const router = (0, express_1.Router)();
// Listar todos os status (para exibir em selects, etc)
router.get('/', auth_1.authMiddleware, isAdmin_1.isAdmin, orderStatus_controller_1.listStatuses);
// Criar novo status
router.post('/', auth_1.authMiddleware, isAdmin_1.isAdmin, orderStatus_controller_1.createStatus);
// Editar status existente
router.put('/:id', auth_1.authMiddleware, isAdmin_1.isAdmin, orderStatus_controller_1.updateStatus);
// Deletar status (cuidado! só permita se não está em uso)
router.delete('/:id', auth_1.authMiddleware, isAdmin_1.isAdmin, orderStatus_controller_1.deleteStatus);
exports.default = router;
