'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type CartProduct = { id: string; name: string; slug: string; imageUrl: string; price: number; inventory: number };
export type CartItem = { id: string; productId: string; quantity: number; subtotal: number; product: CartProduct };
export type Cart = { id: string; sessionId: string; items: CartItem[]; total: number };
export type OrderSummary = { id: string; status: string; total: number; createdAt: string; items: Array<{ id: string; productId: string; name: string; price: number; quantity: number; subtotal: number; imageUrl: string }> };
export type CheckoutStart = { order: OrderSummary; checkoutUrl: string };
type CartContextValue = {
  cart: Cart | null; ready: boolean; notice: string | null;
  add: (productId: string, name: string, quantity: number) => Promise<void>;
  update: (productId: string, quantity: number) => Promise<void>;
  remove: (productId: string) => Promise<void>; clear: () => Promise<void>;
  createOrder: () => Promise<CheckoutStart>; getOrder: (orderId: string) => Promise<OrderSummary>;
};

const CartContext = createContext<CartContextValue | null>(null);
const cartStorageKey = 'raiz-cart-id';
const sessionStorageKey = 'raiz-cart-session';
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

async function request<T>(path: string, sessionId?: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...(sessionId ? { 'X-Cart-Session': sessionId } : {}), ...init?.headers } });
  if (!response.ok) { const body = await response.json().catch(() => null); throw new Error(Array.isArray(body?.message) ? body.message[0] : body?.message ?? 'Could not update cart'); }
  return response.json();
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  useEffect(() => { const load = async () => { try {
    const id = localStorage.getItem(cartStorageKey); const sessionId = localStorage.getItem(sessionStorageKey); let next: Cart;
    if (id && sessionId) { try { next = await request<Cart>(`/carts/${id}`, sessionId); } catch { next = await request<Cart>('/carts', undefined, { method: 'POST' }); } }
    else next = await request<Cart>('/carts', undefined, { method: 'POST' });
    localStorage.setItem(cartStorageKey, next.id); localStorage.setItem(sessionStorageKey, next.sessionId); setCart(next);
  } catch { setNotice('No pudimos conectar la cesta. Inténtalo de nuevo.'); } finally { setReady(true); } }; void load(); }, []);

  const withCart = async <T,>(action: (current: Cart) => Promise<T>) => { if (!cart) throw new Error('Cart is loading'); return action(cart); };
  const add = async (productId: string, name: string, quantity: number) => { if (!Number.isInteger(quantity) || quantity < 1) { setNotice('Selecciona una cantidad válida.'); return; } try { const next = await withCart(current => request<Cart>(`/carts/${current.id}/items`, current.sessionId, { method: 'POST', body: JSON.stringify({ productId, quantity }) })); setCart(next); setNotice(`${name} añadido a la cesta.`); } catch (error) { setNotice(error instanceof Error ? error.message : 'No pudimos añadir el producto.'); } };
  const update = async (productId: string, quantity: number) => { if (!Number.isInteger(quantity) || quantity < 0) { setNotice('Selecciona una cantidad válida.'); return; } try { setCart(await withCart(current => request<Cart>(`/carts/${current.id}/items/${productId}`, current.sessionId, { method: 'PATCH', body: JSON.stringify({ quantity }) }))); } catch (error) { setNotice(error instanceof Error ? error.message : 'No pudimos actualizar la cesta.'); } };
  const remove = async (productId: string) => { try { setCart(await withCart(current => request<Cart>(`/carts/${current.id}/items/${productId}`, current.sessionId, { method: 'DELETE' }))); setNotice('Producto eliminado de la cesta.'); } catch (error) { setNotice(error instanceof Error ? error.message : 'No pudimos actualizar la cesta.'); } };
  const clear = async () => { try { setCart(await withCart(current => request<Cart>(`/carts/${current.id}/items`, current.sessionId, { method: 'DELETE' }))); setNotice('Cesta vaciada.'); } catch (error) { setNotice(error instanceof Error ? error.message : 'No pudimos vaciar la cesta.'); } };
  const createOrder = async () => withCart(current => request<CheckoutStart>('/orders', current.sessionId, { method: 'POST', body: JSON.stringify({ cartId: current.id }) }));
  const getOrder = async (orderId: string) => withCart(current => request<OrderSummary>(`/orders/${orderId}`, current.sessionId));
  return <CartContext.Provider value={{ cart, ready, notice, add, update, remove, clear, createOrder, getOrder }}>{children}{notice && <div role="status" className="fixed bottom-5 right-5 z-50 rounded-xl bg-raiz-950 px-5 py-3 text-sm font-bold text-white shadow-xl">{notice}<button onClick={() => setNotice(null)} className="ml-4 text-raiz-100" aria-label="Cerrar aviso">×</button></div>}</CartContext.Provider>;
}
export function useCart() { const value = useContext(CartContext); if (!value) throw new Error('useCart must be used inside CartProvider'); return value; }
