'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { ReportDashboard } from '@/components/report/report-dashboard';
import {
  getCustomerReport,
  getCustomerReportData,
  type CustomerReportDataResponse,
  type ReportResponse,
} from '@/lib/reports';

function formatDate(value: string | null | undefined) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

const statusLabels: Record<ReportResponse['status'], string> = {
  draft_generated: 'Draft',
  under_review: 'Under Review',
  changes_requested: 'Changes Requested',
  approved: 'Approved',
  published: 'Published',
};

export default function CustomerReportPage() {
  const params = useParams();
  const reportId = params.reportId as string;

  const [report, setReport] = useState<ReportResponse | null>(null);
  const [data, setData] = useState<CustomerReportDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadReport() {
    setLoading(true);
    setError('');
    try {
      const [reportResponse, reportData] = await Promise.all([
        getCustomerReport(reportId),
        getCustomerReportData(reportId),
      ]);
      setReport(reportResponse);
      setData(reportData);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load report';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadReport();
  }, [reportId]);

  if (loading) {
    return (
      <section className="space-y-4">
        <div className="animate-pulse rounded-2xl border border-[#dbe4f4] bg-white p-5 shadow-sm">
          <div className="h-7 w-1/3 rounded bg-[#e8eef8]" />
          <div className="mt-3 h-4 w-1/2 rounded bg-[#edf2fa]" />
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="h-20 rounded-xl bg-[#eef3fb]" />
            <div className="h-20 rounded-xl bg-[#eef3fb]" />
            <div className="h-20 rounded-xl bg-[#eef3fb]" />
          </div>
        </div>
      </section>
    );
  }

  if (error || !report || !data) {
    return (
      <section className="space-y-4">
        <div className="rounded-lg border border-[#f0c7cf] bg-[#fff2f4] px-3 py-2 text-sm text-[#b63d51]">
          {error || 'Report not found'}
        </div>
        <Link href="/dashboard" className="text-sm font-semibold text-[#3e69b0] hover:underline">
          Back to dashboard
        </Link>
      </section>
    );
  }

  const isPublished = report.status === 'published';

  return (
    <section className="space-y-6" suppressHydrationWarning>
      <header className="rounded-2xl border border-[#dbe4f4] bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6f82a3]">Customer Report</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1f2d45]">
              {data.checklist_title}
            </h1>
            <p className="mt-1 text-sm text-[#607594]">Customer: {data.customer_name} · {data.customer_email}</p>
            <p className="mt-1 text-sm text-[#607594]">Assessment completed on {formatDate(data.assessment_date)}</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <span className={`rounded-md px-3 py-1 text-sm font-semibold ${isPublished ? 'bg-[#e9f8ef] text-[#2f9960]' : 'bg-[#eaf2ff] text-[#3f74df]'}`}>
              {statusLabels[report.status]}
            </span>
            <Link href="/reports" className="text-sm font-semibold text-[#3e69b0] hover:underline">
              Back to reports
            </Link>
          </div>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <article className="rounded-2xl border border-[#e2e8f5] bg-white px-4 py-3 shadow-sm">
          <p className="text-sm font-medium text-[#6a7d9a]">Overall score</p>
          <p className="mt-2 text-2xl font-semibold text-[#273a5a]">{Math.round(data.overall_score)}/{data.max_possible_score}</p>
        </article>
        <article className="rounded-2xl border border-[#e2e8f5] bg-white px-4 py-3 shadow-sm">
          <p className="text-sm font-medium text-[#6a7d9a]">Completion</p>
          <p className="mt-2 text-2xl font-semibold text-[#273a5a]">{Math.round(data.completion_percentage)}%</p>
        </article>
        <article className="rounded-2xl border border-[#e2e8f5] bg-white px-4 py-3 shadow-sm">
          <p className="text-sm font-medium text-[#6a7d9a]">Findings</p>
          <p className="mt-2 text-2xl font-semibold text-[#273a5a]">{report.findings_count}</p>
        </article>
        <article className="rounded-2xl border border-[#e2e8f5] bg-white px-4 py-3 shadow-sm">
          <p className="text-sm font-medium text-[#6a7d9a]">Published</p>
          <p className="mt-2 text-sm font-semibold text-[#273a5a]">{formatDate(report.final_pdf_published_at || data.published_at)}</p>
        </article>
      </div>

      {!isPublished ? (
        <p className="rounded-xl border border-[#f2dfad] bg-[#fff9ea] px-4 py-3 text-sm text-[#835f12]">
          This report is approved but not yet published. It will appear on the customer dashboard once the admin publishes it.
        </p>
      ) : null}

      <ReportDashboard data={data} reportId={reportId} />
    </section>
  );
}