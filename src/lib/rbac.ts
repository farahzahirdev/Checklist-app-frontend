import { apiDelete, apiGetWithAuth, apiPatch, apiPost } from '@/lib/api';

export type RbacPermission = {
  id: string;
  resource: string;
  action: string;
  description: string;
  is_active: boolean;
  created_at: string;
};

export type RbacRole = {
  id: string;
  code: string;
  name: string;
  description: string;
  is_system_role: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type RbacRoleDetail = RbacRole & {
  permissions: RbacPermission[];
  user_count: number;
};

export type UserRoleAssignment = {
  id: string;
  user_id: string;
  role_id: string;
  role: RbacRole;
  assigned_by: string;
  assigned_at: string;
};

export type UserPermissionsResponse = {
  user_id: string;
  roles: RbacRole[];
  permissions: RbacPermission[];
};

export function listPermissions(params?: { skip?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.skip !== undefined) query.set('skip', String(params.skip));
  if (params?.limit !== undefined) query.set('limit', String(params.limit));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiGetWithAuth<RbacPermission[]>(`/admin/rbac/permissions${suffix}`);
}

export function createPermission(payload: { resource: string; action: string; description: string }) {
  return apiPost<RbacPermission, typeof payload>('/admin/rbac/permissions', payload);
}

export function getPermission(permissionId: string) {
  return apiGetWithAuth<RbacPermission>(`/admin/rbac/permissions/${permissionId}`);
}

export function listRoles(params?: { skip?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.skip !== undefined) query.set('skip', String(params.skip));
  if (params?.limit !== undefined) query.set('limit', String(params.limit));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiGetWithAuth<RbacRole[]>(`/admin/rbac/roles${suffix}`);
}

export function createRole(payload: { code: string; name: string; description: string }) {
  return apiPost<RbacRole, typeof payload>('/admin/rbac/roles', payload);
}

export function getRole(roleId: string) {
  return apiGetWithAuth<RbacRoleDetail>(`/admin/rbac/roles/${roleId}`);
}

export function updateRole(roleId: string, payload: { name?: string; description?: string; is_active?: boolean }) {
  return apiPatch<RbacRole, typeof payload>(`/admin/rbac/roles/${roleId}`, payload);
}

export function assignPermissionToRole(roleId: string, permissionId: string) {
  return apiPost<RbacPermission, { permission_id: string }>(`/admin/rbac/roles/${roleId}/permissions`, { permission_id: permissionId });
}

export function assignPermissionsBulk(roleId: string, permissionIds: string[]) {
  return apiPost<null, { permission_ids: string[] }>(`/admin/rbac/roles/${roleId}/permissions/bulk`, { permission_ids: permissionIds });
}

export function removePermissionFromRole(roleId: string, permissionId: string) {
  return apiDelete<null>(`/admin/rbac/roles/${roleId}/permissions/${permissionId}`);
}

export function removePermissionsBulk(roleId: string, permissionIds: string[]) {
  return apiPost<null, { permission_ids: string[] }>(`/admin/rbac/roles/${roleId}/permissions/bulk-remove`, {
    permission_ids: permissionIds,
  });
}

export function getUserRoles(userId: string) {
  return apiGetWithAuth<UserRoleAssignment[]>(`/admin/rbac/users/${userId}/roles`);
}

export function assignRoleToUser(userId: string, roleId: string) {
  return apiPost<UserRoleAssignment, { role_id: string }>(`/admin/rbac/users/${userId}/roles`, { role_id: roleId });
}

export function assignRoleToUserByCode(userId: string, roleCode: string) {
  return apiPost<UserRoleAssignment, { role_code: string }>(`/admin/rbac/users/${userId}/roles/by-code`, { role_code: roleCode });
}

export function assignRolesBulkToUser(userId: string, roleIds: string[]) {
  return apiPost<null, { role_ids: string[] }>(`/admin/rbac/users/${userId}/roles/bulk`, { role_ids: roleIds });
}

export function removeRoleFromUser(userId: string, roleId: string) {
  return apiDelete<null>(`/admin/rbac/users/${userId}/roles/${roleId}`);
}

export function getUserPermissions(userId: string) {
  return apiGetWithAuth<UserPermissionsResponse>(`/admin/rbac/users/${userId}/permissions`);
}

export function checkPermission(payload: { resource: string; action: string; user_id?: string }) {
  const query = new URLSearchParams();
  query.set('resource', payload.resource);
  query.set('action', payload.action);
  if (payload.user_id) query.set('user_id', payload.user_id);
  return apiPost<{ user_id: string; resource: string; action: string; has_permission: boolean }, Record<string, never>>(
    `/admin/rbac/check-permission?${query.toString()}`,
    {},
  );
}

export function checkPermissions(
  permissions: Array<[string, string]>,
  userId?: string,
) {
  const query = new URLSearchParams();
  if (userId) query.set('user_id', userId);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiPost<{ user_id: string; permissions: Record<string, boolean> }, Array<[string, string]>>(
    `/admin/rbac/check-permissions${suffix}`,
    permissions,
  );
}
