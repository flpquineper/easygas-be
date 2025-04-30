import express from 'express';
import { PrismaClient } from '@prisma/client';
import userRouter from './routes/users';
import adminRouter from './routes/admins';


const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use('/users', userRouter);
app.use('/admins', adminRouter);


app.get('/', (req, res) => {
  res.send('API EasyGas rodando!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
