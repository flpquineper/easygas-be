import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getOrderSummary = async (req: Request, res: Response) => {
  try {
    // Buscar os status diretamente pelo nome
    const receivedStatus = await prisma.orderStatus.findUnique({
      where: { statusName: "Recebido" },
    });

    const deliveredStatus = await prisma.orderStatus.findUnique({
      where: { statusName: "Entregue" },
    });

    // Se algum não existir, retorna zero
    const receivedCount = receivedStatus
      ? await prisma.order.count({
          where: { statusId: receivedStatus.id },
        })
      : 0;

    const deliveredCount = deliveredStatus
      ? await prisma.order.count({
          where: { statusId: deliveredStatus.id },
        })
      : 0;

    // Retornar o JSON no formato que o frontend espera
    res.status(200).json({
      received: receivedCount,
      delivered: deliveredCount,
    });
  } catch (error) {
    console.error("Erro ao buscar resumo de pedidos:", error);
    res.status(500).json({ error: "Erro ao buscar resumo de pedidos." });
  }
};