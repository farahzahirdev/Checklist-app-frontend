'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { listPublishedCustomerChecklists, selectChecklistAfterPayment, type CustomerChecklist } from '@/lib/checklist-api';

export default function PaymentSuccessPage() {
  const [checklists, setChecklists] = useState<CustomerChecklist[]>([]);
  const [selectedChecklistId, setSelectedChecklistId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const selectedChecklist = useMemo(
    () => checklists.find((item) => item.id === selectedChecklistId) ?? null,
    [checklists, selectedChecklistId],
  );

  useEffect(() => {
    let mounted = true;

    async function loadChecklists() {
      setLoading(true);
      setError('');
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
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadChecklists();
    return () => {
      mounted = false;
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
      setError(err instanceof Error ? err.message : 'Failed to activate checklist access.');
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
        {loading ? <p className="text-sm text-zinc-200">Loading available checklists...</p> : null}

        {!loading && !checklists.length ? (
          <p className="text-sm text-amber-200">No published checklists are available yet.</p>
        ) : null}

        {checklists.length ? (
          <div className="space-y-3">
            <label className="block space-y-2 text-sm">
              <span className="text-zinc-200">Checklist</span>
              <select
                value={selectedChecklistId}
                onChange={(event) => setSelectedChecklistId(event.target.value)}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-zinc-100 outline-none ring-cyan-300/50 focus:ring"
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
              disabled={submitting}
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

      <div className="flex flex-wrap gap-2 text-sm">
        <Link href="/payment" className="rounded-lg border border-white/20 px-3 py-2 text-zinc-100 hover:bg-white/10">
          Back to payment
        </Link>
        <Link href="/dashboard" className="rounded-lg border border-white/20 px-3 py-2 text-zinc-100 hover:bg-white/10">
          Dashboard
        </Link>
      </div>
    </section>
  );
}
