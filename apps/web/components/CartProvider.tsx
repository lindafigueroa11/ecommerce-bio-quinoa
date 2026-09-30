'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from './AuthProvider';

type CartProduct = { id: string; name: string; slug: string; imageUrl: string; price: number; inventory: number };
export type CartItem = { id: string; productId: string; quantity: number; subtotal: number; product: CartProduct };
export type Cart = { id: string; sessionId: string; items: CartItem[]; total: number };
export type OrderSummary = { id: string; status: string; total: number; createdAt: string; items: Array<{ id: string; productId: string; name: string; price: number; quantity: number; subtotal: number; imageUrl: string }> };
export type CheckoutStart = { order: OrderSummary; checkoutUrl: string };
type CartContextValue = {
  cart: Cart | null; ready: boolean; notice: string | null;
  add: (productId: string, name: string, quantity: number) => Promise<boolean>;
  update: (productId: string, quantity: number) => Promise<void>;
  remove: (productId: string) => Promise<void>; clear: () => Promise<void>;
  createOrder: () => Promise<CheckoutStart>; getOrder: (orderId: string) => Promise<OrderSummary>;
  cancelOrder: (orderId: string) => Promise<OrderSummary>;
};

const CartContext = createContext<CartContextValue | null>(null);
type Notice = { message: string; type: 'success' | 'error' };
const cartStorageKey = 'raiz-cart-id';
const sessionStorageKey = 'raiz-cart-session';
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

async function request<T>(path: string, sessionId?: string, token?: string | null, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...(sessionId ? { 'X-Cart-Session': sessionId } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init?.headers } });
  if (!response.ok) { const body = await response.json().catch(() => null); throw new Error(Array.isArray(body?.message) ? body.message[0] : body?.message ?? 'Could not update cart'); }
  return response.json();
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  useEffect(() => { if (!notice) return; const timeout = window.setTimeout(() => setNotice(null), 5000); return () => window.clearTimeout(timeout); }, [notice]);
  useEffect(() => { const load = async () => { try {
    const id = localStorage.getItem(cartStorageKey); const sessionId = localStorage.getItem(sessionStorageKey); let next: Cart;
    if (id && sessionId) { try { next = await request<Cart>(`/carts/${id}`, sessionId); } catch { next = await request<Cart>('/carts', undefined, undefined, { method: 'POST' }); } }
    else next = await request<Cart>('/carts', undefined, undefined, { method: 'POST' });
    localStorage.setItem(cartStorageKey, next.id); localStorage.setItem(sessionStorageKey, next.sessionId); setCart(next);
  } catch { setNotice({ message: 'No pudimos conectar la cesta. Inténtalo de nuevo.', type: 'error' }); } finally { setReady(true); } }; void load(); }, []);

  const withCart = async <T,>(action: (current: Cart) => Promise<T>) => { if (!cart) throw new Error('Cart is loading'); return action(cart); };
  const add = async (productId: string, name: string, quantity: number) => { if (!Number.isInteger(quantity) || quantity < 1) { setNotice({ message: 'Selecciona al menos una unidad.', type: 'error' }); return false; } try { const next = await withCart(current => request<Cart>(`/carts/${current.id}/items`, current.sessionId, undefined, { method: 'POST', body: JSON.stringify({ productId, quantity }) })); setCart(next); setNotice({ message: `${quantity} ${quantity === 1 ? 'unidad' : 'unidades'} de ${name} añadida${quantity === 1 ? '' : 's'} a la cesta.`, type: 'success' }); return true; } catch (error) { setNotice({ message: error instanceof Error ? error.message : 'No pudimos añadir el producto.', type: 'error' }); return false; } };
  const update = async (productId: string, quantity: number) => { if (!Number.isInteger(quantity) || quantity < 0) { setNotice({ message: 'Selecciona una cantidad válida.', type: 'error' }); return; } try { setCart(await withCart(current => request<Cart>(`/carts/${current.id}/items/${productId}`, current.sessionId, undefined, { method: 'PATCH', body: JSON.stringify({ quantity }) }))); } catch (error) { setNotice({ message: error instanceof Error ? error.message : 'No pudimos actualizar la cesta.', type: 'error' }); } };
  const remove = async (productId: string) => { try { setCart(await withCart(current => request<Cart>(`/carts/${current.id}/items/${productId}`, current.sessionId, undefined, { method: 'DELETE' }))); setNotice({ message: 'Producto eliminado de la cesta.', type: 'success' }); } catch (error) { setNotice({ message: error instanceof Error ? error.message : 'No pudimos actualizar la cesta.', type: 'error' }); } };
  const clear = async () => { try { setCart(await withCart(current => request<Cart>(`/carts/${current.id}/items`, current.sessionId, undefined, { method: 'DELETE' }))); setNotice({ message: 'Cesta vaciada.', type: 'success' }); } catch (error) { setNotice({ message: error instanceof Error ? error.message : 'No pudimos vaciar la cesta.', type: 'error' }); } };
  const createOrder = async () => withCart(current => request<CheckoutStart>('/orders', current.sessionId, token, { method: 'POST', body: JSON.stringify({ cartId: current.id }) }));
  const getOrder = async (orderId: string) => withCart(current => request<OrderSummary>(`/orders/${orderId}`, current.sessionId, token));
  const cancelOrder = async (orderId: string) => withCart(current => request<OrderSummary>(`/orders/${orderId}/cancel`, current.sessionId, token, { method: 'POST' }));
  return <CartContext.Provider value={{ cart, ready, notice: notice?.message ?? null, add, update, remove, clear, createOrder, getOrder, cancelOrder }}>{children}{notice && <div role="status" aria-live="polite" className={`fixed bottom-5 right-5 z-50 flex max-w-sm items-center gap-3 rounded-2xl px-5 py-4 text-sm font-bold text-white shadow-xl ${notice.type === 'success' ? 'bg-raiz-950' : 'bg-red-800'}`}><span className="text-lg">{notice.type === 'success' ? '✓' : '!'}</span><div className="flex-1"><p>{notice.message}</p>{notice.type === 'success' && <Link href="/cart" className="mt-1 inline-block text-xs underline underline-offset-2">Ver cesta</Link>}</div><button onClick={() => setNotice(null)} className="text-raiz-100" aria-label="Cerrar aviso">×</button></div>}</CartContext.Provider>;
}
export function useCart() { const value = useContext(CartContext); if (!value) throw new Error('useCart must be used inside CartProvider'); return value; }
