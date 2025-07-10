"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = isAdmin;
function isAdmin(req, res, next) {
    const user = req.user;
    if (!user || typeof user !== 'object' || user.role !== 'admin') {
        res.status(403).json({ erro: 'Acesso restrito a administradores.' });
        return;
    }
    next();
}
