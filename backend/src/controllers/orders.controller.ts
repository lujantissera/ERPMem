import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';

interface ProductWithPrice {
  id: number;
  price: unknown;
  stock: number;
  name: string;
}

const orderItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  customWidth: z.number().positive().optional().nullable(),
  customHeight: z.number().positive().optional().nullable(),
  customDepth: z.number().positive().optional().nullable(),
});

const createOrderSchema = z.object({
  deliveryAddress: z.string().min(5),
  deliveryCity: z.string().min(2),
  deliveryPostal: z.string().min(4),
  deliveryCountry: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).min(1),
});

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  const userId = req.query['userId'] ? parseInt(req.query['userId'] as string) : undefined;

  const orders = await prisma.order.findMany({
    where: userId ? { userId } : undefined,
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { include: { product: { select: { id: true, name: true, imageUrl: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(orders);
};

export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user!.id },
    include: {
      items: { include: { product: { select: { id: true, name: true, imageUrl: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(orders);
};

export const getOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const id = parseInt(req.params['id'] as string);
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      items: {
        include: {
          product: { select: { id: true, name: true, imageUrl: true, material: true } },
        },
      },
    },
  });

  if (!order) {
    res.status(404).json({ message: 'Pedido no encontrado' });
    return;
  }

  if (req.user!.role !== 'ADMIN' && order.userId !== req.user!.id) {
    res.status(403).json({ message: 'Acceso denegado' });
    return;
  }

  res.json(order);
};

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = createOrderSchema.parse(req.body);

    const productIds = data.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, active: true },
    }) as ProductWithPrice[];

    if (products.length !== productIds.length) {
      res.status(400).json({ message: 'Uno o más productos no están disponibles' });
      return;
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Validate stock for every item before doing anything
    const stockErrors: string[] = [];
    for (const item of data.items) {
      const product = productMap.get(item.productId)!;
      if (product.stock < item.quantity) {
        stockErrors.push(
          `"${product.name}": stock disponible ${product.stock}, solicitado ${item.quantity}`
        );
      }
    }
    if (stockErrors.length > 0) {
      res.status(409).json({ message: 'Stock insuficiente', errors: stockErrors });
      return;
    }

    let total = 0;
    const orderItems = data.items.map((item) => {
      const product = productMap.get(item.productId)!;
      const unitPrice = Number(product.price);
      total += unitPrice * item.quantity;
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        customWidth: item.customWidth ?? null,
        customHeight: item.customHeight ?? null,
        customDepth: item.customDepth ?? null,
      };
    });

    const order = await prisma.order.create({
      data: {
        userId: req.user!.id,
        deliveryAddress: data.deliveryAddress,
        deliveryCity: data.deliveryCity,
        deliveryPostal: data.deliveryPostal,
        deliveryCountry: data.deliveryCountry ?? 'Argentina',
        notes: data.notes,
        total,
        items: { create: orderItems },
      },
      include: {
        items: { include: { product: { select: { id: true, name: true } } } },
      },
    });

    for (const item of data.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    res.status(201).json(order);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: 'Datos inválidos', errors: err.issues });
      return;
    }
    throw err;
  }
};

const createOrderAdminSchema = z.object({
  userId: z.number().int().positive(),
  deliveryAddress: z.string().min(5),
  deliveryCity: z.string().min(2),
  deliveryPostal: z.string().min(4),
  deliveryCountry: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).min(1),
});

export const createOrderAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = createOrderAdminSchema.parse(req.body);

    const productIds = data.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, active: true },
    }) as ProductWithPrice[];

    if (products.length !== productIds.length) {
      res.status(400).json({ message: 'Uno o más productos no están disponibles' });
      return;
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    const stockErrors: string[] = [];
    for (const item of data.items) {
      const product = productMap.get(item.productId)!;
      if (product.stock < item.quantity) {
        stockErrors.push(`"${product.name}": stock disponible ${product.stock}, solicitado ${item.quantity}`);
      }
    }
    if (stockErrors.length > 0) {
      res.status(409).json({ message: 'Stock insuficiente', errors: stockErrors });
      return;
    }

    let total = 0;
    const orderItems = data.items.map((item) => {
      const product = productMap.get(item.productId)!;
      const unitPrice = Number(product.price);
      total += unitPrice * item.quantity;
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        customWidth: item.customWidth ?? null,
        customHeight: item.customHeight ?? null,
        customDepth: item.customDepth ?? null,
      };
    });

    const order = await prisma.order.create({
      data: {
        userId: data.userId,
        deliveryAddress: data.deliveryAddress,
        deliveryCity: data.deliveryCity,
        deliveryPostal: data.deliveryPostal,
        deliveryCountry: data.deliveryCountry ?? 'Argentina',
        notes: data.notes,
        total,
        items: { create: orderItems },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: { select: { id: true, name: true } } } },
      },
    });

    for (const item of data.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    res.status(201).json(order);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: 'Datos inválidos', errors: err.issues });
      return;
    }
    throw err;
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params['id'] as string);
  const { status } = req.body as { status: string };

  const validStatuses = ['PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ message: 'Estado inválido' });
    return;
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status: status as 'PENDING' | 'CONFIRMED' | 'IN_PRODUCTION' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  res.json(order);
};

export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  const [
    totalOrders,
    pendingOrders,
    totalRevenue,
    totalProducts,
    totalUsers,
    recentOrders,
    allProducts,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: 'CANCELLED' } } }),
    prisma.product.count({ where: { active: true } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } },
    }),
    prisma.product.findMany({ where: { active: true }, select: { stock: true, minStock: true } }),
  ]);

  const lowStockCount = allProducts.filter((p: { stock: number; minStock: number }) => p.stock <= p.minStock).length;

  res.json({
    totalOrders,
    pendingOrders,
    totalRevenue: Number(totalRevenue._sum.total) || 0,
    totalProducts,
    totalUsers,
    lowStockCount,
    recentOrders,
  });
};
