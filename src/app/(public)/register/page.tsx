'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { getRoleHomePath, getRoleKey, persistAccessToken, registerAccount, startMfaSetup, verifyMfaCode } from '@/lib/auth';
import authBackground from '@/assets/cybersecurity-background.jpg';

function getPasswordPolicyError(password: string): string | null {
  if (password.length < 12) return 'Password must be at least 12 characters.';
  if (!/[a-z]/.test(password)) return 'Password must include at least one lowercase letter (a-z).';
  if (!/[A-Z]/.test(password)) return 'Password must include at least one uppercase letter (A-Z).';
  if (!/\d/.test(password)) return 'Password must include at least one number (0-9).';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must include at least one special character.';
  return null;
}

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaQrSvg, setMfaQrSvg] = useState('');
  const [step, setStep] = useState<'credentials' | 'customer-mfa-verify' | 'customer-mfa-setup'>('credentials');
  const [loading, setLoading] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedPassword = password.trim();
      if (!normalizedPassword) {
        toast.error('Password cannot be empty or spaces only.');
        return;
      }
      if (/\s/.test(password)) {
        toast.error('Password cannot contain spaces.');
        return;
      }
      const passwordPolicyError = getPasswordPolicyError(normalizedPassword);
      if (passwordPolicyError) {
        toast.error(passwordPolicyError);
        return;
      }
      const data = await registerAccount({ email: normalizedEmail, password: normalizedPassword });
      const role = getRoleKey(data.user.role);
      const destination = role === 'customer' ? '/payment' : getRoleHomePath(data.user.role);

      if (role === 'admin' || role === 'auditor') {
        if (!data.access_token) {
          toast.error('Registration did not return an access token.');
          return;
        }
        persistAccessToken(data.access_token);
        toast.success('Account created successfully.');
        router.push(destination as Route);
        router.refresh();
        return;
      }

      if (!data.access_token) {
        toast.error('Registration did not return an access token.');
        return;
      }
      persistAccessToken(data.access_token);
      toast.success('Account created successfully.');
      router.push(destination as Route);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  async function loadMfaSetup() {
    setSetupLoading(true);
    try {
      const setup = await startMfaSetup();
      setMfaQrSvg(setup.svg_qr ?? '');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load MFA setup details.');
    } finally {
      setSetupLoading(false);
    }
  }

  async function onVerifyMfaCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = mfaCode.trim();
    if (code.length !== 6) {
      toast.error('Enter your 6-digit OTP code.');
      return;
    }
    setLoading(true);
    try {
      const data = await verifyMfaCode({ code });
      if (!data.access_token) {
        toast.error('MFA verification succeeded but no access token was returned.');
        return;
      }
      persistAccessToken(data.access_token);
      toast.success('MFA verified successfully.');
      const role = getRoleKey(data.user.role);
      const destination = role === 'customer' ? '/payment' : getRoleHomePath(data.user.role);
      if (role === 'customer') {
        router.push(destination as Route);
        router.refresh();
      } else {
        router.push(destination as Route);
        router.refresh();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to verify OTP code.');
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
          <h1 className="mt-2 text-3xl font-semibold text-white">Create an account</h1>
          <p className="mt-2 text-sm text-[#97a5bb]">Use a strong password with at least 12 characters and mixed character types.</p>
          {step === 'customer-mfa-verify' ? (
            <p className="mt-2 text-sm text-amber-300">MFA is enabled. Enter your OTP to complete account setup.</p>
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
                  autoComplete="new-password"
                  required
                  minLength={12}
                  value={password}
                  onChange={(e) => setPassword(e.target.value.replace(/\s/g, ''))}
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
              <ul className="ml-4 list-disc space-y-1 text-xs text-[#97a5bb]">
                <li>At least 12 characters</li>
                <li>At least one uppercase letter (A-Z)</li>
                <li>At least one lowercase letter (a-z)</li>
                <li>At least one number (0-9)</li>
                <li>At least one special character</li>
                <li>No spaces</li>
              </ul>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg border border-[#1f7bff] bg-[#1f7bff] py-2.5 text-sm font-medium text-white hover:bg-[#2e87ff] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Creating account…' : 'Register'}
            </button>
          </form>
        ) : null}

        {step === 'customer-mfa-verify' ? (
          <form className="space-y-5" onSubmit={onVerifyMfaCode}>
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
          <form className="space-y-5" onSubmit={onVerifyMfaCode}>
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

        {step === 'credentials' ? (
          <p className="text-center text-sm text-[#97a5bb]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#9dc5ff] hover:text-[#c6dcff]">
              Sign in
            </Link>
          </p>
        ) : (
          <p className="text-center text-sm text-[#97a5bb]">Complete MFA to finish account setup.</p>
        )}
      </div>
    </main>
  );
}
