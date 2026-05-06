'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { PublicFooter } from '@/components/public-footer';
import heroBackground from '@/assets/cybersecurity-background-59ognpsy7izka4l9.png';
import { translate, useLocale } from '@/lib/i18n';
import { productsMessages } from '@/locales/products';

const DOCUMENT_CATEGORIES = ['All', 'Access & Identity', 'Devices & Endpoints', 'Data Protection', 'Operations', 'Governance', 'Response'] as const;

export type DocumentationCategory = (typeof DOCUMENT_CATEGORIES)[number];

type DocumentationSection = {
  id: 'mobileDevice' | 'remoteWork' | 'accessControl' | 'incidentResponse' | 'dataClassification' | 'securityGovernance';
  name: string;
  price: string;
  subtitle: string;
  badge?: string;
  points: string[];
  category: Exclude<DocumentationCategory, 'All'>;
};

const DOCUMENT_SECTIONS: DocumentationSection[] = [
  {
    id: 'mobileDevice',
    name: 'Mobile Device Policy',
    price: '€149',
    subtitle: 'Define rules for corporate and personal mobile devices.',
    badge: 'Popular',
    category: 'Devices & Endpoints',
    points: ['Policy Document', 'User Guidelines', 'Admin Guidelines'],
  },
  {
    id: 'remoteWork',
    name: 'Remote Work Policy',
    price: '€149',
    subtitle: 'Secure and productive remote work, clearly defined.',
    category: 'Operations',
    points: ['Policy Document', 'User Guidelines', 'Admin Guidelines'],
  },
  {
    id: 'accessControl',
    name: 'Access Control Policy',
    price: '€179',
    subtitle: 'Manage who has access to what, and under which conditions.',
    category: 'Access & Identity',
    points: ['Policy Document', 'User Guidelines', 'Admin Guidelines', 'Admin Guidelines (Advanced)'],
  },
  {
    id: 'incidentResponse',
    name: 'Incident Response Policy',
    price: '€199',
    subtitle: 'Be ready when incidents happen. Act fast. Act right.',
    category: 'Response',
    points: ['Policy Document', 'User Guidelines', 'Admin Guidelines', 'Response Playbooks'],
  },
  {
    id: 'dataClassification',
    name: 'Data Classification Policy',
    price: '€149',
    subtitle: 'Define how data is labeled, handled, and protected.',
    category: 'Data Protection',
    points: ['Policy Document', 'User Guidelines', 'Admin Guidelines'],
  },
  {
    id: 'securityGovernance',
    name: 'Security Governance Policy',
    price: '€189',
    subtitle: 'Roles, accountability, and oversight for your information security program.',
    category: 'Governance',
    points: ['Policy Document', 'User Guidelines', 'Admin Guidelines'],
  },
];

