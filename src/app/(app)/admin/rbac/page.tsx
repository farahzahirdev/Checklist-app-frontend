'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { listAdminUsers, listCustomers, type AdminManagedUser } from '@/lib/admin-users';
import {
  assignPermissionToRole,
  assignPermissionsBulk,
  assignRoleToUser,
  assignRoleToUserByCode,
  assignRolesBulkToUser,
  checkPermission,
  checkPermissions,
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

export default function AdminRbacPage() {
  const [permissions, setPermissions] = useState<RbacPermission[]>([]);
  const [roles, setRoles] = useState<RbacRole[]>([]);
  const [users, setUsers] = useState<AdminManagedUser[]>([]);
  const [customers, setCustomers] = useState<Array<{ id: string; email: string; is_active: boolean }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [selectedPermissionId, setSelectedPermissionId] = useState('');
  const [bulkPermissionIds, setBulkPermissionIds] = useState('');
  const [roleUpdateName, setRoleUpdateName] = useState('');
  const [roleUpdateDescription, setRoleUpdateDescription] = useState('');
  const [roleUpdateActive, setRoleUpdateActive] = useState(true);
  const [targetUserId, setTargetUserId] = useState('');
  const [targetRoleId, setTargetRoleId] = useState('');
  const [targetRoleCode, setTargetRoleCode] = useState('');
  const [bulkRoleIds, setBulkRoleIds] = useState('');
  const [permissionCheckResource, setPermissionCheckResource] = useState('');
  const [permissionCheckAction, setPermissionCheckAction] = useState('');
  const [multiPermissionInput, setMultiPermissionInput] = useState('dashboard:read,report:read');
  const [queryOutput, setQueryOutput] = useState('');

  async function loadRbacData() {
    setLoading(true);
    setError('');
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
      setError(err instanceof Error ? err.message : 'Failed to load RBAC data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRbacData();
  }, []);

  async function runAction(action: () => Promise<unknown>, successMessage: string) {
    setError('');
    setMessage('');
    setQueryOutput('');
    try {
      await action();
      setMessage(successMessage);
      await loadRbacData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    }
  }

  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-[#dbe4f4] bg-white px-5 py-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6f82a3]">RBAC</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1f2d45]">Role & Permission Management</h1>
        <p className="mt-1 text-sm text-[#607594]">Manage custom roles and permissions for advanced access control.</p>
      </header>

      {error ? <p className="rounded-lg bg-[#ffedf0] px-3 py-2 text-sm text-[#cc5163]">{error}</p> : null}
      {message ? <p className="rounded-lg bg-[#e9f8ef] px-3 py-2 text-sm text-[#2f9960]">{message}</p> : null}

      <div className="space-y-3">
        <article className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-[#243555]">Role Permission Actions</h2>
          <div className="mt-3 space-y-2">
            <input value={selectedRoleId} onChange={(e) => setSelectedRoleId(e.target.value)} placeholder="Role ID" className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm" />
            <input value={selectedPermissionId} onChange={(e) => setSelectedPermissionId(e.target.value)} placeholder="Permission ID" className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm" />
            <input value={bulkPermissionIds} onChange={(e) => setBulkPermissionIds(e.target.value)} placeholder="Bulk permission IDs comma-separated" className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm" />
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => void runAction(() => assignPermissionToRole(selectedRoleId, selectedPermissionId), 'Permission assigned to role.')} className="rounded-xl border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm font-semibold text-white hover:bg-[#223657]">Assign One</button>
              <button type="button" onClick={() => void runAction(() => assignPermissionsBulk(selectedRoleId, bulkPermissionIds.split(',').map((x) => x.trim()).filter(Boolean)), 'Permissions assigned in bulk.')} className="rounded-xl border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm font-semibold text-white hover:bg-[#223657]">Assign Bulk</button>
              <button type="button" onClick={() => void runAction(() => removePermissionFromRole(selectedRoleId, selectedPermissionId), 'Permission removed from role.')} className="rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm font-semibold text-[#2a3d5f]">Remove One</button>
              <button type="button" onClick={() => void runAction(() => removePermissionsBulk(selectedRoleId, bulkPermissionIds.split(',').map((x) => x.trim()).filter(Boolean)), 'Permissions removed in bulk.')} className="rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm font-semibold text-[#2a3d5f]">Remove Bulk</button>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-[#243555]">Role Details & Update</h2>
          <div className="mt-3 space-y-2">
            <input value={roleUpdateName} onChange={(e) => setRoleUpdateName(e.target.value)} placeholder="Updated role name" className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm" />
            <input value={roleUpdateDescription} onChange={(e) => setRoleUpdateDescription(e.target.value)} placeholder="Updated role description" className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm" />
            <label className="inline-flex items-center gap-2 text-sm text-[#566b8d]">
              <input type="checkbox" checked={roleUpdateActive} onChange={(e) => setRoleUpdateActive(e.target.checked)} className="h-4 w-4 accent-[#2f7dff]" />
              Role active
            </label>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => void runAction(async () => { const role = await getRole(selectedRoleId); setQueryOutput(JSON.stringify(role, null, 2)); }, 'Role detail fetched.')} className="rounded-xl border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm font-semibold text-white hover:bg-[#223657]">Get Role</button>
              <button type="button" onClick={() => void runAction(() => updateRole(selectedRoleId, { name: roleUpdateName, description: roleUpdateDescription, is_active: roleUpdateActive }), 'Role updated.')} className="rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm font-semibold text-[#2a3d5f]">Update Role</button>
            </div>
          </div>
        </article>
      </div>

      <div className="space-y-3">
        <article className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-[#243555]">User Picker</h2>
          <p className="mt-1 text-sm text-[#607594]">Select a user here to auto-fill User ID for role actions and permission checks.</p>
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
                {[...users, ...customers.map((customer) => ({ ...customer, role: 'customer' }))].length ? (
                  [...users, ...customers.map((customer) => ({ ...customer, role: 'customer' as const }))].map((user) => (
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
          <div className="mt-3 space-y-2">
            <input value={targetUserId} onChange={(e) => setTargetUserId(e.target.value)} placeholder="User ID" className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm" />
            <input value={targetRoleId} onChange={(e) => setTargetRoleId(e.target.value)} placeholder="Role ID" className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm" />
            <input value={targetRoleCode} onChange={(e) => setTargetRoleCode(e.target.value)} placeholder="Role code (admin/auditor/customer)" className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm" />
            <input value={bulkRoleIds} onChange={(e) => setBulkRoleIds(e.target.value)} placeholder="Bulk role IDs comma-separated" className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm" />
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => void runAction(() => assignRoleToUser(targetUserId, targetRoleId), 'Role assigned to user.')} className="rounded-xl border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm font-semibold text-white hover:bg-[#223657]">Assign by ID</button>
              <button type="button" onClick={() => void runAction(() => assignRoleToUserByCode(targetUserId, targetRoleCode), 'Role assigned by code.')} className="rounded-xl border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm font-semibold text-white hover:bg-[#223657]">Assign by Code</button>
              <button type="button" onClick={() => void runAction(() => assignRolesBulkToUser(targetUserId, bulkRoleIds.split(',').map((x) => x.trim()).filter(Boolean)), 'Roles assigned in bulk.')} className="rounded-xl border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm font-semibold text-white hover:bg-[#223657]">Assign Bulk</button>
              <button type="button" onClick={() => void runAction(() => removeRoleFromUser(targetUserId, targetRoleId), 'Role removed from user.')} className="rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm font-semibold text-[#2a3d5f]">Remove Role</button>
              <button type="button" onClick={() => void runAction(async () => { const data = await getUserRoles(targetUserId); setQueryOutput(JSON.stringify(data, null, 2)); }, 'User roles fetched.')} className="rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm font-semibold text-[#2a3d5f]">Get User Roles</button>
              <button type="button" onClick={() => void runAction(async () => { const data = await getUserPermissions(targetUserId); setQueryOutput(JSON.stringify(data, null, 2)); }, 'User permissions fetched.')} className="rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm font-semibold text-[#2a3d5f]">Get User Permissions</button>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-[#243555]">Permission Checks</h2>
          <div className="mt-3 space-y-2">
            <input value={permissionCheckResource} onChange={(e) => setPermissionCheckResource(e.target.value)} placeholder="resource" className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm" />
            <input value={permissionCheckAction} onChange={(e) => setPermissionCheckAction(e.target.value)} placeholder="action" className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm" />
            <input value={multiPermissionInput} onChange={(e) => setMultiPermissionInput(e.target.value)} placeholder="dashboard:read,report:read" className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm" />
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => void runAction(async () => { const data = await checkPermission({ resource: permissionCheckResource, action: permissionCheckAction, user_id: targetUserId || undefined }); setQueryOutput(JSON.stringify(data, null, 2)); }, 'Single permission checked.')} className="rounded-xl border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm font-semibold text-white hover:bg-[#223657]">Check One</button>
              <button type="button" onClick={() => void runAction(async () => { const list = multiPermissionInput.split(',').map((entry) => entry.trim()).filter(Boolean).map((entry) => entry.split(':')).filter((parts): parts is [string, string] => parts.length === 2); const data = await checkPermissions(list, targetUserId || undefined); setQueryOutput(JSON.stringify(data, null, 2)); }, 'Multiple permissions checked.')} className="rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm font-semibold text-[#2a3d5f]">Check Multiple</button>
            </div>
          </div>
        </article>
      </div>

      {queryOutput ? (
        <article className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-[#243555]">Query Output</h2>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-[#0d1d3a] p-3 text-xs text-[#d8e2f2]">{queryOutput}</pre>
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
