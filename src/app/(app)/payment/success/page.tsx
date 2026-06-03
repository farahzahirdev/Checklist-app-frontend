'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getCurrentUser, persistAccessToken, startMfaSetup, verifyMfaCode } from '@/lib/auth';
import { listPublishedCustomerChecklists, selectChecklistAfterPayment, type CustomerChecklist } from '@/lib/checklist-api';
import { getUserPaymentStatus, type PaymentStatusResponse } from '@/lib/payments';
import { clearCheckoutIntent, getCheckoutIntent } from '@/lib/checkout-intent';
import { translate, useLocale } from '@/lib/i18n';
import { customerPaymentMessages } from '@/locales/customer-payment';

const PURCHASED_CHECKLIST_IDS_STORAGE_KEY = 'checklist_purchased_ids';

function rememberPurchasedChecklistId(checklistId: string) {
  if (typeof window === 'undefined') return;
  const id = checklistId.trim();
  if (!id) return;
  try {
    const raw = window.localStorage.getItem(PURCHASED_CHECKLIST_IDS_STORAGE_KEY);
    const existing = raw ? (JSON.parse(raw) as unknown) : [];
    const list = Array.isArray(existing) ? existing.filter((x): x is string => typeof x === 'string') : [];
    const next = Array.from(new Set([...list, id]));
    window.localStorage.setItem(PURCHASED_CHECKLIST_IDS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore storage failures
  }
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const { locale } = useLocale();
  const t = (key: string) => translate(customerPaymentMessages, locale, key);
  const preferredChecklistIdFromCheckout = (searchParams.get('checklist_id') || '').trim() || getCheckoutIntent();
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
  const [mfaSetupRequired, setMfaSetupRequired] = useState(false);
  const [mfaQrSvg, setMfaQrSvg] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaSetupLoading, setMfaSetupLoading] = useState(false);
  const [mfaResolving, setMfaResolving] = useState(false);
  const [initializing, setInitializing] = useState(true);

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
        setError(err instanceof Error ? err.message : t('errors.failedLoadChecklists'));
      }
    }

    async function loadMfaSetup() {
      setMfaSetupLoading(true);
      try {
        const setup = await startMfaSetup();
        if (!mounted) return;
        setMfaQrSvg(setup.svg_qr ?? '');
      } catch (setupErr) {
        if (!mounted) return;
        setError(setupErr instanceof Error ? setupErr.message : t('errors.failedMfaSetup'));
      } finally {
        if (mounted) setMfaSetupLoading(false);
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
          setMfaResolving(true);
          const me = await getCurrentUser();
          if (!mounted) return;
          setMfaSetupRequired(!me.mfa_enabled);

          if (response.checklist) {
            rememberPurchasedChecklistId(response.checklist.id);
            setStatusMessage(
              me.mfa_enabled
                ? t('success.paymentConfirmed')
                : t('success.paymentConfirmedMfaRequired'),
            );
            clearCheckoutIntent();
            if (!me.mfa_enabled) {
              await loadMfaSetup();
            }
            setMfaResolving(false);
          } else {
            const preferredChecklistId = (searchParams.get('checklist_id') || '').trim() || getCheckoutIntent();

            if (preferredChecklistId) {
              try {
                await selectChecklistAfterPayment(preferredChecklistId);
                rememberPurchasedChecklistId(preferredChecklistId);
                const refreshed = await getUserPaymentStatus(currentUserId);
                clearCheckoutIntent();
                setSelectedChecklistFromStatus(refreshed.checklist ?? null);
                setAccessExpiresAt(refreshed.access_expires_at);
                setStatusMessage(
                  me.mfa_enabled
                    ? t('success.paymentConfirmed')
                    : t('success.paymentConfirmedMfaRequired'),
                );
                if (!me.mfa_enabled) {
                  await loadMfaSetup();
                }
                setMfaResolving(false);
                return;
              } catch (selectErr) {
                const message = selectErr instanceof Error ? selectErr.message : t('success.failedActivateAccess');
                if (message.includes('checklist_already_selected')) {
                  clearCheckoutIntent();
                  rememberPurchasedChecklistId(preferredChecklistId);
                  setStatusMessage(
                    me.mfa_enabled
                      ? t('success.paymentConfirmed')
                      : t('success.paymentConfirmedMfaRequired'),
                  );
                  if (!me.mfa_enabled) {
                    await loadMfaSetup();
                  }
                  setMfaResolving(false);
                  return;
                }
              }
            }

            setStatusMessage(t('success.paymentPendingActivation'));
            await loadChecklists();
            setMfaResolving(false);
          }
        } else if (response.payment_status === 'pending') {
          setMfaResolving(false);
          setStatusMessage(t('success.paymentPending'));
          pollTimeout = window.setTimeout(() => {
            void checkStatusAndMaybePoll();
          }, 3000);
        } else {
          setMfaResolving(false);
          setStatusMessage(t('success.paymentFailed'));
        }
      } catch (err) {
        if (!mounted) {
          return;
        }
        setMfaResolving(false);
        setError(err instanceof Error ? err.message : t('errors.failedFetchPaymentStatus'));
      } finally {
        if (mounted) {
          setLoading(false);
          setInitializing(false);
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
  }, [searchParams]);

  async function onCompleteMfa() {
    const code = mfaCode.trim();
    if (code.length !== 6) {
      setError(t('success.enterOtpError'));
      return;
    }
    setError('');
    setMfaLoading(true);
    try {
      const data = await verifyMfaCode({ code });
      if (data.access_token) {
        persistAccessToken(data.access_token);
      }
      setSuccessMessage(t('success.mfaSetupCompleted'));
      const target = selectedChecklistFromStatus?.id
        ? `/access?checklist_id=${encodeURIComponent(selectedChecklistFromStatus.id)}`
        : '/access';
      window.location.assign(target);
    } catch (mfaErr) {
      setError(mfaErr instanceof Error ? mfaErr.message : t('success.failedMfaSetup'));
    } finally {
      setMfaLoading(false);
    }
  }

  async function onSelectChecklist() {
    setError('');
    setSuccessMessage('');
    if (!selectedChecklistId) {
      setError(t('success.selectChecklistFirst'));
      return;
    }

    setSubmitting(true);
    try {
      const grant = await selectChecklistAfterPayment(selectedChecklistId);
      rememberPurchasedChecklistId(selectedChecklistId);
      setSuccessMessage(t('success.accessGrantedUntil').replace('{date}', new Date(grant.expires_at).toLocaleString()));
      window.location.assign(`/access?checklist_id=${encodeURIComponent(selectedChecklistId)}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('success.failedActivateAccess');
      if (message.includes('checklist_already_selected')) {
        window.location.assign('/access');
        return;
      }
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  const shouldHoldSelectionUi =
    paymentStatus === 'succeeded' && !selectedChecklistFromStatus && Boolean(preferredChecklistIdFromCheckout) && !error;
  const shouldHoldMfaUi =
    paymentStatus === 'succeeded' && (mfaResolving || (mfaSetupRequired && (mfaSetupLoading || (!mfaQrSvg && !error))));
  const shouldShowPageLoader = initializing || shouldHoldSelectionUi || shouldHoldMfaUi;
  const shouldShowRecoveryLinks = paymentStatus === 'failed' || (Boolean(error) && !(paymentStatus === 'succeeded' && mfaSetupRequired));
  const isPaymentRecordMissingError = /payment record not found/i.test(error);

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-6 md:px-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6c83a8]">{t('success.title.kicker')}</p>
        <h1 className="text-3xl font-semibold text-[#1f2d45]">{t('success.title')}</h1>
        <p className="max-w-2xl text-sm text-[#4f6281]">{t('success.subtitle')}</p>
      </header>
      <article
        className={`border p-6 shadow-sm ${
          paymentStatus === 'succeeded' ? 'border-[#2f4d82] text-white' : 'border-[#dbe4f4] bg-white text-[#2a3d5f]'
        }`}
        style={paymentStatus === 'succeeded' ? { background: 'linear-gradient(180deg, #06142f, #071a39)' } : undefined}
      >
        {shouldShowPageLoader ? (
          <div className="space-y-2 text-sm text-inherit/90">
            <p>{t('success.finalizing')}</p>
            <p>{t('success.pleaseWait')}</p>
          </div>
        ) : null}
        {!shouldShowPageLoader && loading ? <p className="text-sm text-inherit/90">{t('success.checkingStatus')}</p> : null}
        {!shouldShowPageLoader && statusMessage ? <p className="text-sm text-inherit/90">{statusMessage}</p> : null}

        {!shouldShowPageLoader && !loading && paymentStatus === 'succeeded' && !selectedChecklistFromStatus && !checklists.length ? (
          <p className="mt-3 text-sm text-amber-200">{t('success.noChecklistsAvailable')}</p>
        ) : null}

        {!shouldShowPageLoader && paymentStatus === 'succeeded' && selectedChecklistFromStatus ? (
          <div className="mt-4 space-y-4">
            <div className="border border-white/20 bg-white/10 p-4 text-sm">
              <p className="text-lg font-semibold">{selectedChecklistFromStatus.title}</p>
              <p className="mt-1 text-white/90">{t('success.selectedChecklistVersion').replace('{version}', String(selectedChecklistFromStatus.version))}</p>
              {accessExpiresAt ? <p className="mt-1 text-white/90">{t('success.accessActiveUntil').replace('{date}', new Date(accessExpiresAt).toLocaleString())}</p> : null}
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              {mfaSetupRequired ? null : (
                <Link
                  href={selectedChecklistFromStatus?.id ? `/access?checklist_id=${encodeURIComponent(selectedChecklistFromStatus.id)}` : '/access'}
                  className="border border-white/30 px-3 py-2 text-white hover:bg-white/10"
                >
                  {t('success.startAssessment')}
                </Link>
              )}
            </div>
          </div>
        ) : null}

        {!shouldShowPageLoader &&
        paymentStatus === 'succeeded' &&
        !selectedChecklistFromStatus &&
        checklists.length &&
        !initializing &&
        !shouldHoldSelectionUi ? (
          <div className="mt-4 max-w-2xl space-y-4">
            <label className="block space-y-2 text-sm">
              <span className="font-medium text-white">{t('success.checklistLabel')}</span>
              <select
                value={selectedChecklistId}
                onChange={(event) => setSelectedChecklistId(event.target.value)}
                className="w-full cursor-pointer border border-white/20 bg-[#0d1d3a] px-3 py-2 text-white outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
              >
                {checklists.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title} ({item.version})
                  </option>
                ))}
              </select>
            </label>

            {selectedChecklist ? (
              <div className="border border-white/15 bg-white/5 p-4 text-sm">
                <p className="font-semibold text-white">{selectedChecklist.title}</p>
                <p className="mt-1 text-zinc-300">
                  {t('success.checklistTypeInfo').replace('{name}', selectedChecklist.checklist_type.name).replace('{code}', selectedChecklist.checklist_type.code)}
                </p>
              </div>
            ) : null}

            <button
              type="button"
              disabled={submitting || paymentStatus !== 'succeeded'}
              onClick={() => void onSelectChecklist()}
              className="border border-cyan-300/40 bg-cyan-500/15 px-3 py-2 text-sm text-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? t('success.activatingAccess') : t('success.activateAccess')}
            </button>
          </div>
        ) : null}

        {!shouldShowPageLoader && paymentStatus === 'succeeded' && mfaSetupRequired && !shouldHoldMfaUi ? (
          <div className="mt-4 space-y-4 border border-white/20 bg-white/10 p-4 text-sm">
            <p className="font-semibold text-white">{t('success.completeMfaSetup')}</p>
            <p className="text-white/90">{t('success.mfaSetupDescription')}</p>
            {mfaSetupLoading ? <p className="text-white/90">{t('success.loadingMfaSetup')}</p> : null}
            {mfaQrSvg ? (
              mfaQrSvg.startsWith('data:image/') ? (
                <div className="rounded bg-white p-3">
                  <img src={mfaQrSvg} alt={t('success.mfaQrAlt')} className="mx-auto h-auto max-w-full" />
                </div>
              ) : (
                <div className="rounded bg-white p-3" dangerouslySetInnerHTML={{ __html: mfaQrSvg }} />
              )
            ) : null}
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                void onCompleteMfa();
              }}
            >
              <label className="block space-y-2 text-sm">
                <span className="font-medium text-white">{t('success.enterOtpCode')}</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(event) => setMfaCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full border border-white/20 bg-[#0d1d3a] px-3 py-2 text-white outline-none"
                />
              </label>
              <button
                type="submit"
                disabled={mfaLoading}
                className="border border-[#7fb0ff] bg-[#1f7bff]/25 px-3 py-2 text-white hover:bg-[#1f7bff]/35 disabled:opacity-60"
              >
                {mfaLoading ? t('success.completingMfa') : t('success.completeMfaAndContinue')}
              </button>
            </form>
          </div>
        ) : null}

        {successMessage ? <p className="mt-3 text-sm text-emerald-300">{successMessage}</p> : null}
        {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
      </article>

      {shouldShowRecoveryLinks ? (
        <div className="flex flex-wrap gap-2 text-sm">
          <Link href="/payment" className="border border-[#d4dced] px-3 py-2 text-[#2a3d5f] hover:bg-[#f6f9ff]">
            {t('success.startCheckout')}
          </Link>
          <Link
            href={isPaymentRecordMissingError ? '/register' : '/dashboard'}
            className="border border-[#d4dced] px-3 py-2 text-[#2a3d5f] hover:bg-[#f6f9ff]"
          >
            {isPaymentRecordMissingError ? t('success.completeRegistration') : t('success.dashboard')}
          </Link>
        </div>
      ) : null}
    </section>
  );
}
