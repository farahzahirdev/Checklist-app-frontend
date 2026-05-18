'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { CustomerReportExecutiveSection } from '@/components/report/CustomerReportExecutiveSection';
import { CustomerReportFindingsPreviewSection } from '@/components/report/CustomerReportFindingsPreviewSection';
import { CustomerReportPageFooter } from '@/components/report/CustomerReportPageFooter';
import { ReportDashboard } from '@/components/report/report-dashboard';
import { getCustomerAssessmentDetail } from '@/lib/customer-assessments';
import {
  getCustomerReport,
  getCustomerReportData,
  type CustomerReportDataResponse,
  type CustomerReportSummary,
} from '@/lib/reports';
import { translate, useLocale } from '@/lib/i18n';
import { customerReportMessages } from '@/locales/customer-report';

export default function CustomerReportPage() {
  const params = useParams();
  const reportId = params.reportId as string;
  const { locale } = useLocale();
  const t = useCallback(
    (key: string, values?: Record<string, string>) => translate(customerReportMessages, locale, key, values),
    [locale]
  );

  const [report, setReport] = useState<CustomerReportSummary | null>(null);
  const [data, setData] = useState<CustomerReportDataResponse | null>(null);
  const [checklistId, setChecklistId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [reportResponse, reportData] = await Promise.all([
        getCustomerReport(reportId),
        getCustomerReportData(reportId),
      ]);
      setReport(reportResponse);
      setData(reportData);
      try {
        const assessmentDetail = await getCustomerAssessmentDetail(reportData.assessment_id);
        setChecklistId(assessmentDetail.checklist_id);
      } catch {
        setChecklistId(null);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('detail.errors.load');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [reportId, t]);

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

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
          {error || t('detail.notFound')}
        </div>
        <Link href="/dashboard" className="text-sm font-semibold text-[#3e69b0] hover:underline">
          {t('detail.backDashboard')}
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
          {t('detail.unpublished')}
        </p>
      ) : null}

      <ReportDashboard data={data} reportId={reportId} checklistId={checklistId} />

      <CustomerReportPageFooter />
    </section>
  );
}
