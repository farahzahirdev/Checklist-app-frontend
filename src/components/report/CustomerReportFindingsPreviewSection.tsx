'use client';

import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { CustomerReportDataResponse } from '@/lib/reports';
import { downloadCustomerReportPdf } from '@/lib/reports';

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

const IMPACT_FOR_PRIORITY: Record<'high' | 'medium' | 'low', string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

function toneText(t: 'high' | 'medium' | 'low') {
  if (t === 'high') return 'font-semibold text-red-600';
  if (t === 'medium') return 'font-semibold text-orange-600';
  return 'font-semibold text-emerald-600';
}

function ReportCoverMock({ title }: { title: string }) {
  return (
    <div
      className="relative mx-auto aspect-[3/4] w-full max-w-[140px] overflow-hidden rounded-lg shadow-lg ring-1 ring-black/10"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[linear-gradient(145deg,#0a1628_0%,#132a52_45%,#1e3a8a_100%)]" />
      <div className="absolute -right-6 top-0 h-3/4 w-2/3 rounded-full bg-[#3b82f6]/25 blur-2xl" />
      <div className="relative flex h-full flex-col justify-between p-3 text-white">
        <div className="text-[0.5rem] font-semibold uppercase tracking-wider text-[#93c5fd]">Checklist KB</div>
        <div>
          <p className="text-[0.55rem] font-bold uppercase leading-tight text-white/90">Security assessment</p>
          <p className="text-[0.55rem] font-bold uppercase leading-tight text-white/90">Report</p>
          <p className="mt-1 text-[0.5rem] font-semibold leading-tight text-[#bfdbfe] line-clamp-3">{title}</p>
        </div>
      </div>
    </div>
  );
}

function findingDomain(f: CustomerReportDataResponse['findings'][0]) {
  return f.report_domain?.trim() || 'General';
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
  const [downloading, setDownloading] = useState(false);

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
        domain: findingDomain(f),
        risk: tone === 'high' ? 'High' : tone === 'medium' ? 'Medium' : 'Low',
        riskTone: tone,
        impact: IMPACT_FOR_PRIORITY[tone],
        recommendation: rec.length > 140 ? `${rec.slice(0, 138)}…` : rec || '—',
      };
    });
    return built;
  }, [data.findings]);

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
      toast.success('Download started');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Download failed';
      toast.error(msg);
    } finally {
      setDownloading(false);
    }
  }, [canDownloadPdf, reportId]);

  return (
    <div id="detailed-findings" className="scroll-mt-24">
      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-8">
          <h2 className="text-xl font-bold text-[#0f172a] sm:text-2xl">Detailed findings preview</h2>
          <p className="mt-1 text-sm text-[#64748b] sm:text-base">
            Representative findings from this assessment (up to 25 rows, sorted by severity).
          </p>

          <div className="mt-4 overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#e8edf5] bg-[#f8fafc] text-[0.65rem] font-semibold uppercase tracking-wide text-[#64748b]">
                    <th className="whitespace-nowrap px-3 py-3 pl-4">ID</th>
                    <th className="whitespace-nowrap px-3 py-3">Finding</th>
                    <th className="whitespace-nowrap px-3 py-3">Domain</th>
                    <th className="whitespace-nowrap px-3 py-3">Risk</th>
                    <th className="whitespace-nowrap px-3 py-3">Impact</th>
                    <th className="whitespace-nowrap px-3 py-3 pr-4">Recommendation</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length ? (
                    rows.map((row) => (
                      <tr key={row.id} className="border-b border-[#f1f5f9] last:border-0">
                        <td className={`whitespace-nowrap px-3 py-3 pl-4 align-top ${toneText(row.idTone)}`}>{row.id}</td>
                        <td className="max-w-[200px] px-3 py-3 align-top font-medium text-[#0f172a]">{row.finding}</td>
                        <td className="whitespace-nowrap px-3 py-3 align-top text-[#475569]">{row.domain}</td>
                        <td className={`whitespace-nowrap px-3 py-3 align-top ${toneText(row.riskTone)}`}>{row.risk}</td>
                        <td className="whitespace-nowrap px-3 py-3 align-top text-[#334155]">{row.impact}</td>
                        <td className="px-3 py-3 pr-4 align-top text-[#475569]">{row.recommendation}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-[#64748b]">
                        No findings recorded for this report.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-4">
          <div className="rounded-2xl border border-[#bfdbfe] bg-[#eff6ff] p-5 shadow-sm sm:p-6">
            <h3 className="text-lg font-bold text-[#0f172a]">Includes full report (PDF)</h3>
            <div className="mt-5 flex justify-center">
              <ReportCoverMock title={data.checklist_title} />
            </div>
            <ul className="mt-5 space-y-2.5 text-sm text-[#334155]">
              {['Detailed findings', 'Evidence references', 'Recommendations', 'Exportable data'].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-0.5 text-[#0066ff]" aria-hidden>
                    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M3 8.5 6.5 12 13 5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <button
              type="button"
              disabled={!canDownloadPdf || downloading}
              onClick={() => void handleExportPdf()}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#0066ff] bg-white py-2.5 text-sm font-semibold text-[#0066ff] shadow-sm transition hover:bg-[#f0f7ff] disabled:cursor-not-allowed disabled:opacity-60"
              title={canDownloadPdf ? 'Download PDF' : 'PDF download is available when the report is published'}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {downloading ? 'Preparing…' : canDownloadPdf ? 'Export options' : 'Export when published'}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
