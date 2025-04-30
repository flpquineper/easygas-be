import express from 'express';
import { PrismaClient } from '@prisma/client';
import userRouter from './routes/users';
import adminRouter from './routes/admins';
import cartRouter  from './routes/carts'
import productRouter from './routes/products'
import orderRouter  from './routes/orders'


const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use('/users', userRouter);
app.use('/admins', adminRouter);
app.use('/carts', cartRouter);
app.use('/products', productRouter);
app.use('/orders', orderRouter);


app.get('/', (req, res) => {
  res.send('API EasyGas rodando!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
