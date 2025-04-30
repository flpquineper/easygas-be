import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middlewares/auth';

const prisma = new PrismaClient();

export const addToCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { productId, quantity } = req.body;
  
    try {
     
      let cart = await prisma.cart.findFirst({ where: { userId } });
  
      if (!cart) {
        cart = await prisma.cart.create({
          data: { userId: userId! } 
        });
      }
      
      const cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
  
      res.status(201).json(cartItem);
    } catch (error) {
      res.status(500).json({ erro: 'Erro ao adicionar no carrinho.', detalhes: error });
    }
  };

  export const getCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
  
    try {
      const cart = await prisma.cartItem.findMany({
        where: { cart: { userId } },
        include: { product: true },
      });
  
      res.status(200).json(cart);
    } catch (error) {
      res.status(500).json({ erro: 'Erro ao buscar carrinho.', detalhes: error });
    }
  };

export const updateItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { quantity } = req.body;

  try {
    const updatedItem = await prisma.cartItem.update({
      where: { id: Number(id) },
      data: { quantity }
    });

    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar item.', detalhes: error });
  }
};

export const removeItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    await prisma.cartItem.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao remover item do carrinho.', detalhes: error });
  }
};
