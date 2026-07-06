'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { persistLocaleToProfile, translate, useLocale, type Locale } from '@/lib/i18n';
import { customerLayoutMessages } from '@/locales/customer-layout';

export function CustomerLanguageSwitcher({ fullWidth = false }: { fullWidth?: boolean }) {
  const { locale, setLocale } = useLocale();
  const t = (key: string) => translate(customerLayoutMessages, locale, key);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current) return;
      const target = event.target as Node | null;
      if (target && rootRef.current.contains(target)) return;
      setOpen(false);
    }
    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const currentLabel = useMemo(() => (locale === 'cs' ? t('lang.cs') : t('lang.en')), [locale, t]);

  function choose(next: Locale) {
    setLocale(next);
    persistLocaleToProfile(next);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`${fullWidth ? 'flex w-full justify-between' : 'inline-flex'} items-center gap-2 rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm font-medium text-[#dce8ff] hover:bg-[#223657]`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="font-semibold text-white">{currentLabel}</span>
        <svg
          viewBox="0 0 20 20"
          className={`h-4 w-4 text-[#dce8ff] transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          aria-hidden="true"
        >
          <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open ? (
        <div
          role="listbox"
          className={`${fullWidth ? 'left-0 right-0 w-full' : 'right-0 w-44'} absolute z-30 mt-2 overflow-hidden rounded-xl border border-[#2d4f83] bg-[#0b1a39] shadow-lg`}
        >
          <button
            type="button"
            role="option"
            aria-selected={locale === 'cs'}
            onClick={() => choose('cs')}
            className={`flex w-full items-center justify-between px-3 py-2 text-sm ${
              locale === 'cs' ? 'bg-[#132b57] text-white' : 'text-[#e8f0ff] hover:bg-[#10284f]'
            }`}
          >
            <span>{t('lang.cs')}</span>
            {locale === 'cs' ? <span className="text-xs text-[#9dc5ff]">CS</span> : null}
          </button>
          <button
            type="button"
            role="option"
            aria-selected={locale === 'en'}
            onClick={() => choose('en')}
            className={`flex w-full items-center justify-between px-3 py-2 text-sm ${
              locale === 'en' ? 'bg-[#132b57] text-white' : 'text-[#e8f0ff] hover:bg-[#10284f]'
            }`}
          >
            <span>{t('lang.en')}</span>
            {locale === 'en' ? <span className="text-xs text-[#9dc5ff]">EN</span> : null}
          </button>
        </div>
      ) : null}
    </div>
  );
}

