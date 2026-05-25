'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { Route } from 'next';
import { ScrollToTop } from '@/components/scroll-to-top';
import { SiteHeader } from '@/components/site-header';
import { CookieConsentPopup } from '@/components/cookie-consent-popup';
import type { ReactNode } from 'react';
import { ACCESS_TOKEN_STORAGE_KEY, getCurrentUser, getRoleHomePath, getRoleKey } from '@/lib/auth';
import { useCookieConsentGate } from '@/hooks/useCookieConsentGate';

export default function PublicLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const isConsentGate = useCookieConsentGate();

  useEffect(() => {
    let cancelled = false;

    async function redirectAuthenticatedUsers() {
      if (typeof window === 'undefined') return;
      const token = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
      if (!token) return;

      if (
        pathname === '/cookies' ||
        pathname === '/privacy-policy' ||
        pathname === '/terms-of-service'
      ) {
        return;
      }

      try {
        const me = await getCurrentUser();
        if (cancelled) return;
        // Customers can browse the marketing site with the profile menu in the header.
        if (getRoleKey(me.user.role) === 'customer') {
          return;
        }
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
    <div className={isConsentGate ? 'min-h-screen bg-white' : 'public-shell min-h-screen bg-slate-950 text-slate-100'}>
      <ScrollToTop />
      {!isConsentGate ? <SiteHeader /> : null}
      {children}
      {!isConsentGate ? <CookieConsentPopup /> : null}
    </div>
  );
}