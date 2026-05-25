import { apiGetWithAuth, apiPatch } from '@/lib/api';
import { apiPost } from '@/lib/api';

export type CustomerProfile = {
  id: string;
  email: string;
  email_verified?: boolean;
  email_verification_sent_at?: string | null;
  full_name: string | null;
  username: string | null;
  job_title: string | null;
  department: string | null;
  preferred_language: 'en' | 'cs';
  primary_company_id: string | null;
  notifications_enabled: boolean;
  reports_alert: boolean;
  payment_success_alert: boolean;
  assessment_submitted_alert: boolean;
  assessment_started_alert: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  company_name: string | null;
  company_industry: string | null;
  company_size: string | null;
  company_region: string | null;
  company_email: string | null;
  company_website: string | null;
  company_slug: string | null;
  company_country: string | null;
  company_description: string | null;
  billing_contact_name: string | null;
  billing_email: string | null;
  billing_phone: string | null;
  billing_address_line1: string | null;
  billing_address_line2: string | null;
  billing_city: string | null;
  billing_state: string | null;
  billing_postal_code: string | null;
  billing_country: string | null;
  billing_tax_id: string | null;
};

export type UpdateCustomerProfilePayload = {
  full_name?: string;
  username?: string;
  job_title?: string;
  department?: string;
  preferred_language?: 'en' | 'cs';
  notifications_enabled?: boolean;
  reports_alert?: boolean;
  payment_success_alert?: boolean;
  assessment_submitted_alert?: boolean;
  assessment_started_alert?: boolean;
  company_name?: string | null;
  company_slug?: string | null;
  company_email?: string | null;
  company_website?: string | null;
  company_industry?: string | null;
  company_region?: string | null;
  company_country?: string | null;
  company_size?: string | null;
  company_description?: string | null;
  billing_contact_name?: string | null;
  billing_email?: string | null;
  billing_phone?: string | null;
  billing_address_line1?: string | null;
  billing_address_line2?: string | null;
  billing_city?: string | null;
  billing_state?: string | null;
  billing_postal_code?: string | null;
  billing_country?: string | null;
  billing_tax_id?: string | null;
};

export type ChangeCustomerPasswordPayload = {
  current_password: string;
  new_password: string;
  confirm_password: string;
};

export type ProfileCompletionField = {
  section: string;
  field: string;
  label: string;
  completed: boolean;
};

export type ProfileCompletion = {
  completion_percent: number;
  is_complete: boolean;
  missing_fields: ProfileCompletionField[];
  completed_fields: ProfileCompletionField[];
};

const COMPLETION_FIELD_LABEL_KEYS: Record<string, string> = {
  personal_details: 'completion.field.personalDetails',
  organizational_company_details: 'completion.field.organizationDetails',
  mfa_setup: 'completion.field.mfaSetup',
  notification_preferences: 'completion.field.notificationPreferences',
  billing_details: 'completion.field.billingDetails',
};

export const COMPLETION_SECTION_IDS: Record<string, string> = {
  profile: 'profile-details',
  company: 'organization',
  security: 'security',
  preferences: 'notifications',
  billing: 'billing-details',
};

export async function getCustomerProfile() {
  return apiGetWithAuth<CustomerProfile>('/customer/profile');
}

export async function getCustomerProfileCompletion() {
  return apiGetWithAuth<ProfileCompletion>('/customer/profile/completion');
}

export async function updateCustomerProfile(payload: UpdateCustomerProfilePayload) {
  return apiPatch<CustomerProfile, UpdateCustomerProfilePayload>('/customer/profile', payload);
}

export async function changeCustomerPassword(payload: ChangeCustomerPasswordPayload) {
  return apiPatch<Record<string, unknown>, ChangeCustomerPasswordPayload>('/customer/profile/password', payload);
}

export async function createCustomerMfaSupportRequest(payload: {
  request_type: 'reset' | 'disable';
  message: string;
}) {
  return apiPost<Record<string, unknown>, typeof payload>('/customer/profile/mfa-support-request', payload);
}

