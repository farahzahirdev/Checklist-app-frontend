'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { listAdminUsers, listCustomers, type AdminManagedUser } from '@/lib/admin-users';
import {
  assignPermissionToRole,
  assignPermissionsBulk,
  assignRoleToUser,
  assignRolesBulkToUser,
  checkPermission,
  checkPermissions,
  createPermission,
  createRole,
  getRole,
  getUserPermissions,
  getUserRoles,
  listPermissions,
  listRoles,
  removePermissionFromRole,
  removePermissionsBulk,
  removeRoleFromUser,
  updateRole,
  type RbacPermission,
  type RbacRole,
} from '@/lib/rbac';
import { useAdminAccess } from '@/lib/admin-access';
import { formatPermissionLine } from '@/lib/permission-labels';

export default function AdminRbacPage() {
  const { isReadOnly } = useAdminAccess();
  const [permissions, setPermissions] = useState<RbacPermission[]>([]);
  const [roles, setRoles] = useState<RbacRole[]>([]);
  const [users, setUsers] = useState<AdminManagedUser[]>([]);
  const [customers, setCustomers] = useState<Array<{ id: string; email: string; is_active: boolean }>>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [selectedPermissionId, setSelectedPermissionId] = useState('');
  const [bulkPermissionKeys, setBulkPermissionKeys] = useState('dashboard:read,report:read');
  const [roleUpdateName, setRoleUpdateName] = useState('');
  const [roleUpdateDescription, setRoleUpdateDescription] = useState('');
  const [roleUpdateActive, setRoleUpdateActive] = useState(true);
  const [targetUserId, setTargetUserId] = useState('');
  const [targetRoleId, setTargetRoleId] = useState('');
  const [selectedCheckPermissionId, setSelectedCheckPermissionId] = useState('');
  const [permissionCheckResult, setPermissionCheckResult] = useState<{ allowed: boolean; reason?: string } | null>(null);
  const [userRolesResult, setUserRolesResult] = useState<Array<{ id: string; code: string; name: string }>>([]);
  const [userPermissionsResult, setUserPermissionsResult] = useState<Array<{ id: string; resource: string; action: string; description: string }>>([]);
  const [rolesFetched, setRolesFetched] = useState(false);
  const [permissionsFetched, setPermissionsFetched] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [auditorUserSearch, setAuditorUserSearch] = useState('');
  const [auditorUserListUnavailable, setAuditorUserListUnavailable] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'check'>('users');
  const [newRoleCode, setNewRoleCode] = useState('');
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [newPermissionResource, setNewPermissionResource] = useState('');
  const [newPermissionAction, setNewPermissionAction] = useState('');
  const [newPermissionDescription, setNewPermissionDescription] = useState('');
  const [selectedRoleDetail, setSelectedRoleDetail] = useState<{ id: string; user_count: number; permissions: RbacPermission[] } | null>(null);
  const [bulkRoleCodes, setBulkRoleCodes] = useState('auditor');
  const [multiPermissionKeys, setMultiPermissionKeys] = useState('dashboard:read,report:read');
  const [multiPermissionResult, setMultiPermissionResult] = useState<Record<string, boolean> | null>(null);
  const [lookupUserId, setLookupUserId] = useState('');

  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? null;
  const selectedPermission = permissions.find((permission) => permission.id === selectedPermissionId) ?? null;
  const allUsers = useMemo(
    () => [...users, ...customers.map((customer) => ({ ...customer, role: 'customer' as const }))],
    [users, customers],
  );
  const selectedUser = allUsers.find((user) => user.id === targetUserId) ?? null;
  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();
    if (!query) return allUsers;
    return allUsers.filter((user) => user.email.toLowerCase().includes(query) || user.role.toLowerCase().includes(query));
  }, [allUsers, userSearch]);
  const filteredAuditorUsers = useMemo(() => {
    const query = auditorUserSearch.trim().toLowerCase();
    if (!query) return allUsers;
    return allUsers.filter((user) => user.email.toLowerCase().includes(query) || user.role.toLowerCase().includes(query));
  }, [allUsers, auditorUserSearch]);

  function permissionIdsFromKeys(input: string): string[] {
    const keys = input
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    const ids = keys
      .map((key) => permissions.find((permission) => `${permission.resource}:${permission.action}` === key)?.id ?? null)
      .filter((id): id is string => Boolean(id));
    return ids;
  }

  function roleIdsFromCodes(input: string): string[] {
    const codes = input
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);
    return codes
      .map((code) => roles.find((role) => role.code.toLowerCase() === code)?.id ?? null)
      .filter((id): id is string => Boolean(id));
  }

  function permissionPairsFromKeys(input: string): Array<[string, string]> {
    return input
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => item.split(':'))
      .filter((parts): parts is [string, string] => parts.length === 2 && Boolean(parts[0]) && Boolean(parts[1]))
      .map(([resource, action]) => [resource.trim(), action.trim()]);
  }

  async function loadRbacData() {
    setLoading(true);
    try {
      if (isReadOnly) {
        const [permissionsResponse, rolesResponse, usersSettled, customersSettled] = await Promise.all([
          listPermissions(),
          listRoles(),
          listAdminUsers().then((data) => ({ ok: true as const, data })).catch(() => ({ ok: false as const, data: null })),
          listCustomers().then((data) => ({ ok: true as const, data })).catch(() => ({ ok: false as const, data: null })),
        ]);
        setPermissions(permissionsResponse);
        setRoles(rolesResponse);
        setUsers(usersSettled.ok && usersSettled.data ? usersSettled.data.users : []);
        setCustomers(customersSettled.ok && customersSettled.data ? customersSettled.data.customers : []);
        setAuditorUserListUnavailable(!(usersSettled.ok || customersSettled.ok));
      } else {
        const [permissionsResponse, rolesResponse, usersResponse, customersResponse] = await Promise.all([
          listPermissions(),
          listRoles(),
          listAdminUsers(),
          listCustomers(),
        ]);
        setPermissions(permissionsResponse);
        setRoles(rolesResponse);
        setUsers(usersResponse.users);
        setCustomers(customersResponse.customers);
        setAuditorUserListUnavailable(false);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load RBAC data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRbacData();
  }, [isReadOnly]);

  async function runAction(action: () => Promise<unknown>, successMessage: string, actionKey?: string) {
    if (actionKey) {
      setActionLoading(actionKey);
    }
    try {
      await action();
      toast.success(successMessage);
      await loadRbacData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action failed');
    } finally {
      if (actionKey) {
        setActionLoading('');
      }
    }
  }

  useEffect(() => {
    const role = roles.find((item) => item.id === selectedRoleId);
    if (!role) return;
    setRoleUpdateName(role.name);
    setRoleUpdateDescription(role.description || '');
    setRoleUpdateActive(role.is_active);
  }, [selectedRoleId, roles]);

  async function onCheckSelectedPermission() {
    if (!selectedCheckPermissionId) {
      toast.error('Pick a permission to check first.');
      return;
    }
    const permission = permissions.find((item) => item.id === selectedCheckPermissionId);
    if (!permission) {
      toast.error('Selected permission was not found.');
      return;
    }
    await runAction(async () => {
      const data = await checkPermission({
        resource: permission.resource,
        action: permission.action,
        user_id: targetUserId || undefined,
      });
      setPermissionCheckResult({ allowed: data.has_permission });
    }, 'Permission check complete.', 'check-permission');
  }

  async function onLoadUserRoles() {
    if (!targetUserId) {
      toast.error('Select a user first.');
      return;
    }
    await runAction(async () => {
      const data = await getUserRoles(targetUserId);
      setUserRolesResult(Array.isArray(data) ? data.map((assignment) => assignment.role) : []);
      setRolesFetched(true);
    }, 'User roles loaded.', 'view-roles');
  }

  async function onLoadUserPermissions() {
    if (!targetUserId) {
      toast.error('Select a user first.');
      return;
    }
    await runAction(async () => {
      const data = await getUserPermissions(targetUserId);
      setUserPermissionsResult(Array.isArray(data.permissions) ? data.permissions : []);
      setPermissionsFetched(true);
    }, 'User permissions loaded.', 'view-permissions');
  }

  async function onLookupUserRoles() {
    if (!lookupUserId) {
      toast.error('Choose a user first.');
      return;
    }
    await runAction(async () => {
      const data = await getUserRoles(lookupUserId);
      setUserRolesResult(Array.isArray(data) ? data.map((assignment) => assignment.role) : []);
      setRolesFetched(true);
    }, 'User roles loaded.', 'view-roles');
  }

  async function onLookupUserPermissions() {
    if (!lookupUserId) {
      toast.error('Choose a user first.');
      return;
    }
    await runAction(async () => {
      const data = await getUserPermissions(lookupUserId);
      setUserPermissionsResult(Array.isArray(data.permissions) ? data.permissions : []);
      setPermissionsFetched(true);
    }, 'User permissions loaded.', 'view-permissions');
  }

  async function onLoadRoleDetail() {
    if (!selectedRoleId) {
      toast.error('Select a role first.');
      return;
    }
    await runAction(async () => {
      const detail = await getRole(selectedRoleId);
      setSelectedRoleDetail({
        id: detail.id,
        user_count: detail.user_count,
        permissions: detail.permissions ?? [],
      });
    }, 'Role details loaded.', 'load-role-detail');
  }

  async function onCreateRole() {
    if (!newRoleCode.trim() || !newRoleName.trim()) {
      toast.error('Role code and role name are required.');
      return;
    }
    await runAction(
      () =>
        createRole({
          code: newRoleCode.trim(),
          name: newRoleName.trim(),
          description: newRoleDescription.trim(),
        }),
      'Role created.',
      'create-role',
    );
    setNewRoleCode('');
    setNewRoleName('');
    setNewRoleDescription('');
  }

  async function onCreatePermission() {
    if (!newPermissionResource.trim() || !newPermissionAction.trim()) {
      toast.error('Resource and action are required.');
      return;
    }
    await runAction(
      () =>
        createPermission({
          resource: newPermissionResource.trim(),
          action: newPermissionAction.trim(),
          description: newPermissionDescription.trim(),
        }),
      'Permission created.',
      'create-permission',
    );
    setNewPermissionResource('');
    setNewPermissionAction('');
    setNewPermissionDescription('');
  }

  async function onAssignRolesBulkToUser() {
    if (!targetUserId) {
      toast.error('Select a user first.');
      return;
    }
    const roleIds = roleIdsFromCodes(bulkRoleCodes);
    if (!roleIds.length) {
      toast.error('Enter at least one valid role code.');
      return;
    }
    await runAction(() => assignRolesBulkToUser(targetUserId, roleIds), 'Roles assigned in bulk.', 'assign-roles-bulk');
  }

  async function onCheckMultiplePermissions() {
    const pairs = permissionPairsFromKeys(multiPermissionKeys);
    if (!pairs.length) {
      toast.error('Enter valid permission keys in resource:action format.');
      return;
    }
    await runAction(async () => {
      const data = await checkPermissions(pairs, targetUserId || undefined);
      setMultiPermissionResult(data.permissions ?? {});
    }, 'Multiple permission check complete.', 'check-multiple-permissions');
  }

  useEffect(() => {
    setUserRolesResult([]);
    setUserPermissionsResult([]);
    setPermissionCheckResult(null);
    setMultiPermissionResult(null);
    setRolesFetched(false);
    setPermissionsFetched(false);
  }, [targetUserId]);

  useEffect(() => {
    setUserRolesResult([]);
    setUserPermissionsResult([]);
    setRolesFetched(false);
    setPermissionsFetched(false);
  }, [lookupUserId]);

  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-[#dbe4f4] bg-white px-5 py-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6f82a3]">Access control</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1f2d45]">Role & Permission Management</h1>
        <p className="mt-1 text-sm text-[#607594]">Select a user, then manage roles and permissions from one place.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <p className="rounded-lg border border-[#e3e9f6] bg-[#f8faff] px-3 py-2 text-xs font-semibold text-[#4a6187]">Roles: <span className="text-[#243555]">{roles.length}</span></p>
          <p className="rounded-lg border border-[#e3e9f6] bg-[#f8faff] px-3 py-2 text-xs font-semibold text-[#4a6187]">Permissions: <span className="text-[#243555]">{permissions.length}</span></p>
          <p className="rounded-lg border border-[#e3e9f6] bg-[#f8faff] px-3 py-2 text-xs font-semibold text-[#4a6187]">Users: <span className="text-[#243555]">{allUsers.length}</span></p>
        </div>
        {isReadOnly ? (
          <p className="mt-3 rounded-lg border border-[#dbe4f4] bg-[#f7f9fe] px-3 py-2 text-xs text-[#5f7395]">
            Auditor mode: view-only RBAC access.
          </p>
        ) : null}
      </header>

      <div className="flex gap-1 border-b border-[#dbe4f4]">
        {[
          { id: 'users', label: 'User access' },
          { id: 'roles', label: 'Roles & permissions' },
          { id: 'check', label: 'Permission check' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as 'users' | 'roles' | 'check')}
            className={`border-b-2 px-4 py-2 text-sm transition ${
              activeTab === tab.id ? 'border-[#1f2d45] text-[#1f2d45] font-medium' : 'border-transparent text-[#607594] hover:text-[#1f2d45]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'users' ? (
        <div className="grid gap-4 xl:grid-cols-[300px_1fr]">
          <article className="rounded-2xl border border-[#dbe4f4] bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#607594]">Select user</p>
            <input
              value={isReadOnly ? auditorUserSearch : userSearch}
              onChange={(e) => (isReadOnly ? setAuditorUserSearch(e.target.value) : setUserSearch(e.target.value))}
              disabled={!allUsers.length}
              placeholder={allUsers.length ? 'Search by email or role' : 'No users available'}
              className="mt-3 w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm disabled:opacity-70"
            />
            <div className="mt-3 max-h-[420px] space-y-2 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {(isReadOnly ? filteredAuditorUsers : filteredUsers).length ? (
                (isReadOnly ? filteredAuditorUsers : filteredUsers).map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => setTargetUserId(user.id)}
                    className={`w-full rounded-xl border px-3 py-2 text-left ${
                      targetUserId === user.id ? 'border-[#2f7dff] bg-[#edf4ff]' : 'border-[#e3e9f6] bg-white hover:bg-[#f7faff]'
                    }`}
                  >
                    <p className="text-sm font-semibold text-[#2a3d5f]">{user.email}</p>
                    <p className="text-xs text-[#607594]">{user.role} · {user.is_active ? 'Active' : 'Inactive'}</p>
                  </button>
                ))
              ) : (
                <p className="rounded-xl border border-[#e3e9f6] bg-[#f9fbff] px-3 py-2 text-sm text-[#607594]">
                  {loading ? 'Loading users…' : 'No users match your search.'}
                </p>
              )}
            </div>
            {!allUsers.length && auditorUserListUnavailable ? (
              <p className="mt-2 rounded-lg border border-[#e3e9f6] bg-[#f9fbff] px-3 py-2 text-xs text-[#607594]">
                User listing APIs are unavailable for auditor right now.
              </p>
            ) : null}
          </article>

          <div className="space-y-3">
            <article className="rounded-2xl border border-[#dbe4f4] bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-[#243555]">{selectedUser ? selectedUser.email : 'Select a user from the left panel'}</h2>
              <p className="mt-1 text-sm text-[#607594]">{selectedUser ? `${selectedUser.role} · ${selectedUser.is_active ? 'Active' : 'Inactive'}` : 'Manage selected user access and lookups here.'}</p>
            </article>

            {!isReadOnly ? (
              <article className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#607594]">Assign or remove role</p>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  <div className="rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2">
                    <p className="text-xs text-[#607594]">Selected user</p>
                    <p className="text-sm font-semibold text-[#2a3d5f]">{selectedUser ? selectedUser.email : 'No user selected'}</p>
                  </div>
                  <label className="block space-y-2 text-sm text-[#566b8d]">
                    <span>Role</span>
                    <select value={targetRoleId} onChange={(e) => setTargetRoleId(e.target.value)} className="w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm">
                      <option value="">Choose a role…</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>{role.name} ({role.code})</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" disabled={Boolean(actionLoading)} onClick={() => {
                    if (!targetUserId || !targetRoleId) return toast.error('Select user and role first.');
                    void runAction(() => assignRoleToUser(targetUserId, targetRoleId), 'Role assigned to user.', 'assign-role');
                  }} className="rounded-xl border border-[#1f2d45] bg-[#1f2d45] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
                    {actionLoading === 'assign-role' ? 'Assigning…' : 'Assign role'}
                  </button>
                  <button type="button" disabled={Boolean(actionLoading)} onClick={() => {
                    if (!targetUserId || !targetRoleId) return toast.error('Select user and role first.');
                    void runAction(() => removeRoleFromUser(targetUserId, targetRoleId), 'Role removed from user.', 'remove-role');
                  }} className="rounded-xl border border-[#e2b9c0] bg-[#fff5f6] px-3 py-2 text-sm font-semibold text-[#b14452] disabled:opacity-60">
                    {actionLoading === 'remove-role' ? 'Removing…' : 'Remove role'}
                  </button>
                </div>
                <div className="mt-4 border-t border-[#e9eef8] pt-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#607594]">Bulk assign roles by code</p>
                  <p className="mt-1 text-xs text-[#607594]">Comma-separated codes. Example: `auditor,customer`.</p>
                  <input
                    value={bulkRoleCodes}
                    onChange={(e) => setBulkRoleCodes(e.target.value)}
                    placeholder="auditor,customer"
                    className="mt-2 w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    disabled={Boolean(actionLoading)}
                    onClick={() => void onAssignRolesBulkToUser()}
                    className="mt-2 rounded-xl border border-[#1f2d45] bg-[#1f2d45] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {actionLoading === 'assign-roles-bulk' ? 'Assigning roles…' : 'Assign roles in bulk'}
                  </button>
                </div>
              </article>
            ) : null}

            <article className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#607594]">User current access</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" disabled={Boolean(actionLoading)} onClick={() => void onLoadUserRoles()} className="rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm font-semibold text-[#2a3d5f] disabled:opacity-60">
                  {actionLoading === 'view-roles' ? 'Loading roles…' : 'Load roles'}
                </button>
                <button type="button" disabled={Boolean(actionLoading)} onClick={() => void onLoadUserPermissions()} className="rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm font-semibold text-[#2a3d5f] disabled:opacity-60">
                  {actionLoading === 'view-permissions' ? 'Loading permissions…' : 'Load permissions'}
                </button>
              </div>

              {rolesFetched ? (
                <div className="mt-3 rounded-xl bg-[#f7f9fe] p-3">
                  <p className="text-sm font-semibold text-[#334a72]">Assigned roles</p>
                  {userRolesResult.length ? (
                    <ul className="mt-2 space-y-1 text-sm text-[#2a3d5f]">
                      {userRolesResult.map((role) => <li key={role.id}>{role.name} ({role.code})</li>)}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-[#607594]">No roles assigned for this user.</p>
                  )}
                </div>
              ) : null}

              {permissionsFetched ? (
                <div className="mt-3 rounded-xl bg-[#f7f9fe] p-3">
                  <p className="text-sm font-semibold text-[#334a72]">Effective permissions</p>
                  {userPermissionsResult.length ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {userPermissionsResult.map((permission) => (
                        <span key={permission.id} className="rounded-md border border-[#dde5f3] bg-white px-2 py-0.5 text-xs text-[#2a3d5f]">
                          {formatPermissionLine(permission)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-[#607594]">No permissions found for this user.</p>
                  )}
                </div>
              ) : null}
            </article>
          </div>
        </div>
      ) : null}

      {activeTab === 'roles' ? (
        <div className="space-y-3">
          <article className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#607594]">Role actions</p>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <label className="block space-y-2 text-sm text-[#566b8d]">
                <span>Role</span>
                <select value={selectedRoleId} onChange={(e) => setSelectedRoleId(e.target.value)} className="w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm">
                  <option value="">Choose a role…</option>
                  {roles.map((role) => <option key={role.id} value={role.id}>{role.name} ({role.code})</option>)}
                </select>
              </label>
              <label className="block space-y-2 text-sm text-[#566b8d]">
                <span>Permission</span>
                <select value={selectedPermissionId} onChange={(e) => setSelectedPermissionId(e.target.value)} className="w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm">
                  <option value="">Choose a permission…</option>
                  {permissions.map((permission) => (
                    <option key={permission.id} value={permission.id}>
                      {formatPermissionLine(permission)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" disabled={Boolean(actionLoading) || isReadOnly} onClick={() => {
                if (!selectedRoleId || !selectedPermissionId) return toast.error('Select role and permission first.');
                void runAction(() => assignPermissionToRole(selectedRoleId, selectedPermissionId), 'Permission assigned to role.', 'assign-one-permission');
              }} className="rounded-xl border border-[#1f2d45] bg-[#1f2d45] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {actionLoading === 'assign-one-permission' ? 'Assigning…' : 'Assign permission'}
              </button>
              <button type="button" disabled={Boolean(actionLoading) || isReadOnly} onClick={() => {
                if (!selectedRoleId || !selectedPermissionId) return toast.error('Select role and permission first.');
                void runAction(() => removePermissionFromRole(selectedRoleId, selectedPermissionId), 'Permission removed from role.', 'remove-one-permission');
              }} className="rounded-xl border border-[#e2b9c0] bg-[#fff5f6] px-3 py-2 text-sm font-semibold text-[#b14452] disabled:opacity-60">
                {actionLoading === 'remove-one-permission' ? 'Removing…' : 'Remove permission'}
              </button>
              <button
                type="button"
                disabled={Boolean(actionLoading)}
                onClick={() => void onLoadRoleDetail()}
                className="rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm font-semibold text-[#2a3d5f] disabled:opacity-60"
              >
                {actionLoading === 'load-role-detail' ? 'Loading role…' : 'Load role detail'}
              </button>
            </div>
            {selectedRoleDetail ? (
              <div className="mt-3 rounded-xl bg-[#f7f9fe] p-3">
                <p className="text-sm font-semibold text-[#334a72]">Role detail</p>
                <p className="mt-1 text-sm text-[#607594]">Users assigned: {selectedRoleDetail.user_count}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#607594]">Permissions</p>
                {selectedRoleDetail.permissions.length ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selectedRoleDetail.permissions.map((permission) => (
                      <span key={permission.id} className="rounded-md border border-[#dde5f3] bg-white px-2 py-0.5 text-xs text-[#2a3d5f]">
                        {formatPermissionLine(permission)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-[#607594]">No permissions assigned.</p>
                )}
              </div>
            ) : null}
          </article>

          <article className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#607594]">Bulk assign permissions</p>
            <p className="mt-1 text-sm text-[#607594]">Use keys separated by commas. Example: `dashboard:read,report:read`.</p>
            <input value={bulkPermissionKeys} onChange={(e) => setBulkPermissionKeys(e.target.value)} className="mt-3 w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm" />
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" disabled={Boolean(actionLoading) || isReadOnly} onClick={() => void runAction(() => {
                if (!selectedRoleId) throw new Error('Role is required.');
                const permissionIds = permissionIdsFromKeys(bulkPermissionKeys);
                if (!permissionIds.length) throw new Error('At least one valid permission key is required.');
                return assignPermissionsBulk(selectedRoleId, permissionIds);
              }, 'Permissions assigned in bulk.', 'assign-bulk-permissions')} className="rounded-xl border border-[#1f2d45] bg-[#1f2d45] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {actionLoading === 'assign-bulk-permissions' ? 'Assigning bulk…' : 'Bulk assign'}
              </button>
              <button type="button" disabled={Boolean(actionLoading) || isReadOnly} onClick={() => void runAction(() => {
                if (!selectedRoleId) throw new Error('Role is required.');
                const permissionIds = permissionIdsFromKeys(bulkPermissionKeys);
                if (!permissionIds.length) throw new Error('At least one valid permission key is required.');
                return removePermissionsBulk(selectedRoleId, permissionIds);
              }, 'Permissions removed in bulk.', 'remove-bulk-permissions')} className="rounded-xl border border-[#e2b9c0] bg-[#fff5f6] px-3 py-2 text-sm font-semibold text-[#b14452] disabled:opacity-60">
                {actionLoading === 'remove-bulk-permissions' ? 'Removing bulk…' : 'Bulk remove'}
              </button>
            </div>
          </article>

          <article className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#607594]">Create role & permission</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="space-y-2 rounded-xl border border-[#e4ebf7] bg-[#fafcff] p-3">
                <p className="text-sm font-semibold text-[#334a72]">Create role</p>
                <input value={newRoleCode} onChange={(e) => setNewRoleCode(e.target.value)} placeholder="Role code (e.g. reviewer)" className="w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm" />
                <input value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} placeholder="Role name (e.g. Reviewer)" className="w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm" />
                <input value={newRoleDescription} onChange={(e) => setNewRoleDescription(e.target.value)} placeholder="Short description" className="w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm" />
                <button type="button" disabled={Boolean(actionLoading) || isReadOnly} onClick={() => void onCreateRole()} className="rounded-xl border border-[#1f2d45] bg-[#1f2d45] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
                  {actionLoading === 'create-role' ? 'Creating role…' : 'Create role'}
                </button>
              </div>
              <div className="space-y-2 rounded-xl border border-[#e4ebf7] bg-[#fafcff] p-3">
                <p className="text-sm font-semibold text-[#334a72]">Create permission</p>
                <input value={newPermissionResource} onChange={(e) => setNewPermissionResource(e.target.value)} placeholder="Resource (e.g. report)" className="w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm" />
                <input value={newPermissionAction} onChange={(e) => setNewPermissionAction(e.target.value)} placeholder="Action (e.g. approve)" className="w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm" />
                <input value={newPermissionDescription} onChange={(e) => setNewPermissionDescription(e.target.value)} placeholder="Short description" className="w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm" />
                <button type="button" disabled={Boolean(actionLoading) || isReadOnly} onClick={() => void onCreatePermission()} className="rounded-xl border border-[#1f2d45] bg-[#1f2d45] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
                  {actionLoading === 'create-permission' ? 'Creating permission…' : 'Create permission'}
                </button>
              </div>
            </div>
          </article>

          <details className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm" open>
            <summary className="cursor-pointer text-base font-semibold text-[#243555]">Edit role details</summary>
            <div className="mt-3 space-y-2">
              <p className="rounded-lg bg-[#f7f9fe] px-3 py-2 text-xs text-[#607594]">
                Editing by selected role ID. Available roles:{' '}
                {roles.length ? roles.map((role) => `${role.name} (${role.code})`).join(', ') : 'none loaded'}.
                Name/code rules (including case sensitivity) are validated by backend.
              </p>
              <input value={roleUpdateName} onChange={(e) => setRoleUpdateName(e.target.value)} placeholder="Role name" className="w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm" />
              <input value={roleUpdateDescription} onChange={(e) => setRoleUpdateDescription(e.target.value)} placeholder="Short description" className="w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm" />
              <label className="inline-flex items-center gap-2 text-sm text-[#566b8d]">
                <input type="checkbox" checked={roleUpdateActive} onChange={(e) => setRoleUpdateActive(e.target.checked)} className="h-4 w-4 accent-[#2f7dff]" />
                Role active
              </label>
              <div className="pt-1">
                <button type="button" disabled={Boolean(actionLoading) || isReadOnly} onClick={() => void runAction(() => updateRole(selectedRoleId, {
                  name: roleUpdateName,
                  description: roleUpdateDescription,
                  is_active: roleUpdateActive,
                }), 'Role updated.', 'update-role')} className="rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm font-semibold text-[#2a3d5f] disabled:opacity-60">
                  {actionLoading === 'update-role' ? 'Updating role…' : 'Save changes'}
                </button>
              </div>
            </div>
          </details>
        </div>
      ) : null}

      {activeTab === 'check' ? (
        <div className="space-y-3">
          <article className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#607594]">Permission check</p>
            <p className="mt-1 text-sm text-[#607594]">Leave user unset to check your own session permission.</p>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <select value={targetUserId} onChange={(e) => setTargetUserId(e.target.value)} className="w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm">
                <option value="">My session</option>
                {allUsers.map((user) => <option key={user.id} value={user.id}>{user.email} — {user.role}</option>)}
              </select>
              <select value={selectedCheckPermissionId} onChange={(e) => setSelectedCheckPermissionId(e.target.value)} className="w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm">
                <option value="">Choose a permission…</option>
                {permissions.map((permission) => (
                    <option key={permission.id} value={permission.id}>
                      {formatPermissionLine(permission)}
                    </option>
                  ))}
              </select>
            </div>
            <button type="button" disabled={Boolean(actionLoading)} onClick={() => void onCheckSelectedPermission()} className="mt-3 rounded-xl border border-[#1f2d45] bg-[#1f2d45] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
              {actionLoading === 'check-permission' ? 'Checking…' : 'Run check'}
            </button>
            {permissionCheckResult ? (
              <div className="mt-3">
                <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${permissionCheckResult.allowed ? 'bg-[#e9f8ef] text-[#2f9960]' : 'bg-[#fff3f5] text-[#c43e53]'}`}>
                  {permissionCheckResult.allowed ? 'Allowed' : 'Denied'}
                </span>
                {permissionCheckResult.reason ? <p className="mt-2 text-sm text-[#607594]">{permissionCheckResult.reason}</p> : null}
              </div>
            ) : null}
            <div className="mt-4 border-t border-[#e9eef8] pt-3">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#607594]">Check multiple permissions</p>
              <p className="mt-1 text-xs text-[#607594]">Comma-separated keys. Example: `dashboard:read,report:read`.</p>
              <input
                value={multiPermissionKeys}
                onChange={(e) => setMultiPermissionKeys(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm"
              />
              <button
                type="button"
                disabled={Boolean(actionLoading)}
                onClick={() => void onCheckMultiplePermissions()}
                className="mt-2 rounded-xl border border-[#1f2d45] bg-[#1f2d45] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {actionLoading === 'check-multiple-permissions' ? 'Checking multiple…' : 'Run multi-check'}
              </button>
              {multiPermissionResult ? (
                <div className="mt-3 rounded-xl bg-[#f7f9fe] p-3">
                  {Object.entries(multiPermissionResult).map(([key, allowed]) => {
                    const perm = permissions.find((p) => `${p.resource}:${p.action}` === key);
                    const label = perm ? formatPermissionLine(perm) : key;
                    return (
                      <p key={key} className="text-sm text-[#2a3d5f]">
                        <span className="font-medium">{label}</span>
                        {' — '}
                        <span className={allowed ? 'font-semibold text-[#2f9960]' : 'font-semibold text-[#c43e53]'}>
                          {allowed ? 'Allowed' : 'Denied'}
                        </span>
                      </p>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </article>

          <article className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#607594]">Quick user lookup</p>
            <p className="mt-1 text-sm text-[#607594]">View selected user roles and permissions without editing.</p>
            <select
              value={lookupUserId}
              onChange={(e) => setLookupUserId(e.target.value)}
              className="mt-3 w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm"
            >
              <option value="">Choose a user…</option>
              {allUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.email} — {user.role}
                </option>
              ))}
            </select>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" disabled={Boolean(actionLoading)} onClick={() => void onLookupUserRoles()} className="rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm font-semibold text-[#2a3d5f] disabled:opacity-60">
                {actionLoading === 'view-roles' ? 'Loading roles…' : 'View roles'}
              </button>
              <button type="button" disabled={Boolean(actionLoading)} onClick={() => void onLookupUserPermissions()} className="rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm font-semibold text-[#2a3d5f] disabled:opacity-60">
                {actionLoading === 'view-permissions' ? 'Loading permissions…' : 'View permissions'}
              </button>
            </div>
            {rolesFetched && (
              <div className="mt-3 rounded-xl bg-[#f7f9fe] p-3">
                <p className="text-sm font-semibold text-[#334a72]">Roles</p>
                {userRolesResult.length ? <ul className="mt-2 space-y-1 text-sm text-[#2a3d5f]">{userRolesResult.map((role) => <li key={role.id}>{role.name} ({role.code})</li>)}</ul> : <p className="mt-2 text-sm text-[#607594]">No roles assigned for this user.</p>}
              </div>
            )}
            {permissionsFetched && (
              <div className="mt-3 rounded-xl bg-[#f7f9fe] p-3">
                <p className="text-sm font-semibold text-[#334a72]">Permissions</p>
                {userPermissionsResult.length ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {userPermissionsResult.map((permission) => (
                      <span key={permission.id} className="rounded-md border border-[#dde5f3] bg-white px-2 py-0.5 text-xs text-[#2a3d5f]">
                        {formatPermissionLine(permission)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-[#607594]">No permissions found for this user.</p>
                )}
              </div>
            )}
          </article>
        </div>
      ) : null}
    </section>
  );
}
