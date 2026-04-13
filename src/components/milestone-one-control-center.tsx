'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { apiGet, apiPost } from '@/lib/api';

type HealthResponse = {
  status: string;
};

type MfaSetupResponse = {
  secret: string;
  provisioning_uri: string;
};

type MfaVerifyResponse = {
  verified: boolean;
};

type PaymentStateResponse = {
  payment_intent_id: string;
  is_paid: boolean;
  paid_at: string | null;
  access_expires_at: string | null;
};

type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

function StatusPill({ status }: { status: AsyncStatus }) {
  const label =
    status === 'idle'
      ? 'Idle'
      : status === 'loading'
        ? 'Running'
        : status === 'success'
          ? 'Ready'
          : 'Error';

  const className =
    status === 'success'
      ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200'
      : status === 'error'
        ? 'border-rose-400/40 bg-rose-500/15 text-rose-200'
        : status === 'loading'
          ? 'border-amber-400/40 bg-amber-500/15 text-amber-200'
          : 'border-white/20 bg-white/5 text-zinc-200';

  return (
    <span className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.22em] ${className}`}>
      {label}
    </span>
  );
}

function buildExpiryPreview(startAt: string): string {
  if (!startAt) {
    return 'Set a start date/time to preview 7-day access expiry.';
  }

  const parsed = new Date(startAt);
  if (Number.isNaN(parsed.getTime())) {
    return 'Invalid date/time format.';
  }

  parsed.setDate(parsed.getDate() + 7);
  return `Assessment window would end at ${parsed.toISOString()}`;
}

export function MilestoneOneControlCenter() {
  const [healthStatus, setHealthStatus] = useState<AsyncStatus>('idle');
  const [healthMessage, setHealthMessage] = useState('');

  const [email, setEmail] = useState('');
  const [mfaStatus, setMfaStatus] = useState<AsyncStatus>('idle');
  const [mfaError, setMfaError] = useState('');
  const [secret, setSecret] = useState('');
  const [uri, setUri] = useState('');
  const [code, setCode] = useState('');
  const [verified, setVerified] = useState<boolean | null>(null);

  const [paymentIntentId, setPaymentIntentId] = useState('pi_demo_0001');
  const [paidAt, setPaidAt] = useState('');
  const [accessExpiresAt, setAccessExpiresAt] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<AsyncStatus>('idle');
  const [paymentError, setPaymentError] = useState('');
  const [paymentState, setPaymentState] = useState<PaymentStateResponse | null>(null);

  const [assessmentStartAt, setAssessmentStartAt] = useState('');
  const assessmentPreview = useMemo(
    () => buildExpiryPreview(assessmentStartAt),
    [assessmentStartAt],
  );

  async function checkApiHealth() {
    setHealthStatus('loading');
    setHealthMessage('');

    try {
      const response = await apiGet<HealthResponse>('/health');
      setHealthStatus('success');
      setHealthMessage(`API status: ${response.status}`);
    } catch (error) {
      setHealthStatus('error');
      setHealthMessage(error instanceof Error ? error.message : 'Unable to contact API');
    }
  }

  async function handleMfaSetup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMfaStatus('loading');
    setMfaError('');
    setVerified(null);

    try {
      const setup = await apiPost<MfaSetupResponse, { email: string }>('/auth/mfa/setup', { email });
      setSecret(setup.secret);
      setUri(setup.provisioning_uri);
      setMfaStatus('success');
    } catch (error) {
      setMfaStatus('error');
      setMfaError(error instanceof Error ? error.message : 'MFA setup failed');
    }
  }

  async function handleMfaVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMfaStatus('loading');
    setMfaError('');

    try {
      const response = await apiPost<MfaVerifyResponse, { secret: string; code: string }>(
        '/auth/mfa/verify',
        {
          secret,
          code,
        },
      );
      setVerified(response.verified);
      setMfaStatus('success');
    } catch (error) {
      setMfaStatus('error');
      setMfaError(error instanceof Error ? error.message : 'MFA verification failed');
    }
  }

  async function simulatePayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPaymentStatus('loading');
    setPaymentError('');

    try {
      const response = await apiPost<
        PaymentStateResponse,
        {
          stripe_payment_intent_id: string;
          paid_at: string | null;
          access_expires_at: string | null;
        }
      >('/payments/stripe/webhook', {
        stripe_payment_intent_id: paymentIntentId,
        paid_at: paidAt || null,
        access_expires_at: accessExpiresAt || null,
      });

      setPaymentState(response);
      setPaymentStatus('success');
    } catch (error) {
      setPaymentStatus('error');
      setPaymentError(error instanceof Error ? error.message : 'Payment simulation failed');
    }
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-5 md:grid-cols-2">
        <article className="rounded-3xl border border-white/15 bg-black/25 p-6 backdrop-blur">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-100">API Connectivity</h2>
            <StatusPill status={healthStatus} />
          </div>
          <p className="text-sm leading-6 text-zinc-300">
            Confirms the frontend can reach the backend before running auth/payment lifecycle actions.
          </p>
          <button
            type="button"
            onClick={checkApiHealth}
            className="mt-5 rounded-xl border border-cyan-300/40 bg-cyan-500/15 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-500/25"
          >
            Run health check
          </button>
          {healthMessage ? <p className="mt-3 text-sm text-zinc-200">{healthMessage}</p> : null}
        </article>

        <article className="rounded-3xl border border-white/15 bg-black/25 p-6 backdrop-blur">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-100">Assessment Window Preview</h2>
            <StatusPill status="idle" />
          </div>
          <p className="text-sm leading-6 text-zinc-300">
            Milestone 1 rule: the 7-day window starts only when Start Assessment is triggered.
          </p>
          <label className="mt-5 block text-xs uppercase tracking-[0.2em] text-zinc-400" htmlFor="assessment-start">
            Start assessment at
          </label>
          <input
            id="assessment-start"
            type="datetime-local"
            value={assessmentStartAt}
            onChange={(event) => setAssessmentStartAt(event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-zinc-100 outline-none ring-cyan-300/50 placeholder:text-zinc-500 focus:ring"
          />
          <p className="mt-3 text-sm text-zinc-200">{assessmentPreview}</p>
        </article>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-3xl border border-white/15 bg-black/25 p-6 backdrop-blur">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-100">MFA Setup and Verify</h2>
            <StatusPill status={mfaStatus} />
          </div>

          <form className="space-y-3" onSubmit={handleMfaSetup}>
            <label className="block text-xs uppercase tracking-[0.2em] text-zinc-400" htmlFor="mfa-email">
              User email
            </label>
            <input
              id="mfa-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-zinc-100 outline-none ring-cyan-300/50 placeholder:text-zinc-500 focus:ring"
              placeholder="client@example.com"
            />
            <button
              type="submit"
              className="rounded-xl border border-cyan-300/40 bg-cyan-500/15 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-500/25"
            >
              Generate TOTP secret
            </button>
          </form>

          {secret ? (
            <div className="mt-4 rounded-2xl border border-white/15 bg-white/5 p-3 text-xs text-zinc-200">
              <p>
                Secret: <span className="font-semibold tracking-wide text-cyan-200">{secret}</span>
              </p>
              <p className="mt-1 break-all text-zinc-300">URI: {uri}</p>
            </div>
          ) : null}

          <form className="mt-4 space-y-3" onSubmit={handleMfaVerify}>
            <label className="block text-xs uppercase tracking-[0.2em] text-zinc-400" htmlFor="mfa-code">
              TOTP code
            </label>
            <input
              id="mfa-code"
              type="text"
              required
              minLength={6}
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm tracking-[0.3em] text-zinc-100 outline-none ring-cyan-300/50 placeholder:text-zinc-500 focus:ring"
              placeholder="123456"
            />
            <button
              type="submit"
              disabled={!secret}
              className="rounded-xl border border-emerald-300/40 bg-emerald-500/15 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Verify code
            </button>
          </form>

          {verified !== null ? (
            <p className={`mt-3 text-sm ${verified ? 'text-emerald-200' : 'text-rose-200'}`}>
              Verification result: {verified ? 'valid code' : 'invalid code'}
            </p>
          ) : null}
          {mfaError ? <p className="mt-3 text-sm text-rose-200">{mfaError}</p> : null}
        </article>

        <article className="rounded-3xl border border-white/15 bg-black/25 p-6 backdrop-blur">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-100">Payment Unlock Simulator</h2>
            <StatusPill status={paymentStatus} />
          </div>

          <form className="space-y-3" onSubmit={simulatePayment}>
            <label className="block text-xs uppercase tracking-[0.2em] text-zinc-400" htmlFor="payment-id">
              Stripe payment intent id
            </label>
            <input
              id="payment-id"
              type="text"
              required
              value={paymentIntentId}
              onChange={(event) => setPaymentIntentId(event.target.value)}
              className="w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-zinc-100 outline-none ring-cyan-300/50 placeholder:text-zinc-500 focus:ring"
            />

            <label className="block text-xs uppercase tracking-[0.2em] text-zinc-400" htmlFor="paid-at">
              Paid at (ISO)
            </label>
            <input
              id="paid-at"
              type="text"
              value={paidAt}
              onChange={(event) => setPaidAt(event.target.value)}
              className="w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-zinc-100 outline-none ring-cyan-300/50 placeholder:text-zinc-500 focus:ring"
              placeholder="2026-04-13T10:00:00Z"
            />

            <label className="block text-xs uppercase tracking-[0.2em] text-zinc-400" htmlFor="access-expires-at">
              Access expires at (ISO)
            </label>
            <input
              id="access-expires-at"
              type="text"
              value={accessExpiresAt}
              onChange={(event) => setAccessExpiresAt(event.target.value)}
              className="w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-zinc-100 outline-none ring-cyan-300/50 placeholder:text-zinc-500 focus:ring"
              placeholder="2026-04-20T10:00:00Z"
            />

            <button
              type="submit"
              className="rounded-xl border border-amber-300/40 bg-amber-500/15 px-4 py-2 text-sm font-medium text-amber-100 transition hover:bg-amber-500/25"
            >
              Send simulated webhook
            </button>
          </form>

          {paymentState ? (
            <div className="mt-4 rounded-2xl border border-white/15 bg-white/5 p-3 text-xs leading-6 text-zinc-200">
              <p>Payment Intent: {paymentState.payment_intent_id}</p>
              <p>Is Paid: {String(paymentState.is_paid)}</p>
              <p>Paid At: {paymentState.paid_at ?? 'null'}</p>
              <p>Access Expires At: {paymentState.access_expires_at ?? 'null'}</p>
            </div>
          ) : null}
          {paymentError ? <p className="mt-3 text-sm text-rose-200">{paymentError}</p> : null}
        </article>
      </section>
    </div>
  );
}
