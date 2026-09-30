'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { AdminGate } from '@/components/AdminGate';
import { useAuth } from '@/components/AuthProvider';
import { getAdminOrders, type AdminOrder } from '@/lib/admin-orders-client';
import { date, money } from '@/lib/orders-client';

function OrdersAdminContent() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try { setError(null); setOrders(await getAdminOrders(token, activeQuery)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'No pudimos cargar los pedidos.'); }
  }, [activeQuery, token]);
  useEffect(() => { void load(); }, [load]);

  const search = (event: FormEvent) => { event.preventDefault(); setActiveQuery(query); };
  const clear = () => { setQuery(''); setActiveQuery(''); };

  return <main className="mx-auto max-w-6xl px-6 py-12"><Link href="/account" className="text-sm font-bold">← Mi cuenta</Link><div className="mt-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-widest text-raiz-700">Administración</p><h1 className="mt-3 font-serif text-5xl">Pedidos</h1></div>{orders && <p className="text-raiz-700">{orders.length} resultados</p>}</div>
    <form onSubmit={search} className="mt-8 flex flex-wrap gap-3 rounded-2xl bg-raiz-100 p-4"><label className="sr-only" htmlFor="order-search">Buscar pedidos</label><input id="order-search" value={query} onChange={event => setQuery(event.target.value)} className="min-w-60 flex-1 rounded-xl border border-raiz-700/20 bg-white px-4 py-3" placeholder="Pedido, correo del cliente o producto" /><button className="rounded-full bg-raiz-950 px-5 py-3 font-bold text-white">Buscar</button>{activeQuery && <button type="button" onClick={clear} className="rounded-full border border-raiz-950 px-5 py-3 font-bold">Limpiar</button>}</form>
    {error && <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-red-800">{error}</p>}{!orders && !error && <p className="mt-6">Cargando pedidos…</p>}{orders?.length === 0 && <p className="mt-6 rounded-xl bg-raiz-100 p-5">No hay pedidos que coincidan con la búsqueda.</p>}
    <div className="mt-6 space-y-3">{orders?.map(order => <Link key={order.id} href={`/admin/orders/${order.id}`} className="block rounded-2xl border border-raiz-200 bg-white p-5 transition hover:border-raiz-700"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="font-bold">Pedido #{order.id.slice(-8)}</p><p className="mt-1 text-sm text-raiz-700">{order.customer?.email ?? 'Cliente sin cuenta'} · {date(order.createdAt)}</p><p className="mt-1 text-sm text-raiz-700">{order.items.reduce((sum, item) => sum + item.quantity, 0)} unidades · {order.items.map(item => item.name).join(', ')}</p></div><div className="text-right"><p className="font-bold">{money(order.total, order.currency)}</p><p className="mt-1 text-sm font-bold text-raiz-700">{order.status}</p></div></div></Link>)}</div>
  </main>;
}

export default function AdminOrdersPage() { return <AdminGate><OrdersAdminContent /></AdminGate>; }
