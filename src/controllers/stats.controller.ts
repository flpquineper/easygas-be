import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const PENDING_STATUS_ID = 1; 
const DELIVERED_STATUS_ID = 2; 

export const getOrderSummary = async (req: Request, res: Response) => {
  try {
    const pendingCount = await prisma.order.count({
      where: { statusId: PENDING_STATUS_ID }
    });

    const deliveredCount = await prisma.order.count({
      where: { statusId: DELIVERED_STATUS_ID }
    });

    res.status(200).json({
      pending: pendingCount,
      delivered: deliveredCount,
    });

  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar resumo de pedidos." });
  }
};