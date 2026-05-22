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

export async function getCustomerProfile() {
  return apiGetWithAuth<CustomerProfile>('/customer/profile');
}

export async function updateCustomerProfile(payload: UpdateCustomerProfilePayload) {
  return apiPatch<CustomerProfile, UpdateCustomerProfilePayload>('/customer/profile', payload);
}

export async function changeCustomerPassword(payload: ChangeCustomerPasswordPayload) {
  return apiPatch<Record<string, unknown>, ChangeCustomerPasswordPayload>('/customer/profile/password', payload);
}
