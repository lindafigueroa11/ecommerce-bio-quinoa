'use client';

import Link from 'next/link';
import { AccountGate } from '@/components/AccountGate';
import { useAuth } from '@/components/AuthProvider';

function AccountPageContent() {
  const { user } = useAuth();
  return <main className="mx-auto max-w-5xl px-6 py-12"><Link href="/" className="text-sm font-bold">← Back to shop</Link><p className="mt-8 text-sm font-bold uppercase tracking-widest text-raiz-700">My account</p><h1 className="mt-4 font-serif text-5xl">Hello, {user!.email}</h1><section className="mt-8 rounded-2xl bg-raiz-100 p-6"><h2 className="text-xl font-bold">Your orders</h2><p className="mt-2 text-raiz-700">Check the status and details of every purchase.</p><Link href="/account/orders" className="mt-5 inline-block rounded-full bg-raiz-950 px-6 py-4 font-bold text-white">View my orders</Link></section>{user?.role === 'ADMIN' && <section className="mt-5 rounded-2xl border border-raiz-700/20 p-6"><h2 className="text-xl font-bold">Administration</h2><p className="mt-2 text-raiz-700">Manage the catalogue, prices, stock and images.</p><div className="mt-5 flex flex-wrap gap-3"><Link href="/admin" className="inline-block rounded-full bg-raiz-950 px-6 py-4 font-bold text-white">View overview</Link><Link href="/admin/products" className="inline-block rounded-full border border-raiz-950 px-6 py-4 font-bold">Manage products</Link><Link href="/admin/orders" className="inline-block rounded-full border border-raiz-950 px-6 py-4 font-bold">Manage orders</Link></div></section>}<Link href="/logout" className="mt-8 inline-block text-sm font-bold underline">Sign out</Link></main>;
}

export default function AccountPage() { return <AccountGate><AccountPageContent /></AccountGate>; }
