import { apiGetWithAuth, apiPatch } from '@/lib/api';

export type CustomerProfile = {
  id: string;
  email: string;
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
  company_country?: string | null;
  company_size?: string | null;
  company_description?: string | null;
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
    setCompanyCountry: (v: string) => void;
    setCompanySize: (v: string) => void;
    setCompanyDescription: (v: string) => void;
  },
) {
  setters.setCompanyName(profile.company_name ?? '');
  setters.setCompanyEmail(profile.company_email ?? '');
  setters.setCompanyWebsite(profile.company_website ?? '');
  setters.setCompanyIndustry(profile.company_industry ?? '');
  setters.setCompanyCountry(profile.company_country ?? '');
  setters.setCompanySize(profile.company_size ?? '');
  setters.setCompanyDescription(profile.company_description ?? '');
}

const COMPLETION_FIELD_LABEL_KEYS: Record<string, string> = {
  full_name: 'completion.field.fullName',
  username: 'completion.field.username',
  job_title: 'completion.field.jobTitle',
  department: 'completion.field.department',
  company_assigned: 'completion.field.companyAssigned',
  company_name: 'completion.field.companyName',
  company_slug: 'completion.field.companySlug',
  company_industry: 'completion.field.companyIndustry',
  company_size: 'completion.field.companySize',
  company_region: 'completion.field.companyRegion',
  company_country: 'completion.field.companyCountry',
  company_website: 'completion.field.companyWebsite',
};

export function buildCompletionChecklist(
  completion: ProfileCompletion,
  t: (key: string) => string,
): Array<{ key: string; label: string; done: boolean }> {
  const ordered = [...completion.missing_fields, ...completion.completed_fields];
  return ordered.slice(0, 10).map((item) => ({
    key: `${item.section}.${item.field}`,
    label: t(COMPLETION_FIELD_LABEL_KEYS[item.field] ?? '') || item.label,
    done: item.completed,
  }));
}
