import type { OrderItemSummary } from './orders-client';

export type AdminOrder = {
  id: string;
  status: string;
  total: number;
  currency: string;
  createdAt: string;
  items: OrderItemSummary[];
  customer: { id: string; email: string } | null;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

async function adminRequest<T>(path: string, token: string): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  if (response.status === 404) throw new Error('No encontramos este pedido.');
  if (!response.ok) throw new Error('No pudimos cargar los pedidos administrativos.');
  return response.json();
}

export function getAdminOrders(token: string, query = ''): Promise<AdminOrder[]> {
  const search = query.trim();
  return adminRequest(`/orders/admin${search ? `?q=${encodeURIComponent(search)}` : ''}`, token);
}

export function getAdminOrder(orderId: string, token: string): Promise<AdminOrder> {
  return adminRequest(`/orders/admin/${encodeURIComponent(orderId)}`, token);
}
