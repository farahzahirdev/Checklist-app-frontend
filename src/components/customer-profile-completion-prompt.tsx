'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { getCustomerProfileCompletion } from '@/lib/customer-profile';
import { translate, useLocale } from '@/lib/i18n';
import { customerLayoutMessages } from '@/locales/customer-layout';

export const PROFILE_COMPLETION_REFRESH_EVENT = 'checklist-profile-completion-refresh';

export function CustomerProfileCompletionPrompt() {
  const pathname = usePathname();
  const { locale } = useLocale();
  const t = (key: string) => translate(customerLayoutMessages, locale, key);
  const [percent, setPercent] = useState(0);
  const [isComplete, setIsComplete] = useState(true);
  const [loading, setLoading] = useState(true);

  const hideOnProfile = pathname === '/profile';

  const loadCompletion = useCallback(async () => {
    try {
      const data = await getCustomerProfileCompletion();
      setPercent(Math.round(data.completion_percent));
      setIsComplete(data.is_complete);
    } catch {
      setIsComplete(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    void loadCompletion();
  }, [loadCompletion, pathname]);

  useEffect(() => {
    const onRefresh = () => {
      void loadCompletion();
    };
    window.addEventListener(PROFILE_COMPLETION_REFRESH_EVENT, onRefresh);
    return () => window.removeEventListener(PROFILE_COMPLETION_REFRESH_EVENT, onRefresh);
  }, [loadCompletion]);

  if (loading || isComplete || hideOnProfile) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed bottom-5 right-5 z-40 flex w-[min(calc(100vw-2rem),22rem)] flex-col gap-3"
      role="region"
      aria-label={t('profileCompletion.title')}
    >
      <div className="pointer-events-auto rounded-2xl border border-[#bfdbfe] bg-white p-4 shadow-[0_12px_40px_rgba(15,23,42,0.14)]">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">{t('profileCompletion.title')}</p>
        <p className="mt-1 text-sm text-[#334155]">{t('profileCompletion.subtitle')}</p>
        <div className="mt-3">
          <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-[#475569]">
            <span>{t('profileCompletion.progressLabel')}</span>
            <span className="text-[#2563eb]">{percent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#e2e8f4]">
            <div
              className="h-full rounded-full bg-[#2563eb] transition-[width] duration-300"
              style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
            />
          </div>
        </div>
        <Link
          href={'/profile' as Route}
          className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
        >
          {t('profileCompletion.cta')}
        </Link>
      </div>
    </div>
  );
}

export function notifyProfileCompletionRefresh() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(PROFILE_COMPLETION_REFRESH_EVENT));
}
