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
  requestReportChanges,
  type ReportResponse,
  type ReportFindingItem,
  type ReportSummaryItem,
} from '@/lib/reports';

export default function AdminReportDetailPage() {
  const params = useParams();
  const reportId = params.reportId as string;
  
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [findings, setFindings] = useState<ReportFindingItem[]>([]);
  const [summaries, setSummaries] = useState<ReportSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

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

  async function handleRequestChanges() {
    const note = prompt('Please specify the changes requested:');
    if (!note) return;
    
    setActionLoading(true);
    try {
      await requestReportChanges(reportId, note);
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
      <header className="rounded-2xl border border-[#dbe4f4] bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6f82a3]">Report Details</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1f2d45]">
              Assessment Report
            </h1>
            <p className="mt-1 text-sm text-[#607594]">Report ID: {report.id}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`rounded-md px-3 py-1 text-sm font-semibold ${statusColors[report.status]}`}>
              {statusLabels[report.status]}
            </span>
          </div>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <article className="rounded-2xl border border-[#e2e8f5] bg-white px-4 py-3 shadow-sm">
          <p className="text-sm font-medium text-[#6a7d9a]">Findings</p>
          <p className="mt-2 text-2xl font-semibold text-[#273a5a]">{report.findings_count}</p>
        </article>
        <article className="rounded-2xl border border-[#e2e8f5] bg-white px-4 py-3 shadow-sm">
          <p className="text-sm font-medium text-[#6a7d9a]">Summaries</p>
          <p className="mt-2 text-2xl font-semibold text-[#273a5a]">{report.summaries_count}</p>
        </article>
        <article className="rounded-2xl border border-[#e2e8f5] bg-white px-4 py-3 shadow-sm">
          <p className="text-sm font-medium text-[#6a7d9a]">Generated</p>
          <p className="mt-2 text-sm font-semibold text-[#273a5a]">
            {report.draft_generated_at ? new Date(report.draft_generated_at).toLocaleDateString() : '-'}
          </p>
        </article>
        <article className="rounded-2xl border border-[#e2e8f5] bg-white px-4 py-3 shadow-sm">
          <p className="text-sm font-medium text-[#6a7d9a]">Last Action</p>
          <p className="mt-2 text-sm font-semibold text-[#273a5a]">
            {report.approved_at ? new Date(report.approved_at).toLocaleDateString() :
             report.reviewed_at ? new Date(report.reviewed_at).toLocaleDateString() :
             report.draft_generated_at ? new Date(report.draft_generated_at).toLocaleDateString() : '-'}
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
              onClick={handleRequestChanges}
              disabled={actionLoading}
              className="rounded-xl border border-[#b6862f] bg-[#b6862f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#a0772a] disabled:opacity-60"
            >
              {actionLoading ? 'Processing...' : 'Request Changes'}
            </button>
          </>
        )}
      </div>

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
    </section>
  );
}
