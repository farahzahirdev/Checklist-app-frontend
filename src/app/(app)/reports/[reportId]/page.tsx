'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { CustomerReportExecutiveSection } from '@/components/report/CustomerReportExecutiveSection';
import { CustomerReportFindingsPreviewSection } from '@/components/report/CustomerReportFindingsPreviewSection';
import { CustomerReportPageFooter } from '@/components/report/CustomerReportPageFooter';
import { ReportDashboard } from '@/components/report/report-dashboard';
import {
  getCustomerReport,
  getCustomerReportData,
  type CustomerReportDataResponse,
  type CustomerReportSummary,
} from '@/lib/reports';

export default function CustomerReportPage() {
  const params = useParams();
  const reportId = params.reportId as string;

  const [report, setReport] = useState<CustomerReportSummary | null>(null);
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
      <CustomerReportExecutiveSection data={data} report={report} />

      <CustomerReportFindingsPreviewSection data={data} reportId={reportId} canDownloadPdf={isPublished} />

      {!isPublished ? (
        <p className="rounded-xl border border-[#f2dfad] bg-[#fff9ea] px-4 py-3 text-sm text-[#835f12]">
          This report is approved but not yet published. It will appear on the customer dashboard once the admin publishes it.
        </p>
      ) : null}

      <ReportDashboard data={data} reportId={reportId} />

      <CustomerReportPageFooter />
    </section>
  );
}