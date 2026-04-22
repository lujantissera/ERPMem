import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { errorHandler, notFound } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/categories.routes';
import productRoutes from './routes/products.routes';
import orderRoutes from './routes/orders.routes';
import userRoutes from './routes/users.routes';
import supplierRoutes from './routes/suppliers.routes';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/suppliers', supplierRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🪑  MEM API Server running on http://localhost:${PORT}`);
  console.log(`📦  Environment: ${process.env.NODE_ENV}`);
});

export default app;
