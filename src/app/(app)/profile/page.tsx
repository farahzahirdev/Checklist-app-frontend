'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { CustomerProfileView } from '@/components/customer-profile/customer-profile-view';
import { getCurrentUser, requestEmailVerification } from '@/lib/auth';
import { translate, useLocale } from '@/lib/i18n';
import {
  applyProfileCompanyFields,
  buildCompletionChecklist,
  changeCustomerPassword,
  createCustomerMfaSupportRequest,
  getCustomerProfile,
  getCustomerProfileCompletion,
  profileToNotificationPrefs,
  updateCustomerProfile,
  type CustomerProfile,
  type NotificationPrefs,
  type ProfileCompletion,
} from '@/lib/customer-profile';
import { listMyCompanies, type CustomerCompany } from '@/lib/customer-companies';
import { loadCustomerProfileInsights } from '@/lib/customer-profile-insights';
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

function formatLastActivityParts(
  updatedAt: string | undefined,
  locale: 'en' | 'cs',
  location: string | undefined,
  t: (key: string) => string,
) {
  if (!updatedAt) {
    return { primary: '—', subline: t('stats.lastActivityLocationFallback') };
  }
  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) {
    return { primary: '—', subline: t('stats.lastActivityLocationFallback') };
  }
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  const time = date.toLocaleTimeString(locale === 'cs' ? 'cs-CZ' : 'en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const dateLabel = date.toLocaleDateString(locale === 'cs' ? 'cs-CZ' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const primary = sameDay
    ? locale === 'cs'
      ? `Dnes, ${time}`
      : `Today, ${time}`
    : date.toLocaleDateString(locale === 'cs' ? 'cs-CZ' : 'en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
  const subline = `${dateLabel}${location ? ` • ${location}` : ''}`;
  return { primary, subline };
}

function formatPasswordAgeLabel(updatedAt: string | undefined, t: (key: string) => string) {
  if (!updatedAt) return t('security.passwordValue');
  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) return t('security.passwordValue');
  const days = Math.max(0, Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)));
  if (days === 0) return t('security.passwordUpdatedToday');
  return t('security.passwordUpdatedDays').replace('{days}', String(days));
}

function applyProfileFormState(profile: CustomerProfile, setters: {
  setFullName: (v: string) => void;
  setUsername: (v: string) => void;
  setJobTitle: (v: string) => void;
  setDepartment: (v: string) => void;
  setPreferredLanguage: (v: 'en' | 'cs') => void;
}) {
  setters.setFullName(profile.full_name ?? '');
  setters.setUsername(profile.username ?? '');
  setters.setJobTitle(profile.job_title ?? '');
  setters.setDepartment(profile.department ?? '');
  setters.setPreferredLanguage(profile.preferred_language ?? 'en');
}

