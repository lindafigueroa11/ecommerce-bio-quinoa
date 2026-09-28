'use client';

import { useState } from 'react';
import { useCart } from './CartProvider';

export function PurchaseControls({ productId, name, inventory }: { productId?: string; name: string; inventory?: number }) {
  const [quantity, setQuantity] = useState(1);
  const { add, ready } = useCart();
  const available = inventory ?? 1;
  const change = (next: number) => setQuantity(Math.max(1, Math.min(available, next)));
  return <div className="mt-6 flex gap-3"><div className="flex items-center rounded-full border border-raiz-200 bg-white"><button type="button" aria-label="Disminuir cantidad" onClick={() => change(quantity - 1)} className="px-4 py-3">−</button><span className="min-w-8 text-center font-bold">{quantity}</span><button type="button" aria-label="Aumentar cantidad" onClick={() => change(quantity + 1)} disabled={quantity >= available} className="px-4 py-3 disabled:opacity-40">+</button></div><button type="button" disabled={!ready || !productId || available < 1} onClick={() => productId && void add(productId, name, quantity)} className="flex-1 rounded-full bg-amber-900 px-6 py-4 text-left font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">ADD TO CART <span className="float-right">›</span></button></div>;
}
