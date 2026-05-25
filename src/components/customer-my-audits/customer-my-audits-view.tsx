'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import neonNetworkBg from '@/assets/Neon-Network-Overlay.jpg';
import { AuditIcon, AUDIT_ICON_THEMES, pickAuditIconKind } from '@/components/products/audit-icon';
import type { CustomerAssessmentListItem } from '@/lib/customer-assessments';
import type { ActiveAccessWindow, PurchasedChecklist } from '@/lib/customer-payments';
import type { CustomerChecklist } from '@/lib/checklist-api';
import { buildAuditProductHref } from '@/lib/products-catalog';

const PAGE_SIZE = 6;
const cardClass = 'rounded-2xl border border-[#e2e8f0] bg-white shadow-[0_4px_24px_rgba(15,23,42,0.06)]';
const primaryBtn =
  'inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0066ff] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0052cc]';
const outlineBtn =
  'inline-flex w-full items-center justify-center rounded-xl border border-[#cbd5e1] bg-white px-4 py-2.5 text-sm font-semibold text-[#0066ff] transition-colors hover:border-[#94a3b8] hover:bg-[#f8fafc]';
const quickStepCard =
  'flex h-full min-h-[148px] flex-col rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.05)] transition-colors hover:border-[#93c5fd] hover:bg-[#f8fbff]';

type TranslateFn = (key: string) => string;

export type MyAuditRow = {
  checklistId: string;
  title: string;
  description: string;
  typeCode: string;
  typeName: string;
  purchased: PurchasedChecklist;
  assessment: CustomerAssessmentListItem | null;
  access: ActiveAccessWindow | null;
};

export type MyAuditsStats = {
  activeAudits: number;
  readyToStart: number;
  inProgress: number;
  publishedReports: number;
};

export type RecentActivityItem = {
  id: string;
  label: string;
  timeLabel: string;
  tone: 'complete' | 'progress' | 'start';
};

type AuditCardStatus = 'ready' | 'inProgress' | 'completed' | 'reportReady';
type StatusFilter = 'all' | AuditCardStatus;

function formatDate(value: string | null | undefined, locale: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(locale === 'cs' ? 'cs-CZ' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatRelativeTime(value: string | null | undefined, locale: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return locale === 'cs' ? `před ${diffMins} min` : `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return locale === 'cs' ? `před ${diffHours} h` : `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return locale === 'cs' ? `před ${diffDays} dny` : `${diffDays}d ago`;
  return formatDate(value, locale);
}

function resolveCardStatus(row: MyAuditRow): AuditCardStatus {
  if (row.assessment?.has_report) return 'reportReady';
  if (row.assessment?.status === 'submitted') return 'completed';
  if (row.assessment?.status === 'in_progress') return 'inProgress';
  return 'ready';
}

function statusLabel(status: AuditCardStatus, t: TranslateFn): string {
  if (status === 'inProgress') return t('status.inProgress');
  if (status === 'completed' || status === 'reportReady') return t('status.completed');
  return t('status.ready');
}

function statusBadgeClass(status: AuditCardStatus): string {
  if (status === 'ready') return 'bg-[#dbeafe] text-[#1d4ed8]';
  return 'bg-[#dcfce7] text-[#15803d]';
}

function workspaceHref(row: MyAuditRow): Route {
  const assessment = row.assessment;
  if (assessment?.status === 'in_progress' || assessment?.status === 'not_started') {
    if (assessment.id) {
      return `/assessment?assessment_id=${encodeURIComponent(assessment.id)}` as Route;
    }
    return `/assessment?checklist_id=${encodeURIComponent(row.checklistId)}` as Route;
  }
  if (assessment?.status === 'submitted' || assessment?.has_report) {
    return row.assessment?.has_report ? ('/reports' as Route) : (`/assessment?checklist_id=${encodeURIComponent(row.checklistId)}` as Route);
  }
  return `/access?checklist_id=${encodeURIComponent(row.checklistId)}` as Route;
}

function primaryAction(row: MyAuditRow, t: TranslateFn): { href: Route; label: string } {
  const status = resolveCardStatus(row);
  if (status === 'ready') {
    return { href: `/access?checklist_id=${encodeURIComponent(row.checklistId)}` as Route, label: t('actions.start') };
  }
  if (status === 'reportReady' || (status === 'completed' && row.assessment?.has_report)) {
    return { href: '/reports' as Route, label: t('actions.viewReport') };
  }
  if (status === 'completed') {
    return { href: workspaceHref(row), label: t('actions.viewReport') };
  }
  return { href: workspaceHref(row), label: t('actions.continue') };
}

function progressPercent(row: MyAuditRow): number {
  if (!row.assessment) return 0;
  const raw = Number(row.assessment.completion_percent);
  if (!Number.isFinite(raw)) return 0;
  return Math.min(100, Math.max(0, Math.round(raw)));
}

function assessmentPickPriority(assessment: CustomerAssessmentListItem): number {
  if (assessment.status === 'in_progress') return 4;
  if (assessment.status === 'not_started') return 3;
  if (assessment.status === 'submitted') return 2;
  if (assessment.status === 'expired') return 1;
  return 0;
}

function SummaryStatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="flex min-w-0 flex-1 gap-3 rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-[0_12px_40px_rgba(15,23,42,0.1)] sm:p-5">
      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eff6ff] text-[#0066ff]">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-[#64748b]">{label}</p>
        <p className="mt-0.5 text-2xl font-bold leading-none text-[#0f172a]">{value}</p>
        <p className="mt-1 text-xs text-[#64748b]">{hint}</p>
      </div>
    </div>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M5 10h10M11 6l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StepIconBox({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eff6ff] text-[#0066ff]">
      {children}
    </span>
  );
}

function IconClipboard() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function IconClipboardCheck() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.8" />
      <path d="m8 12 2 2 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCloudUpload() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M7 18h10a4 4 0 0 0 .5-7.98A5.5 5.5 0 0 0 6.4 9.5 4.5 4.5 0 0 0 7 18Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8v8M9 11l3-3 3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCheckCircle() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="m8 12 3 3 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconDocumentReport() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M6 4h12v16H6z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m14 16 2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconLightning() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M13 2 3 14h8l-1 8 10-12h-8l1-8Z" />
    </svg>
  );
}

