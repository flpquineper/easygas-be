"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController = __importStar(require("../controllers/admin.controller"));
const auth_1 = require("../middlewares/auth");
const isAdmin_1 = require("../middlewares/isAdmin");
const router = (0, express_1.Router)();
const adminOnly = [auth_1.authMiddleware, isAdmin_1.isAdmin];
// POST /admins/register -> Cria um novo admin.
router.post('/register', adminController.register);
// POST /admins/login -> Autentica um admin e retorna um token.
router.post('/login', adminController.login);
// GET /admins/profile -> Retorna o perfil do admin LOGADO (baseado no token).
router.get('/profile', adminOnly, adminController.profile);
// GET /admins -> Lista todos os administradores (protegido).
router.get('/admins', adminOnly, adminController.listAdmins);
// GET /admins/:id -> Busca um administrador específico (protegido).
router.get('/admins/:id', adminOnly, adminController.getAdminById);
// DELETE /admins/:id -> Deleta um administrador (protegido).
router.delete('/admins/:id', adminOnly, adminController.deleteAdmin);
exports.default = router;
