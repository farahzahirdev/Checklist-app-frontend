'use client';

import { useEffect, useState } from 'react';
import {
  getAdminActivity,
  getAdminAwaitingReview,
  getAdminDashboardSummary,
  getAdminDistribution,
  getAdminRetention,
  getAdminSystemHealth,
  type AdminActivityItem,
  type AdminAwaitingReviewItem,
  type AdminDashboardSummary,
  type AdminDistribution,
  type AdminRetention,
  type AdminSystemHealth,
} from '@/lib/dashboard';
import { ACCESS_TOKEN_STORAGE_KEY } from '@/lib/auth';

type AdminDashboardState = {
  summary: AdminDashboardSummary | null;
  awaitingReview: AdminAwaitingReviewItem[];
  activity: AdminActivityItem[];
  distribution: AdminDistribution | null;
  retention: AdminRetention | null;
  systemHealth: AdminSystemHealth | null;
};

const INITIAL_STATE: AdminDashboardState = {
  summary: null,
  awaitingReview: [],
  activity: [],
  distribution: null,
  retention: null,
  systemHealth: null,
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardState>(INITIAL_STATE);
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
      const [summary, awaitingReview, activity, distribution, retention, systemHealth] = await Promise.all([
        getAdminDashboardSummary({ token: accessToken }),
        getAdminAwaitingReview({ token: accessToken }),
        getAdminActivity({ token: accessToken }),
        getAdminDistribution({ token: accessToken }),
        getAdminRetention({ token: accessToken }),
        getAdminSystemHealth({ token: accessToken }),
      ]);
      setData({ summary, awaitingReview, activity, distribution, retention, systemHealth });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  const summaryCards = [
    { label: 'Users total', value: data.summary?.users_total },
    { label: 'Customers total', value: data.summary?.customers_total },
    { label: 'Checklists published', value: data.summary?.checklists_published },
    { label: 'Assessments submitted', value: data.summary?.assessments_submitted },
    { label: 'Reports published', value: data.summary?.reports_published },
    { label: 'Payments succeeded', value: data.summary?.payments_succeeded },
    { label: 'Pending review', value: data.summary?.pending_review },
    { label: 'Expired assessments', value: data.summary?.expired_assessments },
  ] as const;

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-4xl font-semibold tracking-tight text-[#1f2d45]">Admin Dashboard</h1>
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
        {summaryCards.map((card) => (
          <article key={card.label} className="rounded-2xl border border-[#e2e8f5] bg-white px-4 py-3 shadow-sm">
            <p className="text-sm text-[#5b6f91]">{card.label}</p>
            <p className="mt-1 text-2xl font-semibold text-[#273a5a]">{card.value ?? (loading ? '...' : 0)}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <article className="overflow-hidden rounded-2xl border border-[#e2e8f5] bg-white shadow-sm">
          <div className="border-b border-[#ecf0f8] px-4 py-3">
            <h2 className="text-xl font-semibold text-[#243555]">Awaiting Review</h2>
          </div>
          <div className="divide-y divide-[#edf2f9] px-4">
            {data.awaitingReview.length ? (
              data.awaitingReview.slice(0, 8).map((item) => (
                <div key={item.assessment_id} className="py-3 text-sm text-[#2f4264]">
                  <p className="font-semibold text-[#25375a]">{item.customer_email}</p>
                  <p className="text-[#5f7395]">{item.checklist_label}</p>
                  <p className="text-xs text-[#7a8ca8]">{new Date(item.submitted_at).toLocaleString()}</p>
                </div>
              ))
            ) : (
              <p className="py-4 text-sm text-[#6f82a3]">{loading ? 'Loading...' : 'No pending assessments.'}</p>
            )}
          </div>
        </article>

        <article className="overflow-hidden rounded-2xl border border-[#e2e8f5] bg-white shadow-sm">
          <div className="border-b border-[#ecf0f8] px-4 py-3">
            <h2 className="text-xl font-semibold text-[#243555]">Recent Activity</h2>
          </div>
          <div className="divide-y divide-[#edf2f9] px-4">
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

      <div className="grid gap-3 xl:grid-cols-3">
        <article className="rounded-2xl border border-[#e2e8f5] bg-white p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-[#243555]">Distribution</h3>
          <ul className="mt-3 space-y-2 text-sm text-[#2f4264]">
            <li>Ready to start: {data.distribution?.ready_to_start ?? (loading ? '...' : 0)}</li>
            <li>In progress: {data.distribution?.in_progress ?? (loading ? '...' : 0)}</li>
            <li>Waiting review: {data.distribution?.waiting_for_review ?? (loading ? '...' : 0)}</li>
            <li>Published: {data.distribution?.published ?? (loading ? '...' : 0)}</li>
            <li>Expired: {data.distribution?.expired ?? (loading ? '...' : 0)}</li>
          </ul>
        </article>

        <article className="rounded-2xl border border-[#e2e8f5] bg-white p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-[#243555]">Retention</h3>
          <p className="mt-2 text-sm text-[#2f4264]">Pending purge: {data.retention?.pending_purge_count ?? (loading ? '...' : 0)}</p>
          <p className="text-sm text-[#2f4264]">Recently purged: {data.retention?.recent_purged_count ?? (loading ? '...' : 0)}</p>
        </article>

        <article className="rounded-2xl border border-[#e2e8f5] bg-white p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-[#243555]">System Health</h3>
          <p className="mt-2 text-sm text-[#2f4264]">Payments: {data.systemHealth?.payments_status ?? (loading ? '...' : 'unknown')}</p>
          <p className="text-sm text-[#2f4264]">Storage: {data.systemHealth?.storage_status ?? (loading ? '...' : 'unknown')}</p>
          <p className="text-sm text-[#2f4264]">Reports: {data.systemHealth?.reports_status ?? (loading ? '...' : 'unknown')}</p>
        </article>
      </div>
    </section>
  );
}