function IconHelpCircle() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 4.2 1.8c-.8.6-1.2 1.1-1.2 2.2v.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="17" r="0.75" fill="currentColor" />
    </svg>
  );
}

function WorkflowStep({
  icon,
  title,
  description,
  active,
  done,
  isLast,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  active: boolean;
  done: boolean;
  isLast?: boolean;
}) {
  return (
    <li className="relative flex gap-3">
      {!isLast ? (
        <span
          className="absolute left-[18px] top-10 bottom-0 w-px border-l border-dashed border-[#cbd5e1]"
          aria-hidden="true"
        />
      ) : null}
      <StepIconBox>{icon}</StepIconBox>
      <div className={`min-w-0 ${isLast ? '' : 'pb-8'}`}>
        <p className={`text-sm font-semibold ${active || done ? 'text-[#0f172a]' : 'text-[#64748b]'}`}>{title}</p>
        <p className="text-xs text-[#64748b]">{description}</p>
      </div>
    </li>
  );
}

function QuickActionStep({
  href,
  title,
  description,
  icon,
}: {
  href: Route;
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <Link href={href} className={quickStepCard}>
      <StepIconBox>{icon}</StepIconBox>
      <p className="mt-3 text-sm font-bold text-[#0f172a]">{title}</p>
      <p className="mt-1 flex-1 text-xs leading-relaxed text-[#64748b]">
        {description}{' '}
        <span className="font-semibold text-[#0066ff]">&gt;</span>
      </p>
    </Link>
  );
}

