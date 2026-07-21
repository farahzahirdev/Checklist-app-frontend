'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CustomerAuditWorkspaceHero, WorkspaceSummaryStatCard } from '@/components/customer-my-audits/customer-audit-workspace-hero';
import {
  workspaceActivityCard,
  workspaceCardClass,
  workspaceFilterBtn,
  workspaceGhostBtn,
  workspaceInputClass,
  workspaceOutlineBtn,
  workspacePageClass,
  workspacePaginationBtn,
  workspacePrimaryBtn,
  workspaceQuickStepCard,
  workspaceTagClass,
} from '@/components/customer-my-audits/customer-audit-workspace-theme';
import { formatPreciseAccessCountdown, hasAccessTimeRemaining, useAccessCountdownNow } from '@/lib/access-countdown';
import { getCustomerAssessmentsDashboard, listCustomerAssessments, type CustomerAssessmentListItem } from '@/lib/customer-assessments';
import { getActiveAccessWindows, type ActiveAccessWindow } from '@/lib/customer-payments';
import { startAssessment } from '@/lib/assessment';
import { translate, useLocale } from '@/lib/i18n';
import { customerAccessMessages } from '@/locales/customer-access';

type StatusFilter = 'all' | 'not_started' | 'in_progress' | 'submitted' | 'closed' | 'expired';
const PAGE_SIZE = 12;