export function profileToNotificationPrefs(profile: CustomerProfile) {
  return {
    notifications_enabled: profile.notifications_enabled,
    reports_alert: profile.reports_alert,
    payment_success_alert: profile.payment_success_alert,
    assessment_submitted_alert: profile.assessment_submitted_alert,
    assessment_started_alert: profile.assessment_started_alert,
  };
}

export type NotificationPrefs = ReturnType<typeof profileToNotificationPrefs>;

export function applyProfileCompanyFields(
  profile: CustomerProfile,
  setters: {
    setCompanyName: (v: string) => void;
    setCompanyEmail: (v: string) => void;
    setCompanyWebsite: (v: string) => void;
    setCompanyIndustry: (v: string) => void;
    setCompanyRegion: (v: string) => void;
    setCompanyCountry: (v: string) => void;
    setCompanySize: (v: string) => void;
    setCompanyDescription: (v: string) => void;
  },
) {
  setters.setCompanyName(profile.company_name ?? '');
  setters.setCompanyEmail(profile.company_email ?? '');
  setters.setCompanyWebsite(profile.company_website ?? '');
  setters.setCompanyIndustry(profile.company_industry ?? '');
  setters.setCompanyRegion(profile.company_region ?? '');
  setters.setCompanyCountry(profile.company_country ?? '');
  setters.setCompanySize(profile.company_size ?? '');
  setters.setCompanyDescription(profile.company_description ?? '');
}

export function applyProfileBillingFields(
  profile: CustomerProfile,
  setters: {
    setBillingContactName: (v: string) => void;
    setBillingEmail: (v: string) => void;
    setBillingPhone: (v: string) => void;
    setBillingAddressLine1: (v: string) => void;
    setBillingAddressLine2: (v: string) => void;
    setBillingCity: (v: string) => void;
    setBillingState: (v: string) => void;
    setBillingPostalCode: (v: string) => void;
    setBillingCountry: (v: string) => void;
    setBillingTaxId: (v: string) => void;
  },
) {
  setters.setBillingContactName(profile.billing_contact_name ?? '');
  setters.setBillingEmail(profile.billing_email ?? '');
  setters.setBillingPhone(profile.billing_phone ?? '');
  setters.setBillingAddressLine1(profile.billing_address_line1 ?? '');
  setters.setBillingAddressLine2(profile.billing_address_line2 ?? '');
  setters.setBillingCity(profile.billing_city ?? '');
  setters.setBillingState(profile.billing_state ?? '');
  setters.setBillingPostalCode(profile.billing_postal_code ?? '');
  setters.setBillingCountry(profile.billing_country ?? '');
  setters.setBillingTaxId(profile.billing_tax_id ?? '');
}

export function buildCompletionChecklist(
  completion: ProfileCompletion,
  t: (key: string) => string,
): Array<{ key: string; label: string; done: boolean }> {
  const ordered = [...completion.missing_fields, ...completion.completed_fields];
  return ordered.map((item) => ({
    key: `${item.section}.${item.field}`,
    label: t(COMPLETION_FIELD_LABEL_KEYS[item.field] ?? '') || item.label,
    done: item.completed,
  }));
}

export function completionCtaSectionId(completion: ProfileCompletion | null): string {
  const firstMissing = completion?.missing_fields[0];
  if (!firstMissing) return 'profile-details';
  return COMPLETION_SECTION_IDS[firstMissing.section] ?? 'profile-details';
}

export function hasBillingDetails(profile: CustomerProfile | null): boolean {
  if (!profile) return false;
  return Boolean(
    profile.billing_contact_name?.trim() &&
      profile.billing_email?.trim() &&
      profile.billing_address_line1?.trim() &&
      profile.billing_city?.trim() &&
      profile.billing_postal_code?.trim() &&
      profile.billing_country?.trim(),
  );
}
