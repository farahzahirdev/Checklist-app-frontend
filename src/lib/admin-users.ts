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
  permissions: Array<{ resource: string; action: string }>;
};

function withPagination(path: string, skip = 0, limit = 100) {
  const query = new URLSearchParams({ skip: String(skip), limit: String(limit) });
  return `${path}?${query.toString()}`;
}

export function listAdminUsers(skip = 0, limit = 100) {
  return apiGetWithAuth<AdminManagedUsersResponse>(withPagination('/admin/users', skip, limit));
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

export function listCustomers(skip = 0, limit = 100) {
  return apiGetWithAuth<AdminCustomersResponse>(withPagination('/admin/customers', skip, limit));
}

export function getCustomer(customerId: string) {
  return apiGetWithAuth<AdminCustomerDetail>(`/admin/customers/${customerId}`);
}

export function deactivateCustomer(customerId: string, payload: { reason: string; permanent: boolean }) {
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
