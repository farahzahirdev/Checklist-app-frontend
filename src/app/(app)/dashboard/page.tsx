'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getCustomerDashboardSummary, type CustomerDashboardSummary } from '@/lib/dashboard';
import { getCustomerReports, type CustomerReportSummary } from '@/lib/reports';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState<CustomerDashboardSummary | null>(null);
  const [reports, setReports] = useState<CustomerReportSummary[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [summaryResponse, reportsResponse] = await Promise.all([
          getCustomerDashboardSummary(),
          getCustomerReports().catch(() => []),
        ]);
        if (!mounted) return;
        setSummary(summaryResponse);
        setReports(reportsResponse);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load overview.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const publishedReportsCount = useMemo(
    () => reports.filter((report) => report.status === 'published').length,
    [reports],
  );

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-[#dbe4f4] bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.25em] text-[#6c83a8]">Customer Dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold text-[#1f2d45]">Overview</h1>
        <p className="mt-2 text-sm text-[#607594]">Use Audit to manage purchased checklists, progress, performance, and report access.</p>
      </header>

      {error ? <p className="rounded-lg border border-[#f0c7cf] bg-[#fff2f4] px-3 py-2 text-sm text-[#b63d51]">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-[#dbe4f4] bg-white p-5 shadow-sm">
          <p className="text-sm text-[#607594]">Purchased checklists</p>
          <p className="mt-2 text-3xl font-semibold text-[#1f2d45]">{loading ? '...' : summary?.paid_checklists_count ?? 0}</p>
        </article>
        <article className="rounded-2xl border border-[#dbe4f4] bg-white p-5 shadow-sm">
          <p className="text-sm text-[#607594]">Active assessments</p>
          <p className="mt-2 text-3xl font-semibold text-[#1f2d45]">{loading ? '...' : summary?.active_assessments_count ?? 0}</p>
        </article>
        <article className="rounded-2xl border border-[#dbe4f4] bg-white p-5 shadow-sm">
          <p className="text-sm text-[#607594]">Submitted assessments</p>
          <p className="mt-2 text-3xl font-semibold text-[#1f2d45]">{loading ? '...' : summary?.submitted_assessments_count ?? 0}</p>
        </article>
        <article className="rounded-2xl border border-[#dbe4f4] bg-white p-5 shadow-sm">
          <p className="text-sm text-[#607594]">Published reports</p>
          <p className="mt-2 text-3xl font-semibold text-[#1f2d45]">{loading ? '...' : publishedReportsCount}</p>
        </article>
      </div>

      <div className="rounded-2xl border border-[#dbe4f4] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/access"
            className="rounded-lg border border-[#2d4f83] bg-[#182843] px-4 py-2 text-sm font-semibold text-white hover:bg-[#223657]"
          >
            Open Audit Workspace
          </Link>
          <Link
            href="/reports"
            className="rounded-lg border border-[#d4dced] px-4 py-2 text-sm font-semibold text-[#2a3d5f] hover:bg-[#f6f9ff]"
          >
            View Reports
          </Link>
        </div>
      </div>
    </section>
  );
}
