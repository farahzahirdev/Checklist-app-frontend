import { apiDelete, apiGetWithAuth, apiPatch, apiPost } from '@/lib/api';

export type CustomerCompany = {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  website: string | null;
  region: string | null;
  country: string | null;
  industry: string | null;
  size: string | null;
  description: string | null;
  compliance_framework: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_count?: number;
};

export type CustomerCompanyListResponse = {
  total: number;
  companies: CustomerCompany[];
  skip: number;
  limit: number;
};

export type CreateCustomerCompanyPayload = {
  name: string;
  slug: string;
  email?: string | null;
  website?: string | null;
  region?: string | null;
  country?: string | null;
  industry?: string | null;
  size?: string | null;
  description?: string | null;
  compliance_framework?: string | null;
};

export type UpdateCustomerCompanyPayload = Partial<CreateCustomerCompanyPayload> & {
  is_active?: boolean;
};

export async function listMyCompanies() {
  return apiGetWithAuth<CustomerCompanyListResponse>('/customer/companies');
}

export async function createCustomerCompany(payload: CreateCustomerCompanyPayload) {
  return apiPost<CustomerCompany, CreateCustomerCompanyPayload>('/customer/companies', payload);
}

export async function updateCustomerCompany(companyId: string, payload: UpdateCustomerCompanyPayload) {
  return apiPatch<CustomerCompany, UpdateCustomerCompanyPayload>(`/customer/companies/${encodeURIComponent(companyId)}`, payload);
}

export async function selectCustomerCompany(companyId: string) {
  return apiPatch<CustomerCompany, Record<string, never>>(
    `/customer/companies/${encodeURIComponent(companyId)}/select`,
    {},
  );
}

export async function leaveCustomerCompany(companyId: string) {
  return apiDelete<Record<string, never>>(`/customer/companies/${encodeURIComponent(companyId)}/leave`);
}
