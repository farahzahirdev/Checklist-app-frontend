'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CustomerUserMenu } from '@/components/customer-user-menu';
import {
  ACCESS_TOKEN_STORAGE_KEY,
  AUTH_STATE_CHANGED_EVENT,
  getCurrentUser,
  getRoleKey,
  getUserDisplayName,
  getUserShortDisplayName,
} from '@/lib/auth';
import { translate, useLocale } from '@/lib/i18n';
import { siteHeaderMessages } from '@/locales/site-header';

type CustomerSession = {
  displayName: string;
  shortName: string;
  role: 'customer' | 'admin' | 'auditor';
};

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { locale, setLocale } = useLocale();
  const t = (key: string) => translate(siteHeaderMessages, locale, key);
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));
  const navLinkClass = (href: string) =>
    isActive(href) ? 'text-[#62a2ff] hover:text-[#8ebdff]' : 'text-[#b3c2dc] hover:text-[#ffffff]';
  const mobileNavLinkClass = (href: string) =>
    isActive(href) ? 'rounded-lg px-2 py-1.5 text-[#62a2ff] hover:bg-[#1f7bff]/20' : 'rounded-lg px-2 py-1.5 text-[#b3c2dc] hover:bg-[#1f7bff]/20';

  const localeLabel = useMemo(() => {
    return locale === 'en' ? t('lang.en') : t('lang.cs');
  }, [locale, t]);

  const [langOpenDesktop, setLangOpenDesktop] = useState(false);
  const [langOpenMobile, setLangOpenMobile] = useState(false);
  const [customerSession, setCustomerSession] = useState<CustomerSession | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const desktopLangRef = useRef<HTMLDivElement | null>(null);
  const mobileLangRef = useRef<HTMLDivElement | null>(null);

  const loadCustomerSession = useCallback(async () => {
    if (typeof window === 'undefined') {
      return;
    }
    const token = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    if (!token) {
      setCustomerSession(null);
      setAuthChecked(true);
      return;
    }
    try {
      const me = await getCurrentUser();
      const role = getRoleKey(me.user.role);
      if (role === 'customer' || role === 'admin' || role === 'auditor') {
        setCustomerSession({
          displayName: getUserDisplayName(me.user),
          shortName: getUserShortDisplayName(me.user),
          role,
        });
      } else {
        setCustomerSession(null);
      }
    } catch {
      setCustomerSession(null);
    } finally {
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    void loadCustomerSession();
    const onAuthStateChanged = () => {
      setAuthChecked(false);
      void loadCustomerSession();
    };
    window.addEventListener(AUTH_STATE_CHANGED_EVENT, onAuthStateChanged);
    return () => window.removeEventListener(AUTH_STATE_CHANGED_EVENT, onAuthStateChanged);
  }, [loadCustomerSession]);

  useEffect(() => {
    function handleDocPointerDown(event: PointerEvent) {
      const target = event.target as Node | null;
      if (target && desktopLangRef.current && !desktopLangRef.current.contains(target)) {
        setLangOpenDesktop(false);
      }
      if (target && mobileLangRef.current && !mobileLangRef.current.contains(target)) {
        setLangOpenMobile(false);
      }
    }
    document.addEventListener('pointerdown', handleDocPointerDown);
    return () => document.removeEventListener('pointerdown', handleDocPointerDown);
  }, []);

  const selectLocale = (next: 'cs' | 'en') => {
    setLocale(next);
    setLangOpenDesktop(false);
    setLangOpenMobile(false);
  };

  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const dashboardHref = customerSession
    ? customerSession.role === 'customer'
      ? '/dashboard'
      : '/admin'
    : null;

  return (
    <header className="relative z-50 border-b border-[#1f3f73] bg-[linear-gradient(120deg,#071733,#0c2144_45%,#13356d)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center px-4 py-4 sm:px-6 md:px-6 lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem]">
        <Link href="/" className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#2f5ba6] bg-[#0b1d3f]">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#62a2ff]" fill="none" aria-hidden="true">
              <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" fill="currentColor" fillOpacity="0.35" stroke="currentColor" strokeWidth="1.8" />
              <path d="m9.4 12.2 1.8 1.8 3.6-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <p className="text-xl font-semibold text-[#edf4ff]">{t('brand.name')}</p>
        </Link>

        <div className="hidden flex-1 justify-center lg:flex">
          <nav className="flex flex-wrap items-center gap-6 text-sm font-medium text-[#d8e2f2]">
            <Link href="/" className={navLinkClass('/')}>
              {t('nav.home')}
            </Link>
            <Link href="/products" className={navLinkClass('/products')}>
              {t('nav.products')}
            </Link>
            <Link href="/contact" className={navLinkClass('/contact')}>
              {t('nav.contact')}
            </Link>
            <Link href="/faq" className={navLinkClass('/faq')}>
              {t('nav.faq')}
            </Link>
          </nav>
        </div>

        <div className="ml-auto hidden items-center gap-3 lg:flex">
          <div className="relative" ref={desktopLangRef}>
            <button
              type="button"
              onClick={() => setLangOpenDesktop((prev) => !prev)}
              aria-label={t('lang.label')}
              aria-haspopup="listbox"
              aria-expanded={langOpenDesktop}
              className="inline-flex min-w-[132px] items-center justify-between gap-3 rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm font-medium text-[#e8f0ff] hover:bg-[#223657]"
            >
              <span className="truncate">{localeLabel}</span>
              <svg
                viewBox="0 0 20 20"
                className={`h-4 w-4 text-[#b8c9e8] transition-transform duration-150 ${langOpenDesktop ? 'rotate-180' : ''}`}
                fill="none"
                aria-hidden="true"
              >
                <path d="m6 8 4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {langOpenDesktop ? (
              <div
                role="listbox"
                aria-label={t('lang.label')}
                className="absolute right-0 z-50 mt-2 w-[132px] overflow-hidden rounded-xl border border-[#284776] bg-[#0b1a39] shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
              >
                <button
                  type="button"
                  role="option"
                  aria-selected={locale === 'cs'}
                  onClick={() => selectLocale('cs')}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm ${
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
                  onClick={() => selectLocale('en')}
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
          {authChecked && customerSession ? (
            <>
              {customerSession.role === 'customer' ? (
                <CustomerUserMenu
                  displayName={customerSession.displayName}
                  shortName={customerSession.shortName}
                />
              ) : null}
              {dashboardHref ? (
                <Link
                  href={dashboardHref}
                  className="rounded-lg border border-[#1f7bff] bg-[#1f7bff] px-4 py-2 text-sm font-medium text-[#f5f8ff] hover:bg-[#2e87ff]"
                >
                  {t('auth.dashboard')}
                </Link>
              ) : null}
            </>
          ) : authChecked ? (
            <>
              <Link
                href="/login"
                className="rounded-lg border border-[#345793] px-4 py-2 text-sm font-medium text-[#e8f0ff] hover:bg-[#1f7bff]/20"
              >
                {t('auth.login')}
              </Link>
              <Link
                href="/products"
                className="rounded-lg border border-[#1f7bff] bg-[#1f7bff] px-4 py-2 text-sm font-medium text-[#f5f8ff] hover:bg-[#2e87ff]"
              >
                {t('auth.getAccess')}
              </Link>
            </>
          ) : (
            <span className="inline-block h-10 w-[148px]" aria-hidden="true" />
          )}
        </div>

        <button
          type="button"
          className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#345793] text-[#e8f0ff] hover:bg-[#1f7bff]/20 lg:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

      </div>

      {mobileOpen ? (
        <nav className="border-t border-[#284776] px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-3 text-sm font-medium text-[#d8e2f2]">
            <Link href="/" className={mobileNavLinkClass('/')} onClick={() => setMobileOpen(false)}>
              {t('nav.home')}
            </Link>
            <Link href="/products" className={mobileNavLinkClass('/products')} onClick={() => setMobileOpen(false)}>
              {t('nav.products')}
            </Link>
            <Link href="/contact" className={mobileNavLinkClass('/contact')} onClick={() => setMobileOpen(false)}>
              {t('nav.contact')}
            </Link>
            <Link href="/faq" className={mobileNavLinkClass('/faq')} onClick={() => setMobileOpen(false)}>
              {t('nav.faq')}
            </Link>
            <div className="mt-1">
              <div className="relative" ref={mobileLangRef}>
                <button
                  type="button"
                  onClick={() => setLangOpenMobile((prev) => !prev)}
                  aria-label={t('lang.label')}
                  aria-haspopup="listbox"
                  aria-expanded={langOpenMobile}
                  className="inline-flex w-full items-center justify-between gap-3 rounded-lg border border-[#345793] bg-[#0b1d3f]/40 px-3 py-2 text-sm font-medium text-[#e8f0ff] hover:bg-[#1f7bff]/15"
                >
                  <span className="truncate">{localeLabel}</span>
                  <svg
                    viewBox="0 0 20 20"
                    className={`h-4 w-4 text-[#b8c9e8] transition-transform duration-150 ${langOpenMobile ? 'rotate-180' : ''}`}
                    fill="none"
                    aria-hidden="true"
                  >
                    <path d="m6 8 4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {langOpenMobile ? (
                  <div
                    role="listbox"
                    aria-label={t('lang.label')}
                    className="mt-2 w-full overflow-hidden rounded-xl border border-[#284776] bg-[#0b1a39] shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
                  >
                    <button
                      type="button"
                      role="option"
                      aria-selected={locale === 'cs'}
                      onClick={() => selectLocale('cs')}
                      className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm ${
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
                      onClick={() => selectLocale('en')}
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
            </div>
            <div className="mt-2">
              {authChecked && customerSession ? (
                <div className="flex flex-col gap-2">
                  {customerSession.role === 'customer' ? (
                    <CustomerUserMenu
                      displayName={customerSession.displayName}
                      shortName={customerSession.shortName}
                      onNavigate={() => setMobileOpen(false)}
                      className="w-full"
                    />
                  ) : null}
                  {dashboardHref ? (
                    <Link
                      href={dashboardHref}
                      className="rounded-lg border border-[#1f7bff] bg-[#1f7bff] px-4 py-2 text-center text-[#f5f8ff] hover:bg-[#2e87ff]"
                      onClick={() => setMobileOpen(false)}
                    >
                      {t('auth.dashboard')}
                    </Link>
                  ) : null}
                </div>
              ) : authChecked ? (
                <div className="flex gap-2">
                  <Link
                    href="/login"
                    className="flex-1 rounded-lg border border-[#345793] px-4 py-2 text-center text-[#e8f0ff] hover:bg-[#1f7bff]/20"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t('auth.login')}
                  </Link>
                  <Link
                    href="/products"
                    className="flex-1 rounded-lg border border-[#1f7bff] bg-[#1f7bff] px-4 py-2 text-center text-[#f5f8ff] hover:bg-[#2e87ff]"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t('auth.getAccess')}
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
