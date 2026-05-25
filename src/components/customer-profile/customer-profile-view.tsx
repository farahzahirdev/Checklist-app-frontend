'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';
import type { FormEvent, ReactNode } from 'react';
import neonNetworkBg from '@/assets/Neon-Network-Overlay.jpg';
import {
  ProfileAuditIcon,
  ProfileBackupIcon,
  ProfileDrpIcon,
  ProfileReportsIcon,
} from '@/components/customer-profile/profile-product-icons';
import type { CustomerCompany } from '@/lib/customer-companies';
import type { CustomerProfile } from '@/lib/customer-profile';

const cardClass = 'rounded-2xl border border-[#e2e8f4] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:p-6';
const inputClass =
  'w-full rounded-xl border border-[#d4dced] bg-[#f8fafc] px-3 py-2.5 text-sm text-[#1e293b] outline-none ring-[#3b82f6]/40 focus:border-[#3b82f6] focus:ring-2';
const outlineBtn =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-[#2563eb] bg-[#f8fbff] px-4 py-2 text-sm font-semibold text-[#2563eb] transition-colors hover:border-[#1d4ed8] hover:bg-[#eff6ff]';
const primaryBtn =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8] disabled:opacity-60';

type TranslateFn = (key: string) => string;

import type { NotificationPrefs } from '@/lib/customer-profile';

export type CustomerProfileViewProps = {
  t: TranslateFn;
  loading: boolean;
  error: string;
  profile: CustomerProfile | null;
  company: CustomerCompany | null;
  hasOrganization: boolean;
  mfaEnabled: boolean;
  invoiceCount: number;
  purchasedProductsCount: number;
  hasPurchasedAudit: boolean;
  hasReports: boolean;
  activeSection: string;
  onSectionChange: (id: string) => void;
  onRefresh: () => void;
  editingProfile: boolean;
  setEditingProfile: (value: boolean) => void;
  editingCompany: boolean;
  setEditingCompany: (value: boolean) => void;
  editingBilling: boolean;
  setEditingBilling: (value: boolean) => void;
  showPasswordForm: boolean;
  setShowPasswordForm: (value: boolean) => void;
  mfaRequestOpen: boolean;
  setMfaRequestOpen: (value: boolean) => void;
  mfaRequestType: 'reset' | 'disable';
  setMfaRequestType: (value: 'reset' | 'disable') => void;
  mfaRequestMessage: string;
  setMfaRequestMessage: (value: string) => void;
  fullName: string;
  setFullName: (value: string) => void;
  username: string;
  setUsername: (value: string) => void;
  jobTitle: string;
  setJobTitle: (value: string) => void;
  department: string;
  setDepartment: (value: string) => void;
  preferredLanguage: 'en' | 'cs';
  setPreferredLanguage: (value: 'en' | 'cs') => void;
  companyName: string;
  setCompanyName: (value: string) => void;
  companyEmail: string;
  setCompanyEmail: (value: string) => void;
  companyWebsite: string;
  setCompanyWebsite: (value: string) => void;
  companyIndustry: string;
  setCompanyIndustry: (value: string) => void;
  companyCountry: string;
  setCompanyCountry: (value: string) => void;
  companyRegion: string;
  setCompanyRegion: (value: string) => void;
  companySize: string;
  setCompanySize: (value: string) => void;
  companyDescription: string;
  setCompanyDescription: (value: string) => void;
  billingContactName: string;
  setBillingContactName: (value: string) => void;
  billingEmail: string;
  setBillingEmail: (value: string) => void;
  billingPhone: string;
  setBillingPhone: (value: string) => void;
  billingAddressLine1: string;
  setBillingAddressLine1: (value: string) => void;
  billingAddressLine2: string;
  setBillingAddressLine2: (value: string) => void;
  billingCity: string;
  setBillingCity: (value: string) => void;
  billingState: string;
  setBillingState: (value: string) => void;
  billingPostalCode: string;
  setBillingPostalCode: (value: string) => void;
  billingCountry: string;
  setBillingCountry: (value: string) => void;
  billingTaxId: string;
  setBillingTaxId: (value: string) => void;
  currentPassword: string;
  setCurrentPassword: (value: string) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  showCurrentPassword: boolean;
  setShowCurrentPassword: (value: boolean) => void;
  showNewPassword: boolean;
  setShowNewPassword: (value: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (value: boolean) => void;
  savingProfile: boolean;
  savingCompany: boolean;
  savingBilling: boolean;
  savingNotifications: boolean;
  changingPassword: boolean;
  requestingEmailVerification: boolean;
  requestingMfaSupport: boolean;
  notificationPrefs: NotificationPrefs;
  setNotificationPrefs: (value: NotificationPrefs) => void;
  onSaveProfile: (event: FormEvent<HTMLFormElement>) => void;
  onSaveCompany: (event: FormEvent<HTMLFormElement>) => void;
  onSaveBilling: (event: FormEvent<HTMLFormElement>) => void;
  onChangePassword: (event: FormEvent<HTMLFormElement>) => void;
  onRequestEmailVerification: () => void;
  onSubmitMfaSupportRequest: (event: FormEvent<HTMLFormElement>) => void;
  onSaveNotificationPrefs: () => void;
  profileCompletionPercent: number;
  completionItems: Array<{ key: string; label: string; done: boolean }>;
  completionCtaSection: string;
  profileCompletionLoading: boolean;
  lastActivityPrimary: string;
  lastActivitySubline: string;
  securityLevel: string;
  passwordAgeLabel: string;
  activeAccessCount: number;
  latestPurchaseTitle: string;
  totalSpentDisplay: string;
};

function SectionIcon({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eff6ff] text-[#2563eb]">
      {children}
    </span>
  );
}

function ExternalLinkIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="none" aria-hidden="true">
      <path d="M7 5h8v8M15 5 7 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
  hintPrefix,
  showOnlineDot,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
  hintPrefix?: string;
  showOnlineDot?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-1 gap-3 rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-[0_12px_40px_rgba(15,23,42,0.12)]">
      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eff6ff] text-[#2563eb]">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-[#64748b]">{label}</p>
        <p className="mt-0.5 truncate text-lg font-semibold text-[#0f172a]">{value}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[#64748b]">
          {showOnlineDot ? <span className="h-2 w-2 shrink-0 rounded-full bg-[#22c55e]" aria-hidden="true" /> : null}
          {hintPrefix ? <span className="text-[#94a3b8]">{hintPrefix}</span> : null}
          <span className="truncate">{hint}</span>
        </p>
      </div>
    </div>
  );
}

