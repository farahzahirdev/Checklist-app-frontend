'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { translate, useLocale } from '@/lib/i18n';
import { changeCustomerPassword, getCustomerProfile, updateCustomerProfile, type CustomerProfile } from '@/lib/customer-profile';
import {
  listMyCompanies,
  updateCustomerCompany,
  type CustomerCompany,
  type UpdateCustomerCompanyPayload,
} from '@/lib/customer-companies';
import { customerProfileMessages } from '@/locales/customer-profile';

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

export default function CustomerProfilePage() {
  const { locale, setLocale } = useLocale();
  const t = (key: string) => translate(customerProfileMessages, locale, key);

  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [company, setCompany] = useState<CustomerCompany | null>(null);

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingCompany, setSavingCompany] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [editingCompany, setEditingCompany] = useState(false);
  const [error, setError] = useState('');

  // User fields
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<'en' | 'cs'>('en');

  // Company fields
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('');
  const [companyCountry, setCompanyCountry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const companyMeta = useMemo(() => {
    if (!company) return null;
    return {
      slug: company.slug,
      region: company.region ?? '',
      size: company.size ?? '',
      description: company.description ?? '',
      industry: company.industry ?? '',
      country: company.country ?? '',
      website: company.website ?? '',
      email: company.email ?? '',
    };
  }, [company]);

  async function loadProfile() {
    setLoading(true);
    setError('');

    try {
      const [profileData, companyList] = await Promise.all([getCustomerProfile(), listMyCompanies()]);

      setProfile(profileData);
      setFullName(profileData.full_name ?? '');
      setUsername(profileData.username ?? '');
      setJobTitle(profileData.job_title ?? '');
      setDepartment(profileData.department ?? '');
      setPreferredLanguage(profileData.preferred_language ?? 'en');

      const firstCompany = companyList.companies?.[0] ?? null;
      setCompany(firstCompany);
      setEditingCompany(false);

      if (firstCompany) {
        setCompanyName(firstCompany.name ?? '');
        setCompanyEmail(firstCompany.email ?? '');
        setCompanyWebsite(firstCompany.website ?? '');
        setCompanyIndustry(firstCompany.industry ?? '');
        setCompanyCountry(firstCompany.country ?? '');
        setCompanySize(firstCompany.size ?? '');
        setCompanyDescription(firstCompany.description ?? '');
      } else {
        // Fallback to any legacy fields present in the profile response.
        setCompanyName(profileData.company_name ?? '');
        setCompanyEmail(profileData.company_email ?? '');
        setCompanyWebsite(profileData.company_website ?? '');
        setCompanyIndustry(profileData.company_industry ?? '');
        setCompanyCountry(profileData.company_country ?? '');
        setCompanySize(profileData.company_size ?? '');
        setCompanyDescription(profileData.company_description ?? '');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.loadProfile'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProfile();
    // (Locale changes should not re-fetch; we only re-render labels.)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSaveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await updateCustomerProfile({
        full_name: normalizeOptional(fullName),
        username: normalizeOptional(username),
        job_title: normalizeOptional(jobTitle),
        department: normalizeOptional(department),
        preferred_language: preferredLanguage,
      });

      setProfile(updated);
      setFullName(updated.full_name ?? '');
      setUsername(updated.username ?? '');
      setJobTitle(updated.job_title ?? '');
      setDepartment(updated.department ?? '');
      setPreferredLanguage(updated.preferred_language ?? 'en');
      setLocale(updated.preferred_language ?? 'en');
      toast.success(t('toasts.profileUpdated'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.updateProfile'));
    } finally {
      setSavingProfile(false);
    }
  }

  async function onSaveCompany(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!company) return;

    setSavingCompany(true);
    try {
      const payload: UpdateCustomerCompanyPayload = {
        name: companyName.trim() || undefined,
        email: companyEmail.trim() || undefined,
        website: companyWebsite.trim() || undefined,
        industry: companyIndustry.trim() || undefined,
        country: companyCountry.trim() || undefined,
        size: companySize.trim() || undefined,
        description: companyDescription.trim() || undefined,
      };

      const updated = await updateCustomerCompany(company.id, payload);
      setCompany(updated);
      setCompanyName(updated.name ?? '');
      setCompanyEmail(updated.email ?? '');
      setCompanyWebsite(updated.website ?? '');
      setCompanyIndustry(updated.industry ?? '');
      setCompanyCountry(updated.country ?? '');
      setCompanySize(updated.size ?? '');
      setCompanyDescription(updated.description ?? '');
      setEditingCompany(false);
      toast.success(t('toasts.companyUpdated'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.updateCompany'));
    } finally {
      setSavingCompany(false);
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
      await changeCustomerPassword({
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

      {error ? <p className="rounded-lg border border-[#f0c7cf] bg-[#fff2f4] px-3 py-2 text-sm text-[#b63d51]">{error}</p> : null}

      <div className="grid gap-4">
        <article className="rounded-2xl border border-[#dbe4f4] bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1f2d45]">{t('section.profileDetails')}</h2>
          <p className="mt-1 text-sm text-[#607594]">{t('section.profileDetailsSubtitle')}</p>

          <form className="mt-4 space-y-3" onSubmit={onSaveProfile}>
            <label className="block space-y-1.5 text-sm">
              <span className="text-[#4f6281]">{t('fields.email')}</span>
              <input
                type="email"
                value={profile?.email ?? ''}
                disabled
                className="w-full rounded-lg border border-[#d4dced] bg-[#eef2f8] px-3 py-2 text-[#506282]"
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
              <span className="text-[#4f6281]">{t('fields.username')}</span>
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-1.5 text-sm">
                <span className="text-[#4f6281]">{t('fields.jobTitle')}</span>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(event) => setJobTitle(event.target.value)}
                  className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring"
                />
              </label>
              <label className="block space-y-1.5 text-sm">
                <span className="text-[#4f6281]">{t('fields.department')}</span>
                <input
                  type="text"
                  value={department}
                  onChange={(event) => setDepartment(event.target.value)}
                  className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring"
                />
              </label>
            </div>

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

            <button
              type="submit"
              disabled={savingProfile}
              className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm font-semibold text-white hover:bg-[#223657] disabled:opacity-60"
            >
              {savingProfile ? t('actions.saving') : t('actions.saveProfile')}
            </button>
          </form>
        </article>

        <article className="rounded-2xl border border-[#dbe4f4] bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[#1f2d45]">{t('section.companyDetails')}</h2>
              <p className="mt-1 text-sm text-[#607594]">{t('section.companyDetailsSubtitle')}</p>
            </div>
            {company ? (
              <button
                type="button"
                onClick={() => setEditingCompany((v) => !v)}
                className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm font-semibold text-white hover:bg-[#223657]"
              >
                {editingCompany ? t('actions.cancel') : t('actions.editCompany')}
              </button>
            ) : null}
          </div>

          {!company ? (
            <p className="mt-4 rounded-lg border border-[#dbe4f4] bg-[#f7f9fe] px-3 py-2 text-sm text-[#607594]">
              {t('company.none')}
            </p>
          ) : !editingCompany ? (
            <div className="mt-4 space-y-3">
              <div className="rounded-lg border border-[#d4dced] bg-[#f7f9fe] p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold text-[#4f6281]">{t('company.labels.name')}</p>
                    <p className="mt-1 text-sm font-medium text-[#243555]">{company.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#4f6281]">{t('company.labels.slug')}</p>
                    <p className="mt-1 text-sm font-medium text-[#243555]">{company.slug}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#4f6281]">{t('company.labels.email')}</p>
                    <p className="mt-1 text-sm font-medium text-[#243555]">{company.email ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#4f6281]">{t('company.labels.website')}</p>
                    <p className="mt-1 text-sm font-medium text-[#243555]">{company.website ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#4f6281]">{t('company.labels.industry')}</p>
                    <p className="mt-1 text-sm font-medium text-[#243555]">{company.industry ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#4f6281]">{t('company.labels.country')}</p>
                    <p className="mt-1 text-sm font-medium text-[#243555]">{company.country ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#4f6281]">{t('company.labels.size')}</p>
                    <p className="mt-1 text-sm font-medium text-[#243555]">{company.size ?? '—'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs font-semibold text-[#4f6281]">{t('company.labels.description')}</p>
                    <p className="mt-1 text-sm font-medium text-[#243555]">{company.description ?? '—'}</p>
                  </div>
                </div>
              </div>
              {companyMeta?.region ? (
                <p className="text-xs text-[#6c83a8]">
                  {t('company.meta')}
                  {` • ${companyMeta.region}`}
                </p>
              ) : null}
            </div>
          ) : (
            <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={onSaveCompany}>
              <label className="block space-y-1.5 text-sm sm:col-span-2">
                <span className="text-[#4f6281]">{t('fields.companyName')}</span>
                <input
                  type="text"
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring"
                />
              </label>

              <label className="block space-y-1.5 text-sm">
                <span className="text-[#4f6281]">{t('fields.companyEmail')}</span>
                <input
                  type="email"
                  value={companyEmail}
                  onChange={(event) => setCompanyEmail(event.target.value)}
                  className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring"
                />
              </label>

              <label className="block space-y-1.5 text-sm">
                <span className="text-[#4f6281]">{t('fields.companyWebsite')}</span>
                <input
                  type="url"
                  value={companyWebsite}
                  onChange={(event) => setCompanyWebsite(event.target.value)}
                  className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring"
                />
              </label>

              <label className="block space-y-1.5 text-sm">
                <span className="text-[#4f6281]">{t('fields.companyIndustry')}</span>
                <input
                  type="text"
                  value={companyIndustry}
                  onChange={(event) => setCompanyIndustry(event.target.value)}
                  className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring"
                />
              </label>

              <label className="block space-y-1.5 text-sm">
                <span className="text-[#4f6281]">{t('fields.companyCountry')}</span>
                <input
                  type="text"
                  value={companyCountry}
                  onChange={(event) => setCompanyCountry(event.target.value)}
                  className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring"
                />
              </label>

              <label className="block space-y-1.5 text-sm">
                <span className="text-[#4f6281]">{t('fields.companySize')}</span>
                <input
                  type="text"
                  value={companySize}
                  onChange={(event) => setCompanySize(event.target.value)}
                  className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring"
                />
              </label>

              <label className="block space-y-1.5 text-sm sm:col-span-2">
                <span className="text-[#4f6281]">{t('fields.companyDescription')}</span>
                <textarea
                  value={companyDescription}
                  onChange={(event) => setCompanyDescription(event.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring"
                />
              </label>

              <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={savingCompany}
                  className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm font-semibold text-white hover:bg-[#223657] disabled:opacity-60"
                >
                  {savingCompany ? t('actions.saving') : t('actions.saveCompany')}
                </button>
                <span className="text-xs text-[#6c83a8]">{t('company.editHint')}</span>
              </div>
            </form>
          )}
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
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((previous) => !previous)}
                  aria-label={showCurrentPassword ? t('actions.hideCurrentPassword') : t('actions.showCurrentPassword')}
                  className="absolute inset-y-0 right-0 inline-flex items-center px-3 text-[#5e7aa6] hover:text-[#2d4f83]"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                    <path
                      d={showCurrentPassword
                        ? 'M3 3 21 21M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.3A10 10 0 0 1 12 5c5.5 0 9.5 4.6 10 7-.2 1-1 2.5-2.3 3.9M6.6 6.6C4.3 8.2 2.4 10.4 2 12c.5 2.4 4.5 7 10 7 1.6 0 3-.4 4.2-1'
                        : 'M2 12c.5-2.4 4.5-7 10-7s9.5 4.6 10 7c-.5 2.4-4.5 7-10 7s-9.5-4.6-10-7Z'}
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {showCurrentPassword ? null : <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />}
                  </svg>
                </button>
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
                <button
                  type="button"
                  onClick={() => setShowNewPassword((previous) => !previous)}
                  aria-label={showNewPassword ? t('actions.hideNewPassword') : t('actions.showNewPassword')}
                  className="absolute inset-y-0 right-0 inline-flex items-center px-3 text-[#5e7aa6] hover:text-[#2d4f83]"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                    <path
                      d={showNewPassword
                        ? 'M3 3 21 21M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.3A10 10 0 0 1 12 5c5.5 0 9.5 4.6 10 7-.2 1-1 2.5-2.3 3.9M6.6 6.6C4.3 8.2 2.4 10.4 2 12c.5 2.4 4.5 7 10 7 1.6 0 3-.4 4.2-1'
                        : 'M2 12c.5-2.4 4.5-7 10-7s9.5 4.6 10 7c-.5 2.4-4.5 7-10 7s-9.5-4.6-10-7Z'}
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {showNewPassword ? null : <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />}
                  </svg>
                </button>
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
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((previous) => !previous)}
                  aria-label={showConfirmPassword ? t('actions.hideConfirmPassword') : t('actions.showConfirmPassword')}
                  className="absolute inset-y-0 right-0 inline-flex items-center px-3 text-[#5e7aa6] hover:text-[#2d4f83]"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                    <path
                      d={showConfirmPassword
                        ? 'M3 3 21 21M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.3A10 10 0 0 1 12 5c5.5 0 9.5 4.6 10 7-.2 1-1 2.5-2.3 3.9M6.6 6.6C4.3 8.2 2.4 10.4 2 12c.5 2.4 4.5 7 10 7 1.6 0 3-.4 4.2-1'
                        : 'M2 12c.5-2.4 4.5-7 10-7s9.5 4.6 10 7c-.5 2.4-4.5 7-10 7s-9.5-4.6-10-7Z'}
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {showConfirmPassword ? null : <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />}
                  </svg>
                </button>
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

