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
const userController = __importStar(require("../controllers/user.controller"));
const auth_1 = require("../middlewares/auth");
const isAdmin_1 = require("../middlewares/isAdmin");
const router = (0, express_1.Router)();
const adminOnly = [auth_1.authMiddleware, isAdmin_1.isAdmin];
// Rotas públicas
router.post('/register', userController.register); // rota cadastro 
router.post('/login', userController.login); // rota login
router.post('/logout', userController.logout); // rota logout
// Rota privada usuário
router.get('/profile', auth_1.authMiddleware, userController.profile); // rota privada para visualização dos dados do usuário autenticada com middleware
router.patch('/:id', auth_1.authMiddleware, userController.updateProfile); // atualizar dados da conta do usuário
// Rotas privadas de admin
router.get('/', adminOnly, userController.listAllUsers); // listar usuários cadastrados
router.get('/:id', adminOnly, userController.getUserById); // listar usuário específico
router.patch('/:id', adminOnly, userController.updateUserByAdmin); // atualizar dados usuário específico
router.delete('/:id', adminOnly, userController.deleteUser); // excluir dados usuário
exports.default = router;
