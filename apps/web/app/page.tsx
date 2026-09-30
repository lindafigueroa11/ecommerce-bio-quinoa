import Link from 'next/link';
import { CartLink } from '@/components/CartLink';
import { ProductCard } from '@/components/ProductCard';
import { getProducts } from '@/lib/products';

export default async function Home() {
  const products = await getProducts();
  return <main>
    <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-7"><Link href="/" className="font-serif text-4xl font-bold tracking-tighter">ra<span className="text-raiz-coral">í</span>z</Link><nav className="flex gap-6 text-sm font-semibold"><a href="#quinoa">Shop</a><a href="#origin">Origin</a><Link href="/account">Account</Link><CartLink /></nav></header>
    <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2"><div><p className="font-bold uppercase tracking-widest text-raiz-700">✦ From the Peruvian Andes</p><h1 className="mt-5 font-serif text-6xl leading-none tracking-tight">Peruvian quinoa, grown for Europe.</h1><p className="mt-6 max-w-md text-lg leading-relaxed text-raiz-700">Organic quinoa sourced in Peru and delivered to European kitchens with traceable origin and straightforward goodness.</p><a href="#quinoa" className="mt-8 inline-block rounded-full bg-raiz-950 px-6 py-4 font-bold text-white">Explore quinoa →</a></div><img className="h-96 w-full rounded-3xl object-cover" src="https://images.unsplash.com/photo-1586208958839-06c17cacdf08?auto=format&fit=crop&w=1200&q=85" alt="Organic quinoa from Peru" /></section>
    <section id="quinoa" className="bg-raiz-100 py-16"><div className="mx-auto max-w-6xl px-6"><p className="font-bold uppercase tracking-widest text-raiz-700">The collection</p><h2 className="mt-3 font-serif text-4xl">Quinoa from Peru</h2><p className="mt-3 max-w-2xl text-raiz-700">Three naturally distinctive varieties, selected for the European market.</p><div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{products.map(product => <ProductCard key={product.slug} product={product} />)}</div></div></section>
    <section id="origin" className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-3"><div><p className="font-bold uppercase tracking-widest text-raiz-700">Origin</p><h2 className="mt-3 font-serif text-4xl">From Peru to Europe.</h2></div><p className="text-lg leading-relaxed text-raiz-700">Our quinoa begins in the Peruvian Andes, where altitude, soil and careful farming give every grain its character.</p><p className="text-lg leading-relaxed text-raiz-700">We bring that origin to the European market with a focused collection, clear product information and prices in euros.</p></section>
  </main>;
}
