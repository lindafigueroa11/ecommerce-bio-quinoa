import Link from 'next/link';

export default function CheckoutCancelPage() {
  return <main className="mx-auto max-w-4xl px-6 py-16"><p className="text-sm font-bold uppercase tracking-widest text-raiz-700">Pago cancelado</p><h1 className="mt-4 font-serif text-5xl">Tu pedido sigue pendiente.</h1><p className="mt-4 max-w-xl text-raiz-700">No se ha confirmado ningún pago ni se ha descontado stock. Puedes volver a la cesta y comenzar de nuevo cuando quieras.</p><Link href="/cart" className="mt-8 inline-block rounded-full bg-raiz-950 px-6 py-4 font-bold text-white">Volver a la cesta</Link></main>;
}
