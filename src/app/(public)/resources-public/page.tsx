'use client';

import Link from 'next/link';
import bgImage from '@/assets/cybersecurity-background-59ognpsy7izka4l9.png';
import { PublicFooter } from '@/components/public-footer';
import { useLocale, translate } from '@/lib/i18n';
import { resourcesMessages } from '@/locales/resources';

function ArrowRightIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" aria-hidden="true">
      <path d="M4 10h10m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconByName({ name, className = 'h-6 w-6' }: { name: string; className?: string }) {
  if (name === 'calendar') return <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.8" /><path d="M8 3v4M16 3v4M4 9h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
  if (name === 'clipboard-check') return <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true"><rect x="6" y="4" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" /><path d="M9 9h6M9 13h3m1 4 2 2 3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (name === 'cloud-upload') return <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true"><path d="M7 18a4 4 0 1 1 .7-7.9A5.2 5.2 0 0 1 18 11.2 3.8 3.8 0 1 1 17.8 18H7Z" stroke="currentColor" strokeWidth="1.8" /><path d="m12 15.5 0-6m0 0-2.5 2.5m2.5-2.5 2.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (name === 'shield-check') return <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true"><path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" stroke="currentColor" strokeWidth="1.8" /><path d="m9.4 12.2 1.8 1.8 3.6-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (name === 'trash') return <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true"><path d="M4 7h16M9 7V5h6v2m-8 0 1 12h8l1-12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (name === 'search') return <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true"><circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.8" /><path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
  if (name === 'target') return <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="1.3" fill="currentColor" /></svg>;
  if (name === 'doc-stack') return <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true"><path d="M8 4h7l4 4v12H8zM15 4v4h4" stroke="currentColor" strokeWidth="1.8" /><path d="M6 8h2M6 12h2M6 16h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
  if (name === 'shield') return <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true"><path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" stroke="currentColor" strokeWidth="1.8" /></svg>;
  if (name === 'server') return <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true"><rect x="4" y="4" width="16" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.8" /><rect x="4" y="14" width="16" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.8" /><circle cx="8" cy="7" r="0.9" fill="currentColor" /><circle cx="8" cy="17" r="0.9" fill="currentColor" /></svg>;
  if (name === 'chart') return <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true"><path d="M4 19h16M7 16V9m5 7V6m5 10v-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
  if (name === 'users') return <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true"><circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.8" /><circle cx="16.5" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.8" /><path d="M4 19c0-2.8 2.2-5 5-5h1c2.8 0 5 2.2 5 5M14 18.6c.3-1.6 1.6-2.8 3.2-2.8h.8c1.2 0 2.2.5 2.8 1.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
  return null;
}

const useCaseDefs = [
  {
    titleKey: 'useCases.beforeAudit.title',
    bodyKey: 'useCases.beforeAudit.body',
    icon: 'calendar',
  },
  {
    titleKey: 'useCases.internalReview.title',
    bodyKey: 'useCases.internalReview.body',
    icon: 'search',
  },
  {
    titleKey: 'useCases.gapAnalysis.title',
    bodyKey: 'useCases.gapAnalysis.body',
    icon: 'target',
  },
  {
    titleKey: 'useCases.documentationReadiness.title',
    bodyKey: 'useCases.documentationReadiness.body',
    icon: 'doc-stack',
  },
];

const stepDefs = [
  {
    titleKey: 'steps.chooseChecklist.title',
    bodyKey: 'steps.chooseChecklist.body',
    icon: 'clipboard-check',
  },
  {
    titleKey: 'steps.answerGuidedQuestions.title',
    bodyKey: 'steps.answerGuidedQuestions.body',
    icon: 'doc-stack',
  },
  {
    titleKey: 'steps.uploadEvidence.title',
    bodyKey: 'steps.uploadEvidence.body',
    icon: 'cloud-upload',
  },
  {
    titleKey: 'steps.adminReview.title',
    bodyKey: 'steps.adminReview.body',
    icon: 'shield-check',
  },
  {
    titleKey: 'steps.assessmentDataLifecycle.title',
    bodyKey: 'steps.assessmentDataLifecycle.body',
    icon: 'trash',
  },
];

