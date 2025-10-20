import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'easygas_secret_key';
interface AuthenticatedRequest extends Request {
  user?: string | JwtPayload;
}

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

// Listar todos os usuários (agora usando o seletor leve)
export const listAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: userListSelect, 
    });
    res.status(200).json(users);
  } catch (error) {
    console.error("Erro em listAllUsers:", error);
    res.status(500).json({ erro: "Erro ao listar usuários." });
  }
};

// Obter um usuário por ID (agora usando o seletor detalhado)
export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: userDetailSelect,
    });

    if (!user) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(`Erro em getUserById para o id ${id}:`, error);
    res.status(500).json({ erro: "Erro ao buscar usuário." });
  }
};

// Atualizar um usuário (para o Admin)
export const updateUser = async (req: Request, res: Response) => {
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
  if (role) data.role = role;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data,
      select: userListSelect, 
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao atualizar usuário." });
  }
};

// Deletar um usuário (para o Admin)
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({
      where: { id: Number(id) },
    });
    res.status(204).send(); 
  } catch (error) {
    res.status(500).json({ erro: "Erro ao deletar usuário." });
  }
};

// Listar pedidos de um usuário específico (para o Admin)
export const listUserOrders = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const orders = await prisma.order.findMany({
      where: { userId: Number(id) }
    });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar pedidos do usuário." });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ erro: "Usuário não autenticado." });
  }
  const userId = (req.user as { id: number }).id;
  const { name, email, password, phone, address, complementAddress } = req.body;

  const dataToUpdate: any = {};
  if (name) dataToUpdate.name = name;
  if (email) dataToUpdate.email = email;
  if (phone) dataToUpdate.phone = phone;
  if (address) dataToUpdate.address = address;
  if (complementAddress) dataToUpdate.complementAddress = complementAddress;

  if (password) {
    dataToUpdate.password = bcrypt.hashSync(password, 10);
  }

  if (Object.keys(dataToUpdate).length === 0) {
    return res.status(400).json({ erro: "Nenhum dado fornecido para atualização." });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId }, 
      data: dataToUpdate,
      select: userListSelect, 
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ erro: `O campo '${(error.meta as any)?.target}' já está em uso.` });
    }
    console.error("Erro ao atualizar perfil:", error);
    res.status(500).json({ erro: "Erro ao atualizar perfil." });
  }
};