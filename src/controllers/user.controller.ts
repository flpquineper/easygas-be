// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'easygas_secret_key';
interface AuthenticatedRequest extends Request {
  user?: string | JwtPayload;
}
const userPublicData = {
  id: true,
  name: true,
  email: true,
  cpf: true,
  phone: true,
  address: true,
  complementAddress: true,
  orders: true,
};

const userListSelect = {
  id: true,
  name: true,
  email: true,
  cpf: true,
  phone: true,
  address: true,
  complementAddress: true,
};

const userDetailSelect = {
  ...userListSelect,
  orders: {
    orderBy: {
      orderDate: 'desc' as Prisma.SortOrder,
    },
  },
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, phone, cpf, address, complementAddress } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ erro: 'Email já cadastrado.' });
      return;
    }

    const existingPhone = await prisma.user.findUnique({ where: { phone } });
    if (existingPhone) {
      res.status(400).json({ erro: 'Este telefone já está em uso.' });
      return
    }

    const existingCpf = await prisma.user.findUnique({ where: { cpf } });
    if (existingCpf) {
      res.status(400).json({ erro: 'Este CPF já está em uso.' });
      return
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

    res.cookie('easygas.token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7
    });

    res.status(200).json({
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

export const listAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: userPublicData,
    });
    res.status(200).json(users);
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    res.status(500).json({ erro: "Erro ao listar usuários." });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: userPublicData,
    });

    if (!user) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    res.status(500).json({ erro: "Erro ao buscar usuário." });
  }
};

export const updateUserByAdmin = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, password, cpf, address, phone, role } = req.body;

  const data: any = {};
  if (name) data.name = name;
  if (email) data.email = email;
  if (password) {
    data.password = bcrypt.hashSync(password, 10);
  }
  if (cpf) data.cpf = cpf;
  if (address) data.address = address;
  if (phone) data.phone = phone;

  try {
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data,
      select: userPublicData,
    });
    res.status(200).json(user);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    res.status(500).json({ erro: "Erro ao atualizar usuário." });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  const userId = (req.user as JwtPayload)?.id;
  const { name, email, password, cpf, address, phone } = req.body;

  const data: any = {};
  if (name) data.name = name;
  if (email) data.email = email;
  if (password) {
    data.password = bcrypt.hashSync(password, 10);
  }
  if (cpf) data.cpf = cpf;
  if (address) data.address = address;
  if (phone) data.phone = phone;

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: userPublicData, // <-- AJUSTE DE SEGURANÇA
    });
    res.status(200).json(user);
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    res.status(500).json({ erro: "Erro ao atualizar perfil." });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({
      where: { id: Number(id) }
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json(error);
  }
};