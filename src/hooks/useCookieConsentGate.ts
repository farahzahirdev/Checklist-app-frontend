'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ACCESS_TOKEN_STORAGE_KEY } from '@/lib/auth';
import { hasCookieConsent } from '@/lib/cookie-consent';

/**
 * True when /cookies is shown as a mandatory consent step after login (minimal chrome).
 */
export function useCookieConsentGate(): boolean {
  const pathname = usePathname();
  const [gate, setGate] = useState(false);

  useEffect(() => {
    if (pathname !== '/cookies') {
      setGate(false);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get('postLogin') === '1' || params.get('returnTo')) {
      setGate(true);
      return;
    }

    const token = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    setGate(Boolean(token && !hasCookieConsent()));
  }, [pathname]);

  return gate;
}
