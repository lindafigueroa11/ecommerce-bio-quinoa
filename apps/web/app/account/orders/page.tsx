'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AccountGate } from '@/components/AccountGate';
import { useAuth } from '@/components/AuthProvider';
import { date, getUserOrders, money, type UserOrder } from '@/lib/orders-client';

function OrdersPageContent() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<UserOrder[] | null>(null); const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (!token) return; void getUserOrders(token).then(setOrders).catch(reason => setError(reason instanceof Error ? reason.message : 'No pudimos cargar tus pedidos.')); }, [token]);
  return <main className="mx-auto max-w-5xl px-6 py-12"><Link href="/account" className="text-sm font-bold">← Mi cuenta</Link><h1 className="mt-8 font-serif text-5xl">Mis pedidos</h1>{error && <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-red-800">{error}</p>}{!orders && !error && <p className="mt-6">Cargando pedidos…</p>}{orders?.length === 0 && <section className="mt-8 rounded-2xl bg-raiz-100 p-6"><p>Aún no tienes pedidos.</p><Link href="/#productos" className="mt-5 inline-block font-bold underline">Explorar productos</Link></section>}<div className="mt-8 space-y-4">{orders?.map(order => <Link key={order.id} href={`/account/orders/${order.id}`} className="block rounded-2xl border border-raiz-200 bg-white p-5 transition hover:border-raiz-700"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-bold">Pedido #{order.id.slice(-8)}</p><p className="mt-1 text-sm text-raiz-700">{date(order.createdAt)} · {order.items.reduce((sum, item) => sum + item.quantity, 0)} productos</p></div><div className="text-right"><p className="font-bold">{money(order.total, order.currency)}</p><p className="mt-1 text-sm font-bold text-raiz-700">{order.status}</p></div></div></Link>)}</div></main>;
}

export default function OrdersPage() { return <AccountGate><OrdersPageContent /></AccountGate>; }
