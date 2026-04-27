'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { listAdminUsers, listCustomers, type AdminManagedUser } from '@/lib/admin-users';
import {
  assignPermissionToRole,
  assignPermissionsBulk,
  assignRoleToUser,
  checkPermission,
  getUserPermissions,
  getUserRoles,
  listPermissions,
  listRoles,
  removePermissionFromRole,
  removeRoleFromUser,
  updateRole,
  type RbacPermission,
  type RbacRole,
} from '@/lib/rbac';
import { useAdminAccess } from '@/lib/admin-access';

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

  useEffect(() => {
    setUserRolesResult([]);
    setUserPermissionsResult([]);
    setPermissionCheckResult(null);
    setRolesFetched(false);
    setPermissionsFetched(false);
  }, [targetUserId]);

  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-[#dbe4f4] bg-white px-5 py-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6f82a3]">RBAC Control Panel</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1f2d45]">Role & Permission Management</h1>
        <p className="mt-1 text-sm text-[#607594]">Pick a user, role, and permission once, then manage access from one place.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <p className="rounded-lg border border-[#e3e9f6] bg-[#f8faff] px-3 py-2 text-xs font-semibold text-[#4a6187]">
            Roles: <span className="text-[#243555]">{roles.length}</span>
          </p>
          <p className="rounded-lg border border-[#e3e9f6] bg-[#f8faff] px-3 py-2 text-xs font-semibold text-[#4a6187]">
            Permissions: <span className="text-[#243555]">{permissions.length}</span>
          </p>
          <p className="rounded-lg border border-[#e3e9f6] bg-[#f8faff] px-3 py-2 text-xs font-semibold text-[#4a6187]">
            Users: <span className="text-[#243555]">{allUsers.length}</span>
          </p>
        </div>
        {isReadOnly ? (
          <p className="mt-3 rounded-lg border border-[#dbe4f4] bg-[#f7f9fe] px-3 py-2 text-xs text-[#5f7395]">
            Auditor mode: view-only RBAC access (permissions, roles, user roles, user permissions).
          </p>
        ) : null}
      </header>

      {isReadOnly ? (
        <div className="grid gap-4 xl:grid-cols-[340px_1fr]">
          <aside className="space-y-3 xl:sticky xl:top-3 xl:self-start">
            <article className="rounded-2xl border border-[#dbe4f4] bg-white p-4 shadow-sm">
              <h2 className="text-base font-semibold text-[#243555]">Auditor Lookup</h2>
              <p className="mt-1 text-xs text-[#607594]">Search and select a user from the list.</p>
              <label className="mt-3 block space-y-1.5 text-xs text-[#566b8d]">
                <span>User search</span>
                <input
                  value={auditorUserSearch}
                  onChange={(e) => setAuditorUserSearch(e.target.value)}
                  disabled={!allUsers.length}
                  placeholder={allUsers.length ? 'Search by email or role' : 'No users available'}
                  className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm disabled:opacity-70"
                />
              </label>
              <div className="mt-2 max-h-44 overflow-y-auto space-y-2 rounded-xl border border-[#e3e9f6] bg-[#f9fbff] p-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {allUsers.length ? (
                  filteredAuditorUsers.length ? (
                    filteredAuditorUsers.map((user) => (
                        <button
                        key={user.id}
                          type="button"
                          onClick={() => setTargetUserId(user.id)}
                        className={`w-full rounded-lg border px-2.5 py-2 text-left ${
                          targetUserId === user.id ? 'border-[#2f7dff] bg-[#edf4ff]' : 'border-[#d4dced] bg-white hover:bg-[#edf4ff]'
                          }`}
                        >
                        <p className="text-sm font-semibold text-[#2a3d5f]">{user.email}</p>
                        <p className="text-xs text-[#607594]">{user.role}</p>
                        </button>
                    ))
                  ) : (
                    <p className="px-2 py-2 text-xs text-[#607594]">No users match your search.</p>
                  )
                ) : (
                  <p className="px-2 py-2 text-xs text-[#607594]">No users available for selection.</p>
                )}
          </div>
              {!allUsers.length && auditorUserListUnavailable ? (
                <p className="mt-2 rounded-lg border border-[#e3e9f6] bg-[#f9fbff] px-3 py-2 text-xs text-[#607594]">
                  Your auditor role does not have access to user listing APIs yet. Dropdown will populate when backend permission is enabled.
                </p>
        ) : null}
              <div className="mt-3 grid gap-2">
                <button type="button" disabled={Boolean(actionLoading)} onClick={() => void onLoadUserRoles()} className="rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm font-semibold text-[#2a3d5f] disabled:opacity-60">
                  {actionLoading === 'view-roles' ? 'Loading roles…' : 'View Roles'}
                </button>
                <button type="button" disabled={Boolean(actionLoading)} onClick={() => void onLoadUserPermissions()} className="rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm font-semibold text-[#2a3d5f] disabled:opacity-60">
                  {actionLoading === 'view-permissions' ? 'Loading permissions…' : 'View Permissions'}
                </button>
            </div>
          </article>

            <article className="rounded-2xl border border-[#e2e8f5] bg-white p-4 shadow-sm">
              <h2 className="text-base font-semibold text-[#243555]">Permission Check</h2>
              <select
                value={selectedCheckPermissionId}
                onChange={(e) => setSelectedCheckPermissionId(e.target.value)}
                className="mt-3 w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm"
              >
                <option value="">Select permission to check</option>
                {permissions.map((permission) => (
                  <option key={permission.id} value={permission.id}>
                    {permission.resource}:{permission.action}
                  </option>
                ))}
              </select>
              <button type="button" disabled={Boolean(actionLoading)} onClick={() => void onCheckSelectedPermission()} className="mt-2 w-full rounded-xl border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm font-semibold text-white hover:bg-[#223657] disabled:opacity-60">
                {actionLoading === 'check-permission' ? 'Checking…' : 'Check Permission'}
              </button>
            </article>
          </aside>

          <div className="space-y-3">
            <article className="rounded-2xl border border-[#dbe4f4] bg-white p-5 shadow-sm">
              <h2 className="text-2xl font-semibold text-[#243555]">Read-Only Access Overview</h2>
              <p className="mt-1 text-sm text-[#607594]">No edit controls in auditor mode. Lookup only.</p>
              <p className="mt-2 rounded-lg border border-[#e3e9f6] bg-[#f9fbff] px-3 py-2 text-sm text-[#556b8f]">
                User: <span className="font-semibold text-[#2a3d5f]">{selectedUser?.email || targetUserId || 'Not selected'}</span>
              </p>
            </article>

            <article className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-[#243555]">Lookup Results</h3>
              {!targetUserId ? (
                <p className="mt-3 rounded-lg border border-[#e3e9f6] bg-[#f9fbff] px-3 py-2 text-sm text-[#607594]">
                  Enter a user ID and click View Roles or View Permissions.
                </p>
              ) : null}

              {Array.isArray(userRolesResult) && userRolesResult.length ? (
                <div className="mt-3 rounded-xl border border-[#e3e9f6] bg-[#f9fbff] p-3">
                  <p className="text-sm font-semibold text-[#334a72]">Loaded Roles</p>
                  <ul className="mt-2 space-y-1 text-sm text-[#2a3d5f]">
                    {userRolesResult.map((role) => (
                      <li key={role.id}>
                        {role.name} ({role.code})
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {rolesFetched && userRolesResult.length === 0 ? (
                <p className="mt-3 rounded-lg border border-[#e3e9f6] bg-[#f9fbff] px-3 py-2 text-sm text-[#607594]">
                  No roles assigned for this user.
                </p>
              ) : null}

              {Array.isArray(userPermissionsResult) && userPermissionsResult.length ? (
                <div className="mt-3 rounded-xl border border-[#e3e9f6] bg-[#f9fbff] p-3">
                  <p className="text-sm font-semibold text-[#334a72]">Loaded Permissions ({userPermissionsResult.length})</p>
                  <div className="mt-2 max-h-44 overflow-y-auto text-sm text-[#2a3d5f]">
                    {userPermissionsResult.map((permission) => (
                      <p key={permission.id}>
                        {permission.resource}:{permission.action}
                      </p>
                    ))}
                  </div>
                </div>
              ) : null}
              {permissionsFetched && userPermissionsResult.length === 0 ? (
                <p className="mt-3 rounded-lg border border-[#e3e9f6] bg-[#f9fbff] px-3 py-2 text-sm text-[#607594]">
                  No permissions found for this user.
                </p>
              ) : null}
            </article>

            {permissionCheckResult ? (
              <article className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-[#243555]">Permission Check Result</h3>
                <p className={`mt-2 inline-flex rounded-md px-2 py-1 text-sm font-semibold ${permissionCheckResult.allowed ? 'bg-[#e9f8ef] text-[#2f9960]' : 'bg-[#fff3f5] text-[#c43e53]'}`}>
                  {permissionCheckResult.allowed ? 'Allowed' : 'Denied'}
                </p>
                {permissionCheckResult.reason ? <p className="mt-2 text-sm text-[#607594]">{permissionCheckResult.reason}</p> : null}
              </article>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[340px_1fr]">
          <aside className="space-y-3 xl:sticky xl:top-3 xl:self-start">
            <article className="rounded-2xl border border-[#dbe4f4] bg-white p-4 shadow-sm">
              <h2 className="text-base font-semibold text-[#243555]">Users</h2>
              <p className="mt-1 text-xs text-[#607594]">Select one user to manage their access.</p>
              <input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by email or role"
                className="mt-3 w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm"
              />
              <div className="mt-3 max-h-[460px] overflow-y-auto space-y-2">
                {filteredUsers.length ? (
                  filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => setTargetUserId(user.id)}
                      className={`w-full rounded-xl border px-3 py-2 text-left ${
                        targetUserId === user.id ? 'border-[#2f7dff] bg-[#edf4ff]' : 'border-[#e3e9f6] bg-white hover:bg-[#f7faff]'
                      }`}
                    >
                      <p className="text-sm font-semibold text-[#2a3d5f]">{user.email}</p>
                      <p className="text-xs text-[#607594]">
                        {user.role} - {user.is_active ? 'Active' : 'Inactive'}
                      </p>
                    </button>
                  ))
                ) : (
                  <p className="rounded-xl border border-[#e3e9f6] bg-[#f9fbff] px-3 py-2 text-sm text-[#607594]">
                    {loading ? 'Loading users...' : 'No users match your search.'}
                  </p>
                )}
              </div>
            </article>
          </aside>

          <div className="space-y-3">
            <article className="rounded-2xl border border-[#dbe4f4] bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6f82a3]">Focused Workspace</p>
              <h2 className="mt-2 text-2xl font-semibold text-[#243555]">
                {selectedUser ? selectedUser.email : 'Select a user from the left panel'}
              </h2>
              <div className="mt-3 grid gap-2 md:grid-cols-3">
                <p className="rounded-lg border border-[#e3e9f6] bg-[#f9fbff] px-3 py-2 text-sm text-[#556b8f]">
                  User status: <span className="font-semibold text-[#2a3d5f]">{selectedUser ? (selectedUser.is_active ? 'Active' : 'Inactive') : 'Not selected'}</span>
                </p>
                <p className="rounded-lg border border-[#e3e9f6] bg-[#f9fbff] px-3 py-2 text-sm text-[#556b8f]">
                  Selected role: <span className="font-semibold text-[#2a3d5f]">{selectedRole ? `${selectedRole.name} (${selectedRole.code})` : 'Not selected'}</span>
                </p>
                <p className="rounded-lg border border-[#e3e9f6] bg-[#f9fbff] px-3 py-2 text-sm text-[#556b8f]">
                  Selected permission: <span className="font-semibold text-[#2a3d5f]">{selectedPermission ? `${selectedPermission.resource}:${selectedPermission.action}` : 'Not selected'}</span>
                </p>
              </div>
            </article>

            <section className="space-y-3 rounded-2xl border border-[#dbe4f4] bg-[#f8faff] p-4">
              <div className="border-b border-[#dce6f7] pb-2">
                <h2 className="text-xl font-semibold text-[#243555]">User Access Actions</h2>
              </div>
              <article className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-[#243555]">Assign / Remove Role</h3>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  <div className="rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2">
                    <p className="text-xs text-[#607594]">Selected user</p>
                    <p className="text-sm font-semibold text-[#2a3d5f]">{selectedUser ? selectedUser.email : 'No user selected'}</p>
                  </div>
            <label className="block space-y-2 text-sm text-[#566b8d]">
                    <span>Role</span>
                    <select value={targetRoleId} onChange={(e) => setTargetRoleId(e.target.value)} className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm">
                <option value="">Select role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name} ({role.code})
                  </option>
                ))}
              </select>
            </label>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" disabled={Boolean(actionLoading)} onClick={() => {
                  if (!targetUserId || !targetRoleId) {
                    toast.error('User and Role are required.');
                    return;
                  }
                  void runAction(() => assignRoleToUser(targetUserId, targetRoleId), 'Role assigned to user.', 'assign-role');
                }} className="rounded-xl border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm font-semibold text-white hover:bg-[#223657] disabled:opacity-60">
                  {actionLoading === 'assign-role' ? 'Assigning role…' : 'Assign by ID'}
                </button>
                <button type="button" disabled={Boolean(actionLoading)} onClick={() => {
                  if (!targetUserId || !targetRoleId) {
                    toast.error('User and Role are required.');
                    return;
                  }
                  void runAction(() => removeRoleFromUser(targetUserId, targetRoleId), 'Role removed from user.', 'remove-role');
                }} className="rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm font-semibold text-[#2a3d5f] disabled:opacity-60">
                  {actionLoading === 'remove-role' ? 'Removing role…' : 'Remove Role'}
                </button>
              </div>
              </article>

              <article className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-[#243555]">View User Access</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" disabled={Boolean(actionLoading)} onClick={() => void onLoadUserRoles()} className="rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm font-semibold text-[#2a3d5f] disabled:opacity-60">
                  {actionLoading === 'view-roles' ? 'Loading roles…' : 'View Roles'}
                </button>
                <button type="button" disabled={Boolean(actionLoading)} onClick={() => void onLoadUserPermissions()} className="rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm font-semibold text-[#2a3d5f] disabled:opacity-60">
                  {actionLoading === 'view-permissions' ? 'Loading permissions…' : 'View Permissions'}
                </button>
              </div>
                {!targetUserId ? (
                  <p className="mt-3 rounded-lg border border-[#e3e9f6] bg-[#f9fbff] px-3 py-2 text-sm text-[#607594]">
                    Select a user from the left panel to view roles and permissions.
                  </p>
                ) : null}

                {Array.isArray(userRolesResult) && userRolesResult.length ? (
                  <div className="mt-3 rounded-xl border border-[#e3e9f6] bg-[#f9fbff] p-3">
                    <p className="text-sm font-semibold text-[#334a72]">Loaded Roles</p>
                    <ul className="mt-2 space-y-1 text-sm text-[#2a3d5f]">
                      {userRolesResult.map((role) => (
                        <li key={role.id}>
                          {role.name} ({role.code})
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {rolesFetched && userRolesResult.length === 0 ? (
                  <p className="mt-3 rounded-lg border border-[#e3e9f6] bg-[#f9fbff] px-3 py-2 text-sm text-[#607594]">
                    No roles assigned for this user.
                  </p>
                ) : null}

                {Array.isArray(userPermissionsResult) && userPermissionsResult.length ? (
                  <div className="mt-3 rounded-xl border border-[#e3e9f6] bg-[#f9fbff] p-3">
                    <p className="text-sm font-semibold text-[#334a72]">Loaded Permissions ({userPermissionsResult.length})</p>
                    <div className="mt-2 max-h-44 overflow-y-auto text-sm text-[#2a3d5f]">
                      {userPermissionsResult.map((permission) => (
                        <p key={permission.id}>
                          {permission.resource}:{permission.action}
                        </p>
                      ))}
            </div>
          </div>
                ) : null}
                {permissionsFetched && userPermissionsResult.length === 0 ? (
                  <p className="mt-3 rounded-lg border border-[#e3e9f6] bg-[#f9fbff] px-3 py-2 text-sm text-[#607594]">
                    No permissions found for this user.
                  </p>
                ) : null}
        </article>

        <article className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-[#243555]">Check Permission</h3>
          <div className="mt-3 space-y-2">
                  <select value={selectedCheckPermissionId} onChange={(e) => setSelectedCheckPermissionId(e.target.value)} className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm">
              <option value="">Select permission to check</option>
              {permissions.map((permission) => (
                <option key={permission.id} value={permission.id}>
                  {permission.resource}:{permission.action}
                </option>
              ))}
            </select>
              <button type="button" disabled={Boolean(actionLoading)} onClick={() => void onCheckSelectedPermission()} className="rounded-xl border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm font-semibold text-white hover:bg-[#223657] disabled:opacity-60">
                {actionLoading === 'check-permission' ? 'Checking…' : 'Check Permission'}
              </button>
            </div>
                {permissionCheckResult ? (
                  <p className={`mt-3 inline-flex rounded-md px-2 py-1 text-sm font-semibold ${permissionCheckResult.allowed ? 'bg-[#e9f8ef] text-[#2f9960]' : 'bg-[#fff3f5] text-[#c43e53]'}`}>
            {permissionCheckResult.allowed ? 'Allowed' : 'Denied'}
          </p>
                ) : null}
        </article>
            </section>

            <details className="rounded-2xl border border-[#dbe4f4] bg-white p-4 shadow-sm">
              <summary className="cursor-pointer text-base font-semibold text-[#243555]">Advanced RBAC Management (roles & permissions)</summary>
              <div className="mt-3 space-y-3">
                <article className="rounded-2xl border border-[#e2e8f5] bg-[#f8faff] p-5">
                  <h3 className="text-lg font-semibold text-[#243555]">Role Permission Actions</h3>
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    <label className="block space-y-2 text-sm text-[#566b8d]">
                      <span>Role</span>
                      <select value={selectedRoleId} onChange={(e) => setSelectedRoleId(e.target.value)} className="w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm">
                        <option value="">Select role</option>
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name} ({role.code})
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block space-y-2 text-sm text-[#566b8d]">
                      <span>Permission</span>
                      <select value={selectedPermissionId} onChange={(e) => setSelectedPermissionId(e.target.value)} className="w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm">
                        <option value="">Select permission</option>
                        {permissions.map((permission) => (
                          <option key={permission.id} value={permission.id}>
                            {permission.resource}:{permission.action}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" disabled={Boolean(actionLoading)} onClick={() => {
                      if (!selectedRoleId || !selectedPermissionId) {
                        toast.error('Role and Permission are required.');
                        return;
                      }
                      void runAction(() => assignPermissionToRole(selectedRoleId, selectedPermissionId), 'Permission assigned to role.', 'assign-one-permission');
                    }} className="rounded-xl border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm font-semibold text-white hover:bg-[#223657] disabled:opacity-60">
                      {actionLoading === 'assign-one-permission' ? 'Assigning…' : 'Assign One'}
                    </button>
                    <button type="button" disabled={Boolean(actionLoading)} onClick={() => {
                      if (!selectedRoleId || !selectedPermissionId) {
                        toast.error('Role and Permission are required.');
                        return;
                      }
                      void runAction(() => removePermissionFromRole(selectedRoleId, selectedPermissionId), 'Permission removed from role.', 'remove-one-permission');
                    }} className="rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm font-semibold text-[#2a3d5f] disabled:opacity-60">
                      {actionLoading === 'remove-one-permission' ? 'Removing…' : 'Remove One'}
                    </button>
                    <button type="button" disabled={Boolean(actionLoading)} onClick={() => void runAction(() => removePermissionFromRole(selectedRoleId, selectedPermissionId), 'Tip: Use single remove for selected permission.', 'remove-selected-permission')} className="rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm font-semibold text-[#2a3d5f] disabled:opacity-60">
                      {actionLoading === 'remove-selected-permission' ? 'Removing…' : 'Remove Selected Permission'}
                    </button>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-[#334a72]">Bulk assign permissions by key</p>
                    <input value={bulkPermissionKeys} onChange={(e) => setBulkPermissionKeys(e.target.value)} placeholder="dashboard:read,report:read" className="mt-2 w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm" />
                    <button type="button" disabled={Boolean(actionLoading)} onClick={() => void runAction(() => {
                      if (!selectedRoleId) {
                        throw new Error('Role is required.');
                      }
                      const permissionIds = permissionIdsFromKeys(bulkPermissionKeys);
                      if (!permissionIds.length) {
                        throw new Error('At least one valid permission key is required.');
                      }
                      return assignPermissionsBulk(selectedRoleId, permissionIds);
                    }, 'Permissions assigned in bulk.', 'assign-bulk-permissions')} className="mt-2 rounded-xl border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm font-semibold text-white hover:bg-[#223657] disabled:opacity-60">
                      {actionLoading === 'assign-bulk-permissions' ? 'Assigning bulk…' : 'Assign Bulk'}
                    </button>
          </div>
        </article>

                <article className="rounded-2xl border border-[#e2e8f5] bg-[#f8faff] p-5">
                  <h3 className="text-lg font-semibold text-[#243555]">Edit Selected Role</h3>
                  <div className="mt-3 space-y-2">
                    <input value={roleUpdateName} onChange={(e) => setRoleUpdateName(e.target.value)} placeholder="Role name" className="w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm" />
                    <input value={roleUpdateDescription} onChange={(e) => setRoleUpdateDescription(e.target.value)} placeholder="Short description of this role" className="w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm" />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="inline-flex items-center gap-2 text-sm text-[#566b8d]">
                        <input type="checkbox" checked={roleUpdateActive} onChange={(e) => setRoleUpdateActive(e.target.checked)} className="h-4 w-4 accent-[#2f7dff]" />
                        Role active
                      </label>
                      <button type="button" disabled={Boolean(actionLoading)} onClick={() => void runAction(() => updateRole(selectedRoleId, { name: roleUpdateName, description: roleUpdateDescription, is_active: roleUpdateActive }), 'Role updated.', 'update-role')} className="rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm font-semibold text-[#2a3d5f] disabled:opacity-60">
                        {actionLoading === 'update-role' ? 'Updating role…' : 'Update Role'}
                        </button>
                    </div>
          </div>
        </article>

                <article className="rounded-2xl border border-[#e2e8f5] bg-white p-5">
                  <h3 className="text-lg font-semibold text-[#243555]">Role & Permission Selection</h3>
                  <p className="mt-1 text-sm text-[#607594]">
                    Use the dropdowns above in this Advanced section as the single source to choose role and permission.
                  </p>
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    <p className="rounded-lg border border-[#e3e9f6] bg-[#f9fbff] px-3 py-2 text-sm text-[#556b8f]">
                      Selected role:{' '}
                      <span className="font-semibold text-[#2a3d5f]">
                        {selectedRole ? `${selectedRole.name} (${selectedRole.code})` : 'Not selected'}
                      </span>
                    </p>
                    <p className="rounded-lg border border-[#e3e9f6] bg-[#f9fbff] px-3 py-2 text-sm text-[#556b8f]">
                      Selected permission:{' '}
                      <span className="font-semibold text-[#2a3d5f]">
                        {selectedPermission ? `${selectedPermission.resource}:${selectedPermission.action}` : 'Not selected'}
                      </span>
                    </p>
          </div>
        </article>
      </div>
            </details>
          </div>
        </div>
      )}
    </section>
  );
}
