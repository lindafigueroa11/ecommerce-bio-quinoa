'use client';

import Link from 'next/link';
import { useCart } from './CartProvider';

export function CartLink() {
  const { cart, ready } = useCart();
  const count = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  return <Link href="/cart">Cart ({ready ? count : '…'})</Link>;
}
