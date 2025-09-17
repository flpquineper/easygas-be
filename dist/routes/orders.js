"use strict";
// Substitua o conteúdo de src/routes/orders.ts por este
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("../controllers/order.controller");
const auth_1 = require("../middlewares/auth");
const isAdmin_1 = require("../middlewares/isAdmin");
const router = (0, express_1.Router)();
router.get('/', auth_1.authMiddleware, order_controller_1.listOrders);
router.post('/', auth_1.authMiddleware, order_controller_1.createOrder);
router.get('/:id', auth_1.authMiddleware, order_controller_1.getOrder);
router.patch('/:id/status', auth_1.authMiddleware, isAdmin_1.isAdmin, order_controller_1.updateOrderStatus);
router.patch('/:id/cancel', auth_1.authMiddleware, isAdmin_1.isAdmin, order_controller_1.cancelOrder);
exports.default = router;
