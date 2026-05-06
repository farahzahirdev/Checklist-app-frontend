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
    try {
      await logoutAccount();
    } catch {
      // API logout is stateless; still clear client token.
    } finally {
      persistAccessToken(null);
      setLoading(false);
      router.push('/login');
      router.refresh();
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
