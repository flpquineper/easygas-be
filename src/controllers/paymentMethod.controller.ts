// src/controllers/paymentMethod.controller.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middlewares/auth';

const prisma = new PrismaClient();

// Criar novo método de pagamento (acesso restrito ao admin, se desejar)
export const createPaymentMethod = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { methodName } = req.body;

  try {
    const method = await prisma.paymentMethod.create({
      data: { methodName }
    });

    res.status(201).json(method);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao criar método de pagamento.', detalhes: error });
  }
};

// Listar todos os métodos de pagamento
export const listPaymentMethods = async (_req: Request, res: Response): Promise<void> => {
  try {
    const methods = await prisma.paymentMethod.findMany();
    res.status(200).json(methods);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar métodos de pagamento.', detalhes: error });
  }
};

// Atualizar um método
export const updatePaymentMethod = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { methodName } = req.body;

  try {
    const updated = await prisma.paymentMethod.update({
      where: { id: Number(id) },
      data: { methodName }
    });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar método de pagamento.', detalhes: error });
  }
};

// Remover
export const removePaymentMethod = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    await prisma.paymentMethod.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao remover método de pagamento.', detalhes: error });
  }
};