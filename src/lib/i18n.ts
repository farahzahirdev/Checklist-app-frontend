'use client';

import { useEffect, useState } from 'react';

export const LOCALE_STORAGE_KEY = 'checklist_locale';
export const SUPPORTED_LOCALES = ['en', 'es', 'fr', 'de'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export type TranslationDictionary = Record<string, string>;
export type TranslationMessages = Partial<Record<Locale, TranslationDictionary>>;

export const DEFAULT_LOCALE: Locale = 'en';

export function isLocale(value: string): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale);
}

function resolveBrowserLocale(): Locale {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE;
  }

  const savedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  if (savedLocale && isLocale(savedLocale)) {
    return savedLocale;
  }

  const browserLocale = window.navigator.language.toLowerCase();
  const browserLocalePrefix = browserLocale.split('-')[0];
  if (browserLocalePrefix && isLocale(browserLocalePrefix)) {
    return browserLocalePrefix;
  }

  return DEFAULT_LOCALE;
}

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    setLocaleState(resolveBrowserLocale());
  }, []);

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
    }
  };

  return { locale, setLocale };
}

export function translate(
  messages: TranslationMessages,
  locale: Locale,
  key: string,
  values?: Record<string, string>
) {
  const template = messages[locale]?.[key] ?? messages[DEFAULT_LOCALE]?.[key] ?? key;
  if (!values) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (_, token: string) => values[token] ?? `{${token}}`);
}
