import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function listStatuses(req: Request, res: Response) {
  const statuses = await prisma.orderStatus.findMany();
  res.json(statuses);
}

export async function createStatus(req: Request, res: Response) {
  const { statusName } = req.body;
  const status = await prisma.orderStatus.create({
    data: { statusName }
  });
  res.status(201).json(status);
}

export async function updateStatus(req: Request, res: Response) {
  const { statusName } = req.body;
  const { id } = req.params;
  const status = await prisma.orderStatus.update({
    where: { id: Number(id) },
    data: { statusName }
  });
  res.json(status);
}

export async function deleteStatus(req: Request, res: Response) {
  const { id } = req.params;
  const statusId = Number(id);

  // Verifica se o status está sendo usado em algum pedido
  const ordersCount = await prisma.order.count({ where: { statusId } });
  if (ordersCount > 0) {
    return res.status(400).json({ error: 'Não é possível deletar um status em uso.' });
  }

  // Faz o delete e responde!
  await prisma.orderStatus.delete({ where: { id: statusId } });
  return res.status(204).send(); // ou res.json({ success: true });
}