const STATUS_FILTER_OPTIONS: { value: StatusFilter; labelKey: string }[] = [
  { value: 'all', labelKey: 'filters.all' },
  { value: 'not_started', labelKey: 'filters.notStarted' },
  { value: 'in_progress', labelKey: 'filters.inProgress' },
  { value: 'submitted', labelKey: 'filters.submitted' },
  { value: 'closed', labelKey: 'filters.closed' },
  { value: 'expired', labelKey: 'filters.expired' },
];

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
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(locale === 'cs' ? 'cs-CZ' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M5 10h10M11 6l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
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
  const [statusFiltersOpen, setStatusFiltersOpen] = useState(false);
  const statusFiltersRef = useRef<HTMLDivElement | null>(null);
  const [page, setPage] = useState(1);
  const [totalAssessments, setTotalAssessments] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [readyToStartCount, setReadyToStartCount] = useState(0);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [publishedReportsCount, setPublishedReportsCount] = useState(0);
  const [assessments, setAssessments] = useState<CustomerAssessmentListItem[]>([]);
  const [availableChecklists, setAvailableChecklists] = useState<Array<{
    checklist_id: string;
    title: string;
    checklist_type_code: string;
    checklist_type_name: string;
    version: string;
    description: string | null;
    estimated_duration_minutes: number | null;
    price_cents: number | null;
    currency: string | null;
    is_purchased: boolean;
    can_start: boolean;
    access_window_id: string | null;
  }>>([]);
  const [accessByChecklist, setAccessByChecklist] = useState<Map<string, ActiveAccessWindow>>(new Map());
  const countdownNowMs = useAccessCountdownNow(assessments.length > 0);

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
  }, [page, statusFilter, debouncedSearch, loadErrorText, locale]);

  const loadMeta = useCallback(async () => {
    try {
      const [activeResponse, readyResponse, inProgressResponse, reportResponse, accessWindows] = await Promise.all([
        listCustomerAssessments({ status: ['not_started', 'in_progress'], limit: 1 }).catch(() => ({ total: 0, assessments: [] })),
        listCustomerAssessments({ status: ['not_started'], limit: 1 }).catch(() => ({ total: 0, assessments: [] })),
        listCustomerAssessments({ status: ['in_progress'], limit: 1 }).catch(() => ({ total: 0, assessments: [] })),
        getCustomerAssessmentsDashboard().catch(() => null),
        getActiveAccessWindows().catch(() => []),
      ]);

      setActiveCount(activeResponse.total ?? 0);
      setReadyToStartCount(readyResponse.total ?? 0);
      setInProgressCount(inProgressResponse.total ?? 0);
      setPublishedReportsCount(reportResponse?.summary?.reports_available ?? 0);
      setAvailableChecklists(reportResponse?.available_checklists ?? []);
      setAccessByChecklist(new Map(accessWindows.map((item) => [item.checklist_id, item])));
    } catch {
      setActiveCount(0);
      setReadyToStartCount(0);
      setInProgressCount(0);
      setPublishedReportsCount(0);
      setAvailableChecklists([]);
      setAccessByChecklist(new Map());
    }
  }, [locale]);

  const statusFilterLabel = useMemo(() => {
    const option = STATUS_FILTER_OPTIONS.find((item) => item.value === statusFilter);
    return translate(customerAccessMessages, locale, option?.labelKey ?? 'filters.all');
  }, [statusFilter, locale]);

  useEffect(() => {
    if (!statusFiltersOpen) return undefined;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node | null;
      if (target && statusFiltersRef.current && !statusFiltersRef.current.contains(target)) {
        setStatusFiltersOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [statusFiltersOpen]);

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

  const startableChecklists = useMemo(
    () => availableChecklists.filter((item) => item.can_start),
    [availableChecklists],
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
                  <span className="sr-only">{t('filters.searchLabel')}</span>
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
                    type="search"
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                    placeholder={t('filters.searchPlaceholder')}
                    className={workspaceInputClass}
                  />
                </label>
                <div className="relative" ref={statusFiltersRef}>
                  <button
                    type="button"
                    onClick={() => setStatusFiltersOpen((prev) => !prev)}
                    className={`${workspaceFilterBtn} min-w-[10.5rem] justify-between`}
                    aria-expanded={statusFiltersOpen}
                    aria-haspopup="listbox"
                    aria-label={t('filters.statusLabel')}
                  >
                    <span className="inline-flex min-w-0 items-center gap-2">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" aria-hidden="true">
                        <path d="M4 7h16M7 12h10M10 17h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                      <span className="truncate">{statusFilterLabel}</span>
                    </span>
                    <svg
                      viewBox="0 0 20 20"
                      className={`h-4 w-4 shrink-0 text-[#64748b] transition-transform ${statusFiltersOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      aria-hidden="true"
                    >
                      <path d="m5 8 5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {statusFiltersOpen ? (
                    <ul
                      className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-[#e2e8f0] bg-white py-1 shadow-lg"
                      role="listbox"
                      aria-label={t('filters.statusLabel')}
                    >
                      {STATUS_FILTER_OPTIONS.map((option) => (
                        <li key={option.value} role="none">
                          <button
                            type="button"
                            role="option"
                            aria-selected={statusFilter === option.value}
                            onClick={() => {
                              setStatusFilter(option.value);
                              setPage(1);
                              setStatusFiltersOpen(false);
                            }}
                            className={`block w-full px-4 py-2 text-left text-sm ${
                              statusFilter === option.value
                                ? 'bg-[#eff6ff] font-semibold text-[#0066ff]'
                                : 'text-[#334155] hover:bg-[#f8fafc]'
                            }`}
                          >
                            {t(option.labelKey)}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                <button type="button" onClick={() => void handleRefreshClick()} className={workspaceGhostBtn}>
                  {t('actions.refresh')}
                </button>
              </div>
            </div>

          {/* Available Checklists Section */}
          {!loading && startableChecklists.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-semibold text-[#0f172a]">{t('section.availableChecklists')}</h3>
              <ul className="space-y-3">
                {startableChecklists.map((item) => (
                  <li key={item.checklist_id} className={`${workspaceCardClass} overflow-hidden`}>
                    <div className="px-5 py-4 sm:px-6">
                      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-base font-bold text-[#0f172a]">{item.title}</h4>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold bg-[#dbeafe] text-[#1d4ed8]`}>
                              {t('status.ready')}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className={workspaceTagClass}>{item.checklist_type_code}</span>
                            <span className={workspaceTagClass}>{item.version}</span>
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setStartingId(item.checklist_id);
                              setError('');
                              startAssessment({ checklist_id: item.checklist_id })
                                .then(() => {
                                  window.location.href = `/assessment?checklist_id=${encodeURIComponent(item.checklist_id)}`;
                                })
                                .catch((err) => {
                                  setError(err instanceof Error ? err.message : startErrorText);
                                  setStartingId('');
                                });
                            }}
                            disabled={startingId === item.checklist_id}
                            className={workspacePrimaryBtn}
                          >
                            {startingId === item.checklist_id ? t('actions.processing') : t('actions.startAudit')}
                            <ArrowRightIcon />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Existing Assessments Section */}
          <div className="mt-6">
            <h3 className="mb-3 text-lg font-semibold text-[#0f172a]">{t('section.existingAssessments')}</h3>
            {loading ? (
              <p className={`${workspaceCardClass} px-4 py-3 text-sm text-[#64748b]`}>{t('loading')}</p>
            ) : filtered.length === 0 ? (
              <p className={`${workspaceCardClass} px-4 py-3 text-sm text-[#64748b]`}>{t('emptyAssessments')}</p>
            ) : (
              <ul className="space-y-4">
              {filtered.map((item) => {
                const completion = clampPercent(item.completion_percent);
                const reportId = item.report_status === 'published' && item.report_id ? item.report_id : null;
                const canViewPerformance = item.status === 'submitted' || item.status === 'closed';
                const isCompleted = item.status === 'submitted' || item.status === 'closed';
                // Only overlay the live access window for active audits. Historical rows
                // (expired/submitted/closed) must keep their own purchase window dates.
                const isHistorical =
                  item.status === 'expired' || item.status === 'submitted' || item.status === 'closed';
                const activeAccess = isHistorical ? undefined : accessByChecklist.get(item.checklist_id);
                const accessEnd =
                  (isHistorical ? null : activeAccess?.end_date) ??
                  item.access_window_expires_at ??
                  item.expires_at ??
                  null;
                const accessStart =
                  (isHistorical ? null : activeAccess?.start_date) ??
                  item.access_window_started_at ??
                  null;
                const accessRange =
                  accessStart && accessEnd
                    ? `${formatDate(accessStart, locale)} – ${formatDate(accessEnd, locale)}`
                    : '—';
                const accessCountdown = formatPreciseAccessCountdown(accessEnd, locale, countdownNowMs);
                const accessActive = hasAccessTimeRemaining(accessEnd, countdownNowMs);
                const dateLabel = isCompleted ? t('card.completedOn') : t('card.lastUpdated');
                const dateValue = formatDate(
                  item.submitted_at ?? item.last_activity ?? item.purchased_at,
                  locale,
                );

                return (
                  <li key={item.id} className={`${workspaceCardClass} overflow-hidden`}>
                    <div className="px-5 py-5 sm:px-6">
                      <div className="flex min-w-0 flex-col gap-5 xl:flex-row xl:items-stretch">
                        <div className="min-w-0 flex-1 space-y-4">
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
                        </div>

                        <div className="flex min-w-0 shrink-0 flex-col gap-4 border-t border-[#f1f5f9] pt-4 xl:w-[min(240px,100%)] xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
                          <div className="min-w-0 space-y-3 text-sm">
                            <div className="min-w-0">
                              <p className="text-xs text-[#64748b]">{dateLabel}</p>
                              <p className="break-words font-semibold text-[#0f172a]">{dateValue}</p>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs text-[#64748b]">{t('card.accessWindow')}</p>
                              <p className="break-words font-semibold text-[#0f172a]">{accessRange}</p>
                              {accessEnd && accessActive ? (
                                <p className="text-xs font-semibold text-[#16a34a]">
                                  {accessCountdown ?? t('card.accessExpired')}
                                </p>
                              ) : (
                                <p className="text-xs font-semibold text-[#94a3b8]">{t('card.accessExpired')}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            {item.status === 'not_started' && accessActive ? (
                              <button
                                type="button"
                                onClick={() => void handleStart(item)}
                                disabled={startingId === item.id}
                                className={workspacePrimaryBtn}
                              >
                                {startingId === item.id ? t('actions.processing') : t('actions.startAudit')}
                                <ArrowRightIcon />
                              </button>
                            ) : item.status === 'not_started' ? (
                              <Link href="/payment" className={workspacePrimaryBtn}>
                                {t('actions.purchaseAgain')}
                                <ArrowRightIcon />
                              </Link>
                            ) : item.status === 'expired' ? (
                              <Link href="/payment" className={workspacePrimaryBtn}>
                                {t('actions.purchaseAgain')}
                                <ArrowRightIcon />
                              </Link>
                            ) : item.status === 'in_progress' && accessActive ? (
                              <Link
                                href={`/assessment?checklist_id=${encodeURIComponent(item.checklist_id)}&assessment_id=${encodeURIComponent(item.id)}`}
                                className={workspacePrimaryBtn}
                              >
                                {t('actions.continueAudit')}
                                <ArrowRightIcon />
                              </Link>
                            ) : item.status === 'in_progress' ? (
                              <Link href="/payment" className={workspacePrimaryBtn}>
                                {t('actions.purchaseAgain')}
                                <ArrowRightIcon />
                              </Link>
                            ) : null}

                            {canViewPerformance && accessActive ? (
                              <Link
                                href={`/assessment?checklist_id=${encodeURIComponent(item.checklist_id)}&assessment_id=${encodeURIComponent(item.id)}&readonly=true`}
                                className={workspaceOutlineBtn}
                              >
                                {t('actions.viewPerformance')}
                              </Link>
                            ) : null}

                            {reportId ? (
                              <Link href={`/reports/${reportId}` as Route} className={workspacePrimaryBtn}>
                                {t('actions.viewReport')}
                                <ArrowRightIcon />
                              </Link>
                            ) : null}

                            {item.status !== 'expired' && accessActive ? (
                              <Link
                                href={
                                  item.status === 'submitted' || item.status === 'closed'
                                    ? `/assessment?checklist_id=${encodeURIComponent(item.checklist_id)}&assessment_id=${encodeURIComponent(item.id)}&readonly=true`
                                    : `/assessment?checklist_id=${encodeURIComponent(item.checklist_id)}&assessment_id=${encodeURIComponent(item.id)}`
                                }
                                className={workspaceOutlineBtn}
                              >
                                {t('actions.viewDetails')}
                              </Link>
                            ) : item.status === 'expired' && item.id ? (
                              <Link
                                href={`/assessment?checklist_id=${encodeURIComponent(item.checklist_id)}&assessment_id=${encodeURIComponent(item.id)}&readonly=true`}
                                className={workspaceOutlineBtn}
                              >
                                {t('actions.viewDetails')}
                              </Link>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            )}
          </div>

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