function SecurityTile({
  icon,
  title,
  value,
  iconTone = 'blue',
}: {
  icon: ReactNode;
  title: string;
  value: string;
  iconTone?: 'green' | 'blue';
}) {
  const iconWrap =
    iconTone === 'green'
      ? 'bg-[#dcfce7] text-[#16a34a]'
      : 'bg-[#eff6ff] text-[#2563eb]';
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-[#e2e8f4] bg-[#f8fafc] p-4">
      <div className="flex min-w-0 items-start gap-3">
        <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconWrap}`}>{icon}</span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-[#64748b]">{title}</p>
          <p className="mt-1 break-all text-sm font-semibold text-[#0f172a]">{value}</p>
        </div>
      </div>
    </div>
  );
}

const NAV_ICONS: Record<string, ReactNode> = {
  'profile-details': (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 20c1.2-3.5 4-5 7-5s5.8 1.5 7 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  organization: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M4 20V8l8-4 8 4v12" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
  security: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
  'product-access': (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M4 7h16v12H4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
  'billing-details': (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 10h16" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  notifications: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M15 17H9l-6 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
};

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-[#64748b]">{label}</p>
      <p className="mt-1 text-sm font-medium text-[#0f172a]">{value || '—'}</p>
    </div>
  );
}

type ProductStatus = 'active' | 'available' | 'comingSoon';

function StatusPill({ tone, children }: { tone: ProductStatus; children: ReactNode }) {
  const tones: Record<ProductStatus, string> = {
    active: 'bg-[#dcfce7] text-[#166534]',
    available: 'bg-[#dbeafe] text-[#1d4ed8]',
    comingSoon: 'border border-amber-300/60 bg-amber-50 text-amber-700',
  };
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

function productStatusLabel(status: ProductStatus, t: TranslateFn): string {
  if (status === 'active') return t('products.active');
  if (status === 'comingSoon') return t('products.comingSoon');
  return t('products.available');
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-[#2563eb]' : 'bg-[#cbd5e1]'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggleShow,
  showLabel,
  hideLabel,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggleShow: () => void;
  showLabel: string;
  hideLabel: string;
  autoComplete: string;
}) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="font-medium text-[#475569]">{label}</span>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} pr-10`}
          autoComplete={autoComplete}
          required
        />
        <button
          type="button"
          onClick={onToggleShow}
          aria-label={show ? hideLabel : showLabel}
          className="absolute inset-y-0 right-0 inline-flex items-center px-3 text-[#64748b] hover:text-[#334155]"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
            <path
              d={
                show
                  ? 'M3 3 21 21M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.3A10 10 0 0 1 12 5c5.5 0 9.5 4.6 10 7-.2 1-1 2.5-2.3 3.9M6.6 6.6C4.3 8.2 2.4 10.4 2 12c.5 2.4 4.5 7 10 7 1.6 0 3-.4 4.2-1'
                  : 'M2 12c.5-2.4 4.5-7 10-7s9.5 4.6 10 7c-.5 2.4-4.5 7-10 7s-9.5-4.6-10-7Z'
              }
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {show ? null : <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />}
          </svg>
        </button>
      </div>
    </label>
  );
}

const NAV_SECTIONS = [
  { id: 'profile-details', labelKey: 'nav.profileDetails' },
  { id: 'organization', labelKey: 'nav.organization' },
  { id: 'billing-details', labelKey: 'nav.billingDetails' },
  { id: 'security', labelKey: 'nav.security' },
  { id: 'product-access', labelKey: 'nav.productAccess' },
  { id: 'notifications', labelKey: 'nav.notifications' },
] as const;

