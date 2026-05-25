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
      <header className="rounded-3xl border border-[#cfe0ff] bg-[linear-gradient(135deg,#f6fbff_0%,#edf5ff_55%,#e9f1ff_100%)] p-7 shadow-[0_20px_50px_rgba(52,108,194,0.12)]">
        <p className="text-xs uppercase tracking-[0.25em] text-[#4d73af]">Customer Dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold text-[#14335f]">Overview</h1>
        <p className="mt-2 text-sm text-[#49658d]">Use Audit to manage purchased checklists, progress, performance, and report access.</p>
      </header>

      {error ? <p className="rounded-xl border border-[#f6d2d9] bg-[#fff6f8] px-3 py-2 text-sm text-[#b63d51]">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-[#d6e6ff] bg-[#fcfeff] p-5 shadow-[0_12px_28px_rgba(42,93,176,0.08)]">
          <p className="text-sm text-[#5e7aa3]">Purchased checklists</p>
          <p className="mt-2 text-3xl font-semibold text-[#14335f]">{loading ? '...' : summary?.paid_checklists_count ?? 0}</p>
        </article>
        <article className="rounded-2xl border border-[#d6e6ff] bg-[#fcfeff] p-5 shadow-[0_12px_28px_rgba(42,93,176,0.08)]">
          <p className="text-sm text-[#5e7aa3]">Active assessments</p>
          <p className="mt-2 text-3xl font-semibold text-[#14335f]">{loading ? '...' : summary?.active_assessments_count ?? 0}</p>
        </article>
        <article className="rounded-2xl border border-[#d6e6ff] bg-[#fcfeff] p-5 shadow-[0_12px_28px_rgba(42,93,176,0.08)]">
          <p className="text-sm text-[#5e7aa3]">Submitted assessments</p>
          <p className="mt-2 text-3xl font-semibold text-[#14335f]">{loading ? '...' : summary?.submitted_assessments_count ?? 0}</p>
        </article>
        <article className="rounded-2xl border border-[#d6e6ff] bg-[#fcfeff] p-5 shadow-[0_12px_28px_rgba(42,93,176,0.08)]">
          <p className="text-sm text-[#5e7aa3]">Published reports</p>
          <p className="mt-2 text-3xl font-semibold text-[#14335f]">{loading ? '...' : publishedReportsCount}</p>
        </article>
      </div>

      <div className="rounded-2xl border border-[#d6e6ff] bg-[#fcfeff] p-5 shadow-[0_12px_28px_rgba(42,93,176,0.08)]">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/access"
            className="rounded-lg border border-[#2d69bf] bg-[linear-gradient(135deg,#2f77da,#245db2)] px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(37,99,235,0.25)] hover:brightness-110"
          >
            Open Audit Workspace
          </Link>
          <Link
            href="/reports"
            className="rounded-lg border border-[#c7d9f8] bg-[#f4f8ff] px-4 py-2 text-sm font-semibold text-[#28558e] hover:bg-[#eaf2ff]"
          >
            View Reports
          </Link>
        </div>
      </div>
    </section>
  );
}
