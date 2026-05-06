'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getCustomerDashboardEnhanced,
  getCustomerDashboardSummary,
  type CustomerDashboardEnhanced,
  type CustomerDashboardSummary,
} from '@/lib/dashboard';
import { listCustomerAssessments, type CustomerAssessmentListItem } from '@/lib/customer-assessments';
import { getCustomerReports, type ReportResponse } from '@/lib/reports';
import { formatStatusLabel } from '@/lib/status-format';

export default function DashboardPage() {
  const [summary, setSummary] = useState<CustomerDashboardSummary | null>(null);
  const [enhanced, setEnhanced] = useState<CustomerDashboardEnhanced | null>(null);
  const [assessments, setAssessments] = useState<CustomerAssessmentListItem[]>([]);
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [permissionBlocked, setPermissionBlocked] = useState(false);

  async function loadDashboard() {
    setLoading(true);
    setError('');
    setPermissionBlocked(false);
    try {
      const [summaryResponse, enhancedResponse, assessmentsResponse, reportsResponse] = await Promise.all([
        getCustomerDashboardSummary(),
        getCustomerDashboardEnhanced().catch(() => null),
        listCustomerAssessments({ sort_by: 'updated_at', sort_order: 'desc', limit: 20 }).catch(() => null),
        getCustomerReports().catch(() => []),
      ]);
      setSummary(summaryResponse);
      setEnhanced(enhancedResponse);
      setAssessments(assessmentsResponse?.assessments ?? []);
      setReports(reportsResponse);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load customer dashboard';
      setError(msg);
      if (msg.includes('insufficient_permissions')) {
        setPermissionBlocked(true);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#6c83a8]">Customer Dashboard</p>
          <h1 className="text-3xl font-semibold text-[#1f2d45]">Overview</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void loadDashboard()}
            disabled={loading}
            className="rounded-lg border border-[#d4dced] px-3 py-2 text-sm text-[#2a3d5f] hover:bg-[#f6f9ff] disabled:opacity-60"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </header>

      {error ? (
        <p className="rounded-lg border border-[#f0c7cf] bg-[#fff2f4] px-3 py-2 text-sm text-[#b63d51]">{error}</p>
      ) : null}
      {permissionBlocked ? (
        <div className="rounded-lg border border-[#f2dfad] bg-[#fff9ea] px-3 py-3 text-sm text-[#835f12]">
          This switched session cannot access customer dashboard summary. Use `Assessment`/`Access`, or click `Return to
          Admin`.
          <div className="mt-2 flex gap-2">
            <Link href="/assessment" className="rounded-md border border-[#e4d2a0] px-2 py-1 text-xs hover:bg-[#fff2ce]">
              Go to Assessment
            </Link>
            <Link href="/access" className="rounded-md border border-[#e4d2a0] px-2 py-1 text-xs hover:bg-[#fff2ce]">
              Go to Access
            </Link>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-[#345793] bg-[#0d1d3a] p-5">
          <p className="text-sm text-[#97a5bb]">Paid checklists</p>
          <p className="mt-2 text-3xl font-semibold text-white">{summary?.paid_checklists_count ?? (loading ? '...' : 0)}</p>
        </article>
        <article className="rounded-2xl border border-[#345793] bg-[#0d1d3a] p-5">
          <p className="text-sm text-[#97a5bb]">Active assessments</p>
          <p className="mt-2 text-3xl font-semibold text-white">
            {summary?.active_assessments_count ?? (loading ? '...' : 0)}
          </p>
        </article>
        <article className="rounded-2xl border border-[#345793] bg-[#0d1d3a] p-5">
          <p className="text-sm text-[#97a5bb]">Submitted assessments</p>
          <p className="mt-2 text-3xl font-semibold text-white">
            {summary?.submitted_assessments_count ?? (loading ? '...' : 0)}
          </p>
        </article>
        <article className="rounded-2xl border border-[#345793] bg-[#0d1d3a] p-5">
          <p className="text-sm text-[#97a5bb]">Latest report status</p>
          <p className="mt-2 text-xl font-semibold text-white">{summary?.latest_report_status ?? (loading ? '...' : 'n/a')}</p>
        </article>
      </div>

      {summary?.generated_at ? (
        <p className="text-xs text-[#607594]">Last generated at: {new Date(summary.generated_at).toLocaleString()}</p>
      ) : null}

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#1f2d45]">Reports</h2>
          {reports.length > 0 && (
            <Link
              href="/reports"
              className="rounded-lg border border-[#d4dced] px-3 py-1.5 text-xs font-semibold text-[#2a3d5f] hover:bg-[#f6f9ff]"
            >
              View All Reports
            </Link>
          )}
        </div>


        {reports.some((report) => report.status === 'approved') ? (
          <p className="text-xs text-[#607594]">
            Approved reports are waiting for publication. Only published reports appear here for customers.
          </p>
        ) : null}
        {!reports.length ? (
          <p className="rounded-xl border border-[#dbe4f4] bg-white p-4 text-sm text-[#607594] shadow-sm">
            {loading ? 'Loading reports…' : 'No reports available yet. Reports will appear here after your assessments are reviewed and approved.'}
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[#dbe4f4] bg-white shadow-sm">
            <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-[#eef2fa] bg-[#f7f9fe] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#607594]">
              <span>Assessment</span>
              <span className="text-right">Status</span>
            </div>
            <ul className="divide-y divide-[#eef2fa]">
              {reports.filter((report) => report.status === 'published').slice(0, 5).map((report) => (
                <li key={report.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#1f2d45]">Report for Assessment</p>
                    <p className="mt-0.5 truncate text-xs text-[#607594]">
                      {report.status === 'published' ? 'Published' : 
                       report.status === 'approved' ? 'Approved' :
                       report.status === 'under_review' ? 'Under Review' :
                       report.status === 'changes_requested' ? 'Changes Requested' : 'Draft'}
                      {' • '}
                      {report.approved_at ? `Approved ${new Date(report.approved_at).toLocaleDateString()}` : 
                       report.reviewed_at ? `Reviewed ${new Date(report.reviewed_at).toLocaleDateString()}` :
                       report.draft_generated_at ? `Generated ${new Date(report.draft_generated_at).toLocaleDateString()}` : 'Recent'}
                    </p>
                  </div>
                  <Link
                    href={`/reports/${report.id}` as any}
                    className="shrink-0 rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#223657]"
                  >
                    View Report
                  </Link>
                </li>
              ))}
              {!reports.filter((report) => report.status === 'published').length ? (
                <li className="px-4 py-3 text-sm text-[#607594]">No published reports yet.</li>
              ) : null}
            </ul>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#1f2d45]">Assessments</h2>
          <Link
            href="/access"
            className="rounded-lg border border-[#d4dced] px-3 py-1.5 text-xs font-semibold text-[#2a3d5f] hover:bg-[#f6f9ff]"
          >
            Manage access
          </Link>
        </div>

        {!assessments.length ? (
          <p className="rounded-xl border border-[#dbe4f4] bg-white p-4 text-sm text-[#607594] shadow-sm">
            {loading ? 'Loading assessments…' : 'No assessments found yet.'}
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[#dbe4f4] bg-white shadow-sm">
            <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-[#eef2fa] bg-[#f7f9fe] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#607594]">
              <span>Checklist</span>
              <span className="text-right">Action</span>
            </div>
            <ul className="divide-y divide-[#eef2fa]">
              {assessments.slice(0, 20).map((item) => (
                <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#1f2d45]">{item.checklist_title}</p>
                    <p className="mt-0.5 truncate text-xs text-[#607594]">
                      {formatStatusLabel(item.status)} • {item.completion_percent}% • last activity{' '}
                      {item.last_activity ? new Date(item.last_activity).toLocaleString() : 'n/a'}
                    </p>
                  </div>
                  {item.status === 'submitted' ? (
                    <span className="shrink-0 rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-1.5 text-xs font-semibold text-[#2a3d5f]">
                      Submitted
                    </span>
                  ) : (
                    <Link
                      className="shrink-0 rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-1.5 text-xs font-semibold text-white"
                      href={`/assessment?checklist_id=${encodeURIComponent(item.checklist_id)}`}
                    >
                      Open
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {enhanced ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[#1f2d45]">Your assessments</h2>
            <p className="text-xs text-[#607594]">Updated: {new Date(enhanced.generated_at).toLocaleString()}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-xl border border-[#dbe4f4] bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[#243555]">Active</h3>
              {enhanced.active_assessments?.length ? (
                <ul className="mt-3 space-y-2 text-sm text-[#3f5677]">
                  {enhanced.active_assessments.slice(0, 5).map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[#1f2d45]">{item.checklist_title}</p>
                        <p className="truncate text-xs text-[#607594]">
                          {formatStatusLabel(item.status)} • {item.completion_percent}% • expires{' '}
                          {item.expires_at ? new Date(item.expires_at).toLocaleDateString() : 'n/a'}
                        </p>
                      </div>
                      <Link
                        className="shrink-0 rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-1.5 text-xs font-semibold text-white"
                        href={`/assessment?checklist_id=${encodeURIComponent(item.checklist_id)}`}
                      >
                        Open
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-[#607594]">No active assessments yet.</p>
              )}
            </article>

            <article className="rounded-xl border border-[#dbe4f4] bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[#243555]">Expiring soon</h3>
              {enhanced.expiring_soon?.length ? (
                <ul className="mt-3 space-y-2 text-sm text-[#3f5677]">
                  {enhanced.expiring_soon.slice(0, 5).map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[#1f2d45]">{item.checklist_title}</p>
                        <p className="truncate text-xs text-[#607594]">
                          {item.days_until_expiry ?? 'n/a'} days left • {formatStatusLabel(item.status)} • {item.completion_percent}%
                        </p>
                      </div>
                      <Link
                        className="shrink-0 rounded-lg border border-[#d4dced] px-3 py-1.5 text-xs font-semibold text-[#2a3d5f] hover:bg-[#f6f9ff]"
                        href={`/access?checklist_id=${encodeURIComponent(item.checklist_id)}`}
                      >
                        View
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-[#607594]">Nothing expiring in the next week.</p>
              )}
            </article>
          </div>
        </section>
      ) : null}
    </section>
  );
}