'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  getMyAssessmentReviews,
  getAssessmentReviews,
  getAssessmentReviewSummary,
  type AssessmentReviewItem,
  type AssessmentReviewSummary,
} from '@/lib/assessment-review';
import { translate, useLocale } from '@/lib/i18n';
import { AdminBreadcrumbs } from '@/components/admin-breadcrumbs';
import {
  ADMIN_KPI_DARK_CARD_CLASS,
  ADMIN_KPI_DARK_LABEL_CLASS,
  ADMIN_PAGE_HERO_EYEBROW_CLASS,
  ADMIN_PAGE_HERO_HEADER_CLASS,
  ADMIN_PAGE_HERO_SUBTITLE_CLASS,
  ADMIN_PAGE_HERO_TITLE_CLASS,
} from '@/app/(app)/admin/admin-page-title';
import { adminAssessmentsMessages } from '@/locales/admin-assessments';

const statusClass: Record<string, string> = {
  pending: 'bg-[#fff4df] text-[#b6862f]',
  pending_review: 'bg-[#fff4df] text-[#b6862f]',
  in_progress: 'bg-[#eef4ff] text-[#3f74df]',
  completed: 'bg-[#e9f8ef] text-[#2f9960]',
  approved: 'bg-[#e9f8ef] text-[#2f9960]',
  rejected: 'bg-[#ffedf0] text-[#cc5163]',
  changes_requested: 'bg-[#ffedf0] text-[#cc5163]',
};

