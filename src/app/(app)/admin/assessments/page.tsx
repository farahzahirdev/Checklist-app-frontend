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
import { AdminBreadcrumbs } from '@/components/admin-breadcrumbs';

const statusClass: Record<string, string> = {
  pending_review: 'bg-[#fff4df] text-[#b6862f]',
  in_progress: 'bg-[#eef4ff] text-[#3f74df]',
  completed: 'bg-[#e9f8ef] text-[#2f9960]',
  approved: 'bg-[#e9f8ef] text-[#2f9960]',
  changes_requested: 'bg-[#ffedf0] text-[#cc5163]',
};

function formatStatus(status: string | null | undefined) {
  if (!status) return 'Unknown';
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
        toast.error(err instanceof Error ? err.message : 'Failed to load assessment review data');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [limit, skip, statusFilter]);

  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-[#dbe4f4] bg-white px-5 py-4 shadow-sm">
        <AdminBreadcrumbs
          items={[
            { label: 'Dashboard', href: '/admin' },
            ...(statusFilter
              ? [
                  { label: 'Assessments', href: '/admin/assessments' },
                  { label: formatStatus(statusFilter) },
                ]
              : [{ label: 'Assessments' }]),
          ]}
        />
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6f82a3]">Assessments</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1f2d45]">Assessment Management</h1>
        <p className="mt-1 text-sm text-[#607594]">Track review queue, in-progress reviews, and completed assessments.</p>
        {statusFilter ? <p className="mt-2 text-sm font-semibold text-[#3e69b0]">Filtered by status: {formatStatus(statusFilter)}</p> : null}
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Pending Review', value: summary?.total_assessments_pending_review ?? 0, tone: 'bg-[#fff4df] text-[#b6862f]' },
          { label: 'In Progress', value: summary?.total_assessments_in_progress ?? 0, tone: 'bg-[#eaf2ff] text-[#3f74df]' },
          { label: 'Completed', value: summary?.total_assessments_completed ?? 0, tone: 'bg-[#e9f8ef] text-[#2f9960]' },
          { label: 'Action Required', value: summary?.total_action_required ?? 0, tone: 'bg-[#ffedf0] text-[#cc5163]' },
        ].map((stat) => (
          <article key={stat.label} className="rounded-2xl border border-[#e2e8f5] bg-white px-4 py-3 shadow-sm">
            <p className="text-sm font-medium text-[#6a7d9a]">{stat.label}</p>
            <p className={`mt-2 inline-flex rounded-lg px-2.5 py-1 text-2xl font-semibold ${stat.tone}`}>{stat.value}</p>
          </article>
        ))}
      </div>

      <article className="overflow-hidden rounded-2xl border border-[#e2e8f5] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ecf0f8] px-4 py-3">
          <h2 className="text-xl font-semibold text-[#243555]">Assessment Reviews</h2>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search customer or checklist"
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
              <option className="bg-white text-[#1f2d45]" value="">All statuses</option>
              <option className="bg-white text-[#1f2d45]" value="pending_review">Pending review</option>
              <option className="bg-white text-[#1f2d45]" value="in_progress">In progress</option>
              <option className="bg-white text-[#1f2d45]" value="completed">Completed</option>
              <option className="bg-white text-[#1f2d45]" value="changes_requested">Changes requested</option>
              <option className="bg-white text-[#1f2d45]" value="approved">Approved</option>
            </select>
            <select
              value={String(limit)}
              onChange={(event) => {
                setLimit(Number(event.target.value));
                setSkip(0);
              }}
              className="rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm font-semibold text-[#1f2d45] focus:bg-white"
            >
              <option className="bg-white text-[#1f2d45]" value="25">25 / page</option>
              <option className="bg-white text-[#1f2d45]" value="50">50 / page</option>
              <option className="bg-white text-[#1f2d45]" value="100">100 / page</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto px-4 py-3">
          <table className="min-w-full text-left text-sm text-[#2b3e60]">
            <thead className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7a8ca8]">
              <tr className="border-b border-[#edf2f9]">
                <th className="py-2 pr-4">Customer</th>
                <th className="py-2 pr-4">Checklist</th>
                <th className="py-2 pr-4">Submitted</th>
                <th className="py-2 pr-4">Review Status</th>
                <th className="py-2 pr-4">Reviewed Answers</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="py-3 text-[#607594]" colSpan={6}>
                    Loading assessment reviews...
                  </td>
                </tr>
              ) : null}
              {!loading &&
                visibleRows.map((row) => (
                <tr key={row.assessment_id} className="border-b border-[#edf2f9] last:border-0">
                  <td className="py-3 pr-4">
                    <p className="font-semibold text-[#25375a]">{row.customer_name || 'Unknown customer'}</p>
                    <p className="text-xs text-[#5f7395]">{row.customer_email || '-'}</p>
                  </td>
                  <td className="py-3 pr-4 text-[#5f7395]">
                    <p>{row.checklist_title || '-'}</p>
                    <p className="text-xs text-[#7a8ca8]">{row.checklist_version || '-'}</p>
                  </td>
                  <td className="py-3 pr-4 text-[#5f7395]">{formatDateTime(row.submitted_at)}</td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-md px-2 py-1 text-xs font-semibold ${statusClass[row.status] || 'bg-[#edf2f9] text-[#425f8f]'}`}>
                      {formatStatus(row.status)}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-[#5f7395]">{row.answer_reviews_count}</td>
                  <td className="py-3">
                    <Link href={`/admin/assessments/${row.assessment_id}`} className="text-sm font-semibold text-[#3e69b0]">
                      Open Review
                    </Link>
                  </td>
                </tr>
              ))}
              {!loading && !visibleRows.length ? (
                <tr>
                  <td className="py-3 text-[#607594]" colSpan={7}>
                    No assessment reviews match the current filters.
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
            Previous
          </button>
          <p className="text-xs text-[#607594]">Showing {skip + 1} - {skip + rows.length}</p>
          <button
            type="button"
            onClick={() => setSkip((prev) => prev + limit)}
            disabled={rows.length < limit || loading}
            className="rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm font-semibold text-[#425f8f] disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </article>
      <article className="overflow-hidden rounded-2xl border border-[#e2e8f5] bg-white shadow-sm">
        <div className="border-b border-[#ecf0f8] px-4 py-3">
          <h2 className="text-xl font-semibold text-[#243555]">My Reviews</h2>
        </div>
        <div className="divide-y divide-[#edf2f9] px-4">
          {myReviews.length ? (
            myReviews.map((review) => (
              <div key={review.id} className="py-3 text-sm text-[#2f4264]">
                <p className="font-semibold text-[#25375a]">{review.customer_email || review.customer_name || 'Unknown customer'}</p>
                <p className="text-[#5f7395]">{review.checklist_title || '-'} · {formatStatus(review.status)}</p>
                <p className="text-xs text-[#7a8ca8]">{formatDateTime(review.updated_at)}</p>
              </div>
            ))
          ) : (
            <p className="py-4 text-sm text-[#6f82a3]">{loading ? 'Loading...' : 'No assigned reviews yet.'}</p>
          )}
        </div>
      </article>
    </section>
  );
}
