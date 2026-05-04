'use client';

import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { toast } from 'sonner';
import { listAuditLogs, getAuditLogFilterOptions, type AuditLog, type ListAuditLogsParams, type AuditLogFilterOptions } from '@/lib/audit-logs';
import {
  ADMIN_PAGE_HERO_EYEBROW_CLASS,
  ADMIN_PAGE_HERO_HEADER_CLASS,
  ADMIN_PAGE_HERO_SUBTITLE_CLASS,
  ADMIN_PAGE_HERO_TITLE_CLASS,
} from '@/app/(app)/admin/admin-page-title';

const severityClass: Record<string, string> = {
  Info: 'bg-[#eaf2ff] text-[#3f74df]',
  Warning: 'bg-[#fff4df] text-[#b6862f]',
  Critical: 'bg-[#ffedf0] text-[#cc5163]',
};

function severityFromLog(log: AuditLog): 'Info' | 'Warning' | 'Critical' {
  if (log.success === false || log.error_message) return 'Critical';
  if ((log.actor_role || '').toLowerCase() === 'system') return 'Warning';
  return 'Info';
}

function formatTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function toIsoFromDate(value: string, endOfDay = false): string | undefined {
  if (!value.trim()) return undefined;
  const date = new Date(`${value}T00:00:00`);
  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  }
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export default function AdminAuditLogsPage() {
  const dateFromRef = useRef<HTMLInputElement | null>(null);
  const dateToRef = useRef<HTMLInputElement | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState<AuditLogFilterOptions | null>(null);
  const [loadingFilterOptions, setLoadingFilterOptions] = useState(true);
  const [action, setAction] = useState('');
  const [actorRole, setActorRole] = useState('');
  const [successFilter, setSuccessFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('desc');
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(25);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.floor(skip / limit) + 1;

  const query = useMemo<ListAuditLogsParams>(
    () => ({
      skip,
      limit,
      order_by: 'created_at',
      order_direction: orderDirection,
      action: action.trim() || undefined,
      actor_role: actorRole.trim() || undefined,
      success: successFilter === 'all' ? undefined : successFilter === 'success',
      date_from: toIsoFromDate(dateFrom),
      date_to: toIsoFromDate(dateTo, true),
    }),
    [action, actorRole, dateFrom, dateTo, limit, orderDirection, skip, successFilter],
  );

  useEffect(() => {
    async function loadFilterOptions() {
      setLoadingFilterOptions(true);
      try {
        const options = await getAuditLogFilterOptions();
        setFilterOptions(options);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to load filter options');
      } finally {
        setLoadingFilterOptions(false);
      }
    }

    void loadFilterOptions();
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const response = await listAuditLogs(query);
        setLogs(Array.isArray(response.logs) ? response.logs : []);
        setTotal(typeof response.total === 'number' ? response.total : 0);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [query]);

  function onApplyFilters() {
    setSkip(0);
  }

  function exportCurrentRowsCsv() {
    if (!logs.length) {
      toast.error('No rows to export.');
      return;
    }
    const header = ['id', 'actor', 'action', 'target', 'success', 'timestamp'];
    const rows = logs.map((log) => [
      log.id,
      log.actor_name || log.actor_email || log.actor_role || 'Unknown',
      log.action || '-',
      log.target_user_email || log.target_user_name || log.target_entity || log.target_id || '-',
      String(log.success ?? ''),
      log.created_at,
    ]);
    const csv = [header, ...rows]
      .map((cols) => cols.map((col) => `"${String(col).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-page-${currentPage}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function openNativePicker(ref: RefObject<HTMLInputElement | null>) {
    if (!ref.current) return;
    if (typeof ref.current.showPicker === 'function') {
      try {
        ref.current.showPicker();
      } catch {
        ref.current.focus();
      }
      return;
    }
    ref.current.focus();
  }

  return (
    <section className="space-y-4">
      <header className={ADMIN_PAGE_HERO_HEADER_CLASS}>
        <p className={ADMIN_PAGE_HERO_EYEBROW_CLASS}>Audit Logs</p>
        <h1 className={ADMIN_PAGE_HERO_TITLE_CLASS}>Activity Audit Trail</h1>
        <p className={ADMIN_PAGE_HERO_SUBTITLE_CLASS}>Security-sensitive actions and system events for compliance review.</p>
      </header>

      <article className="overflow-hidden rounded-2xl border border-[#e2e8f5] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ecf0f8] px-4 py-3">
          <h2 className="text-xl font-semibold text-[#243555]">Recent Events</h2>
          <div className="flex items-center gap-2">
            <button type="button" onClick={exportCurrentRowsCsv} className="rounded-xl border border-[#2d4f83] bg-[#182843] px-4 py-2 text-sm font-semibold text-white hover:bg-[#223657]">
              Download CSV
            </button>
          </div>
        </div>

        <div className="grid gap-2 border-b border-[#ecf0f8] bg-[#f8fbff] px-4 py-3 md:grid-cols-5">
          <select 
            value={action} 
            onChange={(e) => setAction(e.target.value)} 
            disabled={loadingFilterOptions}
            className="rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm disabled:opacity-50"
          >
            <option value="">All actions</option>
            {filterOptions && Object.entries(filterOptions.actions).map(([category, actions]) => (
              <optgroup key={category} label={category}>
                {actions.map((actionOption) => (
                  <option key={actionOption.value} value={actionOption.value}>
                    {actionOption.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <select 
            value={actorRole} 
            onChange={(e) => setActorRole(e.target.value)} 
            disabled={loadingFilterOptions}
            className="rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm disabled:opacity-50"
          >
            <option value="">All roles</option>
            {filterOptions?.actor_roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
          <select value={successFilter} onChange={(e) => setSuccessFilter(e.target.value as 'all' | 'success' | 'failed')} className="rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm">
            <option value="all">All status</option>
            <option value="success">Success only</option>
            <option value="failed">Failed only</option>
          </select>
          <input
            ref={dateFromRef}
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            onClick={() => openNativePicker(dateFromRef)}
            className="appearance-auto rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm"
          />
          <input
            ref={dateToRef}
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            onClick={() => openNativePicker(dateToRef)}
            className="appearance-auto rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm"
          />
          <div className="md:col-span-5 flex flex-wrap items-center gap-2">
            <button type="button" onClick={onApplyFilters} className="rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm font-semibold text-[#425f8f]">
              Apply Filters
            </button>
            <button
              type="button"
              onClick={() => setOrderDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
              className="rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm font-semibold text-[#425f8f]"
            >
              Sort: {orderDirection === 'desc' ? 'Newest first' : 'Oldest first'}
            </button>
            <select value={String(limit)} onChange={(e) => { setLimit(Number(e.target.value)); setSkip(0); }} className="rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm">
              <option value="25">25 / page</option>
              <option value="50">50 / page</option>
              <option value="100">100 / page</option>
            </select>
            <p className="ml-auto text-xs text-[#607594]">Total: {total}</p>
          </div>
        </div>

        <div className="overflow-x-auto px-4 py-3">
          <table className="min-w-full text-left text-sm text-[#2b3e60]">
            <thead className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7a8ca8]">
              <tr className="border-b border-[#edf2f9]">
                <th className="py-2 pr-4">Actor</th>
                <th className="py-2 pr-4">Action</th>
                <th className="py-2 pr-4">Target</th>
                <th className="py-2 pr-4">Timestamp</th>
                <th className="py-2">Severity</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-[#607594]">Loading audit logs...</td>
                </tr>
              ) : null}
              {!loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-[#607594]">No audit logs found for the selected filters.</td>
                </tr>
              ) : null}
              {logs.map((log) => {
                const severity = severityFromLog(log);
                const actor = log.actor_name || log.actor_email || log.actor_role || 'Unknown';
                const target = log.target_user_email || log.target_user_name || log.target_entity || log.target_id || '-';
                return (
                <tr key={log.id} className="border-b border-[#edf2f9] last:border-0">
                  <td className="py-3 pr-4 font-semibold text-[#25375a]">{actor}</td>
                  <td className="py-3 pr-4 text-[#5f7395]">{log.action || '-'}</td>
                  <td className="py-3 pr-4 text-[#5f7395]">{target}</td>
                  <td className="py-3 pr-4 text-[#5f7395]">{formatTimestamp(log.created_at)}</td>
                  <td className="py-3">
                    <span className={`rounded-md px-2 py-1 text-xs font-semibold ${severityClass[severity]}`}>{severity}</span>
                  </td>
                </tr>
              );
              })}
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
          <p className="text-xs text-[#607594]">
            Page {Math.min(currentPage, totalPages)} of {totalPages}
          </p>
          <button
            type="button"
            onClick={() => setSkip((prev) => (prev + limit < total ? prev + limit : prev))}
            disabled={skip + limit >= total || loading}
            className="rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm font-semibold text-[#425f8f] disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </article>
    </section>
  );
}
