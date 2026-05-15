'use client';

import type { ReactNode } from 'react';
import { useId } from 'react';
import { AdminBreadcrumbs } from '@/components/admin-breadcrumbs';
import { formatReportCalendarDate } from '@/lib/format-report';
import { translate, useLocale, type Locale } from '@/lib/i18n';
import { adminReportDetailMessages } from '@/locales/admin-report-detail';
import type { ReportFindingItem, ReportResponse, ReportSectionOverview, ReportStatus, ReportSummaryItem } from '@/lib/reports';
import { aggregateReportSectionOverviews, formatReportCode } from '@/lib/reports';

const STATUS_UI_CLASS: Record<ReportStatus, string> = {
  draft_generated: 'bg-[#fff4df] text-[#b6862f]',
  under_review: 'bg-[#eaf2ff] text-[#3f74df]',
  changes_requested: 'bg-[#fff4df] text-[#b6862f]',
  approved: 'bg-[#e9f8ef] text-[#2f9960]',
  published: 'bg-[#e9f8ef] text-[#2f9960]',
};

function summarySectionLabel(
  summary: ReportSummaryItem,
  overviews: ReportSectionOverview[],
  sectionFallback: string,
): string {
  const sid = summary.section_id;
  if (sid) {
    const ov = overviews.find((o) => o.section_id === sid);
    const t = ov?.section_title?.trim();
    if (t) return t;
  }
  const ch = summary.chapter_code?.trim();
  return ch || sectionFallback;
}

function maturityLabelFromPct(pct: number, locale: Locale): string {
  if (pct >= 80) return translate(adminReportDetailMessages, locale, 'hero.maturity.established');
  if (pct >= 60) return translate(adminReportDetailMessages, locale, 'hero.maturity.developing');
  if (pct >= 40) return translate(adminReportDetailMessages, locale, 'hero.maturity.emerging');
  return translate(adminReportDetailMessages, locale, 'hero.maturity.early');
}

function ShieldMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 44" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="heroShieldGrad" x1="8" y1="4" x2="36" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60a5fa" />
          <stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <path
        d="M20 2 38 8v14c0 10-8 18-18 20-10-2-18-10-18-20V8L20 2Z"
        fill="url(#heroShieldGrad)"
        fillOpacity="0.95"
      />
      <path
        d="M20 12v14m0 0 5-5m-5 5-5-5"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Full donut — matches executive “Maturity score” mock (ring + % + label inside). */
function AdminMaturityDonut({ percent, label }: { percent: number; label: string }) {
  const uid = useId().replace(/:/g, '');
  const gradId = `adminHeroDonut-${uid}`;
  const r = 52;
  const c = 2 * Math.PI * r;
  const safe = Math.min(100, Math.max(0, percent));
  const offset = c - (safe / 100) * c;

  return (
    <div className="flex flex-col items-center py-1">
      <div className="relative h-[132px] w-[132px]">
        <svg className="-rotate-90" width="132" height="132" viewBox="0 0 120 120" aria-hidden>
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop stopColor="#38bdf8" />
              <stop offset="1" stopColor="#2563eb" />
            </linearGradient>
          </defs>
          <circle cx="60" cy="60" r={r} fill="none" stroke="#e8edf5" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-0.5">
          <span className="text-2xl font-bold tabular-nums text-[#0f172a]">{Math.round(safe)}%</span>
          <span className="text-sm font-semibold text-[#2563eb]">{label}</span>
        </div>
      </div>
    </div>
  );
}

