'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { confirmEmailVerification } from '@/lib/auth';
import { useLocale } from '@/lib/i18n';

function VerifyEmailPageContent() {
  const { locale } = useLocale();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = (searchParams.get('token') || '').trim();
    if (!token) {
      setStatus('error');
      setMessage(locale === 'cs' ? 'Chybí ověřovací token.' : 'Verification token is missing.');
      return;
    }

    let cancelled = false;
    async function run() {
      setStatus('loading');
      try {
        await confirmEmailVerification(token);
        if (cancelled) return;
        setStatus('success');
        setMessage(locale === 'cs' ? 'E-mail byl úspěšně ověřen.' : 'Email was verified successfully.');
      } catch (err) {
        if (cancelled) return;
        setStatus('error');
        setMessage(err instanceof Error ? err.message : locale === 'cs' ? 'Ověření e-mailu selhalo.' : 'Email verification failed.');
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [locale, searchParams]);

  const title = locale === 'cs' ? 'Ověření e-mailu' : 'Email verification';
  const loadingLabel = locale === 'cs' ? 'Ověřuji váš e-mail...' : 'Verifying your email...';
  const loginLabel = locale === 'cs' ? 'Pokračovat na přihlášení' : 'Continue to login';

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl items-center px-4 py-12">
      <section className="w-full rounded-2xl border border-[#d8e1f2] bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-[#0f172a]">{title}</h1>
        <p className="mt-4 text-sm text-[#475569]">
          {status === 'loading' || status === 'idle' ? loadingLabel : message}
        </p>
        {status !== 'loading' && status !== 'idle' ? (
          <div className="mt-6">
            <Link
              href={'/login' as Route}
              className="inline-flex items-center justify-center rounded-lg bg-[#1f7bff] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2e87ff]"
            >
              {loginLabel}
            </Link>
          </div>
        ) : null}
      </section>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<main className="mx-auto flex min-h-[70vh] max-w-xl items-center px-4 py-12" />}>
      <VerifyEmailPageContent />
    </Suspense>
  );
}
