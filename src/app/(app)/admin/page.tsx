'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  getAdminActivity,
  getAdminAwaitingReview,
  getAdminDashboardSummary,
  getAdminDistribution,
  getAdminRetention,
  getAdminSystemHealth,
  getAuditorDashboardSummary,
  type AdminActivityItem,
  type AdminAwaitingReviewItem,
  type AdminDashboardSummary,
  type AdminDistribution,
  type AdminRetention,
  type AdminSystemHealth,
  type AuditorDashboardSummary,
} from '@/lib/dashboard';
import { ACCESS_TOKEN_STORAGE_KEY } from '@/lib/auth';
import { useAdminAccess } from '@/lib/admin-access';
import { getReportsList, type ReportListItem } from '@/lib/reports';
import { ADMIN_PAGE_TITLE_CLASS } from '@/app/(app)/admin/admin-page-title';

type AdminDashboardState = {
  summary: AdminDashboardSummary | null;
  awaitingReview: AdminAwaitingReviewItem[];
  activity: AdminActivityItem[];
  reports: ReportListItem[];
  distribution: AdminDistribution | null;
  retention: AdminRetention | null;
  systemHealth: AdminSystemHealth | null;
};

const INITIAL_STATE: AdminDashboardState = {
  summary: null,
  awaitingReview: [],
  activity: [],
  reports: [],
  distribution: null,
  retention: null,
  systemHealth: null,
};

/** Matches checklist list + Users & access KPI tiles */
const kpiCardClass =
  'rounded-2xl border border-[#13305c] bg-[linear-gradient(140deg,#071733_0%,#0c2144_50%,#13356d_100%)] p-4 shadow-sm transition-colors hover:border-[#1f4a8a] sm:hover:-translate-y-0.5 sm:hover:shadow-md';
/** Matches UsersAccessMerged `card` / checklist light surfaces */
const panelCardClass =
  'rounded-2xl border border-[#d4dced] bg-[linear-gradient(160deg,#ffffff_0%,#f3f7ff_100%)] shadow-sm';

