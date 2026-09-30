'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

export function AccountGate({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => { if (ready && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`); }, [pathname, ready, router, user]);
  if (!ready || !user) return <main className="mx-auto max-w-5xl px-6 py-16">Cargando tu cuenta…</main>;
  return <>{children}</>;
}
