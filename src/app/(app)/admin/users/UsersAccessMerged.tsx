'use client';

import { Sora } from 'next/font/google';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  resetAdminUserPassword,
  resetUserPermissions,
  switchAdminRole,
  viewCustomerDashboardAsAdmin,
  type AdminCustomer,
  type AdminCustomerDetail,
  type AdminManagedUser,
  type AdminUserDetail,
} from '@/lib/admin-users';
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
import { beginRoleSwitchSession, clearRoleSwitchSession } from '@/lib/auth';

const sora = Sora({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] });

const shell =
  'min-h-full rounded-[18px] border border-slate-200 bg-gradient-to-b from-white to-slate-50 text-slate-900 shadow-sm';

const muted = 'text-slate-600';
const line = 'border-slate-200';
const card =
  'rounded-2xl border border-[#d4dced] bg-[linear-gradient(160deg,#ffffff_0%,#f3f7ff_100%)] shadow-sm';
const inp =
  'w-full rounded-[11px] border border-slate-300 bg-white px-3 py-2 text-[13px] text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#10284F] focus:ring-2 focus:ring-[#10284F]/15';
const btn =
  'rounded-[10px] border border-[#2d4f83] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#10284F] shadow-sm hover:bg-[#f3f7ff] hover:border-[#10284F]';
const btnPri =
  'rounded-[10px] border border-[#2d4f83] bg-[#10284F] px-3 py-1.5 text-[12px] font-semibold text-white shadow-sm hover:bg-[#16345f] hover:border-[#16345f]';
const btnDanger =
  'rounded-[10px] border border-red-300 bg-red-50 px-3 py-1.5 text-[12px] font-semibold text-red-800 hover:bg-red-100';

type MainTab = 'users' | 'customers' | 'rbac' | 'check' | 'roleswitch';

const statCardClass =
  'relative overflow-hidden rounded-2xl border border-[#13305c] bg-[linear-gradient(140deg,#071733_0%,#0c2144_50%,#13356d_100%)] p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#1f4a8a] hover:shadow-md';

/** Scrolls vertically; scrollbar hidden in WebKit / Firefox / legacy Edge while staying scrollable. */
const scrollYScrollbarHidden =
  'overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0';

