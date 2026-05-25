'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { hasPreferenceCookieConsent } from '@/lib/cookie-consent';

export const LOCALE_STORAGE_KEY = 'checklist_locale';
export const SUPPORTED_LOCALES = ['cs', 'en'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export type TranslationDictionary = Record<string, string>;
export type TranslationMessages = Partial<Record<Locale, TranslationDictionary>>;

export const DEFAULT_LOCALE: Locale = 'cs';
const LOCALE_CHANGE_EVENT = 'checklist_locale_change';
const LANGUAGE_PREFERENCE_COOKIE_NAME = 'user_language_preference';

function persistLanguagePreferenceCookie(locale: Locale) {
  if (typeof document === 'undefined') return;

  if (!hasPreferenceCookieConsent()) {
    document.cookie = `${LANGUAGE_PREFERENCE_COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax`;
    return;
  }

  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${LANGUAGE_PREFERENCE_COOKIE_NAME}=${encodeURIComponent(locale)}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
}

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

  return DEFAULT_LOCALE;
}

/** Stable subscribe so every `useLocale()` consumer shares one external store (localStorage + events). */
function subscribeLocale(onStoreChange: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }
  function onCustom() {
    onStoreChange();
  }
  function onStorage(event: StorageEvent) {
    if (event.key === LOCALE_STORAGE_KEY || event.key === null) {
      onStoreChange();
    }
  }
  window.addEventListener(LOCALE_CHANGE_EVENT, onCustom);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(LOCALE_CHANGE_EVENT, onCustom);
    window.removeEventListener('storage', onStorage);
  };
}

function getLocaleSnapshot(): Locale {
  return resolveBrowserLocale();
}

function getServerLocaleSnapshot(): Locale {
  return DEFAULT_LOCALE;
}

/**
 * Locale from localStorage, shared across the app. Uses `useSyncExternalStore` so the admin navbar
 * and nested pages (e.g. bulk import modal) always read the same language after switching.
 */
export function useLocale() {
  const locale = useSyncExternalStore(subscribeLocale, getLocaleSnapshot, getServerLocaleSnapshot);

  const setLocale = useCallback((nextLocale: Locale) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
    persistLanguagePreferenceCookie(nextLocale);
    window.dispatchEvent(new CustomEvent(LOCALE_CHANGE_EVENT, { detail: nextLocale }));
  }, []);

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

/** Like `translate`, but returns `fallback` when no message exists for `key`. */
export function translateOr(
  messages: TranslationMessages,
  locale: Locale,
  key: string,
  fallback: string,
  values?: Record<string, string>,
) {
  const hasLocale = Boolean(messages[locale]?.[key]);
  const hasDefault = Boolean(messages[DEFAULT_LOCALE]?.[key]);
  if (!hasLocale && !hasDefault) {
    return fallback;
  }
  return translate(messages, locale, key, values);
}
