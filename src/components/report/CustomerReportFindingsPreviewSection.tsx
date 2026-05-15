'use client';

import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { CustomerReportDataResponse } from '@/lib/reports';
import { downloadCustomerReportPdf } from '@/lib/reports';
import { translate, useLocale } from '@/lib/i18n';
import { customerReportMessages } from '@/locales/customer-report';

type PreviewRow = {
  id: string;
  idTone: 'high' | 'medium' | 'low';
  finding: string;
  domain: string;
  risk: string;
  riskTone: 'high' | 'medium' | 'low';
  impact: string;
  recommendation: string;
};

const PRIORITY_ORDER: Record<'high' | 'medium' | 'low', number> = { high: 0, medium: 1, low: 2 };

function priorityRowToneClass(tone: 'high' | 'medium' | 'low') {
  if (tone === 'high') return 'font-semibold text-red-600';
  if (tone === 'medium') return 'font-semibold text-orange-600';
  return 'font-semibold text-emerald-600';
}

function ReportCoverMock({
  subtitle,
  kicker,
  line1,
  line2,
}: {
  subtitle?: string | null;
  kicker: string;
  line1: string;
  line2: string;
}) {
  return (
    <div
      className="relative aspect-[3/4] w-[112px] shrink-0 overflow-hidden rounded-lg shadow-lg ring-1 ring-black/10 sm:w-[124px] lg:w-[136px]"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[linear-gradient(145deg,#0a1628_0%,#132a52_45%,#1e3a8a_100%)]" />
      <div className="absolute -right-6 top-0 h-3/4 w-2/3 rounded-full bg-[#3b82f6]/25 blur-2xl" />
      <div className="relative flex h-full flex-col justify-between p-3 text-white">
        <p className="text-[0.5rem] font-semibold uppercase tracking-wider text-[#93c5fd]">{kicker}</p>
        <div>
          <p className="text-[0.55rem] font-bold uppercase leading-tight text-white/90">{line1}</p>
          <p className="text-[0.55rem] font-bold uppercase leading-tight text-white/90">{line2}</p>
          {subtitle?.trim() ? (
            <p className="mt-1 text-[0.5rem] font-semibold leading-tight text-[#bfdbfe] line-clamp-2">{subtitle}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function CustomerReportFindingsPreviewSection({
  data,
  reportId,
  canDownloadPdf,
}: {
  data: CustomerReportDataResponse;
  reportId: string;
  canDownloadPdf: boolean;
}) {
  const { locale } = useLocale();
  const t = useCallback(
    (key: string, values?: Record<string, string>) => translate(customerReportMessages, locale, key, values),
    [locale]
  );

  const priorityLabel = useCallback(
    (p: 'high' | 'medium' | 'low') => t(`preview.priority.${p}`),
    [t]
  );

  const rows = useMemo(() => {
    const sorted = [...data.findings].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
    const built: PreviewRow[] = sorted.slice(0, 25).map((f, idx) => {
      const tone = f.priority;
      const prefix = tone === 'high' ? 'H' : tone === 'medium' ? 'M' : 'L';
      const rec = (f.recommendation ?? '').trim();
      return {
        id: `${prefix}-${String(idx + 1).padStart(2, '0')}`,
        idTone: tone,
        finding: f.question_text.length > 80 ? `${f.question_text.slice(0, 78)}…` : f.question_text,
        domain: f.report_domain?.trim() || t('preview.domain.general'),
        risk: priorityLabel(tone),
        riskTone: tone,
        impact: priorityLabel(tone),
        recommendation: rec.length > 140 ? `${rec.slice(0, 138)}…` : rec || '—',
      };
    });
    return built;
  }, [data.findings, t, priorityLabel]);

  const pdfBullets = useMemo(
    () => [
      t('preview.pdf.bullet1'),
      t('preview.pdf.bullet2'),
      t('preview.pdf.bullet3'),
      t('preview.pdf.bullet4'),
    ],
    [t]
  );

  const [downloading, setDownloading] = useState(false);

  const handleExportPdf = useCallback(async () => {
    if (!canDownloadPdf) return;
    setDownloading(true);
    try {
      const blob = await downloadCustomerReportPdf(reportId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t('preview.pdf.toastStarted'));
    } catch (e) {
      const msg = e instanceof Error ? e.message : t('preview.pdf.downloadFailed');
      toast.error(msg);
    } finally {
      setDownloading(false);
    }
  }, [canDownloadPdf, reportId, t]);

  return (
    <div id="detailed-findings" className="scroll-mt-24">
      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        <div className="min-w-0 lg:col-span-8">
          <h2 className="text-xl font-bold text-[#0f172a] sm:text-2xl">{t('preview.title')}</h2>
          <p className="mt-1 text-sm text-[#64748b] sm:text-base">{t('preview.subtitle')}</p>

          <div className="mt-4 overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm sm:min-w-[720px]">
                <thead>
                  <tr className="border-b border-[#e8edf5] bg-[#f8fafc] text-[0.65rem] font-semibold uppercase tracking-wide text-[#64748b]">
                    <th className="whitespace-nowrap px-3 py-3 pl-4">{t('preview.col.id')}</th>
                    <th className="whitespace-nowrap px-3 py-3">{t('preview.col.finding')}</th>
                    <th className="whitespace-nowrap px-3 py-3">{t('preview.col.domain')}</th>
                    <th className="whitespace-nowrap px-3 py-3">{t('preview.col.risk')}</th>
                    <th className="whitespace-nowrap px-3 py-3">{t('preview.col.impact')}</th>
                    <th className="whitespace-nowrap px-3 py-3 pr-4">{t('preview.col.recommendation')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length ? (
                    rows.map((row) => (
                      <tr key={row.id} className="border-b border-[#f1f5f9] last:border-0">
                        <td className={`whitespace-nowrap px-3 py-3 pl-4 align-top ${priorityRowToneClass(row.idTone)}`}>{row.id}</td>
                        <td className="max-w-[200px] px-3 py-3 align-top font-medium text-[#0f172a]">{row.finding}</td>
                        <td className="whitespace-nowrap px-3 py-3 align-top text-[#475569]">{row.domain}</td>
                        <td className={`whitespace-nowrap px-3 py-3 align-top ${priorityRowToneClass(row.riskTone)}`}>{row.risk}</td>
                        <td className="whitespace-nowrap px-3 py-3 align-top text-[#334155]">{row.impact}</td>
                        <td className="px-3 py-3 pr-4 align-top text-[#475569]">{row.recommendation}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-[#64748b]">
                        {t('preview.empty')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside className="min-w-0 lg:col-span-4">
          <div className="rounded-2xl border border-[#bfdbfe] bg-[#eff6ff] p-4 shadow-sm sm:p-5 lg:p-6">
            <h3 className="text-base font-bold text-[#0f172a] sm:text-lg">{t('preview.pdf.title')}</h3>
            <div className="mt-4 flex flex-col items-center gap-4 sm:mt-5 sm:flex-row sm:items-start sm:justify-center sm:gap-5 lg:flex-col lg:items-center lg:gap-5 xl:flex-row xl:items-start xl:justify-start xl:gap-6">
              <ReportCoverMock
                subtitle={data.company_name?.trim() || data.checklist_title}
                kicker={t('preview.cover.kicker')}
                line1={t('preview.cover.line1')}
                line2={t('preview.cover.line2')}
              />
              <ul className="w-full space-y-2.5 text-sm text-[#334155] sm:min-w-0 sm:flex-1 sm:pt-1 lg:w-full lg:flex-none lg:pt-0 xl:flex-1 xl:pt-1">
                {pdfBullets.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 text-[#0066ff]" aria-hidden>
                      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M3 8.5 6.5 12 13 5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              disabled={!canDownloadPdf || downloading}
              onClick={() => void handleExportPdf()}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#0066ff] bg-white py-2.5 text-sm font-semibold text-[#0066ff] shadow-sm transition hover:bg-[#f0f7ff] disabled:cursor-not-allowed disabled:opacity-60"
              title={canDownloadPdf ? t('preview.pdf.downloadTitle') : t('preview.pdf.waitTitle')}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {downloading ? t('preview.pdf.preparing') : canDownloadPdf ? t('preview.pdf.exportOptions') : t('preview.pdf.exportWhenPublished')}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