export default function AdminDashboardPage() {
  const { isReadOnly } = useAdminAccess();
  const [data, setData] = useState<AdminDashboardState>(INITIAL_STATE);
  const [auditorSummary, setAuditorSummary] = useState<AuditorDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadDashboard() {
    setLoading(true);
    setError('');
    try {
      const accessToken =
        typeof window !== 'undefined' ? window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) : null;
      if (!accessToken) {
        throw new Error('missing_bearer_token');
      }
      if (isReadOnly) {
        const summary = await getAuditorDashboardSummary({ token: accessToken });
        setAuditorSummary(summary);
        setData(INITIAL_STATE);
        return;
      }
      const [summary, awaitingReview, activity, reports, distribution, retention, systemHealth] = await Promise.all([
        getAdminDashboardSummary({ token: accessToken }),
        getAdminAwaitingReview({ token: accessToken }),
        getAdminActivity({ token: accessToken }),
        getReportsList({ limit: 5 }).then((response) => response.reports),
        getAdminDistribution({ token: accessToken }),
        getAdminRetention({ token: accessToken }),
        getAdminSystemHealth({ token: accessToken }),
      ]);
      setData({ summary, awaitingReview, activity, reports, distribution, retention, systemHealth });
      setAuditorSummary(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, [isReadOnly]);

  type SummaryCard = { label: string; value: number | undefined | null | any; href?: string };

  const summaryCards: SummaryCard[] = isReadOnly
    ? [
        { label: 'Reports under review', value: auditorSummary?.reports_under_review },
        { label: 'Changes requested', value: auditorSummary?.reports_changes_requested },
        { label: 'Draft reports waiting', value: auditorSummary?.draft_reports_waiting },
        { label: 'Findings total', value: auditorSummary?.findings_total },
        { label: 'Users total', value: (auditorSummary as any)?.users_total },
        { label: 'Checklists published', value: (auditorSummary as any)?.checklists_published },
        { label: 'Assessments submitted', value: (auditorSummary as any)?.assessments_submitted },
      ]
    : [
        { label: 'Users total', value: data.summary?.users_total },
        { label: 'Customers total', value: data.summary?.customers_total },
        { label: 'Checklists published', value: data.summary?.checklists_published },
        { label: 'Assessments submitted', value: data.summary?.assessments_submitted, href: '/admin/assessments' },
        { label: 'Reports published', value: data.summary?.reports_published, href: '/admin/reports?status=Published' },
        { label: 'Payments succeeded', value: data.summary?.payments_succeeded },
        { label: 'Pending review', value: data.summary?.pending_review, href: '/admin/assessments?status=Awaiting%20Review' },
        { label: 'Expired assessments', value: data.summary?.expired_assessments, href: '/admin/assessments?status=Expired' },
      ];
  const awaitingReviewPreview = data.awaitingReview.slice(0, 4);
  const hasMoreAwaitingReview = data.awaitingReview.length > awaitingReviewPreview.length;
  const distributionItems = [
    {
      key: 'ready',
      label: 'Ready to start',
      value: Number(data.distribution?.ready_to_start ?? 0),
      href: '/admin/assessments?status=Ready%20to%20Start',
      color: '#5b8ff9',
    },
    {
      key: 'progress',
      label: 'In progress',
      value: Number(data.distribution?.in_progress ?? 0),
      href: '/admin/assessments?status=In%20Progress',
      color: '#f6bd6b',
    },
    {
      key: 'review',
      label: 'Waiting for review',
      value: Number(data.distribution?.waiting_for_review ?? 0),
      href: '/admin/assessments?status=Awaiting%20Review',
      color: '#f2cf85',
    },
    {
      key: 'published',
      label: 'Published',
      value: Number(data.distribution?.published ?? 0),
      href: '/admin/reports?status=Published',
      color: '#5fb88d',
    },
    {
      key: 'expired',
      label: 'Expired',
      value: Number(data.distribution?.expired ?? 0),
      href: '/admin/assessments?status=Expired',
      color: '#df5c6d',
    },
  ];
  const distributionTotal = distributionItems.reduce((sum, item) => sum + item.value, 0);
  const donutRadius = 56;
  const donutStroke = 16;
  const donutCircumference = 2 * Math.PI * donutRadius;
  let donutOffset = 0;
  const donutSegments = distributionItems.map((item) => {
    const safeTotal = distributionTotal > 0 ? distributionTotal : 1;
    const segmentLength = (item.value / safeTotal) * donutCircumference;
    const segment = {
      ...item,
      dasharray: `${segmentLength} ${donutCircumference - segmentLength}`,
      dashoffset: -donutOffset,
    };
    donutOffset += segmentLength;
    return segment;
  });

  return (
    <section className="-m-4 space-y-4 bg-[linear-gradient(160deg,#eef3fb_0%,#f8fbff_45%,#eef4ff_100%)] p-4 text-[#1f2d45] md:-m-5 md:p-5">
      <header className="flex items-center justify-between gap-3">
        <h1 className={ADMIN_PAGE_TITLE_CLASS}>{isReadOnly ? 'Auditor Dashboard' : 'Admin Dashboard'}</h1>
        <button
          type="button"
          onClick={() => void loadDashboard()}
          disabled={loading}
          className="rounded-xl border border-[#2d4f83] bg-[#182843] px-4 py-2 text-sm font-semibold text-white hover:bg-[#223657] disabled:opacity-60"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </header>

      {error ? <p className="rounded-xl border border-[#ffccd3] bg-[#fff3f5] px-3 py-2 text-sm text-[#c43e53]">{error}</p> : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) =>
          card.href ? (
            <Link key={card.label} href={card.href as any} className={kpiCardClass}>
              <p className="text-xs uppercase tracking-[0.12em] text-[#9db8e6]">{card.label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{card.value ?? (loading ? '...' : 0)}</p>
            </Link>
          ) : (
            <article key={card.label} className={kpiCardClass}>
              <p className="text-xs uppercase tracking-[0.12em] text-[#9db8e6]">{card.label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{card.value ?? (loading ? '...' : 0)}</p>
            </article>
          ),
        )}
      </div>

      {!isReadOnly ? (
      <div className="grid gap-3 xl:grid-cols-2">
        <article className={`${panelCardClass} overflow-hidden`}>
          <div className="flex items-center justify-between border-b border-[#dbe4f4] px-4 py-3">
            <h2 className="text-xl font-semibold text-[#243555]">Awaiting Review</h2>
            <Link href="/admin/assessments?status=Awaiting%20Review" className="text-xs font-semibold text-[#3e69b0] hover:text-[#274b84]">
              Open full list
            </Link>
          </div>
          <div className="divide-y divide-[#dbe4f4] px-4">
            {data.awaitingReview.length ? (
              awaitingReviewPreview.map((item) => (
                <div key={item.assessment_id} className="py-3 text-sm text-[#2f4264]">
                  <p className="font-semibold text-[#25375a]">{item.customer_email}</p>
                  <p className="text-[#5f7395]">{item.checklist_label}</p>
                  <p className="text-xs text-[#7a8ca8]">{new Date(item.submitted_at).toLocaleString()}</p>
                </div>
              ))
            ) : (
              <p className="py-4 text-sm text-[#6f82a3]">{loading ? 'Loading...' : 'No pending assessments.'}</p>
            )}
            {hasMoreAwaitingReview ? (
              <div className="flex items-center justify-between py-3 text-xs text-[#6f82a3]">
                <span className="tracking-[0.35em]" aria-hidden="true">
                  ...
                </span>
                <span>{data.awaitingReview.length - awaitingReviewPreview.length} more</span>
              </div>
            ) : null}
          </div>
        </article>

        <article className={`${panelCardClass} overflow-hidden`}>
          <div className="border-b border-[#dbe4f4] px-4 py-3">
            <h2 className="text-xl font-semibold text-[#243555]">Recent Activity</h2>
          </div>
          <div className="divide-y divide-[#dbe4f4] px-4">
            {data.activity.length ? (
              data.activity.slice(0, 3).map((item, idx) => (
                <div key={`${item.entity_id}-${idx}`} className="py-3 text-sm text-[#2f4264]">
                  <p className="font-semibold text-[#25375a]">{item.action}</p>
                  <p className="text-[#5f7395]">{item.note || `${item.source} - ${item.entity_type}`}</p>
                  <p className="text-xs text-[#7a8ca8]">{new Date(item.occurred_at).toLocaleString()}</p>
                </div>
              ))
            ) : (
              <p className="py-4 text-sm text-[#6f82a3]">{loading ? 'Loading...' : 'No recent activity.'}</p>
            )}
          </div>
        </article>
      </div>
      ) : (
        <article className={`${panelCardClass} p-4 text-sm text-[#2f4264]`}>
          Auditor dashboard is read-only by design. You can review admin pages, but editing remains admin-only.
        </article>
      )}

      {!isReadOnly ? (
        <article className={`${panelCardClass} overflow-hidden`}>
          <div className="flex items-center justify-between border-b border-[#dbe4f4] px-4 py-3">
            <div>
              <h2 className="text-xl font-semibold text-[#243555]">Reports</h2>
              <p className="text-sm text-[#6f82a3]">Review and publish assessment reports.</p>
            </div>
            <Link href="/admin/reports" className="text-xs font-semibold text-[#3e69b0] hover:text-[#274b84]">
              Open report center
            </Link>
          </div>
          <div className="divide-y divide-[#dbe4f4] px-4">
            {data.reports.length ? (
              data.reports.slice(0, 4).map((report) => (
                <div key={report.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm text-[#2f4264]">
                  <div className="min-w-0">
                    <p className="font-semibold text-[#25375a]">{report.customer_name || report.customer_email}</p>
                    <p className="truncate text-[#5f7395]">{report.checklist_title}</p>
                    <p className="text-xs text-[#7a8ca8]">
                      {report.draft_generated_at ? new Date(report.draft_generated_at).toLocaleString() : 'Recently generated'}
                    </p>
                  </div>
                  <Link
                    href={`/admin/reports/${report.id}` as any}
                    className="shrink-0 rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#223657]"
                  >
                    View Report
                  </Link>
                </div>
              ))
            ) : (
              <p className="px-4 py-4 text-sm text-[#6f82a3]">{loading ? 'Loading...' : 'No reports available yet.'}</p>
            )}
          </div>
        </article>
      ) : null}

      {!isReadOnly ? (
      <div className="grid gap-3 xl:grid-cols-3">
        <article className={`${panelCardClass} p-4`}>
          <h3 className="text-lg font-semibold text-[#243555]">Assessment Status Distribution</h3>
          <div className="mt-3 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative mx-auto h-40 w-40 xl:mx-0">
              <svg viewBox="0 0 160 160" className="h-40 w-40 -rotate-90">
                <circle cx="80" cy="80" r={donutRadius} fill="none" stroke="#e8eef8" strokeWidth={donutStroke} />
                {donutSegments.map((segment) => (
                  <circle
                    key={segment.key}
                    cx="80"
                    cy="80"
                    r={donutRadius}
                    fill="none"
                    stroke={segment.color}
                    strokeWidth={donutStroke}
                    strokeLinecap="round"
                    strokeDasharray={segment.dasharray}
                    strokeDashoffset={segment.dashoffset}
                  />
                ))}
              </svg>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-bold leading-none text-[#1f2d45]">{loading ? '...' : distributionTotal}</span>
                <span className="mt-1 text-sm font-medium text-[#7285a5]">Progress</span>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-[#2f4264]">
              {distributionItems.map((item) => (
                <li key={item.key}>
                  <Link href={item.href as any} className="flex items-center justify-between gap-3 rounded-md px-1 py-0.5 hover:bg-[#edf3ff]">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.label}</span>
                    </span>
                    <span className="min-w-6 text-right font-semibold text-[#1f2d45]">{loading ? '...' : item.value}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </article>

        <article className={`${panelCardClass} p-4`}>
          <h3 className="text-lg font-semibold text-[#243555]">Retention</h3>
          <p className="mt-2 text-sm text-[#2f4264]">Pending purge: {data.retention?.pending_purge_count ?? (loading ? '...' : 0)}</p>
          <p className="text-sm text-[#2f4264]">Recently purged: {data.retention?.recent_purged_count ?? (loading ? '...' : 0)}</p>
        </article>

        <article className={`${panelCardClass} p-4`}>
          <h3 className="text-lg font-semibold text-[#243555]">System Health</h3>
          <p className="mt-2 text-sm text-[#2f4264]">Payments: {data.systemHealth?.payments_status ?? (loading ? '...' : 'unknown')}</p>
          <p className="text-sm text-[#2f4264]">Storage: {data.systemHealth?.storage_status ?? (loading ? '...' : 'unknown')}</p>
          <p className="text-sm text-[#2f4264]">Reports: {data.systemHealth?.reports_status ?? (loading ? '...' : 'unknown')}</p>
        </article>
      </div>
      ) : null}
    </section>
  );
}
