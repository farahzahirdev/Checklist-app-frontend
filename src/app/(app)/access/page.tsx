'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getCustomerAssessmentsDashboard, listCustomerAssessments, type CustomerAssessmentListItem } from '@/lib/customer-assessments';
import { startAssessment } from '@/lib/assessment';
import { translate, useLocale } from '@/lib/i18n';
import { customerAccessMessages } from '@/locales/customer-access';

type StatusFilter = 'all' | 'not_started' | 'in_progress' | 'submitted' | 'closed' | 'expired';
const PAGE_SIZE = 12;

function statusBadgeClass(status: string) {
  if (status === 'in_progress') return 'border-[#bfdbfe] bg-[#eff6ff] text-[#1e40af]';
  if (status === 'not_started') return 'border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]';
  if (status === 'submitted' || status === 'closed') return 'border-[#dbe4f4] bg-[#f7f9fe] text-[#475569]';
  return 'border-[#fde68a] bg-[#fffbeb] text-[#92400e]';
}

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export default function AccessPage() {
  const { locale } = useLocale();
  const t = (key: string, values?: Record<string, string>) => translate(customerAccessMessages, locale, key, values);
  const loadErrorText = useMemo(
    () => translate(customerAccessMessages, locale, 'errors.load'),
    [locale],
  );
  const startErrorText = useMemo(
    () => translate(customerAccessMessages, locale, 'errors.start'),
    [locale],
  );

  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [totalAssessments, setTotalAssessments] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [readyToStartCount, setReadyToStartCount] = useState(0);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [publishedReportsCount, setPublishedReportsCount] = useState(0);
  const [assessments, setAssessments] = useState<CustomerAssessmentListItem[]>([]);

  const loadPage = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const skip = (page - 1) * PAGE_SIZE;
      const statusParam = statusFilter === 'all' ? undefined : [statusFilter];
      const assessmentResponse = await listCustomerAssessments({
        sort_by: 'updated_at',
        sort_order: 'desc',
        status: statusParam,
        search: debouncedSearch || undefined,
        skip,
        limit: PAGE_SIZE,
      });
      setAssessments(assessmentResponse.assessments ?? []);
      setTotalAssessments(assessmentResponse.total ?? 0);

      const maxPage = Math.max(1, Math.ceil((assessmentResponse.total ?? 0) / PAGE_SIZE));
      if (page > maxPage) {
        setPage(maxPage);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : loadErrorText);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, debouncedSearch, loadErrorText]);

  const loadMeta = useCallback(async () => {
    try {
      const [activeResponse, readyResponse, inProgressResponse, reportResponse] = await Promise.all([
        listCustomerAssessments({ status: ['not_started', 'in_progress'], limit: 1 }).catch(() => ({ total: 0, assessments: [] })),
        listCustomerAssessments({ status: ['not_started'], limit: 1 }).catch(() => ({ total: 0, assessments: [] })),
        listCustomerAssessments({ status: ['in_progress'], limit: 1 }).catch(() => ({ total: 0, assessments: [] })),
        getCustomerAssessmentsDashboard().catch(() => null),
      ]);

      setActiveCount(activeResponse.total ?? 0);
      setReadyToStartCount(readyResponse.total ?? 0);
      setInProgressCount(inProgressResponse.total ?? 0);
      setPublishedReportsCount(reportResponse?.summary?.reports_available ?? 0);
    } catch {
      setActiveCount(0);
      setReadyToStartCount(0);
      setInProgressCount(0);
      setPublishedReportsCount(0);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    void loadPage();
  }, [loadPage]);

  useEffect(() => {
    void loadMeta();
  }, [loadMeta]);

  async function reloadAll() {
    await Promise.all([loadPage(), loadMeta()]);
  }

  const totalPages = Math.max(1, Math.ceil(totalAssessments / PAGE_SIZE));
  const rangeFrom = totalAssessments === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeTo = totalAssessments === 0 ? 0 : Math.min(page * PAGE_SIZE, totalAssessments);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, debouncedSearch]);

  const filtered = assessments;

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

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  async function handleRefreshClick() {
    await reloadAll();
  }

  async function handleStart(item: CustomerAssessmentListItem) {
    setStartingId(item.id);
    setError('');
    try {
      await startAssessment({ checklist_id: item.checklist_id });
      window.location.href = `/assessment?checklist_id=${encodeURIComponent(item.checklist_id)}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : startErrorText);
    } finally {
      setStartingId('');
    }
  }

  return (
    <section className="space-y-6 text-[#1f2d45]">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#6c83a8]">{t('title.kicker')}</p>
          <h1 className="text-3xl font-semibold text-[#1f2d45]">{t('title')}</h1>
          <p className="mt-1 text-sm text-[#607594]">{t('title.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={() => void handleRefreshClick()}
          className="rounded-lg border border-[#d4dced] px-3 py-2 text-sm text-[#2a3d5f] hover:bg-[#f6f9ff]"
        >
          {t('actions.refresh')}
        </button>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-[#dbe4f4] bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-[#243555]">{t('stats.activeAudits')}</div>
          <div className="mt-1 text-3xl font-bold text-[#1f2d45]">{activeCount}</div>
          <div className="text-xs text-[#607594]">{t('stats.activeSub')}</div>
        </article>
        <article className="rounded-2xl border border-[#dbe4f4] bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-[#243555]">{t('stats.readyToStart')}</div>
          <div className="mt-1 text-3xl font-bold text-[#1f2d45]">{readyToStartCount}</div>
          <div className="text-xs text-[#607594]">{t('stats.readySub')}</div>
        </article>
        <article className="rounded-2xl border border-[#dbe4f4] bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-[#243555]">{t('stats.inProgress')}</div>
          <div className="mt-1 text-3xl font-bold text-[#1f2d45]">{inProgressCount}</div>
          <div className="text-xs text-[#607594]">{t('stats.progressSub')}</div>
        </article>
        <article className="rounded-2xl border border-[#dbe4f4] bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-[#243555]">{t('stats.publishedReports')}</div>
          <div className="mt-1 text-3xl font-bold text-[#1f2d45]">{publishedReportsCount}</div>
          <div className="text-xs text-[#607594]">{t('stats.reportSub')}</div>
        </article>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_280px]">
        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold">{t('section.auditListTitle')}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder={t('filters.searchPlaceholder')}
                className="w-[220px] rounded-lg border border-[#d4dced] bg-white px-3 py-2 text-sm text-[#1f2d45] placeholder:text-[#7a8fab] outline-none focus:border-[#2f4f83]"
              />
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value as StatusFilter);
                  setPage(1);
                }}
                className="rounded-lg border border-[#d4dced] bg-white px-3 py-2 text-sm text-[#1f2d45] outline-none focus:border-[#2f4f83]"
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

          {error ? <p className="mb-3 rounded-lg border border-[#f0c7cf] bg-[#fff2f4] px-3 py-2 text-sm text-[#b63d51]">{error}</p> : null}

          {loading ? (
            <p className="rounded-xl border border-[#dbe4f4] bg-white px-4 py-3 text-sm text-[#607594] shadow-sm">{t('loading')}</p>
          ) : filtered.length === 0 ? (
            <p className="rounded-xl border border-[#dbe4f4] bg-white px-4 py-3 text-sm text-[#607594] shadow-sm">{t('empty')}</p>
          ) : (
            <div className="space-y-4">
              {filtered.map((item) => {
                const completion = clampPercent(item.completion_percent);
                const reportId = item.report_status === 'published' && item.report_id ? item.report_id : null;
                const canViewPerformance = item.status === 'submitted' || item.status === 'closed';

                return (
                  <article key={item.id} className="grid gap-5 rounded-2xl border border-[#dbe4f4] bg-white p-5 shadow-sm lg:grid-cols-[1fr_230px]">
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-[#1f2d45]">{item.checklist_title}</h3>
                        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusBadgeClass(item.status)}`}>
                          {t(`status.${item.status}`)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[11px] text-[#607594]">
                        <span className="rounded-md border border-[#dbe4f4] bg-[#f7f9fe] px-2 py-1">{item.checklist_type_code}</span>
                        <span className="rounded-md border border-[#dbe4f4] bg-[#f7f9fe] px-2 py-1">{item.checklist_version}</span>
                      </div>
                      <div>
                        <div className="mb-1 flex items-center justify-between text-xs text-[#607594]">
                          <span>{t('labels.progress')}</span>
                          <span className="font-semibold text-[#1f2d45]">{completion}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-[#e4ebf7]">
                          <div
                            className={`h-2 rounded-full ${completion >= 100 ? 'bg-[linear-gradient(90deg,#1f9d63,#35c58a)]' : 'bg-[linear-gradient(90deg,#2f4f83,#5c7fb8)]'}`}
                            style={{ width: `${completion}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-xs text-[#607594]">
                        {t('labels.lastUpdated')}: {item.last_activity ? new Date(item.last_activity).toLocaleString() : t('labels.na')}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {item.status === 'not_started' ? (
                        <button
                          type="button"
                          onClick={() => void handleStart(item)}
                          disabled={startingId === item.id}
                          className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm font-semibold text-white hover:bg-[#223657] disabled:opacity-60"
                        >
                          {startingId === item.id ? t('actions.processing') : t('actions.startAudit')}
                        </button>
                      ) : (
                        <Link
                          href={`/assessment?checklist_id=${encodeURIComponent(item.checklist_id)}&assessment_id=${encodeURIComponent(item.id)}`}
                          className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-2 text-center text-sm font-semibold text-white hover:bg-[#223657]"
                        >
                          {t('actions.continueAudit')}
                        </Link>
                      )}

                      {canViewPerformance ? (
                        <Link
                          href={`/assessment?checklist_id=${encodeURIComponent(item.checklist_id)}&assessment_id=${encodeURIComponent(item.id)}&view=performance`}
                          className="rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-center text-sm font-medium text-[#4c607d] hover:border-[#2f4f83] hover:bg-[#edf3ff]"
                        >
                          {t('actions.viewPerformance')}
                        </Link>
                      ) : null}

                      {reportId ? (
                        <Link
                          href={`/reports/${reportId}` as any}
                          className="rounded-lg border border-[#8ac8a7] bg-[#ecfbf3] px-3 py-2 text-center text-sm font-medium text-[#1f7a4f] hover:bg-[#dff7ea]"
                        >
                          {t('actions.viewReport')}
                        </Link>
                      ) : null}

                      <Link
                        href={`/assessment?checklist_id=${encodeURIComponent(item.checklist_id)}&assessment_id=${encodeURIComponent(item.id)}`}
                        className="rounded-lg border border-[#d4dced] bg-transparent px-3 py-2 text-center text-sm font-medium text-[#607594] hover:border-[#2f4f83] hover:bg-[#f7f9fe]"
                      >
                        {t('actions.viewDetails')}
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-xs text-[#607594]">
            <span>{t('pagination.showing', { from: String(rangeFrom), to: String(rangeTo), total: String(totalAssessments) })}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1 || loading}
                className="rounded-md border border-[#d4dced] px-3 py-1.5 text-[#4c607d] hover:border-[#2f4f83] hover:bg-[#f7f9fe] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t('pagination.prev')}
              </button>
              <span>{t('pagination.page', { page: String(page), totalPages: String(totalPages) })}</span>
              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page >= totalPages || loading}
                className="rounded-md border border-[#d4dced] px-3 py-1.5 text-[#4c607d] hover:border-[#2f4f83] hover:bg-[#f7f9fe] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t('pagination.next')}
              </button>
              <button
                type="button"
                onClick={() => void handleRefreshClick()}
                className="rounded-md border border-[#d4dced] px-3 py-1.5 text-[#4c607d] hover:border-[#2f4f83] hover:bg-[#f7f9fe]"
              >
                {t('actions.refresh')}
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 rounded-2xl border border-[#dbe4f4] bg-white p-5 shadow-sm md:grid-cols-2 xl:grid-cols-4">
            <div>
              <div className="text-sm font-semibold text-[#243555]">{t('quick.purchaseTitle')}</div>
              <p className="mt-1 text-xs text-[#607594]">{t('quick.purchaseDesc')}</p>
              <Link href="/payment" className="mt-2 inline-block text-xs font-semibold text-[#2f4f83] hover:underline">
                {t('quick.open')}
              </Link>
            </div>
            <div>
              <div className="text-sm font-semibold text-[#243555]">{t('quick.uploadTitle')}</div>
              <p className="mt-1 text-xs text-[#607594]">{t('quick.uploadDesc')}</p>
              <Link href="/assessment" className="mt-2 inline-block text-xs font-semibold text-[#2f4f83] hover:underline">
                {t('quick.open')}
              </Link>
            </div>
            <div>
              <div className="text-sm font-semibold text-[#243555]">{t('quick.reportsTitle')}</div>
              <p className="mt-1 text-xs text-[#607594]">{t('quick.reportsDesc')}</p>
              <Link href="/reports" className="mt-2 inline-block text-xs font-semibold text-[#2f4f83] hover:underline">
                {t('quick.open')}
              </Link>
            </div>
            <div>
              <div className="text-sm font-semibold text-[#243555]">{t('quick.helpTitle')}</div>
              <p className="mt-1 text-xs text-[#607594]">{t('quick.helpDesc')}</p>
              <Link href="/support" className="mt-2 inline-block text-xs font-semibold text-[#2f4f83] hover:underline">
                {t('quick.open')}
              </Link>
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-[#dbe4f4] bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-[#243555]">{t('workflow.title')}</h3>
            <p className="mt-1 text-xs text-[#607594]">{t('workflow.subtitle')}</p>
            <ol className="mt-4 space-y-3 text-xs text-[#607594]">
              <li><span className="font-semibold text-[#1f2d45]">1.</span> {t('workflow.step1')}</li>
              <li><span className="font-semibold text-[#1f2d45]">2.</span> {t('workflow.step2')}</li>
              <li><span className="font-semibold text-[#1f2d45]">3.</span> {t('workflow.step3')}</li>
              <li><span className="font-semibold text-[#1f2d45]">4.</span> {t('workflow.step4')}</li>
              <li><span className="font-semibold text-[#1f2d45]">5.</span> {t('workflow.step5')}</li>
            </ol>
          </div>

          <div className="rounded-2xl border border-[#dbe4f4] bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-[#243555]">{t('activity.title')}</h3>
            <div className="mt-3 space-y-3">
              {recentActivity.length ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="rounded-lg border border-[#dbe4f4] bg-[#f7f9fe] px-3 py-2">
                    <p className="text-xs font-semibold text-[#1f2d45]">{activity.title}</p>
                    <p className="text-[11px] text-[#607594]">{t(`status.${activity.status}`)}</p>
                    <p className="text-[11px] text-[#7a8fab]">{activity.time}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#607594]">{t('activity.empty')}</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
