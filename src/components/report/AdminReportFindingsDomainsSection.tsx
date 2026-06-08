'use client';

import type { ReportFindingItem, ReportResponse, ReportSectionOverview, ReportSummaryItem } from '@/lib/reports';
import { formatReportCode } from '@/lib/reports';
import { translate, useLocale } from '@/lib/i18n';
import { adminReportDetailMessages } from '@/locales/admin-report-detail';

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
  emptyCategoryLabel,
}: {
  variant: 'high' | 'medium' | 'low';
  label: string;
  count: number;
  items: string[];
  /** Shown only when count > 0; scrolls to the findings list (not filtered by band). */
  findingsLinkLabel: string;
  emptyCategoryLabel: string;
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
      <div className="mt-4 flex-1">
        {items.length ? (
          <ul className="space-y-2.5 text-sm text-[#334155]">
            {items.map((line, idx) => (
              <li key={`${variant}-${idx}-${line.slice(0, 24)}`} className="leading-snug">
                {line}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <div className="mt-4 border-t border-[#f1f5f9] pt-3">
        {count > 0 ? (
          <a href="#admin-report-findings" className="text-sm font-semibold text-[#2563eb] transition hover:text-[#1d4ed8]">
            {findingsLinkLabel}
          </a>
        ) : (
          <p className="text-sm text-[#94a3b8]">{emptyCategoryLabel}</p>
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

function mergeSectionNarrative(section: ReportSectionOverview, summaries: ReportSummaryItem[]): string | null {
  const a = section.summary_text?.trim();
  if (a) return a;
  const sid = section.section_id;
  const m = summaries.find((x) => x.section_id && sid && x.section_id === sid)?.summary_text?.trim();
  return m || null;
}

function sectionCardBody(
  section: ReportSectionOverview,
  summaries: ReportSummaryItem[],
  t: (key: string, values?: Record<string, string>) => string,
): string {
  const n = mergeSectionNarrative(section, summaries);
  if (n) return n;
  const q = section.question_count ?? 0;
  const aq = section.answered_question_count ?? 0;
  return t('findings.sectionCard.stats', {
    score: String(section.score ?? ''),
    max: String(section.max_score ?? ''),
    pct: Number(section.percentage).toFixed(1),
    aq: String(aq),
    q: String(q),
  });
}

function strengthsForSection(pct: number, t: (key: string) => string): string[] {
  if (pct >= 70) return [t('findings.strength.onTrack')];
  return [];
}

function needsForSection(
  pct: number,
  s: ReportSectionOverview,
  t: (key: string, values?: Record<string, string>) => string,
): string[] {
  const out: string[] = [];
  if (pct < 70) out.push(t('findings.needs.below70'));
  const q = s.question_count ?? 0;
  const aq = s.answered_question_count ?? 0;
  if (q > 0 && aq < q) out.push(t('findings.needs.openQuestions', { n: String(q - aq) }));
  return out;
}

function sanitizeRichHtml(input?: string | null) {
  const raw = String(input ?? '').trim();
  if (!raw) return '';
  if (typeof window === 'undefined') return raw;
  const parser = new DOMParser();
  const doc = parser.parseFromString(raw, 'text/html');
  const allowedTags = new Set(['p', 'br', 'ul', 'ol', 'li', 'strong', 'em', 'b', 'i', 'u', 'a']);
  const walk = (node: Element) => {
    const children = Array.from(node.children);
    children.forEach((child) => {
      const tag = child.tagName.toLowerCase();
      if (!allowedTags.has(tag)) {
        const textNode = doc.createTextNode(child.textContent ?? '');
        child.replaceWith(textNode);
        return;
      }
      const attrs = Array.from(child.attributes);
      attrs.forEach((attr) => {
        const name = attr.name.toLowerCase();
        if (tag === 'a') {
          if (name !== 'href' && name !== 'target' && name !== 'rel') {
            child.removeAttribute(attr.name);
          }
          return;
        }
        child.removeAttribute(attr.name);
      });
      if (tag === 'a') {
        const href = child.getAttribute('href') ?? '';
        if (!/^https?:\/\//i.test(href)) {
          child.removeAttribute('href');
        } else {
          child.setAttribute('target', '_blank');
          child.setAttribute('rel', 'noreferrer noopener');
        }
      }
      walk(child);
    });
  };
  walk(doc.body);
  return doc.body.innerHTML.trim();
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
  const { locale } = useLocale();
  const t = (key: string, values?: Record<string, string>) => translate(adminReportDetailMessages, locale, key, values);
  const sections = [...(report.section_overviews ?? [])].sort((a, b) =>
    (a.section_code ?? a.chapter_code ?? '').localeCompare(b.section_code ?? b.chapter_code ?? ''),
  );

  const high = findings.filter((f) => f.priority === 'high');
  const medium = findings.filter((f) => f.priority === 'medium');
  const low = findings.filter((f) => f.priority === 'low');

  const excerpt = sanitizeRichHtml(report.auditor_note);
  const hasExcerpt = Boolean(excerpt);
  const reportCode = formatReportCode(report);

  const assessmentHref = `/admin/assessments/${report.assessment_id}`;

  return (
    <div className="min-w-0 space-y-10 rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6 md:p-8">
      <section aria-labelledby="top-findings-heading">
        <h2 id="top-findings-heading" className="text-xl font-semibold text-[#0f172a] sm:text-2xl">
          {t('findings.top.title')}
        </h2>
        <p className="mt-1 text-sm text-[#64748b] sm:text-base">{t('findings.top.subtitle')}</p>

        <div className={`mt-6 grid min-w-0 gap-4 ${hasExcerpt ? 'xl:grid-cols-12' : ''}`}>
          <div className={`grid min-w-0 gap-4 sm:grid-cols-3 ${hasExcerpt ? 'xl:col-span-8' : ''}`}>
            <RiskColumn
              variant="high"
              label={t('findings.risk.high')}
              count={high.length}
              items={topFindingLines(findings, 'high')}
              findingsLinkLabel={t('findings.viewList')}
              emptyCategoryLabel={t('findings.category.empty')}
            />
            <RiskColumn
              variant="medium"
              label={t('findings.risk.medium')}
              count={medium.length}
              items={topFindingLines(findings, 'medium')}
              findingsLinkLabel={t('findings.viewList')}
              emptyCategoryLabel={t('findings.category.empty')}
            />
            <RiskColumn
              variant="low"
              label={t('findings.risk.low')}
              count={low.length}
              items={topFindingLines(findings, 'low')}
              findingsLinkLabel={t('findings.viewList')}
              emptyCategoryLabel={t('findings.category.empty')}
            />
          </div>

          {hasExcerpt ? (
            <aside className="flex min-w-0 xl:col-span-4">
              <div className="flex w-full flex-col rounded-2xl border border-[#dbe4f4] bg-[#f4f7fc] p-5 sm:p-6">
                <p className="text-xs font-bold uppercase tracking-wide text-[#3e69b0]">{t('findings.auditorNote')}</p>
                <div className="mt-3 flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#3b82f6] text-white">
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" strokeLinecap="round" />
                      <path d="M5 21v-1a7 7 0 0 1 14 0v1" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div
                    className="text-sm leading-relaxed text-[#334155] [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-0.5"
                    dangerouslySetInnerHTML={{ __html: excerpt }}
                  />
                </div>
                <p className="mt-4 text-right text-sm font-semibold text-[#475569]">{t('findings.leadAuditor')}</p>
              </div>
            </aside>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="domain-summaries-heading" className="border-t border-[#eef2f9] pt-10">
        <h2 id="domain-summaries-heading" className="text-xl font-semibold text-[#0f172a] sm:text-2xl">
          {t('findings.domainSummaries.title')}
        </h2>
        <p className="mt-1 text-sm text-[#64748b] sm:text-base">{t('findings.domainSummaries.subtitle')}</p>

        <div className="mt-6 grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sections.length > 0 ? (
            sections.map((s, i) => {
              const pct = Math.round(Math.min(100, Math.max(0, Number(s.percentage) || 0)));
              const title = (s.section_title ?? s.section_code ?? t('maturity.fallbackSection')).trim();
              const sectionNumber = s.section_number;
              const strengths = strengthsForSection(pct, t);
              const needs = needsForSection(pct, s, t);
              return (
                <article
                  key={s.section_id}
                  className="flex h-full min-w-0 flex-col rounded-2xl border border-[#e8edf5] bg-[#fafbfd] p-4 shadow-[0_2px_12px_-6px_rgba(15,23,42,0.05)] sm:p-5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <DomainIcon name={SUMMARY_ICON_CYCLE[i % SUMMARY_ICON_CYCLE.length]} />
                      <h3 className="truncate text-base font-semibold text-[#0f172a]">
                        {sectionNumber !== undefined && sectionNumber !== null ? `§${sectionNumber} - ` : ''}{title}
                      </h3>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-lg font-bold tabular-nums text-[#0f172a]">{pct}%</p>
                      <p className="text-xs font-semibold text-[#64748b]">{t('findings.scoreLabel')}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex-1 space-y-4">
                    <p className="text-sm leading-relaxed text-[#475569]">{sectionCardBody(s, summaries, t)}</p>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="font-bold text-[#0f172a]">{t('findings.keyStrengths')}</p>
                        {strengths.length ? (
                          <ul className="mt-1 list-inside list-disc text-[#475569]">
                            {strengths.map((x) => (
                              <li key={x}>{x}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-1 text-[#94a3b8]">{t('maturity.dash')}</p>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-[#0f172a]">{t('findings.needsAttention')}</p>
                        {needs.length ? (
                          <ul className="mt-1 list-inside list-disc text-[#475569]">
                            {needs.map((x) => (
                              <li key={x}>{x}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-1 text-[#94a3b8]">{t('maturity.dash')}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 border-t border-[#e8edf5] pt-3">
                    <a href={assessmentHref} className="text-sm font-semibold text-[#2563eb] transition hover:text-[#1d4ed8]">
                      {t('findings.openAssessment')}
                    </a>
                  </div>
                </article>
              );
            })
          ) : summaries.length > 0 ? (
            summaries.map((s, i) => {
              const sectionNumber = s.section_number;
              const title = s.section_title?.trim() || s.chapter_code?.trim() || t('findings.fallbackChapter');
              return (
                <article
                  key={s.id || `${s.chapter_code}-${i}`}
                  className="flex flex-col rounded-2xl border border-[#e8edf5] bg-[#fafbfd] p-4 shadow-[0_2px_12px_-6px_rgba(15,23,42,0.05)] sm:p-5"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <DomainIcon name={SUMMARY_ICON_CYCLE[i % SUMMARY_ICON_CYCLE.length]} />
                    <h3 className="truncate text-base font-semibold text-[#0f172a]">
                      {sectionNumber !== undefined && sectionNumber !== null ? `§${sectionNumber} - ` : ''}{title}
                    </h3>
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-[#475569]">{s.summary_text}</p>
                </article>
              );
            })
          ) : (
            <article className="flex flex-col rounded-2xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-5 sm:col-span-2 xl:col-span-4">
              <h3 className="text-base font-semibold text-[#0f172a]">{t('findings.noOverview.title')}</h3>
              <p className="mt-2 text-sm text-[#64748b]">{t('findings.noOverview.body')}</p>
            </article>
          )}
        </div>
      </section>

      <footer className="flex flex-col gap-2 border-t border-[#e2e8f0] pt-5 text-xs text-[#64748b] sm:flex-row sm:items-center sm:justify-between sm:text-sm">
        <p>{t('findings.footer.confidential')}</p>
        <p className="font-mono text-[#334155]">{reportCode}</p>
      </footer>
    </div>
  );
}
