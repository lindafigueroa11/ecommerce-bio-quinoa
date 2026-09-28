export type Product = { id?: string; slug: string; name: string; description: string; price: number; image: string; category: string; rating: number; reviews: number; inventory?: number };
export const fallbackProducts: Product[] = [
  { slug:'white-quinoa', name:'White quinoa', description:'A light and versatile white quinoa, naturally rich in plant-based protein, fiber, and essential nutrients into one simple scoop.', price:6.9, image:'https://images.unsplash.com/photo-1586208958839-06c17cacdf08?auto=format&fit=crop&w=900&q=85', category:'Despensa', rating:4.9, reviews:221 },
  { slug:'manzanas-gala', name:'Manzanas Gala', description:'Dulces, crujientes y recién cosechadas.', price:3.95, image:'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=900&q=85', category:'Fruta y verdura', rating:4.9, reviews:128 },
  { slug:'miel-romero', name:'Miel de romero', description:'Miel cruda artesanal de floración de romero.', price:8.5, image:'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=900&q=85', category:'Despensa', rating:4.8, reviews:97 }
];
const ratingBySlug: Record<string, Pick<Product, 'rating' | 'reviews'>> = {
  'white-quinoa': { rating: 4.9, reviews: 221 },
  'manzanas-gala': { rating: 4.9, reviews: 128 },
  'miel-romero': { rating: 4.8, reviews: 97 },
};

export async function getProducts(): Promise<Product[]> {
  try {
    const apiUrl = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${apiUrl}/products`, { cache: 'no-store' });
    if (!response.ok) return fallbackProducts;
    const products: Array<{ id: string; slug: string; name: string; description: string; price: number; imageUrl: string; category: string; inventory: number }> = await response.json();
    return products.length ? products.map(product => ({ ...product, price: product.price / 100, image: product.imageUrl, ...(ratingBySlug[product.slug] ?? { rating: 4.9, reviews: 0 }) })) : fallbackProducts;
  } catch { return fallbackProducts; }
}
