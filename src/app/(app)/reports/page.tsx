"use client";

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { AdminBreadcrumbs } from '@/components/admin-breadcrumbs';
import { getCustomerReportsPage, type CustomerReportSummary } from '@/lib/reports';
import { translate, useLocale } from '@/lib/i18n';
import { customerReportMessages } from '@/locales/customer-report';

const PAGE_SIZE = 10;
type SortBy = 'approved_at' | 'final_pdf_published_at';
type SortOrder = 'desc' | 'asc';

function statusLabelKey(status: CustomerReportSummary['status']): string {
  const map: Record<CustomerReportSummary['status'], string> = {
    draft_generated: 'list.status.draft_generated',
    under_review: 'list.status.under_review',
    changes_requested: 'list.status.changes_requested',
    approved: 'list.status.approved',
    published: 'list.status.published',
  };
  return map[status];
}

export default function ReportsPage() {
  const { locale } = useLocale();
  const t = useCallback(
    (key: string, values?: Record<string, string>) => translate(customerReportMessages, locale, key, values),
    [locale]
  );

  const [reports, setReports] = useState<CustomerReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('final_pdf_published_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const loadReports = useCallback(async (nextPage: number, nextSortBy: SortBy, nextSortOrder: SortOrder) => {
    setLoading(true);
    setError('');
    try {
      const response = await getCustomerReportsPage({
        skip: (nextPage - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
        sort_by: nextSortBy,
        sort_order: nextSortOrder,
      });
      setReports(response.reports);
      setTotal(response.total);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('list.errors.load');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadReports(page, sortBy, sortOrder);
  }, [loadReports, page, sortBy, sortOrder]);

  const dateLocale = locale === 'cs' ? 'cs-CZ' : 'en-GB';

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function handleSortByChange(value: SortBy) { setSortBy(value); setPage(1); }
  function handleSortOrderChange(value: SortOrder) { setSortOrder(value); setPage(1); }

  return (
    <section className="space-y-6">
      <AdminBreadcrumbs
        items={[
          { label: t('breadcrumb.dashboard'), href: '/dashboard' },
          { label: t('list.title') },
        ]}
      />
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-[#6c83a8]">{t('list.kicker')}</p>
        <h1 className="text-3xl font-semibold text-[#1f2d45]">{t('list.title')}</h1>
      </header>

      {/* Filter / Sort bar */}
      {reports.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-[#607594]">{t('list.filter.sortBy')}:</span>
          <select
            value={sortBy}
            onChange={(e) => handleSortByChange(e.target.value as SortBy)}
            className="rounded-lg border border-[#d4dced] bg-white px-3 py-1.5 text-sm text-[#1f2d45]"
          >
            <option value="final_pdf_published_at">{t('list.filter.sortBy.published')}</option>
            <option value="approved_at">{t('list.filter.sortBy.approved')}</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => handleSortOrderChange(e.target.value as SortOrder)}
            className="rounded-lg border border-[#d4dced] bg-white px-3 py-1.5 text-sm text-[#1f2d45]"
          >
            <option value="desc">{t('list.filter.order.newest')}</option>
            <option value="asc">{t('list.filter.order.oldest')}</option>
          </select>
        </div>
      )}

      <div className="space-y-4">
      {!reports.length ? (
        <p className="rounded-xl border border-[#dbe4f4] bg-white p-4 text-sm text-[#607594] shadow-sm">
          {loading ? t('list.loading') : t('list.empty')}
        </p>
      ) : (
        <>
        <div className="overflow-hidden rounded-2xl border border-[#dbe4f4] bg-white shadow-sm">
          <div className="grid grid-cols-[1.1fr_0.9fr_auto] gap-3 border-b border-[#eef2fa] bg-[#f7f9fe] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#607594]">
            <span>{t('list.col.report')}</span>
            <span>{t('list.col.status')}</span>
            <span className="text-right">{t('list.col.open')}</span>
          </div>
          <ul className="divide-y divide-[#eef2fa]">
            {reports.map((report) => (
              <li key={report.id} className="grid grid-cols-[1.1fr_0.9fr_auto] items-center gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[#1f2d45]">
                    {report.checklist_title?.trim() || report.company_name?.trim() || t('list.report.fallback')}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-[#607594]">
                    {t('list.meta.approved', {
                      date: report.approved_at
                        ? new Date(report.approved_at).toLocaleDateString(dateLocale)
                        : t('list.meta.recent'),
                    })}
                    {' • '}
                    {t('list.meta.published', {
                      date: report.final_pdf_published_at
                        ? new Date(report.final_pdf_published_at).toLocaleDateString(dateLocale)
                        : t('list.meta.recent'),
                    })}
                  </p>
                </div>
                <div>
                  <span className="rounded-md bg-[#e9f8ef] px-2 py-1 text-xs font-semibold text-[#2f9960]">
                    {t(statusLabelKey(report.status))}
                  </span>
                </div>
                <Link
                  href={`/reports/${report.id}`}
                  className="justify-self-end rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#223657]"
                >
                  {t('list.actions.viewReport')}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-[#d4dced] bg-white px-3 py-1.5 text-sm text-[#1f2d45] hover:bg-[#f0f4fb] disabled:opacity-40"
            >
              {t('list.pagination.prev')}
            </button>
            <span className="text-sm text-[#607594]">
              {t('list.pagination.page', { page: String(page), total: String(totalPages) })}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-[#d4dced] bg-white px-3 py-1.5 text-sm text-[#1f2d45] hover:bg-[#f0f4fb] disabled:opacity-40"
            >
              {t('list.pagination.next')}
            </button>
          </div>
        )}
        </>
      )}
      </div>
    </section>
  );
}
