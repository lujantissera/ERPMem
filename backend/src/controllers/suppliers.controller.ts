import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';

interface ProductRow {
  id: number;
  stock: number;
  minStock: number;
  name: string;
  imageUrl: string | null;
  price: unknown;
}

const supplierSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

const supplierOrderSchema = z.object({
  supplierId: z.number().int().positive(),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().positive(),
    unitCost: z.number().positive().optional(),
  })).min(1),
});

export const getSuppliers = async (_req: Request, res: Response): Promise<void> => {
  const suppliers = await prisma.supplier.findMany({
    include: { _count: { select: { orders: true } } },
    orderBy: { name: 'asc' },
  });
  res.json(suppliers);
};

export const createSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = supplierSchema.parse(req.body);
    const supplier = await prisma.supplier.create({ data });
    res.status(201).json(supplier);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: 'Datos inválidos', errors: err.issues });
      return;
    }
    throw err;
  }
};

export const updateSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params['id'] as string);
    const data = supplierSchema.partial().parse(req.body);
    const supplier = await prisma.supplier.update({ where: { id }, data });
    res.json(supplier);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: 'Datos inválidos', errors: err.issues });
      return;
    }
    throw err;
  }
};

export const deleteSupplier = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params['id'] as string);
  await prisma.supplier.delete({ where: { id } });
  res.json({ message: 'Proveedor eliminado' });
};

export const getSupplierOrders = async (_req: Request, res: Response): Promise<void> => {
  const orders = await prisma.supplierOrder.findMany({
    include: {
      supplier: true,
      items: { include: { product: { select: { id: true, name: true, imageUrl: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(orders);
};

export const createSupplierOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = supplierOrderSchema.parse(req.body);
    const order = await prisma.supplierOrder.create({
      data: {
        supplierId: data.supplierId,
        notes: data.notes,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitCost: item.unitCost,
          })),
        },
      },
      include: {
        supplier: true,
        items: { include: { product: true } },
      },
    });
    res.status(201).json(order);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: 'Datos inválidos', errors: err.issues });
      return;
    }
    throw err;
  }
};

export const updateSupplierOrderStatus = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params['id'] as string);
  const { status } = req.body as { status: string };
  const valid = ['DRAFT', 'SENT', 'CONFIRMED', 'RECEIVED', 'CANCELLED'];
  if (!valid.includes(status)) {
    res.status(400).json({ message: 'Estado inválido' });
    return;
  }

  const order = await prisma.supplierOrder.update({
    where: { id },
    data: { status: status as 'DRAFT' | 'SENT' | 'CONFIRMED' | 'RECEIVED' | 'CANCELLED' },
    include: { supplier: true, items: { include: { product: true } } },
  });

  if (status === 'RECEIVED') {
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }
  }

  res.json(order);
};

export const getLowStockSuggestions = async (_req: Request, res: Response): Promise<void> => {
  const products = await prisma.product.findMany({ where: { active: true } }) as ProductRow[];
  const lowStock = products.filter((p) => p.stock <= p.minStock);
  res.json(lowStock.map((p) => ({
    ...p,
    suggestedOrder: Math.max(p.minStock * 2 - p.stock, 1),
  })));
};
