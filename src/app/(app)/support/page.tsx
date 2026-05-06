'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import {
  createMySupportTicket,
  formatSupportTicketStatus,
  getMySupportTicket,
  listMySupportTickets,
  replyMySupportTicket,
  type SupportTicket,
} from '@/lib/support-tickets';
import { translate, useLocale } from '@/lib/i18n';
import { customerSupportMessages } from '@/locales/customer-support';

function formatDate(value: string | null | undefined) {
  if (!value) return 'n/a';
  return new Date(value).toLocaleString();
}

export default function SupportPage() {
  const { locale } = useLocale();
  const t = (key: string) => translate(customerSupportMessages, locale, key);
  const roleLabel = (role: string) => translate(customerSupportMessages, locale, `role.${role}`) || role;
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<'create' | 'load' | 'reply' | ''>('');

  async function loadTickets(selectFirst = false) {
    setLoading(true);
    try {
      const response = await listMySupportTickets();
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
      const ticket = await getMySupportTicket(ticketId);
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
  }, []);

  async function onCreateTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error(t('errors.requiredSubjectMessage'));
      return;
    }
    setActionLoading('create');
    try {
      const ticket = await createMySupportTicket({ subject, message });
      toast.success(t('success.ticketCreated'));
      setSubject('');
      setMessage('');
      await loadTickets(false);
      setSelectedTicketId(ticket.id);
      setSelectedTicket(ticket);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.createTicket'));
    } finally {
      setActionLoading('');
    }
  }

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
    setActionLoading('reply');
    try {
      const ticket = await replyMySupportTicket(selectedTicketId, { message: replyMessage });
      setSelectedTicket(ticket);
      setTickets((current) => current.map((item) => (item.id === ticket.id ? ticket : item)));
      setReplyMessage('');
      toast.success(t('success.replyAdded'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.replyFailed'));
    } finally {
      setActionLoading('');
    }
  }

  return (
    <section className="space-y-5">
      <header className="rounded-2xl border border-[#1f3f73] bg-[linear-gradient(120deg,#071733,#0c2144_45%,#13356d)] px-5 py-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9dc5ff]">{t('hero.kicker')}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">{t('hero.title')}</h1>
        <p className="mt-2 text-sm text-[#b9cdef]">{t('hero.subtitle')}</p>
      </header>

      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <article className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-[#243555]">{t('create.title')}</h2>
          <form className="mt-4 space-y-3" onSubmit={onCreateTicket}>
            <label className="block space-y-2 text-sm">
              <span className="font-medium text-[#566b8d]">{t('fields.subject')}</span>
              <input
                type="text"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-[#2a3d5f] outline-none focus:border-[#7ea6e7]"
                placeholder={t('fields.subjectPlaceholder')}
              />
            </label>
            <label className="block space-y-2 text-sm">
              <span className="font-medium text-[#566b8d]">{t('fields.message')}</span>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={5}
                className="w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-[#2a3d5f] outline-none focus:border-[#7ea6e7]"
                placeholder={t('fields.messagePlaceholder')}
              />
            </label>
            <button
              type="submit"
              disabled={actionLoading === 'create'}
              className="rounded-xl border border-[#1f2d45] bg-[#1f2d45] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              {actionLoading === 'create' ? t('actions.sending') : t('actions.submitTicket')}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-[#243555]">{t('list.title')}</h2>
            <button
              type="button"
              onClick={() => void loadTickets(false)}
              disabled={loading}
              className="rounded-lg border border-[#d4dced] px-3 py-1.5 text-xs font-semibold text-[#2a3d5f] hover:bg-[#f6f9ff] disabled:opacity-60"
            >
              {loading ? t('actions.refreshing') : t('actions.refresh')}
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {!tickets.length ? (
              <p className="rounded-xl border border-[#dbe4f4] bg-[#f9fbff] px-4 py-3 text-sm text-[#607594]">
                {loading ? t('empty.loadingTickets') : t('empty.noTickets')}
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
                      <p className="mt-1 text-xs text-[#607594]">{t('ticket.updated')} {formatDate(ticket.last_message_at ?? ticket.updated_at)}</p>
                    </div>
                    <span className="shrink-0 rounded-full border border-[#d4dced] bg-white px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5b6f91]">
                      {formatSupportTicketStatus(ticket.status, 'customer')}
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
              <h2 className="text-xl font-semibold text-[#243555]">{t('thread.title')}</h2>
              <p className="text-sm text-[#607594]">{t('thread.subtitle')}</p>
            </div>
            {selectedTicket ? (
              <span className="rounded-full border border-[#d4dced] bg-[#f7f9fe] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#5b6f91]">
                {formatSupportTicketStatus(selectedTicket.status, 'customer')}
              </span>
            ) : null}
          </div>

          {!selectedTicket ? (
            <p className="mt-5 rounded-xl border border-[#dbe4f4] bg-[#f9fbff] px-4 py-3 text-sm text-[#607594]">
              {detailLoading ? t('thread.loading') : t('thread.empty')}
            </p>
          ) : (
            <>
              <div className="mt-5 space-y-4">
                {selectedTicket.messages.map((entry) => (
                  <div
                    key={entry.id}
                    className={`max-w-3xl rounded-2xl border px-4 py-3 ${
                      entry.sender_role === 'customer' ? 'ml-auto border-[#2f7dff] bg-[#edf4ff]' : 'border-[#dbe4f4] bg-[#f9fbff]'
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
                    onChange={(event) => setReplyMessage(event.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-[#2a3d5f] outline-none focus:border-[#7ea6e7]"
                    placeholder={t('reply.placeholder')}
                  />
                </label>
                <button
                  type="submit"
                  disabled={actionLoading === 'reply'}
                  className="rounded-xl border border-[#1f2d45] bg-[#1f2d45] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                >
                  {actionLoading === 'reply' ? t('actions.sending') : t('actions.sendReply')}
                </button>
              </form>
            </>
          )}
        </article>
      </div>
    </section>
  );
}