function StatIcon({ type }: { type: 'admin-users' | 'customers' | 'roles' | 'permissions' }) {
  const cls = 'h-9 w-9 shrink-0 text-[#9bc4ff]';
  if (type === 'admin-users') {
    return (
      <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden>
        <path
          d="M9 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.5-1A2.5 2.5 0 1 0 14 6.5 2.5 2.5 0 0 0 16.5 9ZM4 19c0-2.8 2.2-5 5-5h1c2.8 0 5 2.2 5 5M14 18.6c.3-1.6 1.6-2.8 3.2-2.8h.8c1.2 0 2.2.5 2.8 1.3"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (type === 'customers') {
    return (
      <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden>
        <circle cx="12" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M6 20v-1a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v1"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (type === 'roles') {
    return (
      <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden>
        <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden>
      <path
        d="M8 11V7a4 4 0 1 1 8 0v4M6 11h12v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V11Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function initials(email: string) {
  const p = email.split('@')[0] ?? '';
  const pts = p.split(/[._-]/);
  const a = pts[0]?.[0] ?? '?';
  const b = pts[1]?.[0] ?? pts[0]?.[1] ?? '';
  return (a + b).toUpperCase();
}

function colorFor(email: string) {
  const COLORS = [
    { bg: 'rgba(103,182,255,0.18)', fg: '#67b6ff' },
    { bg: 'rgba(146,240,197,0.18)', fg: '#92f0c5' },
    { bg: 'rgba(246,196,109,0.18)', fg: '#f6c46d' },
    { bg: 'rgba(255,124,139,0.18)', fg: '#ff7c8b' },
    { bg: 'rgba(180,140,255,0.18)', fg: '#c49bff' },
  ] as const;
  const h = email.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return COLORS[h % COLORS.length];
}

function Badge({ children, v }: { children: React.ReactNode; v: 'green' | 'blue' | 'gold' | 'red' | 'gray' }) {
  const m = {
    green: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    blue: 'border-blue-200 bg-blue-50 text-blue-800',
    gold: 'border-amber-200 bg-amber-50 text-amber-900',
    red: 'border-red-200 bg-red-50 text-red-800',
    gray: 'border-slate-300 bg-slate-100 text-slate-600',
  }[v];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${m}`}>
      <span className="h-1 w-1 rounded-full bg-current opacity-65" />
      {children}
    </span>
  );
}

export default function UsersAccessMerged() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isReadOnly } = useAdminAccess();

  const [mainTab, setMainTab] = useState<MainTab>('users');
  const [adminUsers, setAdminUsers] = useState<AdminManagedUser[]>([]);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [permissions, setPermissions] = useState<RbacPermission[]>([]);
  const [roles, setRoles] = useState<RbacRole[]>([]);

  const [selectedAdminId, setSelectedAdminId] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [adminDetail, setAdminDetail] = useState<AdminUserDetail | null>(null);
  const [customerDetail, setCustomerDetail] = useState<AdminCustomerDetail | null>(null);
  const [customerDash, setCustomerDash] = useState<Record<string, unknown> | null>(null);

  const [newRoleCode, setNewRoleCode] = useState<'admin' | 'auditor'>('auditor');
  const [roleReason, setRoleReason] = useState('Role update requested by admin');
  const [permissionsInput, setPermissionsInput] = useState('dashboard:read,report:read');
  const [resetPasswordValue, setResetPasswordValue] = useState('');
  const [resetPasswordReason, setResetPasswordReason] = useState('Admin requested password reset');
  const [switchRole, setSwitchRole] = useState<'customer' | 'auditor'>('customer');
  const [switchReason, setSwitchReason] = useState('Testing flow');
  const [switchDuration, setSwitchDuration] = useState(30);
  const [customerReason, setCustomerReason] = useState('Support action');
  const [isPermanentDeactivation, setIsPermanentDeactivation] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'admin' | 'auditor'>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerActiveFilter, setCustomerActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [loading, setLoading] = useState(false);
  const [listsLoading, setListsLoading] = useState(false);
  const [rbacMetaLoading, setRbacMetaLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState('');

  const [inspTab, setInspTab] = useState<'details' | 'actions' | 'security'>('details');
  const [custInspTab, setCustInspTab] = useState<'details' | 'dashboard' | 'actions'>('details');

  const [targetUserId, setTargetUserId] = useState('');
  const [targetRoleId, setTargetRoleId] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [selectedPermissionId, setSelectedPermissionId] = useState('');
  const [bulkPermissionKeys, setBulkPermissionKeys] = useState('dashboard:read,report:read');
  const [bulkRoleCodes, setBulkRoleCodes] = useState('auditor');
  const [newRoleCodeCreate, setNewRoleCodeCreate] = useState('');
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [newPermRes, setNewPermRes] = useState('');
  const [newPermAct, setNewPermAct] = useState('');
  const [newPermDesc, setNewPermDesc] = useState('');
  const [roleUpdateName, setRoleUpdateName] = useState('');
  const [roleUpdateDescription, setRoleUpdateDescription] = useState('');
  const [roleUpdateActive, setRoleUpdateActive] = useState(true);
  const [selectedCheckPermissionId, setSelectedCheckPermissionId] = useState('');
  const [permissionCheckResult, setPermissionCheckResult] = useState<{ allowed: boolean; reason?: string } | null>(null);
  const [multiPermissionKeys, setMultiPermissionKeys] = useState('dashboard:read,report:read');
  const [multiPermissionResult, setMultiPermissionResult] = useState<Record<string, boolean> | null>(null);
  const [lookupUserId, setLookupUserId] = useState('');
  const [userRolesResult, setUserRolesResult] = useState<Array<{ id: string; code: string; name: string }>>([]);
  const [userPermissionsResult, setUserPermissionsResult] = useState<
    Array<{ id: string; resource: string; action: string; description: string }>
  >([]);
  const [rolesFetched, setRolesFetched] = useState(false);
  const [permissionsFetched, setPermissionsFetched] = useState(false);
  const [selectedRoleDetail, setSelectedRoleDetail] = useState<{
    id: string;
    user_count: number;
    permissions: RbacPermission[];
  } | null>(null);
  const [rbacUserSearch, setRbacUserSearch] = useState('');
  const [auditorUserSearch, setAuditorUserSearch] = useState('');
  const [auditorUserListUnavailable, setAuditorUserListUnavailable] = useState(false);
  const [customPermUserId, setCustomPermUserId] = useState('');
  const [customPermKeys, setCustomPermKeys] = useState('dashboard:read,report:read');
  const [rbacDetailRoles, setRbacDetailRoles] = useState<Array<{ id: string; code: string; name: string }>>([]);
  const [rbacDetailPerms, setRbacDetailPerms] = useState<Array<{ id: string; resource: string; action: string; description: string }>>([]);

  const allUsers = useMemo(
    () => [...adminUsers, ...customers.map((c) => ({ ...c, role: 'customer' as const }))],
    [adminUsers, customers],
  );

  const filteredRbacUsers = useMemo(() => {
    const q = (isReadOnly ? auditorUserSearch : rbacUserSearch).trim().toLowerCase();
    if (!q) return allUsers;
    return allUsers.filter((u) => u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q));
  }, [allUsers, isReadOnly, auditorUserSearch, rbacUserSearch]);

  const displayedAdminUsers = useMemo(() => {
    let u = adminUsers;
    if (userStatusFilter === 'active') u = u.filter((x) => x.is_active);
    if (userStatusFilter === 'inactive') u = u.filter((x) => !x.is_active);
    return u;
  }, [adminUsers, userStatusFilter]);

  const permissionIdsFromKeys = useCallback(
    (input: string) => {
      const keys = input
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      return keys
        .map((key) => permissions.find((p) => `${p.resource}:${p.action}` === key)?.id ?? null)
        .filter((id): id is string => Boolean(id));
    },
    [permissions],
  );

  const roleIdsFromCodes = useCallback(
    (input: string) => {
      const codes = input
        .split(',')
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);
      return codes.map((code) => roles.find((r) => r.code.toLowerCase() === code)?.id ?? null).filter((id): id is string => Boolean(id));
    },
    [roles],
  );

  const permissionPairsFromKeys = (input: string): Array<[string, string]> =>
    input
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => item.split(':'))
      .filter((parts): parts is [string, string] => parts.length === 2 && Boolean(parts[0]) && Boolean(parts[1]))
      .map(([resource, action]) => [resource.trim(), action.trim()]);

  const loadLists = useCallback(async () => {
    setListsLoading(true);
    try {
      if (isReadOnly) {
        const [ur, cr] = await Promise.all([
          listAdminUsers({
            search: userSearchQuery.trim() || undefined,
            role: userRoleFilter === 'all' ? undefined : userRoleFilter,
            sort_by: 'updated_at',
            sort_order: 'desc',
            limit: 100,
          }).catch(() => null),
          listCustomers({
            search: customerSearchQuery.trim() || undefined,
            is_active: customerActiveFilter === 'all' ? undefined : customerActiveFilter === 'active',
            sort_by: 'updated_at',
            sort_order: 'desc',
            limit: 100,
          }).catch(() => null),
        ]);
        setAdminUsers(ur?.users ?? []);
        setCustomers(cr?.customers ?? []);
        setAuditorUserListUnavailable(!ur && !cr);
      } else {
        const [ur, cr] = await Promise.all([
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
        setAdminUsers(ur.users);
        setCustomers(cr.customers);
      }
    } catch (err) {
      if (!isReadOnly) toast.error(err instanceof Error ? err.message : 'Failed to load lists.');
    } finally {
      setListsLoading(false);
    }
  }, [isReadOnly, userSearchQuery, userRoleFilter, customerSearchQuery, customerActiveFilter]);

  const loadRbacMeta = useCallback(async () => {
    setRbacMetaLoading(true);
    try {
      const [permRes, roleRes] = await Promise.all([listPermissions(), listRoles()]);
      setPermissions(permRes);
      setRoles(roleRes);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load RBAC metadata');
    } finally {
      setRbacMetaLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = searchParams.get('tab');
    const valid: MainTab[] = ['users', 'customers', 'rbac', 'check', 'roleswitch'];
    if (t && valid.includes(t as MainTab)) {
      if (t === 'roleswitch' && isReadOnly) setMainTab('rbac');
      else setMainTab(t as MainTab);
    }
  }, [searchParams, isReadOnly]);

  useEffect(() => {
    void loadRbacMeta();
  }, [loadRbacMeta]);

  useEffect(() => {
    void loadLists();
  }, [loadLists]);

  useEffect(() => {
    if (!selectedAdminId) {
      setAdminDetail(null);
      return;
    }
    let c = false;
    void (async () => {
      try {
        const d = await getAdminUser(selectedAdminId);
        if (!c) setAdminDetail(d);
      } catch {
        if (!c) setAdminDetail(null);
      }
    })();
    return () => {
      c = true;
    };
  }, [selectedAdminId]);

  useEffect(() => {
    if (!selectedCustomerId) {
      setCustomerDetail(null);
      return;
    }
    let c = false;
    void (async () => {
      try {
        const d = await getCustomer(selectedCustomerId);
        if (!c) setCustomerDetail(d);
      } catch {
        if (!c) setCustomerDetail(null);
      }
    })();
    return () => {
      c = true;
    };
  }, [selectedCustomerId]);

  useEffect(() => {
    const r = roles.find((item) => item.id === selectedRoleId);
    if (!r) return;
    setRoleUpdateName(r.name);
    setRoleUpdateDescription(r.description || '');
    setRoleUpdateActive(r.is_active);
  }, [selectedRoleId, roles]);

  useEffect(() => {
    setUserRolesResult([]);
    setUserPermissionsResult([]);
    setRbacDetailRoles([]);
    setRbacDetailPerms([]);
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

  const runRbacAction = async (fn: () => Promise<unknown>, ok: string, key?: string) => {
    if (key) setActionLoading(key);
    try {
      await fn();
      toast.success(ok);
      await loadRbacMeta();
      await loadLists();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action failed');
    } finally {
      if (key) setActionLoading('');
    }
  };

  const setTab = (t: MainTab) => {
    if (t === 'roleswitch' && isReadOnly) {
      toast.error('Role switch is only available to admins.');
      return;
    }
    setMainTab(t);
    router.replace(`/admin/users?tab=${t}`, { scroll: false });
  };

  const dashRecent = Array.isArray(customerDash?.recent_assessments)
    ? (customerDash.recent_assessments as Array<Record<string, unknown>>)
    : [];
  const dashChecklists = Array.isArray(customerDash?.available_checklists)
    ? (customerDash.available_checklists as Array<Record<string, unknown>>)
    : [];
  const dashPay =
    customerDash && typeof customerDash.payment_status === 'string' ? (customerDash.payment_status as string) : null;

  async function onChangeRole(e: FormEvent) {
    e.preventDefault();
    if (!selectedAdminId || !roleReason.trim()) {
      toast.error('Select a user and enter a reason.');
      return;
    }
    setActionLoading('change-role');
    setLoading(true);
    try {
      await changeAdminUserRole(selectedAdminId, { new_role_code: newRoleCode, reason: roleReason });
      toast.success('Role updated.');
      const d = await getAdminUser(selectedAdminId);
      setAdminDetail(d);
      await loadLists();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setActionLoading('');
      setLoading(false);
    }
  }

  async function onAssignPerms(e: FormEvent) {
    e.preventDefault();
    if (!selectedAdminId) return toast.error('Select a user.');
    const pairs = permissionPairsFromKeys(permissionsInput);
    if (!pairs.length) return toast.error('Use resource:action format.');
    setActionLoading('assign-perms');
    setLoading(true);
    try {
      await assignPermissionsToUser(selectedAdminId, pairs);
      toast.success('Permissions assigned.');
      const d = await getAdminUser(selectedAdminId);
      setAdminDetail(d);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setActionLoading('');
      setLoading(false);
    }
  }

  async function onResetPerms() {
    if (!selectedAdminId) return;
    setActionLoading('reset-perms');
    setLoading(true);
    try {
      await resetUserPermissions(selectedAdminId);
      toast.success('Reset.');
      const d = await getAdminUser(selectedAdminId);
      setAdminDetail(d);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setActionLoading('');
      setLoading(false);
    }
  }

  async function onResetPw(e: FormEvent) {
    e.preventDefault();
    if (!selectedAdminId || !resetPasswordValue.trim() || !resetPasswordReason.trim()) {
      toast.error('Password and reason required.');
      return;
    }
    setActionLoading('reset-pw');
    setLoading(true);
    try {
      await resetAdminUserPassword(selectedAdminId, { new_password: resetPasswordValue, reason: resetPasswordReason });
      toast.success('Password reset.');
      setResetPasswordValue('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setActionLoading('');
      setLoading(false);
    }
  }

  async function onCustomerDash() {
    if (!selectedCustomerId || !customerReason.trim()) return toast.error('Reason required.');
    setActionLoading('dash');
    setLoading(true);
    try {
      const data = await viewCustomerDashboardAsAdmin(selectedCustomerId, customerReason);
      setCustomerDash(data);
      toast.success('Dashboard loaded.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setActionLoading('');
      setLoading(false);
    }
  }

  async function onDeactivateCustomer() {
    if (!selectedCustomerId || !customerReason.trim()) return toast.error('Reason required.');
    setActionLoading('deact-c');
    setLoading(true);
    try {
      await deactivateCustomer(selectedCustomerId, { reason: customerReason, permanent: isPermanentDeactivation });
      toast.success('Deactivated.');
      await loadLists();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setActionLoading('');
      setLoading(false);
    }
  }

  async function onActivateCustomer() {
    if (!selectedCustomerId || !customerReason.trim()) return toast.error('Reason required.');
    setActionLoading('act-c');
    setLoading(true);
    try {
      await activateCustomer(selectedCustomerId, { reason: customerReason });
      toast.success('Activated.');
      await loadLists();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setActionLoading('');
      setLoading(false);
    }
  }

  async function onSwitchRole(e: FormEvent) {
    e.preventDefault();
    if (!switchReason.trim() || switchDuration < 1) return toast.error('Invalid switch.');
    setActionLoading('sw');
    setLoading(true);
    try {
      const response = await switchAdminRole({
        switch_to_role: switchRole,
        reason: switchReason,
        duration_minutes: switchDuration,
      });
      if (response.temporary_token) beginRoleSwitchSession(response.temporary_token);
      toast.success('Switched.');
      const sr = response.switched_to_role.toLowerCase();
      router.push(sr === 'customer' ? '/dashboard' : '/admin');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setActionLoading('');
      setLoading(false);
    }
  }

  async function onEndSwitch() {
    setActionLoading('end');
    setLoading(true);
    try {
      await endAdminRoleSwitch();
      clearRoleSwitchSession();
      toast.success('Returned.');
      router.push('/admin');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setActionLoading('');
      setLoading(false);
    }
  }

  async function onCheckPerm() {
    if (!selectedCheckPermissionId) return toast.error('Pick a permission.');
    const p = permissions.find((x) => x.id === selectedCheckPermissionId);
    if (!p) return;
    await runRbacAction(
      async () => {
        const data = await checkPermission({ resource: p.resource, action: p.action, user_id: targetUserId || undefined });
        setPermissionCheckResult({ allowed: data.has_permission });
      },
      'Check complete.',
      'chk',
    );
  }

  async function onMultiCheck() {
    const pairs = permissionPairsFromKeys(multiPermissionKeys);
    if (!pairs.length) return toast.error('Enter permission keys.');
    await runRbacAction(async () => {
      const data = await checkPermissions(pairs, targetUserId || undefined);
      setMultiPermissionResult(data.permissions ?? {});
    }, 'Multi-check complete.', 'mchk');
  }

  async function onLoadUserRoles(uid: string) {
    await runRbacAction(async () => {
      const data = await getUserRoles(uid);
      setUserRolesResult(Array.isArray(data) ? data.map((a) => a.role) : []);
      setRolesFetched(true);
    }, 'Roles loaded.', 'lr');
  }

  async function onLoadUserPerms(uid: string) {
    await runRbacAction(async () => {
      const data = await getUserPermissions(uid);
      setUserPermissionsResult(Array.isArray(data.permissions) ? data.permissions : []);
      setPermissionsFetched(true);
    }, 'Permissions loaded.', 'lp');
  }

  async function onLoadRbacPanelRoles() {
    if (!targetUserId) return toast.error('Select a user first.');
    setActionLoading('lrr');
    try {
      const data = await getUserRoles(targetUserId);
      setRbacDetailRoles(Array.isArray(data) ? data.map((a) => a.role) : []);
      toast.success('Roles loaded.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setActionLoading('');
    }
  }

  async function onLoadRbacPanelPerms() {
    if (!targetUserId) return toast.error('Select a user first.');
    setActionLoading('lrp');
    try {
      const data = await getUserPermissions(targetUserId);
      setRbacDetailPerms(Array.isArray(data.permissions) ? data.permissions : []);
      toast.success('Permissions loaded.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setActionLoading('');
    }
  }

  async function onCustomAssign() {
    if (!customPermUserId) return toast.error('Select user.');
    const pairs = permissionPairsFromKeys(customPermKeys);
    if (!pairs.length) return toast.error('Invalid keys.');
    setActionLoading('custp');
    setLoading(true);
    try {
      await assignPermissionsToUser(customPermUserId, pairs);
      toast.success('Assigned.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setActionLoading('');
      setLoading(false);
    }
  }

  async function onCustomReset() {
    if (!customPermUserId) return toast.error('Select user.');
    setActionLoading('custr');
    setLoading(true);
    try {
      await resetUserPermissions(customPermUserId);
      toast.success('Reset.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setActionLoading('');
      setLoading(false);
    }
  }

  const filterChip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-[11px] font-semibold ${
      active
        ? 'border-[#10284F] bg-[#eef4ff] text-[#10284F]'
        : `border ${line} bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900`
    }`;

  return (
    <div className={`${sora.className} ${shell} p-4 md:p-5`}>
      <div className="pb-5">
        <h1 className="text-[26px] font-extrabold tracking-[-0.04em] text-slate-900">Users & Access Control</h1>
        <p className={`mt-1 max-w-[560px] text-[13px] ${muted}`}>
          Manage admin users, customers, roles, permissions, and session testing from one place.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(
          [
            { k: 'Admin users', v: adminUsers.length, sub: 'Admins & auditors', icon: 'admin-users' as const },
            { k: 'Customers', v: customers.length, sub: 'Accounts', icon: 'customers' as const },
            { k: 'Roles', v: roles.length, sub: 'RBAC', icon: 'roles' as const },
            { k: 'Permissions', v: permissions.length, sub: 'Rules', icon: 'permissions' as const },
          ] as const
        ).map((s) => (
          <div key={s.k} className={statCardClass}>
            <div className="absolute right-3 top-3 opacity-95">
              <StatIcon type={s.icon} />
            </div>
            <p className="pr-12 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8fabd4]">{s.k}</p>
            <p className="mt-1 text-[32px] font-extrabold leading-none tracking-[-0.05em] text-white">
              {rbacMetaLoading ? '…' : s.v}
            </p>
            <p className="mt-1 text-[11px] text-[#b8cae7]">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className={`mt-4 flex flex-wrap gap-1 rounded-t-lg bg-slate-100/90 p-1 pb-0 ring-1 ring-slate-200/80`}>
        {(
          [
            ['users', 'Admin users'],
            ['customers', 'Customers'],
            ['rbac', 'Roles & permissions'],
            ['check', 'Permission check'],
            ...(!isReadOnly ? ([['roleswitch', 'Role switch']] as const) : []),
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={
              mainTab === id
                ? 'rounded-t-[10px] border border-slate-200 border-b-white bg-white px-[18px] py-2 text-[12px] font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200/80'
                : 'rounded-t-[10px] border border-transparent px-[18px] py-2 text-[12px] font-semibold text-slate-700 hover:bg-white hover:text-slate-900'
            }
            onClick={() => setTab(id as MainTab)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {mainTab === 'users' ? (
          <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
            <div className="grid gap-4">
              <div className={card}>
                <div className={`flex flex-wrap items-center justify-between gap-3 border-b ${line} px-[18px] py-3`}>
                  <div>
                    <h2 className="text-[15px] font-bold text-slate-900">Admin & auditor users</h2>
                    <p className={`text-[12px] ${muted}`}>Click a row to inspect and manage</p>
                  </div>
                  <div
                    className={`flex min-w-[200px] max-w-[320px] flex-1 items-center gap-2 rounded-[11px] border ${line} bg-slate-50 px-3 py-2 focus-within:border-[#10284F]`}
                  >
                    <input
                      className="min-w-0 flex-1 bg-transparent text-[12px] text-slate-900 outline-none placeholder:text-slate-500"
                      placeholder="Search email…"
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className={`flex flex-wrap gap-2 border-b ${line} px-[18px] py-2`}>
                  <button
                    type="button"
                    className={filterChip(userRoleFilter === 'all' && userStatusFilter === 'all')}
                    onClick={() => {
                      setUserRoleFilter('all');
                      setUserStatusFilter('all');
                    }}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    className={filterChip(userRoleFilter === 'admin')}
                    onClick={() => {
                      setUserRoleFilter('admin');
                      setUserStatusFilter('all');
                    }}
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    className={filterChip(userRoleFilter === 'auditor')}
                    onClick={() => {
                      setUserRoleFilter('auditor');
                      setUserStatusFilter('all');
                    }}
                  >
                    Auditor
                  </button>
                  <button
                    type="button"
                    className={filterChip(userStatusFilter === 'active' && userRoleFilter === 'all')}
                    onClick={() => {
                      setUserStatusFilter('active');
                      setUserRoleFilter('all');
                    }}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    className={filterChip(userStatusFilter === 'inactive' && userRoleFilter === 'all')}
                    onClick={() => {
                      setUserStatusFilter('inactive');
                      setUserRoleFilter('all');
                    }}
                  >
                    Inactive
                  </button>
                </div>
                <div
                  className={`grid grid-cols-[38px_minmax(0,1fr)_100px_80px_76px] gap-3 border-b ${line} bg-slate-100 px-[18px] py-2 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500`}
                >
                  <div />
                  <div>User</div>
                  <div>Role</div>
                  <div>Status</div>
                  <div className="text-right">Actions</div>
                </div>
                <div className={`max-h-[420px] ${scrollYScrollbarHidden}`}>
                  {listsLoading ? (
                    <p className={`p-6 text-center text-sm ${muted}`}>Loading…</p>
                  ) : displayedAdminUsers.length === 0 ? (
                    <p className={`p-6 text-center text-sm ${muted}`}>No users match.</p>
                  ) : (
                    displayedAdminUsers.map((u) => {
                      const col = colorFor(u.email);
                      const sel = selectedAdminId === u.id;
                      return (
                        <div
                          key={u.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            setSelectedAdminId(u.id);
                            setInspTab('details');
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setSelectedAdminId(u.id);
                            }
                          }}
                          className={`group grid cursor-pointer grid-cols-[38px_minmax(0,1fr)_100px_80px_76px] gap-3 border-b border-[rgba(155,181,224,0.06)] px-[18px] py-2.5 transition hover:bg-[#eef4ff] ${
                            sel ? 'border-l-2 border-l-[#10284F] bg-gradient-to-r from-[#eef4ff] to-white pl-4' : ''
                          }`}
                        >
                          <div
                            className="flex h-[34px] w-[34px] items-center justify-center rounded-[11px] text-[12px] font-extrabold"
                            style={{ background: col.bg, color: col.fg }}
                          >
                            {initials(u.email)}
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-slate-900">{u.email}</p>
                            <p className={`text-[11px] ${muted}`}>Staff</p>
                          </div>
                          <div>
                            <Badge v={u.role === 'admin' ? 'blue' : 'gold'}>{u.role}</Badge>
                          </div>
                          <div>
                            <Badge v={u.is_active ? 'green' : 'gray'}>{u.is_active ? 'Active' : 'Inactive'}</Badge>
                          </div>
                          <div className="flex min-w-0 items-center justify-end opacity-0 pointer-events-none transition-opacity duration-150 group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto">
                            <span className={`${btn} shrink-0 py-0.5 text-[10px]`}>Inspect</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
              <div className={card}>
                <div className={`border-b ${line} px-[18px] py-3`}>
                  <h2 className="text-[15px] font-bold">Recent activity</h2>
                </div>
                <div className="px-[18px] py-3">
                  <p className={`text-center text-sm ${muted}`}>Use Audit Logs in the sidebar for a full admin action history.</p>
                </div>
              </div>
            </div>
            <aside className={`${card} lg:sticky lg:top-2 lg:self-start`}>
              <div className={`flex items-center justify-between border-b ${line} px-[18px] py-3`}>
                <h3 className="text-[14px] font-bold">{selectedAdminId ? (adminDetail?.email ?? 'Loading…') : 'Select a user'}</h3>
                {adminDetail ? <Badge v={adminDetail.role === 'admin' ? 'blue' : 'gold'}>{adminDetail.role}</Badge> : <Badge v="gray">None</Badge>}
              </div>
              {!selectedAdminId || !adminDetail ? (
                <div className={`px-6 py-10 text-center ${muted}`}>
                  <p className="mb-2 text-3xl opacity-20">👆</p>
                  <p className="text-sm">Click a user row to load details and manage access.</p>
                </div>
              ) : (
                <div>
                  <div className={`flex border-b ${line}`}>
                    {(['details', 'actions', 'security'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        className={`flex-1 border-b-2 py-2 text-[11px] font-semibold capitalize ${
                          inspTab === t ? 'border-[#10284F] text-slate-900' : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                        onClick={() => setInspTab(t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <div className="p-[18px]">
                    {inspTab === 'details' ? (
                      <div>
                        <div className={`mb-4 flex gap-3 border-b ${line} pb-4`}>
                          <div
                            className="flex h-12 w-12 items-center justify-center rounded-[15px] text-[17px] font-extrabold"
                            style={{ background: colorFor(adminDetail.email).bg, color: colorFor(adminDetail.email).fg }}
                          >
                            {initials(adminDetail.email)}
                          </div>
                          <div>
                            <p className="text-[15px] font-bold">{adminDetail.email.split('@')[0]}</p>
                            <p className={`text-[12px] ${muted}`}>{adminDetail.email}</p>
                          </div>
                        </div>
                        <dl className="space-y-0 text-[12px]">
                          <div className={`flex justify-between border-t border-[rgba(155,181,224,0.07)] py-2 ${muted}`}>
                            <dt>Status</dt>
                            <dd className="font-semibold text-slate-900">{adminDetail.is_active ? 'Active' : 'Inactive'}</dd>
                          </div>
                        </dl>
                        <p className="mb-2 mt-3 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Permissions</p>
                        <div className="flex flex-wrap gap-1">
                          {adminDetail.permissions.length ? (
                            adminDetail.permissions.map((p) => (
                              <code
                                key={`${p.resource}:${p.action}`}
                                className={`rounded-md border ${line} bg-slate-50 px-2 py-0.5 text-[10px] text-slate-500`}
                              >
                                {p.resource}:{p.action}
                              </code>
                            ))
                          ) : (
                            <span className={`text-[12px] ${muted}`}>None</span>
                          )}
                        </div>
                      </div>
                    ) : null}
                    {inspTab === 'actions' && !isReadOnly ? (
                      <div className="space-y-3">
                        <form onSubmit={onChangeRole} className="space-y-2">
                          <label className="block text-[10px] font-bold uppercase tracking-[0.09em] text-slate-600">New role</label>
                          <select className={inp} value={newRoleCode} onChange={(e) => setNewRoleCode(e.target.value as 'admin' | 'auditor')}>
                            <option value="auditor">auditor</option>
                            <option value="admin">admin</option>
                          </select>
                          <input className={inp} value={roleReason} onChange={(e) => setRoleReason(e.target.value)} placeholder="Reason *" />
                          <button type="submit" className={`${btnPri} w-full py-2.5`} disabled={loading}>
                            Save role
                          </button>
                        </form>
                        <form onSubmit={onAssignPerms} className={`space-y-2 border-t ${line} pt-3`}>
                          <label className="block text-[10px] font-bold uppercase tracking-[0.09em] text-slate-600">
                            Custom permissions (auditors)
                          </label>
                          <input className={inp} value={permissionsInput} onChange={(e) => setPermissionsInput(e.target.value)} />
                          <div className="flex gap-2">
                            <button type="submit" className={`${btnPri} flex-1`} disabled={loading}>
                              Assign
                            </button>
                            <button type="button" className={`${btn} flex-1`} onClick={() => void onResetPerms()} disabled={loading}>
                              Reset
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : null}
                    {inspTab === 'actions' && isReadOnly ? <p className={`text-sm ${muted}`}>Actions are hidden in auditor mode.</p> : null}
                    {inspTab === 'security' && !isReadOnly ? (
                      <form onSubmit={onResetPw} className="space-y-2">
                        <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-[12px] text-amber-900">
                          User must sign in with the new password immediately.
                        </p>
                        <input
                          className={inp}
                          type="password"
                          value={resetPasswordValue}
                          onChange={(e) => setResetPasswordValue(e.target.value)}
                          placeholder="New password"
                        />
                        <input className={inp} value={resetPasswordReason} onChange={(e) => setResetPasswordReason(e.target.value)} placeholder="Reason *" />
                        <button type="submit" className={`${btnDanger} w-full py-2.5`} disabled={loading}>
                          Reset password
                        </button>
                      </form>
                    ) : null}
                    {inspTab === 'security' && isReadOnly ? <p className={`text-sm ${muted}`}>Security tools are admin-only.</p> : null}
                  </div>
                </div>
              )}
            </aside>
          </div>
        ) : null}

        {mainTab === 'customers' ? (
          <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
            <div className={card}>
              <div className={`flex flex-wrap items-center justify-between gap-3 border-b ${line} px-[18px] py-3`}>
                <div>
                  <h2 className="text-[15px] font-bold">Customer accounts</h2>
                  <p className={`text-[12px] ${muted}`}>Select a customer to manage or preview dashboard</p>
                </div>
                <div className={`flex max-w-[300px] flex-1 rounded-[11px] border ${line} bg-slate-50 px-3 py-2`}>
                  <input
                    className="min-w-0 flex-1 bg-transparent text-[12px] outline-none placeholder:text-slate-500"
                    placeholder="Search email…"
                    value={customerSearchQuery}
                    onChange={(e) => setCustomerSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className={`flex flex-wrap gap-2 border-b ${line} px-[18px] py-2`}>
                {(['all', 'active', 'inactive'] as const).map((k) => (
                  <button key={k} type="button" className={filterChip(customerActiveFilter === k)} onClick={() => setCustomerActiveFilter(k)}>
                    {k[0].toUpperCase() + k.slice(1)}
                  </button>
                ))}
              </div>
              <div
                className={`grid grid-cols-[38px_1fr_90px_80px] gap-3 border-b ${line} bg-slate-100 px-[18px] py-2 text-[10px] font-bold uppercase text-slate-500 sm:grid-cols-[38px_1fr_90px_80px_100px]`}
              >
                <div />
                <div>Customer</div>
                <div>Status</div>
                <div className="hidden sm:block">Plan</div>
                <div className="hidden sm:block">Actions</div>
              </div>
              <div className={`max-h-[420px] ${scrollYScrollbarHidden}`}>
                {listsLoading ? (
                  <p className={`p-6 text-center text-sm ${muted}`}>Loading…</p>
                ) : customers.length === 0 ? (
                  <p className={`p-6 text-center text-sm ${muted}`}>No customers.</p>
                ) : (
                  customers.map((c) => {
                    const col = colorFor(c.email);
                    const sel = selectedCustomerId === c.id;
                    return (
                      <div
                        key={c.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          setSelectedCustomerId(c.id);
                          setCustInspTab('details');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedCustomerId(c.id);
                          }
                        }}
                        className={`group grid cursor-pointer grid-cols-[38px_1fr_90px_80px] gap-3 border-b border-[rgba(155,181,224,0.06)] px-[18px] py-2.5 hover:bg-[#eef4ff] sm:grid-cols-[38px_1fr_90px_80px_100px] ${
                          sel ? 'border-l-2 border-l-[#10284F] bg-gradient-to-r from-[#eef4ff] to-transparent pl-4' : ''
                        }`}
                      >
                        <div
                          className="flex h-[34px] w-[34px] items-center justify-center rounded-[11px] text-[12px] font-extrabold"
                          style={{ background: col.bg, color: col.fg }}
                        >
                          {initials(c.email)}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold">{c.email}</p>
                          <p className={`text-[11px] ${muted}`}>Customer</p>
                        </div>
                        <div>
                          <Badge v={c.is_active ? 'green' : 'gray'}>{c.is_active ? 'Active' : 'Inactive'}</Badge>
                        </div>
                        <div className="hidden sm:block">
                          <Badge v="blue">—</Badge>
                        </div>
                        <div className="hidden sm:flex">
                          <span className={`${btn} text-[10px]`}>Inspect</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            <aside className={`${card} lg:sticky lg:top-2`}>
              <div className={`flex items-center justify-between border-b ${line} px-[18px] py-3`}>
                <h3 className="text-[14px] font-bold">{selectedCustomerId ? (customerDetail?.email ?? '…') : 'Select a customer'}</h3>
                {customerDetail ? (
                  <Badge v={customerDetail.is_active ? 'green' : 'gray'}>{customerDetail.is_active ? 'Active' : 'Inactive'}</Badge>
                ) : (
                  <Badge v="gray">None</Badge>
                )}
              </div>
              {!selectedCustomerId || !customerDetail ? (
                <div className={`px-6 py-10 text-center ${muted}`}>
                  <p className="mb-2 text-3xl opacity-20">🧑‍💼</p>
                  <p className="text-sm">Click a customer row for details and actions.</p>
                </div>
              ) : (
                <div>
                  <div className={`flex border-b ${line}`}>
                    {(['details', 'dashboard', 'actions'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        className={`flex-1 border-b-2 py-2 text-[11px] font-semibold capitalize ${
                          custInspTab === t ? 'border-[#10284F] text-slate-900' : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                        onClick={() => setCustInspTab(t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <div className="p-[18px]">
                    {custInspTab === 'details' ? (
                      <div>
                        <p className={`mb-2 text-[11px] font-bold uppercase text-slate-500`}>Permissions</p>
                        <div className="flex flex-wrap gap-1">
                          {customerDetail.permissions.map((p) => (
                            <code key={`${p.resource}:${p.action}`} className={`rounded-md border ${line} bg-slate-50 px-2 py-0.5 text-[10px]`}>
                              {p.resource}:{p.action}
                            </code>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {custInspTab === 'dashboard' ? (
                      <div className="space-y-2">
                        <p className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-[12px] text-blue-900">
                          Preview loads live dashboard data for this customer.
                        </p>
                        <button type="button" className={btnPri} onClick={() => void onCustomerDash()} disabled={loading || isReadOnly}>
                          {actionLoading === 'dash' ? 'Loading…' : 'Load dashboard preview'}
                        </button>
                        {customerDash ? (
                          <div className="mt-2 grid grid-cols-2 gap-2 text-[12px]">
                            <div className={`rounded-xl border ${line} p-2`}>
                              <p className={muted}>Payment</p>
                              <p className="font-bold">{dashPay ?? '—'}</p>
                            </div>
                            <div className={`rounded-xl border ${line} p-2`}>
                              <p className={muted}>Assessments</p>
                              <p className="font-bold">{dashRecent.length}</p>
                            </div>
                            <div className={`rounded-xl border ${line} p-2`}>
                              <p className={muted}>Checklists</p>
                              <p className="font-bold">{dashChecklists.length}</p>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                    {custInspTab === 'actions' && !isReadOnly ? (
                      <div className="space-y-2">
                        <label className={`text-[10px] font-bold uppercase text-slate-600`}>Reason *</label>
                        <input className={inp} value={customerReason} onChange={(e) => setCustomerReason(e.target.value)} />
                        <label className="flex items-center gap-2 text-[12px] text-slate-500">
                          <input type="checkbox" checked={isPermanentDeactivation} onChange={(e) => setIsPermanentDeactivation(e.target.checked)} />
                          Permanent deactivation
                        </label>
                        <div className="flex flex-col gap-2">
                          <button type="button" className={btnPri} onClick={() => void onActivateCustomer()} disabled={loading}>
                            Activate
                          </button>
                          <button type="button" className={btnDanger} onClick={() => void onDeactivateCustomer()} disabled={loading}>
                            Deactivate
                          </button>
                        </div>
                      </div>
                    ) : null}
                    {custInspTab === 'actions' && isReadOnly ? <p className={`text-sm ${muted}`}>Customer actions are admin-only.</p> : null}
                  </div>
                </div>
              )}
            </aside>
          </div>
        ) : null}

        {mainTab === 'rbac' ? (
          <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
            <div className="grid gap-4">
              <div className={card}>
                <div className={`border-b ${line} px-[18px] py-3`}>
                  <h2 className="text-[15px] font-bold">Assign / remove role</h2>
                </div>
                <div className="space-y-3 p-[18px]">
                  <input
                    className={inp}
                    placeholder="Search users…"
                    value={isReadOnly ? auditorUserSearch : rbacUserSearch}
                    onChange={(e) => (isReadOnly ? setAuditorUserSearch(e.target.value) : setRbacUserSearch(e.target.value))}
                  />
                  <div className={`max-h-40 space-y-1 ${scrollYScrollbarHidden}`}>
                    {filteredRbacUsers.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => setTargetUserId(u.id)}
                        className={`w-full rounded-lg border px-2 py-1.5 text-left text-[12px] ${
                          targetUserId === u.id ? 'border-[#10284F] bg-[#eef4ff]' : `${line} border bg-white hover:bg-slate-50`
                        }`}
                      >
                        {u.email} <span className={muted}>({u.role})</span>
                      </button>
                    ))}
                  </div>
                  {auditorUserListUnavailable ? <p className={`text-xs ${muted}`}>User listing may be unavailable in auditor mode.</p> : null}
                  {!isReadOnly ? (
                    <>
                      <div>
                        <label className={`mb-1 block text-[10px] font-bold uppercase ${muted}`}>Role</label>
                        <select className={inp} value={targetRoleId} onChange={(e) => setTargetRoleId(e.target.value)}>
                          <option value="">Choose role…</option>
                          {roles.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name} ({r.code})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className={btnPri}
                          disabled={Boolean(actionLoading)}
                          onClick={() => {
                            if (!targetUserId || !targetRoleId) return toast.error('Select user and role.');
                            void runRbacAction(() => assignRoleToUser(targetUserId, targetRoleId), 'Role assigned.', 'ar');
                          }}
                        >
                          Assign role
                        </button>
                        <button
                          type="button"
                          className={btnDanger}
                          disabled={Boolean(actionLoading)}
                          onClick={() => {
                            if (!targetUserId || !targetRoleId) return toast.error('Select user and role.');
                            void runRbacAction(() => removeRoleFromUser(targetUserId, targetRoleId), 'Role removed.', 'rr');
                          }}
                        >
                          Remove role
                        </button>
                      </div>
                      <p className={`text-[10px] font-bold uppercase ${muted}`}>Bulk role codes</p>
                      <input className={inp} value={bulkRoleCodes} onChange={(e) => setBulkRoleCodes(e.target.value)} />
                      <button
                        type="button"
                        className={btnPri}
                        disabled={Boolean(actionLoading)}
                        onClick={() => {
                          if (!targetUserId) return toast.error('Select user.');
                          const ids = roleIdsFromCodes(bulkRoleCodes);
                          if (!ids.length) return toast.error('Enter valid role codes.');
                          void runRbacAction(() => assignRolesBulkToUser(targetUserId, ids), 'Bulk roles assigned.', 'br');
                        }}
                      >
                        Bulk assign roles
                      </button>
                    </>
                  ) : (
                    <p className={`text-sm ${muted}`}>Role assignment is admin-only. You can still inspect users above.</p>
                  )}
                  <div className={`border-t ${line} pt-3`}>
                    <p className={`mb-2 text-[10px] font-bold uppercase ${muted}`}>Effective access for selected user</p>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className={btn} disabled={!targetUserId || Boolean(actionLoading)} onClick={() => void onLoadRbacPanelRoles()}>
                        Load roles
                      </button>
                      <button type="button" className={btn} disabled={!targetUserId || Boolean(actionLoading)} onClick={() => void onLoadRbacPanelPerms()}>
                        Load permissions
                      </button>
                    </div>
                    {rbacDetailRoles.length ? (
                      <div className={`mt-2 rounded-xl border ${line} p-2 text-[12px]`}>
                        <p className="font-semibold">Roles</p>
                        <ul>
                          {rbacDetailRoles.map((r) => (
                            <li key={r.id}>
                              {r.name} ({r.code})
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {rbacDetailPerms.length ? (
                      <div className={`mt-2 rounded-xl border ${line} p-2`}>
                        <p className="text-[12px] font-semibold">Permissions</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {rbacDetailPerms.map((p) => (
                            <code key={p.id} className="text-[10px]">
                              {p.resource}:{p.action}
                            </code>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className={card}>
                <div className={`border-b ${line} px-[18px] py-3`}>
                  <h2 className="text-[15px] font-bold">Role permission management</h2>
                </div>
                <div className="space-y-3 p-[18px]">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <select className={inp} value={selectedRoleId} onChange={(e) => setSelectedRoleId(e.target.value)}>
                      <option value="">Role…</option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                    <select className={inp} value={selectedPermissionId} onChange={(e) => setSelectedPermissionId(e.target.value)}>
                      <option value="">Permission…</option>
                      {permissions.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.resource}:{p.action}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={btnPri}
                      disabled={Boolean(actionLoading) || isReadOnly}
                      onClick={() => {
                        if (!selectedRoleId || !selectedPermissionId) return toast.error('Select role and permission.');
                        void runRbacAction(() => assignPermissionToRole(selectedRoleId, selectedPermissionId), 'Assigned.', 'ap');
                      }}
                    >
                      Assign permission
                    </button>
                    <button
                      type="button"
                      className={btnDanger}
                      disabled={Boolean(actionLoading) || isReadOnly}
                      onClick={() => {
                        if (!selectedRoleId || !selectedPermissionId) return toast.error('Select role and permission.');
                        void runRbacAction(() => removePermissionFromRole(selectedRoleId, selectedPermissionId), 'Removed.', 'rp');
                      }}
                    >
                      Remove
                    </button>
                    <button
                      type="button"
                      className={btn}
                      disabled={Boolean(actionLoading)}
                      onClick={() =>
                        void runRbacAction(async () => {
                          if (!selectedRoleId) throw new Error('Select a role.');
                          const d = await getRole(selectedRoleId);
                          setSelectedRoleDetail({ id: d.id, user_count: d.user_count, permissions: d.permissions ?? [] });
                        }, 'Role detail loaded.', 'gr')
                      }
                    >
                      Load role detail
                    </button>
                  </div>
                  {selectedRoleDetail ? (
                    <div className={`rounded-xl border ${line} bg-slate-50 p-3 text-[12px]`}>
                      <p className="font-semibold">Users: {selectedRoleDetail.user_count}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {selectedRoleDetail.permissions.map((p) => (
                          <code key={p.id} className="text-[10px]">
                            {p.resource}:{p.action}
                          </code>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <p className={`text-[10px] font-bold uppercase ${muted}`}>Bulk permission keys</p>
                  <input className={inp} value={bulkPermissionKeys} onChange={(e) => setBulkPermissionKeys(e.target.value)} />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className={btnPri}
                      disabled={Boolean(actionLoading) || isReadOnly}
                      onClick={() =>
                        void runRbacAction(() => {
                          if (!selectedRoleId) throw new Error('Role required.');
                          const ids = permissionIdsFromKeys(bulkPermissionKeys);
                          if (!ids.length) throw new Error('Valid keys required.');
                          return assignPermissionsBulk(selectedRoleId, ids);
                        }, 'Bulk assigned.', 'bap')
                      }
                    >
                      Bulk assign
                    </button>
                    <button
                      type="button"
                      className={btnDanger}
                      disabled={Boolean(actionLoading) || isReadOnly}
                      onClick={() =>
                        void runRbacAction(() => {
                          if (!selectedRoleId) throw new Error('Role required.');
                          const ids = permissionIdsFromKeys(bulkPermissionKeys);
                          if (!ids.length) throw new Error('Valid keys required.');
                          return removePermissionsBulk(selectedRoleId, ids);
                        }, 'Bulk removed.', 'brp')
                      }
                    >
                      Bulk remove
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className={card}>
                <div className={`border-b ${line} px-[18px] py-3`}>
                  <h2 className="text-[15px] font-bold">Create role</h2>
                </div>
                <div className="space-y-2 p-[18px]">
                  <input className={inp} placeholder="Code" value={newRoleCodeCreate} onChange={(e) => setNewRoleCodeCreate(e.target.value)} disabled={isReadOnly} />
                  <input className={inp} placeholder="Name" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} disabled={isReadOnly} />
                  <input className={inp} placeholder="Description" value={newRoleDescription} onChange={(e) => setNewRoleDescription(e.target.value)} disabled={isReadOnly} />
                  <button
                    type="button"
                    className={btnPri}
                    disabled={isReadOnly}
                    onClick={() =>
                      void runRbacAction(() => {
                        if (!newRoleCodeCreate.trim() || !newRoleName.trim()) throw new Error('Code and name required.');
                        return createRole({ code: newRoleCodeCreate.trim(), name: newRoleName.trim(), description: newRoleDescription.trim() });
                      }, 'Role created.', 'cr')
                    }
                  >
                    Create role
                  </button>
                </div>
              </div>
              <div className={card}>
                <div className={`border-b ${line} px-[18px] py-3`}>
                  <h2 className="text-[15px] font-bold">Create permission</h2>
                </div>
                <div className="space-y-2 p-[18px]">
                  <div className="grid grid-cols-2 gap-2">
                    <input className={inp} placeholder="Resource" value={newPermRes} onChange={(e) => setNewPermRes(e.target.value)} disabled={isReadOnly} />
                    <input className={inp} placeholder="Action" value={newPermAct} onChange={(e) => setNewPermAct(e.target.value)} disabled={isReadOnly} />
                  </div>
                  <input className={inp} placeholder="Description" value={newPermDesc} onChange={(e) => setNewPermDesc(e.target.value)} disabled={isReadOnly} />
                  <button
                    type="button"
                    className={btnPri}
                    disabled={isReadOnly}
                    onClick={() =>
                      void runRbacAction(() => {
                        if (!newPermRes.trim() || !newPermAct.trim()) throw new Error('Resource and action required.');
                        return createPermission({
                          resource: newPermRes.trim(),
                          action: newPermAct.trim(),
                          description: newPermDesc.trim(),
                        });
                      }, 'Permission created.', 'cp')
                    }
                  >
                    Create permission
                  </button>
                </div>
              </div>
              <div className={card}>
                <div className={`border-b ${line} px-[18px] py-3`}>
                  <h2 className="text-[15px] font-bold">Edit role</h2>
                </div>
                <div className="space-y-2 p-[18px]">
                  <input className={inp} value={roleUpdateName} onChange={(e) => setRoleUpdateName(e.target.value)} disabled={isReadOnly} />
                  <input className={inp} value={roleUpdateDescription} onChange={(e) => setRoleUpdateDescription(e.target.value)} disabled={isReadOnly} />
                  <label className={`flex items-center gap-2 text-[12px] ${muted}`}>
                    <input type="checkbox" checked={roleUpdateActive} onChange={(e) => setRoleUpdateActive(e.target.checked)} disabled={isReadOnly} />
                    Active
                  </label>
                  <button
                    type="button"
                    className={btn}
                    disabled={isReadOnly || !selectedRoleId}
                    onClick={() =>
                      void runRbacAction(
                        () => updateRole(selectedRoleId, { name: roleUpdateName, description: roleUpdateDescription, is_active: roleUpdateActive }),
                        'Role updated.',
                        'ur',
                      )
                    }
                  >
                    Save role
                  </button>
                </div>
              </div>
              <div className={card}>
                <div className={`border-b ${line} px-[18px] py-3`}>
                  <h2 className="text-[15px] font-bold">Custom permissions (auditors)</h2>
                </div>
                <div className="space-y-2 p-[18px]">
                  <p className={`text-[12px] ${muted}`}>Applies to auditor-role users. Format resource:action</p>
                  <select className={inp} value={customPermUserId} onChange={(e) => setCustomPermUserId(e.target.value)} disabled={isReadOnly}>
                    <option value="">User…</option>
                    {adminUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.email}
                      </option>
                    ))}
                  </select>
                  <input className={inp} value={customPermKeys} onChange={(e) => setCustomPermKeys(e.target.value)} disabled={isReadOnly} />
                  <div className="flex gap-2">
                    <button type="button" className={btnPri} disabled={isReadOnly} onClick={() => void onCustomAssign()}>
                      Assign
                    </button>
                    <button type="button" className={btn} disabled={isReadOnly} onClick={() => void onCustomReset()}>
                      Reset defaults
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {mainTab === 'check' ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className={card}>
              <div className={`border-b ${line} px-[18px] py-3`}>
                <h2 className="text-[15px] font-bold">Permission check</h2>
              </div>
              <div className="space-y-3 p-[18px]">
                <p className={`text-[12px] ${muted}`}>Leave user unset to check your own session.</p>
                <select className={inp} value={targetUserId} onChange={(e) => setTargetUserId(e.target.value)}>
                  <option value="">My session</option>
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.email} — {u.role}
                    </option>
                  ))}
                </select>
                <select className={inp} value={selectedCheckPermissionId} onChange={(e) => setSelectedCheckPermissionId(e.target.value)}>
                  <option value="">Permission…</option>
                  {permissions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.resource}:{p.action}
                    </option>
                  ))}
                </select>
                <button type="button" className={btnPri} onClick={() => void onCheckPerm()} disabled={Boolean(actionLoading)}>
                  Run check
                </button>
                {permissionCheckResult ? (
                  <p
                    className={`inline-flex rounded-xl border px-3 py-2 text-[13px] font-bold ${
                      permissionCheckResult.allowed
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                        : 'border-red-300 bg-red-50 text-red-900'
                    }`}
                  >
                    {permissionCheckResult.allowed ? 'Allowed' : 'Denied'}
                  </p>
                ) : null}
                <p className={`text-[10px] font-bold uppercase ${muted}`}>Multi check</p>
                <input className={inp} value={multiPermissionKeys} onChange={(e) => setMultiPermissionKeys(e.target.value)} />
                <button type="button" className={btnPri} onClick={() => void onMultiCheck()} disabled={Boolean(actionLoading)}>
                  Run multi-check
                </button>
                {multiPermissionResult ? (
                  <div className={`rounded-xl border ${line} p-3 text-[12px]`}>
                    {Object.entries(multiPermissionResult).map(([k, ok]) => (
                      <div key={k} className="flex justify-between border-b border-[rgba(155,181,224,0.06)] py-1 last:border-0">
                        <code className={muted}>{k}</code>
                        <span className={ok ? 'font-semibold text-emerald-800' : 'font-semibold text-red-800'}>{ok ? 'Allowed' : 'Denied'}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
            <div className={card}>
              <div className={`border-b ${line} px-[18px] py-3`}>
                <h2 className="text-[15px] font-bold">Quick user lookup</h2>
              </div>
              <div className="space-y-3 p-[18px]">
                <select className={inp} value={lookupUserId} onChange={(e) => setLookupUserId(e.target.value)}>
                  <option value="">User…</option>
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.email}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button type="button" className={btn} onClick={() => void onLoadUserRoles(lookupUserId)} disabled={!lookupUserId}>
                    View roles
                  </button>
                  <button type="button" className={btn} onClick={() => void onLoadUserPerms(lookupUserId)} disabled={!lookupUserId}>
                    View permissions
                  </button>
                </div>
                {rolesFetched ? (
                  <div className={`rounded-xl border ${line} p-3`}>
                    <p className="text-[11px] font-bold uppercase text-slate-500">Roles</p>
                    {userRolesResult.length ? (
                      <ul className="mt-1 text-[12px]">
                        {userRolesResult.map((r) => (
                          <li key={r.id}>
                            {r.name} ({r.code})
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className={`text-sm ${muted}`}>None</p>
                    )}
                  </div>
                ) : null}
                {permissionsFetched ? (
                  <div className={`rounded-xl border ${line} p-3`}>
                    <p className="text-[11px] font-bold uppercase text-slate-500">Permissions</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {userPermissionsResult.map((p) => (
                        <code key={p.id} className="text-[10px]">
                          {p.resource}:{p.action}
                        </code>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {mainTab === 'roleswitch' && !isReadOnly ? (
          <div className="max-w-[680px] space-y-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-[12px] text-amber-900">
              QA and testing only. Temporarily switches your session. Use End switch to return. Actions are logged.
            </div>
            <div className={card}>
              <div className={`border-b ${line} px-[18px] py-3`}>
                <h2 className="text-[15px] font-bold">Switch role</h2>
              </div>
              <form className="space-y-3 p-[18px]" onSubmit={onSwitchRole}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setSwitchRole('customer')}
                    className={`rounded-[14px] border p-3 text-center text-slate-800 ${switchRole === 'customer' ? 'border-[#10284F] bg-[#eef4ff]' : `${line} border bg-white hover:bg-slate-50`}`}
                  >
                    <p className="font-bold">Customer</p>
                    <p className={`text-[10px] ${muted}`}>Customer dashboard</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSwitchRole('auditor')}
                    className={`rounded-[14px] border p-3 text-center text-slate-800 ${switchRole === 'auditor' ? 'border-[#10284F] bg-[#eef4ff]' : `${line} border bg-white hover:bg-slate-50`}`}
                  >
                    <p className="font-bold">Auditor</p>
                    <p className={`text-[10px] ${muted}`}>Read-only admin</p>
                  </button>
                </div>
                <input className={inp} value={switchReason} onChange={(e) => setSwitchReason(e.target.value)} placeholder="Reason *" />
                <input className={inp} type="number" min={1} value={switchDuration} onChange={(e) => setSwitchDuration(Number(e.target.value))} />
                <div className="flex gap-2">
                  <button type="submit" className={btnPri} disabled={loading}>
                    Switch role
                  </button>
                  <button type="button" className={btn} onClick={() => void onEndSwitch()} disabled={loading}>
                    End switch
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

