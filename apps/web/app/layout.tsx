import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/components/AuthProvider';
import { CartProvider } from '@/components/CartProvider';
export const metadata: Metadata = { title: 'Raíz | Peruvian quinoa for Europe', description: 'Organic quinoa from Peru for European kitchens.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><AuthProvider><CartProvider>{children}</CartProvider></AuthProvider></body></html>; }
