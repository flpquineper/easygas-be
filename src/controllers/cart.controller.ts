import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../middlewares/auth";

const prisma = new PrismaClient();

export const getUserCart = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Usuário não autenticado." });
  }
  const userId = req.user.id;

  try {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true },
          orderBy: { id: "asc" },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: { product: true },
            orderBy: { id: "asc" },
          },
        },
      });
    }

    return res.status(200).json(cart);

  } catch (error) {
    console.error("Erro ao buscar o carrinho do usuário:", error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
};

export const associateUser = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Usuário não autenticado." });
  }
  const userId = req.user.id;
  const anonymousCartId = parseInt(req.params.cartId, 10);

  if (isNaN(anonymousCartId)) {
    return res.status(400).json({ error: "ID de carrinho inválido." });
  }

  try {
    const userCart = await prisma.cart.findUnique({ where: { userId } });
    const anonymousCart = await prisma.cart.findUnique({
      where: { id: anonymousCartId },
      include: { items: true },
    });

    if (!anonymousCart || anonymousCart.userId) {
      return res.status(404).json({ error: "Carrinho de visitante não encontrado ou já associado." });
    }

    if (!userCart) {
      await prisma.cart.update({
        where: { id: anonymousCartId },
        data: { userId: userId },
      });
      return res.status(200).json({ message: "Carrinho associado com sucesso." });
    }

    if (anonymousCart.items.length > 0) {
      await prisma.$transaction(async (tx) => {
        for (const item of anonymousCart.items) {
          await tx.cartItem.upsert({
            where: { cartId_productId: { cartId: userCart.id, productId: item.productId } },
            update: { quantity: { increment: item.quantity } },
            create: { cartId: userCart.id, productId: item.productId, quantity: item.quantity },
          });
        }
        await tx.cart.delete({ where: { id: anonymousCartId } });
      });
    } else {
      await prisma.cart.delete({ where: { id: anonymousCartId } });
    }
    
    res.status(200).json({ message: "Carrinhos fundidos com sucesso." });
  } catch (error) {
    res.status(500).json({ error: "Erro ao associar/fundir carrinhos." });
  }
};

export const createCart = async (req: Request, res: Response) => {
  try {
    const cart = await prisma.cart.create({ data: {} });
    res.status(201).json({ id: cart.id });
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar carrinho." });
  }
};

export const getCart = async (req: Request, res: Response) => {
    try {
      const cartId = parseInt(req.params.cartId, 10);
      const cart = await prisma.cart.findUnique({
        where: { id: cartId },
        include: { items: { include: { product: true } } }
      });
      if (!cart) return res.status(404).json({ error: "Carrinho não encontrado" });
      res.json(cart);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar carrinho" });
    }
};

export const addItem = async (req: Request, res: Response) => {
  try {
    const cartId = parseInt(req.params.cartId, 10);
    const { productId, quantity } = req.body;

    const item = await prisma.cartItem.upsert({
        where: { cartId_productId: { cartId, productId } },
        update: { quantity: { increment: quantity } },
        create: { cartId, productId, quantity }
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: "Erro ao adicionar item" });
  }
};

export const updateItem = async (req: Request, res: Response) => {
  try {
    const itemId = parseInt(req.params.itemId, 10);
    const { quantity } = req.body;
    if (quantity <= 0) {
        await prisma.cartItem.delete({ where: { id: itemId }});
        return res.status(204).send();
    }
    const item = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity }
    });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar item" });
  }
};

export const removeItem = async (req: Request, res: Response) => {
  try {
    const itemId = parseInt(req.params.itemId, 10);
    await prisma.cartItem.delete({ where: { id: itemId } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Erro ao remover item" });
  }
};

export const clearCart = async (req: Request, res: Response) => {
  try {
    const cartId = parseInt(req.params.cartId, 10);
    await prisma.cartItem.deleteMany({ where: { cartId } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Erro ao limpar carrinho" });
  }
};

export const clearUserCart = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Não autenticado" });
  
  const userId = req.user.id;

  try {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Erro ao limpar o carrinho do usuário." });
  }
};

export const addItemToUserCart = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Não autenticado" });
  
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  try {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return res.status(404).json({ error: "Carrinho do usuário não encontrado." });

    const item = await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      update: { quantity: { increment: quantity } },
      create: { cartId: cart.id, productId, quantity }
    });
    
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: "Erro ao adicionar item ao carrinho do usuário." });
  }
};