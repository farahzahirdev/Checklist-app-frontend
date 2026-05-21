'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * App Router layouts persist across navigations, so scroll position is not always
 * reset. Scroll to top on pathname change; honor hash targets when present.
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.length > 1) {
      const id = decodeURIComponent(hash.slice(1));
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ block: 'start' });
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
