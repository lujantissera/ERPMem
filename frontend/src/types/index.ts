export type Role = 'CUSTOMER' | 'ADMIN';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PRODUCTION'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type SupplierOrderStatus =
  | 'DRAFT'
  | 'SENT'
  | 'CONFIRMED'
  | 'RECEIVED'
  | 'CANCELLED';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
  address?: string | null;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string | null;
  createdAt: string;
}

export interface Product {
  id: number;
  categoryId: number;
  category: { id: number; name: string };
  name: string;
  description: string;
  price: number | string;
  productionCost?: number | string | null;
  stock: number;
  minStock: number;
  minWidth?: number | null;
  maxWidth?: number | null;
  minHeight?: number | null;
  maxHeight?: number | null;
  minDepth?: number | null;
  maxDepth?: number | null;
  material?: string | null;
  imageUrl?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  product: { id: number; name: string; imageUrl?: string | null };
  quantity: number;
  unitPrice: number | string;
  customWidth?: number | null;
  customHeight?: number | null;
  customDepth?: number | null;
}

export interface Order {
  id: number;
  userId: number;
  user?: { id: number; name: string; email: string; phone?: string | null };
  status: OrderStatus;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryPostal: string;
  deliveryCountry: string;
  notes?: string | null;
  total: number | string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  createdAt: string;
}

export interface SupplierOrderItem {
  id: number;
  supplierOrderId: number;
  productId: number;
  product: { id: number; name: string };
  quantity: number;
  unitCost?: number | string | null;
}

export interface SupplierOrder {
  id: number;
  supplierId: number;
  supplier: Supplier;
  status: SupplierOrderStatus;
  notes?: string | null;
  items: SupplierOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  lowStockCount: number;
  recentOrders: Array<Order & { user: { name: string } }>;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductsResponse {
  products: Product[];
  pagination: Pagination;
}

export interface CartItem {
  product: Product;
  quantity: number;
  customWidth?: number | null;
  customHeight?: number | null;
  customDepth?: number | null;
}
