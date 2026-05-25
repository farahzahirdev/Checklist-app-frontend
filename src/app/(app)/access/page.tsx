'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { listCustomerAssessments, type CustomerAssessmentListItem } from '@/lib/customer-assessments';
import { getCustomerReports, type CustomerReportSummary } from '@/lib/reports';
import { startAssessment } from '@/lib/assessment';
import { translate, useLocale } from '@/lib/i18n';
import { customerAccessMessages } from '@/locales/customer-access';

type StatusFilter = 'all' | 'not_started' | 'in_progress' | 'submitted' | 'closed' | 'expired';

function statusBadgeClass(status: string) {
  if (status === 'in_progress') return 'border-sky-300/40 bg-sky-400/15 text-sky-300';
  if (status === 'not_started') return 'border-emerald-300/40 bg-emerald-400/15 text-emerald-300';
  if (status === 'submitted' || status === 'closed') return 'border-slate-300/30 bg-slate-300/20 text-slate-200';
  return 'border-amber-300/40 bg-amber-400/15 text-amber-300';
}

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export default function AccessPage() {
  const { locale } = useLocale();
  const t = (key: string, values?: Record<string, string>) => translate(customerAccessMessages, locale, key, values);

  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [assessments, setAssessments] = useState<CustomerAssessmentListItem[]>([]);
  const [reports, setReports] = useState<CustomerReportSummary[]>([]);

  const reportByAssessmentId = useMemo(() => new Map(reports.map((report) => [report.assessment_id, report])), [reports]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [assessmentResponse, reportResponse] = await Promise.all([
        listCustomerAssessments({ sort_by: 'updated_at', sort_order: 'desc', limit: 200 }),
        getCustomerReports().catch(() => []),
      ]);
      setAssessments(assessmentResponse.assessments ?? []);
      setReports(reportResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.load'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    return assessments.filter((item) => {
      const searchTerm = search.trim().toLowerCase();
      const matchesSearch =
        !searchTerm ||
        item.checklist_title.toLowerCase().includes(searchTerm) ||
        item.checklist_type_code.toLowerCase().includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [assessments, search, statusFilter]);

  const activeCount = useMemo(
    () => assessments.filter((item) => item.status === 'in_progress' || item.status === 'not_started').length,
    [assessments],
  );
  const readyToStartCount = useMemo(() => assessments.filter((item) => item.status === 'not_started').length, [assessments]);
  const inProgressCount = useMemo(() => assessments.filter((item) => item.status === 'in_progress').length, [assessments]);
  const publishedReportsCount = useMemo(
    () => reports.filter((report) => report.status === 'published').length,
    [reports],
  );

  const recentActivity = useMemo(
    () =>
      assessments
        .filter((item) => item.last_activity)
        .slice(0, 4)
        .map((item) => ({
          id: item.id,
          title: item.checklist_title,
          status: item.status,
          time: item.last_activity ? new Date(item.last_activity).toLocaleString() : '-',
        })),
    [assessments],
  );

  async function handleStart(item: CustomerAssessmentListItem) {
    setStartingId(item.id);
    setError('');
    try {
      await startAssessment({ checklist_id: item.checklist_id });
      window.location.href = `/assessment?checklist_id=${encodeURIComponent(item.checklist_id)}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.start'));
    } finally {
      setStartingId('');
    }
  }

  return (
    <section className="-m-4 bg-[#0a0f1e] text-[#f1f5f9] md:-m-5">
      <div className="border-b border-[#1e2d4a] bg-[linear-gradient(180deg,#0a1628_0%,#0a0f1e_100%)] px-6 py-10 md:px-8">
        <div className="mx-auto max-w-[1280px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#3b82f6]">{t('title.kicker')}</p>
          <h1 className="mt-2 text-4xl font-bold tracking-[-0.02em] text-[#f1f5f9]">{t('title')}</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#94a3b8]">{t('title.subtitle')}</p>
        </div>
      </div>

      <div className="border-b border-[#1e2d4a] bg-[rgba(10,15,30,0.6)]">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
          <div className="border-r border-[#1e2d4a] px-6 py-5">
            <div className="text-sm font-semibold text-[#f1f5f9]">{t('stats.activeAudits')}</div>
            <div className="mt-1 text-3xl font-bold">{activeCount}</div>
            <div className="text-xs text-[#64748b]">{t('stats.activeSub')}</div>
          </div>
          <div className="border-r border-[#1e2d4a] px-6 py-5">
            <div className="text-sm font-semibold text-[#f1f5f9]">{t('stats.readyToStart')}</div>
            <div className="mt-1 text-3xl font-bold">{readyToStartCount}</div>
            <div className="text-xs text-[#64748b]">{t('stats.readySub')}</div>
          </div>
          <div className="border-r border-[#1e2d4a] px-6 py-5">
            <div className="text-sm font-semibold text-[#f1f5f9]">{t('stats.inProgress')}</div>
            <div className="mt-1 text-3xl font-bold">{inProgressCount}</div>
            <div className="text-xs text-[#64748b]">{t('stats.progressSub')}</div>
          </div>
          <div className="px-6 py-5">
            <div className="text-sm font-semibold text-[#f1f5f9]">{t('stats.publishedReports')}</div>
            <div className="mt-1 text-3xl font-bold">{publishedReportsCount}</div>
            <div className="text-xs text-[#64748b]">{t('stats.reportSub')}</div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1280px] gap-8 px-6 py-8 md:px-8 xl:grid-cols-[1fr_280px]">
        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold">{t('section.auditListTitle')}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('filters.searchPlaceholder')}
                className="w-[220px] rounded-lg border border-[#1e2d4a] bg-[#111827] px-3 py-2 text-sm text-[#f1f5f9] placeholder:text-[#64748b] outline-none focus:border-[#2563eb]"
              />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                className="rounded-lg border border-[#1e2d4a] bg-[#111827] px-3 py-2 text-sm text-[#f1f5f9] outline-none focus:border-[#2563eb]"
              >
                <option value="all">{t('filters.all')}</option>
                <option value="not_started">{t('filters.notStarted')}</option>
                <option value="in_progress">{t('filters.inProgress')}</option>
                <option value="submitted">{t('filters.submitted')}</option>
                <option value="closed">{t('filters.closed')}</option>
                <option value="expired">{t('filters.expired')}</option>
              </select>
            </div>
          </div>

          {error ? <p className="mb-3 rounded-lg border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-3 py-2 text-sm text-[#fcd34d]">{error}</p> : null}

          {loading ? (
            <p className="rounded-xl border border-[#1e2d4a] bg-[#111827] px-4 py-3 text-sm text-[#94a3b8]">{t('loading')}</p>
          ) : filtered.length === 0 ? (
            <p className="rounded-xl border border-[#1e2d4a] bg-[#111827] px-4 py-3 text-sm text-[#94a3b8]">{t('empty')}</p>
          ) : (
            <div className="space-y-4">
              {filtered.map((item) => {
                const completion = clampPercent(item.completion_percent);
                const report = reportByAssessmentId.get(item.id);
                const reportId =
                  report?.status === 'published'
                    ? report.id
                    : item.report_status === 'published' && item.report_id
                    ? item.report_id
                    : null;
                const canViewPerformance = item.status === 'submitted' || item.status === 'closed';

                return (
                  <article key={item.id} className="grid gap-5 rounded-2xl border border-[#1e2d4a] bg-[#111827] p-5 lg:grid-cols-[1fr_230px]">
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-[#f1f5f9]">{item.checklist_title}</h3>
                        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusBadgeClass(item.status)}`}>
                          {t(`status.${item.status}`)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[11px] text-[#64748b]">
                        <span className="rounded-md border border-[#1e2d4a] bg-[#0f172a] px-2 py-1">{item.checklist_type_code}</span>
                        <span className="rounded-md border border-[#1e2d4a] bg-[#0f172a] px-2 py-1">{item.checklist_version}</span>
                      </div>
                      <div>
                        <div className="mb-1 flex items-center justify-between text-xs text-[#94a3b8]">
                          <span>{t('labels.progress')}</span>
                          <span className="font-semibold text-[#f1f5f9]">{completion}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-[#1e293b]">
                          <div
                            className={`h-2 rounded-full ${completion >= 100 ? 'bg-[linear-gradient(90deg,#16a34a,#22c55e)]' : 'bg-[linear-gradient(90deg,#2563eb,#3b82f6)]'}`}
                            style={{ width: `${completion}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-xs text-[#94a3b8]">
                        {t('labels.lastUpdated')}: {item.last_activity ? new Date(item.last_activity).toLocaleString() : t('labels.na')}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {item.status === 'not_started' ? (
                        <button
                          type="button"
                          onClick={() => void handleStart(item)}
                          disabled={startingId === item.id}
                          className="rounded-lg bg-[#2563eb] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-60"
                        >
                          {startingId === item.id ? t('actions.processing') : t('actions.startAudit')}
                        </button>
                      ) : (
                        <Link
                          href={`/assessment?checklist_id=${encodeURIComponent(item.checklist_id)}&assessment_id=${encodeURIComponent(item.id)}`}
                          className="rounded-lg bg-[#2563eb] px-3 py-2 text-center text-sm font-semibold text-white hover:bg-[#1d4ed8]"
                        >
                          {t('actions.continueAudit')}
                        </Link>
                      )}

                      {canViewPerformance ? (
                        <Link
                          href={`/assessment?checklist_id=${encodeURIComponent(item.checklist_id)}&assessment_id=${encodeURIComponent(item.id)}&view=performance`}
                          className="rounded-lg border border-[#1e2d4a] bg-[#0f172a] px-3 py-2 text-center text-sm font-medium text-[#cbd5e1] hover:border-[#2563eb] hover:text-white"
                        >
                          {t('actions.viewPerformance')}
                        </Link>
                      ) : null}

                      {reportId ? (
                        <Link
                          href={`/reports/${reportId}` as any}
                          className="rounded-lg border border-[#166534] bg-[#052e16] px-3 py-2 text-center text-sm font-medium text-[#bbf7d0] hover:bg-[#064e1d]"
                        >
                          {t('actions.viewReport')}
                        </Link>
                      ) : null}

                      <Link
                        href={`/assessment?checklist_id=${encodeURIComponent(item.checklist_id)}&assessment_id=${encodeURIComponent(item.id)}`}
                        className="rounded-lg border border-[#1e2d4a] bg-transparent px-3 py-2 text-center text-sm font-medium text-[#94a3b8] hover:border-[#2563eb] hover:text-white"
                      >
                        {t('actions.viewDetails')}
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-xs text-[#64748b]">
            <span>{t('pagination.showing', { count: String(filtered.length), total: String(assessments.length) })}</span>
            <button
              type="button"
              onClick={() => void load()}
              className="rounded-md border border-[#1e2d4a] px-3 py-1.5 text-[#94a3b8] hover:border-[#2563eb] hover:text-white"
            >
              {t('actions.refresh')}
            </button>
          </div>

          <div className="mt-6 grid gap-3 rounded-2xl border border-[#1e2d4a] bg-[#111827] p-5 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <div className="text-sm font-semibold">{t('quick.purchaseTitle')}</div>
              <p className="mt-1 text-xs text-[#64748b]">{t('quick.purchaseDesc')}</p>
              <Link href="/payment" className="mt-2 inline-block text-xs font-semibold text-[#3b82f6] hover:underline">
                {t('quick.open')}
              </Link>
            </div>
            <div>
              <div className="text-sm font-semibold">{t('quick.uploadTitle')}</div>
              <p className="mt-1 text-xs text-[#64748b]">{t('quick.uploadDesc')}</p>
              <Link href="/assessment" className="mt-2 inline-block text-xs font-semibold text-[#3b82f6] hover:underline">
                {t('quick.open')}
              </Link>
            </div>
            <div>
              <div className="text-sm font-semibold">{t('quick.reportsTitle')}</div>
              <p className="mt-1 text-xs text-[#64748b]">{t('quick.reportsDesc')}</p>
              <Link href="/reports" className="mt-2 inline-block text-xs font-semibold text-[#3b82f6] hover:underline">
                {t('quick.open')}
              </Link>
            </div>
            <div>
              <div className="text-sm font-semibold">{t('quick.helpTitle')}</div>
              <p className="mt-1 text-xs text-[#64748b]">{t('quick.helpDesc')}</p>
              <Link href="/support" className="mt-2 inline-block text-xs font-semibold text-[#3b82f6] hover:underline">
                {t('quick.open')}
              </Link>
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-[#1e2d4a] bg-[#111827] p-5">
            <h3 className="text-sm font-bold">{t('workflow.title')}</h3>
            <p className="mt-1 text-xs text-[#64748b]">{t('workflow.subtitle')}</p>
            <ol className="mt-4 space-y-3 text-xs text-[#94a3b8]">
              <li><span className="font-semibold text-[#f1f5f9]">1.</span> {t('workflow.step1')}</li>
              <li><span className="font-semibold text-[#f1f5f9]">2.</span> {t('workflow.step2')}</li>
              <li><span className="font-semibold text-[#f1f5f9]">3.</span> {t('workflow.step3')}</li>
              <li><span className="font-semibold text-[#f1f5f9]">4.</span> {t('workflow.step4')}</li>
              <li><span className="font-semibold text-[#f1f5f9]">5.</span> {t('workflow.step5')}</li>
            </ol>
          </div>

          <div className="rounded-2xl border border-[#1e2d4a] bg-[#111827] p-5">
            <h3 className="text-sm font-bold">{t('activity.title')}</h3>
            <div className="mt-3 space-y-3">
              {recentActivity.length ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="rounded-lg border border-[#1e2d4a] bg-[#0f172a] px-3 py-2">
                    <p className="text-xs font-semibold text-[#f1f5f9]">{activity.title}</p>
                    <p className="text-[11px] text-[#94a3b8]">{t(`status.${activity.status}`)}</p>
                    <p className="text-[11px] text-[#64748b]">{activity.time}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#64748b]">{t('activity.empty')}</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
