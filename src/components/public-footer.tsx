'use client';

import Link from 'next/link';
import { useCookieConsentGate } from '@/hooks/useCookieConsentGate';
import { translate, useLocale } from '@/lib/i18n';
import { publicFooterMessages } from '@/locales/public-footer';

export function PublicFooter() {
  const isConsentGate = useCookieConsentGate();
  const { locale } = useLocale();
  const t = (key: string) => translate(publicFooterMessages, locale, key);

  if (isConsentGate) {
    return null;
  }

  return (
    <footer className="border-t border-[#0f274f] bg-[#040d21]">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-5 text-[#a7b7d3] sm:px-6 md:grid-cols-[1.4fr_1.1fr_1fr_1.1fr] md:px-6">
        <div className="border-b border-[#12315a] pb-4 md:border-b-0 md:border-r md:pb-0 md:pr-6">
          <Link href="/" className="inline-flex items-center gap-2 text-[17px] font-semibold text-white">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#0e2e64] text-[#4e91ff]">
              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden="true">
                <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </span>
            {t('brand.name')}
          </Link>
          <p className="mt-2 max-w-[260px] text-xs leading-5 text-[#8fa4c8]">
            {t('brand.tagline')}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <a
              href="#"
              aria-label={t('social.linkedin')}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#28446f] text-[#a7b7d3] hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M6.94 8.5H3.56V19h3.38V8.5Zm.22-3.24A1.96 1.96 0 0 0 5.25 3.3a1.96 1.96 0 0 0-1.9 1.96c0 1.08.83 1.95 1.9 1.95h.02a1.95 1.95 0 0 0 1.9-1.95ZM20.68 12.98c0-3.16-1.68-4.62-3.94-4.62-1.82 0-2.64 1-3.1 1.71v-1.47h-3.37c.04.98 0 10.4 0 10.4h3.37v-5.8c0-.31.02-.62.11-.84.25-.62.8-1.25 1.74-1.25 1.22 0 1.71.94 1.71 2.3v5.6h3.37v-5.99Z" />
              </svg>
            </a>
            <a
              href="#"
              aria-label={t('social.x')}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#28446f] text-[#a7b7d3] hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M18.9 3H22l-6.77 7.74L23.2 21h-6.24l-4.9-6.4L6.5 21H3.4l7.24-8.27L2.8 3h6.4l4.43 5.85L18.9 3Zm-1.09 16.13h1.72L8.24 4.78H6.4l11.4 14.35Z" />
              </svg>
            </a>
            <a
              href="#"
              aria-label={t('social.email')}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#28446f] text-[#a7b7d3] hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                <path d="M4 7h16v10H4z" stroke="currentColor" strokeWidth="1.8" />
                <path d="m4 8 8 6 8-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </a>
          </div>
        </div>

        <div className="border-b border-[#12315a] pb-4 md:border-b-0 md:border-r md:pb-0 md:pr-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#dbe8ff]">{t('nav.title')}</p>
          <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
            <Link href="/products" className="hover:text-[#dce8ff]">{t('nav.products')}</Link>
            <Link href="/faq" className="hover:text-[#dce8ff]">{t('nav.faq')}</Link>
            <Link href="/contact" className="hover:text-[#dce8ff]">{t('nav.contact')}</Link>
            <Link href="/products/audit-readiness-checklist" className="hover:text-[#dce8ff]">{t('nav.productDetails')}</Link>
          </div>
        </div>

        <div className="border-b border-[#12315a] pb-4 md:border-b-0 md:border-r md:pb-0 md:pr-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#dbe8ff]">{t('legal.title')}</p>
          <div className="mt-2 space-y-1 text-sm">
            <Link href="/privacy-policy" className="block hover:text-[#dce8ff]">{t('legal.privacyPolicy')}</Link>
            <Link href="/cookies" className="block hover:text-[#dce8ff]">{t('legal.cookies')}</Link>
            <Link href="/terms-of-service" className="block hover:text-[#dce8ff]">{t('legal.termsOfService')}</Link>
          </div>
        </div>

        <div className="text-sm">
          <p>{t('rights')}</p>
          <div className="mt-4 inline-flex items-start gap-2 text-[#b5c6e0]">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#0d2b5a] text-[#4d8ef7]">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </span>
            <span className="text-xs leading-5">
              {t('closing.line1')}
              <br />
              {t('closing.line2')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