export function buildMyAuditRows(
  purchased: PurchasedChecklist[],
  checklists: CustomerChecklist[],
  assessments: CustomerAssessmentListItem[],
  accessWindows: ActiveAccessWindow[],
): MyAuditRow[] {
  const checklistById = new Map(checklists.map((item) => [item.id, item]));
  const assessmentByChecklist = new Map<string, CustomerAssessmentListItem>();

  for (const assessment of assessments) {
    const existing = assessmentByChecklist.get(assessment.checklist_id);
    if (!existing) {
      assessmentByChecklist.set(assessment.checklist_id, assessment);
      continue;
    }
    const existingPriority = assessmentPickPriority(existing);
    const nextPriority = assessmentPickPriority(assessment);
    if (nextPriority > existingPriority) {
      assessmentByChecklist.set(assessment.checklist_id, assessment);
      continue;
    }
    if (nextPriority < existingPriority) continue;
    const existingTime = Date.parse(existing.last_activity ?? existing.started_at ?? '');
    const nextTime = Date.parse(assessment.last_activity ?? assessment.started_at ?? '');
    if (nextTime >= existingTime) {
      assessmentByChecklist.set(assessment.checklist_id, assessment);
    }
  }

  const accessByChecklist = new Map(accessWindows.map((item) => [item.checklist_id, item]));

  return purchased.map((item) => {
    const catalog = checklistById.get(item.checklist_id);
    const title = item.checklist_title?.trim() || catalog?.title || item.checklist_id;
    const typeName = catalog?.checklist_type?.name ?? 'Audit';
    const description =
      catalog?.checklist_type?.description?.trim() ||
      `Structured audit checklist for ${typeName} compliance and readiness.`;

    return {
      checklistId: item.checklist_id,
      title,
      description,
      typeCode: catalog?.checklist_type?.code ?? '',
      typeName,
      purchased: item,
      assessment: assessmentByChecklist.get(item.checklist_id) ?? null,
      access: accessByChecklist.get(item.checklist_id) ?? null,
    };
  });
}

export function buildRecentActivity(rows: MyAuditRow[], locale: string, t: TranslateFn): RecentActivityItem[] {
  const items: Array<{ id: string; label: string; time: number; tone: RecentActivityItem['tone'] }> = [];

  for (const row of rows) {
    const assessment = row.assessment;
    if (!assessment) continue;
    const timeRaw = assessment.last_activity ?? assessment.submitted_at ?? assessment.started_at;
    const time = Date.parse(timeRaw ?? '');
    if (Number.isNaN(time)) continue;

    if (assessment.status === 'submitted' || assessment.has_report) {
      items.push({
        id: `${row.checklistId}-done`,
        label: t('activity.completed').replace('{title}', row.title),
        time,
        tone: 'complete',
      });
    } else if (assessment.status === 'in_progress') {
      items.push({
        id: `${row.checklistId}-progress`,
        label: t('activity.inProgress').replace('{title}', row.title),
        time,
        tone: 'progress',
      });
    } else {
      items.push({
        id: `${row.checklistId}-start`,
        label: t('activity.started').replace('{title}', row.title),
        time,
        tone: 'start',
      });
    }
  }

  return items
    .sort((a, b) => b.time - a.time)
    .slice(0, 5)
    .map((item) => ({
      id: item.id,
      label: item.label,
      timeLabel: formatRelativeTime(new Date(item.time).toISOString(), locale),
      tone: item.tone,
    }));
}

export function computeWorkflowStep(rows: MyAuditRow[]): number {
  const hasAny = rows.length > 0;
  if (!hasAny) return 1;
  const maxProgress = rows.reduce((max, row) => {
    const status = resolveCardStatus(row);
    if (status === 'reportReady' || status === 'completed') return Math.max(max, 5);
    if (status === 'inProgress') {
      const pct = progressPercent(row);
      if (pct >= 80) return Math.max(max, 4);
      if (pct >= 40) return Math.max(max, 3);
      return Math.max(max, 2);
    }
    return Math.max(max, 1);
  }, 1);
  return maxProgress;
}

export type CustomerMyAuditsViewProps = {
  t: TranslateFn;
  locale: string;
  loading: boolean;
  error: string;
  rows: MyAuditRow[];
  stats: MyAuditsStats;
  recentActivity: RecentActivityItem[];
};