function CheckBadgeIcon() {
  return (
    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#ddf5e8] text-[#2f9c65]">
      <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" aria-hidden="true">
        <path d="m4.2 8.1 2.2 2.2 5.2-5.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export default function ProductsPage() {
  const { locale } = useLocale();
  const t = (key: string, values?: Record<string, string>) => translate(productsMessages, locale, key, values);
  const [activeCategory, setActiveCategory] = useState<DocumentationCategory>('All');

  const pointKey = (point: string) => {
    if (point === 'Policy Document') return 'docPoint.policyDocument';
    if (point === 'User Guidelines') return 'docPoint.userGuidelines';
    if (point === 'Admin Guidelines') return 'docPoint.adminGuidelines';
    if (point === 'Admin Guidelines (Advanced)') return 'docPoint.adminGuidelinesAdvanced';
    if (point === 'Response Playbooks') return 'docPoint.responsePlaybooks';
    return point;
  };

  const sections = useMemo(() => {
    return DOCUMENT_SECTIONS.map((doc) => ({
      ...doc,
      name: t(`doc.${doc.id}.name`),
      subtitle: t(`doc.${doc.id}.subtitle`),
      points: doc.points.map((p) => {
        const key = pointKey(p);
        return key === p ? p : t(key);
      }),
      badge: doc.badge ? t('common.popular') : undefined,
    }));
  }, [locale]);

  const filteredSections = useMemo(() => {
    if (activeCategory === 'All') return sections;
    return sections.filter((doc) => doc.category === activeCategory);
  }, [activeCategory, sections]);

  const categoryLabel = (category: DocumentationCategory) => {
    if (category === 'All') return t('filters.all');
    if (category === 'Access & Identity') return t('filters.accessIdentity');
    if (category === 'Devices & Endpoints') return t('filters.devicesEndpoints');
    if (category === 'Data Protection') return t('filters.dataProtection');
    if (category === 'Operations') return t('filters.operations');
    if (category === 'Governance') return t('filters.governance');
    return t('filters.response');
  };

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
        <div className="relative mx-auto grid min-h-[520px] max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 md:px-6 md:py-12 lg:max-w-6xl lg:grid-cols-[1.05fr_0.95fr] xl:max-w-7xl 2xl:max-w-[90rem]">
          <div>
            <p className="inline-flex rounded-full border border-[#255da8] bg-[#12366c] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#9ac3ff] motion-safe:animate-fade-in motion-safe:delay-75">
              {t('hero.kicker')}
            </p>
            <h1 className="public-hero-title mt-4 text-white motion-safe:animate-fade-in-up motion-safe:delay-100">
              {t('hero.title.line1')}
              <br />
              {t('hero.title.line2')} <span className="text-[#3f8bff]">{t('hero.title.accent')}</span>
            </h1>
            <p className="public-hero-subtitle mt-4 max-w-xl text-[#c7d8f8] motion-safe:animate-fade-in-up motion-safe:delay-200">
              {t('hero.subtitle')}
            </p>
            <div className="mt-7 grid gap-3 motion-safe:animate-fade-in-up motion-safe:delay-300 sm:grid-cols-3">
              <article className="rounded-xl border border-[#2c4f84] bg-[#0d2246]/80 p-4 transition-colors duration-300 ease-out motion-safe:transition-transform motion-safe:hover:-translate-y-0.5">
                <p className="text-sm font-semibold text-white">{t('hero.highlight1.title')}</p>
                <p className="mt-1 text-xs text-[#a9c0e6]">{t('hero.highlight1.body')}</p>
              </article>
              <article className="rounded-xl border border-[#2c4f84] bg-[#0d2246]/80 p-4 transition-colors duration-300 ease-out motion-safe:transition-transform motion-safe:hover:-translate-y-0.5">
                <p className="text-sm font-semibold text-white">{t('hero.highlight2.title')}</p>
                <p className="mt-1 text-xs text-[#a9c0e6]">{t('hero.highlight2.body')}</p>
              </article>
              <article className="rounded-xl border border-[#2c4f84] bg-[#0d2246]/80 p-4 transition-colors duration-300 ease-out motion-safe:transition-transform motion-safe:hover:-translate-y-0.5">
                <p className="text-sm font-semibold text-white">{t('hero.highlight3.title')}</p>
                <p className="mt-1 text-xs text-[#a9c0e6]">{t('hero.highlight3.body')}</p>
              </article>
            </div>
          </div>

          <div className="relative motion-safe:animate-fade-in-right motion-safe:delay-200">
            <div className="overflow-hidden rounded-2xl border border-[#2f4f86] bg-[#f8fbff] shadow-[0_20px_50px_rgba(0,0,0,0.45)] transition-shadow duration-500 ease-out motion-safe:hover:shadow-[0_24px_60px_rgba(0,0,0,0.42)]">
              <div className="grid md:grid-cols-[175px_1fr]">
                <aside className="min-h-[340px] bg-[#091d3f] p-4 text-[#d7e6ff]">
                  <p className="mb-4 text-sm font-semibold uppercase tracking-[0.15em]">{t('mock.brand')}</p>
                  <ul className="space-y-2.5 text-sm">
                    <li className="rounded-md px-2 py-1.5 text-[#a8bedf]">{t('mock.nav.dashboard')}</li>
                    <li className="rounded-md bg-[#163f7d] px-2 py-1.5">{t('mock.nav.checklist')}</li>
                    <li className="rounded-md px-2 py-1.5 text-[#a8bedf]">{t('mock.nav.evidence')}</li>
                    <li className="rounded-md px-2 py-1.5 text-[#a8bedf]">{t('mock.nav.reports')}</li>
                    <li className="rounded-md px-2 py-1.5 text-[#a8bedf]">{t('mock.nav.settings')}</li>
                  </ul>
                </aside>
                <div className="p-5 text-[#1f3253]">
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#4e6c96]">{t('mock.library')}</p>
                  <div className="mt-3 space-y-2.5">
                    <div className="rounded-lg border border-[#e2e8f4] bg-white p-3 text-base">{t('doc.mobileDevice.name')}</div>
                    <div className="rounded-lg border border-[#e2e8f4] bg-white p-3 text-base">{t('doc.accessControl.name')}</div>
                    <div className="rounded-lg border border-[#e2e8f4] bg-white p-3 text-base">{t('doc.incidentResponse.name')}</div>
                    <div className="rounded-lg border border-[#e2e8f4] bg-white p-3 text-base">{t('doc.dataClassification.name')}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-4 hidden w-56 rounded-2xl border border-[#d7e2f5] bg-white p-4 shadow-[0_16px_30px_rgba(0,0,0,0.2)] sm:block">
              <p className="text-sm font-semibold text-[#2a3e63]">{t('doc.mobileDevice.name')}</p>
              <ul className="mt-2 space-y-1 text-xs text-[#4c5f80]">
                <li>{t('docPoint.pdf.policyDocument')}</li>
                <li>{t('docPoint.pdf.userGuidelines')}</li>
                <li>{t('docPoint.pdf.adminGuidelines')}</li>
              </ul>
              <p className="mt-3 text-lg font-bold text-[#1f355d]">€149</p>
              <Link
                href="/register"
                className="mt-2 flex w-full items-center justify-center rounded-lg bg-[#1f7bff] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2e87ff]"
              >
                {t('common.getStarted')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-4 px-4 py-10 sm:px-6 md:px-6 md:py-14 lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem]">
        <article className="rounded-2xl border border-[#d7e7de] bg-[#edf7f0] p-5 md:p-6">
          <div className="grid gap-3 md:grid-cols-[1.1fr_3fr]">
            <div>
              <h3 className="text-3xl font-semibold text-[#1a2440]">{t('how.title')}</h3>
              <p className="mt-2 text-sm text-[#5e7293]">{t('how.subtitle')}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-[#d2e6da] bg-white/70 p-4">
                <p className="text-sm font-semibold text-[#1f355d]">{t('how.step1.title')}</p>
                <p className="mt-1 text-xs text-[#5e7293]">{t('how.step1.body')}</p>
              </div>
              <div className="rounded-xl border border-[#d2e6da] bg-white/70 p-4">
                <p className="text-sm font-semibold text-[#1f355d]">{t('how.step2.title')}</p>
                <p className="mt-1 text-xs text-[#5e7293]">{t('how.step2.body')}</p>
              </div>
              <div className="rounded-xl border border-[#d2e6da] bg-white/70 p-4">
                <p className="text-sm font-semibold text-[#1f355d]">{t('how.step3.title')}</p>
                <p className="mt-1 text-xs text-[#5e7293]">{t('how.step3.body')}</p>
              </div>
              <div className="rounded-xl border border-[#d2e6da] bg-white/70 p-4">
                <p className="text-sm font-semibold text-[#1f355d]">{t('how.step4.title')}</p>
                <p className="mt-1 text-xs text-[#5e7293]">{t('how.step4.body')}</p>
              </div>
            </div>
          </div>
        </article>

        <div>
          <h3 className="text-4xl font-semibold text-[#1a2440]">{t('browse.title')}</h3>
          <p className="mt-2 text-base text-[#5e7293]">{t('browse.subtitle')}</p>
          <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Documentation categories">
            {DOCUMENT_CATEGORIES.map((chip) => {
              const selected = activeCategory === chip;
              return (
                <button
                  key={chip}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveCategory(chip)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors ${
                    selected
                      ? 'border-[#1f7bff] bg-[#1f7bff] text-white'
                      : 'border-[#d7deeb] bg-white text-[#5e7293] hover:bg-[#f7f9ff]'
                  }`}
                >
                  {categoryLabel(chip)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {filteredSections.length === 0 ? (
            <p className="col-span-full rounded-2xl border border-dashed border-[#d7deeb] bg-white px-4 py-10 text-center text-sm text-[#5e7293]">
              {t('empty', {
                all: t('filters.all'),
              })}{' '}
              <button type="button" className="font-semibold text-[#1f7bff] underline hover:no-underline" onClick={() => setActiveCategory('All')}>
                {t('filters.all')}
              </button>
              .
            </p>
          ) : (
            filteredSections.map((doc) => (
            <article key={doc.name} className="flex h-full flex-col rounded-2xl border border-[#d7deeb] bg-white p-4 shadow-sm transition-shadow duration-300 ease-out motion-safe:transition-transform motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-md">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-[#1f2741]">{doc.name}</h2>
                {doc.badge ? (
                  <span className="rounded-full bg-[#dbf8e9] px-2 py-0.5 text-[10px] font-semibold text-[#2f9c65]">
                    {doc.badge}
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm text-[#5e7293]">{doc.subtitle}</p>
              <ul className="mt-3 space-y-1.5 text-xs text-[#5f7394]">
                {doc.points.map((point) => (
                  <li key={point} className="flex items-center gap-2">
                    <CheckBadgeIcon />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-auto pt-5 text-2xl font-semibold text-[#1f355d]">{doc.price}</p>
              <Link
                href="/register"
                className="mt-3 flex w-full items-center justify-center rounded-lg border border-[#1f7bff] bg-[#1f7bff]/10 px-3 py-2 text-sm font-semibold text-[#1f7bff] transition-colors hover:bg-[#1f7bff]/20"
              >
                {t('common.getStarted')}
              </Link>
            </article>
            ))
          )}
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.9fr_1fr]">
          <article className="rounded-2xl border border-[#d7deeb] bg-[#eef2fa] p-5 transition-shadow duration-300 ease-out motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md md:p-6">
            <h3 className="text-3xl font-semibold text-[#1a2440]">{t('bundle.title')}</h3>
            <p className="mt-2 text-sm text-[#5e7293]">{t('bundle.subtitle')}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="flex h-full flex-col rounded-xl border border-[#d7deeb] bg-white p-4 text-center">
                <p className="font-semibold text-[#1f355d]">{t('bundle.essential.title')}</p>
                <p className="mt-1 text-sm text-[#5e7293]">{t('bundle.essential.subtitle')}</p>
                <p className="mt-2 text-xs font-semibold text-[#2f9c65]">{t('bundle.essential.save')}</p>
                <p className="mt-auto pt-3 text-3xl font-bold text-[#1f355d]">€399</p>
                <p className="mt-1 text-xs text-[#7e8fa9] line-through">€447</p>
                <Link
                  href="/register"
                  className="mt-3 flex items-center justify-center rounded-lg border border-[#b8c9e8] px-3 py-1.5 text-center text-sm font-semibold text-[#355d99] transition-colors hover:bg-[#f3f7ff]"
                >
                  {t('common.getStarted')}
                </Link>
              </div>
              <div className="flex h-full flex-col rounded-xl border-2 border-[#2f7dff] bg-white p-4 text-center">
                <p className="inline-flex rounded-full bg-[#2f7dff] px-3 py-0.5 text-xs font-semibold uppercase tracking-[0.08em] text-white">
                  {t('bundle.professional.badge')}
                </p>
                <p className="mt-2 font-semibold text-[#1f355d]">{t('bundle.professional.title')}</p>
                <p className="mt-1 text-sm text-[#5e7293]">{t('bundle.professional.subtitle')}</p>
                <p className="mt-2 text-xs font-semibold text-[#2f9c65]">{t('bundle.professional.save')}</p>
                <p className="mt-auto pt-3 text-3xl font-bold text-[#1f355d]">€599</p>
                <p className="mt-1 text-xs text-[#7e8fa9] line-through">€745</p>
                <Link
                  href="/register"
                  className="mt-3 flex items-center justify-center rounded-lg border border-[#1f7bff] bg-[#1f7bff] px-3 py-1.5 text-center text-sm font-semibold text-white transition-colors hover:bg-[#2e87ff]"
                >
                  {t('common.getStarted')}
                </Link>
              </div>
              <div className="flex h-full flex-col rounded-xl border border-[#d7deeb] bg-white p-4 text-center">
                <p className="font-semibold text-[#1f355d]">{t('bundle.complete.title')}</p>
                <p className="mt-1 text-sm text-[#5e7293]">{t('bundle.complete.subtitle')}</p>
                <p className="mt-2 text-xs font-semibold text-[#2f9c65]">{t('bundle.complete.save')}</p>
                <p className="mt-auto pt-3 text-3xl font-bold text-[#1f355d]">€999</p>
                <p className="mt-1 text-xs text-[#7e8fa9] line-through">€1,490</p>
                <Link
                  href="/register"
                  className="mt-3 flex items-center justify-center rounded-lg border border-[#b8c9e8] px-3 py-1.5 text-center text-sm font-semibold text-[#355d99] transition-colors hover:bg-[#f3f7ff]"
                >
                  {t('common.getStarted')}
                </Link>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-[#d7e7de] bg-[#edf7f0] p-5 transition-shadow duration-300 ease-out motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md md:p-6">
            <h3 className="text-3xl font-semibold text-[#1f3a31]">{t('why.title')}</h3>
            <ul className="mt-4 space-y-2.5 text-base leading-7 text-[#2f7f57]">
              <li className="flex items-center gap-2.5"><CheckBadgeIcon />{t('why.0')}</li>
              <li className="flex items-center gap-2.5"><CheckBadgeIcon />{t('why.1')}</li>
              <li className="flex items-center gap-2.5"><CheckBadgeIcon />{t('why.2')}</li>
              <li className="flex items-center gap-2.5"><CheckBadgeIcon />{t('why.3')}</li>
              <li className="flex items-center gap-2.5"><CheckBadgeIcon />{t('why.4')}</li>
            </ul>
          </article>
        </div>

        <article className="rounded-2xl border border-[#17489b] bg-[linear-gradient(90deg,#0b2f73,#0e3f9d)] p-5 text-white transition-shadow duration-300 ease-out motion-safe:animate-fade-in-up motion-safe:hover:shadow-[0_18px_34px_rgba(17,62,148,0.28)] md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-3xl font-semibold">{t('cta.title')}</h3>
              <p className="mt-1 text-sm text-[#d2e2ff]">{t('cta.subtitle')}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/products/audit-readiness-checklist"
                className="rounded-xl border border-white/35 bg-white px-5 py-2.5 font-semibold text-[#123e8b] transition-colors duration-200 hover:bg-[#e9f1ff] active:scale-[0.98] motion-safe:active:transition-transform"
              >
                {t('cta.viewDetails')}
              </Link>
              <Link
                href="/register"
                className="rounded-xl border border-[#1f7bff] bg-[#1f7bff] px-5 py-2.5 font-semibold text-white transition-colors duration-200 hover:bg-[#2e87ff] active:scale-[0.98] motion-safe:active:transition-transform"
              >
                {t('cta.createAccount')}
              </Link>
            </div>
          </div>
        </article>
      </section>

      <PublicFooter />
    </main>
  );
}
