import { apiGetWithAuth, apiPost, apiPut } from '@/lib/api';

export type AdminCompany = {
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
};

export type AdminCompanyDetail = AdminCompany & {
  user_count: number;
};

export type AdminCompanyListResponse = {
  total: number;
  companies: AdminCompany[];
  skip: number;
  limit: number;
};

export type CreateAdminCompanyPayload = {
  name: string;
  slug: string;
  email?: string;
  website?: string;
  region?: string;
  country?: string;
  industry?: string;
  size?: string;
  description?: string;
  compliance_framework?: string;
};

export type UpdateAdminCompanyPayload = Partial<CreateAdminCompanyPayload> & {
  is_active?: boolean;
};

export async function listAdminCompanies(params?: { skip?: number; limit?: number; search?: string; is_active?: boolean; industry?: string }) {
  const query = new URLSearchParams();
  if (typeof params?.skip === 'number') query.set('skip', String(params.skip));
  if (typeof params?.limit === 'number') query.set('limit', String(params.limit));
  if (params?.search) query.set('search', params.search);
  if (typeof params?.is_active === 'boolean') query.set('is_active', String(params.is_active));
  if (params?.industry) query.set('industry', params.industry);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiGetWithAuth<AdminCompanyListResponse>(`/admin/companies/${suffix}`);
}

export async function getAdminCompany(companyId: string) {
  return apiGetWithAuth<AdminCompanyDetail>(`/admin/companies/${encodeURIComponent(companyId)}`);
}

export async function createAdminCompany(payload: CreateAdminCompanyPayload) {
  return apiPost<AdminCompany, CreateAdminCompanyPayload>('/admin/companies/', payload);
}

export async function updateAdminCompany(companyId: string, payload: UpdateAdminCompanyPayload) {
  return apiPut<AdminCompany, UpdateAdminCompanyPayload>(`/admin/companies/${encodeURIComponent(companyId)}`, payload);
}