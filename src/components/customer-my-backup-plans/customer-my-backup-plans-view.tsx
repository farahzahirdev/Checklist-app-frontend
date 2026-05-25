'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';
import type { ReactNode } from 'react';
import neonNetworkBg from '@/assets/Neon-Network-Overlay.jpg';
import { ProfileBackupIcon } from '@/components/customer-profile/profile-product-icons';

const cardClass = 'rounded-2xl border border-[#e2e8f0] bg-white shadow-[0_4px_24px_rgba(15,23,42,0.06)]';
const primaryBtn =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-[#0066ff] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0052cc]';
const outlineBtn =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-[#cbd5e1] bg-white px-5 py-2.5 text-sm font-semibold text-[#0066ff] transition-colors hover:border-[#94a3b8] hover:bg-[#f8fafc]';

type TranslateFn = (key: string) => string;

const EMPTY_STATS = {
  active: '0',
  assets: '0',
  restoreTests: '0',
  review: '0',
} as const;

function SummaryStatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="flex min-w-0 flex-1 gap-3 rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-[0_12px_40px_rgba(15,23,42,0.1)] sm:p-5">
      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eff6ff] text-[#0066ff]">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-[#64748b]">{label}</p>
        <p className="mt-0.5 text-2xl font-bold leading-none text-[#0f172a]">{value}</p>
        <p className="mt-1 text-xs text-[#64748b]">{hint}</p>
      </div>
    </div>
  );
}

function StepIconBox({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eff6ff] text-[#0066ff]">
      {children}
    </span>
  );
}

function WorkflowStep({
  icon,
  title,
  description,
  isLast,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  isLast?: boolean;
}) {
  return (
    <li className="relative flex gap-3">
      {!isLast ? (
        <span
          className="absolute left-[18px] top-10 bottom-0 w-px border-l border-dashed border-[#cbd5e1]"
          aria-hidden="true"
        />
      ) : null}
      <StepIconBox>{icon}</StepIconBox>
      <div className={`min-w-0 flex-1 ${isLast ? '' : 'pb-8'}`}>
        <p className="text-sm font-semibold text-[#0f172a]">{title}</p>
        <p className="text-xs text-[#64748b]">{description}</p>
      </div>
    </li>
  );
}

function IconServer() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="16" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="4" y="14" width="16" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="8" cy="7" r="0.75" fill="currentColor" />
      <circle cx="8" cy="17" r="0.75" fill="currentColor" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconRestoreTest() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8v4l2.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M12 8v5M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M10.3 4.2 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconLayers() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M12 4 4 8l8 4 8-4-8-4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m4 12 8 4 8-4M4 16l8 4 8-4" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function IconBranch() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M6 4v6h6M6 10h4a4 4 0 0 1 4 4v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="18" cy="20" r="2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="6" cy="4" r="2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconListCheck() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M9 6h12M9 12h12M9 18h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="m4 6 1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconValidate() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export type CustomerMyBackupPlansViewProps = {
  t: TranslateFn;
};

