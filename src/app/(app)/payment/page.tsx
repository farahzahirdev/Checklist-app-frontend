'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { createStripeCheckoutSession, getUserPaymentStatus } from '@/lib/payments';
import { listPublishedCustomerChecklists, type CustomerChecklist } from '@/lib/checklist-api';
import { translate, useLocale } from '@/lib/i18n';
import { customerPaymentMessages } from '@/locales/customer-payment';

const LATEST_PAYMENT_ID_STORAGE_KEY = 'checklist_latest_payment_id';
const CHECKOUT_CHECKLIST_ID_STORAGE_KEY = 'checklist_checkout_selected_id';

function formatCheckoutError(err: unknown, t: (key: string) => string): string {
  const rawMessage = err instanceof Error ? err.message : '';
  if (!rawMessage) {
    return t('errors.startCheckout');
  }

  if (/failed to fetch/i.test(rawMessage) || /networkerror/i.test(rawMessage)) {
    return t('errors.reachPayment');
  }

  return rawMessage;
}

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const { locale } = useLocale();
  const t = (key: string) => translate(customerPaymentMessages, locale, key);
  const [loading, setLoading] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [error, setError] = useState('');
  const [checklists, setChecklists] = useState<CustomerChecklist[]>([]);
  const [selectedChecklistId, setSelectedChecklistId] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadCatalogAndStatus() {
      try {
        const catalog = await listPublishedCustomerChecklists({ sortBy: 'updated_at', sortOrder: 'desc', limit: 100 });
        if (!mounted) return;
        setChecklists(catalog);
        setSelectedChecklistId('');

        // NOTE: Customers can purchase multiple checklists.
        // Do not redirect away from `/payment` just because an earlier payment succeeded.
        // Stripe success flow already lands on `/payment/success`.
        try {
          await getCurrentUser();
        } catch {
          // Ignore; layout auth gate will handle unauthenticated users.
        }
      } catch (err) {
        if (!mounted) {
          return;
        }
        setError(err instanceof Error ? err.message : t('errors.loadCheckout'));
      } finally {
        if (mounted) {
          setCatalogLoading(false);
        }
      }
    }
    void loadCatalogAndStatus();

    return () => {
      mounted = false;
    };
  }, []);

  async function beginCheckout() {
    if (!selectedChecklistId) {
      setError(t('errors.selectChecklist'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      const origin = window.location.origin;
      window.localStorage.setItem(CHECKOUT_CHECKLIST_ID_STORAGE_KEY, selectedChecklistId);
      const checkoutUrl = await createStripeCheckoutSession({
        checklist_id: selectedChecklistId,
        success_url: `${origin}/payment/success?checklist_id=${encodeURIComponent(selectedChecklistId)}`,
        cancel_url: `${origin}/payment?checkout=cancelled`,
      });
      if (checkoutUrl.paymentId) {
        window.localStorage.setItem(LATEST_PAYMENT_ID_STORAGE_KEY, checkoutUrl.paymentId);
      }
      window.location.assign(checkoutUrl.checkoutUrl);
    } catch (err) {
      setError(formatCheckoutError(err, t));
      setLoading(false);
    }
  }

  const checkoutCancelled = searchParams.get('checkout') === 'cancelled';

  return (
    <section className="flex min-h-[70vh] w-full flex-col justify-start space-y-6 px-1 pt-1 text-[#1f2d45]">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-[#6c83a8]">{t('title.kicker')}</p>
        <h1 className="text-3xl font-semibold text-[#1f2d45]">{t('title')}</h1>
        <p className="text-sm text-[#4f6281]">{t('subtitle')}</p>
      </header>

      <article className="rounded-2xl border border-[#13305c] bg-[linear-gradient(140deg,#071733_0%,#0c2144_50%,#13356d_100%)] p-6 text-sm text-[#d8e6ff] shadow-[0_10px_30px_rgba(6,20,47,0.25)]">
        {catalogLoading ? <p>{t('loading.catalog')}</p> : null}
        {checkoutCancelled ? (
          <p className="text-amber-200">{t('checkout.cancelled')}</p>
        ) : null}
        {error ? <p className="mt-2 text-rose-300">{error}</p> : null}
        {!catalogLoading ? (
          <div className="mt-4 flex flex-col gap-3">
            {checklists.length ? (
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-[0.2em] text-[#9db8e6]">{t('section.checklists')}</span>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {checklists.map((checklist) => {
                    const isSelected = selectedChecklistId === checklist.id;
                    const priceLabel = checklist.pricing
                      ? `${(checklist.pricing.amount_cents / 100).toFixed(2)} ${checklist.pricing.currency.toUpperCase()}`
                      : t('labels.priceUnavailable');
                    const description =
                      checklist.checklist_type?.description?.trim() || checklist.warning?.trim() || t('labels.noDescription');
                    const typeLabel = checklist.checklist_type?.name || checklist.checklist_type?.code || t('labels.checklistType');
                    return (
                      <button
                        key={checklist.id}
                        type="button"
                        onClick={() => setSelectedChecklistId(checklist.id)}
                        className={`group relative overflow-hidden rounded-2xl border p-0 text-left transition-all duration-300 ${
                          isSelected
                            ? 'border-[#9fc2ff] bg-[linear-gradient(145deg,#143566_0%,#1b4a86_48%,#2a67b0_100%)] text-white ring-2 ring-[#a9c8ff]/70 shadow-[0_18px_32px_rgba(10,30,63,0.55)]'
                            : 'border-[#2d4f83] bg-[linear-gradient(145deg,#0d2448_0%,#123263_48%,#173e78_100%)] text-[#d8e6ff] hover:-translate-y-0.5 hover:border-[#79a8f6] hover:shadow-[0_14px_28px_rgba(10,30,63,0.45)]'
                        }`}
                      >
                        <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                        <div className="pointer-events-none absolute -bottom-6 -left-5 h-20 w-20 rounded-full bg-[#7bb0ff]/20 blur-2xl" />

                        <div className="relative z-10 p-4">
                          <div className="flex items-start justify-between gap-2">
                            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-[#d9e7ff]">
                              {typeLabel}
                            </span>
                            {isSelected ? (
                              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-[#b8d3ff] bg-[#0b2144]/70 px-1 text-[10px] font-semibold text-[#d6e5ff]">
                                {t('labels.selected')}
                              </span>
                            ) : null}
                          </div>

                          <p className="mt-3 text-base font-semibold leading-tight text-white">{checklist.title}</p>
                          <p className="mt-1.5 text-xs text-[#c9dcff]">
                            {checklist.version ? t('labels.version').replace('{version}', checklist.version) : t('labels.latestVersion')}
                          </p>

                          <p className="mt-3 min-h-[3rem] line-clamp-2 text-xs leading-relaxed text-[#d5e4ff]">{description}</p>

                          <div className="mt-4 flex items-end justify-between gap-2">
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.2em] text-[#b8cff6]">{t('labels.price')}</p>
                              <p className="text-xl font-semibold tracking-tight text-white">{priceLabel}</p>
                            </div>
                            <span
                              className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                                isSelected
                                  ? 'bg-[#d7e7ff] text-[#12305d]'
                                  : 'border border-white/20 bg-white/10 text-[#d8e6ff] group-hover:bg-white/20'
                              }`}
                            >
                              {isSelected ? t('actions.ready') : t('actions.choosePlan')}
                            </span>
                          </div>

                          {checklist.warning ? <p className="mt-3 text-xs text-amber-200">{checklist.warning}</p> : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-amber-200">{t('empty.noneAvailable')}</p>
            )}
            <button
              type="button"
              onClick={() => void beginCheckout()}
              disabled={loading || !selectedChecklistId}
              className="self-start rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-2 text-white hover:bg-[#223657] disabled:opacity-60"
            >
              {loading ? t('actions.redirecting') : t('actions.proceed')}
            </button>
          </div>
        ) : null}
      </article>
    </section>
  );
}
