'use client';

import type { ReportFindingItem, ReportResponse, ReportSectionOverview, ReportSummaryItem } from '@/lib/reports';

type DomainIconName =
  | 'governance'
  | 'risk'
  | 'asset'
  | 'access'
  | 'data'
  | 'ops'
  | 'incident'
  | 'compliance';

const SUMMARY_ICON_CYCLE: DomainIconName[] = [
  'governance',
  'risk',
  'asset',
  'access',
  'data',
  'ops',
  'incident',
  'compliance',
];

function RiskShieldIcon({ variant }: { variant: 'high' | 'medium' | 'low' }) {
  const stroke = variant === 'high' ? '#dc2626' : variant === 'medium' ? '#ea580c' : '#16a34a';
  const fill = variant === 'high' ? '#fef2f2' : variant === 'medium' ? '#fff7ed' : '#f0fdf4';
  return (
    <svg width="40" height="44" viewBox="0 0 40 44" fill="none" aria-hidden>
      <path
        d="M20 2 36 8v14c0 10-7 18-16 20-9-2-16-10-16-20V8L20 2Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.8"
      />
      {variant === 'high' ? (
        <path d="M20 14v10M20 28h.01" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
      ) : variant === 'medium' ? (
        <path d="M20 16v8M20 26h.01" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
      ) : (
        <path d="M14 22l4 4 8-8" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

function DomainIcon({ name }: { name: DomainIconName }) {
  const common = 'h-9 w-9 shrink-0 text-[#3e69b0]';
  switch (name) {
    case 'governance':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          <path d="M12 3 4 7v5c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V7l-8-4Z" strokeLinejoin="round" />
          <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'risk':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          <path d="M12 3v18M8 7h8M7 21h10" strokeLinecap="round" />
          <circle cx="12" cy="14" r="2" />
        </svg>
      );
    case 'asset':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <path d="M8 9h8M8 13h5" strokeLinecap="round" />
        </svg>
      );
    case 'access':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          <rect x="6" y="10" width="12" height="10" rx="1" />
          <path d="M9 10V8a3 3 0 0 1 6 0v2" strokeLinecap="round" />
          <circle cx="12" cy="15" r="1.2" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'data':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          <ellipse cx="12" cy="6" rx="7" ry="3" />
          <path d="M5 6v6c0 1.7 3 3 7 3s7-1.3 7-3V6" />
          <path d="M5 12v6c0 1.7 3 3 7 3s7-1.3 7-3v-6" />
        </svg>
      );
    case 'ops':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          <circle cx="12" cy="12" r="3" />
          <path
            d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'incident':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" strokeLinejoin="round" />
        </svg>
      );
    case 'compliance':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          <path d="M8 4h12v16l-6-3-6 3V4Z" strokeLinejoin="round" />
          <path d="M10 9h6M10 13h4" strokeLinecap="round" />
        </svg>
      );
  }
}

