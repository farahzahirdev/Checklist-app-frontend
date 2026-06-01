'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CustomerAuditWorkspaceHero, WorkspaceSummaryStatCard } from '@/components/customer-my-audits/customer-audit-workspace-hero';
import {
  workspaceActivityCard,
  workspaceCardClass,
  workspaceGhostBtn,
  workspaceInputClass,
  workspaceOutlineBtn,
  workspacePageClass,
  workspacePaginationBtn,
  workspacePrimaryBtn,
  workspaceQuickStepCard,
  workspaceSelectClass,
  workspaceTagClass,
} from '@/components/customer-my-audits/customer-audit-workspace-theme';
import { getCustomerAssessmentsDashboard, listCustomerAssessments, type CustomerAssessmentListItem } from '@/lib/customer-assessments';
import { startAssessment } from '@/lib/assessment';
import { translate, useLocale } from '@/lib/i18n';
import { customerAccessMessages } from '@/locales/customer-access';

type StatusFilter = 'all' | 'not_started' | 'in_progress' | 'submitted' | 'closed' | 'expired';
const PAGE_SIZE = 12;

function statusBadgeClass(status: string) {
  if (status === 'in_progress' || status === 'not_started') return 'bg-[#dbeafe] text-[#1d4ed8]';
  if (status === 'submitted' || status === 'closed') return 'bg-[#dcfce7] text-[#15803d]';
  return 'bg-[#fef3c7] text-[#b45309]';
}

