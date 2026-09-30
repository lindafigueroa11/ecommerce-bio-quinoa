export type OrderItemSummary = { id: string; productId: string; name: string; price: number; quantity: number; subtotal: number; imageUrl: string };
export type UserOrder = { id: string; status: string; total: number; currency: string; createdAt: string; items: OrderItemSummary[] };

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export async function getUserOrders(token: string): Promise<UserOrder[]> {
  const response = await fetch(`${apiUrl}/orders`, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error('We could not load your orders.');
  return response.json();
}

export async function getUserOrder(orderId: string, token: string): Promise<UserOrder> {
  const response = await fetch(`${apiUrl}/orders/${orderId}`, { headers: { Authorization: `Bearer ${token}` } });
  if (response.status === 404) throw new Error('We could not find this order.');
  if (!response.ok) throw new Error('We could not load this order.');
  return response.json();
}

export const money = (cents: number, currency: string) => new Intl.NumberFormat('en-IE', { style: 'currency', currency }).format(cents / 100);
export const date = (value: string) => new Date(value).toLocaleDateString('en-GB', { dateStyle: 'long' });
