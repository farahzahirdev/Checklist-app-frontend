'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import CompanySwitcher from '@/components/company/company-switcher';
import { getActiveCompanyId } from '@/lib/company-context';
import { createStripeCheckoutSession, getUserPaymentStatus } from '@/lib/payments';
import { listPublishedCustomerChecklists, type CustomerChecklist } from '@/lib/checklist-api';

const LATEST_PAYMENT_ID_STORAGE_KEY = 'checklist_latest_payment_id';
const CHECKOUT_CHECKLIST_ID_STORAGE_KEY = 'checklist_checkout_selected_id';

function formatCheckoutError(err: unknown): string {
  const rawMessage = err instanceof Error ? err.message : '';
  if (!rawMessage) {
    return 'Unable to start checkout. Please try again.';
  }

  if (/failed to fetch/i.test(rawMessage) || /networkerror/i.test(rawMessage)) {
    return 'Unable to reach payment service right now. Please check your connection and try again.';
  }

  return rawMessage;
}

export default function PaymentPage() {
  const searchParams = useSearchParams();
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
        setError(err instanceof Error ? err.message : 'Failed to load checkout details.');
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
      setError('Please select a checklist.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const origin = window.location.origin;
      const companyId = getActiveCompanyId() || undefined;
      window.localStorage.setItem(CHECKOUT_CHECKLIST_ID_STORAGE_KEY, selectedChecklistId);
      const checkoutUrl = await createStripeCheckoutSession({
        checklist_id: selectedChecklistId,
        company_id: companyId,
        success_url: `${origin}/payment/success?checklist_id=${encodeURIComponent(selectedChecklistId)}`,
        cancel_url: `${origin}/payment?checkout=cancelled`,
      });
      if (checkoutUrl.paymentId) {
        window.localStorage.setItem(LATEST_PAYMENT_ID_STORAGE_KEY, checkoutUrl.paymentId);
      }
      window.location.assign(checkoutUrl.checkoutUrl);
    } catch (err) {
      setError(formatCheckoutError(err));
      setLoading(false);
    }
  }

  const checkoutCancelled = searchParams.get('checkout') === 'cancelled';

  return (
    <section className="flex min-h-[70vh] w-full flex-col justify-start space-y-6 px-1 pt-1 text-[#1f2d45]">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-[#6c83a8]">Customer</p>
        <h1 className="text-3xl font-semibold text-[#1f2d45]">Select checklist to purchase</h1>
        <p className="text-sm text-[#4f6281]">Choose a checklist first, then proceed to Stripe checkout.</p>
      </header>

      <CompanySwitcher label="Company" compact={false} />
      <article className="rounded-2xl border border-[#13305c] bg-[linear-gradient(140deg,#071733_0%,#0c2144_50%,#13356d_100%)] p-6 text-sm text-[#d8e6ff] shadow-[0_10px_30px_rgba(6,20,47,0.25)]">
        {catalogLoading ? <p>Loading available checklists...</p> : null}
        {checkoutCancelled ? (
          <p className="text-amber-200">Checkout was cancelled. You can try again below.</p>
        ) : null}
        {error ? <p className="mt-2 text-rose-300">{error}</p> : null}
        {!catalogLoading ? (
          <div className="mt-4 flex flex-col gap-3">
            {checklists.length ? (
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-[0.2em] text-[#9db8e6]">Checklist to purchase</span>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {checklists.map((checklist) => {
                    const isSelected = selectedChecklistId === checklist.id;
                    const priceLabel = checklist.pricing
                      ? `${(checklist.pricing.amount_cents / 100).toFixed(2)} ${checklist.pricing.currency.toUpperCase()}`
                      : 'Price unavailable';
                    const description =
                      checklist.checklist_type?.description?.trim() || checklist.warning?.trim() || 'No description available.';
                    return (
                      <button
                        key={checklist.id}
                        type="button"
                        onClick={() => setSelectedChecklistId(checklist.id)}
                        className={`rounded-xl border p-3 text-left transition ${
                          isSelected
                            ? 'border-[#8bb4ff] bg-[linear-gradient(160deg,#16305d,#1c3d76)] text-white ring-2 ring-[#8bb4ff]/70 shadow-[0_8px_20px_rgba(16,40,79,0.45)]'
                            : 'border-[#2d4f83] bg-[linear-gradient(160deg,#10284f,#123263)] text-[#d8e6ff] hover:border-[#5e86c8] hover:shadow-[0_6px_16px_rgba(16,40,79,0.35)]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold leading-tight">{checklist.title}</p>
                          {isSelected ? (
                            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-[#a9c8ff] bg-[#0b2144] px-1 text-[10px] font-semibold text-[#cfe0ff]">
                              ✓
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1.5 text-xs text-[#9db8e6]">
                          {(checklist.checklist_type?.name || checklist.checklist_type?.code || 'Checklist type') +
                            (checklist.version ? ` • v${checklist.version}` : '')}
                        </p>
                        <p className="mt-2 line-clamp-3 text-xs text-[#c6d8fb]">{description}</p>
                        <p className="mt-3 text-base font-semibold tracking-wide">{priceLabel}</p>
                        {checklist.warning ? <p className="mt-2 text-xs text-amber-200">{checklist.warning}</p> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-amber-200">No purchasable checklists are currently available.</p>
            )}
            <button
              type="button"
              onClick={() => void beginCheckout()}
              disabled={loading || !selectedChecklistId}
              className="self-start rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-2 text-white hover:bg-[#223657] disabled:opacity-60"
            >
              {loading ? 'Redirecting...' : 'Proceed to checkout'}
            </button>
          </div>
        ) : null}
      </article>
    </section>
  );
}
