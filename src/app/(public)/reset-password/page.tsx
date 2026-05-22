'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { resetPassword } from '@/lib/auth';
import { translate, useLocale } from '@/lib/i18n';
import { authPagesMessages } from '@/locales/auth-pages';
import authBackground from '@/assets/cybersecurity-background.jpg';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => (searchParams.get('token') || '').trim(), [searchParams]);
  const { locale } = useLocale();
  const t = (key: string) => translate(authPagesMessages, locale, key);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      toast.error(t('reset.tokenMissing'));
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ token, new_password: newPassword.trim(), confirm_password: confirmPassword.trim() });
      toast.success(t('reset.success'));
      router.push('/login' as Route);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.resetFailed'));
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
          <p className="text-xs uppercase tracking-[0.35em] text-[#9dc5ff]">{t('common.account')}</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">{t('reset.title')}</h1>
          <p className="mt-2 text-sm text-[#97a5bb]">{t('reset.subtitle')}</p>
        </div>

        {!token ? (
          <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            {t('reset.tokenMissing')}
          </p>
        ) : (
          <form className="space-y-5" onSubmit={onSubmit}>
            <label className="block space-y-2 text-sm">
              <span className="text-[#d8e2f2]">{t('fields.password')}</span>
              <input
                type="password"
                name="new_password"
                autoComplete="new-password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-[#345793] bg-[#0d1d3a] px-3 py-2 text-[#f0f5ff] outline-none ring-[#1f7bff]/45 focus:ring-2"
              />
            </label>
            <label className="block space-y-2 text-sm">
              <span className="text-[#d8e2f2]">{t('fields.confirmPassword')}</span>
              <input
                type="password"
                name="confirm_password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-[#345793] bg-[#0d1d3a] px-3 py-2 text-[#f0f5ff] outline-none ring-[#1f7bff]/45 focus:ring-2"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg border border-[#1f7bff] bg-[#1f7bff] py-2.5 text-sm font-medium text-white hover:bg-[#2e87ff] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? t('reset.submitting') : t('reset.submit')}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-[#97a5bb]">
          <Link href={'/login' as Route} className="text-[#9dc5ff] hover:text-[#c6dcff]">
            {t('forgot.backToLogin')}
          </Link>
        </p>
      </div>
    </main>
  );
}

function ResetPasswordFallback() {
  const backgroundStyle = {
    backgroundImage: `linear-gradient(rgba(5, 11, 26, 0.52), rgba(5, 11, 26, 0.6)), url(${authBackground.src})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  } as const;

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-8 text-[#ffffff]" style={backgroundStyle}>
      <div className="mx-auto w-full max-w-lg rounded-2xl border border-[#2f4d82] bg-[#07112a]/85 p-8 backdrop-blur md:p-10">
        <p className="text-sm text-[#97a5bb]">Loading...</p>
      </div>
    </main>
  );
}
