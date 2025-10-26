"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.error("---------------------------------------------------------");
        console.error("FATAL ERROR: JWT_SECRET não está definido no arquivo .env");
        console.error("A aplicação não pode iniciar sem esta variável.");
        console.error("---------------------------------------------------------");
        process.exit(1);
        throw new Error("JWT_SECRET não está definido.");
    }
    return secret;
}
const JWT_SECRET = getJwtSecret();
exports.default = JWT_SECRET;
