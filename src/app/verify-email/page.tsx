'use client';

import type { Route } from 'next';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { confirmEmailVerification } from '@/lib/auth';
import { translate, useLocale } from '@/lib/i18n';
import { authPagesMessages } from '@/locales/auth-pages';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLocale();
  const t = (key: string) => translate(authPagesMessages, locale, key);

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage(t('verify_email.missing_token'));
      setTimeout(() => router.push('/login' as Route), 3000);
      return;
    }

    (async () => {
      try {
        await confirmEmailVerification(token);
        setStatus('success');
        setMessage(t('verify_email.success'));
        setTimeout(() => router.push('/app' as Route), 2000);
      } catch (err) {
        setStatus('error');
        const errorMsg = err instanceof Error ? err.message : String(err);
        setMessage(errorMsg || t('verify_email.error'));
        setTimeout(() => router.push('/login' as Route), 3000);
      }
    })();
  }, [searchParams, router, locale, t]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3f5fb] px-4">
      <div className="w-full max-w-md rounded-lg border border-[#d7deeb] bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-[#1f2d45] text-center mb-6">
          {t('verify_email.title')}
        </h1>

        {status === 'loading' && (
          <div className="text-center">
            <div className="mb-4">
              <div className="h-8 w-8 border-4 border-[#d7deeb] border-t-[#3f8bff] rounded-full animate-spin mx-auto" />
            </div>
            <p className="text-[#607594]">{t('verify_email.verifying')}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <p className="text-green-600 font-medium">{message}</p>
            <p className="text-sm text-[#607594] mt-2">{t('verify_email.redirecting')}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <p className="text-red-600 font-medium">{message}</p>
            <p className="text-sm text-[#607594] mt-2">{t('verify_email.redirect_login')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
