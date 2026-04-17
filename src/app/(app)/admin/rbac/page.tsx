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

export default function AdminRbacPage() {
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

  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? null;
  const selectedPermission = permissions.find((permission) => permission.id === selectedPermissionId) ?? null;
  const allUsers = useMemo(
    () => [...users, ...customers.map((customer) => ({ ...customer, role: 'customer' as const }))],
    [users, customers],
  );
  const selectedUser = allUsers.find((user) => user.id === targetUserId) ?? null;

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
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load RBAC data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRbacData();
  }, []);

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
    }, 'User permissions loaded.', 'view-permissions');
  }

  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-[#dbe4f4] bg-white px-5 py-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6f82a3]">RBAC</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1f2d45]">Role & Permission Management</h1>
        <p className="mt-1 text-sm text-[#607594]">Use guided actions below to assign roles/permissions without manual JSON or raw payloads.</p>
      </header>

      <div className="space-y-3">
        <article className="rounded-2xl border border-[#dbe4f4] bg-[#f9fbff] p-4">
          <h2 className="text-lg font-semibold text-[#243555]">Current Selection Context</h2>
          <div className="mt-2 grid gap-2 md:grid-cols-3">
            <p className="rounded-lg border border-[#e3e9f6] bg-white px-3 py-2 text-sm text-[#556b8f]">
              User: <span className="font-semibold text-[#2a3d5f]">{selectedUser ? selectedUser.email : 'Not selected'}</span>
            </p>
            <p className="rounded-lg border border-[#e3e9f6] bg-white px-3 py-2 text-sm text-[#556b8f]">
              Role: <span className="font-semibold text-[#2a3d5f]">{selectedRole ? `${selectedRole.name} (${selectedRole.code})` : 'Not selected'}</span>
            </p>
            <p className="rounded-lg border border-[#e3e9f6] bg-white px-3 py-2 text-sm text-[#556b8f]">
              Permission: <span className="font-semibold text-[#2a3d5f]">{selectedPermission ? `${selectedPermission.resource}:${selectedPermission.action}` : 'Not selected'}</span>
            </p>
          </div>
        </article>

        <article className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-[#243555]">Role Permission Actions</h2>
          <p className="mt-1 text-sm text-[#607594]">Step 1: Select a role and permission. Step 2: Click assign/remove.</p>
          <div className="mt-3 space-y-3">
            <div className="grid gap-2 md:grid-cols-2">
              <label className="block space-y-2 text-sm text-[#566b8d]">
                <span>Role <span className="text-[#c43e53]">*</span></span>
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm"
                >
                  <option value="">Select role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name} ({role.code})
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-2 text-sm text-[#566b8d]">
                <span>Permission <span className="text-[#c43e53]">*</span></span>
                <select
                  value={selectedPermissionId}
                  onChange={(e) => setSelectedPermissionId(e.target.value)}
                  className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm"
                >
                  <option value="">Select permission</option>
                  {permissions.map((permission) => (
                    <option key={permission.id} value={permission.id}>
                      {permission.resource}:{permission.action}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="rounded-xl border border-[#e3e9f6] bg-[#f9fbff] p-3">
              <p className="text-sm font-semibold text-[#334a72]">Assign selected permission to selected role</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" disabled={Boolean(actionLoading)} onClick={() => {
                  if (!selectedRoleId || !selectedPermissionId) {
                    toast.error('Role and Permission are required.');
                    return;
                  }
                  void runAction(() => assignPermissionToRole(selectedRoleId, selectedPermissionId), 'Permission assigned to role.', 'assign-one-permission');
                }} className="rounded-xl border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm font-semibold text-white hover:bg-[#223657] disabled:opacity-60">
                  {actionLoading === 'assign-one-permission' ? 'Assigning…' : 'Assign One'}
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-[#e3e9f6] bg-[#f9fbff] p-3">
              <p className="text-sm font-semibold text-[#334a72]">Remove selected permission from selected role</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" disabled={Boolean(actionLoading)} onClick={() => {
                  if (!selectedRoleId || !selectedPermissionId) {
                    toast.error('Role and Permission are required.');
                    return;
                  }
                  void runAction(() => removePermissionFromRole(selectedRoleId, selectedPermissionId), 'Permission removed from role.', 'remove-one-permission');
                }} className="rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm font-semibold text-[#2a3d5f] disabled:opacity-60">
                  {actionLoading === 'remove-one-permission' ? 'Removing…' : 'Remove One'}
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-[#e3e9f6] bg-[#f9fbff] p-3">
              <p className="text-sm font-semibold text-[#334a72]">Bulk assign permissions by key</p>
              <p className="mt-1 text-xs text-[#607594]">Format: resource:action,resource:action (example: dashboard:read,report:read)</p>
              <input value={bulkPermissionKeys} onChange={(e) => setBulkPermissionKeys(e.target.value)} placeholder="dashboard:read,report:read" className="mt-2 w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm" />
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={Boolean(actionLoading)}
                  onClick={() =>
                    void runAction(
                      () => {
                        if (!selectedRoleId) {
                          throw new Error('Role is required.');
                        }
                        const permissionIds = permissionIdsFromKeys(bulkPermissionKeys);
                        if (!permissionIds.length) {
                          throw new Error('At least one valid permission key is required.');
                        }
                        return assignPermissionsBulk(selectedRoleId, permissionIds);
                      },
                      'Permissions assigned in bulk.',
                      'assign-bulk-permissions',
                    )
                  }
                  className="rounded-xl border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm font-semibold text-white hover:bg-[#223657] disabled:opacity-60"
                >
                  {actionLoading === 'assign-bulk-permissions' ? 'Assigning bulk…' : 'Assign Bulk'}
                </button>
                <button
                  type="button"
                  disabled={Boolean(actionLoading)}
                  onClick={() => void runAction(() => removePermissionFromRole(selectedRoleId, selectedPermissionId), 'Tip: Use single remove for selected permission.', 'remove-selected-permission')}
                  className="rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm font-semibold text-[#2a3d5f] disabled:opacity-60"
                >
                  {actionLoading === 'remove-selected-permission' ? 'Removing…' : 'Remove Selected Permission'}
                </button>
              </div>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-[#243555]">Edit Selected Role</h2>
          <p className="mt-1 text-sm text-[#607594]">Choose a role from the Roles table below, then update its name/description/status here.</p>
          <div className="mt-3 space-y-2">
            <label className="block text-sm text-[#566b8d]">
              Role name
              <input value={roleUpdateName} onChange={(e) => setRoleUpdateName(e.target.value)} placeholder="Role name" className="mt-1 w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm" />
            </label>
            <label className="block text-sm text-[#566b8d]">
              Role description
              <input value={roleUpdateDescription} onChange={(e) => setRoleUpdateDescription(e.target.value)} placeholder="Short description of this role" className="mt-1 w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm" />
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-[#566b8d]">
              <input type="checkbox" checked={roleUpdateActive} onChange={(e) => setRoleUpdateActive(e.target.checked)} className="h-4 w-4 accent-[#2f7dff]" />
              Role active
            </label>
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={Boolean(actionLoading)} onClick={() => void runAction(() => updateRole(selectedRoleId, { name: roleUpdateName, description: roleUpdateDescription, is_active: roleUpdateActive }), 'Role updated.', 'update-role')} className="rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm font-semibold text-[#2a3d5f] disabled:opacity-60">
                {actionLoading === 'update-role' ? 'Updating role…' : 'Update Role'}
              </button>
            </div>
          </div>
        </article>
      </div>

      <div className="space-y-3">
        <article className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-[#243555]">User Picker</h2>
          <p className="mt-1 text-sm text-[#607594]">Select a user once. The rest of actions will use that selected user.</p>
          <div className="mt-3 overflow-x-auto rounded-xl border border-[#e3e9f6]">
            <table className="min-w-full text-sm">
              <thead className="bg-[#f3f6fc] text-[#607594]">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Email</th>
                  <th className="px-4 py-3 text-left font-semibold">Role</th>
                  <th className="px-4 py-3 text-left font-semibold">Active</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.length ? (
                  allUsers.map((user) => (
                    <tr key={user.id} className="border-t border-[#edf2f9]">
                      <td className="px-4 py-3 font-semibold text-[#2a3d5f]">{user.email}</td>
                      <td className="px-4 py-3 text-[#607594]">{user.role}</td>
                      <td className="px-4 py-3 text-[#607594]">{user.is_active ? 'Yes' : 'No'}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setTargetUserId(user.id)}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                            targetUserId === user.id ? 'border-[#2f7dff] bg-[#edf4ff] text-[#2f7dff]' : 'border-[#d4dced] text-[#3e69b0] hover:bg-[#edf4ff]'
                          }`}
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-3 text-[#607594]" colSpan={4}>
                      {loading ? 'Loading...' : 'No users found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-[#243555]">User Role Actions</h2>
          <p className="mt-1 text-sm text-[#607594]">Assign or remove one role from the selected user.</p>
          <div className="mt-3 space-y-2">
            <label className="block space-y-2 text-sm text-[#566b8d]">
              <span>User <span className="text-[#c43e53]">*</span></span>
              <select
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm"
              >
                <option value="">Select user</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.email} ({user.role})
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-2 text-sm text-[#566b8d]">
              <span>Role <span className="text-[#c43e53]">*</span></span>
              <select
                value={targetRoleId}
                onChange={(e) => setTargetRoleId(e.target.value)}
                className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm"
              >
                <option value="">Select role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name} ({role.code})
                  </option>
                ))}
              </select>
            </label>
            <div className="rounded-xl border border-[#e3e9f6] bg-[#f9fbff] p-3">
              <p className="text-sm font-semibold text-[#334a72]">Assign selected role to selected user</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" disabled={Boolean(actionLoading)} onClick={() => {
                  if (!targetUserId || !targetRoleId) {
                    toast.error('User and Role are required.');
                    return;
                  }
                  void runAction(() => assignRoleToUser(targetUserId, targetRoleId), 'Role assigned to user.', 'assign-role');
                }} className="rounded-xl border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm font-semibold text-white hover:bg-[#223657] disabled:opacity-60">
                  {actionLoading === 'assign-role' ? 'Assigning role…' : 'Assign by ID'}
                </button>
              </div>
            </div>
            <div className="rounded-xl border border-[#e3e9f6] bg-[#f9fbff] p-3">
              <p className="text-sm font-semibold text-[#334a72]">Remove selected role from selected user</p>
              <div className="mt-2 flex flex-wrap gap-2">
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
            </div>
            <div className="rounded-xl border border-[#e3e9f6] bg-[#f9fbff] p-3">
              <p className="text-sm font-semibold text-[#334a72]">View selected user access summary</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" disabled={Boolean(actionLoading)} onClick={() => void onLoadUserRoles()} className="rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm font-semibold text-[#2a3d5f] disabled:opacity-60">
                  {actionLoading === 'view-roles' ? 'Loading roles…' : 'View Roles'}
                </button>
                <button type="button" disabled={Boolean(actionLoading)} onClick={() => void onLoadUserPermissions()} className="rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm font-semibold text-[#2a3d5f] disabled:opacity-60">
                  {actionLoading === 'view-permissions' ? 'Loading permissions…' : 'View Permissions'}
                </button>
              </div>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-[#243555]">Permission Checks</h2>
          <p className="mt-1 text-sm text-[#607594]">Pick a permission and user, then run a check. No manual resource/action typing needed.</p>
          <div className="mt-3 space-y-2">
            <select
              value={selectedCheckPermissionId}
              onChange={(e) => setSelectedCheckPermissionId(e.target.value)}
              className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm"
            >
              <option value="">Select permission to check</option>
              {permissions.map((permission) => (
                <option key={permission.id} value={permission.id}>
                  {permission.resource}:{permission.action}
                </option>
              ))}
            </select>
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={Boolean(actionLoading)} onClick={() => void onCheckSelectedPermission()} className="rounded-xl border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm font-semibold text-white hover:bg-[#223657] disabled:opacity-60">
                {actionLoading === 'check-permission' ? 'Checking…' : 'Check Permission'}
              </button>
            </div>
          </div>
        </article>
      </div>

      {permissionCheckResult ? (
        <article className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-[#243555]">Permission Check Result</h2>
          <p className={`mt-2 inline-flex rounded-md px-2 py-1 text-sm font-semibold ${permissionCheckResult.allowed ? 'bg-[#e9f8ef] text-[#2f9960]' : 'bg-[#fff3f5] text-[#c43e53]'}`}>
            {permissionCheckResult.allowed ? 'Allowed' : 'Denied'}
          </p>
          {permissionCheckResult.reason ? <p className="mt-2 text-sm text-[#607594]">{permissionCheckResult.reason}</p> : null}
        </article>
      ) : null}

      {Array.isArray(userRolesResult) && userRolesResult.length ? (
        <article className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-[#243555]">Selected User Roles</h2>
          <ul className="mt-3 space-y-2 text-sm text-[#2a3d5f]">
            {userRolesResult.map((role) => (
              <li key={role.id} className="rounded-lg border border-[#e3e9f6] bg-[#f9fbff] px-3 py-2">
                <span className="font-semibold">{role.name}</span> ({role.code})
              </li>
            ))}
          </ul>
        </article>
      ) : null}

      {Array.isArray(userPermissionsResult) && userPermissionsResult.length ? (
        <article className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-[#243555]">Selected User Permissions</h2>
          <div className="mt-3 overflow-x-auto rounded-xl border border-[#e3e9f6]">
            <table className="min-w-full text-sm">
              <thead className="bg-[#f3f6fc] text-[#607594]">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Resource</th>
                  <th className="px-4 py-3 text-left font-semibold">Action</th>
                  <th className="px-4 py-3 text-left font-semibold">Description</th>
                </tr>
              </thead>
              <tbody>
                {userPermissionsResult.map((permission) => (
                  <tr key={permission.id} className="border-t border-[#edf2f9]">
                    <td className="px-4 py-3 font-semibold text-[#2a3d5f]">{permission.resource}</td>
                    <td className="px-4 py-3 text-[#607594]">{permission.action}</td>
                    <td className="px-4 py-3 text-[#607594]">{permission.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      ) : null}

      <div className="space-y-3">
        <article className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-[#243555]">Permissions</h2>
          <div className="mt-3 overflow-x-auto rounded-xl border border-[#e3e9f6]">
            <table className="min-w-full text-sm">
              <thead className="bg-[#f3f6fc] text-[#607594]">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Resource</th>
                  <th className="px-4 py-3 text-left font-semibold">Action</th>
                  <th className="px-4 py-3 text-left font-semibold">Description</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {permissions.length ? (
                  permissions.map((item) => (
                    <tr key={item.id} className="border-t border-[#edf2f9]">
                      <td className="px-4 py-3 font-semibold text-[#2a3d5f]">{item.resource}</td>
                      <td className="px-4 py-3 text-[#607594]">{item.action}</td>
                      <td className="px-4 py-3 text-[#607594]">{item.description}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setSelectedPermissionId(item.id)}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                            selectedPermissionId === item.id ? 'border-[#2f7dff] bg-[#edf4ff] text-[#2f7dff]' : 'border-[#d4dced] text-[#3e69b0] hover:bg-[#edf4ff]'
                          }`}
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-3 text-[#607594]" colSpan={4}>
                      {loading ? 'Loading...' : 'No permissions found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-[#243555]">Roles</h2>
          <div className="mt-3 overflow-x-auto rounded-xl border border-[#e3e9f6]">
            <table className="min-w-full text-sm">
              <thead className="bg-[#f3f6fc] text-[#607594]">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Code</th>
                  <th className="px-4 py-3 text-left font-semibold">Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Description</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.length ? (
                  roles.map((item) => (
                    <tr key={item.id} className="border-t border-[#edf2f9]">
                      <td className="px-4 py-3 font-semibold text-[#2a3d5f]">{item.code}</td>
                      <td className="px-4 py-3 text-[#607594]">{item.name}</td>
                      <td className="px-4 py-3 text-[#607594]">{item.description}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setSelectedRoleId(item.id)}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                            selectedRoleId === item.id ? 'border-[#2f7dff] bg-[#edf4ff] text-[#2f7dff]' : 'border-[#d4dced] text-[#3e69b0] hover:bg-[#edf4ff]'
                          }`}
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-3 text-[#607594]" colSpan={4}>
                      {loading ? 'Loading...' : 'No roles found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </section>
  );
}
