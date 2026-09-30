'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AccountGate } from '@/components/AccountGate';
import { useAuth } from '@/components/AuthProvider';
import { date, getUserOrder, money, type UserOrder } from '@/lib/orders-client';

function OrderDetailContent({ orderId }: { orderId: string }) {
  const { token } = useAuth();
  const [order, setOrder] = useState<UserOrder | null>(null); const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (!token) return; void getUserOrder(orderId, token).then(setOrder).catch(reason => setError(reason instanceof Error ? reason.message : 'We could not load this order.')); }, [orderId, token]);
  return <main className="mx-auto max-w-4xl px-6 py-12"><Link href="/account/orders" className="text-sm font-bold">← My orders</Link>{!order && !error && <p className="mt-8">Loading order…</p>}{error && <section className="mt-8 rounded-2xl bg-red-50 p-6 text-red-800"><h1 className="font-serif text-4xl">Order unavailable</h1><p className="mt-3">{error}</p></section>}{order && <><p className="mt-8 text-sm font-bold uppercase tracking-widest text-raiz-700">Order #{order.id.slice(-8)}</p><h1 className="mt-4 font-serif text-5xl">Order details</h1><div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-raiz-700"><span>Status: <b className="text-raiz-950">{order.status}</b></span><span>{date(order.createdAt)}</span></div><section className="mt-8 rounded-2xl bg-raiz-100 p-6"><div className="space-y-5">{order.items.map(item => <article key={item.id} className="flex gap-4 border-b border-raiz-200 pb-5 last:border-0 last:pb-0"><img src={item.imageUrl} alt={item.name} className="h-16 w-16 rounded-xl object-cover"/><div className="flex-1"><h2 className="font-bold">{item.name}</h2><p className="mt-1 text-sm text-raiz-700">{money(item.price, order.currency)} × {item.quantity}</p></div><b>{money(item.subtotal, order.currency)}</b></article>)}</div><div className="mt-6 flex justify-between border-t border-raiz-200 pt-5 text-lg"><b>Total</b><b>{money(order.total, order.currency)}</b></div></section></>}</main>;
}

export default function OrderDetailPage({ params }: { params: { id: string } }) { return <AccountGate><OrderDetailContent orderId={params.id} /></AccountGate>; }
