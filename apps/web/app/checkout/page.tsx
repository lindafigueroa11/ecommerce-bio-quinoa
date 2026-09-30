'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useCart } from '@/components/CartProvider';

const euros = (cents: number) => `${(cents / 100).toFixed(2).replace('.', ',')} €`;

export default function CheckoutPage() {
  const { cart, ready, createOrder } = useCart();
  const { user, ready: authReady } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  useEffect(() => { if (authReady && !user) router.replace('/login?next=%2Fcheckout'); }, [authReady, router, user]);
  if (!ready || !authReady || !user) return <main className="mx-auto max-w-5xl px-6 py-16">Loading checkout…</main>;
  if (!cart || cart.items.length === 0) return <main className="mx-auto max-w-5xl px-6 py-16"><Link href="/" className="text-sm font-bold">← Continue shopping</Link><h1 className="mt-8 font-serif text-5xl">Your cart is empty.</h1><p className="mt-4 text-raiz-700">Add products before placing an order.</p><Link href="/#quinoa" className="mt-7 inline-block rounded-full bg-raiz-950 px-6 py-4 font-bold text-white">Browse quinoa</Link></main>;
  const confirm = async () => { setCreating(true); setError(null); try { const checkout = await createOrder(); window.location.assign(checkout.checkoutUrl); } catch (reason) { setError(reason instanceof Error ? reason.message : 'We could not create your order.'); setCreating(false); } };
  return <main className="mx-auto max-w-5xl px-6 py-12"><Link href="/cart" className="text-sm font-bold">← Back to cart</Link><h1 className="mt-8 font-serif text-5xl">Checkout</h1><p className="mt-3 text-raiz-700">Review your order before continuing to secure payment.</p><div className="mt-8 grid gap-7 lg:grid-cols-[1fr_360px]"><section className="space-y-4">{cart.items.map(item => <article key={item.productId} className="flex gap-4 rounded-2xl border border-raiz-200 bg-white p-4"><img src={item.product.imageUrl} alt={item.product.name} className="h-20 w-20 rounded-xl object-cover"/><div className="flex-1"><h2 className="font-semibold">{item.product.name}</h2><p className="mt-1 text-sm text-raiz-700">{euros(item.product.price)} × {item.quantity}</p></div><b>{euros(item.subtotal)}</b></article>)}</section><aside className="h-fit rounded-2xl bg-raiz-100 p-6"><h2 className="text-xl font-semibold">Order summary</h2><div className="mt-5 flex justify-between"><span>Subtotal</span><span>{euros(cart.total)}</span></div><div className="mt-3 flex justify-between border-t border-raiz-200 pt-4 text-lg"><b>Total</b><b>{euros(cart.total)}</b></div><p className="mt-5 text-sm text-raiz-700">Price and availability will be checked again before payment.</p>{error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}<button type="button" onClick={() => void confirm()} disabled={creating} className="mt-5 w-full rounded-full bg-amber-900 px-6 py-4 font-bold text-white disabled:opacity-60">{creating ? 'Creating order…' : 'Continue to payment →'}</button></aside></div></main>;
}
