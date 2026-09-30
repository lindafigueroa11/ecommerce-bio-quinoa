'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useCart, type OrderSummary } from '@/components/CartProvider';

const euros = (cents: number) => `${(cents / 100).toFixed(2).replace('.', ',')} €`;

export default function OrderSuccessPage({ params }: { params: { id: string } }) {
  const { ready, getOrder } = useCart();
  const { user, ready: authReady } = useAuth();
  const router = useRouter();
  const loaded = useRef(false);
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (!ready || !authReady || loaded.current) return; if (!user) { router.replace(`/login?next=${encodeURIComponent(`/order/success/${params.id}`)}`); return; } loaded.current = true; void getOrder(params.id).then(setOrder).catch(reason => setError(reason instanceof Error ? reason.message : 'We could not load this order.')); }, [authReady, getOrder, params.id, ready, router, user]);
  if (!ready || !authReady || !user || (!order && !error)) return <main className="mx-auto max-w-5xl px-6 py-16">Loading confirmation…</main>;
  if (error) return <main className="mx-auto max-w-5xl px-6 py-16"><h1 className="font-serif text-4xl">We could not find this order.</h1><p className="mt-4 text-raiz-700">{error}</p><Link href="/" className="mt-7 inline-block rounded-full bg-raiz-950 px-6 py-4 font-bold text-white">Back to shop</Link></main>;
  const isPaid = order!.status === 'PAID'; const isCancelled = order!.status === 'CANCELLED';
  return <main className="mx-auto max-w-4xl px-6 py-12"><p className="text-sm font-bold uppercase tracking-widest text-raiz-700">{isPaid ? '✓ Payment confirmed' : isCancelled ? 'Payment not completed' : 'Payment pending confirmation'}</p><h1 className="mt-4 font-serif text-5xl">{isPaid ? 'Thank you for your order.' : isCancelled ? 'Your payment was not completed.' : 'We are confirming your payment.'}</h1><p className="mt-4 text-raiz-700">Order <b>{order!.id}</b> · {new Date(order!.createdAt).toLocaleDateString('en-GB', { dateStyle: 'long' })}</p>{!isPaid && <p className="mt-4 rounded-xl bg-amber-50 p-4 text-amber-900">{isCancelled ? 'The payment session expired or the payment method failed. Stock was not reduced.' : 'Reaching this page does not confirm payment. The status will become PAID once Stripe delivers a valid webhook.'}</p>}<div className="mt-8 rounded-2xl bg-raiz-100 p-6"><div className="flex justify-between"><span>Status</span><b>{order!.status}</b></div><div className="mt-5 space-y-4 border-t border-raiz-200 pt-5">{order!.items.map(item => <div key={item.id} className="flex justify-between gap-4"><span>{item.name} <span className="text-raiz-700">× {item.quantity}</span></span><b>{euros(item.subtotal)}</b></div>)}</div><div className="mt-5 flex justify-between border-t border-raiz-200 pt-5 text-lg"><b>Total</b><b>{euros(order!.total)}</b></div></div><Link href="/" className="mt-8 inline-block rounded-full bg-raiz-950 px-6 py-4 font-bold text-white">Continue shopping</Link></main>;
}
