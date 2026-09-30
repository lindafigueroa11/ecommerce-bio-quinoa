'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from './CartProvider';

export function PurchaseControls({ productId, name, inventory }: { productId?: string; name: string; inventory?: number }) {
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const { add, ready } = useCart();
  const available = inventory ?? 1;
  const change = (next: number) => { setAdded(false); setQuantity(Math.max(1, Math.min(available, next))); };
  const addToCart = async () => { if (!productId || quantity < 1) return; setAdding(true); const success = await add(productId, name, quantity); if (success) { setQuantity(1); setAdded(true); } setAdding(false); };
  return <div className="mt-6"><div className="flex gap-3"><div className="flex items-center rounded-full border border-raiz-200 bg-white"><button type="button" aria-label="Disminuir cantidad" onClick={() => change(quantity - 1)} disabled={quantity === 1} className="px-4 py-3 disabled:opacity-40">−</button><span aria-live="polite" className="min-w-8 text-center font-bold">{quantity}</span><button type="button" aria-label="Aumentar cantidad" onClick={() => change(quantity + 1)} disabled={quantity >= available} className="px-4 py-3 disabled:opacity-40">+</button></div><button type="button" disabled={!ready || !productId || available < 1 || quantity < 1 || adding} onClick={() => void addToCart()} className="flex-1 rounded-full bg-amber-900 px-6 py-4 text-left font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{adding ? 'AÑADIENDO…' : added ? 'AÑADIDO ✓' : 'ADD TO CART'} <span className="float-right">›</span></button></div>{added && <p role="status" aria-live="polite" className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">✓ {name} se añadió a tu cesta. <Link href="/cart" className="underline underline-offset-2">Ver cesta</Link></p>}{available < 1 && <p className="mt-3 text-sm font-semibold text-red-700">Producto sin stock.</p>}</div>;
}
