'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdminGate } from '@/components/AdminGate';
import { useAuth } from '@/components/AuthProvider';
import { getDashboardSummary, type DashboardSummary } from '@/lib/admin-dashboard-client';
import { money } from '@/lib/orders-client';

function AdminDashboardContent() {
  const { token } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (!token) return; void getDashboardSummary(token).then(setSummary).catch(reason => setError(reason instanceof Error ? reason.message : 'No pudimos cargar el resumen.')); }, [token]);

  return <main className="mx-auto max-w-6xl px-6 py-12"><Link href="/account" className="text-sm font-bold">← Mi cuenta</Link><p className="mt-8 text-sm font-bold uppercase tracking-widest text-raiz-700">Administración</p><h1 className="mt-3 font-serif text-5xl">Resumen</h1>{error && <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-red-800">{error}</p>}{!summary && !error && <p className="mt-6">Cargando resumen…</p>}{summary && <><section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><article className="rounded-2xl bg-raiz-100 p-6"><p className="text-sm font-bold uppercase tracking-wider text-raiz-700">Pedidos</p><p className="mt-3 font-serif text-5xl">{summary.orders}</p></article><article className="rounded-2xl bg-raiz-100 p-6"><p className="text-sm font-bold uppercase tracking-wider text-raiz-700">Ventas confirmadas</p><p className="mt-3 font-serif text-3xl">{summary.sales.length ? summary.sales.map(sale => money(sale.total, sale.currency)).join(' · ') : '0,00 €'}</p></article><article className="rounded-2xl bg-raiz-100 p-6"><p className="text-sm font-bold uppercase tracking-wider text-raiz-700">Productos</p><p className="mt-3 font-serif text-5xl">{summary.products}</p><p className="mt-2 text-sm text-raiz-700">{summary.activeProducts} activos</p></article><article className="rounded-2xl bg-raiz-100 p-6"><p className="text-sm font-bold uppercase tracking-wider text-raiz-700">Stock bajo</p><p className="mt-3 font-serif text-5xl">{summary.lowStockProducts}</p><p className="mt-2 text-sm text-raiz-700">Hasta {summary.stockThreshold} unidades</p></article></section><section className="mt-8 flex flex-wrap gap-3"><Link href="/admin/orders" className="rounded-full bg-raiz-950 px-6 py-4 font-bold text-white">Ver pedidos</Link><Link href="/admin/products" className="rounded-full border border-raiz-950 px-6 py-4 font-bold">Gestionar productos</Link></section></>}</main>;
}

export default function AdminDashboardPage() { return <AdminGate><AdminDashboardContent /></AdminGate>; }
