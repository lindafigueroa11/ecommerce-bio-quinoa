'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

function safeNext(value: string | null) { return value?.startsWith('/') && !value.startsWith('//') ? value : '/checkout'; }

function LoginForm() {
  const { login, ready, user } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const destination = safeNext(params.get('next'));
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState<string | null>(null); const [sending, setSending] = useState(false);
  useEffect(() => { if (ready && user) router.replace(destination); }, [destination, ready, router, user]);
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setSending(true); setError(null); try { await login(email, password); router.replace(destination); } catch (reason) { setError(reason instanceof Error ? reason.message : 'We could not sign you in.'); setSending(false); } };
  return <main className="mx-auto max-w-md px-6 py-16"><Link href="/" className="text-sm font-bold">← Back to shop</Link><h1 className="mt-8 font-serif text-5xl">Sign in</h1><form onSubmit={submit} className="mt-8 space-y-4"><label className="block"><span className="text-sm font-bold">Email</span><input required type="email" value={email} onChange={event => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-raiz-200 px-4 py-3" /></label><label className="block"><span className="text-sm font-bold">Password</span><input required minLength={8} type="password" value={password} onChange={event => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-raiz-200 px-4 py-3" /></label>{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}<button disabled={sending || !ready} className="w-full rounded-full bg-raiz-950 px-6 py-4 font-bold text-white disabled:opacity-60">{sending ? 'Signing in…' : 'Sign in'}</button></form><p className="mt-6 text-sm text-raiz-700">New here? <Link href={`/register?next=${encodeURIComponent(destination)}`} className="font-bold underline">Create an account</Link></p></main>;
}

export default function LoginPage() { return <Suspense fallback={<main className="mx-auto max-w-md px-6 py-16">Loading…</main>}><LoginForm /></Suspense>; }
