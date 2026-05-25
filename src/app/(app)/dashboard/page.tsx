'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getCustomerDashboardSummary,
  type CustomerDashboardSummary,
} from '@/lib/dashboard';
import { listCustomerAssessments, type CustomerAssessmentListItem } from '@/lib/customer-assessments';
import { getCustomerReports, type CustomerReportSummary } from '@/lib/reports';
import { translate, useLocale } from '@/lib/i18n';
import { customerDashboardMessages } from '@/locales/customer-dashboard';

export default function DashboardPage() {
  const { locale } = useLocale();
  const t = (key: string) => translate(customerDashboardMessages, locale, key);
  const [summary, setSummary] = useState<CustomerDashboardSummary | null>(null);
  const [assessments, setAssessments] = useState<CustomerAssessmentListItem[]>([]);
  const [reports, setReports] = useState<CustomerReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [permissionBlocked, setPermissionBlocked] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'not_started' | 'in_progress' | 'submitted' | 'closed' | 'expired'>('all');

  const reportByAssessmentId = new Map(reports.map((report) => [report.assessment_id, report]));
  const publishedReports = reports.filter((report) => report.status === 'published');

  const filteredAssessments = assessments.filter((item) => {
    const matchesSearch =
      search.trim().length === 0 ||
      item.checklist_title.toLowerCase().includes(search.trim().toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  function getStatusTone(status: CustomerAssessmentListItem['status']) {
    if (status === 'in_progress') return 'border-sky-400/40 bg-sky-500/10 text-sky-300';
    if (status === 'submitted' || status === 'closed') return 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300';
    if (status === 'expired') return 'border-amber-400/40 bg-amber-500/10 text-amber-300';
    return 'border-slate-400/30 bg-slate-500/10 text-slate-300';
  }

  function getStatusLabel(status: CustomerAssessmentListItem['status']) {
    if (status === 'not_started') return t('status.not_started');
    if (status === 'in_progress') return t('status.in_progress');
    if (status === 'submitted') return t('status.submitted');
    if (status === 'closed') return t('status.closed');
    if (status === 'expired') return t('status.expired');
    return status;
  }

  async function loadDashboard() {
    setLoading(true);
    setError('');
    setPermissionBlocked(false);
    try {
      const [summaryResponse, assessmentsResponse, reportsResponse] = await Promise.all([
        getCustomerDashboardSummary(),
        listCustomerAssessments({ sort_by: 'updated_at', sort_order: 'desc', limit: 200 }).catch(() => null),
        getCustomerReports().catch(() => []),
      ]);
      setSummary(summaryResponse);
      setAssessments(assessmentsResponse?.assessments ?? []);
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
      <header className="relative overflow-hidden rounded-3xl border border-[#1f3a62] bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.22),transparent_40%),linear-gradient(180deg,#0b1b33,#081427)] px-6 py-8 text-[#eaf2ff] shadow-[0_24px_60px_rgba(3,12,28,0.45)]">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-[#8fbaff]">{t('title.kicker')}</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">{t('title')}</h1>
            <p className="mt-2 max-w-2xl text-sm text-[#a7bfdc]">{t('title.subtitle')}</p>
          </div>
          <button
            type="button"
            onClick={() => void loadDashboard()}
            disabled={loading}
            className="rounded-xl border border-[#2d4f83] bg-[#182843] px-4 py-2 text-sm font-semibold text-white hover:bg-[#223657] disabled:opacity-60"
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
              {t('permission.goAudit')}
            </Link>
            <Link href="/access" className="rounded-md border border-[#e4d2a0] px-2 py-1 text-xs hover:bg-[#fff2ce]">
              {t('permission.goAudit')}
            </Link>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-[#254777] bg-[#0d1d3a] p-5 shadow-[0_14px_28px_rgba(3,12,28,0.3)]">
          <p className="text-sm text-[#97a5bb]">{t('kpi.purchasedAudits')}</p>
          <p className="mt-2 text-3xl font-semibold text-white">{summary?.paid_checklists_count ?? (loading ? '...' : 0)}</p>
        </article>
        <article className="rounded-2xl border border-[#254777] bg-[#0d1d3a] p-5 shadow-[0_14px_28px_rgba(3,12,28,0.3)]">
          <p className="text-sm text-[#97a5bb]">{t('kpi.activeAudits')}</p>
          <p className="mt-2 text-3xl font-semibold text-white">
            {summary?.active_assessments_count ?? (loading ? '...' : 0)}
          </p>
        </article>
        <article className="rounded-2xl border border-[#254777] bg-[#0d1d3a] p-5 shadow-[0_14px_28px_rgba(3,12,28,0.3)]">
          <p className="text-sm text-[#97a5bb]">{t('kpi.completedAudits')}</p>
          <p className="mt-2 text-3xl font-semibold text-white">
            {summary?.submitted_assessments_count ?? (loading ? '...' : 0)}
          </p>
        </article>
        <article className="rounded-2xl border border-[#254777] bg-[#0d1d3a] p-5 shadow-[0_14px_28px_rgba(3,12,28,0.3)]">
          <p className="text-sm text-[#97a5bb]">{t('kpi.publishedReports')}</p>
          <p className="mt-2 text-3xl font-semibold text-white">{publishedReports.length}</p>
        </article>
      </div>

      {summary?.generated_at ? (
        <p className="text-xs text-[#607594]">
          {t('meta.lastGeneratedAt').replace('{date}', new Date(summary.generated_at).toLocaleString())}
        </p>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#1f2d45]">{t('sections.audits')}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('filters.search')}
              className="rounded-xl border border-[#d4dced] bg-white px-3 py-1.5 text-sm text-[#2a3d5f] outline-none focus:border-[#4b78ba]"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
              className="rounded-xl border border-[#d4dced] bg-white px-3 py-1.5 text-sm text-[#2a3d5f] outline-none focus:border-[#4b78ba]"
            >
              <option value="all">{t('filters.all')}</option>
              <option value="not_started">{t('filters.not_started')}</option>
              <option value="in_progress">{t('filters.in_progress')}</option>
              <option value="submitted">{t('filters.submitted')}</option>
              <option value="closed">{t('filters.closed')}</option>
              <option value="expired">{t('filters.expired')}</option>
            </select>
          </div>
          <Link
            href="/access"
            className="rounded-lg border border-[#d4dced] px-3 py-1.5 text-xs font-semibold text-[#2a3d5f] hover:bg-[#f6f9ff]"
          >
            {t('actions.manageAudit')}
          </Link>
        </div>

        {!filteredAssessments.length ? (
          <p className="rounded-xl border border-[#dbe4f4] bg-white p-4 text-sm text-[#607594] shadow-sm">
            {loading ? t('loading.audits') : t('empty.audits')}
          </p>
        ) : (
          <div className="space-y-4">
            {filteredAssessments.map((item) => {
              const report = reportByAssessmentId.get(item.id);
              const publishedAtRaw = report?.final_pdf_published_at ?? null;
              const publishedAtMs = publishedAtRaw ? Date.parse(publishedAtRaw) : NaN;
              const retentionEndsAtMs = Number.isFinite(publishedAtMs)
                ? publishedAtMs + 48 * 60 * 60 * 1000
                : NaN;
              const isPrivacyExpired = Number.isFinite(retentionEndsAtMs)
                ? Date.now() >= retentionEndsAtMs
                : false;
              const canViewPerformance = !isPrivacyExpired && (item.status === 'submitted' || item.status === 'closed');
              const publishedReportId =
                report?.status === 'published'
                  ? report.id
                  : item.report_status === 'published' && item.report_id
                  ? item.report_id
                  : null;

              return (
                <article
                  key={item.id}
                  className="rounded-2xl border border-[#1e2d4a] bg-[linear-gradient(160deg,rgba(17,24,39,0.94),rgba(10,15,30,0.96))] p-5 text-[#eaf2ff] shadow-[0_20px_40px_rgba(3,12,28,0.35)]"
                >
                  <div className="grid gap-4 lg:grid-cols-[1fr_250px]">
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-white">{item.checklist_title}</h3>
                        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusTone(item.status)}`}>
                          {getStatusLabel(item.status)}
                        </span>
                      </div>
                      <div>
                        <div className="mb-1.5 flex items-center justify-between text-xs text-[#9cb0cc]">
                          <span>{t('labels.progress')}</span>
                          <span className="font-semibold text-[#eaf2ff]">{item.completion_percent}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-[#2a3955]">
                          <div
                            className="h-full rounded-full bg-[linear-gradient(90deg,#2563eb,#3b82f6)]"
                            style={{ width: `${Math.min(Math.max(item.completion_percent, 0), 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-xs text-[#9cb0cc]">
                        {t('labels.lastActivity')}{' '}
                        {item.last_activity ? new Date(item.last_activity).toLocaleString() : t('labels.na')}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 lg:items-end">
                      {item.status === 'not_started' ? (
                        <Link
                          href={`/access?checklist_id=${encodeURIComponent(item.checklist_id)}`}
                          className="w-full rounded-lg bg-[#2563eb] px-3 py-2 text-center text-sm font-semibold text-white hover:bg-[#1d4ed8] lg:w-auto lg:min-w-[170px]"
                        >
                          {t('actions.startAudit')}
                        </Link>
                      ) : (
                        <Link
                          href={`/assessment?checklist_id=${encodeURIComponent(item.checklist_id)}&assessment_id=${encodeURIComponent(item.id)}`}
                          className="w-full rounded-lg bg-[#2563eb] px-3 py-2 text-center text-sm font-semibold text-white hover:bg-[#1d4ed8] lg:w-auto lg:min-w-[170px]"
                        >
                          {t('actions.continueAudit')}
                        </Link>
                      )}

                      {canViewPerformance ? (
                        <Link
                          href={`/assessment?checklist_id=${encodeURIComponent(item.checklist_id)}&assessment_id=${encodeURIComponent(item.id)}&view=performance`}
                          className="w-full rounded-lg border border-[#325689] bg-[#14233d] px-3 py-2 text-center text-sm font-semibold text-[#d8e6ff] hover:bg-[#1c3153] lg:w-auto lg:min-w-[170px]"
                        >
                          {t('actions.viewPerformance')}
                        </Link>
                      ) : null}

                      {publishedReportId ? (
                        <Link
                          href={`/reports/${publishedReportId}` as any}
                          className="w-full rounded-lg border border-[#1f7a46] bg-[#133323] px-3 py-2 text-center text-sm font-semibold text-[#ccffd8] hover:bg-[#16412a] lg:w-auto lg:min-w-[170px]"
                        >
                          {t('actions.viewReport')}
                        </Link>
                      ) : null}

                      {isPrivacyExpired ? (
                        <span className="text-[11px] text-[#f6c46d]">{t('assessment.privacyDeletedHint')}</span>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
}