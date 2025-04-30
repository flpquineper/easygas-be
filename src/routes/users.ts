import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import bcrypt from 'bcrypt';
import { authMiddleware } from '../middlewares/auth';


const prisma = new PrismaClient();
const router = Router();

// Rotas públicas
router.post('/register', userController.register);
router.post('/login', userController.login);
// Rota privada
router.get('/profile', authMiddleware, userController.profile); // rota privada autenticada com middleware


router.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        orders: true
      }
    })
    res.status(200).json(users)
  } catch (error) {
    res.status(400).json(error)
  }
})


router.get("/:id", async (req, res) => {
  const { id } = req.params

  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      include: {
        orders: true
      }
    })

    if (user == null) {
      res.status(400).json({ erro: "Usuário não cadastrado" })
    } else {
      res.status(200).json({
        id: user.id,
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        phone: user.phone,
        address: user.address,
        orders: user.orders
      })
    }
  } catch (error) {
    res.status(400).json(error)
  }
})

router.patch("/:id", async (req, res) => {
  const { id } = req.params
  const { name, email, password, cpf, address, phone } = req.body

  const data: any = {}
  if (name) data.name = name
  if (email) data.email = email
  if (password) {
    const salt = bcrypt.genSaltSync(12)
    data.password = bcrypt.hashSync(password, salt)
  }
  if (cpf) data.cpf = cpf
  if (address) data.address = address
  if (phone) data.phone = phone

  if (Object.keys(data).length === 0) {
    res.status(400).json({ erro: "Informe ao menos um campo para atualizar" })
    return
  }

  try {
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data
    })
    res.status(200).json(user)
  } catch (error) {
    res.status(400).json(error)
  }
})


router.delete("/:id", async (req, res) => {
  const { id } = req.params

  try {
    const user = await prisma.user.delete({
      where: { id: Number(id) }
    })
    res.status(200).json(user)
  } catch (error) {
    res.status(400).json(error)
  }
})


router.get("/:id/orders", async (req, res) => {
  const { id } = req.params

  try {
    const orders = await prisma.order.findMany({
      where: { userId: Number(id) }
    })

    if (orders.length === 0) {
      res.status(400).json({ erro: "Nenhum pedido encontrado para este usuário" })
    } else {
      res.status(200).json(orders)
    }
  } catch (error) {
    res.status(400).json(error)
  }
})


router.get("/pesquisa/:termo", async (req, res) => {
  const { termo } = req.params


  const termoNumero = Number(termo)


  if (isNaN(termoNumero)) {
    try {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: termo } },
          ]
        }
      })
      res.status(200).json(users)
    } catch (error) {
      res.status(400).json(error)
    }
  }
})



export default router;