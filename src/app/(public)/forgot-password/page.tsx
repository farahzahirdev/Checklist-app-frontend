'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { forgotPassword } from '@/lib/auth';
import { translate, useLocale } from '@/lib/i18n';
import { authPagesMessages } from '@/locales/auth-pages';
import authBackground from '@/assets/cybersecurity-background.jpg';

export default function ForgotPasswordPage() {
  const { locale } = useLocale();
  const t = (key: string) => translate(authPagesMessages, locale, key);

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      await forgotPassword({ email: email.trim().toLowerCase() });
      toast.success(t('forgot.success'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.signInFailed'));
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
          <h1 className="mt-2 text-3xl font-semibold text-white">{t('forgot.title')}</h1>
          <p className="mt-2 text-sm text-[#97a5bb]">{t('forgot.subtitle')}</p>
        </div>

        <form className="space-y-5" onSubmit={onSubmit}>
          <label className="block space-y-2 text-sm">
            <span className="text-[#d8e2f2]">{t('fields.email')}</span>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg border border-[#1f7bff] bg-[#1f7bff] py-2.5 text-sm font-medium text-white hover:bg-[#2e87ff] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? t('forgot.submitting') : t('forgot.submit')}
          </button>
        </form>

        <p className="text-center text-sm text-[#97a5bb]">
          <Link href={'/login' as Route} className="text-[#9dc5ff] hover:text-[#c6dcff]">
            {t('forgot.backToLogin')}
          </Link>
        </p>
      </div>
    </main>
  );
}
