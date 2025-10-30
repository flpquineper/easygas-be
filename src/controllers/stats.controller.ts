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

    // Contagem de pedidos
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

    // Novas contagens para os cards adicionais
    const customersCount = await prisma.user.count();
    const driversCount = await prisma.deliveryMan.count();
    const productsCount = await prisma.product.count();

    // Retornar o JSON no formato que o frontend espera
    res.status(200).json({
      received: receivedCount,
      delivered: deliveredCount,
      customers: customersCount,
      drivers: driversCount,
      products: productsCount,
    });
  } catch (error) {
    console.error("Erro ao buscar resumo de pedidos:", error);
    res.status(500).json({ error: "Erro ao buscar resumo de pedidos." });
  }
};
 