export function CustomerMyBackupPlansView({ t }: CustomerMyBackupPlansViewProps) {
  return (
    <div className="min-h-full w-full bg-[#eef2f7]">
      <header className="relative w-full overflow-hidden pb-14 sm:pb-16">
        <Image src={neonNetworkBg} alt="" fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(4,12,32,0.94)_0%,rgba(8,24,56,0.82)_50%,rgba(12,40,88,0.55)_100%)]" />
        <div
          className="pointer-events-none absolute right-8 top-1/2 hidden -translate-y-1/2 opacity-40 lg:block"
          aria-hidden="true"
        >
          <div className="relative h-48 w-48 xl:h-56 xl:w-56">
            <div className="absolute inset-0 rounded-full bg-[#0066ff]/20 blur-3xl" />
            <span className="relative inline-flex text-[#3b82f6]">
              <ProfileBackupIcon className="h-24 w-24 xl:h-28 xl:w-28" />
            </span>
          </div>
        </div>
        <div className="relative w-full px-5 pt-8 sm:px-6 sm:pt-10 lg:px-8 xl:px-10">
          <div className="min-w-0 max-w-3xl xl:pr-56">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7eb8ff]">{t('hero.kicker')}</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.5rem]">
              {t('hero.title')}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#c8daf5] sm:text-base">{t('hero.subtitle')}</p>
          </div>

          <div className="relative z-10 mt-8 mb-[-2.75rem] grid w-full gap-3 sm:mb-[-3.25rem] sm:grid-cols-2 xl:grid-cols-4">
            <SummaryStatCard
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path d="M6 4h12v16H6z" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              }
              label={t('stats.active')}
              value={EMPTY_STATS.active}
              hint={t('stats.activeHint')}
            />
            <SummaryStatCard
              icon={<IconShield />}
              label={t('stats.assets')}
              value={EMPTY_STATS.assets}
              hint={t('stats.assetsHint')}
            />
            <SummaryStatCard
              icon={<IconRestoreTest />}
              label={t('stats.restoreTests')}
              value={EMPTY_STATS.restoreTests}
              hint={t('stats.restoreTestsHint')}
            />
            <SummaryStatCard
              icon={<IconAlert />}
              label={t('stats.review')}
              value={EMPTY_STATS.review}
              hint={t('stats.reviewHint')}
            />
          </div>
        </div>
      </header>

      <div className="w-full px-5 sm:px-6 lg:px-8 xl:px-10">
        <div className="grid w-full min-w-0 gap-6 pb-10 pt-12 sm:pt-14 xl:grid-cols-[minmax(0,1fr)_300px] 2xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-[#0f172a]">{t('list.title')}</h2>
              <div className="flex w-full flex-wrap items-center gap-2 opacity-60 sm:w-auto" aria-hidden="true">
                <label className="relative min-w-0 flex-1 sm:w-56">
                  <span className="sr-only">{t('list.search')}</span>
                  <svg
                    viewBox="0 0 24 24"
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
                    <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  <input
                    type="search"
                    disabled
                    placeholder={t('list.search')}
                    className="w-full cursor-not-allowed rounded-xl border border-[#e2e8f0] bg-[#f8fafc] py-2.5 pl-10 pr-3 text-sm text-[#94a3b8]"
                  />
                </label>
                <div className="relative">
                  <button
                    type="button"
                    disabled
                    className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-2.5 text-sm font-semibold text-[#94a3b8]"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                      <path d="M4 7h16M7 12h10M10 17h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                    {t('list.filters')}
                  </button>
                </div>
              </div>
            </div>

            <div className={`${cardClass} px-6 py-12 sm:px-10 sm:py-14`}>
              <div className="mx-auto flex max-w-lg flex-col items-center text-center">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eff6ff] text-[#0066ff]">
                  <ProfileBackupIcon className="h-8 w-8" />
                </span>
                <span className="mt-5 rounded-full bg-[#fef3c7] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#b45309]">
                  {t('comingSoon.badge')}
                </span>
                <h3 className="mt-4 text-xl font-bold text-[#0f172a]">{t('comingSoon.title')}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#64748b]">{t('comingSoon.body')}</p>
                <p className="mt-2 text-xs text-[#94a3b8]">{t('comingSoon.hint')}</p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <Link href={'/products#audits-checklists' as Route} className={primaryBtn}>
                    {t('comingSoon.cta')}
                  </Link>
                  <Link href="/support" className={outlineBtn}>
                    {t('comingSoon.support')}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <aside className="min-w-0 space-y-4 xl:sticky xl:top-4 xl:self-start">
            <div className={`${cardClass} p-5 sm:p-6`}>
              <h3 className="text-base font-bold text-[#0f172a]">{t('workflow.title')}</h3>
              <ol className="mt-4 space-y-1">
                <WorkflowStep icon={<IconLayers />} title={t('workflow.step1')} description={t('workflow.step1Desc')} />
                <WorkflowStep icon={<IconBranch />} title={t('workflow.step2')} description={t('workflow.step2Desc')} />
                <WorkflowStep icon={<IconServer />} title={t('workflow.step3')} description={t('workflow.step3Desc')} />
                <WorkflowStep icon={<IconClock />} title={t('workflow.step4')} description={t('workflow.step4Desc')} />
                <WorkflowStep
                  icon={<IconListCheck />}
                  title={t('workflow.step5')}
                  description={t('workflow.step5Desc')}
                />
                <WorkflowStep
                  icon={<IconValidate />}
                  title={t('workflow.step6')}
                  description={t('workflow.step6Desc')}
                  isLast
                />
              </ol>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
