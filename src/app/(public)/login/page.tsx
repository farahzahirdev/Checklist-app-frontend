'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { useState, type FormEvent } from 'react';
import type { AuthResponse } from '@/lib/auth';
import {
  getRoleHomePath,
  getRoleKey,
  loginAccount,
  persistAccessToken,
  startMfaSetup,
  verifyMfaChallenge,
  verifyMfaCode,
} from '@/lib/auth';
import { createStripeCheckoutSession } from '@/lib/payments';
import authBackground from '@/assets/cybersecurity-background.jpg';

const LATEST_PAYMENT_ID_STORAGE_KEY = 'checklist_latest_payment_id';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaChallengeToken, setMfaChallengeToken] = useState('');
  const [mfaQrSvg, setMfaQrSvg] = useState('');
  const [step, setStep] = useState<'credentials' | 'customer-mfa-verify' | 'customer-mfa-setup'>('credentials');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuthResponse | null>(null);
  const [setupLoading, setSetupLoading] = useState(false);

  async function redirectCustomerToCheckout(userId: string) {
    const origin = window.location.origin;
    const checkoutUrl = await createStripeCheckoutSession({
      user_id: userId,
      success_url: `${origin}/payment/success`,
      cancel_url: `${origin}/payment?checkout=cancelled`,
    });
    if (checkoutUrl.paymentId) {
      window.localStorage.setItem(LATEST_PAYMENT_ID_STORAGE_KEY, checkoutUrl.paymentId);
    }
    window.location.assign(checkoutUrl.checkoutUrl);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const payload = {
        email: normalizedEmail,
        password,
      };

      const data = await loginAccount(payload);
      setResult(data);

      const role = getRoleKey(data.user.role);
      const destination = role === 'customer' ? '/payment' : getRoleHomePath(data.user.role);
      if (role === 'admin' || role === 'auditor') {
        if (!data.access_token) {
          setError('Sign in did not return an access token.');
          return;
        }
        persistAccessToken(data.access_token);
        router.push(destination as Route);
        router.refresh();
        return;
      }

      if (data.mfa_required && data.mfa_enabled) {
        if (!data.challenge_token) {
          setError('MFA verification requires a challenge token from login.');
          return;
        }
        setMfaChallengeToken(data.challenge_token);
        setStep('customer-mfa-verify');
        return;
      }

      if (data.mfa_required && !data.mfa_enabled) {
        if (!data.access_token) {
          setError('MFA setup requires an access token from login.');
          return;
        }
        persistAccessToken(data.access_token);
        setStep('customer-mfa-setup');
        await loadMfaSetup();
        return;
      }

      if (!data.access_token) {
        setError('Sign in did not return an access token.');
        return;
      }
      persistAccessToken(data.access_token);
      if (role === 'customer') {
        await redirectCustomerToCheckout(data.user.id);
      } else {
        router.push(destination as Route);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  }

  async function loadMfaSetup() {
    setSetupLoading(true);
    setError('');
    try {
      const setup = await startMfaSetup();
      setMfaQrSvg(setup.svg_qr ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load MFA setup details.');
    } finally {
      setSetupLoading(false);
    }
  }

  async function onVerifyMfaChallenge(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const code = mfaCode.trim();
    if (code.length !== 6) {
      setError('Enter your 6-digit OTP code.');
      return;
    }
    setLoading(true);
    try {
      if (!mfaChallengeToken) {
        setError('Missing MFA challenge token. Please sign in again.');
        return;
      }
      const data = await verifyMfaChallenge({ challenge_token: mfaChallengeToken, code });
      if (!data.access_token) {
        setError('MFA verification succeeded but no access token was returned.');
        return;
      }
      persistAccessToken(data.access_token);
      await redirectCustomerToCheckout(data.user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify OTP code.');
    } finally {
      setLoading(false);
    }
  }

  async function onVerifyMfaEnrollment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const code = mfaCode.trim();
    if (code.length !== 6) {
      setError('Enter your 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      const data = await verifyMfaCode({ code });
      if (data.access_token) {
        persistAccessToken(data.access_token);
      }
      await redirectCustomerToCheckout(data.user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete MFA setup.');
    } finally {
      setLoading(false);
    }
  }

  const backgroundStyle = {
    backgroundImage: `linear-gradient(rgba(5, 11, 26, 0.52), rgba(5, 11, 26, 0.6)), url(${authBackground.src})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  } as const;

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-8 text-[#ffffff]" style={backgroundStyle}>
      <div className="mx-auto w-full max-w-lg space-y-8 rounded-2xl border border-[#2f4d82] bg-[#07112a]/85 p-8 backdrop-blur md:p-10">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[#9dc5ff]">Account</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Sign in</h1>
          <p className="mt-2 text-sm text-[#97a5bb]">Use your registered account credentials.</p>
          {result && step === 'credentials' ? (
            <p className="mt-2 text-sm text-emerald-300">
              Signed in as {result.user.email}. Redirecting to your workspace...
            </p>
          ) : null}
          {step === 'customer-mfa-verify' ? (
            <p className="mt-2 text-sm text-amber-300">
              MFA is enabled. Enter your OTP to complete sign in.
            </p>
          ) : null}
          {step === 'customer-mfa-setup' ? (
            <p className="mt-2 text-sm text-amber-300">Set up MFA in your authenticator app, then verify your OTP code.</p>
          ) : null}
        </div>

        {step === 'credentials' ? (
          <form className="space-y-5" onSubmit={onSubmit}>
            <label className="block space-y-2 text-sm">
              <span className="text-[#d8e2f2]">Email</span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[#345793] bg-[#0d1d3a] px-3 py-2 text-[#f0f5ff] outline-none ring-[#1f7bff]/45 focus:ring-2"
              />
            </label>
            <label className="block space-y-2 text-sm">
              <span className="text-[#d8e2f2]">Password</span>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-[#345793] bg-[#0d1d3a] px-3 py-2 pr-10 text-[#f0f5ff] outline-none ring-[#1f7bff]/45 focus:ring-2"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 inline-flex items-center px-3 text-[#9dc5ff] hover:text-[#c6dcff]"
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                      <path
                        d="M3 3 21 21M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.3A10 10 0 0 1 12 5c5.5 0 9.5 4.6 10 7-.2 1-1 2.5-2.3 3.9M6.6 6.6C4.3 8.2 2.4 10.4 2 12c.5 2.4 4.5 7 10 7 1.6 0 3-.4 4.2-1"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                      <path
                        d="M2 12c.5-2.4 4.5-7 10-7s9.5 4.6 10 7c-.5 2.4-4.5 7-10 7s-9.5-4.6-10-7Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                  )}
                </button>
              </div>
            </label>

            {error ? (
              <p role="alert" aria-live="polite" className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg border border-[#1f7bff] bg-[#1f7bff] py-2.5 text-sm font-medium text-white hover:bg-[#2e87ff] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        ) : null}

        {step === 'customer-mfa-verify' ? (
          <form className="space-y-5" onSubmit={onVerifyMfaChallenge}>
            <label className="block space-y-2 text-sm">
              <span className="text-[#d8e2f2]">OTP code</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                title="Enter a 6-digit OTP code"
                maxLength={6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full rounded-lg border border-[#345793] bg-[#0d1d3a] px-3 py-2 text-[#f0f5ff] outline-none ring-[#1f7bff]/45 focus:ring-2"
              />
            </label>
            {error ? (
              <p role="alert" aria-live="polite" className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg border border-[#1f7bff] bg-[#1f7bff] py-2.5 text-sm font-medium text-white hover:bg-[#2e87ff] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Verifying OTP…' : 'Verify OTP'}
            </button>
          </form>
        ) : null}

        {step === 'customer-mfa-setup' ? (
          <form className="space-y-5" onSubmit={onVerifyMfaEnrollment}>
            <div className="space-y-2 rounded-lg border border-[#345793] bg-[#0d1d3a] px-3 py-3 text-sm text-[#d8e2f2]">
              <p>Scan this setup in your authenticator app:</p>
              {setupLoading ? <p className="text-[#9dc5ff]">Loading MFA setup details...</p> : null}
              {mfaQrSvg ? (
                mfaQrSvg.startsWith('data:image/') ? (
                  <div className="mt-2 rounded bg-white p-3">
                    <img
                      src={mfaQrSvg}
                      alt="MFA QR code"
                      className="mx-auto h-auto max-w-full"
                    />
                  </div>
                ) : (
                  <div
                    className="mt-2 rounded bg-white p-3"
                    // Backend may return inline SVG markup for enrollment QR rendering.
                    dangerouslySetInnerHTML={{ __html: mfaQrSvg }}
                  />
                )
              ) : null}
            </div>
            <label className="block space-y-2 text-sm">
              <span className="text-[#d8e2f2]">Enter OTP code to enable MFA</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                title="Enter a 6-digit OTP code"
                maxLength={6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full rounded-lg border border-[#345793] bg-[#0d1d3a] px-3 py-2 text-[#f0f5ff] outline-none ring-[#1f7bff]/45 focus:ring-2"
              />
            </label>
            {error ? (
              <p role="alert" aria-live="polite" className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                {error}
              </p>
            ) : null}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => void loadMfaSetup()}
                disabled={setupLoading}
                className="w-full rounded-lg border border-[#345793] bg-[#0d1d3a] py-2.5 text-sm font-medium text-[#d8e2f2] hover:bg-[#1f3158] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {setupLoading ? 'Refreshing…' : 'Refresh setup code'}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg border border-[#1f7bff] bg-[#1f7bff] py-2.5 text-sm font-medium text-white hover:bg-[#2e87ff] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Completing setup…' : 'Complete MFA setup'}
              </button>
            </div>
          </form>
        ) : null}

        <p className="text-center text-sm text-[#97a5bb]">
          New here?{' '}
          <Link href="/register" className="text-[#9dc5ff] hover:text-[#c6dcff]">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
