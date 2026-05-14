'use client';

import React from 'react';
import Link from 'next/link';
import heroBackground from '@/assets/cybersecurity-background-59ognpsy7izka4l9.png';
import { PageDetail, PageSection } from '@/lib/api/cms-api';
import { PublicFooter } from '@/components/public-footer';

interface PageRendererProps {
  page: PageDetail | null;
  fallback: React.ReactNode;
}

/** Same button list shape as CTASectionRenderer (avoids duplicate blocks when CMS has two near-identical CTAs). */
function ctaActionSignature(data: Record<string, any>): string {
  const d = data || {};
  const buttons: any[] =
    Array.isArray(d.buttons) && d.buttons.length > 0
      ? d.buttons
      : d.button && typeof d.button === 'object'
        ? [d.button]
        : [];
  const parts = buttons.map((b) => `${String(b.text ?? '')}|${String(b.url ?? '')}|${b.primary ? '1' : '0'}`);
  return `${String(d.title ?? '')}\t${parts.join(';')}`;
}

function dedupeSequentialDuplicateCtas(sections: PageSection[]): PageSection[] {
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const out: PageSection[] = [];
  for (const section of sorted) {
    if (section.section_type === 'cta') {
      const sig = ctaActionSignature(section.data || {});
      const prev = out[out.length - 1];
      if (prev?.section_type === 'cta' && ctaActionSignature(prev.data || {}) === sig) {
        continue;
      }
    }
    out.push(section);
  }
  return out;
}

function getSectionData(sections: PageSection[], sectionType: string) {
  return sections.find((section) => section.section_type === sectionType)?.data || null;
}

function resourcesIcon(name: string, className = 'h-6 w-6') {
  switch (name) {
    case 'calendar':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8 3v4M16 3v4M4 9h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'clipboard-check':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <rect x="6" y="4" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M9 9h6M9 13h3m1 4 2 2 3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'cloud-upload':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path d="M7 18a4 4 0 1 1 .7-7.9A5.2 5.2 0 0 1 18 11.2 3.8 3.8 0 1 1 17.8 18H7Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="m12 15.5 0-6m0 0-2.5 2.5m2.5-2.5 2.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'shield-check':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="m9.4 12.2 1.8 1.8 3.6-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'trash':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path d="M4 7h16M9 7V5h6v2m-8 0 1 12h8l1-12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'search':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.8" />
          <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'target':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="12" r="1.3" fill="currentColor" />
        </svg>
      );
    case 'doc-stack':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path d="M8 4h7l4 4v12H8zM15 4v4h4" stroke="currentColor" strokeWidth="1.8" />
          <path d="M6 8h2M6 12h2M6 16h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'shield':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    case 'lightning':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path d="m13 2-7 11h5l-1 9 8-12h-5l0-8Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'server':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <rect x="4" y="4" width="16" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
          <rect x="4" y="14" width="16" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="8" cy="7" r="0.9" fill="currentColor" />
          <circle cx="8" cy="17" r="0.9" fill="currentColor" />
        </svg>
      );
    case 'chart':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path d="M4 19h16M7 16V9m5 7V6m5 10v-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'users':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="16.5" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M4 19c0-2.8 2.2-5 5-5h1c2.8 0 5 2.2 5 5M14 18.6c.3-1.6 1.6-2.8 3.2-2.8h.8c1.2 0 2.2.5 2.8 1.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

function resourceToneClasses(tone?: string) {
  switch (tone) {
    case 'green':
      return {
        card: 'bg-[#f2fbf6]',
        icon: 'bg-[#e8f7ee] text-[#30b271]',
      };
    case 'blue':
      return {
        card: 'bg-[#f2f7ff]',
        icon: 'bg-[#e9f0ff] text-[#3c7df0]',
      };
    case 'amber':
      return {
        card: 'bg-[#fffaf0]',
        icon: 'bg-[#fff5df] text-[#f2b535]',
      };
    case 'purple':
      return {
        card: 'bg-[#f6f3ff]',
        icon: 'bg-[#f1ecff] text-[#6c62f7]',
      };
    default:
      return {
        card: 'bg-[#f7f9ff]',
        icon: 'bg-[#e7eeff] text-[#2f7dff]',
      };
  }
}

