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
      const [usersResponse, customersResponse] = await Promise.all([listAdminUsers(), listCustomers()]);
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
  }, [isReadOnly]);

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
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6f82a3]">Users</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1f2d45]">Users & Role Assignment</h1>
        <p className="mt-1 text-sm text-[#607594]">
          Assign platform roles using the backend admin endpoint. This controls access for admin, auditor, and customer
          experiences.
        </p>
      </header>

      <article className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-[#243555]">Admin & Auditor Users</h2>
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
              {users.map((user) => (
                <tr key={user.id} className="border-t border-[#edf2f9]">
                  <td className="px-4 py-3 font-semibold text-[#2a3d5f]">{user.email}</td>
                  <td className="px-4 py-3 text-[#607594]">{user.role}</td>
                  <td className="px-4 py-3 text-[#607594]">{user.is_active ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedUserId(user.id)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                          selectedUserId === user.id ? 'border-[#2f7dff] bg-[#edf4ff] text-[#2f7dff]' : 'border-[#d4dced] text-[#3e69b0] hover:bg-[#edf4ff]'
                        }`}
                      >
                        Select
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <article className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-[#243555]">User Detail & Role Change</h2>

        <form onSubmit={onLoadUser} className="mt-4 space-y-3">
          <label className="block space-y-2 text-sm">
            <span className="font-medium text-[#566b8d]">Selected user ID <span className="text-[#c43e53]">*</span></span>
            <input
              type="text"
              value={selectedUserId}
              onChange={(event) => setSelectedUserId(event.target.value)}
              placeholder="UUID"
              className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-[#2a3d5f] outline-none focus:border-[#7ea6e7]"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl border border-[#2d4f83] bg-[#182843] px-4 py-2 text-sm font-semibold text-white hover:bg-[#223657] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {actionLoading === 'load-user' ? 'Loading user…' : 'Load user detail'}
          </button>
        </form>

        {selectedUserDetail ? (
          <div className="mt-3 rounded-lg border border-[#e3e9f6] bg-[#f9fbff] px-3 py-2 text-sm text-[#556b8f]">
            <p>Email: {selectedUserDetail.email}</p>
            <p>Role: {selectedUserDetail.role}</p>
            <p>Permissions: {selectedUserDetail.permissions.map((item) => `${item.resource}:${item.action}`).join(', ') || 'None'}</p>
          </div>
        ) : null}

        <form onSubmit={onChangeRole} className="mt-4 space-y-3">
          <label className="block space-y-2 text-sm">
            <span className="font-medium text-[#566b8d]">New role code</span>
            <select
              value={newRoleCode}
              onChange={(event) => setNewRoleCode(event.target.value as 'admin' | 'auditor')}
              className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-[#2a3d5f] outline-none focus:border-[#7ea6e7]"
            >
              <option value="auditor">auditor</option>
              <option value="admin">admin</option>
            </select>
          </label>
          <label className="block space-y-2 text-sm">
            <span className="font-medium text-[#566b8d]">Reason <span className="text-[#c43e53]">*</span></span>
            <input
              type="text"
              value={roleReason}
              onChange={(event) => setRoleReason(event.target.value)}
              className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-[#2a3d5f] outline-none focus:border-[#7ea6e7]"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl border border-[#2d4f83] bg-[#182843] px-4 py-2 text-sm font-semibold text-white hover:bg-[#223657] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {actionLoading === 'change-role' ? 'Changing role…' : 'Change role'}
          </button>
        </form>

        <form onSubmit={onAssignPermissions} className="mt-4 space-y-3">
          <h3 className="text-lg font-semibold text-[#243555]">Custom permissions (auditor only)</h3>
          <label className="block space-y-2 text-sm">
            <span className="font-medium text-[#566b8d]">Permissions</span>
            <input
              type="text"
              value={permissionsInput}
              onChange={(event) => setPermissionsInput(event.target.value)}
              placeholder="dashboard:read,report:read"
              className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-[#2a3d5f] outline-none focus:border-[#7ea6e7]"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl border border-[#2d4f83] bg-[#182843] px-4 py-2 text-sm font-semibold text-white hover:bg-[#223657] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {actionLoading === 'assign-permissions' ? 'Assigning…' : 'Assign permissions'}
            </button>
            <button
              type="button"
              onClick={() => void onResetPermissions()}
              disabled={loading}
              className="rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-4 py-2 text-sm font-semibold text-[#2a3d5f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {actionLoading === 'reset-permissions' ? 'Resetting…' : 'Reset permissions'}
            </button>
          </div>
        </form>
      </article>

      <article className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-[#243555]">Customers</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-[#e3e9f6]">
          <table className="min-w-full text-sm">
            <thead className="bg-[#f3f6fc] text-[#607594]">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Email</th>
                <th className="px-4 py-3 text-left font-semibold">Active</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-t border-[#edf2f9]">
                  <td className="px-4 py-3 font-semibold text-[#2a3d5f]">{customer.email}</td>
                  <td className="px-4 py-3 text-[#607594]">{customer.is_active ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setSelectedCustomerId(customer.id)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                        selectedCustomerId === customer.id ? 'border-[#2f7dff] bg-[#edf4ff] text-[#2f7dff]' : 'border-[#d4dced] text-[#3e69b0] hover:bg-[#edf4ff]'
                      }`}
                    >
                      Select
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form onSubmit={onLoadCustomer} className="mt-4 space-y-3">
          <label className="block space-y-2 text-sm">
            <span className="font-medium text-[#566b8d]">Selected customer ID <span className="text-[#c43e53]">*</span></span>
            <input
              type="text"
              value={selectedCustomerId}
              onChange={(event) => setSelectedCustomerId(event.target.value)}
              placeholder="UUID"
              className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-[#2a3d5f] outline-none focus:border-[#7ea6e7]"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl border border-[#2d4f83] bg-[#182843] px-4 py-2 text-sm font-semibold text-white hover:bg-[#223657] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {actionLoading === 'load-customer' ? 'Loading customer…' : 'Load customer detail'}
          </button>
        </form>

        {selectedCustomerDetail ? (
          <div className="mt-3 rounded-lg border border-[#e3e9f6] bg-[#f9fbff] px-3 py-2 text-sm text-[#556b8f]">
            <p>Email: {selectedCustomerDetail.email}</p>
            <p>
              Permissions:{' '}
              {selectedCustomerDetail.permissions.map((item) => `${item.resource}:${item.action}`).join(', ') || 'None'}
            </p>
          </div>
        ) : null}

        <div className="mt-4 space-y-3">
          <label className="block space-y-2 text-sm">
            <span className="font-medium text-[#566b8d]">Reason <span className="text-[#c43e53]">*</span></span>
            <input
              type="text"
              value={customerReason}
              onChange={(event) => setCustomerReason(event.target.value)}
              className="w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-[#2a3d5f] outline-none focus:border-[#7ea6e7]"
            />
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-[#566b8d]">
            <input
              type="checkbox"
              checked={isPermanentDeactivation}
              onChange={(event) => setIsPermanentDeactivation(event.target.checked)}
              className="h-4 w-4 accent-[#2f7dff]"
            />
            Permanent deactivation
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void onDeactivateCustomer()}
              disabled={loading}
              className="rounded-xl border border-[#d45f6b] bg-[#fff1f3] px-4 py-2 text-sm font-semibold text-[#a73a46] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {actionLoading === 'deactivate-customer' ? 'Deactivating…' : 'Deactivate'}
            </button>
            <button
              type="button"
              onClick={() => void onActivateCustomer()}
              disabled={loading}
              className="rounded-xl border border-[#2d4f83] bg-[#182843] px-4 py-2 text-sm font-semibold text-white hover:bg-[#223657] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {actionLoading === 'activate-customer' ? 'Activating…' : 'Activate'}
            </button>
            <button
              type="button"
              onClick={() => void onViewCustomerDashboard()}
              disabled={loading}
              className="rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-4 py-2 text-sm font-semibold text-[#2a3d5f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {actionLoading === 'view-customer-dashboard' ? 'Loading dashboard…' : 'View Dashboard'}
            </button>
          </div>
          {customerDashboardData ? (
            <article className="rounded-xl border border-[#e3e9f6] bg-[#f9fbff] p-3">
              <h3 className="text-sm font-semibold text-[#243555]">Customer Dashboard Preview</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <div className="rounded-lg border border-[#e3e9f6] bg-white p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6f82a3]">Payment Status</p>
                  <p className="mt-1 text-sm font-semibold text-[#243555]">{dashboardPaymentStatus ?? 'Not available'}</p>
                </div>
                <div className="rounded-lg border border-[#e3e9f6] bg-white p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6f82a3]">Recent Assessments</p>
                  <p className="mt-1 text-sm font-semibold text-[#243555]">{dashboardRecentAssessments.length}</p>
                </div>
                <div className="rounded-lg border border-[#e3e9f6] bg-white p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6f82a3]">Available Checklists</p>
                  <p className="mt-1 text-sm font-semibold text-[#243555]">{dashboardAvailableChecklists.length}</p>
                </div>
              </div>

              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                <div className="rounded-lg border border-[#e3e9f6] bg-white p-3">
                  <p className="text-sm font-semibold text-[#243555]">Recent Assessments</p>
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
                  <p className="text-sm font-semibold text-[#243555]">Available Checklists</p>
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
        </div>
      </article>

      <article className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-[#243555]">Role Switch For Testing</h2>
        <p className="mt-1 text-sm text-[#607594]">
          This temporarily changes your active session from admin to the selected role for testing. Use <span className="font-semibold">End switch</span> to return to admin.
        </p>
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
              className="rounded-xl border border-[#2d4f83] bg-[#182843] px-4 py-2 text-sm font-semibold text-white hover:bg-[#223657] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {actionLoading === 'switch-role' ? 'Switching role…' : 'Switch role'}
            </button>
            <button
              type="button"
              onClick={() => void onEndRoleSwitch()}
              disabled={loading}
              className="rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-4 py-2 text-sm font-semibold text-[#2a3d5f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {actionLoading === 'end-switch' ? 'Ending switch…' : 'End switch'}
            </button>
          </div>
        </form>
      </article>

    </section>
  );
}
