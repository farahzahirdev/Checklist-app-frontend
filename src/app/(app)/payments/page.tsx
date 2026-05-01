'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  getCustomerPaymentAnalyticsOverview,
  getCustomerRecentPayments,
  listCustomerPayments,
  getPaymentFilterOptions,
  type CustomerPaymentRecord,
  type CustomerPaymentFilterOptions,
} from '@/lib/customer-payments';
import { formatStatusLabel } from '@/lib/status-format';

function formatDate(value?: string | null) {
  if (!value) return 'n/a';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'n/a';
  return date.toLocaleString();
}

export default function PaymentsPage() {
  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(null);
  const [recentPayments, setRecentPayments] = useState<CustomerPaymentRecord[]>([]);
  const [payments, setPayments] = useState<CustomerPaymentRecord[]>([]);
  const [paymentsTotal, setPaymentsTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentsError, setPaymentsError] = useState('');
  const [filterOptions, setFilterOptions] = useState<CustomerPaymentFilterOptions | null>(null);
  const [loadingFilterOptions, setLoadingFilterOptions] = useState(true);

  const [statusFilter, setStatusFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [activeAccessOnly, setActiveAccessOnly] = useState(false);
  const [orderBy, setOrderBy] = useState<'created_at' | 'paid_at'>('created_at');
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('desc');
  const [skip, setSkip] = useState(0);
  const limit = 20;

  const totalSpent = useMemo(() => {
    const raw = analytics?.total_spent_formatted ?? analytics?.total_spent;
    if (typeof raw === 'string') return raw;
    if (typeof raw === 'number') return raw.toLocaleString();
    return null;
  }, [analytics]);

  async function loadFilterOptions() {
    setLoadingFilterOptions(true);
    try {
      const options = await getPaymentFilterOptions();
      setFilterOptions(options);
    } catch (err) {
      console.error('Failed to load filter options:', err);
    } finally {
      setLoadingFilterOptions(false);
    }
  }

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [overview, recent] = await Promise.all([
        getCustomerPaymentAnalyticsOverview().catch(() => null),
        getCustomerRecentPayments(10).catch(() => null),
      ]);
      setAnalytics(overview);
      setRecentPayments(recent?.payments ?? []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load payment analytics';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function loadPayments(next?: { skip?: number }) {
    setPaymentsLoading(true);
    setPaymentsError('');
    try {
      const response = await listCustomerPayments({
        status: statusFilter || undefined,
        search: searchFilter || undefined,
        date_from: dateFromFilter || undefined,
        date_to: dateToFilter || undefined,
        has_active_access: activeAccessOnly ? true : undefined,
        skip: typeof next?.skip === 'number' ? next.skip : skip,
        limit,
        order_by: orderBy,
        order_direction: orderDirection,
      });
      setPayments(response.payments ?? []);
      setPaymentsTotal(typeof response.total === 'number' ? response.total : 0);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load payments';
      setPaymentsError(msg);
    } finally {
      setPaymentsLoading(false);
    }
  }

  useEffect(() => {
    void load();
    void loadPayments({ skip: 0 });
    void loadFilterOptions();
  }, []);

  useEffect(() => {
    setSkip(0);
    void loadPayments({ skip: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, searchFilter, dateFromFilter, dateToFilter, activeAccessOnly, orderBy, orderDirection]);

  useEffect(() => {
    void loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip]);

  const pageStart = paymentsTotal ? skip + 1 : 0;
  const pageEnd = Math.min(skip + limit, paymentsTotal);
  const hasPrevious = skip > 0;
  const hasNext = skip + limit < paymentsTotal;

  return (
    <section className="px-2 py-2 sm:px-4 sm:py-4">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#6c83a8]">Customer</p>
            <h1 className="text-3xl font-semibold text-[#1f2d45]">Payments</h1>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="rounded-lg border border-[#d4dced] px-3 py-2 text-sm text-[#2a3d5f] hover:bg-[#f6f9ff] disabled:opacity-60"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </header>

        {error ? (
          <p className="rounded-lg border border-[#f0c7cf] bg-[#fff2f4] px-3 py-2 text-sm text-[#b63d51]">{error}</p>
        ) : null}

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <article className="rounded-2xl border border-[#345793] bg-[#0d1d3a] p-6">
            <p className="text-sm text-[#97a5bb]">Total spent</p>
            <p className="mt-2 text-2xl font-semibold text-white">{totalSpent ?? (loading ? '...' : 'n/a')}</p>
          </article>
          <article className="rounded-2xl border border-[#345793] bg-[#0d1d3a] p-6">
            <p className="text-sm text-[#97a5bb]">Payment success rate</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {typeof analytics?.payment_success_rate === 'number'
                ? `${analytics.payment_success_rate}%`
                : loading
                  ? '...'
                  : 'n/a'}
            </p>
          </article>
          <article className="rounded-2xl border border-[#345793] bg-[#0d1d3a] p-6">
            <p className="text-sm text-[#97a5bb]">Average amount</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {typeof analytics?.average_payment_amount === 'number'
                ? analytics.average_payment_amount.toLocaleString()
                : loading
                  ? '...'
                  : 'n/a'}
            </p>
          </article>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[#1f2d45]">Recent payments</h2>
          </div>
          {!recentPayments.length ? (
            <p className="rounded-xl border border-[#dbe4f4] bg-white p-4 text-sm text-[#607594] shadow-sm">
              {loading ? 'Loading payments…' : 'No payments found yet.'}
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-[#dbe4f4] bg-white shadow-sm">
              <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-[#eef2fa] bg-[#f7f9fe] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#607594]">
                <span>Payment</span>
                <span className="text-right">Status</span>
              </div>
              <ul className="divide-y divide-[#eef2fa]">
                {recentPayments.map((item) => (
                  <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#1f2d45]">{item.checklist_title}</p>
                      <p className="mt-0.5 truncate text-xs text-[#607594]">
                        {item.amount_formatted ?? `${item.amount_cents} ${item.currency}`} •{' '}
                        {formatDate(item.paid_at ?? item.created_at)}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full border border-[#d4dced] bg-[#f7f9fe] px-3 py-1 text-xs font-semibold text-[#2a3d5f]">
                    {formatStatusLabel(item.status)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#1f2d45]">All payments</h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void loadPayments({ skip: 0 })}
              disabled={paymentsLoading}
              className="rounded-lg border border-[#d4dced] px-3 py-2 text-sm text-[#2a3d5f] hover:bg-[#f6f9ff] disabled:opacity-60"
            >
              {paymentsLoading ? 'Loading…' : 'Refresh list'}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-[#dbe4f4] bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <label className="space-y-1 text-sm xl:col-span-1">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#607594]">Status</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                disabled={loadingFilterOptions}
                className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring disabled:opacity-50"
              >
                <option value="">All statuses</option>
                {filterOptions?.statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-sm xl:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#607594]">Search</span>
              <input
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search checklist title"
                className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring"
              />
            </label>
            <label className="space-y-1 text-sm xl:col-span-1">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#607594]">From</span>
              <input
                type="date"
                value={dateFromFilter}
                onChange={(e) => setDateFromFilter(e.target.value)}
                className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring"
              />
            </label>
            <label className="space-y-1 text-sm xl:col-span-1">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#607594]">To</span>
              <input
                type="date"
                value={dateToFilter}
                onChange={(e) => setDateToFilter(e.target.value)}
                className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring"
              />
            </label>
            <div className="flex flex-col justify-end gap-2 xl:col-span-1">
              <label className="flex items-center gap-2 text-sm text-[#2a3d5f]">
                <input
                  type="checkbox"
                  checked={activeAccessOnly}
                  onChange={(e) => setActiveAccessOnly(e.target.checked)}
                  className="h-4 w-4 rounded border-[#b7c7e6]"
                />
                Active access only
              </label>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-[#2a3d5f]">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#607594]">Order by</span>
                <select
                  value={orderBy}
                  onChange={(e) => setOrderBy(e.target.value === 'paid_at' ? 'paid_at' : 'created_at')}
                  className="rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-2 py-2 text-sm text-[#243555]"
                >
                  <option value="created_at">Created At</option>
                  <option value="paid_at">Paid At</option>
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm text-[#2a3d5f]">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#607594]">Direction</span>
                <select
                  value={orderDirection}
                  onChange={(e) => setOrderDirection(e.target.value === 'asc' ? 'asc' : 'desc')}
                  className="rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-2 py-2 text-sm text-[#243555]"
                >
                  <option value="desc">desc</option>
                  <option value="asc">asc</option>
                </select>
              </label>
            </div>
            <p className="text-sm text-[#607594]">
              {paymentsLoading ? 'Loading…' : `Showing ${pageStart}-${pageEnd} of ${paymentsTotal}`}
            </p>
          </div>
        </div>

        {paymentsError ? (
          <p className="rounded-lg border border-[#f0c7cf] bg-[#fff2f4] px-3 py-2 text-sm text-[#b63d51]">{paymentsError}</p>
        ) : null}

        <div className="overflow-hidden rounded-xl border border-[#dbe4f4] bg-white shadow-sm">
          <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-[#eef2fa] bg-[#f7f9fe] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#607594]">
            <span>Payment</span>
            <span className="text-right">Status</span>
          </div>
          <ul className="divide-y divide-[#eef2fa]">
            {(paymentsLoading ? [] : payments).map((item) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[#1f2d45]">{item.checklist_title}</p>
                  <p className="mt-0.5 truncate text-xs text-[#607594]">
                    {item.amount_formatted ?? `${item.amount_cents} ${item.currency}`} • Paid {formatDate(item.paid_at)} • Created{' '}
                    {formatDate(item.created_at)}
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-[#d4dced] bg-[#f7f9fe] px-3 py-1 text-xs font-semibold text-[#2a3d5f]">
                  {formatStatusLabel(item.status)}
                </span>
              </li>
            ))}
            {paymentsLoading ? (
              <li className="px-4 py-4 text-sm text-[#607594]">Loading payments…</li>
            ) : null}
            {!paymentsLoading && !payments.length ? (
              <li className="px-4 py-4 text-sm text-[#607594]">No payments match these filters.</li>
            ) : null}
          </ul>
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={!hasPrevious || paymentsLoading}
            onClick={() => setSkip((prev) => Math.max(0, prev - limit))}
            className="rounded-lg border border-[#d4dced] px-3 py-2 text-sm text-[#2a3d5f] hover:bg-[#f6f9ff] disabled:opacity-60"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={!hasNext || paymentsLoading}
            onClick={() => setSkip((prev) => prev + limit)}
            className="rounded-lg border border-[#d4dced] px-3 py-2 text-sm text-[#2a3d5f] hover:bg-[#f6f9ff] disabled:opacity-60"
          >
            Next
          </button>
        </div>
        </section>
      </div>
    </section>
  );
}

