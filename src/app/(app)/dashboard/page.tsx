'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCustomerDashboardSummary, type CustomerDashboardSummary } from '@/lib/dashboard';

export default function DashboardPage() {
  const [summary, setSummary] = useState<CustomerDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [permissionBlocked, setPermissionBlocked] = useState(false);

  async function loadDashboard() {
    setLoading(true);
    setError('');
    setPermissionBlocked(false);
    try {
      const response = await getCustomerDashboardSummary();
      setSummary(response);
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
        <button
          type="button"
          onClick={() => void loadDashboard()}
          disabled={loading}
          className="rounded-lg border border-[#d4dced] px-3 py-2 text-sm text-[#2a3d5f] hover:bg-[#f6f9ff] disabled:opacity-60"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
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
    </section>
  );
}