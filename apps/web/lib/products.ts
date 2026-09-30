export type Product = { id?: string; slug: string; name: string; description: string; price: number; image: string; category: string; rating: number; reviews: number; inventory?: number };
export const fallbackProducts: Product[] = [
  { slug: 'white-quinoa', name: 'White Quinoa', description: 'A light and versatile white quinoa from the Peruvian Andes, naturally rich in plant-based protein, fibre, and essential nutrients.', price: 6.9, image: '/images/quinoa-white.png', category: 'Peruvian quinoa', rating: 4.9, reviews: 221 },
  { slug: 'red-quinoa', name: 'Red Quinoa', description: 'A hearty red quinoa grown in Peru, with a nutty flavour and a firm texture for colourful European meals.', price: 7.9, image: '/images/quinoa-red.png', category: 'Peruvian quinoa', rating: 4.9, reviews: 184 },
  { slug: 'black-quinoa', name: 'Black Quinoa', description: 'A bold, mineral-rich black quinoa from Peru, selected for European kitchens that value flavour and provenance.', price: 8.5, image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85', category: 'Peruvian quinoa', rating: 4.8, reviews: 146 },
];
const ratingBySlug: Record<string, Pick<Product, 'rating' | 'reviews'>> = {
  'white-quinoa': { rating: 4.9, reviews: 221 },
  'red-quinoa': { rating: 4.9, reviews: 184 },
  'black-quinoa': { rating: 4.8, reviews: 146 },
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
