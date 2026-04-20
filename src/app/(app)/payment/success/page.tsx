'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { listPublishedCustomerChecklists, selectChecklistAfterPayment, type CustomerChecklist } from '@/lib/checklist-api';
import { getUserPaymentStatus, type PaymentStatusResponse } from '@/lib/payments';

export default function PaymentSuccessPage() {
  const [checklists, setChecklists] = useState<CustomerChecklist[]>([]);
  const [selectedChecklistId, setSelectedChecklistId] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResponse['payment_status'] | ''>('');
  const [statusMessage, setStatusMessage] = useState('');
  const [selectedChecklistFromStatus, setSelectedChecklistFromStatus] = useState<PaymentStatusResponse['checklist']>(null);
  const [accessExpiresAt, setAccessExpiresAt] = useState<string | null>(null);

  const selectedChecklist = useMemo(
    () => checklists.find((item) => item.id === selectedChecklistId) ?? null,
    [checklists, selectedChecklistId],
  );

  useEffect(() => {
    let mounted = true;
    let pollTimeout: number | null = null;
    let currentUserId = '';

    async function loadChecklists() {
      try {
        const response = await listPublishedCustomerChecklists();
        if (!mounted) {
          return;
        }
        setChecklists(response);
        if (response.length) {
          setSelectedChecklistId(response[0].id);
        }
      } catch (err) {
        if (!mounted) {
          return;
        }
        setError(err instanceof Error ? err.message : 'Failed to load checklists.');
      }
    }

    async function checkStatusAndMaybePoll() {
      setLoading(true);
      setError('');
      try {
        if (!currentUserId) {
          const me = await getCurrentUser();
          currentUserId = me.user.id;
        }
        const response = await getUserPaymentStatus(currentUserId);
        if (!mounted) {
          return;
        }
        setPaymentStatus(response.payment_status);
        setSelectedChecklistFromStatus(response.checklist);
        setAccessExpiresAt(response.access_expires_at);

        if (response.payment_status === 'succeeded') {
          if (response.checklist) {
            setStatusMessage('Payment confirmed and checklist access is already active.');
          } else {
            setStatusMessage('Payment confirmed. Select a checklist to activate access.');
            await loadChecklists();
          }
        } else if (response.payment_status === 'pending') {
          setStatusMessage('Payment is still processing. We will refresh automatically.');
          pollTimeout = window.setTimeout(() => {
            void checkStatusAndMaybePoll();
          }, 3000);
        } else {
          setStatusMessage('Payment failed. Please retry checkout.');
        }
      } catch (err) {
        if (!mounted) {
          return;
        }
        setError(err instanceof Error ? err.message : 'Failed to fetch payment status.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void checkStatusAndMaybePoll();
    return () => {
      mounted = false;
      if (pollTimeout) {
        window.clearTimeout(pollTimeout);
      }
    };
  }, []);

  async function onSelectChecklist() {
    setError('');
    setSuccessMessage('');
    if (!selectedChecklistId) {
      setError('Select a checklist first.');
      return;
    }

    setSubmitting(true);
    try {
      const grant = await selectChecklistAfterPayment(selectedChecklistId);
      setSuccessMessage(`Access granted until ${new Date(grant.expires_at).toLocaleString()}.`);
      window.location.assign(`/access?checklist_id=${encodeURIComponent(selectedChecklistId)}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to activate checklist access.';
      if (message.includes('checklist_already_selected')) {
        window.location.assign('/access');
        return;
      }
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/85">Payment complete</p>
        <h1 className="text-3xl font-semibold text-white">Select your checklist</h1>
        <p className="text-sm text-[#97a5bb]">
          Choose one checklist to activate your 7-day customer access window.
        </p>
      </header>

      <article className="rounded-2xl border border-white/15 bg-black/25 p-5">
        {loading ? <p className="text-sm text-zinc-200">Checking payment status...</p> : null}
        {statusMessage ? <p className="text-sm text-zinc-200">{statusMessage}</p> : null}

        {!loading && paymentStatus === 'succeeded' && !selectedChecklistFromStatus && !checklists.length ? (
          <p className="text-sm text-amber-200">No published checklists are available yet.</p>
        ) : null}

        {paymentStatus === 'succeeded' && selectedChecklistFromStatus ? (
          <div className="space-y-3">
            <div className="rounded-lg border border-white/15 bg-white/5 p-3 text-sm text-zinc-200">
              <p className="font-semibold text-white">{selectedChecklistFromStatus.title}</p>
              <p className="mt-1 text-zinc-300">Selected checklist version: v{selectedChecklistFromStatus.version}</p>
              {accessExpiresAt ? (
                <p className="mt-1 text-zinc-300">Access active until: {new Date(accessExpiresAt).toLocaleString()}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <Link href="/access" className="rounded-lg border border-cyan-300/40 bg-cyan-500/15 px-3 py-2 text-cyan-100">
                Go to Access
              </Link>
              <Link href="/dashboard" className="rounded-lg border border-white/20 px-3 py-2 text-zinc-100 hover:bg-white/10">
                Dashboard
              </Link>
            </div>
          </div>
        ) : null}

        {paymentStatus === 'succeeded' && !selectedChecklistFromStatus && checklists.length ? (
          <div className="space-y-3">
            <label className="block space-y-2 text-sm">
              <span className="text-zinc-200">Checklist</span>
              <select
                value={selectedChecklistId}
                onChange={(event) => setSelectedChecklistId(event.target.value)}
                className="w-full rounded-lg border border-white/20 bg-[#0d1d3a] px-3 py-2 text-white outline-none ring-cyan-300/50 focus:ring"
              >
                {checklists.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title} ({item.version})
                  </option>
                ))}
              </select>
            </label>

            {selectedChecklist ? (
              <div className="rounded-lg border border-white/15 bg-white/5 p-3 text-sm text-zinc-200">
                <p className="font-semibold text-white">{selectedChecklist.title}</p>
                <p className="mt-1 text-zinc-300">
                  Type: {selectedChecklist.checklist_type.name} ({selectedChecklist.checklist_type.code})
                </p>
              </div>
            ) : null}

            <button
              type="button"
              disabled={submitting || paymentStatus !== 'succeeded'}
              onClick={() => void onSelectChecklist()}
              className="rounded-lg border border-cyan-300/40 bg-cyan-500/15 px-3 py-2 text-sm text-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Activating access...' : 'Activate 7-day checklist access'}
            </button>
          </div>
        ) : null}

        {successMessage ? <p className="mt-3 text-sm text-emerald-300">{successMessage}</p> : null}
        {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
      </article>

      {(paymentStatus === 'failed' || Boolean(error)) ? (
        <div className="flex flex-wrap gap-2 text-sm">
          <Link href="/payment" className="rounded-lg border border-white/20 px-3 py-2 text-zinc-100 hover:bg-white/10">
            Start checkout
          </Link>
          <Link href="/dashboard" className="rounded-lg border border-white/20 px-3 py-2 text-zinc-100 hover:bg-white/10">
            Dashboard
          </Link>
        </div>
      ) : null}
    </section>
  );
}
