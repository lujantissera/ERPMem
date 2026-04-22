import type { OrderStatus, SupplierOrderStatus } from '../../types';

const ORDER_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  IN_PRODUCTION: 'En producción',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

const ORDER_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  IN_PRODUCTION: 'bg-purple-100 text-purple-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const SUPPLIER_LABELS: Record<SupplierOrderStatus, string> = {
  DRAFT: 'Borrador',
  SENT: 'Enviado',
  CONFIRMED: 'Confirmado',
  RECEIVED: 'Recibido',
  CANCELLED: 'Cancelado',
};

const SUPPLIER_COLORS: Record<SupplierOrderStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SENT: 'bg-blue-100 text-blue-800',
  CONFIRMED: 'bg-indigo-100 text-indigo-800',
  RECEIVED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ORDER_COLORS[status]}`}>
      {ORDER_LABELS[status]}
    </span>
  );
}

export function SupplierStatusBadge({ status }: { status: SupplierOrderStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${SUPPLIER_COLORS[status]}`}>
      {SUPPLIER_LABELS[status]}
    </span>
  );
}
