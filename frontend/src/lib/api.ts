import axios from 'axios';
import type {
  User, Category, Product, Order, Supplier, SupplierOrder,
  DashboardStats, ProductsResponse, SupplierOrderStatus, OrderStatus,
} from '../types';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mem_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('mem_token');
      localStorage.removeItem('mem_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

// Auth
export const authApi = {
  register: (data: { name: string; email: string; password: string; phone?: string; address?: string }) =>
    api.post<{ user: User; token: string }>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<{ user: User; token: string }>('/auth/login', data),
  me: () => api.get<User>('/auth/me'),
};

// Products
export const productsApi = {
  list: (params?: { categoryId?: number; search?: string; minPrice?: number; maxPrice?: number; page?: number; limit?: number }) =>
    api.get<ProductsResponse>('/products', { params }),
  listAdmin: (params?: { search?: string; page?: number; limit?: number }) =>
    api.get<ProductsResponse>('/products/admin/all', { params }),
  lowStock: () => api.get<Product[]>('/products/admin/low-stock'),
  get: (id: number) => api.get<Product>(`/products/${id}`),
  create: (data: Partial<Product>) => api.post<Product>('/products', data),
  update: (id: number, data: Partial<Product>) => api.put<Product>(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`),
};

// Categories
export const categoriesApi = {
  list: () => api.get<Category[]>('/categories'),
  create: (data: { name: string; description?: string }) => api.post<Category>('/categories', data),
  update: (id: number, data: { name?: string; description?: string }) => api.put<Category>(`/categories/${id}`, data),
  delete: (id: number) => api.delete(`/categories/${id}`),
};

// Orders
export const ordersApi = {
  dashboard: () => api.get<DashboardStats>('/orders/dashboard'),
  listAdmin: (userId?: number) => api.get<Order[]>('/orders', { params: userId ? { userId } : undefined }),
  myOrders: () => api.get<Order[]>('/orders/my'),
  get: (id: number) => api.get<Order>(`/orders/${id}`),
  create: (data: {
    deliveryAddress: string;
    deliveryCity: string;
    deliveryPostal: string;
    deliveryCountry?: string;
    notes?: string;
    items: Array<{ productId: number; quantity: number; customWidth?: number | null; customHeight?: number | null; customDepth?: number | null }>;
  }) => api.post<Order>('/orders', data),
  updateStatus: (id: number, status: OrderStatus) => api.patch<Order>(`/orders/${id}/status`, { status }),
  createAdmin: (data: {
    userId: number;
    deliveryAddress: string;
    deliveryCity: string;
    deliveryPostal: string;
    deliveryCountry?: string;
    notes?: string;
    items: Array<{ productId: number; quantity: number; customWidth?: number | null; customHeight?: number | null; customDepth?: number | null }>;
  }) => api.post<Order>('/orders/admin', data),
};

// Users
export const usersApi = {
  list: () => api.get<User[]>('/users'),
  create: (data: { name: string; email: string; password: string; role?: 'CUSTOMER' | 'ADMIN'; phone?: string; address?: string }) =>
    api.post<User>('/users', data),
  update: (id: number, data: Partial<User>) => api.put<User>(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
};

// Suppliers
export const suppliersApi = {
  list: () => api.get<Supplier[]>('/suppliers'),
  create: (data: { name: string; email: string; phone?: string; address?: string }) => api.post<Supplier>('/suppliers', data),
  update: (id: number, data: Partial<Supplier>) => api.put<Supplier>(`/suppliers/${id}`, data),
  delete: (id: number) => api.delete(`/suppliers/${id}`),
  orders: () => api.get<SupplierOrder[]>('/suppliers/orders'),
  createOrder: (data: { supplierId: number; notes?: string; items: Array<{ productId: number; quantity: number; unitCost?: number }> }) =>
    api.post<SupplierOrder>('/suppliers/orders', data),
  updateOrderStatus: (id: number, status: SupplierOrderStatus) =>
    api.patch<SupplierOrder>(`/suppliers/orders/${id}/status`, { status }),
  suggestions: () => api.get<Array<{ product: Product; suggestedQuantity: number }>>('/suppliers/orders/suggestions'),
};

export default api;
