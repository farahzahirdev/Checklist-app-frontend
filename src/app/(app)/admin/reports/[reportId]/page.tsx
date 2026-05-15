'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  adminReportDetailPath,
  formatReportCode,
  getReport,
  getReportFindings,
  getReportSummaries,
  isReportUuid,
  resolveReportUuidFromRoute,
  startReportReview,
  approveReport,
  publishReport,
  requestReportChanges,
  type ReportResponse,
  type ReportFindingItem,
  type ReportSummaryItem,
} from '@/lib/reports';
import { formatReportDateTime } from '@/lib/format-report';
import { translate, useLocale } from '@/lib/i18n';
import { adminReportDetailMessages } from '@/locales/admin-report-detail';
import { AdminReportAssessmentHero } from '@/components/report/AdminReportAssessmentHero';
import { AdminReportMaturityDomainSection } from '@/components/report/AdminReportMaturityDomainSection';
import { AdminReportFindingsDomainsSection } from '@/components/report/AdminReportFindingsDomainsSection';

export default function AdminReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const routeSlug = decodeURIComponent((params.reportId as string) ?? '');
  const { locale } = useLocale();
  const t = (key: string, values?: Record<string, string>) => translate(adminReportDetailMessages, locale, key, values);

  const [apiReportId, setApiReportId] = useState<string | null>(null);
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [findings, setFindings] = useState<ReportFindingItem[]>([]);
  const [summaries, setSummaries] = useState<ReportSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [requestChangesOpen, setRequestChangesOpen] = useState(false);
  const [requestChangesNote, setRequestChangesNote] = useState('');

  async function loadReportData(reportUuid: string) {
    setLoading(true);
    setError('');
    try {
      const [reportData, findingsData, summariesData] = await Promise.all([
        getReport(reportUuid),
        getReportFindings(reportUuid),
        getReportSummaries(reportUuid),
      ]);
      setReport(reportData);
      setFindings(findingsData);
      setSummaries(summariesData);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('load.failed');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleStartReview() {
    if (!apiReportId) return;
    setActionLoading(true);
    try {
      await startReportReview(apiReportId, t('api.startReviewNote'));
      await loadReportData(apiReportId);
      toast.success(t('toast.reviewStarted'));
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('toast.reviewStartFailed');
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleApprove() {
    if (!apiReportId) return;
    setActionLoading(true);
    try {
      await approveReport(apiReportId, t('api.approveNote'));
      await loadReportData(apiReportId);
      toast.success(t('toast.approved'));
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('toast.approveFailed');
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  }

  async function handlePublish() {
    if (!apiReportId) return;
    const storageKey = window.prompt(t('prompt.pdfKey'), report?.final_pdf_storage_key ?? '');
    if (!storageKey?.trim()) return;

    setActionLoading(true);
    try {
      await publishReport(apiReportId, storageKey.trim());
      await loadReportData(apiReportId);
      toast.success(t('toast.published'));
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('toast.publishFailed');
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  }

  async function submitRequestChanges() {
    if (!apiReportId) return;
    const note = requestChangesNote.trim();
    if (!note) {
      toast.error(t('toast.changesNoteRequired'));
      return;
    }

    setActionLoading(true);
    try {
      await requestReportChanges(apiReportId, note);
      setRequestChangesOpen(false);
      setRequestChangesNote('');
      await loadReportData(apiReportId);
      toast.success(t('toast.changesRequested'));
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('toast.changesRequestFailed');
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    setApiReportId(null);
    setReport(null);
    setLoading(true);
    setError('');
    void resolveReportUuidFromRoute(routeSlug)
      .then((id) => {
        if (!cancelled) setApiReportId(id);
      })
      .catch((err) => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : t('load.failed');
        setError(msg);
        toast.error(msg);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [routeSlug, locale]);

  useEffect(() => {
    if (!apiReportId) return;
    void loadReportData(apiReportId);
  }, [apiReportId]);

  useEffect(() => {
    if (!report) return;
    const canonicalCode = formatReportCode(report);
    if (routeSlug !== canonicalCode && isReportUuid(routeSlug)) {
      router.replace(adminReportDetailPath(report) as any);
    }
  }, [report, routeSlug, router]);

  useEffect(() => {
    if (!requestChangesOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !actionLoading) {
        setRequestChangesOpen(false);
        setRequestChangesNote('');
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [requestChangesOpen, actionLoading]);

  if (loading) {
    return (
      <section className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </section>
    );
  }

  if (error || !report) {
    return (
      <section className="space-y-4">
        <div className="rounded-lg border border-[#f0c7cf] bg-[#fff2f4] px-3 py-2 text-sm text-[#b63d51]">
          {error || t('error.notFound')}
        </div>
      </section>
    );
  }

  return (
    <section className="min-w-0 space-y-6">
      <AdminReportAssessmentHero report={report} findings={findings} summaries={summaries} />

      <AdminReportMaturityDomainSection report={report} />

      <AdminReportFindingsDomainsSection report={report} findings={findings} summaries={summaries} />

      {(report.status === 'draft_generated' ||
        report.status === 'under_review' ||
        report.status === 'approved') && (
      <div className="flex flex-wrap gap-3">
        {report.status === 'draft_generated' && (
          <button
            type="button"
            onClick={handleStartReview}
            disabled={actionLoading}
            className="rounded-xl border border-[#2d4f83] bg-[#182843] px-4 py-2 text-sm font-semibold text-white hover:bg-[#223657] disabled:opacity-60"
          >
            {actionLoading ? t('actions.processing') : t('actions.startReview')}
          </button>
        )}
        {report.status === 'under_review' && (
          <>
            <button
              type="button"
              onClick={handleApprove}
              disabled={actionLoading}
              className="rounded-xl border border-[#2f9960] bg-[#2f9960] px-4 py-2 text-sm font-semibold text-white hover:bg-[#268a53] disabled:opacity-60"
            >
              {actionLoading ? t('actions.processing') : t('actions.approve')}
            </button>
            <button
              type="button"
              onClick={() => {
                setRequestChangesNote('');
                setRequestChangesOpen(true);
              }}
              disabled={actionLoading}
              className="rounded-xl border border-[#b6862f] bg-[#b6862f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#a0772a] disabled:opacity-60"
            >
              {t('actions.requestChanges')}
            </button>
          </>
        )}
        {report.status === 'approved' && (
          <button
            type="button"
            onClick={handlePublish}
            disabled={actionLoading}
            className="rounded-xl border border-[#2d4f83] bg-[#182843] px-4 py-2 text-sm font-semibold text-white hover:bg-[#223657] disabled:opacity-60"
          >
            {actionLoading ? t('actions.processing') : t('actions.publish')}
          </button>
        )}
      </div>
      )}

      {(report.final_pdf_storage_key || report.final_pdf_published_at) && (
        <article className="rounded-2xl border border-[#dbe4f4] bg-white px-4 py-3 shadow-sm">
          <h2 className="text-sm font-semibold text-[#243555]">{t('publication.title')}</h2>
          <div className="mt-2 grid gap-2 text-sm text-[#607594] md:grid-cols-2">
            <p>
              {t('publication.pdfKey')} {report.final_pdf_storage_key || t('publication.notSet')}
            </p>
            <p>
              {t('publication.publishedAt')}{' '}
              {report.final_pdf_published_at ? formatReportDateTime(report.final_pdf_published_at) : t('publication.notYet')}
            </p>
          </div>
        </article>
      )}

      <div id="admin-report-findings" className="grid min-w-0 gap-6 scroll-mt-24 xl:grid-cols-2">
        <section className="min-w-0 space-y-3">
          <h2 className="text-xl font-semibold text-[#243555]">{t('findings.title', { count: String(findings.length) })}</h2>
          <div className="space-y-3">
            {findings.map((finding) => (
              <article key={finding.id} className="rounded-xl border border-[#e2e8f5] bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className={`rounded-md px-2 py-1 text-xs font-semibold ${
                    finding.priority === 'high' ? 'bg-[#fee2e2] text-[#dc2626]' :
                    finding.priority === 'medium' ? 'bg-[#fef3c7] text-[#d97706]' :
                    'bg-[#e0e7ff] text-[#3730a3]'
                  }`}>
                    {t(`findings.priority.${finding.priority}`)}
                  </span>
                </div>
                <p className="text-sm text-[#2b3e60] mb-2">{finding.finding_text}</p>
                {finding.recommendation_text && (
                  <div className="border-t border-[#edf2f9] pt-2">
                    <p className="text-xs font-semibold text-[#607594] mb-1">{t('findings.recommendation')}</p>
                    <p className="text-sm text-[#2b3e60]">{finding.recommendation_text}</p>
                  </div>
                )}
              </article>
            ))}
            {!findings.length && (
              <p className="text-sm text-[#607594]">{t('findings.empty')}</p>
            )}
          </div>
        </section>

        <section id="admin-section-summaries-detail" className="min-w-0 scroll-mt-24 space-y-3">
          <h2 className="text-xl font-semibold text-[#243555]">{t('summaries.title', { count: String(summaries.length) })}</h2>
          <div className="space-y-3">
            {summaries.map((summary, idx) => {
              const summaryKey =
                (typeof summary.id === 'string' && summary.id.trim() !== '' ? summary.id : null) ??
                `summary-${[summary.section_id, summary.chapter_code].filter(Boolean).join('-') || 'row'}-${idx}`;
              return (
              <article
                key={summaryKey}
                className="rounded-xl border border-[#e2e8f5] bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-[#243555]">
                    {summary.chapter_code || t('summaries.generalSection')}
                  </h3>
                </div>
                <p className="text-sm text-[#2b3e60]">
                  {summary.summary_text?.trim() ? summary.summary_text : t('summaries.noNarrative')}
                </p>
              </article>
              );
            })}
            {!summaries.length && (
              <p className="text-sm text-[#607594]">{t('summaries.empty')}</p>
            )}
          </div>
        </section>
      </div>

      {requestChangesOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1220]/55 px-4 py-8"
          onClick={() => {
            if (!actionLoading) {
              setRequestChangesOpen(false);
              setRequestChangesNote('');
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="request-changes-title"
            className="w-full max-w-lg md:max-w-xl lg:max-w-2xl rounded-2xl border border-[#dbe4f4] bg-white p-6 md:p-8 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="request-changes-title" className="text-lg font-semibold text-[#1f2d45] md:text-xl">
              {t('modal.requestChanges.title')}
            </h2>
            <p className="mt-1 text-sm text-[#607594] md:text-[0.9375rem]">{t('modal.requestChanges.body')}</p>
            <label className="mt-4 block">
              <span className="mb-1 block text-xs font-medium text-[#5f7395]">{t('modal.requestChanges.label')}</span>
              <textarea
                value={requestChangesNote}
                onChange={(e) => setRequestChangesNote(e.target.value)}
                rows={6}
                className="min-h-[9.5rem] w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm text-[#25375a] outline-none focus:border-[#3e69b0] md:min-h-[14rem] md:px-4 md:py-3 md:text-[0.9375rem]"
                placeholder={t('modal.requestChanges.placeholder')}
                autoFocus
              />
            </label>
            <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => {
                  setRequestChangesOpen(false);
                  setRequestChangesNote('');
                }}
                className="rounded-lg border border-[#d4dced] px-3 py-2 text-sm font-semibold text-[#3e69b0] hover:bg-[#edf4ff] disabled:opacity-60"
              >
                {t('modal.cancel')}
              </button>
              <button
                type="button"
                disabled={actionLoading || !requestChangesNote.trim()}
                onClick={() => void submitRequestChanges()}
                className="rounded-lg border border-[#b6862f] bg-[#b6862f] px-3 py-2 text-sm font-semibold text-white hover:bg-[#a0772a] disabled:opacity-60"
              >
                {actionLoading ? t('modal.sending') : t('modal.send')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