export default function CustomerProfilePage() {
  const { locale, setLocale } = useLocale();
  const t = (key: string) => translate(customerProfileMessages, locale, key);

  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [company, setCompany] = useState<CustomerCompany | null>(null);
  const [profileCompletion, setProfileCompletion] = useState<ProfileCompletion | null>(null);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [purchasedProductsCount, setPurchasedProductsCount] = useState(0);
  const [activeAccessCount, setActiveAccessCount] = useState(0);
  const [hasPurchasedAudit, setHasPurchasedAudit] = useState(false);
  const [hasReports, setHasReports] = useState(false);
  const [latestPurchaseTitle, setLatestPurchaseTitle] = useState('');
  const [totalSpentDisplay, setTotalSpentDisplay] = useState('');
  const [activeSection, setActiveSection] = useState('profile-details');

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingCompany, setSavingCompany] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingCompany, setEditingCompany] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [mfaRequestOpen, setMfaRequestOpen] = useState(false);
  const [mfaRequestType, setMfaRequestType] = useState<'reset' | 'disable'>('reset');
  const [mfaRequestMessage, setMfaRequestMessage] = useState('');
  const [error, setError] = useState('');
  const [requestingEmailVerification, setRequestingEmailVerification] = useState(false);
  const [requestingMfaSupport, setRequestingMfaSupport] = useState(false);

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<'en' | 'cs'>('en');

  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('');
  const [companyCountry, setCompanyCountry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>({
    notifications_enabled: true,
    reports_alert: true,
    payment_success_alert: true,
    assessment_submitted_alert: true,
    assessment_started_alert: true,
  });

  const companySetters = useMemo(
    () => ({
      setCompanyName,
      setCompanyEmail,
      setCompanyWebsite,
      setCompanyIndustry,
      setCompanyCountry,
      setCompanySize,
      setCompanyDescription,
    }),
    [],
  );

  const profileFormSetters = useMemo(
    () => ({
      setFullName,
      setUsername,
      setJobTitle,
      setDepartment,
      setPreferredLanguage,
    }),
    [],
  );

  const hasOrganization = Boolean(
    profile?.primary_company_id || profile?.company_name?.trim() || companyName.trim() || company,
  );

  const completionItems = useMemo(() => {
    if (!profileCompletion) return [];
    return buildCompletionChecklist(profileCompletion, t);
  }, [profileCompletion, locale, t]);

  const profileCompletionPercent = useMemo(() => {
    if (!profileCompletion) return 0;
    return Math.round(profileCompletion.completion_percent);
  }, [profileCompletion]);

  const completionCtaSection = useMemo(() => {
    const firstMissing = profileCompletion?.missing_fields[0];
    if (!firstMissing) return 'profile-details';
    if (firstMissing.section === 'company') return 'organization';
    return 'profile-details';
  }, [profileCompletion]);

  const securityLevel = mfaEnabled ? t('stats.securityHigh') : t('stats.securityMedium');
  const lastActivityParts = formatLastActivityParts(
    profile?.updated_at,
    locale,
    companyCountry.trim() || profile?.company_country?.trim() || company?.country?.trim() || undefined,
    t,
  );
  const passwordAgeLabel = formatPasswordAgeLabel(profile?.updated_at, t);

  async function loadProfile() {
    setLoading(true);
    setError('');

    try {
      const [profileData, companyList, authMe, insights, completion] = await Promise.all([
        getCustomerProfile(),
        listMyCompanies().catch(() => ({ companies: [] as CustomerCompany[] })),
        getCurrentUser().catch(() => null),
        loadCustomerProfileInsights(locale),
        getCustomerProfileCompletion().catch(() => null),
      ]);

      setProfile(profileData);
      setProfileCompletion(completion);
      setMfaEnabled(Boolean(authMe?.mfa_enabled));
      setNotificationPrefs(profileToNotificationPrefs(profileData));
      setInvoiceCount(insights.invoiceCount);
      setPurchasedProductsCount(insights.purchasedChecklistsCount);
      setActiveAccessCount(insights.activeAccessCount);
      setHasPurchasedAudit(insights.hasPurchasedAudit);
      setHasReports(insights.hasReports);
      setLatestPurchaseTitle(insights.latestPurchaseTitle ?? '');
      setTotalSpentDisplay(insights.totalSpentDisplay ?? '');

      applyProfileFormState(profileData, profileFormSetters);
      applyProfileCompanyFields(profileData, companySetters);

      const firstCompany = companyList.companies?.[0] ?? null;
      setCompany(firstCompany);
      setEditingCompany(false);
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
      const updated = await updateCustomerProfile({
        full_name: normalizeOptional(fullName),
        username: normalizeOptional(username),
        job_title: normalizeOptional(jobTitle),
        department: normalizeOptional(department),
        preferred_language: preferredLanguage,
      });

      setProfile(updated);
      applyProfileFormState(updated, profileFormSetters);
      setLocale(updated.preferred_language ?? 'en');
      setEditingProfile(false);

      const completion = await getCustomerProfileCompletion().catch(() => null);
      if (completion) setProfileCompletion(completion);

      toast.success(t('toasts.profileUpdated'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.updateProfile'));
    } finally {
      setSavingProfile(false);
    }
  }

  async function onSaveCompany(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingCompany(true);
    try {
      const updated = await updateCustomerProfile({
        company_name: normalizeOptional(companyName) ?? null,
        company_email: normalizeOptional(companyEmail) ?? null,
        company_website: normalizeOptional(companyWebsite) ?? null,
        company_industry: normalizeOptional(companyIndustry) ?? null,
        company_country: normalizeOptional(companyCountry) ?? null,
        company_size: normalizeOptional(companySize) ?? null,
        company_description: normalizeOptional(companyDescription) ?? null,
      });

      setProfile(updated);
      applyProfileCompanyFields(updated, companySetters);

      const companyList = await listMyCompanies().catch(() => ({ companies: [] as CustomerCompany[] }));
      setCompany(companyList.companies?.[0] ?? null);
      setEditingCompany(false);

      const completion = await getCustomerProfileCompletion().catch(() => null);
      if (completion) setProfileCompletion(completion);

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
      setShowPasswordForm(false);
      const refreshed = await getCustomerProfile();
      setProfile(refreshed);
      toast.success(t('toasts.passwordChanged'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.changePassword'));
    } finally {
      setChangingPassword(false);
    }
  }

  async function onSaveNotificationPrefs() {
    setSavingNotifications(true);
    try {
      const updated = await updateCustomerProfile({
        notifications_enabled: notificationPrefs.notifications_enabled,
        reports_alert: notificationPrefs.reports_alert,
        payment_success_alert: notificationPrefs.payment_success_alert,
        assessment_submitted_alert: notificationPrefs.assessment_submitted_alert,
        assessment_started_alert: notificationPrefs.assessment_started_alert,
      });
      setProfile(updated);
      setNotificationPrefs(profileToNotificationPrefs(updated));
      toast.success(t('toasts.preferencesSaved'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.updatePreferences'));
    } finally {
      setSavingNotifications(false);
    }
  }

  async function onRequestEmailVerification() {
    setRequestingEmailVerification(true);
    try {
      const response = await requestEmailVerification();
      toast.success(response.message || t('toasts.emailVerificationRequested'));
      const refreshed = await getCustomerProfile();
      setProfile(refreshed);
      const completion = await getCustomerProfileCompletion().catch(() => null);
      if (completion) setProfileCompletion(completion);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.requestEmailVerification'));
    } finally {
      setRequestingEmailVerification(false);
    }
  }

  async function onSubmitMfaSupportRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = mfaRequestMessage.trim();
    if (trimmed.length < 5) {
      toast.error(t('errors.mfaSupportMessageTooShort'));
      return;
    }

    setRequestingMfaSupport(true);
    try {
      await createCustomerMfaSupportRequest({
        request_type: mfaRequestType,
        message: trimmed,
      });
      toast.success(t('toasts.mfaSupportRequested'));
      setMfaRequestOpen(false);
      setMfaRequestType('reset');
      setMfaRequestMessage('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.requestMfaSupport'));
    } finally {
      setRequestingMfaSupport(false);
    }
  }

  return (
    <CustomerProfileView
      t={t}
      loading={loading}
      error={error}
      profile={profile}
      company={company}
      hasOrganization={hasOrganization}
      mfaEnabled={mfaEnabled}
      invoiceCount={invoiceCount}
      purchasedProductsCount={purchasedProductsCount}
      hasPurchasedAudit={hasPurchasedAudit}
      hasReports={hasReports}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      onRefresh={() => void loadProfile()}
      editingProfile={editingProfile}
      setEditingProfile={setEditingProfile}
      editingCompany={editingCompany}
      setEditingCompany={setEditingCompany}
      showPasswordForm={showPasswordForm}
      setShowPasswordForm={setShowPasswordForm}
      mfaRequestOpen={mfaRequestOpen}
      setMfaRequestOpen={setMfaRequestOpen}
      mfaRequestType={mfaRequestType}
      setMfaRequestType={setMfaRequestType}
      mfaRequestMessage={mfaRequestMessage}
      setMfaRequestMessage={setMfaRequestMessage}
      fullName={fullName}
      setFullName={setFullName}
      username={username}
      setUsername={setUsername}
      jobTitle={jobTitle}
      setJobTitle={setJobTitle}
      department={department}
      setDepartment={setDepartment}
      preferredLanguage={preferredLanguage}
      setPreferredLanguage={setPreferredLanguage}
      companyName={companyName}
      setCompanyName={setCompanyName}
      companyEmail={companyEmail}
      setCompanyEmail={setCompanyEmail}
      companyWebsite={companyWebsite}
      setCompanyWebsite={setCompanyWebsite}
      companyIndustry={companyIndustry}
      setCompanyIndustry={setCompanyIndustry}
      companyCountry={companyCountry}
      setCompanyCountry={setCompanyCountry}
      companySize={companySize}
      setCompanySize={setCompanySize}
      companyDescription={companyDescription}
      setCompanyDescription={setCompanyDescription}
      currentPassword={currentPassword}
      setCurrentPassword={setCurrentPassword}
      newPassword={newPassword}
      setNewPassword={setNewPassword}
      confirmPassword={confirmPassword}
      setConfirmPassword={setConfirmPassword}
      showCurrentPassword={showCurrentPassword}
      setShowCurrentPassword={setShowCurrentPassword}
      showNewPassword={showNewPassword}
      setShowNewPassword={setShowNewPassword}
      showConfirmPassword={showConfirmPassword}
      setShowConfirmPassword={setShowConfirmPassword}
      savingProfile={savingProfile}
      savingCompany={savingCompany}
      savingNotifications={savingNotifications}
      changingPassword={changingPassword}
      requestingEmailVerification={requestingEmailVerification}
      requestingMfaSupport={requestingMfaSupport}
      notificationPrefs={notificationPrefs}
      setNotificationPrefs={setNotificationPrefs}
      onSaveProfile={onSaveProfile}
      onSaveCompany={onSaveCompany}
      onChangePassword={onChangePassword}
      onRequestEmailVerification={() => void onRequestEmailVerification()}
      onSubmitMfaSupportRequest={onSubmitMfaSupportRequest}
      onSaveNotificationPrefs={() => void onSaveNotificationPrefs()}
      profileCompletionPercent={profileCompletionPercent}
      completionItems={completionItems}
      completionCtaSection={completionCtaSection}
      profileCompletionLoading={!profileCompletion && !loading}
      lastActivityPrimary={lastActivityParts.primary}
      lastActivitySubline={lastActivityParts.subline}
      securityLevel={securityLevel}
      passwordAgeLabel={passwordAgeLabel}
      activeAccessCount={activeAccessCount}
      latestPurchaseTitle={latestPurchaseTitle}
      totalSpentDisplay={totalSpentDisplay}
    />
  );
}
