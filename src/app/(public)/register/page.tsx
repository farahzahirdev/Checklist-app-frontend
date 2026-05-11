'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { translate, useLocale } from '@/lib/i18n';
import { getRoleHomePath, getRoleKey, persistAccessToken, registerAccount, startMfaSetup, verifyMfaCode } from '@/lib/auth';
import authBackground from '@/assets/cybersecurity-background.jpg';
import { authPagesMessages } from '@/locales/auth-pages';
import { useCMSPage } from '@/hooks/useCMSPage';
import { PageRenderer } from '@/components/cms/PageRenderer';

function getPasswordPolicyError(password: string): string | null {
  if (password.length < 12) return 'errors.passwordMin';
  if (!/[a-z]/.test(password)) return 'errors.passwordLower';
  if (!/[A-Z]/.test(password)) return 'errors.passwordUpper';
  if (!/\d/.test(password)) return 'errors.passwordNumber';
  if (!/[^A-Za-z0-9]/.test(password)) return 'errors.passwordSpecial';
  return null;
}

function normalizeOptionalField(value: string) {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function RegisterPageContent() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = (key: string) => translate(authPagesMessages, locale, key);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [companyRegion, setCompanyRegion] = useState('');
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
        toast.error(t('errors.passwordEmpty'));
        return;
      }
      if (/\s/.test(password)) {
        toast.error(t('errors.passwordHasSpaces'));
        return;
      }
      if (/\s/.test(confirmPassword)) {
        toast.error(t('errors.confirmPasswordHasSpaces'));
        return;
      }
      if (normalizedPassword !== confirmPassword) {
        toast.error(t('errors.passwordMismatch'));
        return;
      }
      const passwordPolicyError = getPasswordPolicyError(normalizedPassword);
      if (passwordPolicyError) {
        toast.error(t(passwordPolicyError));
        return;
      }
      const data = await registerAccount({
        email: normalizedEmail,
        password: normalizedPassword,
        full_name: normalizeOptionalField(fullName),
        username: normalizeOptionalField(username),
        company_name: normalizeOptionalField(companyName),
        job_title: normalizeOptionalField(jobTitle),
        department: normalizeOptionalField(department),
        company_industry: normalizeOptionalField(companyIndustry),
        company_size: normalizeOptionalField(companySize),
        company_region: normalizeOptionalField(companyRegion),
      });
      const role = getRoleKey(data.user.role);
      const destination = role === 'customer' ? '/payment' : getRoleHomePath(data.user.role);

      if (role === 'admin' || role === 'auditor') {
        if (!data.access_token) {
          toast.error(t('errors.registrationNoToken'));
          return;
        }
        persistAccessToken(data.access_token);
        toast.success(t('success.accountCreated'));
        router.push(destination as Route);
        router.refresh();
        return;
      }

      if (!data.access_token) {
        toast.error(t('errors.registrationNoToken'));
        return;
      }
      persistAccessToken(data.access_token);
      toast.success(t('success.accountCreated'));
      router.push(destination as Route);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.registrationFailed'));
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

  async function onVerifyMfaCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = mfaCode.trim();
    if (code.length !== 6) {
      toast.error(t('errors.otpSixDigits'));
      return;
    }
    setLoading(true);
    try {
      const data = await verifyMfaCode({ code });
      if (!data.access_token) {
        toast.error(t('errors.mfaVerifyNoToken'));
        return;
      }
      persistAccessToken(data.access_token);
      toast.success(t('success.mfaVerified'));
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
      toast.error(err instanceof Error ? err.message : t('errors.mfaVerifyFailed'));
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
    <main
      className="flex min-h-screen items-center justify-center px-4 py-4 text-[#ffffff] lg:h-screen lg:overflow-x-hidden lg:overflow-y-auto"
      style={backgroundStyle}
    >
      <div className="mx-auto w-full max-w-2xl space-y-4 rounded-2xl border border-[#2f4d82] bg-[#07112a]/85 p-5 backdrop-blur md:p-7 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[#9dc5ff]">{t('common.account')}</p>
          <h1 className="mt-1 text-3xl font-semibold text-white">{t('register.title')}</h1>
          <p className="mt-1 text-sm text-[#97a5bb]">{t('register.subtitle')}</p>
          {step === 'customer-mfa-verify' ? (
            <p className="mt-2 text-sm text-amber-300">{t('login.mfa.enabledBanner')}</p>
          ) : null}
          {step === 'customer-mfa-setup' ? (
            <p className="mt-2 text-sm text-amber-300">{t('register.mfa.finish')}</p>
          ) : null}
        </div>

        {step === 'credentials' ? (
          <form className="space-y-3.5" onSubmit={onSubmit}>
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
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="block space-y-1 text-sm">
                <span className="text-[#d8e2f2]">{t('register.fields.fullName')}</span>
                <input
                  type="text"
                  name="full_name"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-[#345793] bg-[#0d1d3a] px-3 py-2 text-[#f0f5ff] outline-none ring-[#1f7bff]/45 focus:ring-2"
                />
              </label>
              <label className="block space-y-1 text-sm">
                <span className="text-[#d8e2f2]">{t('register.fields.username')}</span>
                <input
                  type="text"
                  name="username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-lg border border-[#345793] bg-[#0d1d3a] px-3 py-2 text-[#f0f5ff] outline-none ring-[#1f7bff]/45 focus:ring-2"
                />
              </label>
              <label className="block space-y-1 text-sm">
                <span className="text-[#d8e2f2]">{t('register.fields.companyName')}</span>
                <input
                  type="text"
                  name="company_name"
                  autoComplete="organization"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full rounded-lg border border-[#345793] bg-[#0d1d3a] px-3 py-2 text-[#f0f5ff] outline-none ring-[#1f7bff]/45 focus:ring-2"
                />
              </label>
              <label className="block space-y-1 text-sm">
                <span className="text-[#d8e2f2]">{t('register.fields.jobTitle')}</span>
                <input
                  type="text"
                  name="job_title"
                  autoComplete="organization-title"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full rounded-lg border border-[#345793] bg-[#0d1d3a] px-3 py-2 text-[#f0f5ff] outline-none ring-[#1f7bff]/45 focus:ring-2"
                />
              </label>
              <label className="block space-y-1 text-sm">
                <span className="text-[#d8e2f2]">{t('register.fields.department')}</span>
                <input
                  type="text"
                  name="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full rounded-lg border border-[#345793] bg-[#0d1d3a] px-3 py-2 text-[#f0f5ff] outline-none ring-[#1f7bff]/45 focus:ring-2"
                />
              </label>
              <label className="block space-y-1 text-sm">
                <span className="text-[#d8e2f2]">{t('register.fields.companyIndustry')}</span>
                <input
                  type="text"
                  name="company_industry"
                  value={companyIndustry}
                  onChange={(e) => setCompanyIndustry(e.target.value)}
                  className="w-full rounded-lg border border-[#345793] bg-[#0d1d3a] px-3 py-2 text-[#f0f5ff] outline-none ring-[#1f7bff]/45 focus:ring-2"
                />
              </label>
              <label className="block space-y-1 text-sm">
                <span className="text-[#d8e2f2]">{t('register.fields.companySize')}</span>
                <input
                  type="text"
                  name="company_size"
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  className="w-full rounded-lg border border-[#345793] bg-[#0d1d3a] px-3 py-2 text-[#f0f5ff] outline-none ring-[#1f7bff]/45 focus:ring-2"
                />
              </label>
              <label className="block space-y-1 text-sm">
                <span className="text-[#d8e2f2]">{t('register.fields.companyRegion')}</span>
                <input
                  type="text"
                  name="company_region"
                  value={companyRegion}
                  onChange={(e) => setCompanyRegion(e.target.value)}
                  className="w-full rounded-lg border border-[#345793] bg-[#0d1d3a] px-3 py-2 text-[#f0f5ff] outline-none ring-[#1f7bff]/45 focus:ring-2"
                />
              </label>
            </div>
            <label className="block space-y-1.5 text-sm">
              <span className="text-[#d8e2f2]">{t('fields.password')}</span>
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
              <p className="text-xs text-[#97a5bb]">
                {t('register.passwordPolicyHint')}
              </p>
            </label>
            <label className="block space-y-1.5 text-sm">
              <span className="text-[#d8e2f2]">{t('fields.confirmPassword')}</span>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirm_password"
                  autoComplete="new-password"
                  required
                  minLength={12}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value.replace(/\s/g, ''))}
                  className="w-full rounded-lg border border-[#345793] bg-[#0d1d3a] px-3 py-2 pr-10 text-[#f0f5ff] outline-none ring-[#1f7bff]/45 focus:ring-2"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? t('actions.hideConfirmPassword') : t('actions.showConfirmPassword')}
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
              {loading ? t('register.submitting') : t('register.submit')}
            </button>
          </form>
        ) : null}

        {step === 'customer-mfa-verify' ? (
          <form className="space-y-5" onSubmit={onVerifyMfaCode}>
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
          <form className="space-y-5" onSubmit={onVerifyMfaCode}>
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

        {step === 'credentials' ? (
          <p className="text-center text-sm text-[#97a5bb]">
            {t('register.haveAccount')}{' '}
            <Link href="/login" className="text-[#9dc5ff] hover:text-[#c6dcff]">
              {t('register.signIn')}
            </Link>
          </p>
        ) : (
          <p className="text-center text-sm text-[#97a5bb]">{t('register.mfa.finish')}</p>
        )}
      </div>
    </main>
  );
}

// CMS Integration Wrapper: Renders CMS page for "register" slug if available, otherwise shows hardcoded content
function RegisterPageWithCMS() {
  const { page, loading } = useCMSPage('register');
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f3f5fb]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#d6e2f7] border-t-[#2f7dff]" />
      </div>
    );
  }

  // PageRenderer handles both CMS page and fallback content
  return <PageRenderer page={page} fallback={<RegisterPageContent />} />;
}

export default RegisterPageWithCMS;