function formatStatusFallback(status: string | null | undefined) {
  if (!status) return '';
  return status
    .split('_')
    .join(' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function AdminAssessmentsPage() {
  const { locale } = useLocale();
  const t = (key: string) => translate(adminAssessmentsMessages, locale, key);
  const statusLabel = (status: string | null | undefined) => {
    if (!status) return t('status.unknown');
    const key = `status.${status}`;
    const exact = translate(adminAssessmentsMessages, locale, key);
    if (exact !== key) return exact;
    return formatStatusFallback(status) || t('status.unknown');
  };
  const [summary, setSummary] = useState<AssessmentReviewSummary | null>(null);
  const [rows, setRows] = useState<AssessmentReviewItem[]>([]);
  const [myReviews, setMyReviews] = useState<AssessmentReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [query, setQuery] = useState('');
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(25);

  const visibleRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((item) =>
      [item.customer_name, item.customer_email, item.checklist_title, item.assessment_status, item.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    );
  }, [query, rows]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [summaryResponse, reviewsResponse] = await Promise.all([
          getAssessmentReviewSummary(),
          getAssessmentReviews({ status: statusFilter || undefined, skip, limit }),
        ]);
        setSummary(summaryResponse);
        setRows(Array.isArray(reviewsResponse) ? reviewsResponse : []);
        const myReviewsResponse = await getMyAssessmentReviews({ skip: 0, limit: 5 });
        setMyReviews(Array.isArray(myReviewsResponse) ? myReviewsResponse : []);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : t('errors.loadFailed'));
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [limit, skip, statusFilter, locale]);

  return (
    <section className="space-y-4">
      <header className={ADMIN_PAGE_HERO_HEADER_CLASS}>
        <AdminBreadcrumbs
          variant="onDark"
          items={[
            { label: t('crumbs.dashboard'), href: '/admin' },
            ...(statusFilter
              ? [
                  { label: t('crumbs.assessments'), href: '/admin/assessments' },
                  { label: statusLabel(statusFilter) },
                ]
              : [{ label: t('crumbs.assessments') }]),
          ]}
        />
        <p className={ADMIN_PAGE_HERO_EYEBROW_CLASS}>{t('hero.eyebrow')}</p>
        <h1 className={ADMIN_PAGE_HERO_TITLE_CLASS}>{t('hero.title')}</h1>
        <p className={ADMIN_PAGE_HERO_SUBTITLE_CLASS}>{t('hero.subtitle')}</p>
        {statusFilter ? (
          <p className="mt-2 text-sm font-semibold text-[#b8d4ff]">
            {t('hero.filteredBy').replace('{status}', statusLabel(statusFilter))}
          </p>
        ) : null}
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {(
          [
            {
              label: t('kpi.pending'),
              value: summary?.total_assessments_pending_review ?? 0,
              valueClass: 'text-[#ffd89c]',
            },
            {
              label: t('kpi.inProgress'),
              value: summary?.total_assessments_in_progress ?? 0,
              valueClass: 'text-[#a9c7ff]',
            },
            {
              label: t('kpi.completed'),
              value: summary?.total_assessments_completed ?? 0,
              valueClass: 'text-[#7cf0aa]',
            },
            {
              label: t('kpi.actionRequired'),
              value: summary?.total_action_required ?? 0,
              valueClass: 'text-[#ffb3c9]',
            },
          ] as const
        ).map((stat) => (
          <article key={stat.label} className={ADMIN_KPI_DARK_CARD_CLASS}>
            <p className={ADMIN_KPI_DARK_LABEL_CLASS}>{stat.label}</p>
            <p className={`mt-2 text-2xl font-semibold tabular-nums ${stat.valueClass}`}>{stat.value}</p>
          </article>
        ))}
      </div>

      <article className="overflow-hidden rounded-2xl border border-[#e2e8f5] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ecf0f8] px-4 py-3">
          <h2 className="text-xl font-semibold text-[#243555]">{t('section.reviews')}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('search.placeholder')}
              className="w-64 rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm text-[#2a3d5f] outline-none focus:border-[#7ea6e7]"
            />
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setSkip(0);
              }}
              className="rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm font-semibold text-[#1f2d45] focus:bg-white"
            >
              <option className="bg-white text-[#1f2d45]" value="">{t('filters.allStatuses')}</option>
              <option className="bg-white text-[#1f2d45]" value="pending">{t('status.pending')}</option>
              <option className="bg-white text-[#1f2d45]" value="in_progress">{t('status.in_progress')}</option>
              <option className="bg-white text-[#1f2d45]" value="completed">{t('status.completed')}</option>
              <option className="bg-white text-[#1f2d45]" value="changes_requested">{t('status.changes_requested')}</option>
              <option className="bg-white text-[#1f2d45]" value="rejected">{t('status.rejected')}</option>
            </select>
            <select
              value={String(limit)}
              onChange={(event) => {
                setLimit(Number(event.target.value));
                setSkip(0);
              }}
              className="rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm font-semibold text-[#1f2d45] focus:bg-white"
            >
              <option className="bg-white text-[#1f2d45]" value="25">{t('rows.25')}</option>
              <option className="bg-white text-[#1f2d45]" value="50">{t('rows.50')}</option>
              <option className="bg-white text-[#1f2d45]" value="100">{t('rows.100')}</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto px-4 py-3">
          <table className="min-w-full text-left text-sm text-[#2b3e60]">
            <thead className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7a8ca8]">
              <tr className="border-b border-[#edf2f9]">
                <th className="py-2 pr-4">{t('table.customer')}</th>
                <th className="py-2 pr-4">{t('table.checklist')}</th>
                <th className="py-2 pr-4">{t('table.submitted')}</th>
                <th className="py-2 pr-4">{t('table.reviewStatus')}</th>
                <th className="py-2 pr-4 text-center">{t('table.reviewedAnswers')}</th>
                <th className="py-2">{t('table.action')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="py-3 text-[#607594]" colSpan={6}>
                    {t('loading.reviews')}
                  </td>
                </tr>
              ) : null}
              {!loading &&
                visibleRows.map((row) => (
                <tr key={row.assessment_id} className="border-b border-[#edf2f9] last:border-0">
                  <td className="py-3 pr-4">
                    <p className="font-semibold text-[#25375a]">{row.customer_name || t('labels.unknownCustomer')}</p>
                    <p className="text-xs text-[#5f7395]">{row.customer_email || '-'}</p>
                  </td>
                  <td className="py-3 pr-4 text-[#5f7395]">
                    <p>{row.checklist_title || '-'}</p>
                    <p className="text-xs text-[#7a8ca8]">{row.checklist_version || '-'}</p>
                  </td>
                  <td className="py-3 pr-4 text-[#5f7395]">{formatDateTime(row.submitted_at)}</td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-md px-2 py-1 text-xs font-semibold ${statusClass[row.status] || 'bg-[#edf2f9] text-[#425f8f]'}`}>
                      {statusLabel(row.status)}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-center tabular-nums text-[#5f7395]">{row.answer_reviews_count}</td>
                  <td className="py-3">
                    <Link href={`/admin/assessments/${row.assessment_id}`} className="text-sm font-semibold text-[#3e69b0]">
                      {t('actions.openReview')}
                    </Link>
                  </td>
                </tr>
              ))}
              {!loading && !visibleRows.length ? (
                <tr>
                  <td className="py-3 text-[#607594]" colSpan={6}>
                    {t('empty.reviews')}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-[#ecf0f8] px-4 py-3">
          <button
            type="button"
            onClick={() => setSkip((prev) => Math.max(0, prev - limit))}
            disabled={skip === 0 || loading}
            className="rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm font-semibold text-[#425f8f] disabled:opacity-50"
          >
            {t('pager.previous')}
          </button>
          <p className="text-xs text-[#607594]">
            {t('pager.showing')
              .replace('{from}', String(rows.length ? skip + 1 : 1))
              .replace('{to}', String(skip + rows.length))}
          </p>
          <button
            type="button"
            onClick={() => setSkip((prev) => prev + limit)}
            disabled={rows.length < limit || loading}
            className="rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm font-semibold text-[#425f8f] disabled:opacity-50"
          >
            {t('pager.next')}
          </button>
        </div>
      </article>
      <article className="overflow-hidden rounded-2xl border border-[#e2e8f5] bg-white shadow-sm">
        <div className="border-b border-[#ecf0f8] px-4 py-3">
          <h2 className="text-xl font-semibold text-[#243555]">{t('section.myReviews')}</h2>
        </div>
        <div className="divide-y divide-[#edf2f9] px-4">
          {myReviews.length ? (
            myReviews.map((review) => (
              <div key={review.id} className="py-3 text-sm text-[#2f4264]">
                <p className="font-semibold text-[#25375a]">{review.customer_email || review.customer_name || t('labels.unknownCustomer')}</p>
                <p className="text-[#5f7395]">{review.checklist_title || '-'} · {statusLabel(review.status)}</p>
                <p className="text-xs text-[#7a8ca8]">{formatDateTime(review.updated_at)}</p>
              </div>
            ))
          ) : (
            <p className="py-4 text-sm text-[#6f82a3]">{loading ? t('loading.generic') : t('empty.myReviews')}</p>
          )}
        </div>
      </article>
    </section>
  );
}
