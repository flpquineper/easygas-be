"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const express_1 = __importDefault(require("express"));
const users_1 = __importDefault(require("./routes/users"));
const admins_1 = __importDefault(require("./routes/admins"));
const carts_1 = __importDefault(require("./routes/carts"));
const products_1 = __importDefault(require("./routes/products"));
const orders_1 = __importDefault(require("./routes/orders"));
const paymentMethods_1 = __importDefault(require("./routes/paymentMethods"));
const deliveryMans_1 = __importDefault(require("./routes/deliveryMans"));
const orderStatus_1 = __importDefault(require("./routes/orderStatus"));
const stats_1 = __importDefault(require("./routes/stats"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app = (0, express_1.default)();
const allowedOrigins = [
    'http://localhost:3001',
    'http://localhost:3000',
    'https://easygas.onrender.com',
    'https://easygas-admin.onrender.com'
];
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error('Não permitido pelo CORS'));
        }
    },
    credentials: true
};
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true
}));
app.use((req, res, next) => {
    console.log('--- NOVA REQUISIÇÃO ---');
    console.log('Origem:', req.headers.origin);
    console.log('Cookies ANTES do parser:', req.headers.cookie);
    next();
});
app.use((0, cookie_parser_1.default)());
app.use((req, res, next) => {
    console.log('Cookies DEPOIS do parser:', req.cookies);
    next();
});
app.use(express_1.default.json());
app.use('/users', users_1.default);
app.use('/admins', admins_1.default);
app.use('/api/carts', carts_1.default);
app.use('/products', products_1.default);
app.use('/orders', orders_1.default);
app.use('/orderStatus', orderStatus_1.default);
app.use('/', paymentMethods_1.default);
app.use('/', deliveryMans_1.default);
app.use('/', stats_1.default);
app.get('/', (req, res) => {
    res.send('API EasyGas rodando!');
});
const PORT = process.env.PORT || 3305;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
