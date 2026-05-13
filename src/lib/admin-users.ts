import { apiGetWithAuth, apiPatch, apiPost } from '@/lib/api';

export type AdminManagedUser = {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type AdminManagedUsersResponse = {
  total: number;
  users: AdminManagedUser[];
  skip: number;
  limit: number;
};

export type AdminUserDetail = AdminManagedUser & {
  permissions: Array<{ resource: string; action: string }>;
  roles_assigned: string[];
};

export type AdminCustomer = {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type AdminCustomersResponse = {
  total: number;
  customers: AdminCustomer[];
  skip: number;
  limit: number;
};

export type AdminCustomerDetail = AdminCustomer & {
  full_name?: string | null;
  username?: string | null;
  job_title?: string | null;
  department?: string | null;
  permissions: Array<{ resource: string; action: string }>;
  primary_company_id?: string | null;
  company?: {
    id: string;
    name: string;
    slug: string;
    email?: string | null;
    website?: string | null;
    industry?: string | null;
    country?: string | null;
    is_active: boolean;
  };
};

type ListAdminUsersParams = {
  skip?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
  role?: string;
};

type ListCustomersParams = {
  skip?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
  is_active?: boolean;
};

function withPagination(path: string, params?: Record<string, string | number | boolean | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    query.set(key, String(value));
  });
  return `${path}?${query.toString()}`;
}

export function listAdminUsers(params?: ListAdminUsersParams) {
  return apiGetWithAuth<AdminManagedUsersResponse>(
    withPagination('/admin/users', {
      skip: params?.skip ?? 0,
      limit: params?.limit ?? 100,
      sort_by: params?.sort_by,
      sort_order: params?.sort_order,
      search: params?.search,
      role: params?.role,
    }),
  );
}

export function getAdminUser(userId: string) {
  return apiGetWithAuth<AdminUserDetail>(`/admin/users/${userId}`);
}

export function changeAdminUserRole(userId: string, payload: { new_role_code: 'admin' | 'auditor'; reason: string }) {
  return apiPatch<AdminManagedUser, typeof payload>(`/admin/users/${userId}/role`, payload);
}

export function assignPermissionsToUser(userId: string, permissions: Array<[string, string]>) {
  return apiPost<Record<string, unknown>, { permissions: Array<[string, string]> }>(`/admin/users/${userId}/permissions`, {
    permissions,
  });
}

export function resetUserPermissions(userId: string) {
  return apiPost<Record<string, unknown>, { confirm: boolean }>(`/admin/users/${userId}/permissions/reset`, { confirm: true });
}

export function resetAdminUserPassword(userId: string, payload: { new_password: string; reason?: string }) {
  return apiPost<{ user_id: string; email: string; message: string; reset_at: string; reset_by_user_id: string }, typeof payload>(
    `/admin/users/${userId}/password/reset`,
    payload,
  );
}

export function listCustomers(params?: ListCustomersParams) {
  return apiGetWithAuth<AdminCustomersResponse>(
    withPagination('/admin/customers', {
      skip: params?.skip ?? 0,
      limit: params?.limit ?? 100,
      sort_by: params?.sort_by,
      sort_order: params?.sort_order,
      search: params?.search,
      is_active: params?.is_active,
    }),
  );
}

export function getCustomer(customerId: string) {
  return apiGetWithAuth<AdminCustomerDetail>(`/admin/customers/${customerId}`);
}

export function deactivateCustomer(customerId: string, payload: { reason: string; permanent?: boolean }) {
  return apiPost<Record<string, unknown>, typeof payload>(`/admin/customers/${customerId}/deactivate`, payload);
}

export function activateCustomer(customerId: string, payload: { reason: string }) {
  return apiPost<Record<string, unknown>, typeof payload>(`/admin/customers/${customerId}/activate`, payload);
}

export function switchAdminRole(payload: { switch_to_role: 'customer' | 'auditor'; reason: string; duration_minutes: number }) {
  return apiPost<
    { switched_to_role: string; temporary_token: string; expires_at: string; original_role: string },
    typeof payload
  >('/admin/role-switch', payload);
}

export function endAdminRoleSwitch() {
  return apiPost<Record<string, unknown>, { confirm: boolean }>('/admin/role-switch/end', { confirm: true });
}

export function viewCustomerDashboardAsAdmin(customerId: string, reason: string) {
  return apiPost<Record<string, unknown>, { customer_id: string; reason: string }>(
    `/admin/customers/${customerId}/dashboard`,
    { customer_id: customerId, reason },
  );
}
