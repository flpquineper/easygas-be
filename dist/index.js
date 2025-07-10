"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const users_1 = __importDefault(require("./routes/users"));
const admins_1 = __importDefault(require("./routes/admins"));
const carts_1 = __importDefault(require("./routes/carts"));
const products_1 = __importDefault(require("./routes/products"));
const orders_1 = __importDefault(require("./routes/orders"));
const paymentMethods_1 = __importDefault(require("./routes/paymentMethods"));
const deliveryMans_1 = __importDefault(require("./routes/deliveryMans"));
const orderStatus_1 = __importDefault(require("./routes/orderStatus"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/users', users_1.default);
app.use('/admins', admins_1.default);
app.use('/api/carts', carts_1.default);
app.use('/products', products_1.default);
app.use('/api/orders', orders_1.default);
app.use('/orderStatus', orderStatus_1.default);
app.use('/', paymentMethods_1.default);
app.use('/', deliveryMans_1.default);
app.get('/', (req, res) => {
    res.send('API EasyGas rodando!');
});
const PORT = process.env.PORT || 3305;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
