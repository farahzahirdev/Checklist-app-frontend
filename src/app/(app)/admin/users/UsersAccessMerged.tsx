'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { translate, useLocale } from '@/lib/i18n';
import { adminUsersAccessMessages } from '@/locales/admin-users-access';
import {
  activateCustomer,
  assignPermissionsToUser,
  changeAdminUserRole,
  deactivateCustomer,
  getAdminUser,
  getCustomer,
  impersonateAdminUser,
  impersonateCustomer,
  listAdminUsers,
  listCustomers,
  resetCustomerMfa,
  resetAdminUserPassword,
  resetUserPermissions,
  updateCustomerMfaRequired,
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
import { ADMIN_PAGE_TITLE_CLASS } from '@/app/(app)/admin/admin-page-title';
import { beginRoleSwitchSession, clearRoleSwitchSession } from '@/lib/auth';
import {
  formatActionLabel,
  formatPermissionLine,
  formatPermissionRowLabel,
  formatResourceTitle,
  permissionKey,
} from '@/lib/permission-labels';

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

type MainTab = 'users' | 'customers' | 'rbac' | 'check';

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

function permissionBadgeClass(resource: string) {
  const palette: Record<string, string> = {
    user_management: 'border-rose-200 bg-rose-50 text-rose-800',
    permission_management: 'border-violet-200 bg-violet-50 text-violet-800',
    audit_log: 'border-amber-200 bg-amber-50 text-amber-800',
    payment: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    payment_management: 'border-teal-200 bg-teal-50 text-teal-800',
    dashboard: 'border-sky-200 bg-sky-50 text-sky-800',
    checklist: 'border-indigo-200 bg-indigo-50 text-indigo-800',
    checklist_admin: 'border-blue-200 bg-blue-50 text-blue-800',
    assessment: 'border-cyan-200 bg-cyan-50 text-cyan-800',
    assessment_submit: 'border-lime-200 bg-lime-50 text-lime-800',
    report: 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800',
  };
  return palette[resource] ?? 'border-slate-200 bg-slate-50 text-slate-700';
}

type PermissionMatrixProps = {
  permissionsList: RbacPermission[];
  selectedKeys: Set<string>;
  onChange: (next: Set<string>) => void;
  disabled?: boolean;
};

function RbacPermissionMatrix({ permissionsList, selectedKeys, onChange, disabled }: PermissionMatrixProps) {
  const grouped = useMemo(() => {
    const active = permissionsList.filter((p) => p.is_active);
    const byRes = new Map<string, RbacPermission[]>();
    for (const p of active) {
      const list = byRes.get(p.resource) ?? [];
      list.push(p);
      byRes.set(p.resource, list);
    }
    for (const list of byRes.values()) {
      list.sort((a, b) => formatActionLabel(a.action).localeCompare(formatActionLabel(b.action)));
    }
    return [...byRes.entries()].sort((a, b) => formatResourceTitle(a[0]).localeCompare(formatResourceTitle(b[0])));
  }, [permissionsList]);

  const toggleKey = (key: string) => {
    if (disabled) return;
    const next = new Set(selectedKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange(next);
  };

  const selectAllResource = (resource: string, select: boolean) => {
    if (disabled) return;
    const next = new Set(selectedKeys);
    const perms = grouped.find(([r]) => r === resource)?.[1] ?? [];
    for (const p of perms) {
      const k = permissionKey(p.resource, p.action);
      if (select) next.add(k);
      else next.delete(k);
    }
    onChange(next);
  };

  if (!grouped.length) {
    return <p className={`text-[12px] ${muted}`}>No permissions available.</p>;
  }

  return (
    <div className={`max-h-[min(360px,50vh)] space-y-3 overflow-y-auto pr-1 ${scrollYScrollbarHidden}`}>
      {grouped.map(([resource, perms]) => {
        const total = perms.length;
        const selectedCount = perms.filter((p) => selectedKeys.has(permissionKey(p.resource, p.action))).length;
        const allSelected = selectedCount === total && total > 0;
        return (
          <div key={resource} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <p className="text-[13px] font-bold text-slate-900">{formatResourceTitle(resource)}</p>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[11px] font-semibold tabular-nums text-slate-500">
                  {selectedCount}/{total} selected
                </span>
                <button
                  type="button"
                  disabled={disabled}
                  className="text-[11px] font-semibold text-[#10284F] underline-offset-2 hover:underline disabled:opacity-50"
                  onClick={() => selectAllResource(resource, !allSelected)}
                >
                  {allSelected ? 'Deselect all' : 'Select all'}
                </button>
              </div>
            </div>
            <div className="space-y-1">
              {perms.map((p) => {
                const k = permissionKey(p.resource, p.action);
                const checked = selectedKeys.has(k);
                return (
                  <label
                    key={p.id}
                    className="flex cursor-pointer items-start gap-2 rounded-lg px-1 py-1.5 hover:bg-slate-50 has-[:disabled]:cursor-not-allowed"
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 accent-[#10284F]"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggleKey(k)}
                    />
                    <span className="text-[12px] font-medium leading-snug text-slate-900">{formatPermissionRowLabel(p)}</span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Badge({ children, v }: { children: ReactNode; v: 'green' | 'blue' | 'gold' | 'red' | 'gray' }) {
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

function recordChild(obj: Record<string, unknown> | null | undefined, key: string): Record<string, unknown> | null {
  if (!obj) return null;
  const v = obj[key];
  if (v && typeof v === 'object' && !Array.isArray(v)) return v as Record<string, unknown>;
  return null;
}

function pairsFromPermissionKeySet(keys: Set<string>): Array<[string, string]> {
  const pairs: Array<[string, string]> = [];
  for (const key of keys) {
    const idx = key.indexOf(':');
    if (idx <= 0) continue;
    const res = key.slice(0, idx).trim();
    const act = key.slice(idx + 1).trim();
    if (res && act) pairs.push([res, act]);
  }
  return pairs;
}

function permissionIdsFromKeySet(keys: Set<string>, list: RbacPermission[]): string[] {
  return Array.from(keys)
    .map((k) => list.find((p) => permissionKey(p.resource, p.action) === k)?.id ?? null)
    .filter((id): id is string => Boolean(id));
}

export default function UsersAccessMerged() {
  const { locale } = useLocale();
  const t = (key: string) => translate(adminUsersAccessMessages, locale, key);
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
  const [inspectorPermSelected, setInspectorPermSelected] = useState<Set<string>>(() => new Set());
  const [resetPasswordValue, setResetPasswordValue] = useState('');
  const [resetPasswordReason, setResetPasswordReason] = useState('Admin requested password reset');
  const [impersonationReason, setImpersonationReason] = useState('Impersonation requested by admin');
  const [customerReason, setCustomerReason] = useState('Support action');
  const [customerMfaRequired, setCustomerMfaRequired] = useState(true);
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
  const [targetUserMenuOpen, setTargetUserMenuOpen] = useState(false);
  const [targetRoleId, setTargetRoleId] = useState('');
  const [targetRoleMenuOpen, setTargetRoleMenuOpen] = useState(false);
  const [targetRoleSearchQuery, setTargetRoleSearchQuery] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [selectedRoleMenuOpen, setSelectedRoleMenuOpen] = useState(false);
  const [selectedRoleSearchQuery, setSelectedRoleSearchQuery] = useState('');
  const [selectedPermissionId, setSelectedPermissionId] = useState('');
  const [permissionMenuOpen, setPermissionMenuOpen] = useState(false);
  const [permissionSearchQuery, setPermissionSearchQuery] = useState('');
  const [bulkRolePermSelected, setBulkRolePermSelected] = useState<Set<string>>(() => new Set());
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
  const [multiCheckPermSelected, setMultiCheckPermSelected] = useState<Set<string>>(() => new Set());
  const [multiPermissionResult, setMultiPermissionResult] = useState<Record<string, boolean> | null>(null);
  const [lookupUserId, setLookupUserId] = useState('');
  const [userRolesResult, setUserRolesResult] = useState<Array<{ id: string; code: string; name: string }>>([]);
  const [userPermissionsResult, setUserPermissionsResult] = useState<
    Array<{ id: string; resource: string; action: string; description: string }>
  >([]);
  const [rolesFetched, setRolesFetched] = useState(false);
  const [permissionsFetched, setPermissionsFetched] = useState(false);
  const [checkUserMenuOpen, setCheckUserMenuOpen] = useState(false);
  const [checkPermissionMenuOpen, setCheckPermissionMenuOpen] = useState(false);
  const [lookupUserMenuOpen, setLookupUserMenuOpen] = useState(false);
  const [checkUserSearchQuery, setCheckUserSearchQuery] = useState('');
  const [checkPermissionSearchQuery, setCheckPermissionSearchQuery] = useState('');
  const [lookupUserSearchQuery, setLookupUserSearchQuery] = useState('');
  const [selectedRoleDetail, setSelectedRoleDetail] = useState<{
    id: string;
    user_count: number;
    permissions: RbacPermission[];
  } | null>(null);
  const [rbacUserSearch, setRbacUserSearch] = useState('');
  const [auditorUserSearch, setAuditorUserSearch] = useState('');
  const [auditorUserListUnavailable, setAuditorUserListUnavailable] = useState(false);
  const [customPermUserId, setCustomPermUserId] = useState('');
  const [customPermUserMenuOpen, setCustomPermUserMenuOpen] = useState(false);
  const [customPermUserSearchQuery, setCustomPermUserSearchQuery] = useState('');
  const [customPermSelected, setCustomPermSelected] = useState<Set<string>>(() => new Set());
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

  const selectedPermission = useMemo(
    () => permissions.find((p) => p.id === selectedPermissionId) ?? null,
    [permissions, selectedPermissionId],
  );
  const selectedTargetRole = useMemo(
    () => roles.find((r) => r.id === targetRoleId) ?? null,
    [roles, targetRoleId],
  );
  const filteredTargetRoles = useMemo(() => {
    const q = targetRoleSearchQuery.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter((r) => `${r.name} ${r.code}`.toLowerCase().includes(q));
  }, [roles, targetRoleSearchQuery]);
  const selectedRoleOption = useMemo(
    () => roles.find((r) => r.id === selectedRoleId) ?? null,
    [roles, selectedRoleId],
  );
  const filteredSelectedRoles = useMemo(() => {
    const q = selectedRoleSearchQuery.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter((r) => `${r.name} ${r.code}`.toLowerCase().includes(q));
  }, [roles, selectedRoleSearchQuery]);
  const selectedCustomPermUser = useMemo(
    () => adminUsers.find((u) => u.id === customPermUserId) ?? null,
    [adminUsers, customPermUserId],
  );
  const filteredCustomPermUsers = useMemo(() => {
    const q = customPermUserSearchQuery.trim().toLowerCase();
    if (!q) return adminUsers;
    return adminUsers.filter((u) => u.email.toLowerCase().includes(q));
  }, [adminUsers, customPermUserSearchQuery]);
  const filteredPermissionOptions = useMemo(() => {
    const q = permissionSearchQuery.trim().toLowerCase();
    if (!q) return permissions;
    return permissions.filter((p) => {
      const blob = `${p.resource}:${p.action} ${p.description ?? ''} ${formatPermissionLine(p)}`.toLowerCase();
      return blob.includes(q);
    });
  }, [permissions, permissionSearchQuery]);
  const selectedCheckPermission = useMemo(
    () => permissions.find((p) => p.id === selectedCheckPermissionId) ?? null,
    [permissions, selectedCheckPermissionId],
  );
  const filteredCheckPermissionOptions = useMemo(() => {
    const q = checkPermissionSearchQuery.trim().toLowerCase();
    if (!q) return permissions;
    return permissions.filter((p) => {
      const blob = `${p.resource}:${p.action} ${p.description ?? ''} ${formatPermissionLine(p)}`.toLowerCase();
      return blob.includes(q);
    });
  }, [permissions, checkPermissionSearchQuery]);
  const selectedTargetUser = useMemo(
    () => allUsers.find((u) => u.id === targetUserId) ?? null,
    [allUsers, targetUserId],
  );
  const filteredCheckUsers = useMemo(() => {
    const q = checkUserSearchQuery.trim().toLowerCase();
    if (!q) return allUsers;
    return allUsers.filter((u) => `${u.email} ${u.role}`.toLowerCase().includes(q));
  }, [allUsers, checkUserSearchQuery]);
  const selectedLookupUser = useMemo(
    () => allUsers.find((u) => u.id === lookupUserId) ?? null,
    [allUsers, lookupUserId],
  );
  const filteredLookupUsers = useMemo(() => {
    const q = lookupUserSearchQuery.trim().toLowerCase();
    if (!q) return allUsers;
    return allUsers.filter((u) => u.email.toLowerCase().includes(q));
  }, [allUsers, lookupUserSearchQuery]);

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
  }, [isReadOnly, userSearchQuery, userRoleFilter, customerSearchQuery, customerActiveFilter, locale]);

  const loadRbacMeta = useCallback(async () => {
    setRbacMetaLoading(true);
    try {
      const [permRes, roleRes] = await Promise.all([
        listPermissions().catch(() => [] as RbacPermission[]),
        listRoles().catch(() => [] as RbacRole[]),
      ]);
      setPermissions(permRes);
      setRoles(roleRes);
    } catch (err) {
      if (!isReadOnly) {
        toast.error(err instanceof Error ? err.message : 'Failed to load RBAC metadata');
      }
    } finally {
      setRbacMetaLoading(false);
    }
  }, [isReadOnly]);

  useEffect(() => {
    const t = searchParams.get('tab');
    const valid: MainTab[] = isReadOnly ? ['users', 'customers'] : ['users', 'customers', 'rbac', 'check'];
    if (t && valid.includes(t as MainTab)) {
      setMainTab(t as MainTab);
    } else if (isReadOnly && (mainTab === 'rbac' || mainTab === 'check')) {
      setMainTab('users');
    }
  }, [searchParams, isReadOnly, mainTab]);

  useEffect(() => {
    if (isReadOnly && (inspTab === 'actions' || inspTab === 'security')) {
      setInspTab('details');
    }
  }, [isReadOnly, inspTab]);

  useEffect(() => {
    if (isReadOnly && (custInspTab === 'dashboard' || custInspTab === 'actions')) {
      setCustInspTab('details');
    }
  }, [isReadOnly, custInspTab]);

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
    const listUser = adminUsers.find((u) => u.id === selectedAdminId);
    let c = false;
    void (async () => {
      try {
        if (isReadOnly) {
          if (!listUser) {
            if (!c) setAdminDetail(null);
            return;
          }
          const permsData = await getUserPermissions(selectedAdminId);
          if (!c) {
            setAdminDetail({
              ...listUser,
              permissions: permsData.permissions.map((p) => ({
                resource: p.resource,
                action: p.action,
              })),
              roles_assigned: permsData.roles.map((r) => r.code),
            });
          }
          return;
        }
        const d = await getAdminUser(selectedAdminId);
        if (!c) setAdminDetail(d);
      } catch {
        if (!c) setAdminDetail(listUser ? { ...listUser, permissions: [], roles_assigned: [] } : null);
      }
    })();
    return () => {
      c = true;
    };
  }, [selectedAdminId, isReadOnly, adminUsers]);

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
    if (customerDetail) {
      setCustomerMfaRequired(Boolean(customerDetail.mfa_required));
    }
  }, [customerDetail]);

  useEffect(() => {
    if (!adminDetail) {
      setInspectorPermSelected(new Set());
      return;
    }
    setInspectorPermSelected(new Set(adminDetail.permissions.map((p) => permissionKey(p.resource, p.action))));
  }, [adminDetail]);

  useEffect(() => {
    if (!customPermUserId) {
      setCustomPermSelected(new Set());
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const data = await getUserPermissions(customPermUserId);
        if (cancelled) return;
        const list = Array.isArray(data.permissions) ? data.permissions : [];
        setCustomPermSelected(new Set(list.map((p) => permissionKey(p.resource, p.action))));
      } catch {
        if (!cancelled) setCustomPermSelected(new Set());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [customPermUserId]);

  useEffect(() => {
    setBulkRolePermSelected(new Set());
  }, [selectedRoleId]);

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
    setMultiCheckPermSelected(new Set());
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
    setMainTab(t);
    router.replace(`/admin/users?tab=${t}`, { scroll: false });
  };

  const dashIfCustomer = recordChild(customerDash, 'if_customer');
  const dashAssessmentBoard =
    recordChild(dashIfCustomer, 'assessment_dashboard') ?? recordChild(customerDash, 'assessment_dashboard');
  const dashPaymentBoard =
    recordChild(dashIfCustomer, 'payment_dashboard') ?? recordChild(customerDash, 'payment_dashboard');

  const dashRecent = (() => {
    const fromDash = dashAssessmentBoard?.recent_submissions;
    if (Array.isArray(fromDash)) return fromDash as Array<Record<string, unknown>>;
    const legacy = customerDash?.recent_assessments;
    if (Array.isArray(legacy)) return legacy as Array<Record<string, unknown>>;
    const rec = recordChild(dashIfCustomer, 'assessment_records');
    const assessments = rec?.assessments;
    if (Array.isArray(assessments)) return assessments as Array<Record<string, unknown>>;
    return [];
  })();
  const dashChecklists = (() => {
    const fromDash = dashAssessmentBoard?.available_checklists;
    if (Array.isArray(fromDash)) return fromDash as Array<Record<string, unknown>>;
    const legacy = customerDash?.available_checklists;
    return Array.isArray(legacy) ? (legacy as Array<Record<string, unknown>>) : [];
  })();
  const dashPaymentPreview = (() => {
    if (!customerDash) {
      return { legacyStatus: null as string | null, count: null as number | null, amount: null as string | null };
    }
    const legacy = customerDash.payment_status;
    if (typeof legacy === 'string' && legacy.trim()) {
      return { legacyStatus: legacy.trim(), count: null, amount: null };
    }
    const summary = recordChild(dashPaymentBoard, 'summary');
    let count: number | null = null;
    let amount: string | null = null;
    if (summary) {
      const tp = summary.total_payments;
      const tf = summary.total_amount_formatted;
      if (typeof tp === 'number') count = tp;
      if (typeof tf === 'string' && tf.trim()) amount = tf.trim();
    }
    if (count === null) {
      const payRec = recordChild(dashIfCustomer, 'payment_records');
      const payments = payRec?.payments;
      if (Array.isArray(payments)) count = payments.length;
    }
    return { legacyStatus: null, count, amount };
  })();

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
    const pairs = pairsFromPermissionKeySet(inspectorPermSelected);
    if (!pairs.length) return toast.error('Select at least one permission.');
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

  async function onUpdateCustomerMfaRequired() {
    if (!selectedCustomerId) return toast.error('Select customer first.');
    setActionLoading('mfa-required');
    setLoading(true);
    try {
      await updateCustomerMfaRequired(selectedCustomerId, {
        mfa_required: customerMfaRequired,
        reason: customerReason,
      });
      toast.success('Customer MFA requirement updated.');
      const d = await getCustomer(selectedCustomerId);
      setCustomerDetail(d);
      await loadLists();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setActionLoading('');
      setLoading(false);
    }
  }

  async function onResetCustomerMfa() {
    if (!selectedCustomerId) return toast.error('Select customer first.');
    setActionLoading('mfa-reset');
    setLoading(true);
    try {
      await resetCustomerMfa(selectedCustomerId, { reason: customerReason });
      toast.success('Customer MFA reset. User can relink MFA now.');
      const d = await getCustomer(selectedCustomerId);
      setCustomerDetail(d);
      await loadLists();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setActionLoading('');
      setLoading(false);
    }
  }

  async function onImpersonateAdminUser() {
    if (!selectedAdminId || !impersonationReason.trim()) return toast.error('Reason required.');
    setActionLoading('impersonate-admin');
    setLoading(true);
    try {
      const response = await impersonateAdminUser(selectedAdminId, {
        reason: impersonationReason,
        duration_minutes: 30,
      });
      beginRoleSwitchSession(response.temporary_token);
      toast.success('Impersonation started.');
      router.push('/admin');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setActionLoading('');
      setLoading(false);
    }
  }

  async function onImpersonateCustomer() {
    if (!selectedCustomerId || !customerReason.trim()) return toast.error('Reason required.');
    setActionLoading('impersonate-customer');
    setLoading(true);
    try {
      const response = await impersonateCustomer(selectedCustomerId, {
        reason: customerReason,
        duration_minutes: 30,
      });
      beginRoleSwitchSession(response.temporary_token);
      toast.success('Impersonation started.');
      router.push('/dashboard');
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
    const pairs = pairsFromPermissionKeySet(multiCheckPermSelected);
    if (!pairs.length) return toast.error('Select at least one permission.');
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
    const pairs = pairsFromPermissionKeySet(customPermSelected);
    if (!pairs.length) return toast.error('Select at least one permission.');
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
      const data = await getUserPermissions(customPermUserId);
      const list = Array.isArray(data.permissions) ? data.permissions : [];
      setCustomPermSelected(new Set(list.map((p) => permissionKey(p.resource, p.action))));
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
    <div className={`${shell} min-w-0 p-3 sm:p-4 md:p-5`}>
      <div className="pb-5">
        <h1 className={ADMIN_PAGE_TITLE_CLASS}>{t('title')}</h1>
        <p className={`mt-1 max-w-[560px] text-[13px] ${muted}`}>
          {t('subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4">
        {(
          [
            { k: t('stats.adminUsers.title'), v: adminUsers.length, sub: t('stats.adminUsers.subtitle'), icon: 'admin-users' as const },
            { k: t('stats.customers.title'), v: customers.length, sub: t('stats.customers.subtitle'), icon: 'customers' as const },
            { k: t('stats.roles.title'), v: roles.length, sub: t('stats.roles.subtitle'), icon: 'roles' as const },
            { k: t('stats.permissions.title'), v: permissions.length, sub: t('stats.permissions.subtitle'), icon: 'permissions' as const },
          ] as const
        ).map((s) => (
          <div key={s.k} className={`${statCardClass} min-w-0`}>
            <div className="absolute right-2 top-2 opacity-95 sm:right-3 sm:top-3">
              <StatIcon type={s.icon} />
            </div>
            <p className="truncate pr-10 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#8fabd4] sm:pr-12 sm:text-[10px] sm:tracking-[0.12em]">
              {s.k}
            </p>
            <p className="mt-1 text-[26px] font-extrabold leading-none tracking-[-0.05em] text-white sm:text-[32px]">
              {(s.icon === 'admin-users' || s.icon === 'customers' ? listsLoading : rbacMetaLoading) ? '…' : s.v}
            </p>
            <p className="mt-1 text-[11px] text-[#b8cae7]">{s.sub}</p>
          </div>
        ))}
      </div>

      <div
        className={`mt-3 flex flex-nowrap gap-1 overflow-x-auto overflow-y-hidden rounded-t-lg bg-slate-100/90 p-1 pb-0 ring-1 ring-slate-200/80 [-webkit-overflow-scrolling:touch] sm:mt-4`}
        role="tablist"
        aria-label={t('title')}
      >
        {(
          (
            [
              ['users', t('tabs.users')],
              ['customers', t('tabs.customers')],
              ['rbac', t('tabs.rbac')],
              ['check', t('tabs.check')],
            ] as const
          ).filter(([id]) => !isReadOnly || id === 'users' || id === 'customers')
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={mainTab === id}
            className={
              mainTab === id
                ? 'shrink-0 rounded-t-[10px] border border-slate-200 border-b-white bg-white px-3 py-2 text-[11px] font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200/80 sm:px-[18px] sm:text-[12px]'
                : 'shrink-0 rounded-t-[10px] border border-transparent px-3 py-2 text-[11px] font-semibold text-slate-700 hover:bg-white hover:text-slate-900 sm:px-[18px] sm:text-[12px]'
            }
            onClick={() => setTab(id as MainTab)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 min-w-0">
        {mainTab === 'users' ? (
          <div className="grid min-w-0 gap-4 lg:grid-cols-[1fr_340px]">
            <div className="grid min-w-0 gap-4">
              <div className={`${card} min-w-0`}>
                <div className={`flex flex-col gap-3 border-b ${line} px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-[18px]`}>
                  <div className="min-w-0">
                    <h2 className="text-[14px] font-bold text-slate-900 sm:text-[15px]">{t('users.sectionTitle')}</h2>
                    <p className={`text-[11px] sm:text-[12px] ${muted}`}>{t('users.sectionHint')}</p>
                  </div>
                  <div
                    className={`flex w-full min-w-0 items-center gap-2 rounded-[11px] border ${line} bg-slate-50 px-3 py-2 focus-within:border-[#10284F] sm:w-auto sm:min-w-[200px] sm:max-w-[320px] sm:flex-1`}
                  >
                    <input
                      className="min-w-0 flex-1 bg-transparent text-[12px] text-slate-900 outline-none placeholder:text-slate-500"
                      placeholder={t('users.searchPlaceholder')}
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className={`flex flex-wrap gap-2 border-b ${line} px-3 py-2 sm:px-[18px]`}>
                  <button
                    type="button"
                    className={filterChip(userRoleFilter === 'all' && userStatusFilter === 'all')}
                    onClick={() => {
                      setUserRoleFilter('all');
                      setUserStatusFilter('all');
                    }}
                  >
                    {t('filters.all')}
                  </button>
                  <button
                    type="button"
                    className={filterChip(userRoleFilter === 'admin')}
                    onClick={() => {
                      setUserRoleFilter('admin');
                      setUserStatusFilter('all');
                    }}
                  >
                    {t('filters.admin')}
                  </button>
                  <button
                    type="button"
                    className={filterChip(userRoleFilter === 'auditor')}
                    onClick={() => {
                      setUserRoleFilter('auditor');
                      setUserStatusFilter('all');
                    }}
                  >
                    {t('filters.auditor')}
                  </button>
                  <button
                    type="button"
                    className={filterChip(userStatusFilter === 'active' && userRoleFilter === 'all')}
                    onClick={() => {
                      setUserStatusFilter('active');
                      setUserRoleFilter('all');
                    }}
                  >
                    {t('filters.active')}
                  </button>
                  <button
                    type="button"
                    className={filterChip(userStatusFilter === 'inactive' && userRoleFilter === 'all')}
                    onClick={() => {
                      setUserStatusFilter('inactive');
                      setUserRoleFilter('all');
                    }}
                  >
                    {t('filters.inactive')}
                  </button>
                </div>
                <div className={`max-h-[min(420px,55vh)] overflow-y-auto sm:max-h-[420px] ${scrollYScrollbarHidden}`}>
                  <div className="overflow-x-auto">
                    <div className="min-w-[480px]">
                      <div
                        className={`grid grid-cols-[38px_minmax(0,1fr)_100px_80px] gap-2 border-b ${line} bg-slate-100 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 sm:gap-3 sm:px-[18px]`}
                      >
                        <div />
                        <div>{t('table.user')}</div>
                        <div>{t('table.role')}</div>
                        <div>{t('table.status')}</div>
                      </div>
                      <div>
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
                              className={`group grid cursor-pointer grid-cols-[38px_minmax(0,1fr)_100px_80px] gap-2 border-b border-[rgba(155,181,224,0.06)] px-3 py-2.5 transition hover:bg-[#eef4ff] sm:gap-3 sm:px-[18px] ${
                                sel ? 'border-l-2 border-l-[#10284F] bg-gradient-to-r from-[#eef4ff] to-white pl-3 sm:pl-4' : ''
                              }`}
                            >
                              <div
                                className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[11px] text-[12px] font-extrabold"
                                style={{ background: col.bg, color: col.fg }}
                              >
                                {initials(u.email)}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-[12px] font-semibold text-slate-900 sm:text-[13px]">{u.email}</p>
                                <p className={`text-[10px] sm:text-[11px] ${muted}`}>Staff</p>
                              </div>
                              <div className="min-w-0">
                                <Badge v={u.role === 'admin' ? 'blue' : 'gold'}>{u.role}</Badge>
                              </div>
                              <div className="min-w-0">
                                <Badge v={u.is_active ? 'green' : 'gray'}>{u.is_active ? t('common.active') : t('common.inactive')}</Badge>
                              </div>
                            </div>
                          );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <aside className={`${card} min-w-0 lg:sticky lg:top-2 lg:self-start`}>
              <div className={`flex min-w-0 items-center justify-between gap-2 border-b ${line} px-3 py-3 sm:px-[18px]`}>
                <h3 className="min-w-0 flex-1 truncate text-[13px] font-bold sm:text-[14px]">
                  {selectedAdminId ? (adminDetail?.email ?? 'Loading…') : 'Select a user'}
                </h3>
                <span className="shrink-0">
                  {adminDetail ? <Badge v={adminDetail.role === 'admin' ? 'blue' : 'gold'}>{adminDetail.role}</Badge> : <Badge v="gray">None</Badge>}
                </span>
              </div>
              {!selectedAdminId || !adminDetail ? (
                <div className={`px-4 py-10 text-center sm:px-6 ${muted}`}>
                  <p className="mb-2 text-3xl opacity-20">👆</p>
                  <p className="text-sm">{t('inspector.emptyAdmin')}</p>
                </div>
              ) : (
                <div>
                  <div className={`flex min-w-0 border-b ${line}`}>
                    {(['details', 'actions', 'security'] as const)
                      .filter((tab) => !isReadOnly || tab === 'details')
                      .map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        className={`min-w-0 flex-1 border-b-2 px-1 py-2 text-[10px] font-semibold capitalize sm:px-2 sm:text-[11px] ${
                          inspTab === tab ? 'border-[#10284F] text-slate-900' : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                        onClick={() => setInspTab(tab)}
                      >
                        {translate(adminUsersAccessMessages, locale, `inspector.tabs.${tab}`)}
                      </button>
                    ))}
                  </div>
                  <div className="p-3 sm:p-[18px]">
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
                            <dt>{t('inspector.status')}</dt>
                            <dd className="font-semibold text-slate-900">{adminDetail.is_active ? t('common.active') : t('common.inactive')}</dd>
                          </div>
                        </dl>
                        <p className="mb-2 mt-3 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">{t('inspector.permissions')}</p>
                        <div className="flex flex-wrap gap-1">
                          {adminDetail.permissions.length ? (
                            adminDetail.permissions.map((p) => (
                              <code
                                key={`${p.resource}:${p.action}`}
                                className={`rounded-md border px-2 py-0.5 text-[10px] ${permissionBadgeClass(p.resource)}`}
                              >
                                {formatPermissionLine(p)}
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
                        {adminDetail.role === 'auditor' ? (
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                            <p className="mb-3 text-[11px] text-slate-700">Impersonate this auditor session to verify their view and access.</p>
                            <div className="space-y-2">
                              <input
                                className={inp}
                                value={impersonationReason}
                                onChange={(e) => setImpersonationReason(e.target.value)}
                                placeholder="Reason for impersonation *"
                              />
                              <button
                                type="button"
                                className={btnPri}
                                onClick={() => void onImpersonateAdminUser()}
                                disabled={loading}
                              >
                                {actionLoading === 'impersonate-admin' ? 'Loading…' : 'Impersonate auditor'}
                              </button>
                            </div>
                          </div>
                        ) : null}
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
                          <RbacPermissionMatrix
                            permissionsList={permissions}
                            selectedKeys={inspectorPermSelected}
                            onChange={setInspectorPermSelected}
                            disabled={loading}
                          />
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
          <div className="grid min-w-0 gap-4 lg:grid-cols-[1fr_340px]">
            <div className={`${card} min-w-0`}>
              <div className={`flex flex-col gap-3 border-b ${line} px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-[18px]`}>
                <div className="min-w-0">
                  <h2 className="text-[14px] font-bold sm:text-[15px]">Customer accounts</h2>
                  <p className={`text-[11px] sm:text-[12px] ${muted}`}>Select a customer to manage or preview dashboard</p>
                </div>
                <div className={`flex w-full min-w-0 rounded-[11px] border ${line} bg-slate-50 px-3 py-2 sm:w-auto sm:max-w-[300px] sm:flex-1`}>
                  <input
                    className="min-w-0 flex-1 bg-transparent text-[12px] outline-none placeholder:text-slate-500"
                    placeholder="Search email…"
                    value={customerSearchQuery}
                    onChange={(e) => setCustomerSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className={`flex flex-wrap gap-2 border-b ${line} px-3 py-2 sm:px-[18px]`}>
                {(['all', 'active', 'inactive'] as const).map((k) => (
                  <button key={k} type="button" className={filterChip(customerActiveFilter === k)} onClick={() => setCustomerActiveFilter(k)}>
                    {k[0].toUpperCase() + k.slice(1)}
                  </button>
                ))}
              </div>
              <div className={`max-h-[min(420px,55vh)] overflow-y-auto sm:max-h-[420px] ${scrollYScrollbarHidden}`}>
                <div className="overflow-x-auto">
                  <div className="min-w-[360px]">
                    <div
                      className={`grid grid-cols-[38px_1fr_90px] gap-2 border-b ${line} bg-slate-100 px-3 py-2 text-[10px] font-bold uppercase text-slate-500 sm:gap-3 sm:px-[18px]`}
                    >
                      <div />
                      <div>Customer</div>
                      <div>Status</div>
                    </div>
                    <div>
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
                              className={`group grid cursor-pointer grid-cols-[38px_1fr_90px] gap-2 border-b border-[rgba(155,181,224,0.06)] px-3 py-2.5 hover:bg-[#eef4ff] sm:gap-3 sm:px-[18px] ${
                                sel ? 'border-l-2 border-l-[#10284F] bg-gradient-to-r from-[#eef4ff] to-transparent pl-3 sm:pl-4' : ''
                              }`}
                            >
                              <div
                                className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[11px] text-[12px] font-extrabold"
                                style={{ background: col.bg, color: col.fg }}
                              >
                                {initials(c.email)}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-[12px] font-semibold sm:text-[13px]">{c.email}</p>
                                <p className={`text-[10px] sm:text-[11px] ${muted}`}>Customer</p>
                              </div>
                              <div className="min-w-0">
                                <Badge v={c.is_active ? 'green' : 'gray'}>{c.is_active ? 'Active' : 'Inactive'}</Badge>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <aside className={`${card} min-w-0 lg:sticky lg:top-2 lg:self-start`}>
              <div className={`flex min-w-0 items-center justify-between gap-2 border-b ${line} px-3 py-3 sm:px-[18px]`}>
                <h3 className="min-w-0 flex-1 truncate text-[13px] font-bold sm:text-[14px]">
                  {selectedCustomerId ? (customerDetail?.email ?? '…') : 'Select a customer'}
                </h3>
                <span className="shrink-0">
                  {customerDetail ? (
                    <Badge v={customerDetail.is_active ? 'green' : 'gray'}>{customerDetail.is_active ? 'Active' : 'Inactive'}</Badge>
                  ) : (
                    <Badge v="gray">None</Badge>
                  )}
                </span>
              </div>
              {!selectedCustomerId || !customerDetail ? (
                <div className={`px-4 py-10 text-center sm:px-6 ${muted}`}>
                  <p className="mb-2 text-3xl opacity-20">🧑‍💼</p>
                  <p className="text-sm">Click a customer row for details and actions.</p>
                </div>
              ) : (
                <div>
                  <div className={`flex min-w-0 border-b ${line}`}>
                    {(['details', 'dashboard', 'actions'] as const)
                      .filter((tab) => !isReadOnly || tab === 'details')
                      .map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        className={`min-w-0 flex-1 border-b-2 px-1 py-2 text-[10px] font-semibold capitalize sm:px-2 sm:text-[11px] ${
                          custInspTab === tab ? 'border-[#10284F] text-slate-900' : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                        onClick={() => setCustInspTab(tab)}
                      >
                        {translate(adminUsersAccessMessages, locale, `inspector.tabs.${tab}`) || tab}
                      </button>
                    ))}
                  </div>
                  <div className="p-3 sm:p-[18px]">
                    {custInspTab === 'details' ? (
                      <div>
                        <div className="mb-4">
                          <p className={`mb-2 text-[11px] font-bold uppercase text-slate-500`}>User Details</p>
                          <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <div>
                              <p className="text-[10px] text-slate-600">Email</p>
                              <p className="text-[12px] font-semibold text-slate-900">{customerDetail.email}</p>
                            </div>
                            {customerDetail.full_name && (
                              <div>
                                <p className="text-[10px] text-slate-600">Full name</p>
                                <p className="text-[12px] text-slate-700">{customerDetail.full_name}</p>
                              </div>
                            )}
                            {customerDetail.username && (
                              <div>
                                <p className="text-[10px] text-slate-600">Username</p>
                                <p className="text-[12px] text-slate-700">{customerDetail.username}</p>
                              </div>
                            )}
                            {customerDetail.job_title && (
                              <div>
                                <p className="text-[10px] text-slate-600">Job title</p>
                                <p className="text-[12px] text-slate-700">{customerDetail.job_title}</p>
                              </div>
                            )}
                            {customerDetail.department && (
                              <div>
                                <p className="text-[10px] text-slate-600">Department</p>
                                <p className="text-[12px] text-slate-700">{customerDetail.department}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="mb-4">
                          <p className={`mb-2 text-[11px] font-bold uppercase text-slate-500`}>Company</p>
                          {customerDetail.company ? (
                            <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
                              <div>
                                <p className="text-[10px] text-slate-600">Name</p>
                                <p className="text-[12px] font-semibold text-slate-900">{customerDetail.company.name}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-slate-600">Slug</p>
                                <p className="text-[12px] font-mono text-slate-700">{customerDetail.company.slug}</p>
                              </div>
                              {customerDetail.company.email && (
                                <div>
                                  <p className="text-[10px] text-slate-600">Email</p>
                                  <p className="text-[12px] text-slate-700">{customerDetail.company.email}</p>
                                </div>
                              )}
                              {customerDetail.company.industry && (
                                <div>
                                  <p className="text-[10px] text-slate-600">Industry</p>
                                  <p className="text-[12px] text-slate-700">{customerDetail.company.industry}</p>
                                </div>
                              )}
                              {customerDetail.company.country && (
                                <div>
                                  <p className="text-[10px] text-slate-600">Country</p>
                                  <p className="text-[12px] text-slate-700">{customerDetail.company.country}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-[10px] text-slate-600">Status</p>
                                <p className="text-[12px]">
                                  {customerDetail.company.is_active ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-green-700">
                                      <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                                      Active
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">
                                      <span className="h-1.5 w-1.5 rounded-full bg-gray-600" />
                                      Inactive
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <p className="text-[12px] text-slate-500">No company assigned</p>
                          )}
                        </div>
                        <p className={`mb-2 text-[11px] font-bold uppercase text-slate-500`}>Permissions</p>
                        <div className="flex flex-wrap gap-1">
                          {customerDetail.permissions.map((p) => (
                            <code key={`${p.resource}:${p.action}`} className={`rounded-md border px-2 py-0.5 text-[10px] ${permissionBadgeClass(p.resource)}`}>
                              {formatPermissionLine(p)}
                            </code>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {custInspTab === 'dashboard' && !isReadOnly ? (
                      <div className="space-y-2">
                        <p className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-[12px] text-blue-900">
                          Preview loads live dashboard data for this customer.
                        </p>
                        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                          <button type="button" className={btnPri} onClick={() => void onCustomerDash()} disabled={loading}>
                            {actionLoading === 'dash' ? 'Loading…' : 'Load dashboard preview'}
                          </button>
                          <button
                            type="button"
                            className={btn}
                            onClick={() => void onImpersonateCustomer()}
                            disabled={loading}
                          >
                            {actionLoading === 'impersonate-customer' ? 'Loading…' : 'Impersonate customer'}
                          </button>
                        </div>
                        {customerDash ? (
                          <div className="mt-2 grid grid-cols-2 gap-2 text-[12px]">
                            <div className={`min-w-0 rounded-xl border ${line} p-2`}>
                              <p className={muted}>Payments</p>
                              <p className="break-words font-bold tabular-nums">
                                {dashPaymentPreview.legacyStatus ??
                                  (dashPaymentPreview.count !== null ? dashPaymentPreview.count : '—')}
                              </p>
                            </div>
                            <div className={`min-w-0 rounded-xl border ${line} p-2`}>
                              <p className={muted}>Total</p>
                              <p className="break-words font-bold">{dashPaymentPreview.amount ?? '—'}</p>
                            </div>
                            <div className={`min-w-0 rounded-xl border ${line} p-2`}>
                              <p className={muted}>Assessments</p>
                              <p className="font-bold tabular-nums">{dashRecent.length}</p>
                            </div>
                            <div className={`min-w-0 rounded-xl border ${line} p-2`}>
                              <p className={muted}>Checklists</p>
                              <p className="font-bold tabular-nums">{dashChecklists.length}</p>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                    {custInspTab === 'actions' && !isReadOnly ? (
                      <div className="space-y-2">
                        <label className={`text-[10px] font-bold uppercase text-slate-600`}>Reason *</label>
                        <input className={inp} value={customerReason} onChange={(e) => setCustomerReason(e.target.value)} />
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <p className="text-[11px] font-semibold text-slate-700">MFA settings</p>
                          <p className="mt-1 text-[11px] text-slate-600">
                            Current: {customerDetail.mfa_enabled ? 'MFA linked' : 'No MFA linked'}
                          </p>
                          <label className="mt-2 flex items-center gap-2 text-[12px] text-slate-700">
                            <input
                              type="checkbox"
                              checked={customerMfaRequired}
                              onChange={(e) => setCustomerMfaRequired(e.target.checked)}
                            />
                            MFA required for login
                          </label>
                          <div className="mt-2 flex flex-col gap-2">
                            <button
                              type="button"
                              className={btn}
                              onClick={() => void onUpdateCustomerMfaRequired()}
                              disabled={loading}
                            >
                              {actionLoading === 'mfa-required' ? 'Saving…' : 'Save MFA requirement'}
                            </button>
                            <button
                              type="button"
                              className={btnDanger}
                              onClick={() => void onResetCustomerMfa()}
                              disabled={loading}
                            >
                              {actionLoading === 'mfa-reset' ? 'Resetting…' : 'Reset linked MFA'}
                            </button>
                          </div>
                        </div>
                        <button
                          type="button"
                          className={btnPri}
                          onClick={() => void onImpersonateCustomer()}
                          disabled={loading}
                        >
                          {actionLoading === 'impersonate-customer' ? 'Loading…' : 'Impersonate customer'}
                        </button>
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
          <div className="grid min-w-0 gap-4 lg:grid-cols-[1fr_minmax(0,360px)]">
            <div className="grid min-w-0 gap-4">
              <div className={`${card} min-w-0`}>
                <div className={`border-b ${line} px-3 py-3 sm:px-[18px]`}>
                  <h2 className="text-[14px] font-bold sm:text-[15px]">Assign / remove role</h2>
                </div>
                <div className="space-y-3 p-3 sm:p-[18px]">
                  <div>
                    <label className={`mb-1 block text-[10px] font-bold uppercase ${muted}`}>User</label>
                    <div
                      className="relative"
                      onBlur={(event) => {
                        const next = event.relatedTarget as Node | null;
                        if (next && event.currentTarget.contains(next)) return;
                        setTargetUserMenuOpen(false);
                      }}
                    >
                      <button
                        type="button"
                        disabled={listsLoading}
                        className={`${inp} flex w-full items-center justify-between gap-2 text-left disabled:opacity-60`}
                        onClick={() => setTargetUserMenuOpen((open) => !open)}
                        aria-haspopup="listbox"
                        aria-expanded={targetUserMenuOpen}
                      >
                        <span className="truncate">
                          {selectedTargetUser
                            ? `${selectedTargetUser.email} (${selectedTargetUser.role})`
                            : 'Choose user…'}
                        </span>
                        <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-black" fill="none" aria-hidden="true">
                          <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      {targetUserMenuOpen ? (
                        <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-[0_10px_30px_rgba(15,23,42,0.14)]">
                          <input
                            className={`${inp} py-1.5 text-[12px]`}
                            placeholder="Search users…"
                            value={isReadOnly ? auditorUserSearch : rbacUserSearch}
                            onChange={(e) => (isReadOnly ? setAuditorUserSearch(e.target.value) : setRbacUserSearch(e.target.value))}
                            autoFocus
                          />
                          <div className={`mt-2 max-h-44 space-y-1 pr-1 ${scrollYScrollbarHidden}`}>
                            {(() => {
                              const selected = targetUserId ? allUsers.find((u) => u.id === targetUserId) : null;
                              const inFiltered = selected && filteredRbacUsers.some((u) => u.id === targetUserId);
                              const rows =
                                selected && !inFiltered ? [selected, ...filteredRbacUsers] : filteredRbacUsers;
                              return rows.map((u) => {
                                const isSelected = u.id === targetUserId;
                                return (
                                  <button
                                    key={u.id}
                                    type="button"
                                    role="option"
                                    aria-selected={isSelected}
                                    className={`w-full rounded-lg px-2 py-1.5 text-left text-[12px] ${
                                      isSelected ? 'bg-[#e9f1ff] text-[#10284F]' : 'text-slate-700 hover:bg-slate-100'
                                    }`}
                                    onClick={() => {
                                      setTargetUserId(u.id);
                                      setTargetUserMenuOpen(false);
                                    }}
                                  >
                                    {u.email} <span className={muted}>({u.role})</span>
                                  </button>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  {auditorUserListUnavailable ? <p className={`text-xs ${muted}`}>User listing may be unavailable in auditor mode.</p> : null}
                  {!isReadOnly ? (
                    <>
                      <div>
                        <label className={`mb-1 block text-[10px] font-bold uppercase ${muted}`}>Role</label>
                        <div
                          className="relative"
                          onBlur={(event) => {
                            const next = event.relatedTarget as Node | null;
                            if (next && event.currentTarget.contains(next)) return;
                            setTargetRoleMenuOpen(false);
                          }}
                        >
                          <button
                            type="button"
                            className={`${inp} flex items-center justify-between gap-2 text-left`}
                            onClick={() => setTargetRoleMenuOpen((open) => !open)}
                            aria-haspopup="listbox"
                            aria-expanded={targetRoleMenuOpen}
                          >
                            <span className="truncate">{selectedTargetRole ? `${selectedTargetRole.name} (${selectedTargetRole.code})` : 'Choose role…'}</span>
                            <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-black" fill="none" aria-hidden="true">
                              <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                          {targetRoleMenuOpen ? (
                            <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-[0_10px_30px_rgba(15,23,42,0.14)]">
                              <input
                                className={`${inp} py-1.5 text-[12px]`}
                                placeholder="Search role…"
                                value={targetRoleSearchQuery}
                                onChange={(e) => setTargetRoleSearchQuery(e.target.value)}
                                autoFocus
                              />
                              <div className={`mt-2 max-h-44 space-y-1 pr-1 ${scrollYScrollbarHidden}`}>
                                {filteredTargetRoles.map((r) => {
                                  const isSelected = r.id === targetRoleId;
                                  return (
                                    <button
                                      key={r.id}
                                      type="button"
                                      role="option"
                                      aria-selected={isSelected}
                                      className={`w-full rounded-lg px-2 py-1.5 text-left text-[12px] ${
                                        isSelected ? 'bg-[#e9f1ff] text-[#10284F]' : 'text-slate-700 hover:bg-slate-100'
                                      }`}
                                      onClick={() => {
                                        setTargetRoleId(r.id);
                                        setTargetRoleMenuOpen(false);
                                      }}
                                    >
                                      {r.name} ({r.code})
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ) : null}
                        </div>
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
                            <code key={p.id} className={`rounded-md border px-2 py-0.5 text-[10px] ${permissionBadgeClass(p.resource)}`}>
                              {formatPermissionLine(p)}
                            </code>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className={`${card} min-w-0`}>
                <div className={`border-b ${line} px-3 py-3 sm:px-[18px]`}>
                  <h2 className="text-[14px] font-bold sm:text-[15px]">Role permission management</h2>
                </div>
                <div className="space-y-3 p-3 sm:p-[18px]">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div
                      className="relative"
                      onBlur={(event) => {
                        const next = event.relatedTarget as Node | null;
                        if (next && event.currentTarget.contains(next)) return;
                        setSelectedRoleMenuOpen(false);
                      }}
                    >
                      <button
                        type="button"
                        className={`${inp} flex items-center justify-between gap-2 text-left`}
                        onClick={() => setSelectedRoleMenuOpen((open) => !open)}
                        aria-haspopup="listbox"
                        aria-expanded={selectedRoleMenuOpen}
                      >
                        <span className="truncate">{selectedRoleOption ? selectedRoleOption.name : 'Role…'}</span>
                        <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-black" fill="none" aria-hidden="true">
                          <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      {selectedRoleMenuOpen ? (
                        <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-[0_10px_30px_rgba(15,23,42,0.14)]">
                          <input
                            className={`${inp} py-1.5 text-[12px]`}
                            placeholder="Search role…"
                            value={selectedRoleSearchQuery}
                            onChange={(e) => setSelectedRoleSearchQuery(e.target.value)}
                            autoFocus
                          />
                          <div className={`mt-2 max-h-44 space-y-1 pr-1 ${scrollYScrollbarHidden}`}>
                            {filteredSelectedRoles.map((r) => {
                              const isSelected = r.id === selectedRoleId;
                              return (
                                <button
                                  key={r.id}
                                  type="button"
                                  role="option"
                                  aria-selected={isSelected}
                                  className={`w-full rounded-lg px-2 py-1.5 text-left text-[12px] ${
                                    isSelected ? 'bg-[#e9f1ff] text-[#10284F]' : 'text-slate-700 hover:bg-slate-100'
                                  }`}
                                  onClick={() => {
                                    setSelectedRoleId(r.id);
                                    setSelectedRoleMenuOpen(false);
                                  }}
                                >
                                  {r.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}
                    </div>
                    <div
                      className="relative"
                      onBlur={(event) => {
                        const next = event.relatedTarget as Node | null;
                        if (next && event.currentTarget.contains(next)) return;
                        setPermissionMenuOpen(false);
                      }}
                    >
                      <button
                        type="button"
                        className={`${inp} flex items-center justify-between gap-2 text-left`}
                        onClick={() => setPermissionMenuOpen((open) => !open)}
                        aria-haspopup="listbox"
                        aria-expanded={permissionMenuOpen}
                      >
                        <span className="truncate">
                          {selectedPermission ? formatPermissionLine(selectedPermission) : 'Permission…'}
                        </span>
                        <svg
                          viewBox="0 0 20 20"
                          className="h-4 w-4 shrink-0 text-black"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      {permissionMenuOpen ? (
                        <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-[0_10px_30px_rgba(15,23,42,0.14)]">
                          <input
                            className={`${inp} py-1.5 text-[12px]`}
                            placeholder="Search permission…"
                            value={permissionSearchQuery}
                            onChange={(e) => setPermissionSearchQuery(e.target.value)}
                            autoFocus
                          />
                          <div className={`mt-2 max-h-44 space-y-1 pr-1 ${scrollYScrollbarHidden}`}>
                            {filteredPermissionOptions.length ? (
                              filteredPermissionOptions.map((p) => {
                                const optionLabel = formatPermissionLine(p);
                                const isSelected = p.id === selectedPermissionId;
                                return (
                                  <button
                                    key={p.id}
                                    type="button"
                                    role="option"
                                    aria-selected={isSelected}
                                    className={`w-full rounded-lg px-2 py-1.5 text-left text-[12px] ${
                                      isSelected ? 'bg-[#e9f1ff] text-[#10284F]' : 'text-slate-700 hover:bg-slate-100'
                                    }`}
                                    onClick={() => {
                                      setSelectedPermissionId(p.id);
                                      setPermissionMenuOpen(false);
                                    }}
                                  >
                                    {optionLabel}
                                  </button>
                                );
                              })
                            ) : (
                              <p className={`px-2 py-2 text-[12px] ${muted}`}>No permissions found.</p>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
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
                          <code key={p.id} className={`rounded-md border px-2 py-0.5 text-[10px] ${permissionBadgeClass(p.resource)}`}>
                            {formatPermissionLine(p)}
                          </code>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <p className={`text-[10px] font-bold uppercase ${muted}`}>Bulk assign / remove</p>
                  <p className={`text-[11px] ${muted}`}>Select permissions below, then assign to or remove from the role above.</p>
                  <RbacPermissionMatrix
                    permissionsList={permissions}
                    selectedKeys={bulkRolePermSelected}
                    onChange={setBulkRolePermSelected}
                    disabled={Boolean(actionLoading) || isReadOnly}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className={btnPri}
                      disabled={Boolean(actionLoading) || isReadOnly}
                      onClick={() =>
                        void runRbacAction(() => {
                          if (!selectedRoleId) throw new Error('Role required.');
                          const ids = permissionIdsFromKeySet(bulkRolePermSelected, permissions);
                          if (!ids.length) throw new Error('Select at least one permission.');
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
                          const ids = permissionIdsFromKeySet(bulkRolePermSelected, permissions);
                          if (!ids.length) throw new Error('Select at least one permission.');
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

            <div className="grid min-w-0 gap-4">
              <div className={`${card} min-w-0`}>
                <div className={`border-b ${line} px-3 py-3 sm:px-[18px]`}>
                  <h2 className="text-[14px] font-bold sm:text-[15px]">Create role</h2>
                </div>
                <div className="space-y-2 p-3 sm:p-[18px]">
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
              <div className={`${card} min-w-0`}>
                <div className={`border-b ${line} px-3 py-3 sm:px-[18px]`}>
                  <h2 className="text-[14px] font-bold sm:text-[15px]">Create permission</h2>
                </div>
                <div className="space-y-2 p-3 sm:p-[18px]">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
              <div className={`${card} min-w-0`}>
                <div className={`border-b ${line} px-3 py-3 sm:px-[18px]`}>
                  <h2 className="text-[14px] font-bold sm:text-[15px]">Edit role</h2>
                </div>
                <div className="space-y-2 p-3 sm:p-[18px]">
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
              <div className={`${card} min-w-0`}>
                <div className={`border-b ${line} px-3 py-3 sm:px-[18px]`}>
                  <h2 className="text-[14px] font-bold sm:text-[15px]">Custom permissions (auditors)</h2>
                </div>
                <div className="space-y-2 p-3 sm:p-[18px]">
                  <p className={`text-[12px] ${muted}`}>Applies to auditor-role users. Pick permissions below; technical IDs are not shown.</p>
                  <div
                    className="relative"
                    onBlur={(event) => {
                      const next = event.relatedTarget as Node | null;
                      if (next && event.currentTarget.contains(next)) return;
                      setCustomPermUserMenuOpen(false);
                    }}
                  >
                    <button
                      type="button"
                      className={`${inp} flex items-center justify-between gap-2 text-left`}
                      onClick={() => setCustomPermUserMenuOpen((open) => !open)}
                      aria-haspopup="listbox"
                      aria-expanded={customPermUserMenuOpen}
                      disabled={isReadOnly}
                    >
                      <span className="truncate">{selectedCustomPermUser ? selectedCustomPermUser.email : 'User…'}</span>
                      <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-black" fill="none" aria-hidden="true">
                        <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    {customPermUserMenuOpen ? (
                      <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-[0_10px_30px_rgba(15,23,42,0.14)]">
                        <input
                          className={`${inp} py-1.5 text-[12px]`}
                          placeholder="Search user…"
                          value={customPermUserSearchQuery}
                          onChange={(e) => setCustomPermUserSearchQuery(e.target.value)}
                          autoFocus
                        />
                        <div className={`mt-2 max-h-44 space-y-1 pr-1 ${scrollYScrollbarHidden}`}>
                          {filteredCustomPermUsers.map((u) => {
                            const isSelected = u.id === customPermUserId;
                            return (
                              <button
                                key={u.id}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                className={`w-full rounded-lg px-2 py-1.5 text-left text-[12px] ${
                                  isSelected ? 'bg-[#e9f1ff] text-[#10284F]' : 'text-slate-700 hover:bg-slate-100'
                                }`}
                                onClick={() => {
                                  setCustomPermUserId(u.id);
                                  setCustomPermUserMenuOpen(false);
                                }}
                              >
                                {u.email}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <RbacPermissionMatrix
                    permissionsList={permissions}
                    selectedKeys={customPermSelected}
                    onChange={setCustomPermSelected}
                    disabled={isReadOnly}
                  />
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
          <div className="grid min-w-0 gap-4 lg:grid-cols-2">
            <div className={`${card} min-w-0`}>
              <div className={`border-b ${line} px-3 py-3 sm:px-[18px]`}>
                <h2 className="text-[14px] font-bold sm:text-[15px]">Permission check</h2>
              </div>
              <div className="space-y-3 p-3 sm:p-[18px]">
                <p className={`text-[12px] ${muted}`}>Leave user unset to check your own session.</p>
                <div
                  className="relative"
                  onBlur={(event) => {
                    const next = event.relatedTarget as Node | null;
                    if (next && event.currentTarget.contains(next)) return;
                    setCheckUserMenuOpen(false);
                  }}
                >
                  <button
                    type="button"
                    className={`${inp} flex items-center justify-between gap-2 text-left`}
                    onClick={() => setCheckUserMenuOpen((open) => !open)}
                    aria-haspopup="listbox"
                    aria-expanded={checkUserMenuOpen}
                  >
                    <span className="truncate">
                      {selectedTargetUser ? `${selectedTargetUser.email} — ${selectedTargetUser.role}` : 'My session'}
                    </span>
                    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-black" fill="none" aria-hidden="true">
                      <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {checkUserMenuOpen ? (
                    <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-[0_10px_30px_rgba(15,23,42,0.14)]">
                      <input
                        className={`${inp} py-1.5 text-[12px]`}
                        placeholder="Search user…"
                        value={checkUserSearchQuery}
                        onChange={(e) => setCheckUserSearchQuery(e.target.value)}
                        autoFocus
                      />
                      <div className={`mt-2 max-h-44 space-y-1 pr-1 ${scrollYScrollbarHidden}`}>
                        <button
                          type="button"
                          className={`w-full rounded-lg px-2 py-1.5 text-left text-[12px] ${
                            !targetUserId ? 'bg-[#e9f1ff] text-[#10284F]' : 'text-slate-700 hover:bg-slate-100'
                          }`}
                          onClick={() => {
                            setTargetUserId('');
                            setCheckUserMenuOpen(false);
                          }}
                        >
                          My session
                        </button>
                        {filteredCheckUsers.map((u) => {
                          const optionLabel = `${u.email} — ${u.role}`;
                          const isSelected = u.id === targetUserId;
                          return (
                            <button
                              key={u.id}
                              type="button"
                              role="option"
                              aria-selected={isSelected}
                              className={`w-full rounded-lg px-2 py-1.5 text-left text-[12px] ${
                                isSelected ? 'bg-[#e9f1ff] text-[#10284F]' : 'text-slate-700 hover:bg-slate-100'
                              }`}
                              onClick={() => {
                                setTargetUserId(u.id);
                                setCheckUserMenuOpen(false);
                              }}
                            >
                              {optionLabel}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
                <div
                  className="relative"
                  onBlur={(event) => {
                    const next = event.relatedTarget as Node | null;
                    if (next && event.currentTarget.contains(next)) return;
                    setCheckPermissionMenuOpen(false);
                  }}
                >
                  <button
                    type="button"
                    className={`${inp} flex items-center justify-between gap-2 text-left`}
                    onClick={() => setCheckPermissionMenuOpen((open) => !open)}
                    aria-haspopup="listbox"
                    aria-expanded={checkPermissionMenuOpen}
                  >
                    <span className="truncate">
                      {selectedCheckPermission ? formatPermissionLine(selectedCheckPermission) : 'Permission…'}
                    </span>
                    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-black" fill="none" aria-hidden="true">
                      <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {checkPermissionMenuOpen ? (
                    <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-[0_10px_30px_rgba(15,23,42,0.14)]">
                      <input
                        className={`${inp} py-1.5 text-[12px]`}
                        placeholder="Search permission…"
                        value={checkPermissionSearchQuery}
                        onChange={(e) => setCheckPermissionSearchQuery(e.target.value)}
                        autoFocus
                      />
                      <div className={`mt-2 max-h-44 space-y-1 pr-1 ${scrollYScrollbarHidden}`}>
                        {filteredCheckPermissionOptions.length ? (
                          filteredCheckPermissionOptions.map((p) => {
                            const optionLabel = formatPermissionLine(p);
                            const isSelected = p.id === selectedCheckPermissionId;
                            return (
                              <button
                                key={p.id}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                className={`w-full rounded-lg px-2 py-1.5 text-left text-[12px] ${
                                  isSelected ? 'bg-[#e9f1ff] text-[#10284F]' : 'text-slate-700 hover:bg-slate-100'
                                }`}
                                onClick={() => {
                                  setSelectedCheckPermissionId(p.id);
                                  setCheckPermissionMenuOpen(false);
                                }}
                              >
                                {optionLabel}
                              </button>
                            );
                          })
                        ) : (
                          <p className={`px-2 py-2 text-[12px] ${muted}`}>No permissions found.</p>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
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
                <p className={`text-[11px] ${muted}`}>Select permissions to evaluate for the user above (or your session if none).</p>
                <RbacPermissionMatrix
                  permissionsList={permissions}
                  selectedKeys={multiCheckPermSelected}
                  onChange={setMultiCheckPermSelected}
                  disabled={Boolean(actionLoading)}
                />
                <button type="button" className={btnPri} onClick={() => void onMultiCheck()} disabled={Boolean(actionLoading)}>
                  Run multi-check
                </button>
                {multiPermissionResult ? (
                  <div className={`rounded-xl border ${line} p-3 text-[12px]`}>
                    {Object.entries(multiPermissionResult).map(([k, ok]) => {
                      const perm = permissions.find((p) => permissionKey(p.resource, p.action) === k);
                      const label = perm ? formatPermissionLine(perm) : k;
                      return (
                        <div key={k} className="flex justify-between border-b border-[rgba(155,181,224,0.06)] py-1 last:border-0">
                          <span className="pr-2 font-medium text-slate-800">{label}</span>
                          <span className={ok ? 'font-semibold text-emerald-800' : 'font-semibold text-red-800'}>
                            {ok ? 'Allowed' : 'Denied'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </div>
            <div className={`${card} min-w-0`}>
              <div className={`border-b ${line} px-3 py-3 sm:px-[18px]`}>
                <h2 className="text-[14px] font-bold sm:text-[15px]">Quick user lookup</h2>
              </div>
              <div className="space-y-3 p-3 sm:p-[18px]">
                <div
                  className="relative"
                  onBlur={(event) => {
                    const next = event.relatedTarget as Node | null;
                    if (next && event.currentTarget.contains(next)) return;
                    setLookupUserMenuOpen(false);
                  }}
                >
                  <button
                    type="button"
                    className={`${inp} flex items-center justify-between gap-2 text-left`}
                    onClick={() => setLookupUserMenuOpen((open) => !open)}
                    aria-haspopup="listbox"
                    aria-expanded={lookupUserMenuOpen}
                  >
                    <span className="truncate">{selectedLookupUser ? selectedLookupUser.email : 'User…'}</span>
                    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-black" fill="none" aria-hidden="true">
                      <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {lookupUserMenuOpen ? (
                    <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-[0_10px_30px_rgba(15,23,42,0.14)]">
                      <input
                        className={`${inp} py-1.5 text-[12px]`}
                        placeholder="Search user…"
                        value={lookupUserSearchQuery}
                        onChange={(e) => setLookupUserSearchQuery(e.target.value)}
                        autoFocus
                      />
                      <div className={`mt-2 max-h-44 space-y-1 pr-1 ${scrollYScrollbarHidden}`}>
                        {filteredLookupUsers.length ? (
                          filteredLookupUsers.map((u) => {
                            const isSelected = u.id === lookupUserId;
                            return (
                              <button
                                key={u.id}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                className={`w-full rounded-lg px-2 py-1.5 text-left text-[12px] ${
                                  isSelected ? 'bg-[#e9f1ff] text-[#10284F]' : 'text-slate-700 hover:bg-slate-100'
                                }`}
                                onClick={() => {
                                  setLookupUserId(u.id);
                                  setLookupUserMenuOpen(false);
                                }}
                              >
                                {u.email}
                              </button>
                            );
                          })
                        ) : (
                          <p className={`px-2 py-2 text-[12px] ${muted}`}>No users found.</p>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    className={`${btn} inline-flex w-full items-center justify-center sm:w-auto`}
                    onClick={() => void onLoadUserRoles(lookupUserId)}
                    disabled={!lookupUserId}
                  >
                    View roles
                  </button>
                  <button
                    type="button"
                    className={`${btn} inline-flex w-full items-center justify-center sm:w-auto`}
                    onClick={() => void onLoadUserPerms(lookupUserId)}
                    disabled={!lookupUserId}
                  >
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
                        <code key={p.id} className={`rounded-md border px-2 py-0.5 text-[10px] ${permissionBadgeClass(p.resource)}`}>
                          {formatPermissionLine(p)}
                        </code>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

      </div>
    </div>
  );
}

