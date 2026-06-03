'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  getCustomerPaymentAnalyticsOverview,
  getCustomerRecentPayments,
  listCustomerPayments,
  getPaymentFilterOptions,
  type CustomerPaymentAnalyticsOverview,
  type CustomerPaymentRecord,
  type CustomerPaymentFilterOptions,
} from '@/lib/customer-payments';
import { formatStatusLabel } from '@/lib/status-format';
import { translate, useLocale } from '@/lib/i18n';
import { customerPaymentsMessages } from '@/locales/customer-payments';

function formatDate(value?: string | null) {
  if (!value) return 'n/a';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'n/a';
  return date.toLocaleString();
}

function formatUsdFromCents(cents?: number | null) {
  if (typeof cents !== 'number' || Number.isNaN(cents)) return null;
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(cents / 100);
}

const insightCard =
  'rounded-2xl border border-[#345793] bg-[#0d1d3a] p-6 shadow-sm';
const insightLabel = 'text-sm text-[#97a5bb]';
const insightTitle = 'mt-2 text-lg font-semibold leading-snug text-white';
const insightMeta = 'mt-1 text-sm text-[#c4d6f7]';

const filterLabelClass = 'text-xs font-medium text-[#5f7395]';

export default function PaymentsPage() {
  const { locale } = useLocale();
  const t = (key: string) => translate(customerPaymentsMessages, locale, key);
  const [analytics, setAnalytics] = useState<CustomerPaymentAnalyticsOverview | null>(null);
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
    if (typeof raw === 'number') return formatUsdFromCents(raw);
    return null;
  }, [analytics]);

  const latestChecklistPurchase = useMemo(() => {
    const rows = analytics?.spending_by_checklist;
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return [...rows].sort(
      (a, b) =>
        new Date(b.last_payment_date ?? 0).getTime() - new Date(a.last_payment_date ?? 0).getTime(),
    )[0];
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
    <section className="w-full min-w-0 space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-[#5f7395]">{t('title.kicker')}</p>
            <h1 className="text-3xl font-semibold text-[#1f2d45]">{t('title')}</h1>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="rounded-lg border border-[#d4dced] px-3 py-2 text-sm text-[#2a3d5f] hover:bg-[#f6f9ff] disabled:opacity-60"
          >
            {loading ? t('actions.refreshing') : t('actions.refresh')}
          </button>
        </header>

        {error ? (
          <p className="rounded-lg border border-[#f0c7cf] bg-[#fff2f4] px-3 py-2 text-sm text-[#b63d51]">{error}</p>
        ) : null}

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <article className={insightCard}>
            <p className={insightLabel}>{t('kpi.totalSpent')}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{totalSpent ?? (loading ? '...' : t('labels.na'))}</p>
          </article>

          {latestChecklistPurchase?.checklist_title ? (
            <article className={insightCard}>
              <p className={insightLabel}>Latest checklist purchase</p>
              <p className={insightTitle}>{latestChecklistPurchase.checklist_title}</p>
              <p className={insightMeta}>
                {formatDate(latestChecklistPurchase.last_payment_date)}
                {typeof latestChecklistPurchase.total_payments === 'number'
                  ? ` · ${latestChecklistPurchase.total_payments} payment${
                      latestChecklistPurchase.total_payments === 1 ? '' : 's'
                    } total`
                  : ''}
              </p>
              {formatUsdFromCents(latestChecklistPurchase.total_amount) ? (
                <p className="mt-2 text-sm font-medium text-[#9db8e6]">
                  On this checklist: {formatUsdFromCents(latestChecklistPurchase.total_amount)}
                </p>
              ) : null}
            </article>
          ) : null}

          {analytics?.most_expensive_payment?.checklist_title ? (
            <article className={insightCard}>
              <p className={insightLabel}>Largest single payment</p>
              <p className={insightTitle}>{analytics.most_expensive_payment.checklist_title}</p>
              <p className={insightMeta}>
                {[
                  analytics.most_expensive_payment.amount_formatted ??
                    formatUsdFromCents(analytics.most_expensive_payment.amount_cents),
                  formatDate(analytics.most_expensive_payment.paid_at),
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </article>
          ) : null}
        </section>

        <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#1f2d45]">{t('section.allPayments')}</h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void loadPayments({ skip: 0 })}
              disabled={paymentsLoading}
              className="rounded-lg border border-[#d4dced] px-3 py-2 text-sm text-[#2a3d5f] hover:bg-[#f6f9ff] disabled:opacity-60"
            >
              {paymentsLoading ? t('actions.loading') : t('actions.refreshList')}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-[#dbe4f4] bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <label className="space-y-1 text-sm xl:col-span-1">
              <span className={filterLabelClass}>{t('filters.status')}</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                disabled={loadingFilterOptions}
                className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring disabled:opacity-50"
              >
                <option value="">{t('filters.allStatuses')}</option>
                {filterOptions?.statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-sm xl:col-span-2">
              <span className={filterLabelClass}>{t('filters.search')}</span>
              <input
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder={t('filters.searchPlaceholder')}
                className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring"
              />
            </label>
            <label className="space-y-1 text-sm xl:col-span-1">
              <span className={filterLabelClass}>{t('filters.fromDate')}</span>
              <input
                type="date"
                value={dateFromFilter}
                onChange={(e) => setDateFromFilter(e.target.value)}
                className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring"
              />
            </label>
            <label className="space-y-1 text-sm xl:col-span-1">
              <span className={filterLabelClass}>{t('filters.toDate')}</span>
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
                  className="h-4 w-4 rounded border-[#b7c7e6] bg-white"
                  style={{ colorScheme: 'none' }}
                />
                {t('filters.activeOnly')}
              </label>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-[#2a3d5f]">
                <span className={filterLabelClass}>{t('filters.orderBy')}</span>
                <select
                  value={orderBy}
                  onChange={(e) => setOrderBy(e.target.value === 'paid_at' ? 'paid_at' : 'created_at')}
                  className="rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-2 py-2 text-sm text-[#243555]"
                >
                  <option value="created_at">{t('filters.order.createdAt')}</option>
                  <option value="paid_at">{t('filters.order.paidAt')}</option>
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm text-[#2a3d5f]">
                <span className={filterLabelClass}>{t('filters.sortBy')}</span>
                <select
                  value={orderDirection}
                  onChange={(e) => setOrderDirection(e.target.value === 'asc' ? 'asc' : 'desc')}
                  className="rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-2 py-2 text-sm text-[#243555]"
                >
                  <option value="desc">{t('filters.sort.newest')}</option>
                  <option value="asc">{t('filters.sort.oldest')}</option>
                </select>
              </label>
            </div>
            <p className="text-sm text-[#607594]">
              {paymentsLoading
                ? t('actions.loading')
                : t('meta.showing')
                    .replace('{from}', String(pageStart))
                    .replace('{to}', String(pageEnd))
                    .replace('{total}', String(paymentsTotal))}
            </p>
          </div>
        </div>

        {paymentsError ? (
          <p className="rounded-lg border border-[#f0c7cf] bg-[#fff2f4] px-3 py-2 text-sm text-[#b63d51]">{paymentsError}</p>
        ) : null}

        <div className="overflow-hidden rounded-xl border border-[#dbe4f4] bg-white shadow-sm">
          <div className="grid grid-cols-[1fr_8rem] gap-3 border-b border-[#eef2fa] bg-[#f7f9fe] px-4 py-2 text-xs font-medium text-[#5f7395] sm:grid-cols-[1fr_9rem]">
            <span>{t('table.payment')}</span>
            <span className="text-center">{t('table.status')}</span>
          </div>
          <ul className="divide-y divide-[#eef2fa]">
            {(paymentsLoading ? [] : payments).map((item) => (
              <li
                key={item.id}
                className="grid grid-cols-[1fr_8rem] items-center gap-3 px-4 py-3 sm:grid-cols-[1fr_9rem]"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[#1f2d45]">{item.checklist_title}</p>
                  <p className="mt-0.5 truncate text-xs text-[#607594]">
                    {item.amount_formatted ?? `${item.amount_cents} ${item.currency}`} • {t('labels.paid')} {formatDate(item.paid_at)} • {t('labels.created')}{' '}
                    {formatDate(item.created_at)}
                  </p>
                </div>
                <div className="flex justify-center">
                  <span className="inline-flex shrink-0 rounded-full border border-[#d4dced] bg-[#f7f9fe] px-3 py-1 text-center text-xs font-semibold text-[#2a3d5f]">
                    {formatStatusLabel(item.status)}
                  </span>
                </div>
              </li>
            ))}
            {paymentsLoading ? (
              <li className="px-4 py-4 text-sm text-[#607594]">Loading payments…</li>
            ) : null}
            {!paymentsLoading && !payments.length ? (
              <li className="px-4 py-4 text-sm text-[#607594]">{t('empty.noPaymentsMatch')}</li>
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
            {t('pager.previous')}
          </button>
          <button
            type="button"
            disabled={!hasNext || paymentsLoading}
            onClick={() => setSkip((prev) => prev + limit)}
            className="rounded-lg border border-[#d4dced] px-3 py-2 text-sm text-[#2a3d5f] hover:bg-[#f6f9ff] disabled:opacity-60"
          >
            {t('pager.next')}
          </button>
        </div>

        <div className="border-t border-[#dbe4f4] pt-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[#1f2d45]">{t('section.recentPayments')}</h2>
          </div>
          {!recentPayments.length ? (
            <p className="mt-3 rounded-xl border border-[#dbe4f4] bg-white p-4 text-sm text-[#607594] shadow-sm">
              {loading ? 'Loading payments…' : t('empty.noRecent')}
            </p>
          ) : (
            <div className="mt-3 overflow-hidden rounded-xl border border-[#dbe4f4] bg-white shadow-sm">
              <div className="grid grid-cols-[1fr_8rem] gap-3 border-b border-[#eef2fa] bg-[#f7f9fe] px-4 py-2 text-xs font-medium text-[#5f7395] sm:grid-cols-[1fr_9rem]">
                <span>{t('table.payment')}</span>
                <span className="text-center">{t('table.status')}</span>
              </div>
              <ul className="divide-y divide-[#eef2fa]">
                {recentPayments.map((item) => (
                  <li
                    key={item.id}
                    className="grid grid-cols-[1fr_8rem] items-center gap-3 px-4 py-3 sm:grid-cols-[1fr_9rem]"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#1f2d45]">{item.checklist_title}</p>
                      <p className="mt-0.5 truncate text-xs text-[#607594]">
                        {item.amount_formatted ?? `${item.amount_cents} ${item.currency}`} •{' '}
                        {formatDate(item.paid_at ?? item.created_at)}
                      </p>
                    </div>
                    <div className="flex justify-center">
                      <span className="inline-flex shrink-0 rounded-full border border-[#d4dced] bg-[#f7f9fe] px-3 py-1 text-center text-xs font-semibold text-[#2a3d5f]">
                        {formatStatusLabel(item.status)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        </section>
    </section>
  );
}

