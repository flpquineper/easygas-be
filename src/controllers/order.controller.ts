import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { AuthenticatedRequest } from '../middlewares/auth';
import { JwtPayload } from 'jsonwebtoken';

const prisma = new PrismaClient();

export const createOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Usuário não autenticado.' });
    return;
  }
  const userId = (req.user as JwtPayload).id;

  const { address, complementAddress, paymentMethodId, items, scheduledAt } = req.body;

  if (!address || !paymentMethodId || !items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ erro: 'Dados do pedido incompletos.' });
    return;
  }

  try {
    const newOrder = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const fullAddressForNote = `${address}${complementAddress ? ` - ${complementAddress}` : ''}`;

      const order = await tx.order.create({
        data: {
          userId,
          paymentMethodId,
          statusId: 1,
          orderNote: fullAddressForNote,
          deliveryTime: scheduledAt ? new Date(scheduledAt) : null,
          statusHistory: {
            create: {
              statusId: 1,
            },
          },
        },
      });

      await tx.orderItem.createMany({
        data: items.map((item: any) => ({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      const userCart = await tx.cart.findUnique({ where: { userId } });
      if (userCart) {
        await tx.cartItem.deleteMany({ where: { cartId: userCart.id } });
      }

      const completeOrder = await tx.order.findUnique({
        where: { id: order.id },
        include: {
          user: { select: { name: true } },
          paymentMethod: { select: { methodName: true } },
          items: { include: { product: { select: { name: true } } } },
        },
      });

      if (!completeOrder) {
        throw new Error("Falha ao buscar o pedido recém-criado para retorno.");
      }

      const total = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

      return { ...completeOrder, total };
    });

    res.status(201).json(newOrder);
  } catch (error: any) {
    console.error("Erro ao criar pedido:", error);
    res.status(500).json({ erro: 'Erro ao criar pedido.', detalhes: error.message });
  }
};

export const listOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;
  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: { include: { product: true } },
        paymentMethod: true,
        status: true,
      },
      orderBy: { orderDate: 'desc' }
    });
    res.status(200).json(orders);
  } catch (error: any) {
    res.status(500).json({
      erro: 'Erro ao listar todos os pedidos.',
      detalhes: error.message
    });
  }
};

export const getOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = (req.user as any)?.id;
  const user = req.user as any;

  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        items: { include: { product: true } },
        paymentMethod: true,
        status: true,
      },
    });

    if (!order) {
      res.status(404).json({ erro: 'Pedido não encontrado.' });
      return;
    }

    if (!user.isAdmin && order.userId !== userId) {
      res.status(403).json({ erro: 'Acesso negado. Este pedido não pertence a você.' });
      return;
    }

    res.status(200).json(order);
 } catch (error: any) {
    res.status(500).json({
      erro: 'Erro ao listar todos os pedidos.',
      detalhes: error.message
    });
  }
};

export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { statusId } = req.body;
  try {
    const order = await prisma.order.update({
      where: { id: Number(id) },
      data: {
        statusId,
        statusHistory: { create: { statusId } },
      },
    });
    res.status(200).json({ mensagem: 'Status atualizado com sucesso.', order });
  } catch (error: any) {
    res.status(500).json({
      erro: 'Erro ao listar todos os pedidos.',
      detalhes: error.message
    });
  }
};

export const cancelOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: { status: true }
    });
    if (!order) {
      res.status(404).json({ erro: 'Pedido não encontrado.' });
      return;
    }
    if (order.status && order.status.statusName.toLowerCase() === 'entregue') {
      res.status(400).json({ erro: 'Pedido já entregue, não pode ser cancelado.' });
      return;
    }
    const cancelStatus = await prisma.orderStatus.findFirst({
      where: { statusName: 'Cancelado' }
    });
    if (!cancelStatus) {
      res.status(400).json({ erro: 'Status "Cancelado" não está cadastrado.' });
      return;
    }
    const updated = await prisma.order.update({
      where: { id: Number(id) },
      data: {
        statusId: cancelStatus.id,
        statusHistory: { create: { statusId: cancelStatus.id } },
      },
    });
    res.status(200).json({ mensagem: 'Pedido cancelado com sucesso.', pedido: updated });
  } catch (error: any) {
    res.status(500).json({
      erro: 'Erro ao listar todos os pedidos.',
      detalhes: error.message
    });
  }
};

export const listAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, phone: true } }, // É útil para o admin ver o nome do cliente
        items: { include: { product: true } },
        paymentMethod: true,
        status: true,
      },
      orderBy: { orderDate: 'desc' }
    });
    res.status(200).json(orders);
  } catch (error: any) {
    res.status(500).json({
      erro: 'Erro ao listar todos os pedidos.',
      detalhes: error.message
    });
  }
};