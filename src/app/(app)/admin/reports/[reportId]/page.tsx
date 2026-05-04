'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  getReport,
  getReportFindings,
  getReportSummaries,
  startReportReview,
  approveReport,
  publishReport,
  requestReportChanges,
  type ReportResponse,
  type ReportFindingItem,
  type ReportSummaryItem,
} from '@/lib/reports';
import {
  ADMIN_KPI_DARK_CARD_CLASS,
  ADMIN_KPI_DARK_LABEL_CLASS,
  ADMIN_PAGE_HERO_EYEBROW_CLASS,
  ADMIN_PAGE_HERO_HEADER_CLASS,
  ADMIN_PAGE_HERO_TITLE_CLASS,
} from '@/app/(app)/admin/admin-page-title';

export default function AdminReportDetailPage() {
  const params = useParams();
  const reportId = params.reportId as string;
  
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [findings, setFindings] = useState<ReportFindingItem[]>([]);
  const [summaries, setSummaries] = useState<ReportSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [requestChangesOpen, setRequestChangesOpen] = useState(false);
  const [requestChangesNote, setRequestChangesNote] = useState('');

  async function loadReportData() {
    setLoading(true);
    setError('');
    try {
      const [reportData, findingsData, summariesData] = await Promise.all([
        getReport(reportId),
        getReportFindings(reportId),
        getReportSummaries(reportId),
      ]);
      setReport(reportData);
      setFindings(findingsData);
      setSummaries(summariesData);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load report';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleStartReview() {
    setActionLoading(true);
    try {
      await startReportReview(reportId, 'Starting review process');
      await loadReportData();
      toast.success('Review started');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to start review';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleApprove() {
    setActionLoading(true);
    try {
      await approveReport(reportId, 'Report approved for publication');
      await loadReportData();
      toast.success('Report approved');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to approve report';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  }

  async function handlePublish() {
    const storageKey = window.prompt(
      'Enter the final PDF storage key for this report',
      report?.final_pdf_storage_key ?? '',
    );
    if (!storageKey?.trim()) return;

    setActionLoading(true);
    try {
      await publishReport(reportId, storageKey.trim());
      await loadReportData();
      toast.success('Report published');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to publish report';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  }

  async function submitRequestChanges() {
    const note = requestChangesNote.trim();
    if (!note) {
      toast.error('Please describe the requested changes.');
      return;
    }

    setActionLoading(true);
    try {
      await requestReportChanges(reportId, note);
      setRequestChangesOpen(false);
      setRequestChangesNote('');
      await loadReportData();
      toast.success('Changes requested');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to request changes';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  }

  useEffect(() => {
    void loadReportData();
  }, [reportId]);

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
          {error || 'Report not found'}
        </div>
      </section>
    );
  }

  const statusColors = {
    draft_generated: 'bg-[#fff4df] text-[#b6862f]',
    under_review: 'bg-[#eaf2ff] text-[#3f74df]',
    changes_requested: 'bg-[#fff4df] text-[#b6862f]',
    approved: 'bg-[#e9f8ef] text-[#2f9960]',
    published: 'bg-[#e9f8ef] text-[#2f9960]',
  };

  const statusLabels = {
    draft_generated: 'Draft',
    under_review: 'Under Review',
    changes_requested: 'Changes Requested',
    approved: 'Approved',
    published: 'Published',
  };

  return (
    <section className="space-y-6">
      <header className={ADMIN_PAGE_HERO_HEADER_CLASS}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className={ADMIN_PAGE_HERO_EYEBROW_CLASS}>Report Details</p>
            <h1 className={ADMIN_PAGE_HERO_TITLE_CLASS}>Assessment Report</h1>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className={`rounded-md px-3 py-1 text-sm font-semibold ${statusColors[report.status]}`}>
              {statusLabels[report.status]}
            </span>
          </div>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        <article className={ADMIN_KPI_DARK_CARD_CLASS}>
          <p className={ADMIN_KPI_DARK_LABEL_CLASS}>Findings</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-[#ffd89c]">{report.findings_count}</p>
        </article>
        <article className={ADMIN_KPI_DARK_CARD_CLASS}>
          <p className={ADMIN_KPI_DARK_LABEL_CLASS}>Summaries</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-[#a9c7ff]">{report.summaries_count}</p>
        </article>
        <article className={ADMIN_KPI_DARK_CARD_CLASS}>
          <p className={ADMIN_KPI_DARK_LABEL_CLASS}>Generated</p>
          <p className="mt-2 text-base font-semibold leading-snug text-[#c4d6f7]">
            {report.draft_generated_at ? new Date(report.draft_generated_at).toLocaleDateString() : '-'}
          </p>
        </article>
        <article className={ADMIN_KPI_DARK_CARD_CLASS}>
          <p className={ADMIN_KPI_DARK_LABEL_CLASS}>Last Action</p>
          <p className="mt-2 text-base font-semibold leading-snug text-[#c4d6f7]">
            {report.approved_at
              ? new Date(report.approved_at).toLocaleDateString()
              : report.reviewed_at
                ? new Date(report.reviewed_at).toLocaleDateString()
                : report.draft_generated_at
                  ? new Date(report.draft_generated_at).toLocaleDateString()
                  : '-'}
          </p>
        </article>
      </div>

      <div className="flex gap-3">
        {report.status === 'draft_generated' && (
          <button
            type="button"
            onClick={handleStartReview}
            disabled={actionLoading}
            className="rounded-xl border border-[#2d4f83] bg-[#182843] px-4 py-2 text-sm font-semibold text-white hover:bg-[#223657] disabled:opacity-60"
          >
            {actionLoading ? 'Processing...' : 'Start Review'}
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
              {actionLoading ? 'Processing...' : 'Approve Report'}
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
              Request Changes
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
            {actionLoading ? 'Processing...' : 'Publish Report'}
          </button>
        )}
      </div>

      {(report.final_pdf_storage_key || report.final_pdf_published_at) && (
        <article className="rounded-2xl border border-[#dbe4f4] bg-white px-4 py-3 shadow-sm">
          <h2 className="text-sm font-semibold text-[#243555]">Publication</h2>
          <div className="mt-2 grid gap-2 text-sm text-[#607594] md:grid-cols-2">
            <p>PDF key: {report.final_pdf_storage_key || 'Not set'}</p>
            <p>Published at: {report.final_pdf_published_at ? new Date(report.final_pdf_published_at).toLocaleString() : 'Not published yet'}</p>
          </div>
        </article>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[#243555]">Findings ({findings.length})</h2>
          <div className="space-y-3">
            {findings.map((finding) => (
              <article key={finding.id} className="rounded-xl border border-[#e2e8f5] bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className={`rounded-md px-2 py-1 text-xs font-semibold ${
                    finding.priority === 'high' ? 'bg-[#fee2e2] text-[#dc2626]' :
                    finding.priority === 'medium' ? 'bg-[#fef3c7] text-[#d97706]' :
                    'bg-[#e0e7ff] text-[#3730a3]'
                  }`}>
                    {finding.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-[#2b3e60] mb-2">{finding.finding_text}</p>
                {finding.recommendation_text && (
                  <div className="border-t border-[#edf2f9] pt-2">
                    <p className="text-xs font-semibold text-[#607594] mb-1">Recommendation:</p>
                    <p className="text-sm text-[#2b3e60]">{finding.recommendation_text}</p>
                  </div>
                )}
              </article>
            ))}
            {!findings.length && (
              <p className="text-sm text-[#607594]">No findings found.</p>
            )}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[#243555]">Section Summaries ({summaries.length})</h2>
          <div className="space-y-3">
            {summaries.map((summary) => (
              <article key={summary.id} className="rounded-xl border border-[#e2e8f5] bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-[#243555]">
                    {summary.chapter_code || 'General Section'}
                  </h3>
                </div>
                <p className="text-sm text-[#2b3e60]">{summary.summary_text}</p>
              </article>
            ))}
            {!summaries.length && (
              <p className="text-sm text-[#607594]">No section summaries found.</p>
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
            className="w-full max-w-lg md:max-w-2xl lg:max-w-3xl rounded-2xl border border-[#dbe4f4] bg-white p-6 md:p-8 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="request-changes-title" className="text-lg font-semibold text-[#1f2d45] md:text-xl">
              Request changes
            </h2>
            <p className="mt-1 text-sm text-[#607594] md:text-[0.9375rem]">
              Describe what should be revised before this report can move forward. This will be sent with the change
              request.
            </p>
            <label className="mt-4 block">
              <span className="mb-1 block text-xs font-medium text-[#5f7395]">Change details</span>
              <textarea
                value={requestChangesNote}
                onChange={(e) => setRequestChangesNote(e.target.value)}
                rows={6}
                className="min-h-[9.5rem] w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm text-[#25375a] outline-none focus:border-[#3e69b0] md:min-h-[14rem] md:px-4 md:py-3 md:text-[0.9375rem]"
                placeholder="e.g. Update executive summary, clarify finding #3, add missing appendix…"
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
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading || !requestChangesNote.trim()}
                onClick={() => void submitRequestChanges()}
                className="rounded-lg border border-[#b6862f] bg-[#b6862f] px-3 py-2 text-sm font-semibold text-white hover:bg-[#a0772a] disabled:opacity-60"
              >
                {actionLoading ? 'Sending…' : 'Send request'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
