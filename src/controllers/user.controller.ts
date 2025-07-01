// Substitua todo o seu arquivo por este código

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'easygas_secret_key';
interface AuthenticatedRequest extends Request {
  user?: string | JwtPayload;
}

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, phone, cpf, address, complementAddress } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ erro: 'Email já cadastrado.' });
      return;
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        cpf,
        address,
        complementAddress,
      }
    });

    res.status(201).json({ id: newUser.id, name: newUser.name, email: newUser.email });
  } catch (error) {
    console.error("Erro no registro:", error);
    res.status(500).json({ erro: 'Erro ao registrar usuário.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const mensagemPadrao = 'Email ou senha incorretos.';

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      res.status(400).json({ erro: mensagemPadrao });
      return;
    }

    const senhaValida = bcrypt.compareSync(password, user.password);
    if (!senhaValida) {
      res.status(400).json({ erro: mensagemPadrao });
      return;
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        complementAddress: user.complementAddress,
      }
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ erro: 'Erro ao fazer login.' });
  }
};

export const profile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = (req.user as JwtPayload)?.id;
    if (!userId) {
      res.status(401).json({ erro: 'Usuário não autenticado.' });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        phone: true,
        address: true,
        complementAddress: true
      }
    });
    if (!user) {
      res.status(404).json({ erro: 'Usuário não encontrado.' });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar perfil.' });
  }
};