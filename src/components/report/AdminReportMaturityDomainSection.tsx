'use client';

import { useMemo } from 'react';

import type { ReportResponse, ReportSectionOverview } from '@/lib/reports';
import { translate, useLocale } from '@/lib/i18n';
import { adminReportDetailMessages } from '@/locales/admin-report-detail';
import {
  ReportMaturitySectionSpiderChart,
  buildMaturitySpiderSeries,
  clampSpiderPct,
} from '@/components/report/ReportMaturitySpiderChart';

function barToneClass(pct: number): string {
  if (pct >= 70) return 'bg-[#2563eb]';
  if (pct >= 45) return 'bg-[#ea580c]';
  return 'bg-[#dc2626]';
}

function DomainScoreShield({ pct }: { pct: number }) {
  const stroke = pct >= 70 ? '#2563eb' : pct >= 45 ? '#ea580c' : '#dc2626';
  const fill = pct >= 70 ? '#eff6ff' : pct >= 45 ? '#fff7ed' : '#fef2f2';
  return (
    <svg width="26" height="30" viewBox="0 0 40 44" className="shrink-0" aria-hidden>
      <path
        d="M20 2 36 8v14c0 10-7 18-16 20-9-2-16-10-16-20V8L20 2Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.6"
      />
      <path d="M20 14v10M20 28h.01" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function sectionRowKey(s: ReportSectionOverview, index: number): string {
  return s.section_id || s.section_code || s.chapter_code || `sec-${index}`;
}

export function AdminReportMaturityDomainSection({ report }: { report: ReportResponse }) {
  const { locale } = useLocale();
  const t = (key: string, values?: Record<string, string>) => translate(adminReportDetailMessages, locale, key, values);

  const { sections, spider } = useMemo(() => {
    const list = [...(report.section_overviews ?? [])].sort((a, b) =>
      (a.section_code ?? a.chapter_code ?? '').localeCompare(b.section_code ?? b.chapter_code ?? ''),
    );
    const sectionFallback = translate(adminReportDetailMessages, locale, 'maturity.fallbackSection');
    const hintOne = (shortLabelText: string) =>
      translate(adminReportDetailMessages, locale, 'maturity.spider.hintOne', { label: shortLabelText });
    const hintTwo = (l1: string, l2: string) =>
      translate(adminReportDetailMessages, locale, 'maturity.spider.hintTwo', { l1, l2 });
    return { sections: list, spider: buildMaturitySpiderSeries(list, sectionFallback, hintOne, hintTwo) };
  }, [report.section_overviews, locale]);

  if (!sections.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] px-4 py-6 text-center sm:px-6">
        <h2 className="text-base font-semibold text-[#0f172a]">{t('maturity.empty.title')}</h2>
        <p className="mt-2 text-sm text-[#64748b]">{t('maturity.empty.body')}</p>
      </div>
    );
  }

  return (
    <div className="min-w-0 rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6 md:p-8">
      <h2 className="text-xl font-semibold text-[#0f172a] sm:text-2xl">{t('maturity.title')}</h2>
      <p className="mt-1 text-sm text-[#64748b] sm:text-base">{t('maturity.subtitle')}</p>

      <div className="mt-6 grid min-w-0 gap-8 xl:grid-cols-2 xl:items-start">
        <div className="flex min-w-0 justify-center xl:justify-start">
          {spider ? (
            <ReportMaturitySectionSpiderChart
              labels={spider.labels}
              values={spider.values}
              targetValues={spider.targetValues}
              areaHint={spider.areaHint}
              ariaLabel={t('maturity.spider.aria')}
              legendCurrent={t('maturity.legend.current')}
              legendTarget={t('maturity.legend.target')}
              legendTargetWhenApi={t('maturity.legend.targetWhenApi')}
            />
          ) : null}
        </div>

        <div className="min-w-0">
          <h3 className="text-base font-semibold text-[#0f172a]">{t('maturity.domainScores')}</h3>
          <div className="mt-4 overflow-x-auto rounded-xl border border-[#e8edf5]">
            <table className="w-full min-w-[280px] text-left text-sm">
              <thead className="border-b border-[#e8edf5] bg-[#f8fafc] text-xs font-semibold uppercase tracking-wide text-[#64748b]">
                <tr>
                  <th className="px-3 py-2.5">{t('maturity.th.domain')}</th>
                  <th className="px-3 py-2.5">{t('maturity.th.score')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef2f9]">
                {sections.map((s, idx) => {
                  const pct = clampSpiderPct(Number(s.percentage) || 0);
                  const title = (s.section_title ?? s.section_code ?? t('maturity.fallbackSection')).trim();
                  const sectionNumber = s.section_number;
                  const code = (s.section_code ?? s.chapter_code ?? '').trim();
                  return (
                    <tr key={sectionRowKey(s, idx)}>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <DomainScoreShield pct={pct} />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-[#0f172a]">
                              {sectionNumber !== undefined && sectionNumber !== null ? `§${sectionNumber} - ` : ''}{title}
                            </p>
                            {code ? <p className="text-xs text-[#64748b]">{code}</p> : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 min-w-[4rem] flex-1 overflow-hidden rounded-full bg-[#e2e8f0]">
                            <div className={`h-full rounded-full ${barToneClass(pct)}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="shrink-0 tabular-nums font-semibold text-[#0f172a]">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
