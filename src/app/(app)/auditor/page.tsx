'use client';

import { useEffect, useState } from 'react';
import { getAuditorDashboardSummary, type AuditorDashboardSummary } from '@/lib/dashboard';

export default function AuditorDashboardPage() {
  const [summary, setSummary] = useState<AuditorDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadDashboard() {
    setLoading(true);
    setError('');
    try {
      const response = await getAuditorDashboardSummary();
      setSummary(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load auditor dashboard');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#9dc5ff]">Auditor Dashboard</p>
          <h1 className="text-3xl font-semibold text-white">Read-only Overview</h1>
        </div>
        <button
          type="button"
          onClick={() => void loadDashboard()}
          disabled={loading}
          className="rounded-lg border border-[#345793] px-3 py-2 text-sm text-[#d8e2f2] hover:bg-[#1f7bff]/20 disabled:opacity-60"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </header>

      {error ? (
        <p className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-[#345793] bg-[#0d1d3a] p-5">
          <p className="text-sm text-[#97a5bb]">Reports under review</p>
          <p className="mt-2 text-3xl font-semibold text-white">{summary?.reports_under_review ?? (loading ? '...' : 0)}</p>
        </article>
        <article className="rounded-2xl border border-[#345793] bg-[#0d1d3a] p-5">
          <p className="text-sm text-[#97a5bb]">Changes requested</p>
          <p className="mt-2 text-3xl font-semibold text-white">
            {summary?.reports_changes_requested ?? (loading ? '...' : 0)}
          </p>
        </article>
        <article className="rounded-2xl border border-[#345793] bg-[#0d1d3a] p-5">
          <p className="text-sm text-[#97a5bb]">Draft reports waiting</p>
          <p className="mt-2 text-3xl font-semibold text-white">{summary?.draft_reports_waiting ?? (loading ? '...' : 0)}</p>
        </article>
        <article className="rounded-2xl border border-[#345793] bg-[#0d1d3a] p-5">
          <p className="text-sm text-[#97a5bb]">Findings total</p>
          <p className="mt-2 text-3xl font-semibold text-white">{summary?.findings_total ?? (loading ? '...' : 0)}</p>
        </article>
      </div>

      <article className="rounded-2xl border border-[#345793] bg-[#0d1d3a] p-5 text-sm text-[#d8e2f2]">
        Auditor dashboard is read-only by design. Editing checklist, user, payment, and system settings remains admin-only.
      </article>
    </section>
  );
}
