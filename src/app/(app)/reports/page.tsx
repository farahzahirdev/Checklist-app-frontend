"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { getCustomerReports, type ReportResponse } from '@/lib/reports';

const statusLabels: Record<ReportResponse['status'], string> = {
  draft_generated: 'Draft',
  under_review: 'Under Review',
  changes_requested: 'Changes Requested',
  approved: 'Approved',
  published: 'Published',
};

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadReports() {
    setLoading(true);
    setError('');
    try {
      const response = await getCustomerReports();
      setReports(response.filter((report) => report.status === 'published'));
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

  return (
    <section className="space-y-5">
      <header className="rounded-2xl border border-[#dbe4f4] bg-white px-5 py-4 shadow-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-[#6c83a8]">Customer</p>
        <h1 className="mt-2 text-3xl font-semibold text-[#1f2d45]">Reports</h1>
        <p className="mt-1 text-sm text-[#607594]">Only published reports appear here after the admin publishes them.</p>
      </header>

      {error ? <p className="rounded-lg border border-[#f0c7cf] bg-[#fff2f4] px-3 py-2 text-sm text-[#b63d51]">{error}</p> : null}

      {!reports.length ? (
        <p className="rounded-xl border border-[#dbe4f4] bg-white p-4 text-sm text-[#607594] shadow-sm">
          {loading ? 'Loading reports…' : 'No published reports yet. Once an admin publishes a report, it will appear here.'}
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#dbe4f4] bg-white shadow-sm">
          <div className="grid grid-cols-[1.1fr_0.9fr_auto] gap-3 border-b border-[#eef2fa] bg-[#f7f9fe] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#607594]">
            <span>Report</span>
            <span>Status</span>
            <span className="text-right">Open</span>
          </div>
          <ul className="divide-y divide-[#eef2fa]">
            {reports.map((report) => (
              <li key={report.id} className="grid grid-cols-[1.1fr_0.9fr_auto] items-center gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[#1f2d45]">Assessment Report</p>
                  <p className="mt-0.5 truncate text-xs text-[#607594]">
                    Approved {report.approved_at ? new Date(report.approved_at).toLocaleDateString() : 'recently'}
                    {' • '}
                    Published {report.final_pdf_published_at ? new Date(report.final_pdf_published_at).toLocaleDateString() : 'recently'}
                  </p>
                </div>
                <div>
                  <span className="rounded-md bg-[#e9f8ef] px-2 py-1 text-xs font-semibold text-[#2f9960]">
                    {statusLabels[report.status]}
                  </span>
                </div>
                <Link
                  href={`/reports/${report.id}`}
                  className="justify-self-end rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#223657]"
                >
                  View Report
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
