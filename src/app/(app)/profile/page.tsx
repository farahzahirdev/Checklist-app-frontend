'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import CompanySwitcher from '@/components/company/company-switcher';
import {
  changeCustomerPassword,
  getCustomerProfile,
  updateCustomerProfile,
  type CustomerProfile,
} from '@/lib/customer-profile';

function getPasswordPolicyError(password: string): string | null {
  if (password.length < 12) return 'Password must be at least 12 characters.';
  if (!/[a-z]/.test(password)) return 'Password must include at least one lowercase letter (a-z).';
  if (!/[A-Z]/.test(password)) return 'Password must include at least one uppercase letter (A-Z).';
  if (!/\d/.test(password)) return 'Password must include at least one number (0-9).';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must include at least one special character.';
  return null;
}

function normalizeOptional(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export default function CustomerProfilePage() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState('');

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile.');
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
      });
      setProfile(updated);
      setFullName(updated.full_name ?? '');
      setUsername(updated.username ?? '');
      setJobTitle(updated.job_title ?? '');
      setDepartment(updated.department ?? '');
      toast.success('Profile updated.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile.');
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
      toast.error('All password fields are required.');
      return;
    }
    if (/\s/.test(next) || /\s/.test(confirm)) {
      toast.error('New password cannot contain spaces.');
      return;
    }
    if (next !== confirm) {
      toast.error('New password and confirm password do not match.');
      return;
    }
    const passwordPolicyError = getPasswordPolicyError(next);
    if (passwordPolicyError) {
      toast.error(passwordPolicyError);
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
      toast.success('Password changed successfully.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to change password.');
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-[#1f3f73] bg-[linear-gradient(120deg,#071733,#0c2144_45%,#13356d)] px-5 py-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#9dc5ff]">Customer Profile</p>
          <h1 className="text-2xl font-semibold text-white">Profile & Security</h1>
          <p className="mt-1 text-sm text-[#b9cdef]">Manage your profile details and account security in one place.</p>
        </div>
        <button
          type="button"
          onClick={() => void loadProfile()}
          disabled={loading}
          className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm text-[#dce8ff] hover:bg-[#223657] disabled:opacity-60"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
        </div>
      </header>

      {error ? <p className="rounded-lg border border-[#f0c7cf] bg-[#fff2f4] px-3 py-2 text-sm text-[#b63d51]">{error}</p> : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-2xl border border-[#dbe4f4] bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1f2d45]">Profile details</h2>
          <p className="mt-1 text-sm text-[#607594]">Update your profile information used across customer workspace.</p>

          <form className="mt-4 space-y-3" onSubmit={onSaveProfile}>
            <label className="block space-y-1.5 text-sm">
              <span className="text-[#4f6281]">Email</span>
              <input
                type="email"
                value={profile?.email ?? ''}
                disabled
                className="w-full rounded-lg border border-[#d4dced] bg-[#eef2f8] px-3 py-2 text-[#506282]"
              />
            </label>
            <label className="block space-y-1.5 text-sm">
              <span className="text-[#4f6281]">Full name</span>
              <input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring"
              />
            </label>
            <label className="block space-y-1.5 text-sm">
              <span className="text-[#4f6281]">Username</span>
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-1.5 text-sm">
                <span className="text-[#4f6281]">Job title</span>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(event) => setJobTitle(event.target.value)}
                  className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring"
                />
              </label>
              <label className="block space-y-1.5 text-sm">
                <span className="text-[#4f6281]">Department</span>
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
              {savingProfile ? 'Saving...' : 'Save profile'}
            </button>
          </form>
        </article>

        <article className="rounded-2xl border border-[#dbe4f4] bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1f2d45]">Company context</h2>
          <p className="mt-1 text-sm text-[#607594]">Company information is shown for visibility and managed by platform flow.</p>
          <div className="mt-4">
            <CompanySwitcher label="Select company" />
          </div>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-lg border border-[#e2e8f5] bg-[#f7f9fe] p-3">
              <dt className="text-[#607594]">Company name</dt>
              <dd className="mt-1 font-semibold text-[#1f2d45]">{profile?.company_name || '-'}</dd>
            </div>
            <div className="rounded-lg border border-[#e2e8f5] bg-[#f7f9fe] p-3">
              <dt className="text-[#607594]">Industry</dt>
              <dd className="mt-1 font-semibold text-[#1f2d45]">{profile?.company_industry || '-'}</dd>
            </div>
            <div className="rounded-lg border border-[#e2e8f5] bg-[#f7f9fe] p-3">
              <dt className="text-[#607594]">Company size</dt>
              <dd className="mt-1 font-semibold text-[#1f2d45]">{profile?.company_size || '-'}</dd>
            </div>
            <div className="rounded-lg border border-[#e2e8f5] bg-[#f7f9fe] p-3">
              <dt className="text-[#607594]">Region</dt>
              <dd className="mt-1 font-semibold text-[#1f2d45]">{profile?.company_region || '-'}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-[#6c83a8]">
            Profile created: {profile?.created_at ? new Date(profile.created_at).toLocaleString() : 'n/a'} | Last updated:{' '}
            {profile?.updated_at ? new Date(profile.updated_at).toLocaleString() : 'n/a'}
          </p>
        </article>
      </div>

      <article className="rounded-2xl border border-[#dbe4f4] bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1f2d45]">Change password</h2>
        <p className="mt-1 text-sm text-[#607594]">Use your current password to set a new strong password.</p>
        <form className="mt-4 grid gap-3 md:grid-cols-3" onSubmit={onChangePassword}>
          <label className="block space-y-1.5 text-sm">
            <span className="text-[#4f6281]">Current password <span className="text-[#c43e53]">*</span></span>
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
                aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
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
            <span className="text-[#4f6281]">New password <span className="text-[#c43e53]">*</span></span>
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
                aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
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
            <span className="text-[#4f6281]">Confirm password <span className="text-[#c43e53]">*</span></span>
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
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
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
              {changingPassword ? 'Changing...' : 'Change password'}
            </button>
            <span className="text-xs text-[#6c83a8]">
              Min 12 chars with uppercase, lowercase, number, and special character.
            </span>
          </div>
        </form>
      </article>
    </section>
  );
}
