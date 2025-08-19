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
import cors from 'cors';

const app = express();
const prisma = new PrismaClient();

const allowedOrigins = [
  'http://localhost:3000', 
  'https://easygas-ten.vercel.app/' ,
  'https://easygas-fe.onrender.com/'
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo CORS'));
    }
  }
};

app.use(cors(corsOptions));

app.use(express.json());

app.use('/users', userRouter);
app.use('/admins', adminRouter);
app.use('/api/carts', cartRouter);
app.use('/products', productRouter);
app.use('/api/orders', orderRouter);
app.use('/orderStatus', orderStatusRouter)
app.use('/', paymentRouter)
app.use('/', deliveryManRouter)

app.get('/', (req, res) => {
  res.send('API EasyGas rodando!');
});

const PORT = process.env.PORT || 3305;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
