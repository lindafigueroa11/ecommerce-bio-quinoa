import './globals.css';
import type { Metadata } from 'next';
import { CartProvider } from '@/components/CartProvider';
export const metadata: Metadata = { title: 'Raíz | Orgánico, cerca de ti', description: 'Productos orgánicos de productores locales.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="es"><body><CartProvider>{children}</CartProvider></body></html>; }
