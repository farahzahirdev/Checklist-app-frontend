'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { createStripeSetupIntent } from '@/lib/payments';

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

function CheckoutForm({ checklistId }: { checklistId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setError('');
    if (!stripe || !elements) {
      setError('Stripe is still loading. Please try again.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (result.error) {
        setError(result.error.message ?? 'Payment confirmation failed.');
        return;
      }

      setMessage('Payment successful. You can now continue to access/start your assessment.');
      router.push('/access');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment confirmation failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="rounded-xl border border-[#345793] bg-[#0d1d3a] p-3">
        <p className="text-xs text-[#97a5bb]">Checklist</p>
        <p className="mt-1 text-sm font-semibold text-white">{checklistId}</p>
      </div>
      <div className="rounded-xl border border-[#345793] bg-[#0d1d3a] p-3">
        <PaymentElement />
      </div>
      <button
        type="submit"
        disabled={submitting || !stripe || !elements}
        className="w-full rounded-lg border border-[#1f7bff] bg-[#1f7bff] py-2.5 text-sm font-medium text-white hover:bg-[#2e87ff] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Confirming payment…' : 'Pay now'}
      </button>
      {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </form>
  );
}

export default function PaymentPage() {
  const [checklistId, setChecklistId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [amountCents, setAmountCents] = useState<number | undefined>(undefined);
  const [currency, setCurrency] = useState('usd');

  const elementsOptions = useMemo(() => {
    if (!clientSecret) return undefined;
    return { clientSecret };
  }, [clientSecret]);

  async function onCreateIntent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (!checklistId.trim()) {
      setError('Checklist ID is required.');
      return;
    }
    setLoading(true);
    try {
      const response = await createStripeSetupIntent({
        checklist_id: checklistId.trim(),
        amount_cents: amountCents,
        currency: currency.trim() || 'usd',
      });
      setClientSecret(response.client_secret);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start payment.');
    } finally {
      setLoading(false);
    }
  }

  if (!publishableKey || !stripePromise) {
    return (
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold text-white">Payment</h1>
        <p className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          Missing `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`. Add it to `.env.local`.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/85">Customer</p>
        <h1 className="text-3xl font-semibold text-white">Payment</h1>
        <p className="text-sm text-[#97a5bb]">Complete payment to unlock checklist access.</p>
      </header>

      <article className="rounded-2xl border border-white/15 bg-black/25 p-5">
        <form className="space-y-3" onSubmit={onCreateIntent}>
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
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block space-y-2 text-sm">
              <span className="text-zinc-200">Amount cents (optional)</span>
              <input
                type="number"
                min={1}
                value={amountCents ?? ''}
                onChange={(event) => setAmountCents(event.target.value ? Number(event.target.value) : undefined)}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-zinc-100 outline-none ring-cyan-300/50 focus:ring"
              />
            </label>
            <label className="block space-y-2 text-sm">
              <span className="text-zinc-200">Currency (optional)</span>
              <input
                type="text"
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-zinc-100 outline-none ring-cyan-300/50 focus:ring"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg border border-cyan-300/40 bg-cyan-500/15 px-3 py-2 text-sm text-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Preparing payment…' : 'Start payment'}
          </button>
        </form>
        {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
      </article>

      {clientSecret && elementsOptions ? (
        <article className="rounded-2xl border border-white/15 bg-black/25 p-5">
          <Elements stripe={stripePromise} options={elementsOptions}>
            <CheckoutForm checklistId={checklistId} />
          </Elements>
        </article>
      ) : null}
    </section>
  );
}
