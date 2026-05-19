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
import { getCustomerReports, type CustomerReportSummary } from '@/lib/reports';
import { formatStatusLabel } from '@/lib/status-format';
import { translate, useLocale } from '@/lib/i18n';
import { customerDashboardMessages } from '@/locales/customer-dashboard';

export default function DashboardPage() {
  const { locale } = useLocale();
  const t = (key: string) => translate(customerDashboardMessages, locale, key);
  const [summary, setSummary] = useState<CustomerDashboardSummary | null>(null);
  const [enhanced, setEnhanced] = useState<CustomerDashboardEnhanced | null>(null);
  const [assessments, setAssessments] = useState<CustomerAssessmentListItem[]>([]);
  const [pastAssessments, setPastAssessments] = useState<CustomerAssessmentListItem[]>([]);
  const [reports, setReports] = useState<CustomerReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [permissionBlocked, setPermissionBlocked] = useState(false);

  const reportByAssessmentId = new Map(reports.map((report) => [report.assessment_id, report]));

  async function loadDashboard() {
    setLoading(true);
    setError('');
    setPermissionBlocked(false);
    try {
      const [summaryResponse, enhancedResponse, assessmentsResponse, pastAssessmentsResponse, reportsResponse] = await Promise.all([
        getCustomerDashboardSummary(),
        getCustomerDashboardEnhanced().catch(() => null),
        listCustomerAssessments({ sort_by: 'updated_at', sort_order: 'desc', limit: 20 }).catch(() => null),
        listCustomerAssessments({ status: ['submitted', 'closed', 'expired'], sort_by: 'updated_at', sort_order: 'desc', limit: 20 }).catch(() => null),
        getCustomerReports().catch(() => []),
      ]);
      setSummary(summaryResponse);
      setEnhanced(enhancedResponse);
      setAssessments(assessmentsResponse?.assessments ?? []);
      setPastAssessments(pastAssessmentsResponse?.assessments ?? []);
      setReports(reportsResponse);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('errors.load');
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
          <p className="text-xs uppercase tracking-[0.3em] text-[#6c83a8]">{t('title.kicker')}</p>
          <h1 className="text-3xl font-semibold text-[#1f2d45]">{t('title')}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void loadDashboard()}
            disabled={loading}
            className="rounded-lg border border-[#d4dced] px-3 py-2 text-sm text-[#2a3d5f] hover:bg-[#f6f9ff] disabled:opacity-60"
          >
            {loading ? t('actions.refreshing') : t('actions.refresh')}
          </button>
        </div>
      </header>

      {error ? (
        <p className="rounded-lg border border-[#f0c7cf] bg-[#fff2f4] px-3 py-2 text-sm text-[#b63d51]">{error}</p>
      ) : null}
      {permissionBlocked ? (
        <div className="rounded-lg border border-[#f2dfad] bg-[#fff9ea] px-3 py-3 text-sm text-[#835f12]">
          {t('permission.blocked')}
          <div className="mt-2 flex gap-2">
            <Link href="/assessment" className="rounded-md border border-[#e4d2a0] px-2 py-1 text-xs hover:bg-[#fff2ce]">
              {t('permission.goAssessment')}
            </Link>
            <Link href="/access" className="rounded-md border border-[#e4d2a0] px-2 py-1 text-xs hover:bg-[#fff2ce]">
              {t('permission.goAccess')}
            </Link>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-2xl border border-[#345793] bg-[#0d1d3a] p-5">
          <p className="text-sm text-[#97a5bb]">{t('kpi.paidChecklists')}</p>
          <p className="mt-2 text-3xl font-semibold text-white">{summary?.paid_checklists_count ?? (loading ? '...' : 0)}</p>
        </article>
        <article className="rounded-2xl border border-[#345793] bg-[#0d1d3a] p-5">
          <p className="text-sm text-[#97a5bb]">{t('kpi.activeAssessments')}</p>
          <p className="mt-2 text-3xl font-semibold text-white">
            {summary?.active_assessments_count ?? (loading ? '...' : 0)}
          </p>
        </article>
        <article className="rounded-2xl border border-[#345793] bg-[#0d1d3a] p-5">
          <p className="text-sm text-[#97a5bb]">{t('kpi.submittedAssessments')}</p>
          <p className="mt-2 text-3xl font-semibold text-white">
            {summary?.submitted_assessments_count ?? (loading ? '...' : 0)}
          </p>
        </article>
      </div>

      {summary?.generated_at ? (
        <p className="text-xs text-[#607594]">
          {t('meta.lastGeneratedAt').replace('{date}', new Date(summary.generated_at).toLocaleString())}
        </p>
      ) : null}

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#1f2d45]">{t('sections.reports')}</h2>
          {reports.length > 0 && (
            <Link
              href="/reports"
              className="rounded-lg border border-[#d4dced] px-3 py-1.5 text-xs font-semibold text-[#2a3d5f] hover:bg-[#f6f9ff]"
            >
              {t('actions.viewAllReports')}
            </Link>
          )}
        </div>


        {reports.some((report) => report.status === 'approved') ? (
          <p className="text-xs text-[#607594]">
            {t('reports.approvedWaiting')}
          </p>
        ) : null}
        {!reports.length ? (
          <p className="rounded-xl border border-[#dbe4f4] bg-white p-4 text-sm text-[#607594] shadow-sm">
            {loading ? t('loading.reports') : t('empty.reports')}
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[#dbe4f4] bg-white shadow-sm">
            <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-[#eef2fa] bg-[#f7f9fe] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#607594]">
              <span>{t('table.assessment')}</span>
              <span className="text-right">{t('table.status')}</span>
            </div>
            <ul className="divide-y divide-[#eef2fa]">
              {reports.filter((report) => report.status === 'published').slice(0, 5).map((report) => (
                <li key={report.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#1f2d45]">{t('report.itemTitle')}</p>
                    <p className="mt-0.5 truncate text-xs text-[#607594]">
                      {report.status === 'published' ? t('report.status.published') :
                       report.status === 'approved' ? t('report.status.approved') :
                       report.status === 'under_review' ? t('report.status.under_review') :
                       report.status === 'changes_requested' ? t('report.status.changes_requested') : t('report.status.draft')}
                      {' • '}
                      {report.approved_at ? t('report.meta.approved').replace('{date}', new Date(report.approved_at).toLocaleDateString()) :
                       report.reviewed_at ? t('report.meta.reviewed').replace('{date}', new Date(report.reviewed_at).toLocaleDateString()) :
                       report.draft_generated_at ? t('report.meta.generated').replace('{date}', new Date(report.draft_generated_at).toLocaleDateString()) : t('report.meta.recent')}
                    </p>
                  </div>
                  <Link
                    href={`/reports/${report.id}` as any}
                    className="shrink-0 rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#223657]"
                  >
                    {t('actions.viewReport')}
                  </Link>
                </li>
              ))}
              {!reports.filter((report) => report.status === 'published').length ? (
                <li className="px-4 py-3 text-sm text-[#607594]">{t('empty.publishedReports')}</li>
              ) : null}
            </ul>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#1f2d45]">{t('sections.assessments')}</h2>
          <Link
            href="/access"
            className="rounded-lg border border-[#d4dced] px-3 py-1.5 text-xs font-semibold text-[#2a3d5f] hover:bg-[#f6f9ff]"
          >
            {t('actions.manageAccess')}
          </Link>
        </div>

        {!assessments.length ? (
          <p className="rounded-xl border border-[#dbe4f4] bg-white p-4 text-sm text-[#607594] shadow-sm">
            {loading ? t('loading.assessments') : t('empty.assessments')}
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[#dbe4f4] bg-white shadow-sm">
            <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-[#eef2fa] bg-[#f7f9fe] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#607594]">
              <span>{t('table.checklist')}</span>
              <span className="text-right">{t('table.action')}</span>
            </div>
            <ul className="divide-y divide-[#eef2fa]">
              {assessments.slice(0, 20).map((item) => (
                <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#1f2d45]">{item.checklist_title}</p>
                    <p className="mt-0.5 truncate text-xs text-[#607594]">
                      {formatStatusLabel(item.status)} • {item.completion_percent}% • {t('labels.lastActivity')}{' '}
                      {item.last_activity ? new Date(item.last_activity).toLocaleString() : t('labels.na')}
                    </p>
                  </div>
                  {item.status === 'not_started' ? (
                    <Link
                      className="shrink-0 rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#223657]"
                      href={`/access?checklist_id=${encodeURIComponent(item.checklist_id)}`}
                    >
                      {t('actions.start')}
                    </Link>
                  ) : (
                    <Link
                      className="shrink-0 rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#223657]"
                      href={`/assessment?checklist_id=${encodeURIComponent(item.checklist_id)}&assessment_id=${encodeURIComponent(item.id)}`}
                    >
                      {t('actions.continue')}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {enhanced?.expiring_soon?.length ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1f2d45]">{t('subsections.expiringSoon')}</h2>
          <div className="overflow-hidden rounded-xl border border-[#fde8c8] bg-white shadow-sm">
            <ul className="divide-y divide-[#eef2fa]">
              {enhanced.expiring_soon.slice(0, 5).map((item) => (
                <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#1f2d45]">{item.checklist_title}</p>
                    <p className="truncate text-xs text-[#a05a12]">
                      {t('labels.daysLeft').replace('{days}', String(item.days_until_expiry ?? 0))} • {item.completion_percent}% {t('labels.complete')}
                    </p>
                  </div>
                  <Link
                    className="shrink-0 rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#223657]"
                    href={`/assessment?checklist_id=${encodeURIComponent(item.checklist_id)}&assessment_id=${encodeURIComponent(item.id)}`}
                  >
                    {t('actions.continue')}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#1f2d45]">{t('sections.pastAssessments')}</h2>
        </div>
        <p className="text-xs text-[#835f12]">{t('past.retentionNotice')}</p>
        {!pastAssessments.length ? (
          <p className="rounded-xl border border-[#dbe4f4] bg-white p-4 text-sm text-[#607594] shadow-sm">
            {loading ? t('loading.pastAssessments') : t('empty.pastAssessments')}
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[#dbe4f4] bg-white shadow-sm">
            <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-[#eef2fa] bg-[#f7f9fe] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#607594]">
              <span>{t('table.checklist')}</span>
              <span className="text-right">{t('table.status')}</span>
            </div>
            <ul className="divide-y divide-[#eef2fa]">
              {pastAssessments.slice(0, 20).map((item) => {
                const report = reportByAssessmentId.get(item.id);
                const publishedAtRaw = report?.final_pdf_published_at ?? null;
                const publishedAtMs = publishedAtRaw ? Date.parse(publishedAtRaw) : NaN;
                const retentionEndsAtMs = Number.isFinite(publishedAtMs)
                  ? publishedAtMs + 48 * 60 * 60 * 1000
                  : NaN;
                const isPrivacyExpired = Number.isFinite(retentionEndsAtMs)
                  ? Date.now() >= retentionEndsAtMs
                  : false;
                const canViewPerformance = !isPrivacyExpired && item.status === 'submitted';

                return (
                  <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#1f2d45]">{item.checklist_title}</p>
                      <p className="mt-0.5 truncate text-xs text-[#607594]">
                        {item.submitted_at
                          ? t('labels.submittedOn').replace('{date}', new Date(item.submitted_at).toLocaleDateString())
                          : item.last_activity
                          ? t('labels.lastActivity') + ' ' + new Date(item.last_activity).toLocaleDateString()
                          : t('labels.na')}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {canViewPerformance ? (
                        <Link
                          href={`/assessment?checklist_id=${encodeURIComponent(item.checklist_id)}&assessment_id=${encodeURIComponent(item.id)}&view=performance`}
                          className="shrink-0 rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#223657]"
                        >
                          {t('actions.viewPerformance')}
                        </Link>
                      ) : (
                        <span className="shrink-0 rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-1.5 text-xs font-semibold text-[#607594]">
                          {isPrivacyExpired ? t('assessment.privacyDeleted') : formatStatusLabel(item.report_status ?? item.status)}
                        </span>
                      )}
                      {isPrivacyExpired ? (
                        <span className="text-[11px] text-[#835f12]">{t('assessment.privacyDeletedHint')}</span>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>
    </section>
  );
}