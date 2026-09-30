'use client';

import Link from 'next/link';
import { AccountGate } from '@/components/AccountGate';
import { useAuth } from '@/components/AuthProvider';

function AccountPageContent() {
  const { user } = useAuth();
  return <main className="mx-auto max-w-5xl px-6 py-12"><Link href="/" className="text-sm font-bold">← Volver a la tienda</Link><p className="mt-8 text-sm font-bold uppercase tracking-widest text-raiz-700">Mi cuenta</p><h1 className="mt-4 font-serif text-5xl">Hola, {user!.email}</h1><section className="mt-8 rounded-2xl bg-raiz-100 p-6"><h2 className="text-xl font-bold">Tus pedidos</h2><p className="mt-2 text-raiz-700">Consulta el estado y el detalle de todas tus compras.</p><Link href="/account/orders" className="mt-5 inline-block rounded-full bg-raiz-950 px-6 py-4 font-bold text-white">Ver mis pedidos</Link></section>{user?.role === 'ADMIN' && <section className="mt-5 rounded-2xl border border-raiz-700/20 p-6"><h2 className="text-xl font-bold">Administración</h2><p className="mt-2 text-raiz-700">Gestiona el catálogo, precios, stock e imágenes.</p><div className="mt-5 flex flex-wrap gap-3"><Link href="/admin" className="inline-block rounded-full bg-raiz-950 px-6 py-4 font-bold text-white">Ver resumen</Link><Link href="/admin/products" className="inline-block rounded-full border border-raiz-950 px-6 py-4 font-bold">Gestionar productos</Link><Link href="/admin/orders" className="inline-block rounded-full border border-raiz-950 px-6 py-4 font-bold">Gestionar pedidos</Link></div></section>}<Link href="/logout" className="mt-8 inline-block text-sm font-bold underline">Cerrar sesión</Link></main>;
}

export default function AccountPage() { return <AccountGate><AccountPageContent /></AccountGate>; }
