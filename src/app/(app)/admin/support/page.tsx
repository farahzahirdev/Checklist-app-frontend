'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { translate, useLocale } from '@/lib/i18n';
import {
  getAdminSupportTicket,
  listAdminSupportTickets,
  replyToSupportTicket,
  SUPPORT_TICKET_MESSAGE_MAX_LENGTH,
  updateSupportTicketStatus,
  type SupportTicket,
  type SupportTicketStatus,
} from '@/lib/support-tickets';
import {
  ADMIN_PAGE_HERO_EYEBROW_CLASS,
  ADMIN_PAGE_HERO_HEADER_CLASS,
  ADMIN_PAGE_HERO_SUBTITLE_CLASS,
  ADMIN_PAGE_HERO_TITLE_CLASS,
} from '@/app/(app)/admin/admin-page-title';
import { adminSupportMessages } from '@/locales/admin-support';

const STATUS_OPTIONS: Array<SupportTicketStatus> = ['open', 'waiting_customer', 'resolved', 'closed'];

function formatDate(value: string | null | undefined) {
  if (!value) return 'n/a';
  return new Date(value).toLocaleString();
}

export default function AdminSupportPage() {
  const { locale } = useLocale();
  const t = (key: string, values?: Record<string, string>) => translate(adminSupportMessages, locale, key, values);
  const statusLabel = (status: SupportTicketStatus) => t(`status.${status}`);
  const roleLabel = (role: string) => translate(adminSupportMessages, locale, `role.${role}`) || role;
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState<SupportTicketStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<'load' | 'reply' | 'status' | ''>('');

  async function loadTickets(selectFirst = false) {
    setLoading(true);
    try {
      const response = await listAdminSupportTickets({
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: search.trim() || undefined,
      });
      setTickets(response.tickets);
      const nextSelected = selectFirst ? response.tickets[0]?.id ?? '' : selectedTicketId;
      if (nextSelected) {
        setSelectedTicketId(nextSelected);
        await loadTicket(nextSelected);
      } else {
        setSelectedTicket(null);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.loadTickets'));
    } finally {
      setLoading(false);
    }
  }

  async function loadTicket(ticketId: string) {
    if (!ticketId) {
      setSelectedTicket(null);
      return;
    }
    setDetailLoading(true);
    setActionLoading('load');
    try {
      const ticket = await getAdminSupportTicket(ticketId);
      setSelectedTicket(ticket);
      setReplyMessage('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.loadTicket'));
    } finally {
      setDetailLoading(false);
      setActionLoading('');
    }
  }

  useEffect(() => {
    void loadTickets(true);
  }, [statusFilter]);

  async function onReplyTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedTicketId) {
      toast.error(t('errors.selectTicket'));
      return;
    }
    if (!replyMessage.trim()) {
      toast.error(t('errors.replyRequired'));
      return;
    }
    if (replyMessage.length > SUPPORT_TICKET_MESSAGE_MAX_LENGTH) {
      toast.error(t('errors.replyTooLong', { max: String(SUPPORT_TICKET_MESSAGE_MAX_LENGTH) }));
      return;
    }
    setActionLoading('reply');
    try {
      const ticket = await replyToSupportTicket(selectedTicketId, { message: replyMessage });
      setSelectedTicket(ticket);
      setTickets((current) => current.map((item) => (item.id === ticket.id ? ticket : item)));
      setReplyMessage('');
      toast.success(t('success.replySent'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.replyFailed'));
    } finally {
      setActionLoading('');
    }
  }

  async function onUpdateStatus(nextStatus: SupportTicketStatus) {
    if (!selectedTicketId) {
      toast.error(t('errors.selectTicket'));
      return;
    }
    setActionLoading('status');
    try {
      const ticket = await updateSupportTicketStatus(selectedTicketId, { status: nextStatus });
      setSelectedTicket(ticket);
      setTickets((current) => current.map((item) => (item.id === ticket.id ? ticket : item)));
      toast.success(t('success.statusUpdated'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.statusFailed'));
    } finally {
      setActionLoading('');
    }
  }

  return (
    <section className="space-y-5">
      <header className={ADMIN_PAGE_HERO_HEADER_CLASS}>
        <p className={ADMIN_PAGE_HERO_EYEBROW_CLASS}>{t('hero.eyebrow')}</p>
        <h1 className={ADMIN_PAGE_HERO_TITLE_CLASS}>{t('hero.title')}</h1>
        <p className={ADMIN_PAGE_HERO_SUBTITLE_CLASS}>{t('hero.subtitle')}</p>
      </header>

      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <article className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm">
          <form
            className="space-y-2"
            onSubmit={(event) => {
              event.preventDefault();
              void loadTickets(false);
            }}
          >
            <div className="min-w-0 flex items-center gap-2">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('search.placeholder')}
                className="min-w-0 flex-1 rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm text-[#2a3d5f] outline-none focus:border-[#7ea6e7]"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl border border-[#1f2d45] bg-[#1f2d45] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {loading ? t('search.loading') : t('search.button')}
              </button>
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as SupportTicketStatus | 'all')}
              className="w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm text-[#2a3d5f] outline-none focus:border-[#7ea6e7] sm:w-auto"
            >
              <option value="all">{t('filter.allStatuses')}</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {statusLabel(option)}
                </option>
              ))}
            </select>
          </form>

          <div className="mt-4 space-y-2">
            {!tickets.length ? (
              <p className="rounded-xl border border-[#dbe4f4] bg-[#f9fbff] px-4 py-3 text-sm text-[#607594]">
                {loading ? t('list.loading') : t('list.empty')}
              </p>
            ) : (
              tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => {
                    setSelectedTicketId(ticket.id);
                    void loadTicket(ticket.id);
                  }}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                    selectedTicketId === ticket.id ? 'border-[#2f7dff] bg-[#edf4ff]' : 'border-[#dbe4f4] bg-white hover:bg-[#f7f9fe]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#1f2d45]">{ticket.subject}</p>
                      <p className="mt-1 truncate text-xs text-[#607594]">{ticket.customer_email}</p>
                      <p className="mt-1 text-xs text-[#607594]">{t('ticket.updated')} {formatDate(ticket.last_message_at ?? ticket.updated_at)}</p>
                    </div>
                    <span className="shrink-0 rounded-full border border-[#d4dced] bg-white px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5b6f91]">
                      {statusLabel(ticket.status)}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eef2fa] pb-4">
            <div>
              <h2 className="text-xl font-semibold text-[#243555]">{t('detail.title')}</h2>
              <p className="text-sm text-[#607594]">{t('detail.subtitle')}</p>
            </div>
            {selectedTicket ? (
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-[#d4dced] bg-[#f7f9fe] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#5b6f91]">
                  {statusLabel(selectedTicket.status)}
                </span>
                <select
                  value={selectedTicket.status}
                  onChange={(event) => void onUpdateStatus(event.target.value as SupportTicketStatus)}
                  className="rounded-xl border border-[#d4dced] bg-white px-3 py-1.5 text-xs text-[#2a3d5f] outline-none focus:border-[#7ea6e7]"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {statusLabel(option)}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>

          {!selectedTicket ? (
            <p className="mt-5 rounded-xl border border-[#dbe4f4] bg-[#f9fbff] px-4 py-3 text-sm text-[#607594]">
              {detailLoading ? t('detail.loading') : t('detail.empty')}
            </p>
          ) : (
            <>
              <div className="mt-5 space-y-4">
                {selectedTicket.messages.map((entry) => (
                  <div
                    key={entry.id}
                    className={`max-w-3xl rounded-2xl border px-4 py-3 ${
                      entry.sender_role === 'admin' ? 'ml-auto border-[#2f7dff] bg-[#edf4ff]' : 'border-[#dbe4f4] bg-[#f9fbff]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 text-xs text-[#607594]">
                      <span className="font-semibold uppercase tracking-[0.16em]">{roleLabel(entry.sender_role)}</span>
                      <span>{formatDate(entry.created_at)}</span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#243555]">{entry.body}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={onReplyTicket} className="mt-6 space-y-3 border-t border-[#eef2fa] pt-4">
                <label className="block space-y-2 text-sm">
                  <span className="font-medium text-[#566b8d]">{t('reply.label')}</span>
                  <textarea
                    value={replyMessage}
                    maxLength={SUPPORT_TICKET_MESSAGE_MAX_LENGTH}
                    onChange={(event) => setReplyMessage(event.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-[#2a3d5f] outline-none focus:border-[#7ea6e7] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0"
                    placeholder={t('reply.placeholder')}
                  />
                </label>
                <button
                  type="submit"
                  disabled={actionLoading === 'reply'}
                  className="rounded-xl border border-[#1f2d45] bg-[#1f2d45] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                >
                  {actionLoading === 'reply' ? t('reply.sending') : t('reply.send')}
                </button>
              </form>
            </>
          )}
        </article>
      </div>
    </section>
  );
}
