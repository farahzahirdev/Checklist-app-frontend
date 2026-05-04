'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import {
  formatSupportTicketStatus,
  getAdminSupportTicket,
  listAdminSupportTickets,
  replyToSupportTicket,
  updateSupportTicketStatus,
  type SupportTicket,
  type SupportTicketStatus,
} from '@/lib/support-tickets';

const STATUS_OPTIONS: Array<SupportTicketStatus> = ['open', 'waiting_customer', 'resolved', 'closed'];

function formatDate(value: string | null | undefined) {
  if (!value) return 'n/a';
  return new Date(value).toLocaleString();
}

export default function AdminSupportPage() {
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
      toast.error(err instanceof Error ? err.message : 'Failed to load support tickets.');
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
      toast.error(err instanceof Error ? err.message : 'Failed to load ticket.');
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
      toast.error('Select a ticket first.');
      return;
    }
    if (!replyMessage.trim()) {
      toast.error('Reply message is required.');
      return;
    }
    setActionLoading('reply');
    try {
      const ticket = await replyToSupportTicket(selectedTicketId, { message: replyMessage });
      setSelectedTicket(ticket);
      setTickets((current) => current.map((item) => (item.id === ticket.id ? ticket : item)));
      setReplyMessage('');
      toast.success('Reply sent.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reply to ticket.');
    } finally {
      setActionLoading('');
    }
  }

  async function onUpdateStatus(nextStatus: SupportTicketStatus) {
    if (!selectedTicketId) {
      toast.error('Select a ticket first.');
      return;
    }
    setActionLoading('status');
    try {
      const ticket = await updateSupportTicketStatus(selectedTicketId, { status: nextStatus });
      setSelectedTicket(ticket);
      setTickets((current) => current.map((item) => (item.id === ticket.id ? ticket : item)));
      toast.success('Ticket status updated.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update ticket status.');
    } finally {
      setActionLoading('');
    }
  }

  return (
    <section className="space-y-5">
      <header className="rounded-2xl border border-[#dbe4f4] bg-white px-5 py-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6f82a3]">Admin Support</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1f2d45]">Support console</h1>
        <p className="mt-2 text-sm text-[#607594]">Review customer tickets and reply from the support team.</p>
      </header>

      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <article className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by subject or customer email"
              className="min-w-0 flex-1 rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm text-[#2a3d5f] outline-none focus:border-[#7ea6e7]"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as SupportTicketStatus | 'all')}
              className="rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm text-[#2a3d5f] outline-none focus:border-[#7ea6e7]"
            >
              <option value="all">All statuses</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {formatSupportTicketStatus(option, 'admin')}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void loadTickets(false)}
              disabled={loading}
              className="rounded-xl border border-[#1f2d45] bg-[#1f2d45] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              {loading ? 'Loading…' : 'Search'}
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {!tickets.length ? (
              <p className="rounded-xl border border-[#dbe4f4] bg-[#f9fbff] px-4 py-3 text-sm text-[#607594]">
                {loading ? 'Loading tickets…' : 'No support tickets found.'}
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
                      <p className="mt-1 text-xs text-[#607594]">Updated {formatDate(ticket.last_message_at ?? ticket.updated_at)}</p>
                    </div>
                    <span className="shrink-0 rounded-full border border-[#d4dced] bg-white px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5b6f91]">
                      {formatSupportTicketStatus(ticket.status, 'admin')}
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
              <h2 className="text-xl font-semibold text-[#243555]">Ticket detail</h2>
              <p className="text-sm text-[#607594]">Reply and update status from here.</p>
            </div>
            {selectedTicket ? (
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-[#d4dced] bg-[#f7f9fe] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#5b6f91]">
                  {formatSupportTicketStatus(selectedTicket.status, 'admin')}
                </span>
                <select
                  value={selectedTicket.status}
                  onChange={(event) => void onUpdateStatus(event.target.value as SupportTicketStatus)}
                  className="rounded-xl border border-[#d4dced] bg-white px-3 py-1.5 text-xs text-[#2a3d5f] outline-none focus:border-[#7ea6e7]"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {formatSupportTicketStatus(option, 'admin')}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>

          {!selectedTicket ? (
            <p className="mt-5 rounded-xl border border-[#dbe4f4] bg-[#f9fbff] px-4 py-3 text-sm text-[#607594]">
              {detailLoading ? 'Loading ticket…' : 'Select a ticket to review the thread.'}
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
                      <span className="font-semibold uppercase tracking-[0.16em]">{entry.sender_role}</span>
                      <span>{formatDate(entry.created_at)}</span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#243555]">{entry.body}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={onReplyTicket} className="mt-6 space-y-3 border-t border-[#eef2fa] pt-4">
                <label className="block space-y-2 text-sm">
                  <span className="font-medium text-[#566b8d]">Reply</span>
                  <textarea
                    value={replyMessage}
                    onChange={(event) => setReplyMessage(event.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-[#2a3d5f] outline-none focus:border-[#7ea6e7]"
                    placeholder="Respond to the customer here"
                  />
                </label>
                <button
                  type="submit"
                  disabled={actionLoading === 'reply'}
                  className="rounded-xl border border-[#1f2d45] bg-[#1f2d45] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                >
                  {actionLoading === 'reply' ? 'Sending…' : 'Send reply'}
                </button>
              </form>
            </>
          )}
        </article>
      </div>
    </section>
  );
}
