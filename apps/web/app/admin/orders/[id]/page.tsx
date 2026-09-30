'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AdminGate } from '@/components/AdminGate';
import { useAuth } from '@/components/AuthProvider';
import { getAdminOrder, type AdminOrder } from '@/lib/admin-orders-client';
import { date, money } from '@/lib/orders-client';

function AdminOrderDetailContent() {
  const { token } = useAuth();
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (!token || !params.id) return; void getAdminOrder(params.id, token).then(setOrder).catch(reason => setError(reason instanceof Error ? reason.message : 'No pudimos cargar el pedido.')); }, [params.id, token]);
  return <main className="mx-auto max-w-5xl px-6 py-12"><Link href="/admin/orders" className="text-sm font-bold">← Pedidos</Link>{error && <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-red-800">{error}</p>}{!order && !error && <p className="mt-6">Cargando pedido…</p>}{order && <><div className="mt-8 flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-widest text-raiz-700">Pedido #{order.id.slice(-8)}</p><h1 className="mt-3 font-serif text-5xl">Detalle del pedido</h1><p className="mt-3 text-raiz-700">{date(order.createdAt)}</p></div><div className="rounded-xl bg-raiz-100 px-5 py-3 text-right"><p className="text-sm font-bold text-raiz-700">Estado</p><p className="font-bold">{order.status}</p></div></div><section className="mt-8 grid gap-5 md:grid-cols-2"><div className="rounded-2xl bg-raiz-100 p-6"><h2 className="text-xl font-bold">Cliente</h2><p className="mt-3 font-medium">{order.customer?.email ?? 'Pedido sin cuenta asociada'}</p>{order.customer && <p className="mt-1 text-sm text-raiz-700">ID: {order.customer.id}</p>}</div><div className="rounded-2xl bg-raiz-100 p-6"><h2 className="text-xl font-bold">Total</h2><p className="mt-3 font-serif text-4xl">{money(order.total, order.currency)}</p></div></section><section className="mt-8 rounded-2xl border border-raiz-200 bg-white p-6"><h2 className="text-xl font-bold">Productos</h2><div className="mt-5 space-y-4">{order.items.map(item => <div key={item.id} className="flex items-center gap-4 border-b border-raiz-100 pb-4 last:border-0"><img src={item.imageUrl} alt="" className="h-16 w-16 rounded-lg object-cover" /><div className="flex-1"><p className="font-bold">{item.name}</p><p className="text-sm text-raiz-700">{money(item.price, order.currency)} × {item.quantity}</p></div><p className="font-bold">{money(item.subtotal, order.currency)}</p></div>)}</div></section></>}</main>;
}

export default function AdminOrderDetailPage() { return <AdminGate><AdminOrderDetailContent /></AdminGate>; }
