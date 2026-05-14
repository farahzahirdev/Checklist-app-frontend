'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { translate, useLocale } from '@/lib/i18n';
import { adminMessages } from '@/locales/admin';

type AdminLanguageSwitcherProps = {
  /** Full-width control (e.g. admin mobile sidebar). */
  fullWidth?: boolean;
  /** Dropdown alignment when not full width. */
  align?: 'left' | 'right';
};

export function AdminLanguageSwitcher({ fullWidth = false, align = 'right' }: AdminLanguageSwitcherProps) {
  const { locale, setLocale } = useLocale();
  const t = (key: string) => translate(adminMessages, locale, key);
  const localeLabel = useMemo(() => translate(adminMessages, locale, `lang.${locale}`), [locale]);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleDocPointerDown(event: PointerEvent) {
      const target = event.target as Node | null;
      if (target && langRef.current && !langRef.current.contains(target)) {
        setLangOpen(false);
      }
    }
    document.addEventListener('pointerdown', handleDocPointerDown);
    return () => document.removeEventListener('pointerdown', handleDocPointerDown);
  }, []);

  const listAlign = fullWidth ? 'left-0 right-0 w-full' : align === 'right' ? 'right-0 min-w-[9rem]' : 'left-0 min-w-[9rem]';

  return (
    <div className={`relative ${fullWidth ? 'w-full' : ''}`} ref={langRef}>
      <button
        type="button"
        onClick={() => setLangOpen((prev) => !prev)}
        aria-label={t('lang.label')}
        aria-haspopup="listbox"
        aria-expanded={langOpen}
        className={`inline-flex items-center justify-between gap-2 rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm font-semibold text-[#dce8ff] hover:bg-[#223657] ${
          fullWidth ? 'w-full' : 'min-w-[7.5rem]'
        }`}
      >
        <span>{localeLabel}</span>
        <svg
          viewBox="0 0 20 20"
          className={`h-4 w-4 shrink-0 text-[#b8c9e8] transition-transform duration-150 ${langOpen ? 'rotate-180' : ''}`}
          fill="none"
          aria-hidden="true"
        >
          <path d="m6 8 4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {langOpen ? (
        <div
          role="listbox"
          aria-label={t('lang.label')}
          className={`absolute z-50 mt-2 overflow-hidden rounded-xl border border-[#2d4f83] bg-[#0b1a39] shadow-[0_18px_40px_rgba(0,0,0,0.45)] ${listAlign}`}
        >
          <button
            type="button"
            role="option"
            aria-selected={locale === 'cs'}
            onClick={() => {
              setLocale('cs');
              setLangOpen(false);
            }}
            className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm ${
              locale === 'cs' ? 'bg-[#17376d] text-white' : 'text-[#e8f0ff] hover:bg-[#173160]'
            }`}
          >
            <span>{t('lang.cs')}</span>
            {locale === 'cs' ? <span className="text-xs text-[#9ac3ff]">✓</span> : null}
          </button>
          <button
            type="button"
            role="option"
            aria-selected={locale === 'en'}
            onClick={() => {
              setLocale('en');
              setLangOpen(false);
            }}
            className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm ${
              locale === 'en' ? 'bg-[#17376d] text-white' : 'text-[#e8f0ff] hover:bg-[#173160]'
            }`}
          >
            <span>{t('lang.en')}</span>
            {locale === 'en' ? <span className="text-xs text-[#9ac3ff]">✓</span> : null}
          </button>
        </div>
      ) : null}
    </div>
  );
}
