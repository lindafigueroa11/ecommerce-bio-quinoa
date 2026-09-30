'use client';

import Link from 'next/link';
import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from 'react';
import { AdminGate } from '@/components/AdminGate';
import { useAuth } from '@/components/AuthProvider';

type AdminProduct = { id: string; slug: string; name: string; description: string; price: number; currency: string; imageUrl: string; category: string; active: boolean; inventory: number };
type FormState = { slug: string; name: string; description: string; price: string; category: string; imageUrl: string; inventory: string; active: boolean };
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
const emptyForm: FormState = { slug: '', name: '', description: '', price: '', category: '', imageUrl: '', inventory: '0', active: true };
const price = (cents: number) => `${(cents / 100).toFixed(2).replace('.', ',')} €`;

function ProductsAdminContent() {
  const { token } = useAuth();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const request = useCallback(async <T,>(path: string, init?: RequestInit): Promise<T> => {
    const response = await fetch(`${apiUrl}${path}`, { ...init, headers: { Authorization: `Bearer ${token}`, ...init?.headers } });
    if (!response.ok) { const body = await response.json().catch(() => null); throw new Error(Array.isArray(body?.message) ? body.message[0] : body?.message ?? 'No pudimos completar la operación.'); }
    return response.json();
  }, [token]);

  const load = useCallback(async () => {
    try { setLoading(true); setProducts(await request<AdminProduct[]>('/products/admin/all')); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudieron cargar los productos.'); }
    finally { setLoading(false); }
  }, [request]);

  useEffect(() => { void load(); }, [load]);
  const set = (key: keyof FormState, value: string | boolean) => setForm(current => ({ ...current, [key]: value }));

  const startEdit = (product: AdminProduct) => {
    setEditingId(product.id);
    setForm({ slug: product.slug, name: product.name, description: product.description, price: (product.price / 100).toFixed(2), category: product.category, imageUrl: product.imageUrl, inventory: String(product.inventory), active: product.active });
    setMessage(''); window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const reset = () => { setEditingId(null); setForm(emptyForm); setMessage(''); };
  const save = async (event: FormEvent) => {
    event.preventDefault();
    const euros = Number(form.price.replace(',', '.'));
    const inventory = Number(form.inventory);
    if (!Number.isFinite(euros) || euros < 0 || !Number.isInteger(inventory) || inventory < 0) { setMessage('Indica un precio y un stock válidos.'); return; }
    const payload = { slug: form.slug, name: form.name, description: form.description, price: Math.round(euros * 100), currency: 'EUR', imageUrl: form.imageUrl, category: form.category, inventory, active: form.active };
    try {
      setSaving(true);
      if (editingId) await request(`/products/admin/${editingId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      else await request('/products/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      setMessage(editingId ? 'Producto actualizado.' : 'Producto creado.'); reset(); await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'No pudimos guardar el producto.'); }
    finally { setSaving(false); }
  };

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    const data = new FormData(); data.append('file', file);
    try { setSaving(true); const result = await request<{ imageUrl: string }>('/products/admin/upload', { method: 'POST', body: data }); set('imageUrl', result.imageUrl); setMessage('Imagen subida.'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'No pudimos subir la imagen.'); }
    finally { setSaving(false); event.target.value = ''; }
  };

  const toggle = async (product: AdminProduct) => {
    try { await request(`/products/admin/${product.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !product.active }) }); setMessage(product.active ? 'Producto desactivado.' : 'Producto activado.'); await load(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'No pudimos actualizar el producto.'); }
  };
  const deactivate = async (product: AdminProduct) => {
    if (!window.confirm(`¿Desactivar “${product.name}”? Dejará de aparecer en la tienda, pero se conservará en los pedidos.`)) return;
    try { await request(`/products/admin/${product.id}`, { method: 'DELETE' }); setMessage('Producto desactivado.'); await load(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'No pudimos desactivar el producto.'); }
  };

  return <main className="mx-auto max-w-6xl px-6 py-12"><Link href="/account" className="text-sm font-bold">← Mi cuenta</Link><div className="mt-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-widest text-raiz-700">Administración</p><h1 className="mt-3 font-serif text-5xl">Productos</h1></div><p className="text-raiz-700">{products.length} productos registrados</p></div>
    <section className="mt-8 rounded-2xl bg-raiz-100 p-6"><h2 className="text-2xl font-bold">{editingId ? 'Editar producto' : 'Crear producto'}</h2>{message && <p role="status" className="mt-3 rounded-lg bg-white px-4 py-3 font-medium text-raiz-950">{message}</p>}<form onSubmit={save} className="mt-5 grid gap-4 md:grid-cols-2"><label className="grid gap-1 text-sm font-bold">Nombre<input required value={form.name} onChange={e => set('name', e.target.value)} className="rounded-lg border border-raiz-700/20 bg-white px-3 py-2 font-normal" /></label><label className="grid gap-1 text-sm font-bold">Slug<input required value={form.slug} onChange={e => set('slug', e.target.value)} className="rounded-lg border border-raiz-700/20 bg-white px-3 py-2 font-normal" placeholder="mi-producto" /></label><label className="grid gap-1 text-sm font-bold md:col-span-2">Descripción<textarea required value={form.description} onChange={e => set('description', e.target.value)} className="min-h-24 rounded-lg border border-raiz-700/20 bg-white px-3 py-2 font-normal" /></label><label className="grid gap-1 text-sm font-bold">Precio (EUR)<input required inputMode="decimal" value={form.price} onChange={e => set('price', e.target.value)} className="rounded-lg border border-raiz-700/20 bg-white px-3 py-2 font-normal" placeholder="6.90" /></label><label className="grid gap-1 text-sm font-bold">Stock<input required type="number" min="0" step="1" value={form.inventory} onChange={e => set('inventory', e.target.value)} className="rounded-lg border border-raiz-700/20 bg-white px-3 py-2 font-normal" /></label><label className="grid gap-1 text-sm font-bold">Categoría<input required value={form.category} onChange={e => set('category', e.target.value)} className="rounded-lg border border-raiz-700/20 bg-white px-3 py-2 font-normal" /></label><label className="grid gap-1 text-sm font-bold">URL de imagen<input required value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)} className="rounded-lg border border-raiz-700/20 bg-white px-3 py-2 font-normal" placeholder="https://…" /></label><label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={form.active} onChange={e => set('active', e.target.checked)} /> Producto activo</label><label className="grid gap-1 text-sm font-bold">Subir imagen<input type="file" accept="image/*" onChange={upload} className="text-sm font-normal" /></label><div className="flex gap-3 md:col-span-2"><button disabled={saving} className="rounded-full bg-raiz-950 px-6 py-3 font-bold text-white disabled:opacity-50">{saving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Crear producto'}</button>{editingId && <button type="button" onClick={reset} className="rounded-full border border-raiz-950 px-6 py-3 font-bold">Cancelar</button>}</div></form></section>
    <section className="mt-10"><h2 className="font-serif text-3xl">Catálogo</h2>{loading ? <p className="mt-5">Cargando productos…</p> : <div className="mt-5 grid gap-4">{products.map(product => <article key={product.id} className={`grid gap-4 rounded-2xl border bg-white p-4 md:grid-cols-[100px_1fr_auto] md:items-center ${product.active ? 'border-raiz-100' : 'border-red-200 opacity-70'}`}><img src={product.imageUrl} alt="" className="h-24 w-full rounded-xl object-cover" /><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-bold">{product.name}</h3><span className={`rounded-full px-2 py-1 text-xs font-bold ${product.active ? 'bg-raiz-100 text-raiz-950' : 'bg-red-100 text-red-800'}`}>{product.active ? 'ACTIVO' : 'DESACTIVADO'}</span></div><p className="mt-1 text-sm text-raiz-700">{product.category} · {price(product.price)} · Stock: {product.inventory}</p><p className="mt-1 text-xs text-raiz-700">/{product.slug}</p></div><div className="flex flex-wrap gap-2"><button onClick={() => startEdit(product)} className="rounded-full border border-raiz-950 px-4 py-2 text-sm font-bold">Editar</button><button onClick={() => void toggle(product)} className="rounded-full border border-raiz-950 px-4 py-2 text-sm font-bold">{product.active ? 'Desactivar' : 'Activar'}</button><button onClick={() => void deactivate(product)} disabled={!product.active} className="rounded-full border border-red-700 px-4 py-2 text-sm font-bold text-red-800 disabled:opacity-40">Eliminar</button></div></article>)}</div>}</section>
  </main>;
}

export default function AdminProductsPage() { return <AdminGate><ProductsAdminContent /></AdminGate>; }
