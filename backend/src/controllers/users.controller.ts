import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import bcrypt from 'bcryptjs';

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['CUSTOMER', 'ADMIN']).optional().default('CUSTOMER'),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = createUserSchema.parse(req.body);
    const exists = await prisma.user.findUnique({ where: { email: data.email } });
    if (exists) { res.status(409).json({ message: 'Email ya registrado' }); return; }
    const hashed = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: { name: data.name, email: data.email, password: hashed, role: data.role, phone: data.phone, address: data.address },
      select: { id: true, name: true, email: true, role: true, phone: true, address: true, createdAt: true },
    });
    res.status(201).json(user);
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ message: 'Datos inválidos', errors: err.issues }); return; }
    throw err;
  }
};

export const getUsers = async (_req: Request, res: Response): Promise<void> => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, phone: true, address: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(users);
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params['id'] as string);
  const { name, email, role, phone, address, password } = req.body as {
    name?: string; email?: string; role?: string;
    phone?: string; address?: string; password?: string;
  };

  const data: Record<string, unknown> = {};
  if (name) data['name'] = name;
  if (email) data['email'] = email;
  if (role) data['role'] = role;
  if (phone !== undefined) data['phone'] = phone;
  if (address !== undefined) data['address'] = address;
  if (password) data['password'] = await bcrypt.hash(password, 12);

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, phone: true, address: true, createdAt: true },
  });
  res.json(user);
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params['id'] as string);
  await prisma.user.delete({ where: { id } });
  res.json({ message: 'Usuario eliminado' });
};
