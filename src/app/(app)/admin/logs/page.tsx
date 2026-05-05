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

function humanizeToken(value: string | null | undefined) {
  if (!value) return '-';
  return value
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function toIsoFromDate(value: string, endOfDay = false): string | undefined {
  if (!value.trim()) return undefined;
  const date = new Date(`${value}T00:00:00`);
  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  }
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

type DropdownOption = { value: string; label: string };
type DropdownGroup = { label: string; options: DropdownOption[] };

const hiddenScrollbar = '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0';

function CustomDropdown({
  value,
  onChange,
  placeholder,
  options,
  groups,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options?: DropdownOption[];
  groups?: DropdownGroup[];
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selectedLabel = useMemo(() => {
    if (!value) return placeholder;
    const flat = [...(options ?? []), ...(groups?.flatMap((group) => group.options) ?? [])];
    return flat.find((option) => option.value === value)?.label ?? placeholder;
  }, [groups, options, placeholder, value]);

  return (
    <div
      className="relative"
      onBlur={(event) => {
        const next = event.relatedTarget as Node | null;
        if (next && event.currentTarget.contains(next)) return;
        setOpen(false);
      }}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm text-[#2a3d5f] outline-none focus:border-[#7ea6e7] disabled:opacity-50"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate text-left">{selectedLabel}</span>
        <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-[#425f8f]" fill="none" aria-hidden="true">
          <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open ? (
        <div
          className={`absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-[#d4dced] bg-white p-1 shadow-[0_10px_30px_rgba(15,23,42,0.14)] ${hiddenScrollbar}`}
          onWheel={(event) => {
            const el = event.currentTarget;
            const atTop = el.scrollTop <= 0;
            const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
            if ((event.deltaY < 0 && atTop) || (event.deltaY > 0 && atBottom)) {
              event.preventDefault();
            }
          }}
        >
          {(groups ?? []).map((group) => (
            <div key={group.label} className="mb-1">
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-black">{group.label}</p>
              {group.options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={value === option.value}
                  className={`w-full rounded-lg px-2 py-1.5 text-left text-xs ${value === option.value ? 'bg-[#e9f1ff] text-[#10284F]' : 'text-[#2a3d5f] hover:bg-[#f4f7ff]'}`}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ))}
          {(options ?? []).map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={value === option.value}
              className={`w-full rounded-lg px-2 py-1.5 text-left text-xs ${value === option.value ? 'bg-[#e9f1ff] text-[#10284F]' : 'text-[#2a3d5f] hover:bg-[#f4f7ff]'}`}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
      <svg viewBox="0 0 20 20" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-transparent" fill="none" aria-hidden="true">
        <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
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
          <label className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6f82a3]">Action</span>
            <CustomDropdown
              value={action}
              onChange={(value) => {
                setAction(value);
                setSkip(0);
              }}
              placeholder="All actions"
              disabled={loadingFilterOptions}
              groups={
                filterOptions
                  ? Object.entries(filterOptions.actions).map(([category, actions]) => ({
                      label: category,
                      options: actions.map((actionOption) => ({ value: actionOption.value, label: actionOption.label })),
                    }))
                  : []
              }
            />
          </label>
          <label className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6f82a3]">Role</span>
            <CustomDropdown
              value={actorRole}
              onChange={(value) => {
                setActorRole(value);
                setSkip(0);
              }}
              placeholder="All roles"
              disabled={loadingFilterOptions}
              options={(filterOptions?.actor_roles ?? []).map((role) => ({ value: role.value, label: role.label }))}
            />
          </label>
          <label className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6f82a3]">Result</span>
            <CustomDropdown
              value={successFilter}
              onChange={(value) => {
                setSuccessFilter(value as 'all' | 'success' | 'failed');
                setSkip(0);
              }}
              placeholder="All status"
              options={[
                { value: 'all', label: 'All status' },
                { value: 'success', label: 'Success only' },
                { value: 'failed', label: 'Failed only' },
              ]}
            />
          </label>
          <label className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6f82a3]">From</span>
            <input
              ref={dateFromRef}
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setSkip(0);
              }}
              onClick={() => openNativePicker(dateFromRef)}
              className="w-full appearance-auto rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6f82a3]">To</span>
            <input
              ref={dateToRef}
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setSkip(0);
              }}
              onClick={() => openNativePicker(dateToRef)}
              className="w-full appearance-auto rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm"
            />
          </label>
          <div className="md:col-span-5 flex flex-wrap items-end gap-2">
            <label className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6f82a3]">Sort</span>
              <CustomDropdown
                value={orderDirection}
                onChange={(value) => {
                  setOrderDirection(value as 'asc' | 'desc');
                  setSkip(0);
                }}
                placeholder="Newest first"
                options={[
                  { value: 'desc', label: 'Newest first' },
                  { value: 'asc', label: 'Oldest first' },
                ]}
              />
            </label>
            <label className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6f82a3]">Rows</span>
              <CustomDropdown
                value={String(limit)}
                onChange={(value) => {
                  setLimit(Number(value));
                  setSkip(0);
                }}
                placeholder="25 / page"
                options={[
                  { value: '25', label: '25 / page' },
                  { value: '50', label: '50 / page' },
                  { value: '100', label: '100 / page' },
                ]}
              />
            </label>
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
                const actor = log.actor_name || log.actor_email || (log.actor_role ? humanizeToken(log.actor_role) : 'Unknown');
                const targetRaw = log.target_user_email || log.target_user_name || log.target_entity || log.target_id || '-';
                const target = targetRaw.includes('@') ? targetRaw : humanizeToken(targetRaw);
                return (
                <tr key={log.id} className="border-b border-[#edf2f9] last:border-0">
                  <td className="py-3 pr-4 font-semibold text-[#25375a]">{actor}</td>
                  <td className="py-3 pr-4 text-[#5f7395]">{humanizeToken(log.action)}</td>
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
