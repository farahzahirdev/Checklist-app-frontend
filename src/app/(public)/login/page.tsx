'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { translate, useLocale } from '@/lib/i18n';
import { useCMSPage } from '@/hooks/useCMSPage';
import { PageRenderer } from '@/components/cms/PageRenderer';
import {
  ACCESS_TOKEN_STORAGE_KEY,
  getRoleHomePath,
  getRoleKey,
  getCurrentUser,
  loginAccount,
  persistAccessToken,
  startMfaSetup,
  verifyMfaChallenge,
  verifyMfaCode,
} from '@/lib/auth';
import { getCurrentAssessment } from '@/lib/assessment';
import { getUserPaymentStatus } from '@/lib/payments';
import authBackground from '@/assets/cybersecurity-background.jpg';
import { authPagesMessages } from '@/locales/auth-pages';

function LoginPageContent() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = (key: string) => translate(authPagesMessages, locale, key);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaChallengeToken, setMfaChallengeToken] = useState('');
  const [mfaQrSvg, setMfaQrSvg] = useState('');
  const [step, setStep] = useState<'credentials' | 'customer-mfa-verify' | 'customer-mfa-setup'>('credentials');
  const [loading, setLoading] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function redirectIfAuthenticated() {
      const token = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
      if (!token) return;
      try {
        const me = await getCurrentUser();
        if (cancelled) return;
        router.replace(getRoleHomePath(me.user.role) as Route);
        router.refresh();
      } catch {
        // Keep user on login if token is stale/invalid.
      }
    }

    void redirectIfAuthenticated();

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function redirectCustomerAfterAuth(userId: string) {
    try {
      const paymentState = await getUserPaymentStatus(userId);
      if (paymentState.payment_status === 'succeeded') {
        if (paymentState.checklist) {
          try {
            const active = await getCurrentAssessment(paymentState.checklist.id);
            if (active.status !== 'not_started') {
              router.push('/dashboard');
            } else {
              router.push(`/access?checklist_id=${encodeURIComponent(paymentState.checklist.id)}`);
            }
          } catch {
            router.push(`/access?checklist_id=${encodeURIComponent(paymentState.checklist.id)}`);
          }
        } else {
          router.push('/payment/success');
        }
        router.refresh();
        return;
      }
    } catch {
      // Fallback to payment selection page.
    }
    router.push('/payment');
    router.refresh();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedPassword = password.trim();
      if (!normalizedPassword) {
        toast.error(t('errors.passwordEmpty'));
        return;
      }
      if (/\s/.test(password)) {
        toast.error(t('errors.passwordHasSpaces'));
        return;
      }
      const payload = {
        email: normalizedEmail,
        password: normalizedPassword,
      };

      const data = await loginAccount(payload);

      const role = getRoleKey(data.user.role);
      const destination = role === 'customer' ? '/payment' : getRoleHomePath(data.user.role);
      if (role === 'admin' || role === 'auditor') {
        if (!data.access_token) {
          toast.error(t('errors.signInNoToken'));
          return;
        }
        persistAccessToken(data.access_token);
        toast.success(t('success.signedIn'));
        router.push(destination as Route);
        router.refresh();
        return;
      }

      if (data.mfa_required && data.mfa_enabled) {
        if (!data.challenge_token) {
          toast.error(t('errors.mfaNeedChallenge'));
          return;
        }
        setMfaChallengeToken(data.challenge_token);
        setStep('customer-mfa-verify');
        toast.info(t('login.mfa.verifyToast'));
        return;
      }

      if (data.mfa_required && !data.mfa_enabled) {
        if (!data.access_token) {
          toast.error(t('errors.mfaNeedAccessToken'));
          return;
        }
        persistAccessToken(data.access_token);
        setStep('customer-mfa-setup');
        toast.info(t('login.mfa.setupToast'));
        await loadMfaSetup();
        return;
      }

      if (!data.access_token) {
        toast.error(t('errors.signInNoToken'));
        return;
      }
      persistAccessToken(data.access_token);
      toast.success(t('success.signedIn'));
      if (role === 'customer') {
        await redirectCustomerAfterAuth(data.user.id);
      } else {
        router.push(destination as Route);
        router.refresh();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.signInFailed'));
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
      toast.error(err instanceof Error ? err.message : t('errors.mfaSetupLoadFailed'));
    } finally {
      setSetupLoading(false);
    }
  }

  async function onVerifyMfaChallenge(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = mfaCode.trim();
    if (code.length !== 6) {
      toast.error(t('errors.otpSixDigits'));
      return;
    }
    setLoading(true);
    try {
      if (!mfaChallengeToken) {
        toast.error(t('errors.mfaMissingChallenge'));
        return;
      }
      const data = await verifyMfaChallenge({ challenge_token: mfaChallengeToken, code });
      if (!data.access_token) {
        toast.error(t('errors.mfaVerifyNoToken'));
        return;
      }
      persistAccessToken(data.access_token);
      toast.success(t('success.mfaVerified'));
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.mfaVerifyFailed'));
    } finally {
      setLoading(false);
    }
  }

  async function onVerifyMfaEnrollment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = mfaCode.trim();
    if (code.length !== 6) {
      toast.error(t('errors.otpSixDigits'));
      return;
    }

    setLoading(true);
    try {
      const data = await verifyMfaCode({ code });
      if (data.access_token) {
        persistAccessToken(data.access_token);
      }
      toast.success(t('success.mfaSetupCompleted'));
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.mfaSetupCompleteFailed'));
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
          <h1 className="mt-2 text-3xl font-semibold text-white">{t('login.title')}</h1>
          <p className="mt-2 text-sm text-[#97a5bb]">{t('login.subtitle')}</p>
          {step === 'customer-mfa-verify' ? (
            <p className="mt-2 text-sm text-amber-300">
              {t('login.mfa.enabledBanner')}
            </p>
          ) : null}
          {step === 'customer-mfa-setup' ? (
            <p className="mt-2 text-sm text-amber-300">{t('register.mfa.finish')}</p>
          ) : null}
        </div>

        {step === 'credentials' ? (
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
            <label className="block space-y-2 text-sm">
              <span className="text-[#d8e2f2]">{t('fields.password')}</span>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value.replace(/\s/g, ''))}
                  className="w-full rounded-lg border border-[#345793] bg-[#0d1d3a] px-3 py-2 pr-10 text-[#f0f5ff] outline-none ring-[#1f7bff]/45 focus:ring-2"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? t('actions.hidePassword') : t('actions.showPassword')}
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

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg border border-[#1f7bff] bg-[#1f7bff] py-2.5 text-sm font-medium text-white hover:bg-[#2e87ff] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? t('login.submitting') : t('login.submit')}
            </button>
          </form>
        ) : null}

        {step === 'customer-mfa-verify' ? (
          <form className="space-y-5" onSubmit={onVerifyMfaChallenge}>
            <label className="block space-y-2 text-sm">
              <span className="text-[#d8e2f2]">{t('fields.otp')}</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                title={t('fields.otpSixDigitsTitle')}
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
              {loading ? t('login.mfa.verifying') : t('login.mfa.verifyTitle')}
            </button>
          </form>
        ) : null}

        {step === 'customer-mfa-setup' ? (
          <form className="space-y-5" onSubmit={onVerifyMfaEnrollment}>
            <div className="space-y-2 rounded-lg border border-[#345793] bg-[#0d1d3a] px-3 py-3 text-sm text-[#d8e2f2]">
              <p>{t('login.mfa.setup.scan')}</p>
              {setupLoading ? <p className="text-[#9dc5ff]">{t('login.mfa.setup.loading')}</p> : null}
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
              <span className="text-[#d8e2f2]">{t('login.mfa.setup.enterToEnable')}</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                title={t('fields.otpSixDigitsTitle')}
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
                {setupLoading ? t('login.mfa.setup.refreshing') : t('login.mfa.setup.refresh')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg border border-[#1f7bff] bg-[#1f7bff] py-2.5 text-sm font-medium text-white hover:bg-[#2e87ff] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? t('login.mfa.setup.completing') : t('login.mfa.setup.complete')}
              </button>
            </div>
          </form>
        ) : null}

        <p className="text-center text-sm text-[#97a5bb]">
          {t('login.newHere')}{' '}
          <Link href="/register" className="text-[#9dc5ff] hover:text-[#c6dcff]">
            {t('login.createAccount')}
          </Link>
        </p>
      </div>
    </main>
  );
}

// CMS Integration Wrapper: Renders CMS page for "login" slug if available, otherwise shows hardcoded content
function LoginPageWithCMS() {
  const { page, loading } = useCMSPage('login');
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f3f5fb]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#d6e2f7] border-t-[#2f7dff]" />
      </div>
    );
  }

  // PageRenderer handles both CMS page and fallback content
  return <PageRenderer page={page} fallback={<LoginPageContent />} />;
}

export default LoginPageWithCMS;
