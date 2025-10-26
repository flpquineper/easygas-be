"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("../controllers/order.controller");
const auth_1 = require("../middlewares/auth");
const isAdmin_1 = require("../middlewares/isAdmin");
const router = (0, express_1.Router)();
const adminOnly = [auth_1.authMiddleware, isAdmin_1.isAdmin];
// rotas privadas admin
router.get('/all', adminOnly, order_controller_1.listAllOrders);
router.patch('/:id/status', adminOnly, order_controller_1.updateOrderStatus);
router.patch('/:id/cancel', adminOnly, order_controller_1.cancelOrder);
router.patch('/:id/assign-delivery', adminOnly, order_controller_1.assignDeliveryMan);
// rotas privadas user
router.get('/', auth_1.authMiddleware, order_controller_1.listOrders);
router.post('/', auth_1.authMiddleware, order_controller_1.createOrder);
router.get('/:id', auth_1.authMiddleware, order_controller_1.getOrder);
exports.default = router;
