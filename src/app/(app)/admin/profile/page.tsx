'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { notifyAuthStateChanged } from '@/lib/auth';
import {
  changeAdminPassword,
  getAdminProfile,
  updateAdminProfile,
  type AdminProfile,
} from '@/lib/admin-profile';
import { translate, useLocale } from '@/lib/i18n';
import { adminProfileMessages } from '@/locales/admin-profile';

function getPasswordPolicyError(password: string): string | null {
  if (password.length < 12) return 'errors.passwordMin';
  if (!/[a-z]/.test(password)) return 'errors.passwordLower';
  if (!/[A-Z]/.test(password)) return 'errors.passwordUpper';
  if (!/\d/.test(password)) return 'errors.passwordNumber';
  if (!/[^A-Za-z0-9]/.test(password)) return 'errors.passwordSpecial';
  return null;
}

function normalizeOptional(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function PasswordToggleButton({
  visible,
  onToggle,
  showLabel,
  hideLabel,
}: {
  visible: boolean;
  onToggle: () => void;
  showLabel: string;
  hideLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={visible ? hideLabel : showLabel}
      className="absolute inset-y-0 right-0 inline-flex items-center px-3 text-[#5e7aa6] hover:text-[#2d4f83]"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path
          d={
            visible
              ? 'M3 3 21 21M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.3A10 10 0 0 1 12 5c5.5 0 9.5 4.6 10 7-.2 1-1 2.5-2.3 3.9M6.6 6.6C4.3 8.2 2.4 10.4 2 12c.5 2.4 4.5 7 10 7 1.6 0 3-.4 4.2-1'
              : 'M2 12c.5-2.4 4.5-7 10-7s9.5 4.6 10 7c-.5 2.4-4.5 7-10 7s-9.5-4.6-10-7Z'
          }
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {visible ? null : <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />}
      </svg>
    </button>
  );
}

export default function AdminProfilePage() {
  const { locale, setLocale } = useLocale();
  const t = (key: string) => translate(adminProfileMessages, locale, key);

  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<'en' | 'cs'>('en');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function loadProfile() {
    setLoading(true);
    setError('');
    try {
      const data = await getAdminProfile();
      setProfile(data);
      setEmail(data.email ?? '');
      setFullName(data.full_name ?? '');
      setPreferredLanguage(data.preferred_language ?? 'en');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.loadProfile'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSaveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await updateAdminProfile({
        email: normalizeOptional(email),
        full_name: normalizeOptional(fullName),
        preferred_language: preferredLanguage,
      });
      setProfile(updated);
      setEmail(updated.email ?? '');
      setFullName(updated.full_name ?? '');
      setPreferredLanguage(updated.preferred_language ?? 'en');
      setLocale(updated.preferred_language ?? 'en');
      notifyAuthStateChanged({ full_name: updated.full_name });
      toast.success(t('toasts.profileUpdated'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.updateProfile'));
    } finally {
      setSavingProfile(false);
    }
  }

  async function onChangePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const current = currentPassword.trim();
    const next = newPassword.trim();
    const confirm = confirmPassword.trim();

    if (!current || !next || !confirm) {
      toast.error(t('errors.passwordAllRequired'));
      return;
    }
    if (/\s/.test(next) || /\s/.test(confirm)) {
      toast.error(t('errors.passwordNoSpaces'));
      return;
    }
    if (next !== confirm) {
      toast.error(t('errors.passwordMismatch'));
      return;
    }
    const passwordPolicyError = getPasswordPolicyError(next);
    if (passwordPolicyError) {
      toast.error(t(passwordPolicyError));
      return;
    }

    setChangingPassword(true);
    try {
      await changeAdminPassword({
        current_password: current,
        new_password: next,
        confirm_password: confirm,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success(t('toasts.passwordChanged'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.changePassword'));
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-[#1f3f73] bg-[linear-gradient(120deg,#071733,#0c2144_45%,#13356d)] px-5 py-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#9dc5ff]">{t('hero.kicker')}</p>
            <h1 className="text-2xl font-semibold text-white">{t('hero.title')}</h1>
            <p className="mt-1 text-sm text-[#b9cdef]">{t('hero.subtitle')}</p>
          </div>
          <button
            type="button"
            onClick={() => void loadProfile()}
            disabled={loading}
            className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm text-[#dce8ff] hover:bg-[#223657] disabled:opacity-60"
          >
            {loading ? t('actions.refreshing') : t('actions.refresh')}
          </button>
        </div>
      </header>

      {error ? (
        <p className="rounded-lg border border-[#f0c7cf] bg-[#fff2f4] px-3 py-2 text-sm text-[#b63d51]">{error}</p>
      ) : null}

      <div className="grid gap-4">
        <article className="rounded-2xl border border-[#dbe4f4] bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1f2d45]">{t('section.profileDetails')}</h2>
          <p className="mt-1 text-sm text-[#607594]">{t('section.profileDetailsSubtitle')}</p>

          <form className="mt-4 space-y-3" onSubmit={onSaveProfile}>
            <label className="block space-y-1.5 text-sm">
              <span className="text-[#4f6281]">{t('fields.email')}</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring"
                autoComplete="email"
              />
            </label>

            <label className="block space-y-1.5 text-sm">
              <span className="text-[#4f6281]">{t('fields.fullName')}</span>
              <input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring"
              />
            </label>

            <label className="block space-y-1.5 text-sm">
              <span className="text-[#4f6281]">{t('fields.preferredLanguage')}</span>
              <select
                value={preferredLanguage}
                onChange={(event) => setPreferredLanguage(event.target.value as 'en' | 'cs')}
                className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring"
              >
                <option value="en">{t('language.en')}</option>
                <option value="cs">{t('language.cs')}</option>
              </select>
            </label>

            <div className="rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm text-[#506282]">
              <span className="font-medium text-[#4f6281]">{t('fields.status')}: </span>
              {profile?.is_active ? t('status.active') : t('status.inactive')}
            </div>

            <button
              type="submit"
              disabled={savingProfile || loading}
              className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm font-semibold text-white hover:bg-[#223657] disabled:opacity-60"
            >
              {savingProfile ? t('actions.saving') : t('actions.saveProfile')}
            </button>
          </form>
        </article>

        <article className="rounded-2xl border border-[#dbe4f4] bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1f2d45]">{t('section.changePassword')}</h2>
          <p className="mt-1 text-sm text-[#607594]">{t('section.changePasswordSubtitle')}</p>

          <form className="mt-4 grid gap-3 md:grid-cols-3" onSubmit={onChangePassword}>
            <label className="block space-y-1.5 text-sm">
              <span className="text-[#4f6281]">
                {t('fields.currentPassword')} <span className="text-[#c43e53]">*</span>
              </span>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 pr-10 text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring"
                  autoComplete="current-password"
                  required
                />
                <PasswordToggleButton
                  visible={showCurrentPassword}
                  onToggle={() => setShowCurrentPassword((v) => !v)}
                  showLabel={t('actions.showCurrentPassword')}
                  hideLabel={t('actions.hideCurrentPassword')}
                />
              </div>
            </label>

            <label className="block space-y-1.5 text-sm">
              <span className="text-[#4f6281]">
                {t('fields.newPassword')} <span className="text-[#c43e53]">*</span>
              </span>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 pr-10 text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring"
                  autoComplete="new-password"
                  required
                />
                <PasswordToggleButton
                  visible={showNewPassword}
                  onToggle={() => setShowNewPassword((v) => !v)}
                  showLabel={t('actions.showNewPassword')}
                  hideLabel={t('actions.hideNewPassword')}
                />
              </div>
            </label>

            <label className="block space-y-1.5 text-sm">
              <span className="text-[#4f6281]">
                {t('fields.confirmPassword')} <span className="text-[#c43e53]">*</span>
              </span>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 pr-10 text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring"
                  autoComplete="new-password"
                  required
                />
                <PasswordToggleButton
                  visible={showConfirmPassword}
                  onToggle={() => setShowConfirmPassword((v) => !v)}
                  showLabel={t('actions.showConfirmPassword')}
                  hideLabel={t('actions.hideConfirmPassword')}
                />
              </div>
            </label>

            <div className="flex flex-wrap items-center gap-3 md:col-span-3">
              <button
                type="submit"
                disabled={changingPassword}
                className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm font-semibold text-white hover:bg-[#223657] disabled:opacity-60"
              >
                {changingPassword ? t('actions.changing') : t('actions.changePassword')}
              </button>
              <span className="text-xs text-[#6c83a8]">{t('password.hint')}</span>
            </div>
          </form>
        </article>
      </div>
    </section>
  );
}
