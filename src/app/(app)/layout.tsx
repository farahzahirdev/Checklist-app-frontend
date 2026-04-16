'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { Route } from 'next';
import { LogoutButton } from '@/components/logout-button';
import { ACCESS_TOKEN_STORAGE_KEY, getCurrentUser, getRoleKey, type UserRoleKey } from '@/lib/auth';

export default function AppLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const [authReady, setAuthReady] = useState(false);
  const [role, setRole] = useState<UserRoleKey | ''>('');
  const isAdminPath = pathname?.startsWith('/admin') ?? false;

  function canAccessPath(currentRole: UserRoleKey, currentPath: string): boolean {
    if (currentPath.startsWith('/admin')) {
      return currentRole === 'admin';
    }
    if (currentPath.startsWith('/auditor')) {
      return currentRole === 'auditor' || currentRole === 'admin';
    }
    if (currentPath.startsWith('/reports')) {
      return currentRole === 'admin' || currentRole === 'auditor';
    }
    if (currentPath.startsWith('/assessment')) {
      return currentRole === 'customer';
    }
    if (currentPath.startsWith('/access')) {
      return currentRole === 'customer';
    }
    return true;
  }

  function defaultPathForRole(currentRole: UserRoleKey): string {
    if (currentRole === 'admin') {
      return '/admin';
    }
    if (currentRole === 'auditor') {
      return '/auditor';
    }
    return '/dashboard';
  }

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      if (typeof window === 'undefined') {
        return;
      }
      const token = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
      if (!token) {
        router.push('/login');
        return;
      }
      try {
        const response = await getCurrentUser();
        if (cancelled) return;
        setRole(getRoleKey(response.user.role));
        setAuthReady(true);
      } catch {
        window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
        if (!cancelled) {
          router.push('/login');
        }
      }
    }

    void checkAuth();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (!authReady) return;
    if (!pathname) return;
    if (!role) return;
    if (!canAccessPath(role, pathname)) {
      router.push(defaultPathForRole(role) as Route);
    }
  }, [authReady, pathname, role, router]);

  if (!authReady) {
    return (
      <main className="min-h-screen px-6 py-8 text-[#ffffff] md:py-10">
        <div className="mx-auto max-w-7xl rounded-2xl border border-[#2f4d82] bg-[#07112a]/85 p-6 text-sm text-[#d8e2f2]">
          Validating session...
        </div>
      </main>
    );
  }

  return (
    isAdminPath ? (
      <main className="min-h-screen bg-[#e9eef8] text-[#ffffff]">{children}</main>
    ) : (
      <main className="min-h-screen px-6 py-8 text-[#ffffff] md:py-10">
        <div className="mx-auto max-w-7xl">
          <header className="mb-8 rounded-3xl border border-[#2f4d82] bg-[#07112a]/85 p-5 backdrop-blur md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-[#9dc5ff]">Checklist App</p>
                <p className="mt-2 text-xl font-semibold text-white md:text-2xl">Secure Access Workspace</p>
              </div>
              <nav className="flex items-center gap-3 text-sm text-[#d8e2f2]">
                <Link href="/" className="rounded-lg border border-[#345793] px-3 py-1.5 hover:bg-[#1f7bff]/20">
                  Public
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded-lg border border-[#1f7bff] bg-[#1f7bff]/25 px-3 py-1.5 text-[#f3f8ff] hover:bg-[#1f7bff]/35"
                >
                  Dashboard
                </Link>
                <Link href="/assessment" className="rounded-lg border border-[#345793] px-3 py-1.5 hover:bg-[#1f7bff]/20">
                  Assessment
                </Link>
                <Link href="/access" className="rounded-lg border border-[#345793] px-3 py-1.5 hover:bg-[#1f7bff]/20">
                  Access
                </Link>
                <Link href="/reports" className="rounded-lg border border-[#345793] px-3 py-1.5 hover:bg-[#1f7bff]/20">
                  Reports
                </Link>
                <Link href="/products/audit-readiness-checklist" className="rounded-lg border border-[#345793] px-3 py-1.5 hover:bg-[#1f7bff]/20">
                  Product Details
                </Link>
                <Link href="/admin/checklists" className="rounded-lg border border-[#345793] px-3 py-1.5 hover:bg-[#1f7bff]/20">
                  Admin
                </Link>
                <Link href="/health" className="rounded-lg border border-[#345793] px-3 py-1.5 hover:bg-[#1f7bff]/20">
                  Health
                </Link>
                <LogoutButton />
              </nav>
            </div>
          </header>

          {children}
        </div>
      </main>
    )
  );
}