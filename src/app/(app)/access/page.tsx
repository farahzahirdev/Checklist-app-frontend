'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getCurrentAssessment, startAssessment } from '@/lib/assessment';

function formatTimeRemaining(expiresAt: string): string {
  const expires = new Date(expiresAt).getTime();
  if (Number.isNaN(expires)) {
    return 'Invalid expiry timestamp';
  }
  const diff = expires - Date.now();
  if (diff <= 0) {
    return 'Expired';
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  return `${days}d ${hours}h ${minutes}m remaining`;
}

export default function AccessPage() {
  const searchParams = useSearchParams();
  const [checklistId, setChecklistId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [assessment, setAssessment] = useState<{
    status: string;
    started_at: string;
    expires_at: string;
    completion_percent: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const remaining = useMemo(() => (assessment ? formatTimeRemaining(assessment.expires_at) : ''), [assessment]);

  useEffect(() => {
    const fromQuery = searchParams.get('checklist_id');
    if (fromQuery) {
      setChecklistId(fromQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    let intervalId: number | undefined;
    if (assessment?.expires_at) {
      intervalId = window.setInterval(() => {
        setAssessment((prev) => (prev ? { ...prev } : prev));
      }, 30000);
    }
    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [assessment?.expires_at]);

  async function loadCurrent() {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const response = await getCurrentAssessment(checklistId.trim() || undefined);
      setAssessment(response);
      setMessage('Active assessment loaded.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load assessment.');
    } finally {
      setLoading(false);
    }
  }

  async function start() {
    setError('');
    setMessage('');
    if (!checklistId.trim()) {
      setError('Checklist ID is required.');
      return;
    }
    setLoading(true);
    try {
      const response = await startAssessment({ checklist_id: checklistId.trim() });
      setAssessment(response);
      setMessage('Assessment started. The 7-day completion window is now active.');
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Unable to start assessment.';
      if (text.includes('payment_required')) {
        setError('Payment unlock is not confirmed yet. Complete payment and retry after webhook processing.');
      } else {
        setError(text);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/85">Customer</p>
        <h1 className="text-3xl font-semibold">Access & Pre-start</h1>
      </header>

      <article className="rounded-2xl border border-white/15 bg-black/25 p-5">
        <h2 className="text-lg font-semibold">Before you start</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-300">
          <li>The 7-day completion window starts only when you click Start Assessment.</li>
          <li>Evidence uploads are optional but recommended for better auditor review.</li>
          <li>Final report is published in-app after manual auditor review.</li>
        </ul>
      </article>

      <article className="rounded-2xl border border-white/15 bg-black/25 p-5">
        <label className="block space-y-2 text-sm">
          <span className="text-zinc-200">Checklist ID</span>
          <input
            type="text"
            value={checklistId}
            onChange={(event) => setChecklistId(event.target.value)}
            placeholder="Published checklist UUID"
            className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-zinc-100 outline-none ring-cyan-300/50 focus:ring"
          />
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={start}
            disabled={loading}
            className="rounded-lg border border-cyan-300/40 bg-cyan-500/15 px-3 py-2 text-sm text-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Processing…' : 'Start Assessment'}
          </button>
          <button
            type="button"
            onClick={loadCurrent}
            disabled={loading}
            className="rounded-lg border border-white/20 px-3 py-2 text-sm text-zinc-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Load Current
          </button>
        </div>

        {assessment ? (
          <div className="mt-4 space-y-1 text-sm text-zinc-200">
            <p>Status: {assessment.status}</p>
            <p>Started At: {assessment.started_at}</p>
            <p>Expires At: {assessment.expires_at}</p>
            <p>Completion: {assessment.completion_percent}%</p>
            <p className="text-cyan-200">{remaining}</p>
          </div>
        ) : null}
        {message ? <p className="mt-3 text-sm text-emerald-300">{message}</p> : null}
        {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
      </article>
    </section>
  );
}
