'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { createStripeCheckoutSession, getUserPaymentStatus } from '@/lib/payments';

const LATEST_PAYMENT_ID_STORAGE_KEY = 'checklist_latest_payment_id';

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function beginCheckout() {
      try {
        const user = await getCurrentUser();
        try {
          const paymentState = await getUserPaymentStatus(user.user.id);
          if (paymentState.payment_status === 'succeeded') {
            window.location.assign('/payment/success');
            return;
          }
        } catch {
          // Continue to checkout creation when status lookup is unavailable.
        }

        const origin = window.location.origin;
        const checkoutUrl = await createStripeCheckoutSession({
          user_id: user.user.id,
          success_url: `${origin}/payment/success`,
          cancel_url: `${origin}/payment?checkout=cancelled`,
        });
        if (checkoutUrl.paymentId) {
          window.localStorage.setItem(LATEST_PAYMENT_ID_STORAGE_KEY, checkoutUrl.paymentId);
        }
        window.location.assign(checkoutUrl.checkoutUrl);
      } catch (err) {
        if (!mounted) {
          return;
        }
        setError(err instanceof Error ? err.message : 'Failed to start checkout.');
        setLoading(false);
      }
    }
    void beginCheckout();

    return () => {
      mounted = false;
    };
  }, []);

  const checkoutCancelled = searchParams.get('checkout') === 'cancelled';

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/85">Customer</p>
        <h1 className="text-3xl font-semibold text-white">Redirecting to checkout...</h1>
        <p className="text-sm text-[#97a5bb]">We are creating your secure Stripe session.</p>
      </header>
      <article className="rounded-2xl border border-white/15 bg-black/25 p-5 text-sm text-zinc-200">
        {loading ? <p>Preparing checkout session...</p> : null}
        {checkoutCancelled ? (
          <p className="text-amber-200">Checkout was cancelled. You can try again below.</p>
        ) : null}
        {error ? <p className="mt-2 text-rose-300">{error}</p> : null}
        {!loading ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/payment" className="rounded-lg border border-cyan-300/40 bg-cyan-500/15 px-3 py-2 text-cyan-100">
              Try checkout again
            </Link>
            <Link href="/dashboard" className="rounded-lg border border-white/20 px-3 py-2 text-zinc-100 hover:bg-white/10">
              Back to dashboard
            </Link>
          </div>
        ) : null}
      </article>
    </section>
  );
}
