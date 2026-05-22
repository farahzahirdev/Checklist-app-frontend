'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  adminReportDetailPath,
  getReportsList,
  type ReportListItem,
  type ReportStatus,
} from '@/lib/reports';
import { translate, useLocale } from '@/lib/i18n';
import { AdminBreadcrumbs } from '@/components/admin-breadcrumbs';
import {
  ADMIN_KPI_DARK_CARD_CLASS,
  ADMIN_KPI_DARK_LABEL_CLASS,
  ADMIN_PAGE_HERO_EYEBROW_CLASS,
  ADMIN_PAGE_HERO_HEADER_CLASS,
  ADMIN_PAGE_HERO_SUBTITLE_CLASS,
  ADMIN_PAGE_TITLE_CLASS,
} from '@/app/(app)/admin/admin-page-title';
import { adminReportsMessages } from '@/locales/admin-reports';

const PAGE_SIZE = 20;
type SortBy = 'draft_generated_at' | 'approved_at' | 'reviewed_at' | 'created_at';
type SortOrder = 'desc' | 'asc';

const statusClass: Record<ReportStatus, string> = {
  draft_generated: 'bg-[#fff4df] text-[#b6862f]',
  under_review: 'bg-[#eaf2ff] text-[#3f74df]',
  changes_requested: 'bg-[#fff4df] text-[#b6862f]',
  approved: 'bg-[#e9f8ef] text-[#2f9960]',
  published: 'bg-[#e9f8ef] text-[#2f9960]',
};

type ReportsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default function AdminReportsPage({ searchParams }: ReportsPageProps) {
  void searchParams;
  const { locale } = useLocale();
  const t = (key: string) => translate(adminReportsMessages, locale, key);
  const statusLabel = (status: ReportStatus | string) =>
    translate(adminReportsMessages, locale, `status.${status}`) || String(status);
  const query = useSearchParams();
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('draft_generated_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const statusFromQuery = query.get('status');
    if (!statusFromQuery) return;
    const normalized = statusFromQuery.trim().toLowerCase().replace(/\s+/g, '_');
    const validStatuses: ReportStatus[] = [
      'draft_generated',
      'under_review',
      'changes_requested',
      'approved',
      'published',
    ];
    if (validStatuses.includes(normalized as ReportStatus)) {
      setStatusFilter(normalized as ReportStatus);
    }
    setPage(1);
  }, [query]);

  async function loadReports() {
  const loadReports = useCallback(async (opts?: { page?: number; status?: string; search?: string; sortBy?: SortBy; sortOrder?: SortOrder }) => {
    setLoading(true);
    setError('');
    try {
      const currentPage = opts?.page ?? 1;
      const response = await getReportsList({
        status: opts?.status ?? statusFilter || undefined,
        search: opts?.search ?? search || undefined,
        sort_by: opts?.sortBy ?? sortBy,
        sort_order: opts?.sortOrder ?? sortOrder,
        skip: (currentPage - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
      });
      setReports(response.reports);
      setTotal(response.total ?? 0);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('errors.loadReports');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, sortBy, sortOrder, t]);

  useEffect(() => {
    void loadReports({ page });
  }, [locale, statusFilter, sortBy, sortOrder, page]);

  const filteredReports = reports;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const stats = {
    ready: reports.filter(r => r.status === 'under_review').length,
    draft: reports.filter(r => r.status === 'draft_generated').length,
    published: reports.filter(r => r.status === 'published').length,
  };

  return (
    <section className="space-y-4">
      <header className={ADMIN_PAGE_HERO_HEADER_CLASS}>
        <AdminBreadcrumbs
          variant="onDark"
          items={[
            { label: t('crumbs.dashboard'), href: '/admin' },
            ...(statusFilter
              ? [
                  { label: t('crumbs.reports'), href: '/admin/reports' },
                  { label: statusLabel(statusFilter as ReportStatus) || t('crumbs.reports') },
                ]
              : [{ label: t('crumbs.reports') }]),
          ]}
        />
        <p className={ADMIN_PAGE_HERO_EYEBROW_CLASS}>{t('hero.eyebrow')}</p>
        <h1 className={`mt-2 ${ADMIN_PAGE_TITLE_CLASS} text-white`}>{t('hero.title')}</h1>
        <p className={ADMIN_PAGE_HERO_SUBTITLE_CLASS}>{t('hero.subtitle')}</p>
        {statusFilter ? (
          <p className="mt-2 text-sm font-semibold text-[#9db8e6]">
            {t('hero.filteredBy').replace('{status}', statusLabel(statusFilter as ReportStatus))}
          </p>
        ) : null}
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        {[
          { label: t('kpi.ready'), value: stats.ready.toString() },
          { label: t('kpi.draft'), value: stats.draft.toString() },
          { label: t('kpi.published'), value: stats.published.toString() },
        ].map((item) => (
          <article key={item.label} className={ADMIN_KPI_DARK_CARD_CLASS}>
            <p className={ADMIN_KPI_DARK_LABEL_CLASS}>{item.label}</p>
            <p className="mt-1 text-3xl font-semibold text-white">{item.value}</p>
          </article>
        ))}
      </div>

      <article className="overflow-hidden rounded-2xl border border-[#e2e8f5] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#ecf0f8] px-4 py-3">
          <h2 className="text-xl font-semibold text-[#243555]">{t('section.recent')}</h2>
          <div className="flex gap-2">
            <input
              type="search"
              value={search}
              placeholder={t('filters.search')}
              onChange={(e) => {
                const val = e.target.value;
                setSearch(val);
                if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
                searchDebounceRef.current = setTimeout(() => {
                  setPage(1);
                  void loadReports({ page: 1, search: val });
                }, 400);
              }}
              className="rounded-lg border border-[#d4dced] bg-white px-3 py-1.5 text-sm w-44"
            />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="rounded-lg border border-[#d4dced] bg-white px-3 py-1 text-sm"
            >
              <option value="">{t('filters.all')}</option>
              <option value="draft_generated">{t('status.draft_generated')}</option>
              <option value="under_review">{t('status.under_review')}</option>
              <option value="changes_requested">{t('status.changes_requested')}</option>
              <option value="approved">{t('status.approved')}</option>
              <option value="published">{t('status.published')}</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value as SortBy); setPage(1); }}
              className="rounded-lg border border-[#d4dced] bg-white px-3 py-1 text-sm"
            >
              <option value="draft_generated_at">{t('filters.sortBy.draft_generated_at')}</option>
              <option value="approved_at">{t('filters.sortBy.approved_at')}</option>
              <option value="reviewed_at">{t('filters.sortBy.reviewed_at')}</option>
              <option value="created_at">{t('filters.sortBy.created_at')}</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => { setSortOrder(e.target.value as SortOrder); setPage(1); }}
              className="rounded-lg border border-[#d4dced] bg-white px-3 py-1 text-sm"
            >
              <option value="desc">{t('filters.order.desc')}</option>
              <option value="asc">{t('filters.order.asc')}</option>
            </select>
            <button
              type="button"
              onClick={() => void loadReports({ page })}
              disabled={loading}
              className="rounded-xl border border-[#2d4f83] bg-[#182843] px-4 py-2 text-sm font-semibold text-white hover:bg-[#223657] disabled:opacity-60"
            >
              {loading ? t('actions.loading') : t('actions.refresh')}
            </button>
          </div>
        </div>

        {error ? (
          <div className="px-4 py-3">
            <p className="rounded-lg border border-[#f0c7cf] bg-[#fff2f4] px-3 py-2 text-sm text-[#b63d51]">{error}</p>
          </div>
        ) : null}

        <div className="overflow-x-auto px-4 py-3">
          <table className="min-w-full text-left text-sm text-[#2b3e60]">
            <thead className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7a8ca8]">
              <tr className="border-b border-[#edf2f9]">
                <th className="py-2 pr-4">{t('table.customer')}</th>
                <th className="py-2 pr-4">{t('table.checklist')}</th>
                <th className="py-2 pr-4">{t('table.generated')}</th>
                <th className="py-2 pr-4">{t('table.reviewer')}</th>
                <th className="py-2 pr-4">{t('table.status')}</th>
                <th className="py-2">{t('table.action')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id} className="border-b border-[#edf2f9] last:border-0">
                  <td className="py-3 pr-4 font-semibold text-[#25375a]">
                    {report.customer_name || report.customer_email}
                  </td>
                  <td className="py-3 pr-4 text-[#5f7395]">{report.checklist_title}</td>
                  <td className="py-3 pr-4 text-[#5f7395]">
                    {report.draft_generated_at ? new Date(report.draft_generated_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="py-3 pr-4 text-[#5f7395]">{report.reviewer_name || '-'}</td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-md px-2 py-1 text-xs font-semibold ${statusClass[report.status]}`}>
                      {statusLabel(report.status)}
                    </span>
                  </td>
                  <td className="py-3">
                    <Link
                      href={adminReportDetailPath(report) as any}
                      className="text-sm font-semibold text-[#3e69b0] hover:underline"
                    >
                      {t('actions.viewReport')}
                    </Link>
                  </td>
                </tr>
              ))}
              {!filteredReports.length ? (
                <tr>
                  <td className="py-3 text-[#607594]" colSpan={6}>
                    {loading ? t('empty.loading') : t('empty.none')}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </article>
    </section>
    {totalPages > 1 && (
      <div className="mt-4 flex items-center justify-between px-1">
        <button
          type="button"
          disabled={page <= 1 || loading}
          onClick={() => setPage((p) => p - 1)}
          className="rounded-lg border border-[#d4dced] bg-white px-3 py-1.5 text-sm text-[#1f2d45] hover:bg-[#f0f4fb] disabled:opacity-40"
        >
          {t('pagination.prev')}
        </button>
        <span className="text-sm text-[#607594]">
          {t('pagination.page').replace('{page}', String(page)).replace('{total}', String(totalPages))}
        </span>
        <button
          type="button"
          disabled={page >= totalPages || loading}
          onClick={() => setPage((p) => p + 1)}
          className="rounded-lg border border-[#d4dced] bg-white px-3 py-1.5 text-sm text-[#1f2d45] hover:bg-[#f0f4fb] disabled:opacity-40"
        >
          {t('pagination.next')}
        </button>
      </div>
    )}
  );
}
