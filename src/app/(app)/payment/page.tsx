'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Route } from 'next';
import { toast } from 'sonner';
import { getCurrentUser } from '@/lib/auth';
import { getCustomerProfileCompletion } from '@/lib/customer-profile';
import { createStripeCheckoutSession, checkPurchaseEligibility } from '@/lib/payments';
import { listPublishedCustomerChecklists, type CustomerChecklist } from '@/lib/checklist-api';
import { translate, useLocale } from '@/lib/i18n';
import { customerPaymentMessages } from '@/locales/customer-payment';
import {
  CHECKOUT_CHECKLIST_ID_STORAGE_KEY,
  clearPostSignupPaymentPrompt,
  getCheckoutIntent,
  hasPostSignupPaymentPrompt,
  setCheckoutIntent,
  shouldOfferPostSignupPurchaseSkip,
} from '@/lib/checkout-intent';

const LATEST_PAYMENT_ID_STORAGE_KEY = 'checklist_latest_payment_id';

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
  const router = useRouter();
  const { locale } = useLocale();
  const t = (key: string) => translate(customerPaymentMessages, locale, key);
  const [loading, setLoading] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [error, setError] = useState('');
  const [checklists, setChecklists] = useState<CustomerChecklist[]>([]);
  const [selectedChecklistId, setSelectedChecklistId] = useState('');
  const [purchaseEligibility, setPurchaseEligibility] = useState<Record<string, { can_purchase: boolean; reason: string | null }>>({});
  const [showOnboardingSkip, setShowOnboardingSkip] = useState(false);
  const [profileCompletionPercent, setProfileCompletionPercent] = useState<number | null>(null);
  const [profileCompletionLoading, setProfileCompletionLoading] = useState(true);
  const autoCheckoutAttemptedRef = useRef(false);
  const checkoutCancelled = searchParams.get('checkout') === 'cancelled';
  const canCheckout = !profileCompletionLoading && profileCompletionPercent === 100;

  async function beginCheckout(explicitChecklistId?: string, options?: { redirectToProfileOnIncomplete?: boolean }) {
    if (!canCheckout) {
      if (options?.redirectToProfileOnIncomplete) {
        toast.error(t('errors.completeProfileFirst'));
        router.push('/profile');
      }
      return;
    }
    const checklistId = (explicitChecklistId ?? selectedChecklistId).trim();
    if (!checklistId) {
      setError(t('errors.selectChecklist'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      const origin = window.location.origin;
      window.localStorage.setItem(CHECKOUT_CHECKLIST_ID_STORAGE_KEY, checklistId);
      const checkoutUrl = await createStripeCheckoutSession({
        checklist_id: checklistId,
        success_url: `${origin}/payment/success?checklist_id=${encodeURIComponent(checklistId)}`,
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

  useEffect(() => {
    let mounted = true;

    async function loadCatalogAndStatus() {
      try {
        const [catalog, completion] = await Promise.all([
          listPublishedCustomerChecklists({ sortBy: 'updated_at', sortOrder: 'desc', limit: 100 }),
          getCustomerProfileCompletion().catch(() => null),
        ]);
        if (!mounted) return;
        setChecklists(catalog);
        setProfileCompletionPercent(completion?.completion_percent ?? null);

        // Check purchase eligibility for each checklist
        const eligibilityResults: Record<string, { can_purchase: boolean; reason: string | null }> = {};
        await Promise.all(
          catalog.map(async (checklist) => {
            try {
              const eligibility = await checkPurchaseEligibility(checklist.id);
              eligibilityResults[checklist.id] = {
                can_purchase: eligibility.can_purchase,
                reason: eligibility.reason,
              };
            } catch (err) {
              // If eligibility check fails, assume can purchase
              eligibilityResults[checklist.id] = { can_purchase: true, reason: null };
            }
          })
        );
        if (mounted) {
          setPurchaseEligibility(eligibilityResults);
        }

        // Preselect the checklist the visitor picked on /products, if any.
        // The id can come from the current URL (?checklist_id=...) or, as a
        // fallback, from the persisted checkout intent (carried across the
        // auth flow). It is only honored when it matches a checklist that is
        // currently published, otherwise we fall back to no selection.
        const queryChecklistId = (searchParams.get('checklist_id') ?? '').trim();
        const preferredChecklistId = queryChecklistId || getCheckoutIntent();
        const preselected = preferredChecklistId
          ? catalog.find((item) => item.id === preferredChecklistId) ?? null
          : null;
        if (preselected) {
          setSelectedChecklistId(preselected.id);
          setCheckoutIntent(preselected.id);
        } else {
          setSelectedChecklistId('');
        }

        setShowOnboardingSkip(
          shouldOfferPostSignupPurchaseSkip(searchParams.get('checklist_id')),
        );

        const shouldAutoCheckout =
          Boolean(preselected) &&
          hasPostSignupPaymentPrompt() &&
          !checkoutCancelled &&
          !autoCheckoutAttemptedRef.current;

        if (shouldAutoCheckout && preselected) {
          autoCheckoutAttemptedRef.current = true;
          clearPostSignupPaymentPrompt();
          setShowOnboardingSkip(false);
          await beginCheckout(preselected.id);
          return;
        }

        // NOTE: Customers can purchase multiple checklists.
        // Do not redirect away from `/payment` just because an earlier payment succeeded.
        // Stripe success flow already lands on `/payment/success`.
        await getCurrentUser();
      } catch (err) {
        if (!mounted) {
          return;
        }
        setError(err instanceof Error ? err.message : t('errors.loadCheckout'));
      } finally {
        if (mounted) {
          setCatalogLoading(false);
          setProfileCompletionLoading(false);
        }
      }
    }
    void loadCatalogAndStatus();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <section className="flex min-h-[70vh] w-full flex-col justify-start space-y-6 px-1 pt-1 text-[#1f2d45]">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-[#6c83a8]">{t('title.kicker')}</p>
        <h1 className="text-3xl font-semibold text-[#1f2d45]">{t('title')}</h1>
        <p className="text-sm text-[#4f6281]">{t('subtitle')}</p>
        {showOnboardingSkip ? (
          <p className="text-sm text-[#4f6281]">
            <Link
              href={'/dashboard' as Route}
              onClick={() => clearPostSignupPaymentPrompt()}
              className="font-medium text-[#2f4f83] underline-offset-2 hover:underline"
            >
              {t('actions.skipToSite')}
            </Link>
          </p>
        ) : null}
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
                    const eligibility = purchaseEligibility[checklist.id] || { can_purchase: true, reason: null };
                    const canPurchase = eligibility.can_purchase;
                    const priceLabel = checklist.pricing
                      ? `${(checklist.pricing.amount_cents / 100).toFixed(2)} ${checklist.pricing.currency.toUpperCase()}`
                      : t('labels.priceUnavailable');
                    const description =
                      checklist.checklist_type?.description?.trim() || checklist.warning?.trim() || t('labels.noDescription');
                    const typeLabel = checklist.checklist_type?.name || checklist.checklist_type?.code || t('labels.checklistType');
                    return (
                      <div
                        key={checklist.id}
                        onClick={() => canPurchase && setSelectedChecklistId(checklist.id)}
                        onKeyDown={(event) => {
                          if (canPurchase && (event.key === 'Enter' || event.key === ' ')) {
                            event.preventDefault();
                            setSelectedChecklistId(checklist.id);
                          }
                        }}
                        role="button"
                        tabIndex={canPurchase ? 0 : -1}
                        aria-pressed={isSelected}
                        className={`group relative overflow-hidden rounded-2xl border p-0 text-left transition-all duration-300 ${
                          isSelected
                            ? 'border-[#9fc2ff] bg-[linear-gradient(145deg,#143566_0%,#1b4a86_48%,#2a67b0_100%)] text-white ring-2 ring-[#a9c8ff]/70 shadow-[0_18px_32px_rgba(10,30,63,0.55)]'
                            : canPurchase
                              ? 'border-[#2d4f83] bg-[linear-gradient(145deg,#0d2448_0%,#123263_48%,#173e78_100%)] text-[#d8e6ff] hover:-translate-y-0.5 hover:border-[#79a8f6] hover:shadow-[0_14px_28px_rgba(10,30,63,0.45)]'
                              : 'border-[#2d4f83] bg-[linear-gradient(145deg,#0d2448_0%,#123263_48%,#173e78_100%)] text-[#d8e6ff] opacity-60 cursor-not-allowed'
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

                          <div className="mt-4">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-[#b8cff6]">{t('labels.price')}</p>
                            <p className="text-xl font-semibold tracking-tight text-white">{priceLabel}</p>
                          </div>

                          {isSelected ? (
                            <div className="mt-4">
                              {canPurchase ? (
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    void beginCheckout(undefined, { redirectToProfileOnIncomplete: true });
                                  }}
                                  disabled={loading}
                                  className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-center text-xs font-semibold text-white hover:bg-white/15 disabled:opacity-60"
                                >
                                  {loading ? t('actions.redirecting') : t('actions.proceed')}
                                </button>
                              ) : (
                                <div className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-center text-xs font-semibold text-white">
                                  {eligibility.reason || t('errors.alreadyPurchased')}
                                </div>
                              )}
                            </div>
                          ) : null}

                          {checklist.warning ? <p className="mt-3 text-xs text-amber-200">{checklist.warning}</p> : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-amber-200">{t('empty.noneAvailable')}</p>
            )}
          </div>
        ) : null}
      </article>
    </section>
  );
}