export function CustomerMyAuditsView({ t, locale, loading, error, rows, stats, recentActivity }: CustomerMyAuditsViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtersRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!filtersOpen) return undefined;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node | null;
      if (target && filtersRef.current && !filtersRef.current.contains(target)) {
        setFiltersOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [filtersOpen]);

  const workflowStep = useMemo(() => computeWorkflowStep(rows), [rows]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      const status = resolveCardStatus(row);
      if (statusFilter === 'completed' && status !== 'completed' && status !== 'reportReady') return false;
      if (statusFilter !== 'all' && statusFilter !== 'completed' && status !== statusFilter) return false;
      if (!q) return true;
      return (
        row.title.toLowerCase().includes(q) ||
        row.typeName.toLowerCase().includes(q) ||
        row.description.toLowerCase().includes(q)
      );
    });
  }, [rows, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filteredRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const rangeFrom = filteredRows.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeTo = Math.min(currentPage * PAGE_SIZE, filteredRows.length);
  const firstInProgress = rows.find((row) => resolveCardStatus(row) === 'inProgress');

  return (
    <div className="min-h-full w-full bg-[#eef2f7]">
      <header className="relative w-full overflow-hidden pb-14 sm:pb-16">
        <Image src={neonNetworkBg} alt="" fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(4,12,32,0.94)_0%,rgba(8,24,56,0.82)_50%,rgba(12,40,88,0.55)_100%)]" />
        <div
          className="pointer-events-none absolute right-8 top-1/2 hidden -translate-y-1/2 opacity-40 lg:block"
          aria-hidden="true"
        >
          <div className="relative h-48 w-48 xl:h-56 xl:w-56">
            <div className="absolute inset-0 rounded-full bg-[#0066ff]/20 blur-3xl" />
            <svg viewBox="0 0 120 120" className="relative h-full w-full text-[#3b82f6]" fill="none">
              <path d="M60 8 20 24v28c0 26.5 17 50.4 40 56 23-5.6 40-29.5 40-56V24L60 8Z" stroke="currentColor" strokeWidth="2" />
              <path d="m44 58 12 12 22-26" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <div className="relative w-full px-5 pt-8 sm:px-6 sm:pt-10 lg:px-8 xl:px-10">
            <div className="min-w-0 max-w-3xl xl:pr-56">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7eb8ff]">{t('hero.kicker')}</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.5rem]">{t('hero.title')}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#c8daf5] sm:text-base">{t('hero.subtitle')}</p>
          </div>

          <div className="relative z-10 mt-8 mb-[-2.75rem] grid w-full gap-3 sm:mb-[-3.25rem] sm:grid-cols-2 xl:grid-cols-4">
            <SummaryStatCard
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="currentColor" strokeWidth="1.8" />
                  <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              }
              label={t('stats.active')}
              value={String(stats.activeAudits)}
              hint={t('stats.activeHint')}
            />
            <SummaryStatCard
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path d="M8 5v14l11-7L8 5Z" fill="currentColor" />
                </svg>
              }
              label={t('stats.ready')}
              value={String(stats.readyToStart)}
              hint={t('stats.readyHint')}
            />
            <SummaryStatCard
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M12 8v4l2 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              }
              label={t('stats.inProgress')}
              value={String(stats.inProgress)}
              hint={t('stats.inProgressHint')}
            />
            <SummaryStatCard
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path d="M6 4h12v16H6z" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              }
              label={t('stats.reports')}
              value={String(stats.publishedReports)}
              hint={t('stats.reportsHint')}
            />
          </div>
        </div>
      </header>

      <div className="w-full px-5 sm:px-6 lg:px-8 xl:px-10">
        {error ? (
          <p className="mt-6 rounded-xl border border-[#fecdd3] bg-[#fff1f2] px-4 py-3 text-sm text-[#be123c]">{error}</p>
        ) : null}

        <div className="grid w-full min-w-0 gap-6 pb-8 pt-12 sm:pt-14 xl:grid-cols-[minmax(0,1fr)_300px] 2xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-[#0f172a]">{t('list.title')}</h2>
              <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                <label className="relative min-w-0 flex-1 sm:w-56">
                  <span className="sr-only">{t('list.search')}</span>
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
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder={t('list.search')}
                    className="w-full rounded-xl border border-[#e2e8f0] bg-white py-2.5 pl-10 pr-3 text-sm text-[#0f172a] outline-none ring-[#0066ff]/30 focus:border-[#0066ff] focus:ring-2"
                  />
                </label>
                <div className="relative" ref={filtersRef}>
                  <button
                    type="button"
                    onClick={() => setFiltersOpen((prev) => !prev)}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-4 py-2.5 text-sm font-semibold text-[#334155] hover:bg-[#f8fafc]"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                      <path d="M4 7h16M7 12h10M10 17h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                    {t('list.filters')}
                  </button>
                  {filtersOpen ? (
                    <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-[#e2e8f0] bg-white py-1 shadow-lg">
                      {(
                        [
                          ['all', 'list.filterAll'],
                          ['ready', 'list.filterReady'],
                          ['inProgress', 'list.filterInProgress'],
                          ['completed', 'list.filterCompleted'],
                        ] as const
                      ).map(([value, labelKey]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => {
                            setStatusFilter(value);
                            setPage(1);
                            setFiltersOpen(false);
                          }}
                          className={`block w-full px-4 py-2 text-left text-sm ${
                            statusFilter === value ? 'bg-[#eff6ff] font-semibold text-[#0066ff]' : 'text-[#334155] hover:bg-[#f8fafc]'
                          }`}
                        >
                          {t(labelKey)}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {loading && rows.length === 0 ? (
              <div className={`${cardClass} p-8 text-center text-sm text-[#64748b]`}>{t('loading')}</div>
            ) : pageRows.length === 0 ? (
              <div className={`${cardClass} p-8 text-center`}>
                <p className="text-base font-semibold text-[#0f172a]">{t('empty.title')}</p>
                <p className="mt-2 text-sm text-[#64748b]">{t('empty.body')}</p>
                <Link href="/products" className={`${primaryBtn} mt-5`}>
                  {t('empty.cta')}
                </Link>
              </div>
            ) : (
              <ul className="space-y-4">
                {pageRows.map((row, index) => {
                  const status = resolveCardStatus(row);
                  const percent = progressPercent(row);
                  const iconKind = pickAuditIconKind(row.typeCode, index);
                  const iconTheme = AUDIT_ICON_THEMES[iconKind];
                  const action = primaryAction(row, t);
                  const progressTone =
                    status === 'completed' || status === 'reportReady'
                      ? 'bg-[#22c55e]'
                      : percent > 0
                        ? 'bg-[#0066ff]'
                        : 'bg-[#e2e8f0]';
                  const dateLabel =
                    status === 'completed' || status === 'reportReady'
                      ? t('card.completedOn')
                      : t('card.lastUpdated');
                  const dateValue = formatDate(
                    row.assessment?.submitted_at ?? row.assessment?.last_activity ?? row.purchased.last_payment_date,
                    locale,
                  );
                  const accessRange =
                    row.access && row.access.start_date && row.access.end_date
                      ? `${formatDate(row.access.start_date, locale)} – ${formatDate(row.access.end_date, locale)}`
                      : '—';

                  return (
                    <li key={row.checklistId} className={`${cardClass} overflow-hidden`}>
                      <div className="px-5 py-5 sm:px-6">
                        <div className="flex min-w-0 flex-col gap-5 xl:flex-row xl:items-stretch">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start gap-3">
                              <span
                                className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconTheme.bg} ${iconTheme.fg}`}
                              >
                                <AuditIcon kind={iconKind} className="h-7 w-7" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-lg font-bold text-[#0f172a]">{row.title}</h3>
                                  <span
                                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass(status)}`}
                                  >
                                    {statusLabel(status, t)}
                                  </span>
                                </div>
                                <p className="mt-1 text-sm leading-relaxed text-[#64748b]">{row.description}</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <span className="rounded-md bg-[#f1f5f9] px-2 py-0.5 text-xs font-medium text-[#475569]">
                                    {t('card.tag')}
                                  </span>
                                  {row.typeName ? (
                                    <span className="rounded-md bg-[#f1f5f9] px-2 py-0.5 text-xs font-medium text-[#475569]">
                                      {row.typeName}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            </div>

                            <div className="mt-5 max-w-md">
                              <div className="flex items-center justify-between gap-2 text-sm">
                                <span className="font-medium text-[#334155]">
                                  {status === 'completed' || status === 'reportReady'
                                    ? t('card.completion')
                                    : t('card.overallProgress')}
                                </span>
                                <span className="font-bold text-[#0f172a]">{percent}%</span>
                              </div>
                              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e2e8f0]">
                                <div
                                  className={`h-full rounded-full transition-all ${progressTone}`}
                                  style={{ width: `${percent}%` }}
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
                                {row.access && row.access.days_remaining > 0 ? (
                                  <p className="text-xs font-semibold text-[#16a34a]">
                                    {t('card.accessDays').replace('{days}', String(row.access.days_remaining))}
                                  </p>
                                ) : (
                                  <p className="text-xs font-semibold text-[#94a3b8]">{t('card.accessExpired')}</p>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col gap-2">
                              <Link href={action.href} className={primaryBtn}>
                                {action.label}
                                <ArrowRightIcon />
                              </Link>
                              <Link href={buildAuditProductHref(row.checklistId) as Route} className={outlineBtn}>
                                {t('actions.viewDetails')}
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {filteredRows.length > 0 ? (
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-sm text-[#64748b]">
                <p>
                  {t('list.showing')
                    .replace('{from}', String(rangeFrom))
                    .replace('{to}', String(rangeTo))
                    .replace('{total}', String(filteredRows.length))}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 font-medium text-[#334155] disabled:opacity-40"
                  >
                    {t('list.prev')}
                  </button>
                  <span className="min-w-[2rem] text-center font-semibold text-[#0f172a]">{currentPage}</span>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 font-medium text-[#334155] disabled:opacity-40"
                  >
                    {t('list.next')}
                  </button>
                </div>
              </div>
            ) : null}

            <div className="grid gap-3 pt-4 sm:grid-cols-2 xl:grid-cols-4">
              <QuickActionStep
                href={'/products#audits-checklists' as Route}
                title={t('quick.actions')}
                description={t('quick.actionsDesc')}
                icon={<IconLightning />}
              />
              <QuickActionStep
                href={(firstInProgress ? workspaceHref(firstInProgress) : '/assessment') as Route}
                title={t('quick.evidence')}
                description={t('quick.evidenceDesc')}
                icon={<IconCloudUpload />}
              />
              <QuickActionStep
                href="/reports"
                title={t('quick.reports')}
                description={t('quick.reportsDesc')}
                icon={<IconDocumentReport />}
              />
              <QuickActionStep
                href="/support"
                title={t('quick.help')}
                description={t('quick.helpDesc')}
                icon={<IconHelpCircle />}
              />
            </div>
          </div>

          <aside className="min-w-0 space-y-4 xl:sticky xl:top-4 xl:self-start">
            <div className={`${cardClass} p-5 sm:p-6`}>
              <h3 className="text-base font-bold text-[#0f172a]">{t('workflow.title')}</h3>
              <ol className="mt-4 space-y-1">
                <WorkflowStep
                  icon={<IconClipboard />}
                  title={t('workflow.step1')}
                  description={t('workflow.step1Desc')}
                  active={workflowStep === 1}
                  done={workflowStep > 1}
                />
                <WorkflowStep
                  icon={<IconClipboardCheck />}
                  title={t('workflow.step2')}
                  description={t('workflow.step2Desc')}
                  active={workflowStep === 2}
                  done={workflowStep > 2}
                />
                <WorkflowStep
                  icon={<IconCloudUpload />}
                  title={t('workflow.step3')}
                  description={t('workflow.step3Desc')}
                  active={workflowStep === 3}
                  done={workflowStep > 3}
                />
                <WorkflowStep
                  icon={<IconCheckCircle />}
                  title={t('workflow.step4')}
                  description={t('workflow.step4Desc')}
                  active={workflowStep === 4}
                  done={workflowStep > 4}
                />
                <WorkflowStep
                  icon={<IconDocumentReport />}
                  title={t('workflow.step5')}
                  description={t('workflow.step5Desc')}
                  active={workflowStep === 5}
                  done={workflowStep >= 5}
                  isLast
                />
              </ol>
            </div>

            <div className={`${cardClass} p-5 sm:p-6`}>
              <h3 className="text-base font-bold text-[#0f172a]">{t('activity.title')}</h3>
              {recentActivity.length === 0 ? (
                <p className="mt-4 text-sm text-[#64748b]">{t('activity.empty')}</p>
              ) : (
                <ul className="mt-4 space-y-4">
                  {recentActivity.map((item) => (
                    <li key={item.id} className="flex gap-3">
                      <span
                        className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          item.tone === 'complete'
                            ? 'bg-[#dcfce7] text-[#16a34a]'
                            : item.tone === 'progress'
                              ? 'bg-[#dbeafe] text-[#2563eb]'
                              : 'bg-[#f1f5f9] text-[#64748b]'
                        }`}
                      >
                        {item.tone === 'complete' ? '✓' : item.tone === 'progress' ? '◔' : '▶'}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#0f172a]">{item.label}</p>
                        <p className="text-xs text-[#64748b]">{item.timeLabel}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <Link href="/assessment" className="mt-4 inline-block text-sm font-semibold text-[#0066ff] hover:underline">
                {t('activity.viewAll')} →
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
