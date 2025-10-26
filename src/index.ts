// src/index.ts
import express from 'express';
import { PrismaClient } from '@prisma/client';
import userRouter from './routes/users';
import adminRouter from './routes/admins';
import cartRouter from './routes/carts';
import productRouter from './routes/products';
import orderRouter from './routes/orders';
import paymentRouter from './routes/paymentMethods'
import deliveryManRouter from './routes/deliveryMans'
import orderStatusRouter from './routes/orderStatus'
import statsRoutes from './routes/stats';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

const allowedOrigins = [
  'http://localhost:3001',
  'http://localhost:3000', 
  'https://easygas.onrender.com',
  'https://easygas-admin.onrender.com'
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true
};

app.use(cookieParser());
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

app.use('/users', userRouter);
app.use('/admins', adminRouter);
app.use('/api/carts', cartRouter);
app.use('/products', productRouter);
app.use('/orders', orderRouter);
app.use('/orderStatus', orderStatusRouter)
app.use('/', paymentRouter)
app.use('/', deliveryManRouter)
app.use('/', statsRoutes); 

app.get('/', (req, res) => {
  res.send('API EasyGas rodando!');
});

const PORT = process.env.PORT || 3305;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
