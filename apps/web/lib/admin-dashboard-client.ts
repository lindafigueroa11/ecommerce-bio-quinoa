export type DashboardSummary = {
  orders: number;
  products: number;
  activeProducts: number;
  lowStockProducts: number;
  stockThreshold: number;
  sales: Array<{ currency: string; total: number }>;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export async function getDashboardSummary(token: string): Promise<DashboardSummary> {
  const response = await fetch(`${apiUrl}/admin/overview`, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error('No pudimos cargar el resumen administrativo.');
  return response.json();
}
