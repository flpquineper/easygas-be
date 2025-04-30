import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middlewares/auth';

const prisma = new PrismaClient();

export const createOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;

  try {
    // 1. Busca todos os itens do carrinho do usuário, com dados do produto
    const cartItems = await prisma.cartItem.findMany({
      where: {
        cart: {
          userId: userId
        }
      },
      include: {
        product: true
      }
    });

    if (cartItems.length === 0) {
      res.status(400).json({ erro: 'Carrinho vazio.' });
      return;
    }

    // 2. Cria o pedido com os dados do carrinho
    const order = await prisma.order.create({
      data: {
        userId,
        paymentMethodId: 1, // substitua por ID real conforme o contexto
        statusId: 1, // substitua por status inicial (ex: "Pendente")
        items: {
          create: cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price // ✅ salva o preço atual
          }))
        }
      },
      include: {
        items: true
      }
    });

    // 3. Limpa carrinho após criação do pedido
    await prisma.cartItem.deleteMany({
      where: {
        cart: {
          userId: userId
        }
      }
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao criar pedido.', detalhes: error });
  }
};

export const listOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = (req.user as any)?.id;

  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar pedidos.', detalhes: error });
  }
};

export const getOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      res.status(404).json({ erro: 'Pedido não encontrado.' });
      return;
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar pedido.', detalhes: error });
  }
};


// Atualiza o status do pedido e registra no histórico
export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { statusId } = req.body;
  
    try {
      const order = await prisma.order.update({
        where: { id: Number(id) },
        data: {
          statusId,
          statusHistory: {
            create: {
              statusId
            }
          }
        }
      });
  
      res.status(200).json({ mensagem: 'Status atualizado com sucesso.', order });
    } catch (error) {
      res.status(500).json({ erro: 'Erro ao atualizar status do pedido.', detalhes: error });
    }
  };
  
  // Cancela pedido se ainda não foi entregue
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
  
      if (order.status.statusName.toLowerCase() === 'entregue') {
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
          statusHistory: {
            create: {
              statusId: cancelStatus.id
            }
          }
        }
      });
  
      res.status(200).json({ mensagem: 'Pedido cancelado com sucesso.', pedido: updated });
    } catch (error) {
      res.status(500).json({ erro: 'Erro ao cancelar pedido.', detalhes: error });
    }
  };
  