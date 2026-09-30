import { PurchaseControls } from '@/components/PurchaseControls';
import { fallbackProducts, getProducts } from '@/lib/products';
import { notFound } from 'next/navigation';

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = (await getProducts()).find(item => item.slug === params.slug) ?? fallbackProducts.find(item => item.slug === params.slug);
  if (!product) notFound();
  const isWhiteQuinoa = product.slug === 'white-quinoa';

  return <main className="mx-auto max-w-6xl px-6 py-12">
    <a href="/" className="text-sm font-bold">← Back to shop</a>
    <section className="mt-8 grid gap-12 lg:grid-cols-2">
      <img className="h-[540px] w-full rounded-3xl object-cover" src={product.image} alt={product.name} />
      <div><p className="inline-block rounded-full bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">✦ PERUVIAN ORGANIC QUINOA</p><h1 className="mt-5 text-5xl font-semibold tracking-tight">{product.name}</h1><p className="mt-4 text-lg text-amber-600">★★★★★ <b className="text-raiz-950">{product.rating}</b> ({product.reviews} reviews)</p><p className="mt-3 text-sm font-bold uppercase tracking-widest text-raiz-700">Grown in Peru · For Europe</p><p className="mt-6 text-lg leading-relaxed text-raiz-700">{product.description}</p><div className="mt-8 rounded-xl border border-purple-200 bg-purple-100 p-5"><div className="flex justify-between border-b border-purple-200 pb-4"><span>◉ One-time purchase</span><b>{product.price.toFixed(2).replace('.', ',')} €</b></div><div className="flex justify-between pt-4"><span>○ Subscribe &amp; save (12%)</span><b>{(product.price * .88).toFixed(2).replace('.', ',')} €</b></div></div><PurchaseControls productId={product.id} name={product.name} inventory={product.inventory} /><div className="mt-8 grid grid-cols-3 gap-3 border-y py-6 text-center text-xs"><div>♧<br /><b>100% vegan</b><br />No fillers</div><div>◌<br /><b>60-day guarantee</b><br />Full refund</div><div>✦<br /><b>Traceable origin</b><br />Peru to Europe</div></div></div>
    </section>
    {isWhiteQuinoa && <section className="mt-14 grid gap-6 border-t border-raiz-200 pt-12 md:grid-cols-2"><div><p className="font-bold uppercase tracking-widest text-raiz-700">Product information</p><h2 className="mt-3 font-serif text-4xl">Nutrition at a glance</h2><p className="mt-3 max-w-md text-raiz-700">A clear nutrition label for this 500 g whole-grain White Quinoa pack.</p><img src="/images/white-quinoa-nutrition.png" alt="White Quinoa nutrition facts: vegan, high protein and high fibre" className="mt-6 w-full rounded-2xl border border-raiz-200 bg-white object-contain" /></div><div><p className="font-bold uppercase tracking-widest text-raiz-700">Whole grain</p><h2 className="mt-3 font-serif text-4xl">Naturally versatile</h2><p className="mt-3 max-w-md text-raiz-700">A closer look at the naturally pale grains, ready for salads, bowls and everyday European cooking.</p><img src="/images/white-quinoa-grains.png" alt="Close-up of White Quinoa grains" className="mt-6 aspect-square w-full rounded-2xl object-cover" /></div></section>}
  </main>;
}
