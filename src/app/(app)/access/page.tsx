'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getCurrentAssessment, startAssessment } from '@/lib/assessment';
import { listPublishedCustomerChecklists, type CustomerChecklist } from '@/lib/checklist-api';

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
  const checklistIdFromQuery = searchParams.get('checklist_id') ?? '';
  const [checklistId, setChecklistId] = useState('');
  const [checklists, setChecklists] = useState<CustomerChecklist[]>([]);
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
  const assessmentAlreadyStarted = Boolean(assessment && assessment.status !== 'not_started');
  const checklistLocked = assessmentAlreadyStarted || Boolean(checklistIdFromQuery);
  const selectedChecklistName = useMemo(
    () => checklists.find((checklist) => checklist.id === checklistId)?.title ?? '',
    [checklistId, checklists],
  );
  const orderedChecklists = useMemo(() => {
    if (!checklistId) {
      return checklists;
    }
    const selected = checklists.find((checklist) => checklist.id === checklistId);
    if (!selected) {
      return checklists;
    }
    return [selected, ...checklists.filter((checklist) => checklist.id !== checklistId)];
  }, [checklistId, checklists]);

  useEffect(() => {
    if (checklistIdFromQuery) {
      setChecklistId(checklistIdFromQuery);
    }
  }, [checklistIdFromQuery]);

  useEffect(() => {
    let mounted = true;

    async function preloadCurrentAssessment() {
      try {
        const response = await getCurrentAssessment();
        if (!mounted) {
          return;
        }
        setAssessment(response);
        if (response.checklist_id) {
          setChecklistId(response.checklist_id);
        }
      } catch {
        // No active assessment yet; keep manual checklist input flow.
      }
    }

    void preloadCurrentAssessment();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadPublishedChecklists() {
      try {
        const response = await listPublishedCustomerChecklists();
        if (!mounted) {
          return;
        }
        const sorted = [...response].sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));
        setChecklists(sorted);
      } catch {
        // keep access flow functional even when checklist catalog fails
      }
    }
    void loadPublishedChecklists();
    return () => {
      mounted = false;
    };
  }, []);

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
      setError('Checklist is required.');
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
        <p className="text-xs uppercase tracking-[0.3em] text-[#6c83a8]">Customer</p>
        <h1 className="text-3xl font-semibold text-[#1f2d45]">Access & Pre-start</h1>
      </header>

      {assessment ? (
        <article className="rounded-xl border border-[#bfd4ff] bg-[#eef4ff] p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4a6ea8]">Remaining time</p>
          <p className="mt-1 text-3xl font-semibold text-[#1f2d45]">{remaining}</p>
          <div className="mt-3 grid gap-2 text-sm text-[#445c7e] md:grid-cols-3">
            {selectedChecklistName ? (
              <p>
                <span className="font-semibold">Checklist:</span> {selectedChecklistName}
              </p>
            ) : null}
            <p>
              <span className="font-semibold">Status:</span> {assessment.status}
            </p>
            <p>
              <span className="font-semibold">Completion:</span> {assessment.completion_percent}%
            </p>
            <p>
              <span className="font-semibold">Started:</span> {new Date(assessment.started_at).toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">Expires:</span> {new Date(assessment.expires_at).toLocaleString()}
            </p>
          </div>
        </article>
      ) : null}

      <article className="rounded-xl border border-[#dbe4f4] bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[#243555]">Before you start</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#4f6281]">
          <li>The 7-day completion window starts only when you click Start Assessment.</li>
          <li>Evidence uploads are optional but recommended for better auditor review.</li>
          <li>Final report is published in-app after manual auditor review.</li>
        </ul>
      </article>

      <article className="rounded-xl border border-[#dbe4f4] bg-white p-5 shadow-sm">
        {checklistLocked ? (
          <div className="space-y-2 text-sm">
            <p className="text-[#3f5677]">Checklist</p>
            <p className="rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-[#243555]">
              {selectedChecklistName || checklistId || 'Selected checklist'}
            </p>
          </div>
        ) : (
          <label className="block space-y-2 text-sm">
            <span className="text-[#3f5677]">Checklist</span>
            <select
              value={checklistId}
              onChange={(event) => setChecklistId(event.target.value)}
              className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring"
            >
              {!checklistId ? <option value="">Select checklist</option> : null}
              {orderedChecklists.map((checklist) => (
                <option key={checklist.id} value={checklist.id}>
                  {checklist.title}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          {!assessmentAlreadyStarted ? (
            <button
              type="button"
              onClick={start}
              disabled={loading}
              className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Processing…' : 'Start Assessment'}
            </button>
          ) : (
            <Link
              href="/assessment"
              className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm text-white"
            >
              Continue Assessment
            </Link>
          )}
          <button
            type="button"
            onClick={loadCurrent}
            disabled={loading}
            className="rounded-lg border border-[#d4dced] px-3 py-2 text-sm text-[#2a3d5f] hover:bg-[#f6f9ff] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Load Current
          </button>
        </div>

        {message ? <p className="mt-3 text-sm text-[#2f9960]">{message}</p> : null}
        {error ? <p className="mt-3 text-sm text-[#c43e53]">{error}</p> : null}
      </article>
    </section>
  );
}
