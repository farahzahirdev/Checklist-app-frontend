'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getCurrentAssessment, startAssessment } from '@/lib/assessment';
import { listPublishedCustomerChecklists, type CustomerChecklist } from '@/lib/checklist-api';
import { listPurchasedChecklistIds } from '@/lib/customer-payments';
import { formatStatusLabel } from '@/lib/status-format';
import { translate, useLocale } from '@/lib/i18n';
import { customerAccessMessages } from '@/locales/customer-access';

function formatTimeRemaining(expiresAt: string, t: (key: string) => string): string {
  const expires = new Date(expiresAt).getTime();
  if (Number.isNaN(expires)) {
    return t('timer.invalid');
  }
  const diff = expires - Date.now();
  if (diff <= 0) {
    return t('timer.expired');
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  return t('timer.remainingFmt')
    .replace('{d}', String(days))
    .replace('{h}', String(hours))
    .replace('{m}', String(minutes));
}

export default function AccessPage() {
  const { locale } = useLocale();
  const t = (key: string) => translate(customerAccessMessages, locale, key);
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

  const remaining = useMemo(() => (assessment ? formatTimeRemaining(assessment.expires_at, t) : ''), [assessment, t]);
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
      setMessage(t('messages.activeLoaded'));
    } catch (err) {
      const message = err instanceof Error ? err.message : t('errors.loadAssessment');
      if (message.toLowerCase().includes('assessment not found')) {
        setMessage(t('messages.noneActiveYet'));
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
      setError(t('errors.checklistRequired'));
      return;
    }
    setLoading(true);
    try {
      const response = await startAssessment({ checklist_id: checklistId.trim() });
      setAssessment(response);
      setAssessmentsByChecklistId((previous) => ({ ...previous, [checklistId.trim()]: response }));
      setMessage(t('messages.started'));
    } catch (err) {
      const text = err instanceof Error ? err.message : t('errors.startAssessment');
      if (text.includes('payment_required')) {
        setError(t('errors.paymentPending'));
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
        <p className="text-xs uppercase tracking-[0.3em] text-[#6c83a8]">{t('title.kicker')}</p>
        <h1 className="text-3xl font-semibold text-[#1f2d45]">{t('title')}</h1>
      </header>

      {assessment ? (
        <article className="rounded-xl border border-[#bfd4ff] bg-[#eef4ff] p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4a6ea8]">{t('timer.remaining')}</p>
          <p className="mt-1 text-3xl font-semibold text-[#1f2d45]">{remaining}</p>
          <div className="mt-3 grid gap-2 text-sm text-[#445c7e] md:grid-cols-3">
            {selectedChecklistName ? (
              <p>
                <span className="font-semibold">{t('labels.checklist')}:</span> {selectedChecklistName}
              </p>
            ) : null}
            <p>
              <span className="font-semibold">{t('labels.status')}:</span> {formatStatusLabel(assessment.status)}
            </p>
            <p>
              <span className="font-semibold">{t('labels.completion')}:</span> {assessment.completion_percent}%
            </p>
            <p>
              <span className="font-semibold">{t('labels.started')}:</span> {new Date(assessment.started_at).toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">{t('labels.expires')}:</span> {new Date(assessment.expires_at).toLocaleString()}
            </p>
          </div>
        </article>
      ) : null}

      {!assessmentAlreadyStarted && !isSubmittedAssessment ? (
        <>
          <article className="rounded-xl border border-[#dbe4f4] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[#243555]">{t('before.title')}</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#4f6281]">
              <li>{t('before.point1')}</li>
              <li>{t('before.point2')}</li>
              <li>{t('before.point3')}</li>
            </ul>
          </article>

          <article className="rounded-xl border border-[#dbe4f4] bg-white p-5 shadow-sm">
            {checklistLocked ? (
              <div className="space-y-2 text-sm">
                <p className="text-[#3f5677]">{t('labels.checklist')}</p>
                <p className="rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-[#243555]">
                  {selectedChecklistName || checklistId || t('checklist.selectedFallback')}
                </p>
              </div>
            ) : (
              <label className="block space-y-2 text-sm">
                <span className="text-[#3f5677]">{t('labels.checklist')}</span>
                {checklistsLoading ? (
                  <div className="rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm text-[#607594]">
                    {t('checklist.loadingPurchased')}
                  </div>
                ) : (
                  <select
                    value={checklistId}
                    onChange={(event) => setChecklistId(event.target.value)}
                    className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring"
                    disabled={!orderedChecklists.length}
                  >
                    {!checklistId ? (
                      <option value="">{orderedChecklists.length ? t('checklist.selectPurchased') : t('checklist.nonePurchased')}</option>
                    ) : null}
                    {orderedChecklists.map((checklist) => (
                      <option key={checklist.id} value={checklist.id}>
                        {checklist.title}
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-xs text-[#607594]">
                  {t('checklist.helper').replace('{cta}', t('actions.buyAnother'))}
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
                {loading ? t('actions.processing') : t('actions.start')}
              </button>
              <Link
                href="/payment"
                className="rounded-lg border border-[#d4dced] px-3 py-2 text-sm text-[#2a3d5f] hover:bg-[#f6f9ff]"
              >
                {t('actions.buyAnother')}
              </Link>
            </div>

            {message ? <p className="mt-3 text-sm text-[#2f9960]">{message}</p> : null}
            {error ? <p className="mt-3 text-sm text-[#c43e53]">{error}</p> : null}
          </article>
        </>
      ) : isSubmittedAssessment ? (
        <article className="rounded-xl border border-[#dbe4f4] bg-white p-5 shadow-sm">
          <p className="text-sm text-[#3f5677]">
            {t('submitted.notice')}
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
              {t('actions.continue')}
            </Link>
          </div>

          {message ? <p className="mt-3 text-sm text-[#2f9960]">{message}</p> : null}
          {error ? <p className="mt-3 text-sm text-[#c43e53]">{error}</p> : null}
        </article>
      )}
    </section>
  );
}
