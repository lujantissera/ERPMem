import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';

const productSchema = z.object({
  categoryId: z.number().int().positive(),
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  productionCost: z.number().positive().optional().nullable(),
  stock: z.number().int().min(0).optional(),
  minStock: z.number().int().min(0).optional(),
  minWidth: z.number().positive().optional().nullable(),
  maxWidth: z.number().positive().optional().nullable(),
  minHeight: z.number().positive().optional().nullable(),
  maxHeight: z.number().positive().optional().nullable(),
  minDepth: z.number().positive().optional().nullable(),
  maxDepth: z.number().positive().optional().nullable(),
  material: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  active: z.boolean().optional(),
});

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  const { categoryId, search, minPrice, maxPrice, page = '1', limit = '12' } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  const where: Record<string, unknown> = { active: true };
  if (categoryId) where['categoryId'] = parseInt(categoryId as string);
  if (search) where['name'] = { contains: search as string };
  if (minPrice || maxPrice) {
    const priceFilter: Record<string, unknown> = {};
    if (minPrice) priceFilter['gte'] = parseFloat(minPrice as string);
    if (maxPrice) priceFilter['lte'] = parseFloat(maxPrice as string);
    where['price'] = priceFilter;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: { select: { id: true, name: true } } },
      skip,
      take: parseInt(limit as string),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ]);

  res.json({
    products,
    pagination: {
      total,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      totalPages: Math.ceil(total / parseInt(limit as string)),
    },
  });
};

export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  const { search, page = '1', limit = '20' } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const where: Record<string, unknown> = {};
  if (search) where['name'] = { contains: search as string };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: { select: { id: true, name: true } } },
      skip,
      take: parseInt(limit as string),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ]);

  res.json({
    products,
    pagination: {
      total,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      totalPages: Math.ceil(total / parseInt(limit as string)),
    },
  });
};

export const getProduct = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params['id'] as string);
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!product) {
    res.status(404).json({ message: 'Producto no encontrado' });
    return;
  }
  res.json(product);
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = productSchema.parse(req.body);
    const product = await prisma.product.create({
      data: { ...data },
      include: { category: true },
    });
    res.status(201).json(product);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: 'Datos inválidos', errors: err.issues });
      return;
    }
    throw err;
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params['id'] as string);
    const data = productSchema.partial().parse(req.body);
    const product = await prisma.product.update({
      where: { id },
      data,
      include: { category: true },
    });
    res.json(product);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: 'Datos inválidos', errors: err.issues });
      return;
    }
    throw err;
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params['id'] as string);
  await prisma.product.update({ where: { id }, data: { active: false } });
  res.json({ message: 'Producto desactivado' });
};

export const getLowStockProducts = async (_req: Request, res: Response): Promise<void> => {
  const all = await prisma.product.findMany({
    where: { active: true },
    include: { category: true },
  });
  const lowStock = all.filter((p) => p.stock <= p.minStock);
  res.json(lowStock);
};