function ResourcesPublicPageRenderer({ page }: { page: PageDetail }) {
  const sections = dedupeSequentialDuplicateCtas(page.sections || []);
  const hero = getSectionData(sections, 'hero') || {};
  const mainBenefit = getSectionData(sections, 'main-benefit') || {};
  const useCases = getSectionData(sections, 'use-cases') || {};
  const howItWorks = getSectionData(sections, 'how-it-works') || {};
  const whoItsFor = getSectionData(sections, 'who-its-for') || {};
  const whatYouGet = getSectionData(sections, 'what-you-get') || {};
  const closingCta = getSectionData(sections, 'cta') || {};

  const heroImage = hero.background_image && !String(hero.background_image).startsWith('/assets/')
    ? hero.background_image
    : heroBackground.src;
  const heroStyle = {
    backgroundImage: `linear-gradient(rgba(243, 246, 255, 0.88), rgba(243, 246, 255, 0.92)), url(${heroImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
  } as const;

  const highlightItems = Array.isArray(hero.highlights) ? hero.highlights : [];
  const heroButtons = Array.isArray(hero.buttons) ? hero.buttons : [];
  const useCaseItems = Array.isArray(useCases.items) ? useCases.items : [];
  const howItWorksSteps = Array.isArray(howItWorks.steps) ? howItWorks.steps : [];
  const audienceItems = Array.isArray(whoItsFor.items) ? whoItsFor.items : [];
  const valueCards = Array.isArray(whatYouGet.cards) ? whatYouGet.cards : [];

  return (
    <main className="overflow-x-hidden bg-[#f3f5fb]">
      <section style={heroStyle}>
        <div className="mx-auto min-h-[520px] max-w-7xl px-4 py-6 sm:px-6 md:px-6 md:py-8 lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem]">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#64799d] transition-colors duration-200 hover:text-[#3f5376]"
          >
            <span aria-hidden="true">←</span>
            {hero.back_to_products || 'Back to Products'}
          </Link>

          <div className="mt-5 grid items-center gap-7 lg:grid-cols-[1.02fr_0.98fr]">
            <div className="space-y-5">
              <span className="public-eyebrow inline-flex rounded-full bg-[#dfe8ff] px-4 py-1.5 text-[#5278be] motion-safe:animate-fade-in motion-safe:delay-75">
                {hero.badge || 'Audit'}
              </span>

              <div className="flex items-start gap-4 motion-safe:animate-fade-in-up motion-safe:delay-100">
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#dfe9ff] text-[#2f7dff]">
                  {resourcesIcon('shield-check', 'h-9 w-9')}
                </span>
                <h1 className="public-hero-title text-[#1a2440]">
                  {Array.isArray(hero.title_lines) && hero.title_lines.length > 0 ? (
                    <>
                      {hero.title_lines[0]}
                      <br />
                      {hero.title_lines[1] || ''}
                    </>
                  ) : (
                    hero.title || ''
                  )}
                </h1>
              </div>

              <p className="public-hero-subtitle max-w-2xl text-[#4f6282] motion-safe:animate-fade-in-up motion-safe:delay-150">
                {hero.subtitle}
              </p>

              <div className="flex flex-wrap gap-3 motion-safe:animate-fade-in-up motion-safe:delay-200">
                {heroButtons.map((button: any) => (
                  <Link
                    key={`${button.text}-${button.url}`}
                    href={button.url || '#'}
                    className={`inline-flex items-center gap-2 rounded-xl border px-7 py-3 text-2xl font-semibold transition-colors duration-200 active:scale-[0.98] motion-safe:active:transition-transform ${
                      button.primary
                        ? 'border-[#1f7bff] bg-[#1f7bff] text-white hover:bg-[#2e87ff]'
                        : 'border-[#b5c7e7] bg-white/85 text-[#334a72] hover:bg-white'
                    }`}
                  >
                    {button.text}
                    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
                      <path d="M4 10h10m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                ))}
              </div>

              <div className="grid gap-3 pt-1 motion-safe:animate-fade-in-up motion-safe:delay-300 sm:grid-cols-3">
                {highlightItems.map((item: any) => (
                  <div key={item.title} className="flex items-start gap-2 text-[#3f5375] motion-safe:transition-transform motion-safe:hover:-translate-y-0.5">
                    <span className="mt-1 text-[#2f7dff]">{resourcesIcon(item.icon || 'shield', 'h-5 w-5')}</span>
                    <div>
                      <p className="text-lg font-semibold">{item.title}</p>
                      <p className="text-sm text-[#627796]">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative motion-safe:animate-fade-in-right motion-safe:delay-150">
              <div className="overflow-hidden rounded-2xl border border-[#c9d7ef] bg-[#f7f9fe] shadow-[0_16px_45px_rgba(60,85,130,0.2)] transition-shadow duration-500 ease-out motion-safe:hover:shadow-[0_20px_50px_rgba(60,85,130,0.28)]">
                <div className="grid md:grid-cols-[165px_1fr]">
                  <aside className="h-full bg-[#0b1a39] p-3 text-[#dce8ff]">
                    <p className="mb-3 text-sm font-semibold">{hero.mockup?.brand || 'AuditReady'}</p>
                    <ul className="space-y-2 text-xs">
                      {(hero.mockup?.nav ? Object.values(hero.mockup.nav) : ['Dashboard', 'Checklists', 'Reports', 'Settings']).map((item: any, index: number) => (
                        <li key={index} className={`rounded-md px-2 py-1.5 ${index === 1 ? 'bg-[#17376d]' : 'text-[#a0b4d5]'}`}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </aside>
                  <div className="p-3">
                    <div className="rounded-xl bg-white p-3">
                      <p className="text-sm font-semibold text-[#253d63]">{hero.mockup?.sectionTitle || '1.1 Information Security Policies'}</p>
                      <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_170px]">
                        <div>
                          <p className="text-sm font-semibold text-[#1f2741]">{hero.mockup?.question || ''}</p>
                          <p className="mt-1 text-xs text-[#6b7e9b]">{hero.mockup?.questionHelp || ''}</p>
                        </div>
                        <div className="rounded-lg bg-[#f7f9ff] p-2 text-xs text-[#5f7292]">
                          <p className="font-semibold text-[#344d75]">{hero.mockup?.progress || 'Progress'}</p>
                          <p className="mt-1 text-2xl font-bold text-[#1f355d]">42%</p>
                          <div className="mt-2 h-1.5 rounded-full bg-[#d8e3f6]">
                            <div className="h-full w-[42%] rounded-full bg-[#2f7dff]" />
                          </div>
                          <ul className="mt-2 space-y-0.5 text-[11px]">
                            <li>{hero.mockup?.answers?.yes || 'Yes'} 12</li>
                            <li>{hero.mockup?.answers?.partly || 'Partly'} 5</li>
                            <li>{hero.mockup?.answers?.no || 'No'} 3</li>
                            <li>{hero.mockup?.answers?.notSure || 'Not sure'} 2</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_170px]">
                      <div className="rounded-xl bg-white p-3">
                        <p className="text-sm font-semibold text-[#253d63]">{hero.mockup?.evidence || 'Evidence'}</p>
                        <ul className="mt-2 space-y-2 text-sm text-[#4f6282]">
                          <li>policy_v1.2.pdf</li>
                          <li>screenshot.png</li>
                        </ul>
                      </div>
                      <div />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute -bottom-16 right-0 hidden w-72 rounded-2xl border border-[#d7e2f5] bg-white px-4 py-3 shadow-[0_16px_35px_rgba(67,95,145,0.22)] sm:block xl:-right-10">
                <p className="text-[30px] font-semibold leading-none text-[#253d63]">{hero.mockup?.maturity || 'Maturity Overview'}</p>
                <div className="relative mt-2 h-44">
                  <svg viewBox="0 0 320 210" className="h-full w-full" fill="none" aria-hidden="true">
                    <g stroke="#e4ebf8" strokeWidth="1.2">
                      <polygon points="160,32 237,70 237,140 160,178 83,140 83,70" />
                      <polygon points="160,56 214,83 214,127 160,154 106,127 106,83" />
                      <polygon points="160,78 194,96 194,114 160,132 126,114 126,96" />
                    </g>
                    <g stroke="#e4ebf8" strokeWidth="1.2">
                      <line x1="160" y1="105" x2="160" y2="32" />
                      <line x1="160" y1="105" x2="237" y2="70" />
                      <line x1="160" y1="105" x2="237" y2="140" />
                      <line x1="160" y1="105" x2="160" y2="178" />
                      <line x1="160" y1="105" x2="83" y2="140" />
                      <line x1="160" y1="105" x2="83" y2="70" />
                    </g>
                    <polygon points="160,52 220,78 222,136 160,166 102,134 108,82" fill="#93b5f3" fillOpacity="0.42" stroke="#5e97ed" strokeWidth="2" />
                    <text x="160" y="22" textAnchor="middle" className="fill-[#6f7f98] text-[10px]">Governance</text>
                    <text x="255" y="74" textAnchor="start" className="fill-[#6f7f98] text-[10px]">Risk Mgmt.</text>
                    <text x="255" y="137" textAnchor="start" className="fill-[#6f7f98] text-[10px]">Asset Mgnce</text>
                    <text x="160" y="197" textAnchor="middle" className="fill-[#6f7f98] text-[10px]">Incident Mgmt.</text>
                    <text x="65" y="137" textAnchor="end" className="fill-[#6f7f98] text-[10px]">Operations</text>
                    <text x="65" y="74" textAnchor="end" className="fill-[#6f7f98] text-[10px]">Risk Mgt.</text>
                    <text x="56" y="106" textAnchor="end" className="fill-[#6f7f98] text-[10px]">Physical</text>
                    <text x="56" y="118" textAnchor="end" className="fill-[#6f7f98] text-[10px]">Security</text>
                    <text x="245" y="170" textAnchor="middle" className="fill-[#6f7f98] text-[10px]">Access Control</text>
                  </svg>
                </div>
                <div className="mt-1 flex items-center justify-center gap-4 text-[11px] font-medium text-[#6f7f98]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-[2px] bg-[#2f7dff]" />
                    {hero.mockup?.legend?.current || 'Current'}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-[2px] bg-[#98dbc0]" />
                    {hero.mockup?.legend?.target || 'Target'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:px-6 md:py-10 lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem]">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1.8fr]">
          <article className="rounded-2xl border border-[#d7deeb] bg-white p-6 transition-shadow duration-300 ease-out motion-safe:animate-fade-in-up motion-safe:transition-transform motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-lg md:p-8">
            <p className="text-xl font-semibold text-[#334a72]">{mainBenefit.kicker}</p>
            <h2 className="mt-3 text-4xl font-semibold leading-tight text-[#1a2440]">{mainBenefit.title}</h2>
            <p className="mt-4 text-xl leading-8 text-[#556b8c]">{mainBenefit.body}</p>
          </article>

          <article className="rounded-2xl border border-[#d7deeb] bg-white p-6 transition-shadow duration-300 ease-out motion-safe:animate-fade-in-up motion-safe:delay-150 motion-safe:transition-transform motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-lg md:p-8">
            <p className="text-xl font-semibold text-[#334a72]">{useCases.title}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {useCaseItems.map((item: any) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-[#dbe4f4] bg-[#f7f9ff] p-4 transition-shadow duration-300 motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md"
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#e7eeff] text-[#2f7dff]">
                    {resourcesIcon(item.icon || 'target', 'h-6 w-6')}
                  </span>
                  <h3 className="mt-3 text-xl font-semibold text-[#233553]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#5d7292]">{item.body}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 md:px-6 md:pb-10 lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem]">
        <div className="rounded-2xl border border-[#d7deeb] bg-white p-6 transition-shadow duration-300 motion-safe:animate-fade-in-up motion-safe:hover:shadow-md md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-4xl font-semibold text-[#1a2440]">{howItWorks.title}</h2>
              <p className="mt-2 text-xl text-[#556b8c]">{howItWorks.subtitle}</p>
            </div>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl border border-[#b7caea] bg-[#f7f9ff] px-5 py-2.5 text-lg font-semibold text-[#2f7dff] transition-colors duration-200 hover:border-[#9eb6e8] hover:bg-[#eef3ff] active:scale-[0.98] motion-safe:active:transition-transform"
            >
              {howItWorks.view_demo || 'View Demo'}
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
                <path d="M4 10h10m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>

          <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
            {howItWorksSteps.map((step: any, index: number) => (
              <article
                key={step.title}
                className="relative motion-safe:animate-fade-in-up motion-safe:transition-transform motion-safe:hover:-translate-y-0.5"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="flex items-center gap-3 xl:block">
                  <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#e7eeff] text-[#2f7dff]">
                    {resourcesIcon(step.icon || 'doc-stack', 'h-8 w-8')}
                  </span>
                  <p className="inline-flex items-center gap-2 text-xl font-semibold text-[#24395f] xl:hidden">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#2f7dff] text-sm text-white">{index + 1}</span>
                    {step.title}
                  </p>
                </div>
                {index < howItWorksSteps.length - 1 ? (
                  <>
                    <span className="absolute left-[68px] top-7 hidden w-[calc(100%-76px)] border-t-2 border-dashed border-[#bad0ef] xl:block" />
                    <svg viewBox="0 0 14 14" className="absolute right-[6px] top-[22px] hidden h-4 w-4 text-[#98b7e5] xl:block" fill="none" aria-hidden="true">
                      <path d="M2 2 11 7 2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </>
                ) : null}
                <p className="mt-3 hidden items-center gap-2 text-xl font-semibold text-[#24395f] xl:inline-flex">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#2f7dff] text-sm text-white">{index + 1}</span>
                  {step.title}
                </p>
                <p className="mt-2 text-base leading-7 text-[#5a7091]">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 md:px-6 md:pb-10 lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem]">
        <div>
          <h2 className="text-4xl font-semibold text-[#1a2440] motion-safe:animate-fade-in-up">{whoItsFor.title}</h2>
          <p className="mt-2 text-xl text-[#556b8c] motion-safe:animate-fade-in-up motion-safe:delay-75">{whoItsFor.subtitle}</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {audienceItems.map((item: any, index: number) => (
              <article
                key={item.title}
                className="rounded-2xl border border-[#d7deeb] bg-[#f7f9ff] p-5 transition-shadow duration-300 motion-safe:animate-fade-in-up motion-safe:transition-transform motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-md"
                style={{ animationDelay: `${100 + index * 90}ms` }}
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#e7eeff] text-[#2f7dff]">
                  {resourcesIcon(item.icon || 'users', 'h-6 w-6')}
                </span>
                <h3 className="mt-3 text-2xl font-semibold text-[#253b61]">{item.title}</h3>
                <p className="mt-2 text-base leading-7 text-[#5f7292]">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 md:px-6 md:pb-10 lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem]">
        <div className="rounded-2xl border border-[#d7deeb] bg-white p-6 transition-shadow duration-300 motion-safe:animate-fade-in-up motion-safe:hover:shadow-md md:p-8">
          <div>
            <h2 className="text-4xl font-semibold text-[#1a2440]">{whatYouGet.title}</h2>
            <p className="mt-2 text-xl text-[#556b8c]">{whatYouGet.subtitle}</p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {valueCards.map((card: any, index: number) => {
              const tone = resourceToneClasses(card.tone);
              const iconName = ['chart', 'doc-stack', 'target', 'shield'][index] || 'shield';

              return (
                <article key={card.title} className={`rounded-2xl border border-[#d7deeb] ${tone.card} p-5 transition-shadow duration-300 motion-safe:transition-transform motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-md`}>
                  <span className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${tone.icon}`}>
                    {resourcesIcon(iconName, 'h-6 w-6')}
                  </span>
                  <h3 className="mt-3 text-2xl font-semibold text-[#1f355d]">{card.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#5e7293]">{card.body}</p>
                  <ul className="mt-4 space-y-1.5 text-sm text-[#4e6283]">
                    {(card.points || []).map((point: string) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 md:px-6 md:pb-12 lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem]">
        <div className="rounded-2xl border border-[#264579] bg-[linear-gradient(120deg,#091229,#0b1a39_48%,#0e2348)] px-5 py-6 text-white motion-safe:animate-fade-in-up motion-safe:delay-100 sm:px-8 md:px-10 md:py-7">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-[#3a7ce2] bg-[#102a57] text-[#77aefc]">
                {resourcesIcon('shield-check', 'h-8 w-8')}
              </span>
              <div>
                <p className="text-2xl font-semibold md:text-4xl">{closingCta.title}</p>
                <p className="text-sm text-[#c7d8f8] md:text-base">{closingCta.subtitle}</p>
              </div>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              {(closingCta.buttons || []).map((button: any) => (
                <Link
                  key={`${button.text}-${button.url}`}
                  href={button.url || '#'}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl border px-7 py-3 text-base font-semibold transition-colors duration-200 active:scale-[0.98] motion-safe:active:transition-transform md:text-lg ${
                    button.primary
                      ? 'border-[#1f7bff] bg-[#1f7bff] text-white hover:bg-[#2e87ff]'
                      : 'border-[#456298] text-[#e5eeff] hover:bg-[#173160]'
                  }`}
                >
                  {button.text}
                  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
                    <path d="M4 10h10m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}

/**
 * Renders a CMS page or fallback content
 * Maps section types to their corresponding display components
 */
export function PageRenderer({ page, fallback }: PageRendererProps) {
  // If no CMS page, or the CMS page has no sections, defer entirely to the
  // fallback. The fallback is responsible for rendering its own footer (if any),
  // so we must not also append one here — that would render two footers when
  // the CMS row exists but is empty.
  if (!page || !page.sections || page.sections.length === 0) {
    return <>{fallback}</>;
  }

  if (page.slug === 'resources-public') {
    return <ResourcesPublicPageRenderer page={page} />;
  }

  const sections = dedupeSequentialDuplicateCtas(page.sections);

  return (
    <main className="overflow-x-hidden bg-[#f3f5fb]">
      {sections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
      <PublicFooter />
    </main>
  );
}

/**
 * Renders individual section based on section type
 */
function SectionRenderer({ section }: { section: PageSection }) {
  const data = section.data || {};

  switch (section.section_type) {
    case 'hero':
      return <HeroSectionRenderer data={data} />;
    case 'products':
      return <ProductSectionRenderer data={data} />;
    case 'faq':
      return <FAQSectionRenderer data={data} />;
    case 'cards':
      return <CardsSectionRenderer data={data} />;
    case 'cta':
      return <CTASectionRenderer data={data} />;
    case 'trust':
      return <TrustSectionRenderer data={data} />;
    case 'how-it-works':
      return <HowItWorksSectionRenderer data={data} />;
    case 'documentation-grid':
      return <DocumentationGridRenderer data={data} />;
    case 'bundles':
      return <BundlesSectionRenderer data={data} />;
    case 'why-choose':
      return <WhyChooseSectionRenderer data={data} />;
    case 'use_cases':
      return <UseCasesSectionRenderer data={data} />;
    case 'steps':
      return <StepsSectionRenderer data={data} />;
    case 'contact_info':
      return <ContactInfoSectionRenderer data={data} />;
    case 'legal':
      return <LegalSectionRenderer data={data} />;
    case 'standard':
      return <StandardSectionRenderer data={data} />;
    default:
      return <div className="p-4 text-gray-500">Unknown section type: {section.section_type}</div>;
  }
}

// Section Renderers

function HeroSectionRenderer({ data }: { data: Record<string, any> }) {
  const heroImage = data.background_image && !data.background_image.startsWith('/assets/')
    ? data.background_image
    : heroBackground.src;

  // Contact-page hero: render form + direct contact card when form data is provided.
  if (data.form && data.directContact) {
    const contactBackground = `linear-gradient(rgba(243, 246, 255, 0.88), rgba(243, 246, 255, 0.92)), url(${heroImage})`;

    return (
      <section
        className="px-4 py-8 md:py-12"
        style={{
          backgroundImage: contactBackground,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="mx-auto grid min-h-[560px] w-full max-w-7xl gap-8 sm:px-2 md:px-6 lg:max-w-6xl lg:grid-cols-[1.05fr_0.95fr] xl:max-w-7xl 2xl:max-w-[90rem]">
          <div className="space-y-6">
            <div className="space-y-3">
              {data.kicker && <p className="public-eyebrow text-[#4d7fd3]">{data.kicker}</p>}
              {data.title && <h1 className="public-hero-title text-[#1a2440]">{data.title}</h1>}
              {data.subtitle && <p className="public-hero-subtitle max-w-lg text-[#334768]">{data.subtitle}</p>}
            </div>

            <form className="max-w-xl space-y-4 rounded-2xl border border-[#d7deeb] bg-white p-5 shadow-sm sm:p-6">
              <label className="block">
                <span className="text-sm font-medium text-[#2d3f62]">{data.form.name || 'Name'}</span>
                <input
                  type="text"
                  className="mt-1 w-full rounded-lg border border-[#d5deef] bg-[#f7f9ff] px-3 py-2 text-[#1d2a42] outline-none"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-[#2d3f62]">{data.form.email || 'Email'}</span>
                <input
                  type="email"
                  className="mt-1 w-full rounded-lg border border-[#d5deef] bg-[#f7f9ff] px-3 py-2 text-[#1d2a42] outline-none"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-[#2d3f62]">{data.form.company || 'Company'}</span>
                <input
                  type="text"
                  className="mt-1 w-full rounded-lg border border-[#d5deef] bg-[#f7f9ff] px-3 py-2 text-[#1d2a42] outline-none"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-[#2d3f62]">{data.form.message || 'Message'}</span>
                <textarea
                  rows={3}
                  placeholder={data.form.messagePlaceholder || ''}
                  className="mt-1 w-full rounded-lg border border-[#d5deef] bg-[#f7f9ff] px-3 py-2 text-[#1d2a42] outline-none"
                />
              </label>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-[#1f7bff] bg-[#1f7bff] px-6 py-3 text-lg font-semibold text-white"
              >
                {data.form.sendButton || 'Send Message'}
              </button>
            </form>
          </div>

          <div className="flex items-start lg:pt-[86px]">
            <div className="w-full max-w-xl rounded-2xl border border-[#d7deeb] bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-semibold text-[#1f2741] sm:text-3xl">{data.directContact.title || 'Direct contact'}</h2>
              {data.directContact.subtitle && <p className="mt-2 text-lg text-[#4c5f80] sm:text-xl">{data.directContact.subtitle}</p>}
              {data.directContact.email && <p className="mt-6 text-lg font-semibold text-[#1f2741] sm:text-2xl lg:text-3xl">{data.directContact.email}</p>}
              {data.directContact.responseTime && <p className="mt-5 text-lg text-[#4c5f80] sm:text-xl">{data.directContact.responseTime}</p>}
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  // Check if this is a products-style hero (with highlights and radial gradient)
  const isProductsHero = data.highlights && data.highlights.length > 0;
  
  if (isProductsHero) {
    const backgroundImage = `radial-gradient(circle at 20% 20%, rgba(16, 55, 114, 0.62) 0%, rgba(7, 22, 47, 0.72) 45%, rgba(4, 16, 34, 0.78) 100%), url(${heroImage})`;
    
    return (
      <section className="relative overflow-hidden border-b border-[#12315b]" style={{
        backgroundImage,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>
        <div className="pointer-events-none absolute inset-0 opacity-35">
          <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-[#2262d9]/40 blur-3xl"></div>
          <div className="absolute right-24 top-6 h-72 w-72 rounded-full bg-[#143f8f]/40 blur-3xl"></div>
        </div>
        <div className="relative mx-auto grid min-h-[520px] max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 md:px-6 md:py-12 lg:max-w-6xl lg:grid-cols-[1.05fr_0.95fr] xl:max-w-7xl 2xl:max-w-[90rem]">
          <div>
            {data.kicker && (
              <p className="inline-flex rounded-full border border-[#255da8] bg-[#12366c] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#9ac3ff] motion-safe:animate-fade-in motion-safe:delay-75">
                {data.kicker}
              </p>
            )}
            {data.title && (
              <h1 className="public-hero-title mt-4 text-white motion-safe:animate-fade-in-up motion-safe:delay-100">
                {data.title}
                {data.accent && (
                  <>
                    <br />
                    <span className="text-[#3f8bff]">{data.accent}</span>
                  </>
                )}
              </h1>
            )}
            {data.description && (
              <p className="public-hero-subtitle mt-4 max-w-xl text-[#c7d8f8] motion-safe:animate-fade-in-up motion-safe:delay-200">
                {data.description}
              </p>
            )}
            {data.highlights && data.highlights.length > 0 && (
              <div className="mt-7 grid gap-3 motion-safe:animate-fade-in-up motion-safe:delay-300 sm:grid-cols-3">
                {data.highlights.map((highlight: any, index: number) => (
                  <article key={index} className="rounded-xl border border-[#2c4f84] bg-[#0d2246]/80 p-4 transition-colors duration-300 ease-out motion-safe:transition-transform motion-safe:hover:-translate-y-0.5">
                    <p className="text-sm font-semibold text-white">{highlight.title}</p>
                    <p className="mt-1 text-xs text-[#a9c0e6]">{highlight.body}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
          {data.mockup && (
            <div className="relative motion-safe:animate-fade-in-right motion-safe:delay-200">
              <div className="overflow-hidden rounded-2xl border border-[#2f4f86] bg-[#f8fbff] shadow-[0_20px_50px_rgba(0,0,0,0.45)] transition-shadow duration-500 ease-out motion-safe:hover:shadow-[0_24px_60px_rgba(0,0,0,0.42)]">
                <div className="grid md:grid-cols-[175px_1fr]">
                  <aside className="min-h-[340px] bg-[#091d3f] p-4 text-[#d7e6ff]">
                    <p className="mb-4 text-sm font-semibold uppercase tracking-[0.15em]">{data.mockup.brand || 'AuditReady'}</p>
                    <ul className="space-y-2.5 text-sm">
                      {data.mockup.nav && Object.values(data.mockup.nav).map((item: any, index: number) => (
                        <li key={index} className={`rounded-md px-2 py-1.5 ${index === 1 ? 'bg-[#163f7d]' : 'text-[#a8bedf]'}`}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </aside>
                  <div className="p-5 text-[#1f3253]">
                    {data.mockup.library && (
                      <>
                        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#4e6c96]">{data.mockup.library}</p>
                        <div className="mt-3 space-y-2.5">
                          {data.mockup.documents && data.mockup.documents.map((doc: string, index: number) => (
                            <div key={index} className="rounded-lg border border-[#e2e8f4] bg-white p-3 text-base">{doc}</div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }
  
  // Default home-style hero
  const backgroundImage = `linear-gradient(rgba(4, 9, 22, 0.56), rgba(4, 9, 22, 0.72)), url(${heroImage})`;

  return (
    <section
      className="px-4 py-8 md:py-10 text-white"
      style={{
        backgroundImage,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="mx-auto grid min-h-[400px] w-full max-w-6xl items-start gap-5 sm:min-h-[420px] md:gap-7 lg:min-h-[440px] lg:grid-cols-2 lg:items-center lg:gap-8 xl:max-w-6xl 2xl:max-w-[90rem]">
        <div className="space-y-4">
          {data.kicker && (
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#5ea2ff]">
              {data.kicker}
            </p>
          )}
          {data.title && <h1 className="max-w-xl text-4xl font-semibold leading-tight md:text-5xl">{data.title}</h1>}
          {data.subtitle && <p className="max-w-xl text-lg text-[#d4e2f6] md:text-xl">{data.subtitle}</p>}
          {data.description && <p className="max-w-xl text-sm leading-7 text-[#d4e2f6] md:text-base">{data.description}</p>}
          {(data.buttons || data.button_text) && (
            <div className="flex flex-wrap gap-3 pt-2">
              {Array.isArray(data.buttons)
                ? data.buttons.map((button: any, index: number) => (
                    <a
                      key={index}
                      href={button.url || '#'}
                      className={`inline-flex items-center rounded-lg px-5 py-3 text-sm font-medium transition ${
                        button.primary
                          ? 'bg-[#2e82ff] text-white hover:bg-[#276fd5]'
                          : 'border border-white/25 bg-white/10 text-white hover:bg-white/15'
                      }`}
                    >
                      {button.text}
                    </a>
                  ))
                : data.button_text && data.button_link && (
                    <a
                      href={data.button_link}
                      className="inline-flex items-center rounded-lg bg-[#2e82ff] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#276fd5]"
                    >
                      {data.button_text}
                    </a>
                  )}
            </div>
          )}
        </div>

        {data.mockup && (
          <div className="relative mx-auto w-full max-w-[620px] lg:max-w-[640px] lg:justify-self-end">
            <div className="overflow-hidden rounded-2xl border border-[#325a99]/80 bg-[#edf1f9] text-[#152948] shadow-[0_24px_70px_rgba(0,0,0,0.55)]">
              <div className="grid md:grid-cols-[180px_1fr]">
                <aside className="h-full bg-[#0b1a39] p-2.5 text-[#dce8ff]">
                  <p className="mb-2 text-sm font-semibold">{data.mockup.brand || 'AuditReady'}</p>
                  <ul className="space-y-1.5 text-xs">
                    {(data.mockup.nav ? Object.values(data.mockup.nav) : ['Dashboard', 'Checklists', 'Reports', 'Settings']).map((item: any, index: number) => (
                      <li key={index} className={`rounded-md px-2 py-1.5 ${index === 0 ? 'bg-[#17376d]' : 'text-[#a0b4d5]'}`}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </aside>
                <div className="p-3">
                  <div className="mb-2 rounded-xl bg-white p-2.5">
                    <p className="text-sm font-semibold text-[#1a2c4f]">{data.mockup.dashboard?.title || 'Dashboard'}</p>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {(Object.entries(data.mockup.dashboard?.metrics || {
                        overallReadiness: 'Overall Readiness',
                        completed: 'Completed',
                        openFindings: 'Open Findings',
                      }) as Array<[string, string]>).map(([key, label]) => (
                        <div key={key} className="flex h-full min-h-[94px] flex-col rounded-lg border border-[#e2e8f5] bg-[#f8fbff] p-2">
                          <p className="min-h-[24px] text-[11px] leading-[1.1] text-[#6f7f98]">{label}</p>
                          <p className="min-h-[34px] text-xl font-bold leading-tight text-[#173a73] sm:text-2xl lg:text-[22px] xl:text-2xl 2xl:text-3xl">72%</p>
                          <div className="mt-auto h-1.5 rounded-full bg-[#d6e2f7]">
                            <div className="h-full w-[72%] rounded-full bg-[#2e82ff]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    <div className="rounded-xl bg-white p-2.5">
                      <p className="text-xs font-semibold text-[#263d62]">Recent Activity</p>
                      <ul className="mt-1.5 space-y-1.5 text-[11px] text-[#4f668a]">
                        <li>Audit Readiness Checklist</li>
                        <li>Documentation Package</li>
                        <li>NIS2 Gap Analysis</li>
                      </ul>
                    </div>
                    <div className="rounded-xl bg-white p-2.5">
                      <p className="text-xs font-semibold text-[#263d62]">Top Domains</p>
                      <div className="mt-1.5 space-y-2 text-[11px] text-[#4f668a]">
                        <div>Governance</div>
                        <div>Risk Management</div>
                        <div>Access Control</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ProductSectionRenderer({ data }: { data: Record<string, any> }) {
  const products = data.products || [];

  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {data.title && <h2 className="text-3xl font-bold mb-8 text-center">{data.title}</h2>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product: any, idx: number) => (
            <div key={idx} className="border rounded-lg p-6 hover:shadow-lg transition">
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded mb-4"
                />
              )}
              <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
              <p className="text-gray-600 mb-4">{product.description}</p>
              {product.price && (
                <p className="text-2xl font-bold text-blue-600 mb-4">{product.price}</p>
              )}
              {product.category && (
                <span className="inline-block bg-gray-100 px-3 py-1 rounded text-sm">
                  {product.category}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSectionRenderer({ data }: { data: Record<string, any> }) {
  const items = data.questions || data.items || [];

  return (
    <section className="bg-[#f3f5fb] px-4 py-12 text-gray-600 sm:px-6 md:px-6">
      <div className="mx-auto max-w-7xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem]">
        {(data.title || data.subtitle) && (
          <div className="mb-8 text-center">
            {data.title && <h2 className="public-section-title text-gray-700">{data.title}</h2>}
            {data.subtitle && <p className="mt-2 text-sm text-gray-500">{data.subtitle}</p>}
          </div>
        )}
        <div className="space-y-4">
          {items.map((item: any, idx: number) => (
            <FAQItem key={idx} question={item.question} answer={item.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = React.useState(false);

  return (
    <article className="overflow-hidden rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm transition-shadow motion-safe:hover:shadow-sm">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-gray-700"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span>{question}</span>
        <span
          className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm ${
            open
              ? 'border-gray-300 bg-gray-100 text-gray-600'
              : 'border-gray-200 bg-gray-50 text-gray-500'
          }`}
        >
          {open ? '−' : '+'}
        </span>
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="border-t border-gray-100 px-5 pb-4">
            <p className="pt-4 leading-relaxed text-gray-600">{answer}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

function UseCasesSectionRenderer({ data }: { data: Record<string, any> }) {
  const items = data.items || [];

  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {data.title && <h2 className="text-3xl font-bold mb-8 text-center">{data.title}</h2>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item: any, idx: number) => (
            <div key={idx} className="text-center">
              {item.icon && <div className="text-4xl mb-4">{item.icon}</div>}
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StepsSectionRenderer({ data }: { data: Record<string, any> }) {
  const items = data.items || [];

  return (
    <section className="py-12 px-4 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        {data.title && <h2 className="text-3xl font-bold mb-8 text-center">{data.title}</h2>}
        <div className="space-y-6">
          {items.map((item: any, idx: number) => (
            <div key={idx} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-semibold">
                  {item.number || idx + 1}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactInfoSectionRenderer({ data }: { data: Record<string, any> }) {
  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-2xl mx-auto text-center">
        {data.title && <h2 className="text-3xl font-bold mb-8">{data.title}</h2>}
        {data.email && (
          <p className="text-lg mb-2">
            <strong>Email:</strong>{' '}
            <a href={`mailto:${data.email}`} className="text-blue-600 hover:underline">
              {data.email}
            </a>
          </p>
        )}
        {data.phone && (
          <p className="text-lg mb-2">
            <strong>Phone:</strong> {data.phone}
          </p>
        )}
        {data.address && (
          <p className="text-lg mb-2">
            <strong>Address:</strong> {data.address}
          </p>
        )}
      </div>
    </section>
  );
}

function LegalSectionRenderer({ data }: { data: Record<string, any> }) {
  return (
    <section className="bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-[15px] leading-7 text-black [&_a]:text-[#1f7bff] [&_a]:underline [&_h1]:mb-3 [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:text-black sm:[&_h1]:text-4xl [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-black [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-black [&_li]:mt-1 [&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:marker:text-black">
        {data.content && <div dangerouslySetInnerHTML={{ __html: data.content }} />}
      </div>
    </section>
  );
}

function StandardSectionRenderer({ data }: { data: Record<string, any> }) {
  return (
    <section className="bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-[15px] leading-7 text-black [&_a]:text-[#1f7bff] [&_a]:underline [&_h1]:mb-3 [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:text-black sm:[&_h1]:text-4xl [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-black [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-black [&_li]:mt-1 [&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:marker:text-black">
        {data.content && <div dangerouslySetInnerHTML={{ __html: data.content }} />}
      </div>
    </section>
  );
}

// Enhanced section renderers for new section types

function CardsSectionRenderer({ data }: { data: Record<string, any> }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:px-8 md:py-12 lg:max-w-5xl lg:px-10 xl:max-w-6xl 2xl:max-w-[90rem]">
      <div className="grid gap-4 lg:grid-cols-2">
        {(data.cards || []).map((card: any, index: number) => (
          <article 
            key={index} 
            className="rounded-2xl border border-[#d7deeb] bg-white p-6 transition-shadow duration-300 ease-out motion-safe:animate-fade-in-up motion-safe:transition-transform motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-lg md:p-8"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start gap-4">
              {card.icon && (
                <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#2f7dff]">
                  {card.icon === 'users' && (
                    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden="true">
                      <circle cx="8" cy="10" r="3" stroke="currentColor" strokeWidth="1.8"></circle>
                      <circle cx="16.5" cy="8.5" r="2.5" stroke="currentColor" strokeWidth="1.8"></circle>
                      <path d="M4 19c0-2.6 2.1-4.7 4.7-4.7h1.1c2.6 0 4.7 2.1 4.7 4.7M13.3 18.5c.3-1.8 1.8-3.1 3.6-3.1h.9c1.3 0 2.4.6 3.1 1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"></path>
                    </svg>
                  )}
                  {card.icon === 'check' && (
                    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden="true">
                      <circle cx="12" cy="11" r="6" stroke="currentColor" strokeWidth="1.8"></circle>
                      <path d="m9.5 11.2 1.8 1.8 3.3-3.7M9 18.5l-1 2.5 4-1.3 4 1.3-1-2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  )}
                  {card.icon === 'lightbulb' && (
                    <svg viewBox="0 0 90 90" className="h-8 w-8 text-[#2f7dff]" fill="none" aria-hidden="true">
                      <path d="M 60.453 29.767 c -4.971 -4.454 -11.394 -6.499 -18.088 -5.76 c -11.024 1.218 -19.632 10.146 -20.469 21.229" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"></path>
                    </svg>
                  )}
                  {card.icon === 'target' && (
                    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden="true">
                      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8"></circle>
                      <circle cx="12" cy="12" r="4.6" stroke="currentColor" strokeWidth="1.8"></circle>
                      <circle cx="12" cy="12" r="1.3" fill="currentColor"></circle>
                      <path d="m12 12 4.8-4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"></path>
                    </svg>
                  )}
                </span>
              )}
              <div>
                <h3 className="text-2xl font-semibold text-[#1f2741] md:text-3xl">{card.title}</h3>
                {card.content && (
                  <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[#55627e] md:text-[15px] md:leading-relaxed">{card.content}</p>
                )}
                {card.points && (
                  <ul className="mt-3 space-y-2.5 text-sm leading-snug text-[#445675] md:text-[15px] md:leading-relaxed">
                    {card.points.map((point: string, i: number) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2f7dff] text-[10px] font-bold leading-none text-white">✓</span>
                        <span className="min-w-0">{point}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CTASectionRenderer({ data }: { data: Record<string, any> }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 md:px-8 md:pb-16 lg:max-w-5xl lg:px-10 xl:max-w-6xl 2xl:max-w-[90rem]">
      <div className="mt-8 rounded-2xl border border-[#264579] bg-[linear-gradient(120deg,#091229,#0b1a39_48%,#0e2348)] px-5 py-6 text-white motion-safe:animate-fade-in-up motion-safe:delay-150 sm:px-8 md:px-10 md:py-7">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex min-w-0 items-center gap-5">
            <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[#3a7ce2] bg-[#102a57] text-[#77aefc]">
              <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" aria-hidden="true">
                <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" stroke="currentColor" strokeWidth="1.8"></path>
              </svg>
            </span>
            <div className="min-w-0">
              {data.title && <p className="text-2xl font-semibold md:text-4xl">{data.title}</p>}
              {data.subtitle && <p className="mt-1 text-sm text-[#c7d8f8] md:text-base">{data.subtitle}</p>}
            </div>
          </div>
          <div className="ml-auto flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            {(data.buttons || []).map((button: any, index: number) => (
              <a
                key={index}
                href={button.url || '#'}
                className={`inline-flex min-w-[180px] items-center justify-center gap-2 whitespace-nowrap rounded-xl px-6 py-3 text-base font-semibold transition-colors duration-200 active:scale-[0.98] motion-safe:active:transition-transform md:text-lg ${
                  button.primary
                    ? 'border border-[#1f7bff] bg-[#1f7bff] hover:bg-[#2e87ff]'
                    : 'border border-[#456298] text-[#e5eeff] hover:bg-[#173160]'
                }`}
              >
                {button.text}
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
                  <path d="M4 10h10m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustSectionRenderer({ data }: { data: Record<string, any> }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 md:px-8 md:pb-16 lg:max-w-5xl lg:px-10 xl:max-w-6xl 2xl:max-w-[90rem]">
      {data.title && (
        <h3 className="text-center text-3xl font-semibold text-[#202743] motion-safe:animate-fade-in-up md:text-4xl">
          {data.title}
        </h3>
      )}
      {data.subtitle && (
        <p className="mt-2 text-center text-base text-[#6f7893] motion-safe:animate-fade-in-up motion-safe:delay-75 md:text-lg">
          {data.subtitle}
        </p>
      )}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(data.cards || []).map((card: any, index: number) => (
          <article 
            key={index} 
            className="rounded-2xl border border-[#d7deeb] bg-white p-5 transition-shadow duration-300 ease-out motion-safe:animate-fade-in-up motion-safe:transition-transform motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-md"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {card.icon && (
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#eef2ff] text-[#2f7dff]">
                {card.icon === 'document' && (
                  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden="true">
                    <rect x="6" y="4" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.8"></rect>
                    <path d="M9 9h6M9 13h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"></path>
                  </svg>
                )}
                {card.icon === 'graduation' && (
                  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden="true">
                    <path d="m4 9 8-5 8 5-8 5-8-5Zm3 2.5v4.5c0 1.6 2.2 3 5 3s5-1.4 5-3v-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"></path>
                  </svg>
                )}
                {card.icon === 'shield' && (
                  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden="true">
                    <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" stroke="currentColor" strokeWidth="1.8"></path>
                  </svg>
                )}
                {card.icon === 'handshake' && (
                  <svg viewBox="0 0 90 90" className="h-7 w-7 text-[#2f7dff]" fill="none" aria-hidden="true">
                    <path d="M 89.689 16.621 c -0.198 -0.188 -0.461 -0.284 -0.739 -0.274 c -6.479 0.321 -13.518 1.398 -22.148 3.389" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"></path>
                  </svg>
                )}
              </span>
            )}
            <h4 className="mt-3 text-xl font-semibold text-[#1f2741] md:text-2xl">{card.title}</h4>
            <p className="mt-2 text-sm leading-6 text-[#55627e] md:text-[15px] md:leading-relaxed">{card.content}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function HowItWorksSectionRenderer({ data }: { data: Record<string, any> }) {
  return (
    <section className="mx-auto max-w-7xl space-y-4 px-4 py-10 sm:px-6 md:px-6 md:py-14 lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem]">
      <article className="rounded-2xl border border-[#d7e7de] bg-[#edf7f0] p-5 md:p-6">
        <div className="grid gap-3 md:grid-cols-[1.1fr_3fr]">
          <div>
            {data.title && <h3 className="text-3xl font-semibold text-[#1a2440]">{data.title}</h3>}
            {data.subtitle && <p className="mt-2 text-sm text-[#5e7293]">{data.subtitle}</p>}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(data.steps || []).map((step: any, index: number) => (
              <div key={index} className="rounded-xl border border-[#d2e6da] bg-white/70 p-4">
                <p className="text-sm font-semibold text-[#1f355d]">{step.title}</p>
                <p className="mt-1 text-xs text-[#5e7293]">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </article>
    </section>
  );
}

function DocumentationGridRenderer({ data }: { data: Record<string, any> }) {
  const [activeCategory, setActiveCategory] = React.useState<string>('All');
  
  const filteredDocs = React.useMemo(() => {
    if (activeCategory === 'All') return data.documents || [];
    return (data.documents || []).filter((doc: any) => doc.category === activeCategory);
  }, [activeCategory, data.documents]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:px-6 md:py-14 lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem]">
      <div>
        {data.title && <h3 className="text-4xl font-semibold text-[#1a2440]">{data.title}</h3>}
        {data.subtitle && <p className="mt-2 text-base text-[#5e7293]">{data.subtitle}</p>}
        {data.categories && (
          <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Documentation categories">
            {data.categories.map((category: string) => (
              <button
                key={category}
                role="tab"
                aria-selected={activeCategory === category}
                onClick={() => setActiveCategory(category)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors ${
                  activeCategory === category
                    ? 'border-[#1f7bff] bg-[#1f7bff] text-white'
                    : 'border-[#d7deeb] bg-white text-[#5e7293] hover:bg-[#f7f9ff]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mt-4">
        {filteredDocs.map((doc: any, index: number) => (
          <article
            key={index}
            className="flex h-full flex-col rounded-2xl border border-[#d7deeb] bg-white p-4 shadow-sm transition-shadow duration-300 ease-out motion-safe:transition-transform motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-[#1f2741]">{doc.name}</h2>
              {doc.badge && (
                <span className="rounded-full bg-[#dbf8e9] px-2 py-0.5 text-[10px] font-semibold text-[#2f9c65]">
                  {doc.badge}
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-[#5e7293]">{doc.subtitle}</p>
            {doc.points && (
              <ul className="mt-3 space-y-1.5 text-xs text-[#5f7394]">
                {doc.points.map((point: string, i: number) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#ddf5e8] text-[#2f9c65]">
                      <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" aria-hidden="true">
                        <path d="m4.2 8.1 2.2 2.2 5.2-5.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-auto pt-5 text-2xl font-semibold text-[#1f355d]">{doc.price}</p>
            <a
              href="/register"
              className="mt-3 flex w-full items-center justify-center rounded-lg border border-[#1f7bff] bg-[#1f7bff]/10 px-3 py-2 text-sm font-semibold text-[#1f7bff] transition-colors hover:bg-[#1f7bff]/20"
            >
              Get started
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

function BundlesSectionRenderer({ data }: { data: Record<string, any> }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:px-6 md:py-14 lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem]">
      <article className="rounded-2xl border border-[#d7deeb] bg-[#eef2fa] p-5 transition-shadow duration-300 ease-out motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md md:p-6">
        {data.title && <h3 className="text-3xl font-semibold text-[#1a2440]">{data.title}</h3>}
        {data.subtitle && <p className="mt-2 text-sm text-[#5e7293]">{data.subtitle}</p>}
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {(data.bundles || []).map((bundle: any, index: number) => (
            <div
              key={index}
              className={`flex h-full flex-col rounded-xl border bg-white p-4 text-center ${
                bundle.badge ? 'border-2 border-[#2f7dff]' : 'border-[#d7deeb]'
              }`}
            >
              {bundle.badge && (
                <p className="inline-flex rounded-full bg-[#2f7dff] px-3 py-0.5 text-xs font-semibold uppercase tracking-[0.08em] text-white">
                  {bundle.badge}
                </p>
              )}
              <p className="mt-2 font-semibold text-[#1f355d]">{bundle.title}</p>
              <p className="mt-1 text-sm text-[#5e7293]">{bundle.subtitle}</p>
              {bundle.save && <p className="mt-2 text-xs font-semibold text-[#2f9c65]">{bundle.save}</p>}
              <p className="mt-auto pt-3 text-3xl font-bold text-[#1f355d]">{bundle.price}</p>
              {bundle.originalPrice && (
                <p className="mt-1 text-xs text-[#7e8fa9] line-through">{bundle.originalPrice}</p>
              )}
              <a
                href="/register"
                className={`mt-3 flex items-center justify-center rounded-lg border px-3 py-1.5 text-center text-sm font-semibold transition-colors ${
                  bundle.badge
                    ? 'border-[#1f7bff] bg-[#1f7bff] text-white hover:bg-[#2e87ff]'
                    : 'border-[#b8c9e8] text-[#355d99] hover:bg-[#f3f7ff]'
                }`}
              >
                Get started
              </a>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

function WhyChooseSectionRenderer({ data }: { data: Record<string, any> }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:px-6 md:py-14 lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem]">
      <article className="rounded-2xl border border-[#d7e7de] bg-[#edf7f0] p-5 transition-shadow duration-300 ease-out motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md md:p-6">
        {data.title && <h3 className="text-3xl font-semibold text-[#1f3a31]">{data.title}</h3>}
        <ul className="mt-4 space-y-2.5 text-base leading-7 text-[#2f7f57]">
          {(data.points || []).map((point: string, index: number) => (
            <li key={index} className="flex items-center gap-2.5">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#ddf5e8] text-[#2f9c65]">
                <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" aria-hidden="true">
                  <path d="m4.2 8.1 2.2 2.2 5.2-5.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </span>
              {point}
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