function progressBarClass(completion: number) {
  if (completion >= 100) return 'bg-[#22c55e]';
  if (completion > 0) return 'bg-[#0066ff]';
  return 'bg-[#e2e8f0]';
}

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function formatDate(value: string | null | undefined, locale: 'en' | 'cs') {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(locale === 'cs' ? 'cs-CZ' : 'en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(value: string | null | undefined, locale: 'en' | 'cs') {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(locale === 'cs' ? 'cs-CZ' : 'en-GB');
}

function formatLastChanged(value: string | null | undefined, locale: 'en' | 'cs') {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const now = new Date();
  const isSameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (!isSameDay) {
    return date.toLocaleString(locale === 'cs' ? 'cs-CZ' : 'en-GB');
  }

  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)));
  const rtf = new Intl.RelativeTimeFormat(locale === 'cs' ? 'cs-CZ' : 'en', { numeric: 'auto' });

  if (diffMinutes < 60) {
    return rtf.format(-diffMinutes, 'minute');
  }

  const diffHours = Math.floor(diffMinutes / 60);
  return rtf.format(-diffHours, 'hour');
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
    <div className={workspacePageClass}>
      <CustomerAuditWorkspaceHero
        kicker={t('title.kicker')}
        title={t('title')}
        subtitle={t('title.subtitle')}
        stats={
          <>
            <WorkspaceSummaryStatCard
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="currentColor" strokeWidth="1.8" />
                  <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              }
              label={t('stats.activeAudits')}
              value={String(activeCount)}
              hint={t('stats.activeSub')}
            />
            <WorkspaceSummaryStatCard
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path d="M8 5v14l11-7L8 5Z" fill="currentColor" />
                </svg>
              }
              label={t('stats.readyToStart')}
              value={String(readyToStartCount)}
              hint={t('stats.readySub')}
            />
            <WorkspaceSummaryStatCard
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M12 8v4l2 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              }
              label={t('stats.inProgress')}
              value={String(inProgressCount)}
              hint={t('stats.progressSub')}
            />
            <WorkspaceSummaryStatCard
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path d="M6 4h12v16H6z" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              }
              label={t('stats.publishedReports')}
              value={String(publishedReportsCount)}
              hint={t('stats.reportSub')}
            />
          </>
        }
      />

      <div className="w-full px-5 sm:px-6 lg:px-8 xl:px-10">
        {error ? (
          <p className="mt-6 rounded-xl border border-[#fecdd3] bg-[#fff1f2] px-4 py-3 text-sm text-[#be123c]">{error}</p>
        ) : null}

        <div className="grid w-full min-w-0 gap-6 pb-8 pt-12 sm:pt-14 xl:grid-cols-[minmax(0,1fr)_300px] 2xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-[#0f172a]">{t('section.auditListTitle')}</h2>
              <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                <label className="relative min-w-0 flex-1 sm:w-56">
                  <span className="sr-only">{t('filters.searchPlaceholder')}</span>
                  <svg
                    viewBox="0 0 24 24"
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
                    <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  <input
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                    placeholder={t('filters.searchPlaceholder')}
                    className={workspaceInputClass}
                  />
                </label>
                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value as StatusFilter);
                    setPage(1);
                  }}
                  className={workspaceSelectClass}
                >
                  <option value="all">{t('filters.all')}</option>
                  <option value="not_started">{t('filters.notStarted')}</option>
                  <option value="in_progress">{t('filters.inProgress')}</option>
                  <option value="submitted">{t('filters.submitted')}</option>
                  <option value="closed">{t('filters.closed')}</option>
                  <option value="expired">{t('filters.expired')}</option>
                </select>
                <button type="button" onClick={() => void handleRefreshClick()} className={workspaceGhostBtn}>
                  {t('actions.refresh')}
                </button>
              </div>
            </div>

          {loading ? (
            <p className={`${workspaceCardClass} px-4 py-3 text-sm text-[#64748b]`}>{t('loading')}</p>
          ) : filtered.length === 0 ? (
            <p className={`${workspaceCardClass} px-4 py-3 text-sm text-[#64748b]`}>{t('empty')}</p>
          ) : (
            <ul className="space-y-4">
              {filtered.map((item) => {
                const completion = clampPercent(item.completion_percent);
                const reportId = item.report_status === 'published' && item.report_id ? item.report_id : null;
                const canViewPerformance = item.status === 'submitted' || item.status === 'closed';
                const accessWindowStart = formatDate(item.access_window_started_at, locale);
                const accessWindowEnd = formatDate(item.access_window_expires_at ?? item.expires_at, locale);
                const completedOn = formatDate(item.submitted_at, locale);
                const reportPublishedOn = formatDate(item.report_published_at, locale);
                const purchasedOn = formatDate(item.purchased_at, locale);
                const lastChanged = formatLastChanged(item.last_activity, locale);
                const fallbackLastUpdated = formatDateTime(item.last_activity, locale);

                return (
                  <li key={item.id} className={`${workspaceCardClass} overflow-hidden`}>
                    <div className="grid gap-5 px-5 py-5 lg:grid-cols-[1fr_230px] sm:px-6">
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-[#0f172a]">{item.checklist_title}</h3>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass(item.status)}`}>
                          {t(`status.${item.status}`)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className={workspaceTagClass}>{item.checklist_type_code}</span>
                        <span className={workspaceTagClass}>{item.checklist_version}</span>
                      </div>
                      <div className="max-w-md">
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="font-medium text-[#334155]">{t('labels.progress')}</span>
                          <span className="font-bold text-[#0f172a]">{completion}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-[#e2e8f0]">
                          <div
                            className={`h-full rounded-full transition-all ${progressBarClass(completion)}`}
                            style={{ width: `${completion}%` }}
                          />
                        </div>
                      </div>
                      {item.status === 'in_progress' ? (
                        <div className="space-y-1 text-xs text-[#64748b]">
                          <p>
                            {t('labels.lastChanged')}: {lastChanged ?? fallbackLastUpdated ?? t('labels.na')}
                          </p>
                          <p>
                            {t('labels.accessWindow')}: {accessWindowStart ?? t('labels.na')} - {accessWindowEnd ?? t('labels.na')}
                          </p>
                        </div>
                      ) : null}

                      {(item.status === 'submitted' || item.status === 'closed') ? (
                        <div className="space-y-1 text-xs text-[#64748b]">
                          <p>
                            {t('labels.completedOn')}: {completedOn ?? t('labels.na')}
                          </p>
                          {item.report_status === 'published' ? (
                            <p>
                              {t('labels.reportPublishedOn')}: {reportPublishedOn ?? t('labels.na')}
                            </p>
                          ) : (
                            <p>{t('labels.reportInProgress')}</p>
                          )}
                        </div>
                      ) : null}

                      {item.status === 'not_started' ? (
                        <div className="text-xs text-[#64748b]">
                          {t('labels.purchasedOn')}: {purchasedOn ?? accessWindowStart ?? t('labels.na')}
                        </div>
                      ) : null}

                      {item.status === 'expired' ? (
                        <div className="text-xs text-[#64748b]">
                          {t('labels.lastUpdated')}: {fallbackLastUpdated ?? t('labels.na')}
                        </div>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-2">
                      {item.status === 'not_started' ? (
                        <button
                          type="button"
                          onClick={() => void handleStart(item)}
                          disabled={startingId === item.id}
                          className={workspacePrimaryBtn}
                        >
                          {startingId === item.id ? t('actions.processing') : t('actions.startAudit')}
                        </button>
                      ) : (
                        <Link
                          href={`/assessment?checklist_id=${encodeURIComponent(item.checklist_id)}&assessment_id=${encodeURIComponent(item.id)}`}
                          className={workspacePrimaryBtn}
                        >
                          {t('actions.continueAudit')}
                        </Link>
                      )}

                      {canViewPerformance ? (
                        <Link
                          href={`/assessment?checklist_id=${encodeURIComponent(item.checklist_id)}&assessment_id=${encodeURIComponent(item.id)}&view=performance`}
                          className={workspaceOutlineBtn}
                        >
                          {t('actions.viewPerformance')}
                        </Link>
                      ) : null}

                      {reportId ? (
                        <Link href={`/reports/${reportId}` as Route} className={workspacePrimaryBtn}>
                          {t('actions.viewReport')}
                        </Link>
                      ) : null}

                      <Link
                        href={`/assessment?checklist_id=${encodeURIComponent(item.checklist_id)}&assessment_id=${encodeURIComponent(item.id)}`}
                        className={workspaceOutlineBtn}
                      >
                        {t('actions.viewDetails')}
                      </Link>
                    </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-sm text-[#64748b]">
            <span>{t('pagination.showing', { from: String(rangeFrom), to: String(rangeTo), total: String(totalAssessments) })}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1 || loading}
                className={workspacePaginationBtn}
              >
                {t('pagination.prev')}
              </button>
              <span className="min-w-[2rem] text-center font-semibold text-[#0f172a]">
                {t('pagination.page', { page: String(page), totalPages: String(totalPages) })}
              </span>
              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page >= totalPages || loading}
                className={workspacePaginationBtn}
              >
                {t('pagination.next')}
              </button>
            </div>
          </div>

          <div className="grid gap-3 pt-4 sm:grid-cols-2 xl:grid-cols-4">
            <Link href="/payment" className={workspaceQuickStepCard}>
              <p className="text-sm font-bold text-[#0f172a]">{t('quick.purchaseTitle')}</p>
              <p className="mt-1 flex-1 text-xs leading-relaxed text-[#64748b]">
                {t('quick.purchaseDesc')} <span className="font-semibold text-[#0066ff]">&gt;</span>
              </p>
            </Link>
            <Link href="/assessment" className={workspaceQuickStepCard}>
              <p className="text-sm font-bold text-[#0f172a]">{t('quick.uploadTitle')}</p>
              <p className="mt-1 flex-1 text-xs leading-relaxed text-[#64748b]">
                {t('quick.uploadDesc')} <span className="font-semibold text-[#0066ff]">&gt;</span>
              </p>
            </Link>
            <Link href="/reports" className={workspaceQuickStepCard}>
              <p className="text-sm font-bold text-[#0f172a]">{t('quick.reportsTitle')}</p>
              <p className="mt-1 flex-1 text-xs leading-relaxed text-[#64748b]">
                {t('quick.reportsDesc')} <span className="font-semibold text-[#0066ff]">&gt;</span>
              </p>
            </Link>
            <Link href="/support" className={workspaceQuickStepCard}>
              <p className="text-sm font-bold text-[#0f172a]">{t('quick.helpTitle')}</p>
              <p className="mt-1 flex-1 text-xs leading-relaxed text-[#64748b]">
                {t('quick.helpDesc')} <span className="font-semibold text-[#0066ff]">&gt;</span>
              </p>
            </Link>
          </div>
          </div>

        <aside className="min-w-0 space-y-4 xl:sticky xl:top-4 xl:self-start">
          <div className={`${workspaceCardClass} p-5 sm:p-6`}>
            <h3 className="text-base font-bold text-[#0f172a]">{t('workflow.title')}</h3>
            <p className="mt-1 text-xs text-[#64748b]">{t('workflow.subtitle')}</p>
            <ol className="mt-4 space-y-3 text-xs text-[#64748b]">
              <li><span className="font-semibold text-[#0f172a]">1.</span> {t('workflow.step1')}</li>
              <li><span className="font-semibold text-[#0f172a]">2.</span> {t('workflow.step2')}</li>
              <li><span className="font-semibold text-[#0f172a]">3.</span> {t('workflow.step3')}</li>
              <li><span className="font-semibold text-[#0f172a]">4.</span> {t('workflow.step4')}</li>
              <li><span className="font-semibold text-[#0f172a]">5.</span> {t('workflow.step5')}</li>
            </ol>
          </div>

          <div className={`${workspaceCardClass} p-5 sm:p-6`}>
            <h3 className="text-base font-bold text-[#0f172a]">{t('activity.title')}</h3>
            <div className="mt-3 space-y-3">
              {recentActivity.length ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className={workspaceActivityCard}>
                    <p className="text-xs font-semibold text-[#0f172a]">{activity.title}</p>
                    <p className="text-[11px] text-[#64748b]">{t(`status.${activity.status}`)}</p>
                    <p className="text-[11px] text-[#94a3b8]">{activity.time}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#64748b]">{t('activity.empty')}</p>
              )}
            </div>
          </div>
        </aside>
        </div>
      </div>
    </div>
  );
}
