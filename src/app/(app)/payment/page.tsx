'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { createStripeCheckoutSession, getUserPaymentStatus } from '@/lib/payments';
import { listPublishedCustomerChecklists, type CustomerChecklist } from '@/lib/checklist-api';

const LATEST_PAYMENT_ID_STORAGE_KEY = 'checklist_latest_payment_id';
const CHECKOUT_CHECKLIST_ID_STORAGE_KEY = 'checklist_checkout_selected_id';

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

        const user = await getCurrentUser();
        try {
          const paymentState = await getUserPaymentStatus(user.user.id);
          if (paymentState.payment_status === 'succeeded') {
            window.location.assign('/payment/success');
            return;
          }
        } catch {
          // Continue showing checklist selection when status lookup is unavailable.
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
      setError(err instanceof Error ? err.message : 'Failed to start checkout.');
      setLoading(false);
    }
  }

  const checkoutCancelled = searchParams.get('checkout') === 'cancelled';

  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col justify-start space-y-6 px-4 pt-8 text-[#1f2d45]">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-[#6c83a8]">Customer</p>
        <h1 className="text-3xl font-semibold text-[#1f2d45]">Select checklist to purchase</h1>
        <p className="text-sm text-[#4f6281]">Choose a checklist first, then proceed to Stripe checkout.</p>
      </header>
      <article className="rounded-2xl border border-[#13305c] bg-[linear-gradient(140deg,#071733_0%,#0c2144_50%,#13356d_100%)] p-5 text-sm text-[#d8e6ff] shadow-sm">
        {catalogLoading ? <p>Loading available checklists...</p> : null}
        {checkoutCancelled ? (
          <p className="text-amber-200">Checkout was cancelled. You can try again below.</p>
        ) : null}
        {error ? <p className="mt-2 text-rose-300">{error}</p> : null}
        {!catalogLoading ? (
          <div className="mt-4 flex flex-col gap-3">
            {checklists.length ? (
              <label className="min-w-[320px] flex-1 space-y-2">
                <span className="text-xs uppercase tracking-[0.2em] text-[#9db8e6]">Checklist to purchase</span>
                <select
                  value={selectedChecklistId}
                  onChange={(event) => setSelectedChecklistId(event.target.value)}
                  className="w-full rounded-lg border border-[#2d4f83] bg-[#10284f] px-3 py-2 text-white outline-none ring-[#8bb4ff]/50 focus:ring"
                >
                  <option value="">Select checklist</option>
                  {checklists.map((checklist) => (
                    <option key={checklist.id} value={checklist.id}>
                      {checklist.title}
                      {checklist.pricing
                        ? ` - ${(checklist.pricing.amount_cents / 100).toFixed(2)} ${checklist.pricing.currency.toUpperCase()}`
                        : ''}
                    </option>
                  ))}
                </select>
              </label>
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
