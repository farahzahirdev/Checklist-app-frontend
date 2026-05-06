'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { translate, useLocale } from '@/lib/i18n';
import {
  changeCustomerPassword,
  getCustomerProfile,
  updateCustomerProfile,
  type CustomerProfile,
} from '@/lib/customer-profile';
<<<<<<< Updated upstream
=======
import {
  listMyCompanies,
  updateCustomerCompany,
  type CustomerCompany,
  type UpdateCustomerCompanyPayload,
} from '@/lib/customer-companies';
import { customerProfileMessages } from '@/locales/customer-profile';
>>>>>>> Stashed changes

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
  const { locale } = useLocale();
  const t = (key: string) => translate(customerProfileMessages, locale, key);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState('');

  // User fields
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');

  // Company fields
  const [companyName, setCompanyName] = useState('');
  const [companySlug, setCompanySlug] = useState('');
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

  async function loadProfile() {
    setLoading(true);
    setError('');
    try {
      const data = await getCustomerProfile();
      setProfile(data);
      setFullName(data.full_name ?? '');
      setUsername(data.username ?? '');
      setJobTitle(data.job_title ?? '');
      setDepartment(data.department ?? '');
      setCompanyName(data.company_name ?? '');
      setCompanySlug(data.company_slug ?? '');
      setCompanyEmail(data.company_email ?? '');
      setCompanyWebsite(data.company_website ?? '');
      setCompanyIndustry(data.company_industry ?? '');
      setCompanyCountry(data.company_country ?? '');
      setCompanySize(data.company_size ?? '');
      setCompanyDescription(data.company_description ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.loadProfile'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProfile();
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
        company_name: normalizeOptional(companyName),
        company_slug: normalizeOptional(companySlug),
        company_email: normalizeOptional(companyEmail),
        company_website: normalizeOptional(companyWebsite),
        company_industry: normalizeOptional(companyIndustry),
        company_country: normalizeOptional(companyCountry),
        company_size: normalizeOptional(companySize),
        company_description: normalizeOptional(companyDescription),
      });
      setProfile(updated);
      setFullName(updated.full_name ?? '');
      setUsername(updated.username ?? '');
      setJobTitle(updated.job_title ?? '');
      setDepartment(updated.department ?? '');
<<<<<<< Updated upstream
      setCompanyName(updated.company_name ?? '');
      setCompanySlug(updated.company_slug ?? '');
      setCompanyEmail(updated.company_email ?? '');
      setCompanyWebsite(updated.company_website ?? '');
      setCompanyIndustry(updated.company_industry ?? '');
      setCompanyCountry(updated.company_country ?? '');
      setCompanySize(updated.company_size ?? '');
      setCompanyDescription(updated.company_description ?? '');
      toast.success('Profile and company details saved.');
=======
      toast.success(t('toasts.profileUpdated'));
>>>>>>> Stashed changes
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.updateProfile'));
    } finally {
      setSavingProfile(false);
    }
  }

<<<<<<< Updated upstream
=======
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
      };

      const updated = await updateCustomerCompany(company.id, payload);
      setCompany(updated);
      setCompanyName(updated.name ?? '');
      setCompanyEmail(updated.email ?? '');
      setCompanyWebsite(updated.website ?? '');
      setCompanyIndustry(updated.industry ?? '');
      setCompanyCountry(updated.country ?? '');
      setEditingCompany(false);
      toast.success(t('toasts.companyUpdated'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.updateCompany'));
    } finally {
      setSavingCompany(false);
    }
  }

>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Settings</h1>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
=======
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
            <button
              type="submit"
              disabled={savingProfile}
              className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm font-semibold text-white hover:bg-[#223657] disabled:opacity-60"
            >
              {savingProfile ? t('actions.saving') : t('actions.saveProfile')}
            </button>
          </form>
        </article>
      </div>

      <article className="rounded-2xl border border-[#dbe4f4] bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1f2d45]">{t('section.changePassword')}</h2>
        <p className="mt-1 text-sm text-[#607594]">{t('section.changePasswordSubtitle')}</p>
        <form className="mt-4 grid gap-3 md:grid-cols-3" onSubmit={onChangePassword}>
          <label className="block space-y-1.5 text-sm">
            <span className="text-[#4f6281]">{t('fields.currentPassword')} <span className="text-[#c43e53]">*</span></span>
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
                {showCurrentPassword ? (
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
          <label className="block space-y-1.5 text-sm">
            <span className="text-[#4f6281]">{t('fields.newPassword')} <span className="text-[#c43e53]">*</span></span>
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
                {showNewPassword ? (
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
          <label className="block space-y-1.5 text-sm">
            <span className="text-[#4f6281]">{t('fields.confirmPassword')} <span className="text-[#c43e53]">*</span></span>
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
                {showConfirmPassword ? (
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
          <div className="md:col-span-3 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={changingPassword}
              className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm font-semibold text-white hover:bg-[#223657] disabled:opacity-60"
            >
              {changingPassword ? t('actions.changing') : t('actions.changePassword')}
            </button>
            <span className="text-xs text-[#6c83a8]">
              {t('password.hint')}
            </span>
>>>>>>> Stashed changes
          </div>
        )}

<<<<<<< Updated upstream
        {/* Profile & Company Form */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile & Company Information</h2>
          <form onSubmit={onSaveProfile}>
            <div className="space-y-6">
              {/* User Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email (Read-only)
                    </label>
                    <input
                      type="email"
                      value={profile?.email ?? ''}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your job title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your department"
                    />
                  </div>
                </div>
              </div>

              {/* Company Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter company name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Slug
                    </label>
                    <input
                      type="text"
                      value={companySlug}
                      onChange={(e) => setCompanySlug(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      placeholder="Auto-generated from name if not provided"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Email
                    </label>
                    <input
                      type="email"
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      placeholder="company@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Website
                    </label>
                    <input
                      type="url"
                      value={companyWebsite}
                      onChange={(e) => setCompanyWebsite(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Industry
                    </label>
                    <input
                      type="text"
                      value={companyIndustry}
                      onChange={(e) => setCompanyIndustry(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Technology, Finance"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={companyCountry}
                      onChange={(e) => setCompanyCountry(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., United States"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Size
                    </label>
                    <input
                      type="text"
                      value={companySize}
                      onChange={(e) => setCompanySize(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 1-10, 11-50, 51-200"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Description
                    </label>
                    <textarea
                      value={companyDescription}
                      onChange={(e) => setCompanyDescription(e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      placeholder="Brief description of your company"
                    />
                  </div>
=======
      <article className="rounded-2xl border border-[#dbe4f4] bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1f2d45]">{t('section.companyDetails')}</h2>
        <p className="mt-1 text-sm text-[#607594]">{t('section.companyDetailsSubtitle')}</p>

        {!company ? (
          <p className="mt-4 rounded-lg border border-[#dbe4f4] bg-[#f7f9fe] px-3 py-2 text-sm text-[#607594]">
            {t('company.none')}
          </p>
        ) : !editingCompany ? (
          <div className="mt-4 space-y-3">
            <div className="rounded-lg border border-[#d4dced] bg-[#f7f9fe] p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-[#4f6281] font-semibold">Company Name</p>
                  <p className="mt-1 text-sm text-[#243555] font-medium">{company.name}</p>
>>>>>>> Stashed changes
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Password Change Form */}
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Change Password</h2>
          <form onSubmit={onChangePassword}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Must be 12+ characters with uppercase, lowercase, numbers, and special characters.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {changingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
