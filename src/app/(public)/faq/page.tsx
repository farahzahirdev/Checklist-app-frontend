'use client';

import { useState } from 'react';
import { PublicFooter } from '@/components/public-footer';
import heroBackground from '@/assets/cybersecurity-background-59ognpsy7izka4l9.png';
import { translate, useLocale } from '@/lib/i18n';
import { faqMessages } from '@/locales/faq';
import { useCMSPage } from '@/hooks/useCMSPage';
import { PageRenderer } from '@/components/cms/PageRenderer';

const FAQ_KEYS = [
  { q: 'qa.0.q', a: 'qa.0.a' },
  { q: 'qa.1.q', a: 'qa.1.a' },
  { q: 'qa.2.q', a: 'qa.2.a' },
  { q: 'qa.3.q', a: 'qa.3.a' },
  { q: 'qa.4.q', a: 'qa.4.a' },
  { q: 'qa.5.q', a: 'qa.5.a' },
] as const;

function FaqPageContent() {
  const { locale } = useLocale();
  const t = (key: string) => translate(faqMessages, locale, key);
  const [openIndex, setOpenIndex] = useState<number>(-1);

  const faqs = FAQ_KEYS.map((item) => ({ q: t(item.q), a: t(item.a) }));

  const heroStyle = {
    backgroundImage: `radial-gradient(circle at 20% 20%, rgba(16, 55, 114, 0.62) 0%, rgba(7, 22, 47, 0.72) 45%, rgba(4, 16, 34, 0.78) 100%), url(${heroBackground.src})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  } as const;

  return (
    <main className="overflow-x-hidden bg-[#f3f5fb]">
      <section className="relative overflow-hidden border-b border-[#12315b]" style={heroStyle}>
        <div className="pointer-events-none absolute inset-0 opacity-35">
          <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-[#2262d9]/40 blur-3xl" />
          <div className="absolute right-24 top-6 h-72 w-72 rounded-full bg-[#143f8f]/40 blur-3xl" />
        </div>
        <div className="relative mx-auto flex min-h-[520px] max-w-7xl flex-col justify-center px-4 py-10 sm:px-6 md:px-6 md:py-12 lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem]">
          <p className="inline-flex self-start rounded-full border border-[#255da8] bg-[#12366c] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#9ac3ff] motion-safe:animate-fade-in motion-safe:delay-75">
            {t('hero.kicker')}
          </p>
          <h1 className="public-hero-title mt-4 max-w-3xl text-white motion-safe:animate-fade-in-up motion-safe:delay-100">
            {t('hero.title')}
          </h1>
          <p className="public-hero-subtitle mt-4 max-w-2xl text-[#c7d8f8] motion-safe:animate-fade-in-up motion-safe:delay-200">
            {t('hero.subtitle')}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:px-6 md:py-14 lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem]">
        <div className="rounded-2xl border border-[#dce5f2] bg-[#edf2fa] p-5 transition-shadow duration-300 motion-safe:animate-fade-in-up motion-safe:hover:shadow-md sm:p-6">
          <h2 className="public-section-title text-gray-700">{t('section.title')}</h2>
          <p className="mt-2 text-sm text-gray-500">{t('section.subtitle')}</p>
          <div className="mt-6 space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <article key={faq.q} className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow duration-300 motion-safe:hover:shadow-sm">
                  <button
                    type="button"
                    onClick={() => setOpenIndex((current) => (current === index ? -1 : index))}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <h3 className="text-lg font-semibold text-gray-700">{faq.q}</h3>
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-sm transition ${
                        isOpen
                          ? 'border-gray-300 bg-gray-100 text-gray-600'
                          : 'border-gray-200 bg-gray-50 text-gray-500'
                      }`}
                    >
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div className="border-t border-gray-100 px-6 py-5">
                        <p className="max-w-5xl text-gray-600">{faq.a}</p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 md:px-6 md:pb-14 lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem]">
        <article className="rounded-2xl border border-[#17489b] bg-[linear-gradient(90deg,#0b2f73,#0e3f9d)] p-5 text-white transition-shadow duration-300 motion-safe:animate-fade-in-up motion-safe:hover:shadow-[0_18px_34px_rgba(17,62,148,0.28)] md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-3xl font-semibold">{t('cta.title')}</h3>
              <p className="mt-1 text-sm text-[#d2e2ff]">{t('cta.subtitle')}</p>
            </div>
            <a
              href="/contact"
              className="rounded-xl border border-white/35 bg-white px-5 py-2.5 font-semibold text-[#123e8b] transition-colors duration-200 hover:bg-[#e9f1ff] active:scale-[0.98] motion-safe:active:transition-transform"
            >
              {t('cta.contact')}
            </a>
          </div>
        </article>
      </section>
      <PublicFooter />
    </main>
  );
}

// CMS Integration Wrapper: Renders CMS page for "faq" slug if available, otherwise shows hardcoded content
function FaqPageWithCMS() {
  const { page, loading } = useCMSPage('faq');
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f3f5fb]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#d6e2f7] border-t-[#2f7dff]" />
      </div>
    );
  }

  // PageRenderer handles both CMS page and fallback content
  return <PageRenderer page={page} fallback={<FaqPageContent />} />;
}

export default FaqPageWithCMS;
