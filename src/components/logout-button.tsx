'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { logoutAccount, persistAccessToken } from '@/lib/auth';
import { translate, useLocale } from '@/lib/i18n';
import { customerLayoutMessages } from '@/locales/customer-layout';

export function LogoutButton() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = (key: string) => translate(customerLayoutMessages, locale, key);
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    // Clear local token and navigate immediately to avoid any in-flight
    // authenticated API calls using the old token. Call server logout
    // in the background (best-effort).
    try {
      persistAccessToken(null);
      // Replace history to avoid back-navigation returning to protected pages
      void router.replace('/login');
      // fire-and-forget server logout
      void logoutAccount().catch(() => {
        /* swallow errors - token already cleared locally */
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="rounded-lg border border-[#345793] px-3 py-1.5 text-sm text-[#d8e2f2] hover:bg-[#1f7bff]/20 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? t('actions.loggingOut') : t('actions.logout')}
    </button>
  );
}
