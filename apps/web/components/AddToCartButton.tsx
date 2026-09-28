'use client';

import { useCart } from './CartProvider';

export function AddToCartButton({ productId, name, quantity = 1, className = '' }: { productId?: string; name: string; quantity?: number; className?: string }) {
  const { add, ready } = useCart();
  return <button type="button" disabled={!ready || !productId} onClick={() => productId && void add(productId, name, quantity)} className={`rounded-full bg-amber-900 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 ${className}`}>{ready ? 'ADD TO CART' : 'Loading…'} <span className="ml-4">›</span></button>;
}
