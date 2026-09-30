'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type AuthUser = { id: string; email: string; role: string; createdAt: string; updatedAt: string };
type AuthResponse = { user: AuthUser; accessToken: string };
type AuthContextValue = { user: AuthUser | null; token: string | null; ready: boolean; login: (email: string, password: string) => Promise<void>; register: (email: string, password: string) => Promise<void>; logout: () => void };

const AuthContext = createContext<AuthContextValue | null>(null);
const tokenStorageKey = 'raiz-access-token';
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

async function authRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } });
  if (!response.ok) { const body = await response.json().catch(() => null); throw new Error(Array.isArray(body?.message) ? body.message[0] : body?.message ?? 'Authentication failed'); }
  return response.json();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const logout = useCallback(() => { localStorage.removeItem(tokenStorageKey); setToken(null); setUser(null); }, []);
  useEffect(() => { const load = async () => {
    const savedToken = localStorage.getItem(tokenStorageKey);
    if (!savedToken) { setReady(true); return; }
    try { const response = await authRequest<{ user: AuthUser }>('/auth/me', { headers: { Authorization: `Bearer ${savedToken}` } }); setToken(savedToken); setUser(response.user); }
    catch { localStorage.removeItem(tokenStorageKey); }
    finally { setReady(true); }
  }; void load(); }, []);

  const authenticate = useCallback(async (path: '/auth/login' | '/auth/register', email: string, password: string) => {
    const response = await authRequest<AuthResponse>(path, { method: 'POST', body: JSON.stringify({ email, password }) });
    localStorage.setItem(tokenStorageKey, response.accessToken); setToken(response.accessToken); setUser(response.user);
  }, []);
  const login = useCallback((email: string, password: string) => authenticate('/auth/login', email, password), [authenticate]);
  const register = useCallback((email: string, password: string) => authenticate('/auth/register', email, password), [authenticate]);

  return <AuthContext.Provider value={{ user, token, ready, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('useAuth must be used inside AuthProvider'); return value; }
