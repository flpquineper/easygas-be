import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'easygas_secret_key';

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  try {
    const existingAdmin = await prisma.admin.findUnique({ where: { email } });

    if (existingAdmin) {
      res.status(400).json({ erro: 'Email já cadastrado para administrador.' });
      return;
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newAdmin = await prisma.admin.create({
      data: { name, email, password: hashedPassword }
    });

    res.status(201).json({ id: newAdmin.id, name: newAdmin.name, email: newAdmin.email });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao registrar administrador.', detalhes: error });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    const mensagemPadrao = 'Email ou senha inválidos.';
  
    try {
      const admin = await prisma.admin.findUnique({ where: { email } });
  
      // Verifica se o admin existe e se a senha é válida (e se não é null)
      if (!admin || typeof admin.password !== 'string' || !bcrypt.compareSync(password, admin.password)) {
        res.status(400).json({ erro: mensagemPadrao });
        return;
      }
  
      const token = jwt.sign(
        { id: admin.id, email: admin.email, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
  
      res.status(200).json({
        token,
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email
        }
      });
    } catch (error) {
      res.status(500).json({ erro: 'Erro ao fazer login de administrador.', detalhes: error });
    }
  };

export const profile = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = (req as any).user?.id;

    if (!adminId) {
      res.status(401).json({ erro: 'Administrador não autenticado.' });
      return;
    }

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: { id: true, name: true, email: true }
    });

    if (!admin) {
      res.status(404).json({ erro: 'Administrador não encontrado.' });
      return;
    }

    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar perfil do administrador.', detalhes: error });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const adminId = (req as any).user?.id;
  const { name, email } = req.body;

  try {
    const admin = await prisma.admin.update({
      where: { id: adminId },
      data: { name, email }
    });

    res.status(200).json({ mensagem: 'Administrador atualizado com sucesso.', admin });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar administrador.', detalhes: error });
  }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const adminId = (req as any).user?.id;

  try {
    await prisma.admin.delete({ where: { id: adminId } });

    res.status(200).json({ mensagem: 'Administrador removido com sucesso.' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao remover administrador.', detalhes: error });
  }
};
