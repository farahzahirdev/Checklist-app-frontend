'use client';

import Link from 'next/link';
import bgImage from '@/assets/cybersecurity-background-59ognpsy7izka4l9.png';
import { PublicFooter } from '@/components/public-footer';
import { translate, useLocale } from '@/lib/i18n';
import { contactMessages } from '@/locales/contact';

function ArrowRightIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" aria-hidden="true">
      <path d="M4 10h10m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ContactPage() {
  const { locale } = useLocale();
  const t = (key: string) => translate(contactMessages, locale, key);
  const heroStyle = {
    backgroundImage: `linear-gradient(rgba(243, 246, 255, 0.88), rgba(243, 246, 255, 0.92)), url(${bgImage.src})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  } as const;

  return (
    <main className="overflow-x-hidden bg-[#f3f5fb]">
      <section style={heroStyle}>
        <div className="mx-auto grid min-h-[560px] w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 md:px-6 md:py-12 lg:max-w-6xl lg:grid-cols-[1.05fr_0.95fr] xl:max-w-7xl 2xl:max-w-[90rem]">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="public-eyebrow text-[#4d7fd3] motion-safe:animate-fade-in motion-safe:delay-75">{t('hero.kicker')}</p>
              <h1 className="public-hero-title text-[#1a2440] motion-safe:animate-fade-in-up motion-safe:delay-100">{t('hero.title')}</h1>
              <p className="public-hero-subtitle max-w-lg text-[#334768] motion-safe:animate-fade-in-up motion-safe:delay-200">
                {t('hero.subtitle')}
              </p>
            </div>

            <form className="max-w-xl space-y-4 rounded-2xl border border-[#d7deeb] bg-white p-5 shadow-sm transition-shadow duration-300 ease-out motion-safe:animate-fade-in-up motion-safe:delay-300 motion-safe:transition-transform motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-lg sm:p-6">
              <label className="block">
                <span className="text-sm font-medium text-[#2d3f62]">{t('form.name')}</span>
                <input
                  type="text"
                  className="mt-1 w-full rounded-lg border border-[#d5deef] bg-[#f7f9ff] px-3 py-2 text-[#1d2a42] outline-none ring-[#2f7dff]/35 transition-shadow duration-200 focus:bg-white focus:ring-2"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-[#2d3f62]">{t('form.email')}</span>
                <input
                  type="email"
                  className="mt-1 w-full rounded-lg border border-[#d5deef] bg-[#f7f9ff] px-3 py-2 text-[#1d2a42] outline-none ring-[#2f7dff]/35 transition-shadow duration-200 focus:bg-white focus:ring-2"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-[#2d3f62]">{t('form.company')}</span>
                <input
                  type="text"
                  className="mt-1 w-full rounded-lg border border-[#d5deef] bg-[#f7f9ff] px-3 py-2 text-[#1d2a42] outline-none ring-[#2f7dff]/35 transition-shadow duration-200 focus:bg-white focus:ring-2"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-[#2d3f62]">{t('form.message')}</span>
                <textarea
                  rows={3}
                  placeholder={t('form.messagePlaceholder')}
                  className="mt-1 w-full rounded-lg border border-[#d5deef] bg-[#f7f9ff] px-3 py-2 text-[#1d2a42] outline-none ring-[#2f7dff]/35 transition-shadow duration-200 focus:bg-white focus:ring-2"
                />
              </label>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-[#1f7bff] bg-[#1f7bff] px-6 py-3 text-lg font-semibold text-white transition-colors duration-200 hover:bg-[#2e87ff] active:scale-[0.98] motion-safe:active:transition-transform"
              >
                {t('form.sendMessage')}
                <ArrowRightIcon />
              </button>
            </form>
          </div>

          <div className="flex items-start lg:pt-[86px]">
            <div className="w-full max-w-xl rounded-2xl border border-[#d7deeb] bg-white p-6 shadow-sm transition-shadow duration-300 ease-out motion-safe:animate-fade-in-right motion-safe:delay-200 motion-safe:transition-transform motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-lg sm:p-8">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e7eeff] text-[#2f7dff]">
                <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" aria-hidden="true">
                  <rect x="3" y="5.5" width="18" height="13" rx="2.4" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <h2 className="mt-5 text-2xl font-semibold text-[#1f2741] sm:text-3xl">{t('direct.title')}</h2>
              <p className="mt-2 text-lg text-[#4c5f80] sm:text-xl">{t('direct.subtitle')}</p>
              <p className="mt-6 inline-flex max-w-full items-center gap-3 break-all text-lg font-semibold text-[#1f2741] sm:text-2xl lg:text-3xl">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#e7eeff] text-[#2f7dff]">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                    <path d="M3 7.5h18v9H3z" stroke="currentColor" strokeWidth="1.8" />
                    <path d="m3.5 8 8.5 6 8.5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                info@checklistkb.com
              </p>
              <p className="mt-5 text-lg text-[#4c5f80] sm:text-xl">{t('direct.response')}</p>
            </div>
          </div>
        </div>
      </section>

      <section style={heroStyle}>
        <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 md:px-6 md:py-14 lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem]">
          <h2 className="public-section-title text-[#1a2440] motion-safe:animate-fade-in-up">{t('cta.title')}</h2>
          <p className="public-section-subtitle mx-auto mt-3 max-w-3xl text-[#495b7a] motion-safe:animate-fade-in-up motion-safe:delay-100">
            {t('cta.subtitle')}
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 motion-safe:animate-fade-in-up motion-safe:delay-200">
            <Link
              href="/register"
              className="inline-flex min-w-[240px] items-center justify-center gap-2 rounded-xl border border-[#1f7bff] bg-[#1f7bff] px-8 py-3 text-xl font-semibold text-white transition-colors duration-200 hover:bg-[#2e87ff] active:scale-[0.98] motion-safe:active:transition-transform"
            >
              {t('cta.getAccess')}
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
            <Link
              href="/products/audit-readiness-checklist"
              className="inline-flex min-w-[240px] items-center justify-center gap-2 rounded-xl border border-[#cfd8ea] bg-white/85 px-8 py-3 text-xl font-semibold text-[#233553] transition-colors duration-200 hover:bg-white active:scale-[0.98] motion-safe:active:transition-transform"
            >
              {t('cta.viewProducts')}
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:px-6 md:py-10 lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem]">
        <div className="rounded-2xl border border-[#d7deeb] bg-white p-5 shadow-sm transition-shadow duration-300 motion-safe:animate-fade-in-up motion-safe:hover:shadow-md md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-[#d7deeb] bg-[#eef2ff] text-[#2f7dff]">
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden="true">
                  <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              </span>
              <div>
                <p className="text-2xl font-semibold text-[#1f2741] md:text-3xl">{t('bottom.title')}</p>
                <p className="mt-1 text-base text-[#546684] md:text-lg">{t('bottom.subtitle')}</p>
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#1f7bff] bg-[#1f7bff] px-7 py-3 text-base font-semibold text-white transition-colors duration-200 hover:bg-[#2e87ff] active:scale-[0.98] motion-safe:active:transition-transform md:text-lg"
              >
                {t('cta.getAccess')}
                <ArrowRightIcon />
              </Link>
              <Link
                href="/products/audit-readiness-checklist"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#cfd8ea] bg-white px-7 py-3 text-base font-semibold text-[#233553] transition-colors duration-200 hover:bg-[#f7f9ff] active:scale-[0.98] motion-safe:active:transition-transform md:text-lg"
              >
                {t('cta.viewProducts')}
                <ArrowRightIcon />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
