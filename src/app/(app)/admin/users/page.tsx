'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  activateCustomer,
  assignPermissionsToUser,
  changeAdminUserRole,
  deactivateCustomer,
  endAdminRoleSwitch,
  getAdminUser,
  getCustomer,
  listAdminUsers,
  listCustomers,
  resetUserPermissions,
  switchAdminRole,
  viewCustomerDashboardAsAdmin,
  type AdminCustomer,
  type AdminCustomerDetail,
  type AdminManagedUser,
  type AdminUserDetail,
} from '@/lib/admin-users';
import { useAdminAccess } from '@/lib/admin-access';
import { beginRoleSwitchSession, clearRoleSwitchSession } from '@/lib/auth';

export default function AdminUsersPage() {
  const router = useRouter();
  const { isReadOnly } = useAdminAccess();
  const [users, setUsers] = useState<AdminManagedUser[]>([]);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedUserDetail, setSelectedUserDetail] = useState<AdminUserDetail | null>(null);
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState<AdminCustomerDetail | null>(null);
  const [customerDashboardData, setCustomerDashboardData] = useState<Record<string, unknown> | null>(null);
  const [newRoleCode, setNewRoleCode] = useState<'admin' | 'auditor'>('auditor');
  const [roleReason, setRoleReason] = useState('Role update requested by admin');
  const [permissionsInput, setPermissionsInput] = useState('dashboard:read,report:read');
  const [switchRole, setSwitchRole] = useState<'customer' | 'auditor'>('customer');
  const [switchReason, setSwitchReason] = useState('Testing flow');
  const [switchDuration, setSwitchDuration] = useState(30);
  const [customerReason, setCustomerReason] = useState('Support action');
  const [isPermanentDeactivation, setIsPermanentDeactivation] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'admin' | 'auditor'>('all');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerActiveFilter, setCustomerActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<
    | ''
    | 'load-user'
    | 'change-role'
    | 'assign-permissions'
    | 'reset-permissions'
    | 'load-customer'
    | 'deactivate-customer'
    | 'activate-customer'
    | 'view-customer-dashboard'
    | 'switch-role'
    | 'end-switch'
  >('');
  const [activeTab, setActiveTab] = useState<'users' | 'customers' | 'roleswitch'>('users');

  const dashboardRecentAssessments = Array.isArray(customerDashboardData?.recent_assessments)
    ? (customerDashboardData.recent_assessments as Array<Record<string, unknown>>)
    : [];
  const dashboardAvailableChecklists = Array.isArray(customerDashboardData?.available_checklists)
    ? (customerDashboardData.available_checklists as Array<Record<string, unknown>>)
    : [];
  const dashboardPaymentStatus =
    customerDashboardData && typeof customerDashboardData.payment_status === 'string'
      ? customerDashboardData.payment_status
      : null;

  async function loadLists() {
    try {
      const [usersResponse, customersResponse] = await Promise.all([
        listAdminUsers({
          search: userSearchQuery.trim() || undefined,
          role: userRoleFilter === 'all' ? undefined : userRoleFilter,
          sort_by: 'updated_at',
          sort_order: 'desc',
        }),
        listCustomers({
          search: customerSearchQuery.trim() || undefined,
          is_active: customerActiveFilter === 'all' ? undefined : customerActiveFilter === 'active',
          sort_by: 'updated_at',
          sort_order: 'desc',
        }),
      ]);
      setUsers(usersResponse.users);
      setCustomers(customersResponse.customers);
    } catch (err) {
      if (isReadOnly) {
        return;
      }
      toast.error(err instanceof Error ? err.message : 'Failed to load users.');
    }
  }

  useEffect(() => {
    if (isReadOnly) {
      return;
    }
    void loadLists();
  }, [isReadOnly, userSearchQuery, userRoleFilter, customerSearchQuery, customerActiveFilter]);

  if (isReadOnly) {
    return (
      <section className="space-y-4">
        <header className="rounded-2xl border border-[#dbe4f4] bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6f82a3]">Users</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1f2d45]">Users & Role Assignment</h1>
          <p className="mt-2 text-sm text-[#607594]">Only admins can manage users.</p>
        </header>
      </section>
    );
  }

  async function onLoadUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedUserId.trim()) {
      toast.error('Select a user first.');
      return;
    }
    setActionLoading('load-user');
    setLoading(true);
    try {
      const detail = await getAdminUser(selectedUserId);
      setSelectedUserDetail(detail);
      toast.success('User details loaded.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load user.');
    } finally {
      setActionLoading('');
      setLoading(false);
    }
  }

  async function onChangeRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedUserId.trim()) {
      toast.error('User ID is required.');
      return;
    }
    if (!roleReason.trim()) {
      toast.error('Reason is required.');
      return;
    }

    setActionLoading('change-role');
    setLoading(true);
    try {
      const updated = await changeAdminUserRole(selectedUserId, { new_role_code: newRoleCode, reason: roleReason });
      toast.success(`Role changed for ${updated.email} to ${updated.role}.`);
      setSelectedUserDetail(null);
      await loadLists();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to change role.');
    } finally {
      setActionLoading('');
      setLoading(false);
    }
  }

  async function onAssignPermissions(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedUserId.trim()) {
      toast.error('User ID is required.');
      return;
    }
    const parsedPermissions = permissionsInput
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => item.split(':'))
      .filter((parts): parts is [string, string] => parts.length === 2 && Boolean(parts[0]) && Boolean(parts[1]));

    if (!parsedPermissions.length) {
      toast.error('Use format resource:action,resource:action');
      return;
    }
    setActionLoading('assign-permissions');
    setLoading(true);
    try {
      await assignPermissionsToUser(selectedUserId, parsedPermissions);
      toast.success('Custom permissions assigned.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to assign permissions.');
    } finally {
      setActionLoading('');
      setLoading(false);
    }
  }

  async function onResetPermissions() {
    if (!selectedUserId.trim()) {
      toast.error('User ID is required.');
      return;
    }
    setActionLoading('reset-permissions');
    setLoading(true);
    try {
      await resetUserPermissions(selectedUserId);
      toast.success('Permissions reset to role defaults.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reset permissions.');
    } finally {
      setActionLoading('');
      setLoading(false);
    }
  }

  async function onLoadCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCustomerDashboardData(null);
    if (!selectedCustomerId.trim()) {
      toast.error('Select a customer first.');
      return;
    }
    setActionLoading('load-customer');
    setLoading(true);
    try {
      const detail = await getCustomer(selectedCustomerId);
      setSelectedCustomerDetail(detail);
      toast.success('Customer details loaded.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load customer.');
    } finally {
      setActionLoading('');
      setLoading(false);
    }
  }

  async function onDeactivateCustomer() {
    if (!selectedCustomerId.trim()) {
      toast.error('Customer ID is required.');
      return;
    }
    if (!customerReason.trim()) {
      toast.error('Reason is required.');
      return;
    }
    setActionLoading('deactivate-customer');
    setLoading(true);
    try {
      await deactivateCustomer(selectedCustomerId, { reason: customerReason, permanent: isPermanentDeactivation });
      toast.success('Customer deactivated.');
      await loadLists();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to deactivate customer.');
    } finally {
      setActionLoading('');
      setLoading(false);
    }
  }

  async function onActivateCustomer() {
    if (!selectedCustomerId.trim()) {
      toast.error('Customer ID is required.');
      return;
    }
    if (!customerReason.trim()) {
      toast.error('Reason is required.');
      return;
    }
    setActionLoading('activate-customer');
    setLoading(true);
    try {
      await activateCustomer(selectedCustomerId, { reason: customerReason });
      toast.success('Customer activated.');
      await loadLists();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to activate customer.');
    } finally {
      setActionLoading('');
      setLoading(false);
    }
  }

  async function onViewCustomerDashboard() {
    if (!selectedCustomerId.trim()) {
      toast.error('Customer ID is required.');
      return;
    }
    if (!customerReason.trim()) {
      toast.error('Reason is required.');
      return;
    }
    setActionLoading('view-customer-dashboard');
    setLoading(true);
    try {
      const dashboardData = await viewCustomerDashboardAsAdmin(selectedCustomerId, customerReason);
      setCustomerDashboardData(dashboardData);
      toast.success('Customer dashboard data loaded for admin review.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to view customer dashboard.');
    } finally {
      setActionLoading('');
      setLoading(false);
    }
  }

  async function onSwitchRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!switchReason.trim()) {
      toast.error('Reason is required.');
      return;
    }
    if (!Number.isInteger(switchDuration) || switchDuration < 1) {
      toast.error('Duration minutes must be an integer greater than 0.');
      return;
    }
    setActionLoading('switch-role');
    setLoading(true);
    try {
      const response = await switchAdminRole({
        switch_to_role: switchRole,
        reason: switchReason,
        duration_minutes: switchDuration,
      });
      if (response.temporary_token) {
        beginRoleSwitchSession(response.temporary_token);
      }
      toast.success(`Switched to ${response.switched_to_role} until ${new Date(response.expires_at).toLocaleString()}.`);
      const switchedRole = response.switched_to_role.toLowerCase();
      if (switchedRole === 'customer') {
        router.push('/dashboard');
      } else if (switchedRole === 'auditor') {
        router.push('/admin');
      } else {
        router.push('/admin');
      }
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to switch role.');
    } finally {
      setActionLoading('');
      setLoading(false);
    }
  }

  async function onEndRoleSwitch() {
    setActionLoading('end-switch');
    setLoading(true);
    try {
      await endAdminRoleSwitch();
      clearRoleSwitchSession();
      toast.success('Returned to original admin role.');
      router.push('/admin');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to end role switch.');
    } finally {
      setActionLoading('');
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-[#dbe4f4] bg-white px-5 py-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6f82a3]">Admin panel</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#1f2d45]">Users & Role Assignment</h1>
        <p className="mt-1 text-sm text-[#607594]">Manage admin users, customer accounts, and test role switching.</p>
      </header>

      <div className="flex gap-1 border-b border-[#dbe4f4]">
        {[
          { key: 'users', label: 'Admin users' },
          { key: 'customers', label: 'Customers' },
          { key: 'roleswitch', label: 'Role switch' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as 'users' | 'customers' | 'roleswitch')}
            className={`border-b-2 px-4 py-2 text-sm transition ${
              activeTab === tab.key
                ? 'border-[#1f2d45] text-[#1f2d45] font-medium'
                : 'border-transparent text-[#607594] hover:text-[#1f2d45]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'users' ? (
        <>
          <div className="flex flex-wrap gap-2">
            {['Select a user below', 'Load their details', 'Change role or permissions'].map((step, index) => (
              <span key={step} className="inline-flex items-center gap-1.5 rounded-full bg-[#f3f6fc] px-2.5 py-1 text-xs text-[#607594]">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#607594] text-[10px] text-white">{index + 1}</span>
                {step}
              </span>
            ))}
          </div>

          <article className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-[#243555]">Admin & auditor users</h2>
            <p className="mt-1 text-sm text-[#607594]">Click Select next to a user to use them in the forms below.</p>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <input
                type="text"
                value={userSearchQuery}
                onChange={(event) => setUserSearchQuery(event.target.value)}
                placeholder="Search users by email or role"
                className="w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm text-[#2a3d5f] outline-none focus:border-[#7ea6e7]"
              />
              <select
                value={userRoleFilter}
                onChange={(event) => setUserRoleFilter(event.target.value as 'all' | 'admin' | 'auditor')}
                className="w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm text-[#2a3d5f] outline-none focus:border-[#7ea6e7]"
              >
                <option value="all">All roles</option>
                <option value="admin">Admin only</option>
                <option value="auditor">Auditor only</option>
              </select>
            </div>
            <div className="mt-3 overflow-x-auto rounded-xl border border-[#e3e9f6]">
              <table className="min-w-full text-sm">
                <thead className="bg-[#f8faff] text-[#607594]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold" />
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className={`border-t border-[#edf2f9] ${selectedUserId === user.id ? 'bg-[#f5f9ff]' : ''}`}>
                      <td className="px-4 py-3 font-medium text-[#2a3d5f]">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-[#f1f4fa] px-2 py-0.5 text-xs text-[#607594]">{user.role}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs ${user.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setSelectedUserId(user.id)}
                          className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${
                            selectedUserId === user.id ? 'border-[#2f7dff] bg-[#edf4ff] text-[#2f7dff]' : 'border-[#d4dced] text-[#3e69b0] hover:bg-[#edf4ff]'
                          }`}
                        >
                          {selectedUserId === user.id ? 'Selected' : 'Select'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-semibold text-[#243555]">User details</h2>
              <p className="mt-1 text-sm text-[#607594]">Load current role and permissions before making any changes.</p>
            </div>
            <form onSubmit={onLoadUser} className="space-y-3">
              <label className="block space-y-2 text-sm">
                <span className="font-medium text-[#566b8d]">Selected user ID</span>
                <input
                  type="text"
                  value={selectedUserId}
                  onChange={(event) => setSelectedUserId(event.target.value)}
                  placeholder="Select from table above, or paste UUID"
                  className="w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-[#2a3d5f] outline-none focus:border-[#7ea6e7]"
                />
              </label>
              <button type="submit" disabled={loading} className="rounded-xl border border-[#1f2d45] bg-[#1f2d45] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
                {actionLoading === 'load-user' ? 'Loading user…' : 'Load user'}
              </button>
            </form>

            {selectedUserDetail ? (
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg bg-[#f7f9fe] px-3 py-2"><p className="text-[11px] uppercase text-[#607594]">Email</p><p className="text-sm font-medium text-[#243555]">{selectedUserDetail.email}</p></div>
                <div className="rounded-lg bg-[#f7f9fe] px-3 py-2"><p className="text-[11px] uppercase text-[#607594]">Role</p><p className="text-sm font-medium text-[#243555]">{selectedUserDetail.role}</p></div>
                <div className="rounded-lg bg-[#f7f9fe] px-3 py-2 sm:col-span-2">
                  <p className="text-[11px] uppercase text-[#607594]">Permissions</p>
                  <p className="text-sm text-[#243555]">{selectedUserDetail.permissions.map((item) => `${item.resource}:${item.action}`).join(', ') || 'None'}</p>
                </div>
              </div>
            ) : null}

            <hr className="border-[#e6edf8]" />

            <form onSubmit={onChangeRole} className="space-y-3">
              <h3 className="text-base font-semibold text-[#243555]">Change role</h3>
              <label className="block space-y-2 text-sm">
                <span className="font-medium text-[#566b8d]">New role</span>
                <select
                  value={newRoleCode}
                  onChange={(event) => setNewRoleCode(event.target.value as 'admin' | 'auditor')}
                  className="w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-[#2a3d5f] outline-none focus:border-[#7ea6e7]"
                >
                  <option value="auditor">auditor</option>
                  <option value="admin">admin</option>
                </select>
              </label>
              <label className="block space-y-2 text-sm">
                <span className="font-medium text-[#566b8d]">Reason <span className="text-[#c43e53]">*</span></span>
                <input type="text" value={roleReason} onChange={(event) => setRoleReason(event.target.value)} className="w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-[#2a3d5f] outline-none focus:border-[#7ea6e7]" />
              </label>
              <button type="submit" disabled={loading} className="rounded-xl border border-[#1f2d45] bg-[#1f2d45] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
                {actionLoading === 'change-role' ? 'Changing role…' : 'Save role change'}
              </button>
            </form>

            <hr className="border-[#e6edf8]" />

            <form onSubmit={onAssignPermissions} className="space-y-3">
              <h3 className="text-base font-semibold text-[#243555]">
                Custom permissions
                <span className="ml-2 rounded-full bg-[#eaf2ff] px-2 py-0.5 text-xs font-medium text-[#3e69b0]">Auditors only</span>
              </h3>
              <p className="text-xs text-[#607594]">Use `resource:action` format, comma-separated. Example: `dashboard:read,report:read`.</p>
              <label className="block space-y-2 text-sm">
                <span className="font-medium text-[#566b8d]">Permissions</span>
                <input
                  type="text"
                  value={permissionsInput}
                  onChange={(event) => setPermissionsInput(event.target.value)}
                  placeholder="dashboard:read,report:read"
                  className="w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-[#2a3d5f] outline-none focus:border-[#7ea6e7]"
                />
              </label>
              <div className="flex gap-2">
                <button type="submit" disabled={loading} className="rounded-xl border border-[#1f2d45] bg-[#1f2d45] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
                  {actionLoading === 'assign-permissions' ? 'Assigning…' : 'Assign permissions'}
                </button>
                <button type="button" onClick={() => void onResetPermissions()} disabled={loading} className="rounded-xl border border-[#d4dced] bg-white px-4 py-2 text-sm font-semibold text-[#2a3d5f] disabled:opacity-60">
                  {actionLoading === 'reset-permissions' ? 'Resetting…' : 'Reset to defaults'}
                </button>
              </div>
            </form>
          </article>
        </>
      ) : null}

      {activeTab === 'customers' ? (
        <>
          <div className="flex flex-wrap gap-2">
            {['Select a customer', 'Load details', 'Take action with a reason'].map((step, index) => (
              <span key={step} className="inline-flex items-center gap-1.5 rounded-full bg-[#f3f6fc] px-2.5 py-1 text-xs text-[#607594]">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#607594] text-[10px] text-white">{index + 1}</span>
                {step}
              </span>
            ))}
          </div>

          <article className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-[#243555]">Customer accounts</h2>
            <p className="mt-1 text-sm text-[#607594]">Select a customer to manage account status or preview dashboard data.</p>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <input
                type="text"
                value={customerSearchQuery}
                onChange={(event) => setCustomerSearchQuery(event.target.value)}
                placeholder="Search customers by email"
                className="w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm text-[#2a3d5f] outline-none focus:border-[#7ea6e7]"
              />
              <select
                value={customerActiveFilter}
                onChange={(event) => setCustomerActiveFilter(event.target.value as 'all' | 'active' | 'inactive')}
                className="w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm text-[#2a3d5f] outline-none focus:border-[#7ea6e7]"
              >
                <option value="all">All statuses</option>
                <option value="active">Active only</option>
                <option value="inactive">Inactive only</option>
              </select>
            </div>
            <div className="mt-3 overflow-x-auto rounded-xl border border-[#e3e9f6]">
              <table className="min-w-full text-sm">
                <thead className="bg-[#f8faff] text-[#607594]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold" />
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id} className={`border-t border-[#edf2f9] ${selectedCustomerId === customer.id ? 'bg-[#f5f9ff]' : ''}`}>
                      <td className="px-4 py-3 font-medium text-[#2a3d5f]">{customer.email}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs ${customer.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                          {customer.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setSelectedCustomerId(customer.id)}
                          className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${
                            selectedCustomerId === customer.id ? 'border-[#2f7dff] bg-[#edf4ff] text-[#2f7dff]' : 'border-[#d4dced] text-[#3e69b0] hover:bg-[#edf4ff]'
                          }`}
                        >
                          {selectedCustomerId === customer.id ? 'Selected' : 'Select'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-[#243555]">Customer details</h2>
            <form onSubmit={onLoadCustomer} className="space-y-3">
              <label className="block space-y-2 text-sm">
                <span className="font-medium text-[#566b8d]">Selected customer ID</span>
                <input
                  type="text"
                  value={selectedCustomerId}
                  onChange={(event) => setSelectedCustomerId(event.target.value)}
                  placeholder="Select from table above, or paste UUID"
                  className="w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-[#2a3d5f] outline-none focus:border-[#7ea6e7]"
                />
              </label>
              <button type="submit" disabled={loading} className="rounded-xl border border-[#1f2d45] bg-[#1f2d45] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
                {actionLoading === 'load-customer' ? 'Loading customer…' : 'Load customer'}
              </button>
            </form>

            {selectedCustomerDetail ? (
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg bg-[#f7f9fe] px-3 py-2"><p className="text-[11px] uppercase text-[#607594]">Email</p><p className="text-sm font-medium text-[#243555]">{selectedCustomerDetail.email}</p></div>
                <div className="rounded-lg bg-[#f7f9fe] px-3 py-2 sm:col-span-2"><p className="text-[11px] uppercase text-[#607594]">Permissions</p><p className="text-sm text-[#243555]">{selectedCustomerDetail.permissions.map((item) => `${item.resource}:${item.action}`).join(', ') || 'None'}</p></div>
              </div>
            ) : null}

            <hr className="border-[#e6edf8]" />

            <div className="space-y-3">
              <h3 className="text-base font-semibold text-[#243555]">Account actions</h3>
              <label className="block space-y-2 text-sm">
                <span className="font-medium text-[#566b8d]">Reason <span className="text-[#c43e53]">*</span></span>
                <input type="text" value={customerReason} onChange={(event) => setCustomerReason(event.target.value)} className="w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-[#2a3d5f] outline-none focus:border-[#7ea6e7]" />
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-[#566b8d]">
                <input type="checkbox" checked={isPermanentDeactivation} onChange={(event) => setIsPermanentDeactivation(event.target.checked)} className="h-4 w-4 accent-[#c43e53]" />
                Permanent deactivation (cannot be undone)
              </label>
              <div className="flex gap-2 flex-wrap">
                <button type="button" onClick={() => void onActivateCustomer()} disabled={loading} className="rounded-xl border border-[#d4dced] bg-white px-4 py-2 text-sm font-semibold text-[#2a3d5f] disabled:opacity-60">
                  {actionLoading === 'activate-customer' ? 'Activating…' : 'Activate'}
                </button>
                <button type="button" onClick={() => void onDeactivateCustomer()} disabled={loading} className="rounded-xl border border-[#f1c6cd] bg-[#fff1f3] px-4 py-2 text-sm font-semibold text-[#a73a46] disabled:opacity-60">
                  {actionLoading === 'deactivate-customer' ? 'Deactivating…' : 'Deactivate'}
                </button>
                <button type="button" onClick={() => void onViewCustomerDashboard()} disabled={loading} className="rounded-xl border border-[#d4dced] bg-white px-4 py-2 text-sm font-semibold text-[#2a3d5f] disabled:opacity-60">
                  {actionLoading === 'view-customer-dashboard' ? 'Loading dashboard…' : 'Preview dashboard'}
                </button>
              </div>
            </div>

            {customerDashboardData ? (
              <article className="rounded-xl border border-[#e3e9f6] bg-[#f9fbff] p-3">
                <h3 className="text-sm font-semibold text-[#243555]">Dashboard preview</h3>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  <div className="rounded-lg border border-[#e3e9f6] bg-white p-3"><p className="text-xs uppercase text-[#6f82a3]">Payment</p><p className="mt-1 text-sm font-semibold text-[#243555]">{dashboardPaymentStatus ?? 'Not available'}</p></div>
                  <div className="rounded-lg border border-[#e3e9f6] bg-white p-3"><p className="text-xs uppercase text-[#6f82a3]">Assessments</p><p className="mt-1 text-sm font-semibold text-[#243555]">{dashboardRecentAssessments.length}</p></div>
                  <div className="rounded-lg border border-[#e3e9f6] bg-white p-3"><p className="text-xs uppercase text-[#6f82a3]">Checklists</p><p className="mt-1 text-sm font-semibold text-[#243555]">{dashboardAvailableChecklists.length}</p></div>
                </div>
                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                  <div className="rounded-lg border border-[#e3e9f6] bg-white p-3">
                    <p className="text-sm font-semibold text-[#243555]">Recent assessments</p>
                    {dashboardRecentAssessments.length ? (
                      <div className="mt-2 overflow-x-auto">
                        <table className="min-w-full text-xs">
                          <thead className="text-[#607594]">
                            <tr className="border-b border-[#edf2f9]">
                              <th className="py-1 text-left font-semibold">Assessment</th>
                              <th className="py-1 text-left font-semibold">Status</th>
                              <th className="py-1 text-left font-semibold">Updated</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dashboardRecentAssessments.map((assessment, index) => (
                              <tr key={`${String(assessment.id ?? index)}-${index}`} className="border-b border-[#f1f4fa] last:border-0">
                                <td className="py-1 text-[#2a3d5f]">{String(assessment.title ?? assessment.name ?? assessment.id ?? 'Assessment')}</td>
                                <td className="py-1 text-[#607594]">{String(assessment.status ?? '-')}</td>
                                <td className="py-1 text-[#607594]">{String(assessment.updated_at ?? assessment.created_at ?? '-')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-[#607594]">No recent assessments.</p>
                    )}
                  </div>
                  <div className="rounded-lg border border-[#e3e9f6] bg-white p-3">
                    <p className="text-sm font-semibold text-[#243555]">Available checklists</p>
                    {dashboardAvailableChecklists.length ? (
                      <ul className="mt-2 space-y-1 text-xs text-[#2a3d5f]">
                        {dashboardAvailableChecklists.map((checklist, index) => (
                          <li key={`${String(checklist.id ?? index)}-${index}`} className="rounded border border-[#edf2f9] px-2 py-1">
                            {String(checklist.title ?? checklist.name ?? checklist.id ?? 'Checklist')}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-xs text-[#607594]">No available checklists.</p>
                    )}
                  </div>
                </div>
              </article>
            ) : null}
          </article>
        </>
      ) : null}

      {activeTab === 'roleswitch' ? (
        <article className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm">
          <div className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            For QA/testing only. Temporarily changes your active session to another role. Use End switch to return to admin.
          </div>
          <h2 className="text-base font-semibold text-[#243555]">Switch to role</h2>
          <p className="mt-1 text-sm text-[#607594]">Choose role and session duration for testing.</p>
          <form onSubmit={onSwitchRole} className="mt-4 space-y-3">
          <label className="block space-y-2 text-sm">
            <span className="font-medium text-[#566b8d]">Switch to role <span className="text-[#c43e53]">*</span></span>
            <select
              value={switchRole}
              onChange={(event) => setSwitchRole(event.target.value as 'customer' | 'auditor')}
              className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-[#2a3d5f] outline-none focus:border-[#7ea6e7]"
            >
              <option value="customer">customer</option>
              <option value="auditor">auditor</option>
            </select>
          </label>
          <label className="block space-y-2 text-sm">
            <span className="font-medium text-[#566b8d]">Reason <span className="text-[#c43e53]">*</span></span>
            <input
              type="text"
              value={switchReason}
              onChange={(event) => setSwitchReason(event.target.value)}
              className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-[#2a3d5f] outline-none focus:border-[#7ea6e7]"
            />
          </label>
          <label className="block space-y-2 text-sm">
            <span className="font-medium text-[#566b8d]">Duration minutes <span className="text-[#c43e53]">*</span></span>
            <input
              type="number"
              min={1}
              value={switchDuration}
              onChange={(event) => setSwitchDuration(Number(event.target.value))}
              className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-[#2a3d5f] outline-none focus:border-[#7ea6e7]"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl border border-[#1f2d45] bg-[#1f2d45] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {actionLoading === 'switch-role' ? 'Switching role…' : 'Switch role'}
            </button>
            <button
              type="button"
              onClick={() => void onEndRoleSwitch()}
              disabled={loading}
              className="rounded-xl border border-[#d4dced] bg-white px-4 py-2 text-sm font-semibold text-[#2a3d5f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {actionLoading === 'end-switch' ? 'Ending switch…' : 'End switch'}
            </button>
          </div>
        </form>
        </article>
      ) : null}

    </section>
  );
}
