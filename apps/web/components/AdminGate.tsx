'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

export function AdminGate({ children }: { children: React.ReactNode }) {
  const { ready, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [pathname, ready, router, user]);

  if (!ready || !user) return <main className="mx-auto max-w-5xl px-6 py-16">Verificando tu sesión…</main>;
  if (user.role !== 'ADMIN') return <main className="mx-auto max-w-5xl px-6 py-16"><p className="text-sm font-bold uppercase tracking-widest text-raiz-700">Acceso restringido</p><h1 className="mt-4 font-serif text-5xl">No tienes permisos de administración.</h1></main>;
  return <>{children}</>;
}
