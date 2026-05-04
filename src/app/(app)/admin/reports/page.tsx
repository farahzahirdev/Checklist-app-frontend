'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  getReportsList,
  type ReportListItem,
  type ReportStatus,
} from '@/lib/reports';
import { ADMIN_PAGE_TITLE_CLASS } from '@/app/(app)/admin/admin-page-title';

const statusClass: Record<ReportStatus, string> = {
  draft_generated: 'bg-[#fff4df] text-[#b6862f]',
  under_review: 'bg-[#eaf2ff] text-[#3f74df]',
  changes_requested: 'bg-[#fff4df] text-[#b6862f]',
  approved: 'bg-[#e9f8ef] text-[#2f9960]',
  published: 'bg-[#e9f8ef] text-[#2f9960]',
};

const statusLabels: Record<ReportStatus, string> = {
  draft_generated: 'Draft',
  under_review: 'Under Review',
  changes_requested: 'Changes Requested',
  approved: 'Approved',
  published: 'Published',
};

type ReportsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default function AdminReportsPage({ searchParams }: ReportsPageProps) {
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  async function loadReports() {
    setLoading(true);
    setError('');
    try {
      const response = await getReportsList({ limit: 50 });
      setReports(response.reports);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load reports';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadReports();
  }, []);

  const filteredReports = statusFilter 
    ? reports.filter((report) => report.status === statusFilter)
    : reports;

  const stats = {
    ready: reports.filter(r => r.status === 'under_review').length,
    draft: reports.filter(r => r.status === 'draft_generated').length,
    published: reports.filter(r => r.status === 'published').length,
  };

  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-[#dbe4f4] bg-white px-5 py-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6f82a3]">Reports</p>
        <h1 className={`mt-2 ${ADMIN_PAGE_TITLE_CLASS}`}>Report Center</h1>
        <p className="mt-1 text-sm text-[#607594]">Review generated assessment reports and publish approved versions.</p>
        {statusFilter ? <p className="mt-2 text-sm font-semibold text-[#3e69b0]">Filtered by status: {statusFilter}</p> : null}
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        {[
          { label: 'Reports Ready', value: stats.ready.toString() },
          { label: 'Draft Reports', value: stats.draft.toString() },
          { label: 'Published', value: stats.published.toString() },
        ].map((item) => (
          <article key={item.label} className="rounded-2xl border border-[#e2e8f5] bg-white px-4 py-3 shadow-sm">
            <p className="text-sm font-medium text-[#6a7d9a]">{item.label}</p>
            <p className="mt-1 text-3xl font-semibold text-[#273a5a]">{item.value}</p>
          </article>
        ))}
      </div>

      <article className="overflow-hidden rounded-2xl border border-[#e2e8f5] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#ecf0f8] px-4 py-3">
          <h2 className="text-xl font-semibold text-[#243555]">Recent Reports</h2>
          <div className="flex gap-2">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-[#d4dced] bg-white px-3 py-1 text-sm"
            >
              <option value="">All Status</option>
              <option value="draft_generated">Draft</option>
              <option value="under_review">Under Review</option>
              <option value="changes_requested">Changes Requested</option>
              <option value="approved">Approved</option>
              <option value="published">Published</option>
            </select>
            <button 
              type="button" 
              onClick={() => void loadReports()}
              disabled={loading}
              className="rounded-xl border border-[#2d4f83] bg-[#182843] px-4 py-2 text-sm font-semibold text-white hover:bg-[#223657] disabled:opacity-60"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {error ? (
          <div className="px-4 py-3">
            <p className="rounded-lg border border-[#f0c7cf] bg-[#fff2f4] px-3 py-2 text-sm text-[#b63d51]">{error}</p>
          </div>
        ) : null}

        <div className="overflow-x-auto px-4 py-3">
          <table className="min-w-full text-left text-sm text-[#2b3e60]">
            <thead className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7a8ca8]">
              <tr className="border-b border-[#edf2f9]">
                <th className="py-2 pr-4">Customer</th>
                <th className="py-2 pr-4">Checklist</th>
                <th className="py-2 pr-4">Generated</th>
                <th className="py-2 pr-4">Reviewer</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id} className="border-b border-[#edf2f9] last:border-0">
                  <td className="py-3 pr-4 font-semibold text-[#25375a]">
                    {report.customer_name || report.customer_email}
                  </td>
                  <td className="py-3 pr-4 text-[#5f7395]">{report.checklist_title}</td>
                  <td className="py-3 pr-4 text-[#5f7395]">
                    {report.draft_generated_at ? new Date(report.draft_generated_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="py-3 pr-4 text-[#5f7395]">{report.reviewer_name || '-'}</td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-md px-2 py-1 text-xs font-semibold ${statusClass[report.status]}`}>
                      {statusLabels[report.status]}
                    </span>
                  </td>
                  <td className="py-3">
                    <Link 
                      href={`/admin/reports/${report.id}` as any}
                      className="text-sm font-semibold text-[#3e69b0] hover:underline"
                    >
                      View Report
                    </Link>
                  </td>
                </tr>
              ))}
              {!filteredReports.length ? (
                <tr>
                  <td className="py-3 text-[#607594]" colSpan={6}>
                    {loading ? 'Loading reports...' : 'No reports found.'}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