function HeroShieldArt({ className }: { className?: string }) {
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center ${className ?? ''}`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 rounded-full bg-[#1e3a8a]/40 blur-2xl" />
      <div className="relative h-28 w-28 sm:h-32 sm:w-32 md:h-36 md:w-36">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#3b82f6]/30 to-[#1e3a8a]/20 ring-1 ring-white/20 backdrop-blur-sm" />
        <svg viewBox="0 0 120 140" className="relative h-full w-full drop-shadow-2xl">
          <defs>
            <linearGradient id="bigShield" x1="20" y1="10" x2="100" y2="130" gradientUnits="userSpaceOnUse">
              <stop stopColor="#93c5fd" />
              <stop offset="0.5" stopColor="#3b82f6" />
              <stop offset="1" stopColor="#1e40af" />
            </linearGradient>
          </defs>
          <path
            d="M60 6 108 22v48c0 28-22 52-48 58-26-6-48-30-48-58V22L60 6Z"
            fill="url(#bigShield)"
            stroke="white"
            strokeOpacity="0.35"
            strokeWidth="1.5"
          />
          <path
            d="M60 44v36m0 0 12-12m-12 12-12-12"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

function StatCard({
  title,
  children,
  footer,
}: {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <article className="flex h-full min-h-[10.5rem] min-w-0 flex-col rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-[0_4px_24px_-8px_rgba(15,23,42,0.08)] sm:p-5">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#64748b]">{title}</p>
      <div className="mt-3 flex-1">{children}</div>
      {footer ? <div className="mt-3 border-t border-[#f1f5f9] pt-3">{footer}</div> : null}
    </article>
  );
}

function footerLink(href: string, children: ReactNode) {
  return (
    <a href={href} className="text-sm font-semibold text-[#2563eb] transition hover:text-[#1d4ed8]">
      {children}
    </a>
  );
}

export function AdminReportAssessmentHero({
  report,
  findings,
  summaries,
}: {
  report: ReportResponse;
  findings: ReportFindingItem[];
  summaries: ReportSummaryItem[];
}) {
  const { locale } = useLocale();
  const t = (key: string, values?: Record<string, string>) => translate(adminReportDetailMessages, locale, key, values);

  const overviews = [...(report.section_overviews ?? [])].sort((a, b) =>
    (a.section_code ?? a.chapter_code ?? '').localeCompare(b.section_code ?? b.chapter_code ?? ''),
  );
  const agg = aggregateReportSectionOverviews(overviews);
  const maturityPct = agg?.weightedPercentage ?? 0;
  const maturityLabel = agg
    ? maturityLabelFromPct(maturityPct, locale)
    : translate(adminReportDetailMessages, locale, 'hero.maturity.noData');

  const statusUi = {
    label: translate(adminReportDetailMessages, locale, `hero.status.${report.status}`),
    className: STATUS_UI_CLASS[report.status],
  };
  const client = report.company_name?.trim() || t('hero.emDash');
  const assessDate = formatReportCalendarDate(report.draft_generated_at);
  const reportCode = formatReportCode(report);
  const high = findings.filter((f) => f.priority === 'high').length;
  const medium = findings.filter((f) => f.priority === 'medium').length;
  const low = findings.filter((f) => f.priority === 'low').length;
  const description = report.company_description?.trim() ?? '';

  const summaryLabels = summaries.map((s) => summarySectionLabel(s, overviews, t('maturity.fallbackSection')));
  const uniqueSummaryLabels = [...new Set(summaryLabels)];

  return (
    <div className="min-w-0 space-y-4">
      <div className="relative min-w-0 overflow-hidden rounded-2xl border border-[#13305c] shadow-md">
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,#050f24_0%,#0a1a3d_40%,#102a5c_78%,#163d7a_100%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-24 top-0 h-[120%] w-[60%] opacity-[0.22]"
          style={{
            backgroundImage: `radial-gradient(circle at 30% 40%, rgba(96,165,250,0.45) 0%, transparent 45%),
              radial-gradient(circle at 70% 60%, rgba(59,130,246,0.25) 0%, transparent 40%),
              linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)`,
          }}
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.03)_50%,transparent_100%)] bg-[length:120px_100%] opacity-40 mix-blend-overlay" aria-hidden />

        <div className="relative z-10 px-4 py-4 sm:px-6 sm:py-5 md:px-7 md:py-6">
          <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-3">
            <AdminBreadcrumbs
              variant="onDark"
              items={[
                { label: t('hero.crumbs.dashboard'), href: '/admin' },
                { label: t('hero.crumbs.reports'), href: '/admin/reports' },
                { label: reportCode },
              ]}
            />
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold sm:px-3 sm:py-1 sm:text-xs ${statusUi.className}`}>
                {statusUi.label}
              </span>
              <span className="rounded-full border border-[#60a5fa]/50 bg-[#1e3a8a]/60 px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.16em] text-[#bfdbfe] backdrop-blur-sm sm:px-3 sm:py-1 sm:text-[0.65rem] sm:tracking-[0.2em]">
                {t('hero.confidential')}
              </span>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-4 sm:gap-5 xl:flex-row xl:items-center xl:justify-between xl:gap-6">
            <div className="min-w-0 max-w-2xl flex-1">
              <div className="flex items-center gap-2">
                <ShieldMark className="h-8 w-8 shrink-0 sm:h-9 sm:w-9" />
                <span className="text-base font-semibold tracking-tight text-white sm:text-lg">{t('hero.brand')}</span>
              </div>
              <p className="mt-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[#94b8f0] sm:tracking-[0.26em]">
                {t('hero.eyebrow')}
              </p>
              <h1 className="mt-1 text-2xl font-semibold leading-snug tracking-tight text-white sm:text-3xl md:text-[1.75rem]">
                {t('hero.title')}
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#b8cce8] sm:text-[0.95rem]">
                {t('hero.tagline')}
              </p>
              {client !== t('hero.emDash') ? (
                <p className="mt-1.5 max-w-xl text-sm text-[#c7d9f5] sm:text-base">{t('hero.preparedFor', { client })}</p>
              ) : null}
            </div>
            <HeroShieldArt className="mx-auto shrink-0 xl:mx-0 xl:pr-2" />
          </div>

          <dl className="mt-5 grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-3 sm:gap-4">
            <div>
              <dt className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#8fb0e6] sm:text-[0.65rem]">{t('hero.client')}</dt>
              <dd className="mt-0.5 text-sm font-semibold text-white">{client}</dd>
            </div>
            <div>
              <dt className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#8fb0e6] sm:text-[0.65rem]">{t('hero.assessmentDate')}</dt>
              <dd className="mt-0.5 text-sm font-semibold text-white">{assessDate}</dd>
            </div>
            <div>
              <dt className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#8fb0e6] sm:text-[0.65rem]">{t('hero.reportId')}</dt>
              <dd className="mt-0.5 font-mono text-sm font-semibold tracking-wide text-[#e0ecff] break-all">{reportCode}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* First content block: defer side-by-side until xl — at lg + sidebar, ~750px content makes 4 cards in one row unusable */}
      <div className="rounded-2xl bg-[#eef2f9] p-4 sm:p-5 md:p-6">
        <div className="grid gap-4 xl:grid-cols-12 xl:gap-5 xl:items-stretch">
          <div className="min-w-0 xl:col-span-5">
            <article className="h-full min-h-[10.5rem] rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-[0_4px_24px_-8px_rgba(15,23,42,0.08)] sm:p-6">
              <h2 className="text-lg font-semibold text-[#0f172a]">{t('hero.exec.title')}</h2>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-[#475569]">
                {agg ? (
                  <p>
                    {t('hero.exec.withAgg', {
                      total: String(agg.totalQuestions),
                      maturity: maturityLabel,
                      weighted: String(agg.weightedPercentage),
                      status: statusUi.label,
                    })}
                  </p>
                ) : (
                  <p>{t('hero.exec.noAgg', { status: statusUi.label })}</p>
                )}
                <p>
                  {t('hero.exec.findingsCount')}{' '}
                  <span className="font-semibold text-[#0f172a]">{findings.length}</span>
                  {report.findings_count !== findings.length ? (
                    <span className="text-[#64748b]">
                      {t('hero.exec.reportTotal', { n: String(report.findings_count) })}
                    </span>
                  ) : null}
                  . {t('hero.exec.summariesCount')}{' '}
                  <span className="font-semibold text-[#0f172a]">{summaries.length}</span>
                  {uniqueSummaryLabels.length ? (
                    <>
                      {' '}
                      — <span className="text-[#334155]">{uniqueSummaryLabels.slice(0, 6).join(', ')}</span>
                      {uniqueSummaryLabels.length > 6 ? '…' : ''}
                    </>
                  ) : null}
                  .
                </p>
                {description ? <p className="whitespace-pre-wrap text-[#475569]">{description}</p> : null}
              </div>
            </article>
          </div>

          <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:col-span-7 xl:grid-cols-4">
            <StatCard
              title={t('hero.stat.maturity')}
              footer={<p className="text-xs text-[#64748b]">{t('hero.stat.maturityFooter')}</p>}
            >
              {agg ? (
                <AdminMaturityDonut percent={maturityPct} label={maturityLabel} />
              ) : (
                <p className="text-sm text-[#64748b]">{t('hero.stat.maturityEmpty')}</p>
              )}
            </StatCard>

            <StatCard
              title={t('hero.stat.priorities')}
              footer={
                findings.length > 0 ? (
                  footerLink('#admin-report-findings', t('hero.stat.viewFindings'))
                ) : (
                  <p className="text-xs text-[#64748b]">{t('hero.stat.prioritiesEmpty')}</p>
                )
              }
            >
              <ul className="space-y-2.5">
                <li className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-semibold text-[#0f172a]">{high}</span>
                  <span className="rounded-md bg-[#fee2e2] px-2.5 py-0.5 text-xs font-semibold text-[#b91c1c]">
                    {t('hero.priority.high')}
                  </span>
                </li>
                <li className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-semibold text-[#0f172a]">{medium}</span>
                  <span className="rounded-md bg-[#ffedd5] px-2.5 py-0.5 text-xs font-semibold text-[#c2410c]">
                    {t('hero.priority.medium')}
                  </span>
                </li>
                <li className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-semibold text-[#0f172a]">{low}</span>
                  <span className="rounded-md bg-[#dcfce7] px-2.5 py-0.5 text-xs font-semibold text-[#15803d]">
                    {t('hero.priority.low')}
                  </span>
                </li>
              </ul>
            </StatCard>

            <StatCard
              title={t('hero.stat.questions')}
              footer={<p className="text-xs text-[#64748b]">{t('hero.stat.questionsFooter')}</p>}
            >
              {agg && agg.totalQuestions > 0 ? (
                <>
                  <p className="text-3xl font-bold tabular-nums tracking-tight text-[#0f172a]">{agg.totalQuestions}</p>
                  <ul className="mt-3 space-y-1.5 text-sm text-[#475569]">
                    <li className="flex justify-between gap-2">
                      <span>{t('hero.stat.answered')}</span>
                      <span className="font-semibold text-[#0f172a]">
                        {agg.answeredQuestions}{' '}
                        <span className="text-[#64748b]">
                          ({Math.round((agg.answeredQuestions / agg.totalQuestions) * 100)}%)
                        </span>
                      </span>
                    </li>
                    <li className="flex justify-between gap-2">
                      <span>{t('hero.stat.partial')}</span>
                      <span className="font-semibold text-[#0f172a]">
                        {Math.max(0, agg.totalQuestions - agg.answeredQuestions)}{' '}
                        <span className="text-[#64748b]">
                          (
                          {Math.round(
                            (Math.max(0, agg.totalQuestions - agg.answeredQuestions) / agg.totalQuestions) * 100,
                          )}
                          %)
                        </span>
                      </span>
                    </li>
                  </ul>
                </>
              ) : (
                <p className="text-sm text-[#64748b]">{t('hero.stat.questionsEmpty')}</p>
              )}
            </StatCard>

            <StatCard
              title={t('hero.stat.sections')}
              footer={
                summaries.length > 0 ? (
                  footerLink('#admin-section-summaries-detail', t('hero.stat.viewSummaries'))
                ) : (
                  <p className="text-xs text-[#64748b]">{t('hero.stat.sectionsFooter')}</p>
                )
              }
            >
              {summaries.length ? (
                <ul className="space-y-2">
                  {summaries.slice(0, 8).map((s, idx) => {
                    const label = summarySectionLabel(s, overviews, t('maturity.fallbackSection'));
                    const code = s.chapter_code?.trim();
                    const line = code && code !== label ? `${code} — ${label}` : label;
                    return (
                      <li
                        key={s.id || `${s.section_id ?? 's'}-${idx}`}
                        className="flex items-start gap-2 text-sm font-medium text-[#0f172a]"
                      >
                        <span
                          className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#dcfce7] text-[#16a34a]"
                          aria-hidden
                        >
                          <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M3 8.5 6.5 12 13 5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        <span className="leading-snug">{line}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-[#64748b]">{t('hero.stat.sectionsEmpty')}</p>
              )}
            </StatCard>
          </div>
        </div>
      </div>
    </div>
  );
}
