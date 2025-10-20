import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, price, image } = req.body;

    if (!name || !price || !image) {
      res.status(400).json({ error: 'Nome, preço e imagem são obrigatórios.' });
      return;
    }

    const product = await prisma.product.create({
      data: {
        name,
        price,
        image
      }
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar produto.' });
  }
};

export const listProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await prisma.product.findMany();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar produtos.' });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, price } = req.body;

    const updated = await prisma.product.update({
      where: { id: Number(id) },
      data: { name, price }
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar produto.' });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id: Number(id) }
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar produto.' });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
    });

    if (!product) {
      res.status(404).json({ error: 'Produto não encontrado.' });
      return;
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produto.' });
  }
};
