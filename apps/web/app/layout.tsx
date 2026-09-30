import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/components/AuthProvider';
import { CartProvider } from '@/components/CartProvider';
export const metadata: Metadata = { title: 'Raíz | Orgánico, cerca de ti', description: 'Productos orgánicos de productores locales.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="es"><body><AuthProvider><CartProvider>{children}</CartProvider></AuthProvider></body></html>; }