const audienceDefs = [
  { titleKey: 'audiences.complianceTeams.title', bodyKey: 'audiences.complianceTeams.body', icon: 'shield-check' },
  { titleKey: 'audiences.itSecurityTeams.title', bodyKey: 'audiences.itSecurityTeams.body', icon: 'server' },
  { titleKey: 'audiences.management.title', bodyKey: 'audiences.management.body', icon: 'chart' },
  { titleKey: 'audiences.auditorsConsultants.title', bodyKey: 'audiences.auditorsConsultants.body', icon: 'users' },
];

export default function ResourcesPage() {
  const { locale } = useLocale();
  const t = (key: string, values?: Record<string, string>) => translate(resourcesMessages, locale, key, values);
  const useCases = useCaseDefs.map((item) => ({
    ...item,
    title: t(item.titleKey),
    body: t(item.bodyKey),
  }));
  const steps = stepDefs.map((item) => ({
    ...item,
    title: t(item.titleKey),
    body: t(item.bodyKey),
  }));
  const audiences = audienceDefs.map((item) => ({
    ...item,
    title: t(item.titleKey),
    body: t(item.bodyKey),
  }));
  const heroStyle = {
    backgroundImage: `linear-gradient(rgba(243, 246, 255, 0.88), rgba(243, 246, 255, 0.92)), url(${bgImage.src})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  } as const;

  return (
    <main className="overflow-x-hidden bg-[#f3f5fb]">
      <section style={heroStyle}>
        <div className="mx-auto min-h-[520px] max-w-7xl px-4 py-6 sm:px-6 md:px-6 md:py-8 lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem]">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#64799d] transition-colors duration-200 hover:text-[#3f5376]"
          >
            <span aria-hidden="true">←</span>
            {t('hero.backToProducts')}
          </Link>

          <div className="mt-5 grid items-center gap-7 lg:grid-cols-[1.02fr_0.98fr]">
            <div className="space-y-5">
              <span className="public-eyebrow inline-flex rounded-full bg-[#dfe8ff] px-4 py-1.5 text-[#5278be] motion-safe:animate-fade-in motion-safe:delay-75">
                {t('hero.badge')}
              </span>

              <div className="flex items-start gap-4 motion-safe:animate-fade-in-up motion-safe:delay-100">
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#dfe9ff] text-[#2f7dff]">
                  <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" aria-hidden="true">
                    <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" fill="currentColor" fillOpacity="0.35" stroke="currentColor" strokeWidth="1.8" />
                    <path d="m9.4 12.2 1.8 1.8 3.6-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <h1 className="public-hero-title text-[#1a2440]">
                  {t('hero.title.line1')}
                  <br />
                  {t('hero.title.line2')}
                </h1>
              </div>

              <p className="public-hero-subtitle max-w-2xl text-[#4f6282] motion-safe:animate-fade-in-up motion-safe:delay-150">
                {t('hero.subtitle')}
              </p>

              <div className="flex flex-wrap gap-3 motion-safe:animate-fade-in-up motion-safe:delay-200">
                <a
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#1f7bff] bg-[#1f7bff] px-7 py-3 text-2xl font-semibold text-white transition-colors duration-200 hover:bg-[#2e87ff] active:scale-[0.98] motion-safe:active:transition-transform"
                >
                  {t('hero.getAccess')}
                  <ArrowRightIcon />
                </a>
                <Link
                  href="/products/audit-readiness-checklist"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#b5c7e7] bg-white/85 px-7 py-3 text-2xl font-semibold text-[#334a72] transition-colors duration-200 hover:bg-white active:scale-[0.98] motion-safe:active:transition-transform"
                >
                  {t('hero.viewProduct')}
                  <ArrowRightIcon />
                </Link>
              </div>

              <div className="grid gap-3 pt-1 motion-safe:animate-fade-in-up motion-safe:delay-300 sm:grid-cols-3">
                <div className="flex items-start gap-2 text-[#3f5375] motion-safe:transition-transform motion-safe:hover:-translate-y-0.5">
                  <span className="mt-1 text-[#2f7dff]">
                    <IconByName name="shield" className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-lg font-semibold">{t('hero.highlight1.title')}</p>
                    <p className="text-sm text-[#627796]">{t('hero.highlight1.body')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-[#3f5375] motion-safe:transition-transform motion-safe:hover:-translate-y-0.5">
                  <span className="mt-1 text-[#2f7dff]">
                    <IconByName name="clipboard-check" className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-lg font-semibold">{t('hero.highlight2.title')}</p>
                    <p className="text-sm text-[#627796]">{t('hero.highlight2.body')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-[#3f5375] motion-safe:transition-transform motion-safe:hover:-translate-y-0.5">
                  <span className="mt-1 text-[#2f7dff]">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                      <path d="m13 2-7 11h5l-1 9 8-12h-5l0-8Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-lg font-semibold">{t('hero.highlight3.title')}</p>
                    <p className="text-sm text-[#627796]">{t('hero.highlight3.body')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative motion-safe:animate-fade-in-right motion-safe:delay-150">
              <div className="overflow-hidden rounded-2xl border border-[#c9d7ef] bg-[#f7f9fe] shadow-[0_16px_45px_rgba(60,85,130,0.2)] transition-shadow duration-500 ease-out motion-safe:hover:shadow-[0_20px_50px_rgba(60,85,130,0.28)]">
                <div className="grid md:grid-cols-[165px_1fr]">
                  <aside className="h-full bg-[#0b1a39] p-3 text-[#dce8ff]">
                    <p className="mb-3 text-sm font-semibold">{t('mock.brand')}</p>
                    <ul className="space-y-2 text-xs">
                      <li className="rounded-md px-2 py-1.5 text-[#a0b4d5]">{t('mock.nav.dashboard')}</li>
                      <li className="rounded-md bg-[#17376d] px-2 py-1.5">{t('mock.nav.checklists')}</li>
                      <li className="rounded-md px-2 py-1.5 text-[#a0b4d5]">{t('mock.nav.reports')}</li>
                      <li className="rounded-md px-2 py-1.5 text-[#a0b4d5]">{t('mock.nav.settings')}</li>
                    </ul>
                  </aside>
                  <div className="p-3">
                    <div className="rounded-xl bg-white p-3">
                      <p className="text-sm font-semibold text-[#253d63]">{t('mock.sectionTitle')}</p>
                      <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_170px]">
                        <div>
                          <p className="text-sm font-semibold text-[#1f2741]">{t('mock.question')}</p>
                          <p className="mt-1 text-xs text-[#6b7e9b]">{t('mock.questionHelp')}</p>
                        </div>
                        <div className="rounded-lg bg-[#f7f9ff] p-2 text-xs text-[#5f7292]">
                          <p className="font-semibold text-[#344d75]">{t('mock.progress')}</p>
                          <p className="mt-1 text-2xl font-bold text-[#1f355d]">42%</p>
                          <div className="mt-2 h-1.5 rounded-full bg-[#d8e3f6]">
                            <div className="h-full w-[42%] rounded-full bg-[#2f7dff]" />
                          </div>
                          <ul className="mt-2 space-y-0.5 text-[11px]">
                            <li>{t('mock.answer.yes')} 12</li>
                            <li>{t('mock.answer.partly')} 5</li>
                            <li>{t('mock.answer.no')} 3</li>
                            <li>{t('mock.answer.notSure')} 2</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_170px]">
                      <div className="rounded-xl bg-white p-3">
                        <p className="text-sm font-semibold text-[#253d63]">{t('mock.evidence')}</p>
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
                <p className="text-[30px] font-semibold leading-none text-[#253d63]">{t('mock.maturity')}</p>
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
                    <polygon
                      points="160,52 220,78 222,136 160,166 102,134 108,82"
                      fill="#93b5f3"
                      fillOpacity="0.42"
                      stroke="#5e97ed"
                      strokeWidth="2"
                    />
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
                    {t('mock.legend.current')}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-[2px] bg-[#98dbc0]" />
                    {t('mock.legend.target')}
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
            <p className="text-xl font-semibold text-[#334a72]">{t('mainBenefit.kicker')}</p>
            <h2 className="mt-3 text-4xl font-semibold leading-tight text-[#1a2440]">
              {t('mainBenefit.title')}
            </h2>
            <p className="mt-4 text-xl leading-8 text-[#556b8c]">
              {t('mainBenefit.body')}
            </p>
          </article>

          <article className="rounded-2xl border border-[#d7deeb] bg-white p-6 transition-shadow duration-300 ease-out motion-safe:animate-fade-in-up motion-safe:delay-150 motion-safe:transition-transform motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-lg md:p-8">
            <p className="text-xl font-semibold text-[#334a72]">{t('sections.useCases')}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {useCases.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-[#dbe4f4] bg-[#f7f9ff] p-4 transition-shadow duration-300 motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md"
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#e7eeff] text-[#2f7dff]">
                    <IconByName name={item.icon} className="h-6 w-6" />
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
              <h2 className="text-4xl font-semibold text-[#1a2440]">{t('sections.howItWorks')}</h2>
              <p className="mt-2 text-xl text-[#556b8c]">{t('sections.howItWorksBody')}</p>
            </div>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl border border-[#b7caea] bg-[#f7f9ff] px-5 py-2.5 text-lg font-semibold text-[#2f7dff] transition-colors duration-200 hover:border-[#9eb6e8] hover:bg-[#eef3ff] active:scale-[0.98] motion-safe:active:transition-transform"
            >
              {t('sections.viewDemo')}
              <ArrowRightIcon />
            </Link>
          </div>

          <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
            {steps.map((step, idx) => (
              <article
                key={step.title}
                className="relative motion-safe:animate-fade-in-up motion-safe:transition-transform motion-safe:hover:-translate-y-0.5"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="flex items-center gap-3 xl:block">
                  <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#e7eeff] text-[#2f7dff]">
                    <IconByName name={step.icon} className="h-8 w-8" />
                  </span>
                  <p className="inline-flex items-center gap-2 text-xl font-semibold text-[#24395f] xl:hidden">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#2f7dff] text-sm text-white">{idx + 1}</span>
                    {step.title}
                  </p>
                </div>
                {idx < steps.length - 1 ? (
                  <>
                    <span className="absolute left-[68px] top-7 hidden w-[calc(100%-76px)] border-t-2 border-dashed border-[#bad0ef] xl:block" />
                    <svg
                      viewBox="0 0 14 14"
                      className="absolute right-[6px] top-[22px] hidden h-4 w-4 text-[#98b7e5] xl:block"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path d="M2 2 11 7 2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </>
                ) : null}
                <p className="mt-3 hidden items-center gap-2 text-xl font-semibold text-[#24395f] xl:inline-flex">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#2f7dff] text-sm text-white">{idx + 1}</span>
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
          <h2 className="text-4xl font-semibold text-[#1a2440] motion-safe:animate-fade-in-up">{t('sections.whoItsFor')}</h2>
          <p className="mt-2 text-xl text-[#556b8c] motion-safe:animate-fade-in-up motion-safe:delay-75">
            {t('sections.whoItsForBody')}
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {audiences.map((item, idx) => (
              <article
                key={item.title}
                className="rounded-2xl border border-[#d7deeb] bg-[#f7f9ff] p-5 transition-shadow duration-300 motion-safe:animate-fade-in-up motion-safe:transition-transform motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-md"
                style={{ animationDelay: `${100 + idx * 90}ms` }}
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#e7eeff] text-[#2f7dff]">
                  <IconByName name={item.icon} className="h-6 w-6" />
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
            <h2 className="text-4xl font-semibold text-[#1a2440]">{t('whatYouGet.title')}</h2>
            <p className="mt-2 text-xl text-[#556b8c]">{t('whatYouGet.subtitle')}</p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-2xl border border-[#d7deeb] bg-[#f2fbf6] p-5 transition-shadow duration-300 motion-safe:transition-transform motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-md">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f7ee] text-[#30b271]">
                <IconByName name="chart" className="h-6 w-6" />
              </span>
              <h3 className="mt-3 text-2xl font-semibold text-[#1f355d]">{t('whatYouGet.card1.title')}</h3>
              <p className="mt-2 text-sm leading-6 text-[#5e7293]">{t('whatYouGet.card1.body')}</p>
              <ul className="mt-4 space-y-1.5 text-sm text-[#4e6283]">
                <li>{t('whatYouGet.card1.point1')}</li>
                <li>{t('whatYouGet.card1.point2')}</li>
                <li>{t('whatYouGet.card1.point3')}</li>
              </ul>
            </article>

            <article className="rounded-2xl border border-[#d7deeb] bg-[#f2f7ff] p-5 transition-shadow duration-300 motion-safe:transition-transform motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-md">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#e9f0ff] text-[#3c7df0]">
                <IconByName name="doc-stack" className="h-6 w-6" />
              </span>
              <h3 className="mt-3 text-2xl font-semibold text-[#1f355d]">{t('whatYouGet.card2.title')}</h3>
              <p className="mt-2 text-sm leading-6 text-[#5e7293]">{t('whatYouGet.card2.body')}</p>
              <ul className="mt-4 space-y-1.5 text-sm text-[#4e6283]">
                <li>{t('whatYouGet.card2.point1')}</li>
                <li>{t('whatYouGet.card2.point2')}</li>
                <li>{t('whatYouGet.card2.point3')}</li>
              </ul>
            </article>

            <article className="rounded-2xl border border-[#d7deeb] bg-[#fffaf0] p-5 transition-shadow duration-300 motion-safe:transition-transform motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-md">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#fff5df] text-[#f2b535]">
                <IconByName name="target" className="h-6 w-6" />
              </span>
              <h3 className="mt-3 text-2xl font-semibold text-[#1f355d]">{t('whatYouGet.card3.title')}</h3>
              <p className="mt-2 text-sm leading-6 text-[#5e7293]">{t('whatYouGet.card3.body')}</p>
              <ul className="mt-4 space-y-1.5 text-sm text-[#4e6283]">
                <li>{t('whatYouGet.card3.point1')}</li>
                <li>{t('whatYouGet.card3.point2')}</li>
                <li>{t('whatYouGet.card3.point3')}</li>
              </ul>
            </article>

            <article className="rounded-2xl border border-[#d7deeb] bg-[#f6f3ff] p-5 transition-shadow duration-300 motion-safe:transition-transform motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-md">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#f1ecff] text-[#6c62f7]">
                <IconByName name="shield-check" className="h-6 w-6" />
              </span>
              <h3 className="mt-3 text-2xl font-semibold text-[#1f355d]">{t('whatYouGet.card4.title')}</h3>
              <p className="mt-2 text-sm leading-6 text-[#5e7293]">{t('whatYouGet.card4.body')}</p>
              <ul className="mt-4 space-y-1.5 text-sm text-[#4e6283]">
                <li>{t('whatYouGet.card4.point1')}</li>
                <li>{t('whatYouGet.card4.point2')}</li>
                <li>{t('whatYouGet.card4.point3')}</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 md:px-6 md:pb-12 lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem]">
        <div className="rounded-2xl border border-[#264579] bg-[linear-gradient(120deg,#091229,#0b1a39_48%,#0e2348)] px-5 py-6 text-white motion-safe:animate-fade-in-up motion-safe:delay-100 sm:px-8 md:px-10 md:py-7">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-[#3a7ce2] bg-[#102a57] text-[#77aefc]">
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden="true">
                  <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              </span>
              <div>
                <p className="text-2xl font-semibold md:text-4xl">{t('closingCta.title')}</p>
                <p className="text-sm text-[#c7d8f8] md:text-base">{t('closingCta.subtitle')}</p>
              </div>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#1f7bff] bg-[#1f7bff] px-7 py-3 text-base font-semibold text-white transition-colors duration-200 hover:bg-[#2e87ff] active:scale-[0.98] motion-safe:active:transition-transform md:text-lg"
              >
                {t('closingCta.getAccess')}
                <ArrowRightIcon />
              </Link>
              <Link
                href="/products/audit-readiness-checklist"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#456298] px-7 py-3 text-base font-semibold text-[#e5eeff] transition-colors duration-200 hover:bg-[#173160] active:scale-[0.98] motion-safe:active:transition-transform md:text-lg"
              >
                {t('closingCta.viewProduct')}
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
