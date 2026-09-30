'use client';

import Link from 'next/link';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useCart, type OrderSummary } from '@/components/CartProvider';

export default function CheckoutCancelPage() {
  return <Suspense fallback={<main className="mx-auto max-w-4xl px-6 py-16">Checking cancellation…</main>}><CheckoutCancelContent /></Suspense>;
}

function CheckoutCancelContent() {
  const { ready, cancelOrder } = useCart();
  const { user, ready: authReady } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const orderId = params.get('order_id');
  const started = useRef(false);
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !authReady || !orderId || started.current) return;
    if (!user) { router.replace(`/login?next=${encodeURIComponent(`/checkout/cancel?order_id=${orderId}`)}`); return; }
    started.current = true;
    void cancelOrder(orderId).then(setOrder).catch(reason => setError(reason instanceof Error ? reason.message : 'We could not verify the cancellation.'));
  }, [authReady, cancelOrder, orderId, ready, router, user]);

  const paid = order?.status === 'PAID';
  const cancelled = order?.status === 'CANCELLED';
  return <main className="mx-auto max-w-4xl px-6 py-16"><p className="text-sm font-bold uppercase tracking-widest text-raiz-700">{cancelled ? 'Payment cancelled' : paid ? 'Payment confirmed' : 'Checking cancellation'}</p><h1 className="mt-4 font-serif text-5xl">{cancelled ? 'Your payment was cancelled.' : paid ? 'Your payment has already been confirmed.' : 'We are checking your payment.'}</h1><p className="mt-4 max-w-xl text-raiz-700">{error ?? (cancelled ? 'Stripe confirmed that the session was cancelled. Stock was not reduced and the products remain in your cart.' : paid ? 'Stripe has already recorded this payment. View your order confirmation.' : 'We are checking with Stripe that the session was not completed before marking this order as cancelled.')}</p>{!orderId && <p className="mt-4 rounded-xl bg-amber-50 p-4 text-amber-900">We did not receive the order identifier to verify it.</p>}<Link href={paid && orderId ? `/order/success/${orderId}` : '/cart'} className="mt-8 inline-block rounded-full bg-raiz-950 px-6 py-4 font-bold text-white">{paid ? 'View order' : 'Back to cart'}</Link></main>;
}
