'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { Route } from 'next';
import { SiteHeader } from '@/components/site-header';
import type { ReactNode } from 'react';
import { ACCESS_TOKEN_STORAGE_KEY, getCurrentUser, getRoleHomePath } from '@/lib/auth';

export default function PublicLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;

    async function redirectAuthenticatedUsers() {
      if (typeof window === 'undefined') return;
      const token = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
      if (!token) return;
      try {
        const me = await getCurrentUser();
        if (cancelled) return;
        const destination = getRoleHomePath(me.user.role) as Route;
        if (pathname !== destination) {
          router.replace(destination);
          router.refresh();
        }
      } catch {
        // Ignore stale tokens and keep public page accessible.
      }
    }

    void redirectAuthenticatedUsers();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <SiteHeader />
      {children}
    </div>
  );
}