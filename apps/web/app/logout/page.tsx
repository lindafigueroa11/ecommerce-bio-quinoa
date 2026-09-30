'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

export default function LogoutPage() {
  const { logout } = useAuth(); const router = useRouter();
  useEffect(() => { logout(); router.replace('/'); }, [logout, router]);
  return <main className="mx-auto max-w-4xl px-6 py-16">Signing out…</main>;
}
