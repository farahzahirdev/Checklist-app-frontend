'use client';

import { useCallback, useMemo } from 'react';
import { translate, useLocale } from '@/lib/i18n';
import { customerReportMessages } from '@/locales/customer-report';

/**
 * Support strip + brand footer for the customer report page (rendered at page bottom).
 */
export function CustomerReportPageFooter() {
  const { locale } = useLocale();
  const t = useCallback(
    (key: string, values?: Record<string, string>) => translate(customerReportMessages, locale, key, values),
    [locale]
  );

  const pillars = useMemo(
    () => [
      { title: t('footer.pillar.secure.title'), body: t('footer.pillar.secure.body') },
      { title: t('footer.pillar.private.title'), body: t('footer.pillar.private.body') },
      { title: t('footer.pillar.reliable.title'), body: t('footer.pillar.reliable.body') },
    ],
    [t]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-[#bfdbfe] bg-[#e8f2ff] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
        <div className="flex gap-3 sm:gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#0066ff] shadow-sm" aria-hidden>
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 3l8 4v5c0 5-3.5 9.5-8 11-4.5-1.5-8-6-8-11V7l8-4Z" strokeLinejoin="round" />
              <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="text-base font-bold text-[#0066ff] sm:text-lg">{t('footer.support.title')}</p>
            <p className="mt-0.5 text-sm text-[#475569]">{t('footer.support.body')}</p>
          </div>
        </div>
        <a
          href="mailto:hello@checklistkb.com"
          className="inline-flex items-center gap-2 self-start rounded-xl border border-white/80 bg-white px-4 py-2.5 text-sm font-semibold text-[#0066ff] shadow-sm sm:self-center"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M4 6h16v12H4z" strokeLinejoin="round" />
            <path d="m4 7 8 6 8-6" strokeLinecap="round" />
          </svg>
          hello@checklistkb.com
        </a>
      </div>

      <footer className="rounded-2xl bg-[#050a14] px-5 py-8 text-white sm:px-8 sm:py-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1e3a8a] text-[#93c5fd]" aria-hidden>
                <svg viewBox="0 0 24 28" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 2 20 6v8c0 6-4 11-8 12-4-1-8-6-8-12V6l8-4Z" strokeLinejoin="round" />
                  <path d="M9 12l2 2 4-4" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-lg font-semibold">Checklist KB</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#94a3b8]">{t('footer.brand.tagline')}</p>
          </div>

          <div className="grid flex-1 gap-6 sm:grid-cols-3 lg:max-w-2xl">
            {pillars.map((item) => (
              <div key={item.title} className="flex gap-3">
                <span className="mt-0.5 text-[#3b82f6]" aria-hidden>
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 3l8 4v5c0 5-3.5 9.5-8 11-4.5-1.5-8-6-8-11V7l8-4Z" strokeLinejoin="round" />
                  </svg>
                </span>
                <div>
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-sm text-[#94a3b8]">{item.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:text-right">
            <a href="https://checklistkb.com" className="text-sm font-semibold text-white hover:text-[#93c5fd] sm:text-base">
              checklistkb.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