function RiskColumn({
  variant,
  label,
  count,
  items,
  findingsLinkLabel,
}: {
  variant: 'high' | 'medium' | 'low';
  label: string;
  count: number;
  items: string[];
  /** Shown only when count > 0; scrolls to the findings list (not filtered by band). */
  findingsLinkLabel: string;
}) {
  const border =
    variant === 'high'
      ? 'border-red-200 bg-white'
      : variant === 'medium'
        ? 'border-orange-200 bg-white'
        : 'border-emerald-200 bg-white';
  const countColor =
    variant === 'high' ? 'text-red-600' : variant === 'medium' ? 'text-orange-600' : 'text-emerald-600';

  return (
    <article
      className={`flex h-full min-w-0 flex-col rounded-2xl border ${border} p-4 shadow-[0_2px_16px_-6px_rgba(15,23,42,0.06)] sm:p-5`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className={`text-xs font-bold uppercase tracking-wide ${countColor}`}>{label}</p>
          <div className="mt-2 flex items-center gap-3">
            <RiskShieldIcon variant={variant} />
            <p className={`text-3xl font-bold tabular-nums leading-none ${countColor}`}>{count}</p>
          </div>
        </div>
      </div>
      {items.length ? (
        <ul className="mt-4 space-y-2.5 text-sm text-[#334155]">
          {items.map((line, idx) => (
            <li key={`${variant}-${idx}-${line.slice(0, 24)}`} className="leading-snug">
              {line}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-4 border-t border-[#f1f5f9] pt-3">
        {count > 0 ? (
          <a href="#admin-report-findings" className="text-sm font-semibold text-[#2563eb] transition hover:text-[#1d4ed8]">
            {findingsLinkLabel}
          </a>
        ) : (
          <p className="text-sm text-[#94a3b8]">No findings in this category.</p>
        )}
      </div>
    </article>
  );
}

function clipFindingText(text: string, max = 140): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

function topFindingLines(findings: ReportFindingItem[], priority: ReportFindingItem['priority']): string[] {
  return findings.filter((f) => f.priority === priority).map((f) => clipFindingText(f.finding_text)).slice(0, 3);
}

function reportDisplayCode(report: ReportResponse): string {
  const c = report.report_code?.trim();
  return c || report.id;
}

function mergeSectionNarrative(section: ReportSectionOverview, summaries: ReportSummaryItem[]): string | null {
  const a = section.summary_text?.trim();
  if (a) return a;
  const sid = section.section_id;
  const m = summaries.find((x) => x.section_id && sid && x.section_id === sid)?.summary_text?.trim();
  return m || null;
}

function sectionCardBody(section: ReportSectionOverview, summaries: ReportSummaryItem[]): string {
  const n = mergeSectionNarrative(section, summaries);
  if (n) return n;
  const q = section.question_count ?? 0;
  const aq = section.answered_question_count ?? 0;
  return `Score ${section.score}/${section.max_score} (${Number(section.percentage).toFixed(1)}%). ${aq}/${q} questions with recorded answers in this section.`;
}

function strengthsForSection(pct: number): string[] {
  if (pct >= 70) return ['Section score is on track (≥70%).'];
  return [];
}

function needsForSection(pct: number, s: ReportSectionOverview): string[] {
  const out: string[] = [];
  if (pct < 70) out.push('Score below 70%; prioritize improvements here.');
  const q = s.question_count ?? 0;
  const aq = s.answered_question_count ?? 0;
  if (q > 0 && aq < q) out.push(`${q - aq} question(s) still open in this section.`);
  return out;
}

export function AdminReportFindingsDomainsSection({
  report,
  findings,
  summaries,
}: {
  report: ReportResponse;
  findings: ReportFindingItem[];
  summaries: ReportSummaryItem[];
}) {
  const sections = [...(report.section_overviews ?? [])].sort((a, b) =>
    (a.section_code ?? a.chapter_code ?? '').localeCompare(b.section_code ?? b.chapter_code ?? ''),
  );

  const high = findings.filter((f) => f.priority === 'high');
  const medium = findings.filter((f) => f.priority === 'medium');
  const low = findings.filter((f) => f.priority === 'low');

  const excerpt =
    summaries[0]?.summary_text?.trim() ||
    findings
      .map((f) => f.recommendation_text?.trim())
      .filter(Boolean)
      .slice(0, 3)
      .join('\n\n') ||
    '';
  const hasExcerpt = Boolean(excerpt);
  const reportCode = reportDisplayCode(report);

  const assessmentHref = `/admin/assessments/${report.assessment_id}`;

  return (
    <div className="min-w-0 space-y-10 rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6 md:p-8">
      <section aria-labelledby="top-findings-heading">
        <h2 id="top-findings-heading" className="text-xl font-semibold text-[#0f172a] sm:text-2xl">
          Top findings
        </h2>
        <p className="mt-1 text-sm text-[#64748b] sm:text-base">A closer look at your strongest and weakest areas.</p>

        <div className={`mt-6 grid min-w-0 gap-4 ${hasExcerpt ? 'xl:grid-cols-12' : ''}`}>
          <div className={`grid min-w-0 gap-4 sm:grid-cols-3 ${hasExcerpt ? 'xl:col-span-8' : ''}`}>
            <RiskColumn
              variant="high"
              label="High risk"
              count={high.length}
              items={topFindingLines(findings, 'high')}
              findingsLinkLabel="View findings list →"
            />
            <RiskColumn
              variant="medium"
              label="Medium risk"
              count={medium.length}
              items={topFindingLines(findings, 'medium')}
              findingsLinkLabel="View findings list →"
            />
            <RiskColumn
              variant="low"
              label="Low risk"
              count={low.length}
              items={topFindingLines(findings, 'low')}
              findingsLinkLabel="View findings list →"
            />
          </div>

          {hasExcerpt ? (
            <aside className="flex min-w-0 xl:col-span-4">
              <div className="flex w-full flex-col rounded-2xl border border-[#dbe4f4] bg-[#f4f7fc] p-5 sm:p-6">
                <p className="text-xs font-bold uppercase tracking-wide text-[#3e69b0]">Auditor&apos;s note</p>
                <div className="mt-3 flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#3b82f6] text-white">
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" strokeLinecap="round" />
                      <path d="M5 21v-1a7 7 0 0 1 14 0v1" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#334155]">{excerpt}</p>
                </div>
                <p className="mt-4 text-right text-sm font-semibold text-[#475569]">— Lead Auditor</p>
              </div>
            </aside>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="domain-summaries-heading" className="border-t border-[#eef2f9] pt-10">
        <h2 id="domain-summaries-heading" className="text-xl font-semibold text-[#0f172a] sm:text-2xl">
          Domain summaries
        </h2>
        <p className="mt-1 text-sm text-[#64748b] sm:text-base">
          Each domain maps to a checklist section. Data from <code className="rounded bg-[#f1f5f9] px-1 text-xs">section_overviews</code> on
          this report.
        </p>

        <div className="mt-6 grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sections.length > 0 ? (
            sections.map((s, i) => {
              const pct = Math.round(Math.min(100, Math.max(0, Number(s.percentage) || 0)));
              const title = (s.section_title ?? s.section_code ?? 'Section').trim();
              const strengths = strengthsForSection(pct);
              const needs = needsForSection(pct, s);
              return (
                <article
                  key={s.section_id}
                  className="flex min-w-0 flex-col rounded-2xl border border-[#e8edf5] bg-[#fafbfd] p-4 shadow-[0_2px_12px_-6px_rgba(15,23,42,0.05)] sm:p-5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <DomainIcon name={SUMMARY_ICON_CYCLE[i % SUMMARY_ICON_CYCLE.length]} />
                      <h3 className="truncate text-base font-semibold text-[#0f172a]">{title}</h3>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-lg font-bold tabular-nums text-[#0f172a]">{pct}%</p>
                      <p className="text-xs font-semibold text-[#64748b]">Score</p>
                    </div>
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-[#475569]">{sectionCardBody(s, summaries)}</p>
                  <div className="mt-4 space-y-3 text-sm">
                    <div>
                      <p className="font-bold text-[#0f172a]">Key strengths</p>
                      {strengths.length ? (
                        <ul className="mt-1 list-inside list-disc text-[#475569]">
                          {strengths.map((x) => (
                            <li key={x}>{x}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-1 text-[#94a3b8]">—</p>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-[#0f172a]">Needs attention</p>
                      {needs.length ? (
                        <ul className="mt-1 list-inside list-disc text-[#475569]">
                          {needs.map((x) => (
                            <li key={x}>{x}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-1 text-[#94a3b8]">—</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 border-t border-[#e8edf5] pt-3">
                    <a href={assessmentHref} className="text-sm font-semibold text-[#2563eb] transition hover:text-[#1d4ed8]">
                      Open assessment →
                    </a>
                  </div>
                </article>
              );
            })
          ) : summaries.length > 0 ? (
            summaries.map((s, i) => (
              <article
                key={s.id || `${s.chapter_code}-${i}`}
                className="flex flex-col rounded-2xl border border-[#e8edf5] bg-[#fafbfd] p-4 shadow-[0_2px_12px_-6px_rgba(15,23,42,0.05)] sm:p-5"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <DomainIcon name={SUMMARY_ICON_CYCLE[i % SUMMARY_ICON_CYCLE.length]} />
                  <h3 className="truncate text-base font-semibold text-[#0f172a]">{s.chapter_code?.trim() || 'Chapter'}</h3>
                </div>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-[#475569]">{s.summary_text}</p>
              </article>
            ))
          ) : (
            <article className="flex flex-col rounded-2xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-5 sm:col-span-2 xl:col-span-4">
              <h3 className="text-base font-semibold text-[#0f172a]">No section overview data</h3>
              <p className="mt-2 text-sm text-[#64748b]">
                When the report includes <code className="rounded bg-[#f1f5f9] px-1 text-xs">section_overviews</code>, domain cards and the
                maturity table populate automatically.
              </p>
            </article>
          )}
        </div>
      </section>

      <footer className="flex flex-col gap-2 border-t border-[#e2e8f0] pt-5 text-xs text-[#64748b] sm:flex-row sm:items-center sm:justify-between sm:text-sm">
        <p>This report is confidential and intended for internal use only.</p>
        <p className="font-mono text-[#334155]">{reportCode}</p>
      </footer>
    </div>
  );
}
