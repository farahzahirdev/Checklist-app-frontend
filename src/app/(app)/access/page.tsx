'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getCurrentAssessment, startAssessment } from '@/lib/assessment';
import { listPublishedCustomerChecklists, type CustomerChecklist } from '@/lib/checklist-api';
import { listPurchasedChecklistIds } from '@/lib/customer-payments';
import { formatStatusLabel } from '@/lib/status-format';

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
  const [purchasedChecklistIds, setPurchasedChecklistIds] = useState<string[]>([]);
  const [checklistsLoading, setChecklistsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [assessmentsByChecklistId, setAssessmentsByChecklistId] = useState<
    Record<
      string,
      {
        status: string;
        started_at: string;
        expires_at: string;
        completion_percent: number;
        checklist_id?: string;
      }
    >
  >({});
  const [assessment, setAssessment] = useState<{
    status: string;
    started_at: string;
    expires_at: string;
    completion_percent: number;
    checklist_id?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const remaining = useMemo(() => (assessment ? formatTimeRemaining(assessment.expires_at) : ''), [assessment]);
  const isSubmittedAssessment = assessment?.status === 'submitted';
  const assessmentAlreadyStarted = Boolean(assessment && assessment.status === 'in_progress');
  const checklistLocked = Boolean(checklistIdFromQuery);
  const selectedChecklistName = useMemo(
    () => checklists.find((checklist) => checklist.id === checklistId)?.title ?? '',
    [checklistId, checklists],
  );

  const purchasedOnlyChecklists = useMemo(() => {
    if (!purchasedChecklistIds.length) return [];
    const ids = new Set(purchasedChecklistIds);
    return checklists.filter((item) => ids.has(item.id));
  }, [checklists, purchasedChecklistIds]);

  const orderedChecklists = useMemo(() => {
    if (!checklistId) {
      return purchasedOnlyChecklists;
    }
    const selected = purchasedOnlyChecklists.find((checklist) => checklist.id === checklistId);
    if (!selected) {
      return purchasedOnlyChecklists;
    }
    return [selected, ...purchasedOnlyChecklists.filter((checklist) => checklist.id !== checklistId)];
  }, [checklistId, purchasedOnlyChecklists]);

  useEffect(() => {
    if (checklistIdFromQuery) {
      setChecklistId(checklistIdFromQuery);
    }
  }, [checklistIdFromQuery]);

  useEffect(() => {
    let mounted = true;

    async function preloadSelectedAssessment() {
      if (!checklistIdFromQuery) return;
      try {
        const response = await getCurrentAssessment(checklistIdFromQuery);
        if (!mounted) return;
        setAssessment(response);
        setAssessmentsByChecklistId((previous) => ({ ...previous, [checklistIdFromQuery]: response }));
      } catch {
        // No active assessment for this checklist yet.
      }
    }

    void preloadSelectedAssessment();
    return () => {
      mounted = false;
    };
  }, [checklistIdFromQuery]);

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
      } finally {
        if (mounted) {
          setChecklistsLoading(false);
        }
      }
    }
    void loadPublishedChecklists();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadPurchasedIds() {
      setChecklistsLoading(true);
      try {
        const ids = await listPurchasedChecklistIds();
        if (!mounted) return;
        const next = Array.from(new Set([...(ids ?? []), ...(checklistIdFromQuery ? [checklistIdFromQuery] : [])]));
        setPurchasedChecklistIds(next);
      } catch {
        // ignore and keep fallback behavior
      } finally {
        if (mounted) {
          setChecklistsLoading(false);
        }
      }
    }
    void loadPurchasedIds();
    return () => {
      mounted = false;
    };
  }, [checklistIdFromQuery]);

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
      if (checklistId.trim()) {
        setAssessmentsByChecklistId((previous) => ({ ...previous, [checklistId.trim()]: response }));
      }
      setMessage('Active assessment loaded.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load assessment.';
      if (message.toLowerCase().includes('assessment not found')) {
        setMessage('No active assessment found yet. Start assessment to begin.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!checklistId.trim() || checklistLocked) {
      return;
    }
    const cached = assessmentsByChecklistId[checklistId.trim()];
    if (cached) {
      setAssessment(cached);
      return;
    }
    // Lazy-load current assessment for the selected checklist to support managing multiple checklists.
    let cancelled = false;
    void getCurrentAssessment(checklistId.trim())
      .then((response) => {
        if (cancelled) return;
        setAssessment(response);
        setAssessmentsByChecklistId((previous) => ({ ...previous, [checklistId.trim()]: response }));
      })
      .catch(() => {
        if (cancelled) return;
        setAssessment(null);
      });
    return () => {
      cancelled = true;
    };
  }, [assessmentsByChecklistId, checklistId, checklistLocked]);

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
      setAssessmentsByChecklistId((previous) => ({ ...previous, [checklistId.trim()]: response }));
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
              <span className="font-semibold">Status:</span> {formatStatusLabel(assessment.status)}
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

      {!assessmentAlreadyStarted && !isSubmittedAssessment ? (
        <>
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
                {checklistsLoading ? (
                  <div className="rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm text-[#607594]">
                    Loading purchased checklists...
                  </div>
                ) : (
                  <select
                    value={checklistId}
                    onChange={(event) => setChecklistId(event.target.value)}
                    className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring"
                    disabled={!orderedChecklists.length}
                  >
                    {!checklistId ? (
                      <option value="">{orderedChecklists.length ? 'Select purchased checklist' : 'No purchased checklists found'}</option>
                    ) : null}
                    {orderedChecklists.map((checklist) => (
                      <option key={checklist.id} value={checklist.id}>
                        {checklist.title}
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-xs text-[#607594]">
                  Showing your purchased checklists only. To add more, click <span className="font-semibold">Buy another checklist</span>.
                </p>
              </label>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={start}
                disabled={loading || isSubmittedAssessment}
                className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Processing…' : 'Start Assessment'}
              </button>
              <Link
                href="/payment"
                className="rounded-lg border border-[#d4dced] px-3 py-2 text-sm text-[#2a3d5f] hover:bg-[#f6f9ff]"
              >
                Buy another checklist
              </Link>
            </div>

            {message ? <p className="mt-3 text-sm text-[#2f9960]">{message}</p> : null}
            {error ? <p className="mt-3 text-sm text-[#c43e53]">{error}</p> : null}
          </article>
        </>
      ) : isSubmittedAssessment ? (
        <article className="rounded-xl border border-[#dbe4f4] bg-white p-5 shadow-sm">
          <p className="text-sm text-[#3f5677]">
            This assessment is already submitted and cannot be started or submitted again.
          </p>
          {message ? <p className="mt-3 text-sm text-[#2f9960]">{message}</p> : null}
          {error ? <p className="mt-3 text-sm text-[#c43e53]">{error}</p> : null}
        </article>
      ) : (
        <article className="rounded-xl border border-[#dbe4f4] bg-white p-5 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <Link
              href={checklistId.trim() ? `/assessment?checklist_id=${encodeURIComponent(checklistId.trim())}` : '/assessment'}
              className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm text-white"
            >
              Continue Assessment
            </Link>
          </div>

          {message ? <p className="mt-3 text-sm text-[#2f9960]">{message}</p> : null}
          {error ? <p className="mt-3 text-sm text-[#c43e53]">{error}</p> : null}
        </article>
      )}
    </section>
  );
}
