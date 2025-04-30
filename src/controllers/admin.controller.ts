import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'easygas_secret_key';

export async function register(req: Request, res: Response) {
    const { name, email, password } = req.body;

    try {
        const existingAdmin = await prisma.admin.findUnique({ where: { email } });
        if (existingAdmin) {
            return res.status(400).json({ erro: 'Email já cadastrado para administrador.' });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        const newAdmin = await prisma.admin.create({
            data: {
                name,
                email,
                password: hashedPassword,
            }
        });

        res.status(201).json({ id: newAdmin.id, name: newAdmin.name, email: newAdmin.email });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao registrar administrador.', detalhes: error });
    }
}

export async function login(req: Request, res: Response) {
    const { email, password } = req.body;
    const mensaPadrao = 'Email ou senha inválidos.';

    try {
        const admin = await prisma.admin.findUnique({ where: { email } });
        if (!admin || !admin.password) {
            return res.status(400).json({ erro: mensaPadrao });
        }

        const senhaValida = bcrypt.compareSync(password, admin.password);
        if (!senhaValida) {
            return res.status(400).json({ erro: mensaPadrao });
        }

        const token = jwt.sign({ id: admin.id, email: admin.email, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });

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
}

export async function profile(req: Request, res: Response) {
    try {
        const adminId = (req as any).user?.id;

        if (!adminId) {
            return res.status(401).json({ erro: 'Administrador não autenticado.' });
        }

        const admin = await prisma.admin.findUnique({
            where: { id: adminId },
            select: { id: true, name: true, email: true }
        });

        if (!admin) {
            return res.status(404).json({ erro: 'Administrador não encontrado.' });
        }

        res.status(200).json(admin);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar perfil de administrador.', detalhes: error });
    }
}

export async function update(req: Request, res: Response) {
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
}

export async function remove(req: Request, res: Response) {
    const adminId = (req as any).user?.id;

    try {
        await prisma.admin.delete({ where: { id: adminId } });
        res.status(200).json({ mensagem: 'Administrador removido com sucesso.' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao remover administrador.', detalhes: error });
    }
}