export function CustomerProfileView(props: CustomerProfileViewProps) {
  const {
    t,
    loading,
    error,
    profile,
    company,
    hasOrganization,
    mfaEnabled,
    invoiceCount,
    purchasedProductsCount,
    hasPurchasedAudit,
    hasReports,
    activeSection,
    onSectionChange,
    onRefresh,
    editingProfile,
    setEditingProfile,
    editingCompany,
    setEditingCompany,
    editingBilling,
    setEditingBilling,
    showPasswordForm,
    setShowPasswordForm,
    mfaRequestOpen,
    setMfaRequestOpen,
    mfaRequestType,
    setMfaRequestType,
    mfaRequestMessage,
    setMfaRequestMessage,
    fullName,
    setFullName,
    username,
    setUsername,
    jobTitle,
    setJobTitle,
    department,
    setDepartment,
    preferredLanguage,
    setPreferredLanguage,
    companyName,
    setCompanyName,
    companyEmail,
    setCompanyEmail,
    companyWebsite,
    setCompanyWebsite,
    companyIndustry,
    setCompanyIndustry,
    companyCountry,
    setCompanyCountry,
    companyRegion,
    setCompanyRegion,
    companySize,
    setCompanySize,
    companyDescription,
    setCompanyDescription,
    billingContactName,
    setBillingContactName,
    billingEmail,
    setBillingEmail,
    billingPhone,
    setBillingPhone,
    billingAddressLine1,
    setBillingAddressLine1,
    billingAddressLine2,
    setBillingAddressLine2,
    billingCity,
    setBillingCity,
    billingState,
    setBillingState,
    billingPostalCode,
    setBillingPostalCode,
    billingCountry,
    setBillingCountry,
    billingTaxId,
    setBillingTaxId,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showCurrentPassword,
    setShowCurrentPassword,
    showNewPassword,
    setShowNewPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    savingProfile,
    savingCompany,
    savingBilling,
    savingNotifications,
    changingPassword,
    requestingEmailVerification,
    requestingMfaSupport,
    notificationPrefs,
    setNotificationPrefs,
    onSaveProfile,
    onSaveCompany,
    onSaveBilling,
    onChangePassword,
    onRequestEmailVerification,
    onSubmitMfaSupportRequest,
    onSaveNotificationPrefs,
    profileCompletionPercent,
    completionItems,
    completionCtaSection,
    profileCompletionLoading,
    lastActivityPrimary,
    lastActivitySubline,
    securityLevel,
    passwordAgeLabel,
    activeAccessCount,
    latestPurchaseTitle,
    totalSpentDisplay,
  } = props;

  const displayName = fullName.trim() || profile?.email?.split('@')[0] || 'User';
  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'U';

  const products = [
    {
      name: t('products.audit.title'),
      description: t('products.audit.description'),
      href: '/assessment' as Route,
      status: hasPurchasedAudit ? ('active' as const) : ('available' as const),
      action: t('products.open'),
      icon: <ProfileAuditIcon className="h-5 w-5 text-[#2563eb]" />,
    },
    {
      name: t('products.backup.title'),
      description: t('products.backup.description'),
      href: '/my-backup-plans' as Route,
      status: 'comingSoon' as const,
      action: t('products.view'),
      icon: <ProfileBackupIcon className="h-5 w-5 text-[#2563eb]" />,
    },
    {
      name: t('products.drp.title'),
      description: t('products.drp.description'),
      href: '/my-drp' as Route,
      status: 'comingSoon' as const,
      action: t('products.view'),
      icon: <ProfileDrpIcon className="h-5 w-5 text-[#2563eb]" />,
    },
    {
      name: t('products.reports.title'),
      description: t('products.reports.description'),
      href: '/reports' as Route,
      status: hasReports ? ('active' as const) : ('available' as const),
      action: t('products.view'),
      icon: <ProfileReportsIcon className="h-5 w-5 text-[#2563eb]" />,
    },
  ];

  function scrollToSection(id: string) {
    onSectionChange(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="min-h-full w-full bg-[#eef2f7]">
      <header className="relative w-full overflow-hidden pb-14 sm:pb-16">
        <Image
          src={neonNetworkBg}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(4,12,32,0.92)_0%,rgba(8,24,56,0.78)_55%,rgba(12,40,88,0.65)_100%)]" />
        <div
          className="pointer-events-none absolute right-0 top-1/2 hidden h-56 w-56 -translate-y-1/2 opacity-30 lg:block xl:h-72 xl:w-72"
          aria-hidden="true"
        >
          <svg viewBox="0 0 120 120" className="h-full w-full text-[#3b82f6]" fill="none">
            <path d="M60 8 20 24v28c0 26.5 17 50.4 40 56 23-5.6 40-29.5 40-56V24L60 8Z" stroke="currentColor" strokeWidth="2" />
            <path d="m44 58 12 12 22-26" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="relative w-full px-5 pt-8 sm:px-6 sm:pt-10 lg:px-8">
          <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-start">
            <div className="min-w-0 flex-1 max-w-3xl xl:pr-48">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7eb8ff]">{t('hero.kicker')}</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">{t('hero.title')}</h1>
              <p className="mt-3 text-sm leading-relaxed text-[#c8daf5] sm:text-base">{t('hero.subtitle')}</p>
            </div>
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="ml-auto shrink-0 self-end rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur hover:bg-white/20 disabled:opacity-60 sm:self-start"
            >
              {loading ? t('actions.refreshing') : t('actions.refresh')}
            </button>
          </div>

          <div className="relative z-10 mt-8 mb-[-2.75rem] grid w-full gap-3 sm:mb-[-3.25rem] sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M5 20c1.2-3.5 4-5 7-5s5.8 1.5 7 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              }
              label={t('stats.accountStatus')}
              value={profile?.is_active ? t('stats.active') : t('stats.inactive')}
              hint={t('stats.accountStatusHint')}
            />
            <StatCard
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path d="M4 7h16v12H4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              }
              label={t('stats.activeProducts')}
              value={String(purchasedProductsCount)}
              hint={t('stats.activeProductsHint')}
            />
            <StatCard
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                </svg>
              }
              label={t('stats.securityLevel')}
              value={securityLevel}
              hint={t('stats.securityLevelHint')}
              hintPrefix="*"
            />
            <StatCard
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M12 8v4l2.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              }
              label={t('stats.lastActivity')}
              value={lastActivityPrimary}
              hint={lastActivitySubline}
              showOnlineDot
            />
          </div>
        </div>
      </header>

      <div className="w-full px-5 sm:px-6 lg:px-8">
        {error ? (
          <p className="mt-6 rounded-xl border border-[#fecdd3] bg-[#fff1f2] px-4 py-3 text-sm text-[#be123c]">{error}</p>
        ) : null}

        <div className="grid w-full min-w-0 gap-6 pb-10 pt-12 sm:pt-14 xl:grid-cols-[minmax(0,1fr)_300px] 2xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-6">
            <article id="profile-details" className={`${cardClass} scroll-mt-28`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <SectionIcon>
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M5 20c1.2-3.5 4-5 7-5s5.8 1.5 7 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </SectionIcon>
                  <div>
                    <h2 className="text-lg font-semibold text-[#0f172a]">{t('section.personal')}</h2>
                    <p className="text-sm text-[#64748b]">{t('section.personalSubtitle')}</p>
                  </div>
                </div>
                {!editingProfile ? (
                  <button type="button" className={outlineBtn} onClick={() => setEditingProfile(true)}>
                    {t('actions.editProfile')}
                  </button>
                ) : (
                  <button type="button" className={outlineBtn} onClick={() => setEditingProfile(false)}>
                    {t('actions.cancel')}
                  </button>
                )}
              </div>

              {!editingProfile ? (
                <div className="mt-6 flex flex-col gap-6 sm:flex-row">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(145deg,#dbeafe,#eff6ff)] text-2xl font-bold text-[#1d4ed8]">
                    {initials}
                  </div>
                  <div className="grid flex-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                    <InfoField label={t('fields.fullName')} value={fullName} />
                    <InfoField label={t('fields.email')} value={profile?.email ?? ''} />
                    <InfoField label={t('fields.username')} value={username} />
                    <InfoField label={t('fields.jobTitle')} value={jobTitle} />
                    <InfoField label={t('fields.department')} value={department} />
                  </div>
                </div>
              ) : (
                <form className="mt-6 space-y-4" onSubmit={onSaveProfile}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block space-y-1.5 text-sm sm:col-span-2">
                      <span className="font-medium text-[#475569]">{t('fields.fullName')}</span>
                      <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
                    </label>
                    <label className="block space-y-1.5 text-sm">
                      <span className="font-medium text-[#475569]">{t('fields.email')}</span>
                      <input type="email" value={profile?.email ?? ''} disabled className={`${inputClass} bg-[#eef2f8] text-[#64748b]`} />
                    </label>
                    <label className="block space-y-1.5 text-sm">
                      <span className="font-medium text-[#475569]">{t('fields.username')}</span>
                      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className={inputClass} />
                    </label>
                    <label className="block space-y-1.5 text-sm">
                      <span className="font-medium text-[#475569]">{t('fields.jobTitle')}</span>
                      <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className={inputClass} />
                    </label>
                    <label className="block space-y-1.5 text-sm">
                      <span className="font-medium text-[#475569]">{t('fields.department')}</span>
                      <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} className={inputClass} />
                    </label>
                    <label className="block space-y-1.5 text-sm sm:col-span-2">
                      <span className="font-medium text-[#475569]">{t('fields.preferredLanguage')}</span>
                      <select
                        value={preferredLanguage}
                        onChange={(e) => setPreferredLanguage(e.target.value as 'en' | 'cs')}
                        className={inputClass}
                      >
                        <option value="en">{t('language.en')}</option>
                        <option value="cs">{t('language.cs')}</option>
                      </select>
                    </label>
                  </div>
                  <button type="submit" disabled={savingProfile} className={primaryBtn}>
                    {savingProfile ? t('actions.saving') : t('actions.saveProfile')}
                  </button>
                </form>
              )}
            </article>

            <article id="organization" className={`${cardClass} scroll-mt-28`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <SectionIcon>
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                      <path d="M4 20V8l8-4 8 4v12" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                      <path d="M9 20v-6h6v6" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                  </SectionIcon>
                  <div>
                    <h2 className="text-lg font-semibold text-[#0f172a]">{t('section.organization')}</h2>
                    <p className="text-sm text-[#64748b]">{t('section.organizationSubtitle')}</p>
                  </div>
                </div>
                {hasOrganization || editingCompany ? (
                  <button
                    type="button"
                    className={outlineBtn}
                    onClick={() => setEditingCompany(!editingCompany)}
                  >
                    {editingCompany ? t('actions.cancel') : t('actions.updateOrganization')}
                  </button>
                ) : (
                  <button type="button" className={outlineBtn} onClick={() => setEditingCompany(true)}>
                    {t('actions.addOrganization')}
                  </button>
                )}
              </div>

              {!hasOrganization && !editingCompany ? (
                <p className="mt-4 rounded-xl border border-[#e2e8f4] bg-[#f8fafc] px-4 py-3 text-sm text-[#64748b]">{t('company.none')}</p>
              ) : !editingCompany ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <InfoField label={t('fields.companyName')} value={companyName} />
                  <InfoField label={t('fields.companySize')} value={companySize} />
                  <InfoField label={t('fields.companyIndustry')} value={companyIndustry} />
                  <InfoField label={t('fields.companyRegion')} value={companyRegion} />
                  <InfoField label={t('fields.companyCountry')} value={companyCountry} />
                  <InfoField label={t('fields.companyFocus')} value={companyDescription} />
                </div>
              ) : (
                <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={onSaveCompany}>
                  <label className="block space-y-1.5 text-sm sm:col-span-2">
                    <span className="font-medium text-[#475569]">{t('fields.companyName')}</span>
                    <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} />
                  </label>
                  <label className="block space-y-1.5 text-sm">
                    <span className="font-medium text-[#475569]">{t('fields.companyEmail')}</span>
                    <input type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} className={inputClass} />
                  </label>
                  <label className="block space-y-1.5 text-sm">
                    <span className="font-medium text-[#475569]">{t('fields.companyWebsite')}</span>
                    <input type="url" value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} className={inputClass} />
                  </label>
                  <label className="block space-y-1.5 text-sm">
                    <span className="font-medium text-[#475569]">{t('fields.companyIndustry')}</span>
                    <input type="text" value={companyIndustry} onChange={(e) => setCompanyIndustry(e.target.value)} className={inputClass} />
                  </label>
                  <label className="block space-y-1.5 text-sm">
                    <span className="font-medium text-[#475569]">{t('fields.companyRegion')}</span>
                    <input type="text" value={companyRegion} onChange={(e) => setCompanyRegion(e.target.value)} className={inputClass} />
                  </label>
                  <label className="block space-y-1.5 text-sm">
                    <span className="font-medium text-[#475569]">{t('fields.companyCountry')}</span>
                    <input type="text" value={companyCountry} onChange={(e) => setCompanyCountry(e.target.value)} className={inputClass} />
                  </label>
                  <label className="block space-y-1.5 text-sm">
                    <span className="font-medium text-[#475569]">{t('fields.companySize')}</span>
                    <input type="text" value={companySize} onChange={(e) => setCompanySize(e.target.value)} className={inputClass} />
                  </label>
                  <label className="block space-y-1.5 text-sm sm:col-span-2">
                    <span className="font-medium text-[#475569]">{t('fields.companyDescription')}</span>
                    <textarea
                      value={companyDescription}
                      onChange={(e) => setCompanyDescription(e.target.value)}
                      rows={3}
                      className={inputClass}
                    />
                  </label>
                  <div className="sm:col-span-2">
                    <button type="submit" disabled={savingCompany} className={primaryBtn}>
                      {savingCompany ? t('actions.saving') : t('actions.saveCompany')}
                    </button>
                  </div>
                </form>
              )}
            </article>

            <article id="billing-details" className={`${cardClass} scroll-mt-28`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <SectionIcon>
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                      <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M4 10h16" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                  </SectionIcon>
                  <div>
                    <h2 className="text-lg font-semibold text-[#0f172a]">{t('section.billingDetails')}</h2>
                    <p className="text-sm text-[#64748b]">{t('section.billingDetailsSubtitle')}</p>
                  </div>
                </div>
                <button type="button" className={outlineBtn} onClick={() => setEditingBilling(!editingBilling)}>
                  {editingBilling ? t('actions.cancel') : t('actions.editBilling')}
                </button>
              </div>

              {!editingBilling ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <InfoField label={t('fields.billingContactName')} value={billingContactName} />
                  <InfoField label={t('fields.billingEmail')} value={billingEmail} />
                  <InfoField label={t('fields.billingPhone')} value={billingPhone} />
                  <InfoField label={t('fields.billingTaxId')} value={billingTaxId} />
                  <InfoField label={t('fields.billingAddressLine1')} value={billingAddressLine1} />
                  <InfoField label={t('fields.billingAddressLine2')} value={billingAddressLine2} />
                  <InfoField label={t('fields.billingCity')} value={billingCity} />
                  <InfoField label={t('fields.billingState')} value={billingState} />
                  <InfoField label={t('fields.billingPostalCode')} value={billingPostalCode} />
                  <InfoField label={t('fields.billingCountry')} value={billingCountry} />
                </div>
              ) : (
                <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={onSaveBilling}>
                  <label className="block space-y-1.5 text-sm">
                    <span className="font-medium text-[#475569]">{t('fields.billingContactName')}</span>
                    <input type="text" value={billingContactName} onChange={(e) => setBillingContactName(e.target.value)} className={inputClass} />
                  </label>
                  <label className="block space-y-1.5 text-sm">
                    <span className="font-medium text-[#475569]">{t('fields.billingEmail')}</span>
                    <input type="email" value={billingEmail} onChange={(e) => setBillingEmail(e.target.value)} className={inputClass} />
                  </label>
                  <label className="block space-y-1.5 text-sm">
                    <span className="font-medium text-[#475569]">{t('fields.billingPhone')}</span>
                    <input type="tel" value={billingPhone} onChange={(e) => setBillingPhone(e.target.value)} className={inputClass} />
                  </label>
                  <label className="block space-y-1.5 text-sm">
                    <span className="font-medium text-[#475569]">{t('fields.billingTaxId')}</span>
                    <input type="text" value={billingTaxId} onChange={(e) => setBillingTaxId(e.target.value)} className={inputClass} />
                  </label>
                  <label className="block space-y-1.5 text-sm sm:col-span-2">
                    <span className="font-medium text-[#475569]">{t('fields.billingAddressLine1')}</span>
                    <input type="text" value={billingAddressLine1} onChange={(e) => setBillingAddressLine1(e.target.value)} className={inputClass} />
                  </label>
                  <label className="block space-y-1.5 text-sm sm:col-span-2">
                    <span className="font-medium text-[#475569]">{t('fields.billingAddressLine2')}</span>
                    <input type="text" value={billingAddressLine2} onChange={(e) => setBillingAddressLine2(e.target.value)} className={inputClass} />
                  </label>
                  <label className="block space-y-1.5 text-sm">
                    <span className="font-medium text-[#475569]">{t('fields.billingCity')}</span>
                    <input type="text" value={billingCity} onChange={(e) => setBillingCity(e.target.value)} className={inputClass} />
                  </label>
                  <label className="block space-y-1.5 text-sm">
                    <span className="font-medium text-[#475569]">{t('fields.billingState')}</span>
                    <input type="text" value={billingState} onChange={(e) => setBillingState(e.target.value)} className={inputClass} />
                  </label>
                  <label className="block space-y-1.5 text-sm">
                    <span className="font-medium text-[#475569]">{t('fields.billingPostalCode')}</span>
                    <input type="text" value={billingPostalCode} onChange={(e) => setBillingPostalCode(e.target.value)} className={inputClass} />
                  </label>
                  <label className="block space-y-1.5 text-sm">
                    <span className="font-medium text-[#475569]">{t('fields.billingCountry')}</span>
                    <input type="text" value={billingCountry} onChange={(e) => setBillingCountry(e.target.value)} className={inputClass} />
                  </label>
                  <div className="sm:col-span-2">
                    <button type="submit" disabled={savingBilling} className={primaryBtn}>
                      {savingBilling ? t('actions.saving') : t('actions.saveBilling')}
                    </button>
                  </div>
                </form>
              )}
            </article>

            <article id="security" className={`${cardClass} scroll-mt-28`}>
              <div className="flex items-center gap-3">
                <SectionIcon>
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                    <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  </svg>
                </SectionIcon>
                <div>
                  <h2 className="text-lg font-semibold text-[#0f172a]">{t('section.security')}</h2>
                  <p className="text-sm text-[#64748b]">{t('section.securitySubtitle')}</p>
                </div>
              </div>

              <div className="mt-6 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
                <SecurityTile
                  iconTone="green"
                  title={t('security.password')}
                  value={passwordAgeLabel}
                  icon={
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                      <path d="m5 12 4 4 10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  }
                />
                <SecurityTile
                  iconTone="green"
                  title={t('security.mfa')}
                  value={mfaEnabled ? t('security.mfaEnabled') : t('security.mfaDisabled')}
                  icon={
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                  }
                />
                <SecurityTile
                  iconTone={profile?.email_verified ? 'green' : 'blue'}
                  title={t('security.emailVerification')}
                  value={profile?.email_verified ? t('security.emailVerified') : t('security.emailNotVerified')}
                  icon={
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                      <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="1.8" />
                      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                    </svg>
                  }
                />
                <SecurityTile
                  title={t('security.recoveryEmail')}
                  value={profile?.email ?? '—'}
                  icon={
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                      <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="1.8" />
                      <path d="m4 7 8 6 8 6 16 7 16 18H8" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                    </svg>
                  }
                />
                <SecurityTile
                  title={t('security.activeAccess')}
                  value={t('security.activeAccessCount').replace('{count}', String(activeAccessCount))}
                  icon={
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                      <rect x="3" y="5" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M8 19h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  }
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {!profile?.email_verified ? (
                  <button
                    type="button"
                    className={outlineBtn}
                    onClick={onRequestEmailVerification}
                    disabled={requestingEmailVerification}
                  >
                    {requestingEmailVerification ? t('actions.sending') : t('security.verifyEmail')}
                  </button>
                ) : null}
                <button
                  type="button"
                  className={outlineBtn}
                  onClick={() => setMfaRequestOpen(true)}
                >
                  {t('security.requestMfaSupport')}
                </button>
              </div>

              <div className="mt-4">
                <button type="button" className="text-sm font-semibold text-[#2563eb] hover:underline" onClick={() => setShowPasswordForm(!showPasswordForm)}>
                  {showPasswordForm ? t('security.hidePasswordForm') : t('security.changePassword')}
                </button>
              </div>

              {showPasswordForm ? (
                <form className="mt-6 grid gap-4 border-t border-[#e2e8f4] pt-6 md:grid-cols-3" onSubmit={onChangePassword}>
                  <PasswordField
                    label={t('fields.currentPassword')}
                    value={currentPassword}
                    onChange={setCurrentPassword}
                    show={showCurrentPassword}
                    onToggleShow={() => setShowCurrentPassword(!showCurrentPassword)}
                    showLabel={t('actions.showCurrentPassword')}
                    hideLabel={t('actions.hideCurrentPassword')}
                    autoComplete="current-password"
                  />
                  <PasswordField
                    label={t('fields.newPassword')}
                    value={newPassword}
                    onChange={setNewPassword}
                    show={showNewPassword}
                    onToggleShow={() => setShowNewPassword(!showNewPassword)}
                    showLabel={t('actions.showNewPassword')}
                    hideLabel={t('actions.hideNewPassword')}
                    autoComplete="new-password"
                  />
                  <PasswordField
                    label={t('fields.confirmPassword')}
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    show={showConfirmPassword}
                    onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
                    showLabel={t('actions.showConfirmPassword')}
                    hideLabel={t('actions.hideConfirmPassword')}
                    autoComplete="new-password"
                  />
                  <div className="md:col-span-3">
                    <button type="submit" disabled={changingPassword} className={primaryBtn}>
                      {changingPassword ? t('actions.changing') : t('actions.changePassword')}
                    </button>
                    <p className="mt-2 text-xs text-[#64748b]">{t('password.hint')}</p>
                  </div>
                </form>
              ) : null}

              {mfaRequestOpen ? (
                <form className="mt-6 space-y-4 border-t border-[#e2e8f4] pt-6" onSubmit={onSubmitMfaSupportRequest}>
                  <h3 className="text-sm font-semibold text-[#0f172a]">{t('security.mfaSupportTitle')}</h3>
                  <label className="block space-y-1.5 text-sm">
                    <span className="font-medium text-[#475569]">{t('security.mfaSupportType')}</span>
                    <select
                      value={mfaRequestType}
                      onChange={(event) => setMfaRequestType(event.target.value as 'reset' | 'disable')}
                      className={inputClass}
                    >
                      <option value="reset">{t('security.mfaRequestReset')}</option>
                      <option value="disable">{t('security.mfaRequestDisable')}</option>
                    </select>
                  </label>
                  <label className="block space-y-1.5 text-sm">
                    <span className="font-medium text-[#475569]">{t('security.mfaSupportMessage')}</span>
                    <textarea
                      rows={4}
                      value={mfaRequestMessage}
                      onChange={(event) => setMfaRequestMessage(event.target.value)}
                      className={inputClass}
                      placeholder={t('security.mfaSupportPlaceholder')}
                    />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button type="submit" disabled={requestingMfaSupport} className={primaryBtn}>
                      {requestingMfaSupport ? t('actions.sending') : t('security.submitMfaSupport')}
                    </button>
                    <button type="button" className={outlineBtn} onClick={() => setMfaRequestOpen(false)}>
                      {t('actions.cancel')}
                    </button>
                  </div>
                </form>
              ) : null}
            </article>

            <article id="product-access" className={`${cardClass} scroll-mt-28`}>
              <div className="flex items-center gap-3">
                <SectionIcon>
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                    <path d="M4 7h16v12H4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  </svg>
                </SectionIcon>
                <div>
                  <h2 className="text-lg font-semibold text-[#0f172a]">{t('section.products')}</h2>
                  <p className="text-sm text-[#64748b]">{t('section.productsSubtitle')}</p>
                </div>
              </div>
              <ul className="mt-6 divide-y divide-[#e2e8f4]">
                {products.map((product) => (
                  <li key={product.name} className="flex flex-wrap items-center gap-4 py-4 first:pt-0 last:pb-0">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#eff6ff]">
                      {product.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#0f172a]">{product.name}</p>
                      <p className="text-sm text-[#64748b]">{product.description}</p>
                    </div>
                    <StatusPill tone={product.status}>{productStatusLabel(product.status, t)}</StatusPill>
                    {product.status === 'comingSoon' ? (
                      <span
                        className={`${outlineBtn} shrink-0 cursor-not-allowed border-[#e2e8f4] bg-[#f8fafc] text-[#94a3b8] opacity-70`}
                        aria-disabled="true"
                      >
                        {product.action}
                        <ExternalLinkIcon />
                      </span>
                    ) : (
                      <Link href={product.href} className={`${outlineBtn} shrink-0`}>
                        {product.action}
                        <ExternalLinkIcon />
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </article>

            <article id="notifications" className={`${cardClass} scroll-mt-28`}>
              <div className="flex items-center gap-3">
                <SectionIcon>
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                    <path d="M15 17H9l-6 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  </svg>
                </SectionIcon>
                <div>
                  <h2 className="text-lg font-semibold text-[#0f172a]">{t('section.notifications')}</h2>
                  <p className="text-sm text-[#64748b]">{t('section.notificationsSubtitle')}</p>
                </div>
              </div>
              <ul className="mt-6 divide-y divide-[#e2e8f4]">
                {(
                  [
                    {
                      key: 'notifications_enabled' as const,
                      title: t('notifications.email'),
                      desc: t('notifications.emailDesc'),
                    },
                    {
                      key: 'reports_alert' as const,
                      title: t('notifications.reports'),
                      desc: t('notifications.reportsDesc'),
                    },
                    {
                      key: 'payment_success_alert' as const,
                      title: t('notifications.payments'),
                      desc: t('notifications.paymentsDesc'),
                    },
                    {
                      key: 'assessment_submitted_alert' as const,
                      title: t('notifications.assessmentSubmitted'),
                      desc: t('notifications.assessmentSubmittedDesc'),
                    },
                    {
                      key: 'assessment_started_alert' as const,
                      title: t('notifications.assessmentStarted'),
                      desc: t('notifications.assessmentStartedDesc'),
                    },
                  ] as const
                ).map((item) => (
                  <li key={item.key} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-semibold text-[#0f172a]">{item.title}</p>
                      <p className="text-xs text-[#64748b]">{item.desc}</p>
                    </div>
                    <Toggle
                      checked={notificationPrefs[item.key]}
                      onChange={(checked) => setNotificationPrefs({ ...notificationPrefs, [item.key]: checked })}
                      label={item.title}
                    />
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex justify-end border-t border-[#e2e8f4] pt-4">
                <button type="button" className={outlineBtn} onClick={onSaveNotificationPrefs} disabled={savingNotifications}>
                  {savingNotifications ? t('actions.saving') : t('actions.savePreferences')}
                </button>
              </div>
            </article>
          </div>

          <aside className="min-w-0 space-y-4 xl:sticky xl:top-4 xl:self-start">
            <nav className={cardClass} aria-label={t('nav.title')}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">{t('nav.title')}</p>
              <ul className="mt-3 space-y-1">
                {NAV_SECTIONS.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => scrollToSection(item.id)}
                      className={`flex w-full items-center gap-2.5 rounded-lg py-2.5 text-left text-sm font-medium transition-colors ${
                        activeSection === item.id
                          ? 'border-l-[3px] border-[#2563eb] bg-[#eff6ff] pl-2.5 text-[#2563eb]'
                          : 'border-l-[3px] border-transparent px-3 text-[#475569] hover:bg-[#f8fafc]'
                      }`}
                    >
                      <span className={activeSection === item.id ? 'text-[#2563eb]' : 'text-[#94a3b8]'}>
                        {NAV_ICONS[item.id]}
                      </span>
                      {t(item.labelKey)}
                    </button>
                  </li>
                ))}
                <li>
                  <Link
                    href={'/support' as Route}
                    className="flex w-full items-center gap-2.5 rounded-lg border-l-[3px] border-transparent px-3 py-2.5 text-sm font-medium text-[#475569] hover:bg-[#f8fafc]"
                  >
                    <span className="text-[#94a3b8]">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                        <path d="M12 18h.01M8 21h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    </span>
                    {t('nav.support')}
                  </Link>
                </li>
              </ul>
            </nav>

            <div className={cardClass}>
              <h3 className="text-sm font-semibold text-[#0f172a]">{t('completion.title')}</h3>
              <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:gap-4">
                <div
                  className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(#2563eb ${profileCompletionPercent * 3.6}deg, #e2e8f4 0deg)`,
                  }}
                >
                  <span className="flex h-[4.5rem] w-[4.5rem] flex-col items-center justify-center rounded-full bg-white text-center">
                    <span className="text-lg font-bold leading-none text-[#2563eb]">{profileCompletionPercent}%</span>
                    <span className="mt-0.5 text-[10px] font-medium text-[#64748b]">{t('completion.completeLabel')}</span>
                  </span>
                </div>
                <p className="text-center text-sm text-[#64748b] sm:text-left">{t('completion.subtitle')}</p>
              </div>
              <ul className="mt-4 space-y-2.5">
                {profileCompletionLoading ? (
                  <li className="text-sm text-[#64748b]">{t('completion.loading')}</li>
                ) : completionItems.length ? (
                  completionItems.map((item) => (
                    <li key={item.key} className="flex items-center gap-2.5 text-sm">
                      {item.done ? (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#dcfce7] text-[#16a34a]" aria-hidden="true">
                          ✓
                        </span>
                      ) : (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#f59e0b]" aria-hidden="true" />
                      )}
                      <span className={item.done ? 'text-[#334155]' : 'text-[#64748b]'}>{item.label}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-[#64748b]">{t('completion.empty')}</li>
                )}
              </ul>
              <button
                type="button"
                className="mt-4 text-sm font-semibold text-[#2563eb] hover:underline"
                onClick={() => scrollToSection(completionCtaSection)}
              >
                {t('completion.cta')} →
              </button>
            </div>

            <div id="payment-summary" className={`${cardClass} scroll-mt-28`}>
              <h3 className="text-sm font-semibold text-[#0f172a]">{t('billing.title')}</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="shrink-0 text-[#64748b]">{t('billing.latestPurchase')}</dt>
                  <dd className="max-w-[58%] truncate text-right font-semibold text-[#2563eb]" title={latestPurchaseTitle || undefined}>
                    {latestPurchaseTitle || t('billing.noPurchases')}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-[#64748b]">{t('billing.totalSpent')}</dt>
                  <dd className="font-semibold text-[#2563eb]">{totalSpentDisplay || t('billing.notAvailable')}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-[#64748b]">{t('billing.invoices')}</dt>
                  <dd className="font-semibold text-[#2563eb]">
                    {invoiceCount} {t('billing.invoicesSuffix')}
                  </dd>
                </div>
              </dl>
              <Link href="/payments" className={`${outlineBtn} mt-4 w-full`}>
                {t('billing.view')}
                <ExternalLinkIcon />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
