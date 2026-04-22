import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';

const categorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  });
  res.json(categories);
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = categorySchema.parse(req.body);
    const category = await prisma.category.create({ data });
    res.status(201).json(category);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: 'Datos inválidos', errors: err.issues });
      return;
    }
    throw err;
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params['id'] as string);
    const data = categorySchema.partial().parse(req.body);
    const category = await prisma.category.update({ where: { id }, data });
    res.json(category);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: 'Datos inválidos', errors: err.issues });
      return;
    }
    throw err;
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params['id'] as string);
  await prisma.category.delete({ where: { id } });
  res.json({ message: 'Categoría eliminada' });
};
