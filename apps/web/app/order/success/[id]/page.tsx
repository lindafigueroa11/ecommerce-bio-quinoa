'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCart, type OrderSummary } from '@/components/CartProvider';

const euros = (cents: number) => `${(cents / 100).toFixed(2).replace('.', ',')} €`;

export default function OrderSuccessPage({ params }: { params: { id: string } }) {
  const { ready, getOrder } = useCart();
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (!ready) return; void getOrder(params.id).then(setOrder).catch(reason => setError(reason instanceof Error ? reason.message : 'No pudimos cargar el pedido.')); }, [getOrder, params.id, ready]);
  if (!ready || (!order && !error)) return <main className="mx-auto max-w-5xl px-6 py-16">Cargando confirmación…</main>;
  if (error) return <main className="mx-auto max-w-5xl px-6 py-16"><h1 className="font-serif text-4xl">No encontramos este pedido.</h1><p className="mt-4 text-raiz-700">{error}</p><Link href="/" className="mt-7 inline-block rounded-full bg-raiz-950 px-6 py-4 font-bold text-white">Volver a la tienda</Link></main>;
  const isPaid = order!.status === 'PAID';
  return <main className="mx-auto max-w-4xl px-6 py-12"><p className="text-sm font-bold uppercase tracking-widest text-raiz-700">{isPaid ? '✓ Pago confirmado' : 'Pago pendiente de confirmación'}</p><h1 className="mt-4 font-serif text-5xl">{isPaid ? 'Gracias por tu compra.' : 'Estamos confirmando tu pago.'}</h1><p className="mt-4 text-raiz-700">Pedido <b>{order!.id}</b> · {new Date(order!.createdAt).toLocaleDateString('es-ES', { dateStyle: 'long' })}</p>{!isPaid && <p className="mt-4 rounded-xl bg-amber-50 p-4 text-amber-900">Llegar a esta página no confirma el pago. El estado cambiará a PAID cuando Stripe entregue el webhook válido.</p>}<div className="mt-8 rounded-2xl bg-raiz-100 p-6"><div className="flex justify-between"><span>Estado</span><b>{order!.status}</b></div><div className="mt-5 space-y-4 border-t border-raiz-200 pt-5">{order!.items.map(item => <div key={item.id} className="flex justify-between gap-4"><span>{item.name} <span className="text-raiz-700">× {item.quantity}</span></span><b>{euros(item.subtotal)}</b></div>)}</div><div className="mt-5 flex justify-between border-t border-raiz-200 pt-5 text-lg"><b>Total</b><b>{euros(order!.total)}</b></div></div><Link href="/" className="mt-8 inline-block rounded-full bg-raiz-950 px-6 py-4 font-bold text-white">Seguir comprando</Link></main>;
}
