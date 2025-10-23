"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/deliveryMans.ts
const express_1 = require("express");
const deliveryMan_controller_1 = require("../controllers/deliveryMan.controller");
const auth_1 = require("../middlewares/auth");
const isAdmin_1 = require("../middlewares/isAdmin");
const router = (0, express_1.Router)();
const adminOnly = [auth_1.authMiddleware, isAdmin_1.isAdmin];
// Rotas públicas
router.post('/deliverymen/login', deliveryMan_controller_1.loginDeliveryMan);
// Rota privada entregador
router.get('/deliverymen/profile', auth_1.authMiddleware, deliveryMan_controller_1.profileDeliveryMan);
// Rotas privadas admin
router.post('/deliverymen/register', adminOnly, deliveryMan_controller_1.registerDeliveryMan);
router.get('/deliverymen', adminOnly, deliveryMan_controller_1.listDeliveryMen);
router.get('/deliverymen/:id', adminOnly, deliveryMan_controller_1.getDeliveryManById);
router.put('/deliverymen/:id', adminOnly, deliveryMan_controller_1.updateDeliveryMan);
router.delete('/deliverymen/:id', adminOnly, deliveryMan_controller_1.deleteDeliveryMan);
exports.default = router;
