import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getOrderSummary = async (req: Request, res: Response) => {
  try {
    const pendingCount = await prisma.order.count({
      where: { status: { statusName: 'Pendente' } }
    });

    const deliveredCount = await prisma.order.count({
      where: { status: { statusName: 'Entregue' } }
    });

    res.status(200).json({
      pending: pendingCount,
      delivered: deliveredCount,
    });

  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar resumo de pedidos." });
  }
};