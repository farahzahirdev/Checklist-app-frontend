'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import type { AuthResponse } from '@/lib/auth';
import { persistAccessToken, registerAccount } from '@/lib/auth';
import authBackground from '@/assets/cybersecurity-background.jpg';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuthResponse | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const data = await registerAccount({ email: normalizedEmail, password });
      setResult(data);
      if (data.access_token) {
        persistAccessToken(data.access_token);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
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

  if (result) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-8 text-[#ffffff]" style={backgroundStyle}>
        <div className="mx-auto w-full max-w-lg space-y-6 rounded-2xl border border-[#2f4d82] bg-[#07112a]/85 p-8 backdrop-blur md:p-10">
          <h1 className="text-2xl font-semibold text-white">Account created</h1>
          <p className="text-[#d8e2f2]">
            Signed in as <span className="text-[#9dc5ff]">{result.user.email}</span> ({result.user.role}).
          </p>
          <dl className="grid gap-2 text-sm text-[#97a5bb]">
            <div className="flex justify-between gap-4">
              <dt>MFA required</dt>
              <dd className="text-[#e7efff]">{result.mfa_required ? 'Yes' : 'No'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>MFA enabled</dt>
              <dd className="text-[#e7efff]">{result.mfa_enabled ? 'Yes' : 'No'}</dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/dashboard"
              className="rounded-lg border border-[#1f7bff] bg-[#1f7bff]/25 px-4 py-2 text-sm text-[#f5f8ff] hover:bg-[#1f7bff]/35"
            >
              Go to dashboard
            </Link>
            <Link href="/" className="rounded-lg border border-[#345793] px-4 py-2 text-sm hover:bg-[#1f7bff]/20">
              Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-8 text-[#ffffff]" style={backgroundStyle}>
      <div className="mx-auto w-full max-w-lg space-y-8 rounded-2xl border border-[#2f4d82] bg-[#07112a]/85 p-8 backdrop-blur md:p-10">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[#9dc5ff]">Account</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Create an account</h1>
          <p className="mt-2 text-sm text-[#97a5bb]">Password must be at least 12 characters.</p>
        </div>

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
            <input
              type="password"
              name="password"
              autoComplete="new-password"
              required
              minLength={12}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {loading ? 'Creating account…' : 'Register'}
          </button>
        </form>

        <p className="text-center text-sm text-[#97a5bb]">
          Already have an account?{' '}
          <Link href="/login" className="text-[#9dc5ff] hover:text-[#c6dcff]">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
