import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'easygas_secret_key';

export const registerDeliveryMan = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  try {
    const existingDeliveryMan = await prisma.deliveryMan.findUnique({ where: { email } });

    if (existingDeliveryMan) {
      res.status(400).json({ erro: 'Email já cadastrado para entregador.' });
      return;
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const deliveryMan = await prisma.deliveryMan.create({
      data: { name, email, password: hashedPassword }
    });

    res.status(201).json({ id: deliveryMan.id, name: deliveryMan.name, email: deliveryMan.email });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao registrar entregador.', detalhes: error });
  }
};

export const loginDeliveryMan = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const mensagemPadrao = 'Email ou senha inválidos.';

  try {
    const deliveryMan = await prisma.deliveryMan.findUnique({ where: { email } });

    if (!deliveryMan || typeof deliveryMan.password !== 'string' || !bcrypt.compareSync(password, deliveryMan.password)) {
      res.status(400).json({ erro: mensagemPadrao });
      return;
    }

    const token = jwt.sign({ id: deliveryMan.id, email: deliveryMan.email, role: 'delivery' }, JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(200).json({
      token,
      deliveryMan: {
        id: deliveryMan.id,
        name: deliveryMan.name,
        email: deliveryMan.email
      }
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao fazer login de entregador.', detalhes: error });
  }
};

export const profileDeliveryMan = async (req: Request, res: Response): Promise<void> => {
  try {
    const deliveryManId = (req as any).user?.id;

    if (!deliveryManId) {
      res.status(401).json({ erro: 'Entregador não autenticado.' });
      return;
    }

    const deliveryMan = await prisma.deliveryMan.findUnique({
      where: { id: deliveryManId },
      select: { id: true, name: true, email: true }
    });

    if (!deliveryMan) {
      res.status(404).json({ erro: 'Entregador não encontrado.' });
      return;
    }

    res.status(200).json(deliveryMan);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar perfil do entregador.', detalhes: error });
  }
};
