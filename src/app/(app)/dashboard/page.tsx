'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { getCurrentAssessment, startAssessment, type AssessmentSessionResponse } from '@/lib/assessment';
import { getCurrentUser, startMfaSetup, verifyMfaCode } from '@/lib/auth';
import { createStripeSetupIntent, type PaymentSetupResponse } from '@/lib/payments';

export default function DashboardPage() {
  const [profile, setProfile] = useState<{ id: string; email: string; role: string; mfa_enabled: boolean } | null>(null);
  const [profileError, setProfileError] = useState('');

  const [mfaSecret, setMfaSecret] = useState('');
  const [mfaUri, setMfaUri] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaMessage, setMfaMessage] = useState('');
  const [mfaError, setMfaError] = useState('');

  const [amountCents, setAmountCents] = useState('4900');
  const [currency, setCurrency] = useState('USD');
  const [paymentSetup, setPaymentSetup] = useState<PaymentSetupResponse | null>(null);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [paymentError, setPaymentError] = useState('');

  const [checklistId, setChecklistId] = useState('');
  const [assessment, setAssessment] = useState<AssessmentSessionResponse | null>(null);
  const [assessmentError, setAssessmentError] = useState('');
  const [assessmentMessage, setAssessmentMessage] = useState('');
  const [remainingLabel, setRemainingLabel] = useState('');

  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [isStartingAssessment, setIsStartingAssessment] = useState(false);

  useEffect(() => {
    if (!assessment?.expires_at) {
      setRemainingLabel('');
      return;
    }

    const updateRemaining = () => {
      const expiresAt = new Date(assessment.expires_at).getTime();
      const diff = expiresAt - Date.now();
      if (Number.isNaN(expiresAt)) {
        setRemainingLabel('Expiry time is invalid.');
        return;
      }
      if (diff <= 0) {
        setRemainingLabel('Assessment window expired.');
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      setRemainingLabel(`${days}d ${hours}h ${minutes}m remaining`);
    };

    updateRemaining();
    const intervalId = window.setInterval(updateRemaining, 30000);
    return () => window.clearInterval(intervalId);
  }, [assessment?.expires_at]);

  async function refreshProfile() {
    setIsLoadingProfile(true);
    setProfileError('');
    try {
      const response = await getCurrentUser();
      setProfile({
        id: response.user.id,
        email: response.user.email,
        role: response.user.role,
        mfa_enabled: response.mfa_enabled,
      });
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Unable to fetch profile');
    } finally {
      setIsLoadingProfile(false);
    }
  }

  async function setupMfa() {
    setMfaError('');
    setMfaMessage('');
    try {
      const response = await startMfaSetup();
      setMfaSecret(response.secret);
      setMfaUri(response.provisioning_uri);
      setMfaMessage('MFA secret generated. Scan URI in your authenticator app.');
    } catch (error) {
      setMfaError(error instanceof Error ? error.message : 'Failed to setup MFA');
    }
  }

  async function confirmMfa(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMfaError('');
    setMfaMessage('');
    try {
      const response = await verifyMfaCode({ code: mfaCode });
      setMfaMessage(response.mfa_enabled ? 'MFA is enabled.' : 'MFA verification response received.');
    } catch (error) {
      setMfaError(error instanceof Error ? error.message : 'Failed to verify MFA');
    }
  }

  async function fetchCurrentAssessment() {
    setAssessmentError('');
    setAssessmentMessage('');
    try {
      const response = await getCurrentAssessment(checklistId.trim() || undefined);
      setAssessment(response);
      setAssessmentMessage('Active assessment found.');
    } catch (error) {
      setAssessmentError(error instanceof Error ? error.message : 'Unable to fetch assessment');
    }
  }

  async function onCreatePaymentIntent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPaymentError('');
    setPaymentMessage('');
    setPaymentSetup(null);

    if (!profile?.id) {
      setPaymentError('Load your profile first. User ID is required to create payment intent.');
      return;
    }

    const parsedAmount = Number.parseInt(amountCents.trim(), 10);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setPaymentError('Amount must be a valid positive number (in cents).');
      return;
    }

    setIsLoadingPayment(true);
    try {
      const response = await createStripeSetupIntent({
        user_id: profile.id,
        amount_cents: parsedAmount,
        currency: currency.trim().toUpperCase(),
      });
      setPaymentSetup(response);
      setPaymentMessage(
        'Payment intent created. Complete checkout with Stripe client SDK and wait for webhook-based unlock.',
      );
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'Unable to create Stripe payment intent');
    } finally {
      setIsLoadingPayment(false);
    }
  }

  async function onStartAssessment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAssessmentError('');
    setAssessmentMessage('');
    if (!checklistId.trim()) {
      setAssessmentError('Checklist ID is required to start assessment.');
      return;
    }

    setIsStartingAssessment(true);
    try {
      const response = await startAssessment({ checklist_id: checklistId.trim() });
      setAssessment(response);
      setAssessmentMessage('Assessment started. Your 7-day completion window is now active.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to start assessment';
      if (message.includes('payment_required')) {
        setAssessmentError(
          'Payment is not unlocked yet. Complete payment and wait for Stripe webhook confirmation, then retry.',
        );
      } else {
        setAssessmentError(message);
      }
    } finally {
      setIsStartingAssessment(false);
    }
  }

  return (
    <section className="space-y-8">
      <header className="space-y-4">
        <p className="text-xs uppercase tracking-[0.34em] text-[#9dc5ff]">Milestone 1</p>
        <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-white md:text-5xl">Frontend API Integration</h1>
        <p className="max-w-3xl text-base leading-7 text-[#d8e2f2]">
          This dashboard integrates completed backend Milestone 1 APIs: auth, MFA, Stripe setup-intent, and assessment
          lifecycle start/current.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-[#345793] bg-[#0d1d3a] p-5">
          <h2 className="text-lg font-semibold">Auth Profile</h2>
          <p className="mt-2 text-sm text-[#97a5bb]">Checks `GET /auth/me` with stored Bearer token.</p>
          <button
            type="button"
            onClick={refreshProfile}
            disabled={isLoadingProfile}
            className="mt-4 rounded-lg border border-[#1f7bff] bg-[#1f7bff]/20 px-3 py-2 text-sm hover:bg-[#1f7bff]/35"
          >
            {isLoadingProfile ? 'Loading…' : 'Load profile'}
          </button>
          {profile ? (
            <div className="mt-3 text-sm text-[#d8e2f2]">
              <p>User ID: {profile.id}</p>
              <p>Email: {profile.email}</p>
              <p>Role: {profile.role}</p>
              <p>MFA enabled: {profile.mfa_enabled ? 'Yes' : 'No'}</p>
            </div>
          ) : null}
          {profileError ? <p className="mt-3 text-sm text-rose-300">{profileError}</p> : null}
        </article>

        <article className="rounded-2xl border border-[#345793] bg-[#0d1d3a] p-5">
          <h2 className="text-lg font-semibold">MFA Setup & Verify</h2>
          <p className="mt-2 text-sm text-[#97a5bb]">Uses `POST /auth/mfa/setup` and `POST /auth/mfa/verify`.</p>
          <button
            type="button"
            onClick={setupMfa}
            className="mt-4 rounded-lg border border-[#1f7bff] bg-[#1f7bff]/20 px-3 py-2 text-sm hover:bg-[#1f7bff]/35"
          >
            Generate MFA secret
          </button>
          {mfaSecret ? (
            <div className="mt-3 text-xs text-[#d8e2f2]">
              <p>Secret: {mfaSecret}</p>
              <p className="break-all">URI: {mfaUri}</p>
            </div>
          ) : null}
          <form onSubmit={confirmMfa} className="mt-3 space-y-2">
            <input
              type="text"
              value={mfaCode}
              onChange={(event) => setMfaCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6-digit TOTP code"
              maxLength={6}
              className="w-full rounded-lg border border-[#345793] bg-[#07112a] px-3 py-2 text-sm text-[#f0f5ff] outline-none ring-[#1f7bff]/45 focus:ring-2"
            />
            <button type="submit" className="rounded-lg border border-emerald-300/40 bg-emerald-500/15 px-3 py-2 text-sm text-emerald-100">
              Verify MFA
            </button>
          </form>
          {mfaMessage ? <p className="mt-3 text-sm text-emerald-300">{mfaMessage}</p> : null}
          {mfaError ? <p className="mt-3 text-sm text-rose-300">{mfaError}</p> : null}
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-[#345793] bg-[#0d1d3a] p-5">
          <h2 className="text-lg font-semibold">Stripe Payment Setup</h2>
          <p className="mt-2 text-sm text-[#97a5bb]">
            Integrates `POST /payments/stripe/setup-intent` for one-time payment checkout initiation.
          </p>
          <form onSubmit={onCreatePaymentIntent} className="mt-3 space-y-2">
            <input
              type="number"
              min={1}
              value={amountCents}
              onChange={(event) => setAmountCents(event.target.value)}
              placeholder="Amount in cents"
              className="w-full rounded-lg border border-[#345793] bg-[#07112a] px-3 py-2 text-sm text-[#f0f5ff] outline-none ring-[#1f7bff]/45 focus:ring-2"
            />
            <input
              type="text"
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              placeholder="Currency, e.g. USD"
              className="w-full rounded-lg border border-[#345793] bg-[#07112a] px-3 py-2 text-sm text-[#f0f5ff] outline-none ring-[#1f7bff]/45 focus:ring-2"
            />
            <button
              type="submit"
              disabled={!profile?.id || isLoadingPayment}
              className="rounded-lg border border-amber-300/35 bg-amber-500/15 px-3 py-2 text-sm text-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoadingPayment ? 'Creating intent…' : 'Create Stripe setup intent'}
            </button>
          </form>
          {paymentSetup ? (
            <div className="mt-3 text-sm text-[#d8e2f2]">
              <p>Payment ID: {paymentSetup.payment_id}</p>
              <p>Intent ID: {paymentSetup.stripe_payment_intent_id}</p>
              <p>Amount: {paymentSetup.amount_cents}</p>
              <p>Currency: {paymentSetup.currency}</p>
              <p className="break-all text-xs text-[#9dc5ff]">Client Secret: {paymentSetup.client_secret}</p>
              <p className="mt-2 text-xs text-[#97a5bb]">
                Webhook linkage: access unlock is automatic only after successful Stripe webhook processing in backend.
              </p>
            </div>
          ) : null}
          {paymentMessage ? <p className="mt-3 text-sm text-emerald-300">{paymentMessage}</p> : null}
          {paymentError ? <p className="mt-3 text-sm text-rose-300">{paymentError}</p> : null}
        </article>

        <article className="rounded-2xl border border-[#345793] bg-[#0d1d3a] p-5">
          <h2 className="text-lg font-semibold">Pre-start Assessment Screen</h2>
          <p className="mt-2 text-sm text-[#97a5bb]">
            Documentation-aligned milestone flow: payment unlock, then explicit start with 7-day timer.
          </p>
          <div className="mt-3 space-y-2 rounded-lg border border-[#345793] bg-[#07112a] p-3 text-sm text-[#d8e2f2]">
            <p>- You will have 7 days to complete the assessment after pressing Start Assessment.</p>
            <p>- The 7-day countdown starts only when you click Start Assessment.</p>
            <p>- Evidence upload is optional, but recommended for later auditor review.</p>
            <p>- Final report is reviewed by an auditor and published in-app (not by email).</p>
            <p>- Assessment-related data follows retention/deletion policy after lifecycle completion.</p>
          </div>

          <h3 className="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#9dc5ff]">Assessment lifecycle APIs</h3>
          <p className="mt-1 text-sm text-[#97a5bb]">Integrates `GET /assessment/current` and `POST /assessment/start`.</p>
          <form onSubmit={onStartAssessment} className="mt-3 space-y-2">
            <input
              type="text"
              value={checklistId}
              onChange={(event) => setChecklistId(event.target.value)}
              placeholder="Published checklist UUID"
              className="w-full rounded-lg border border-[#345793] bg-[#07112a] px-3 py-2 text-sm text-[#f0f5ff] outline-none ring-[#1f7bff]/45 focus:ring-2"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={isStartingAssessment}
                className="rounded-lg border border-cyan-300/35 bg-cyan-500/15 px-3 py-2 text-sm text-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isStartingAssessment ? 'Starting…' : 'Start assessment'}
              </button>
              <button
                type="button"
                onClick={fetchCurrentAssessment}
                className="rounded-lg border border-[#345793] px-3 py-2 text-sm text-[#d8e2f2] hover:bg-[#1f7bff]/20"
              >
                Get current
              </button>
            </div>
          </form>
          {assessment ? (
            <div className="mt-3 text-sm text-[#d8e2f2]">
              <p>Status: {assessment.status}</p>
              <p>Completion: {assessment.completion_percent}%</p>
              <p>Started At: {assessment.started_at}</p>
              <p>Expires At: {assessment.expires_at}</p>
              {remainingLabel ? <p className="text-cyan-200">{remainingLabel}</p> : null}
            </div>
          ) : null}
          {assessmentMessage ? <p className="mt-3 text-sm text-emerald-300">{assessmentMessage}</p> : null}
          {assessmentError ? <p className="mt-3 text-sm text-rose-300">{assessmentError}</p> : null}
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Link href="/assessment" className="rounded-2xl border border-[#345793] bg-[#0d1d3a] p-5 hover:bg-[#1a2f56]">
          <h2 className="text-lg font-semibold">Go to Assessment</h2>
          <p className="mt-2 text-sm text-[#97a5bb]">Continue Milestone 2 checklist flow later.</p>
        </Link>
        <Link href="/reports" className="rounded-2xl border border-[#345793] bg-[#0d1d3a] p-5 hover:bg-[#1a2f56]">
          <h2 className="text-lg font-semibold">View Reports</h2>
          <p className="mt-2 text-sm text-[#97a5bb]">Read-only report pages for now.</p>
        </Link>
        <Link href="/products/audit-readiness-checklist" className="rounded-2xl border border-[#345793] bg-[#0d1d3a] p-5 hover:bg-[#1a2f56]">
          <h2 className="text-lg font-semibold">Open Product Details</h2>
          <p className="mt-2 text-sm text-[#97a5bb]">Audit Readiness Checklist product overview.</p>
        </Link>
      </section>
    </section>
  );
}