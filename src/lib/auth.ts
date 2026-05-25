import { apiGetWithAuth, apiPatch, apiPost, apiPostEmptyWithAuth } from '@/lib/api';
import { getAdminProfile } from '@/lib/admin-profile';

export type UserRole = 0 | 1 | 2;
export type UserRoleKey = 'admin' | 'auditor' | 'customer';

export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  full_name?: string | null;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  role: UserRole;
  is_active: boolean;
  primary_company_id?: string | null;
  job_title?: string | null;
  department?: string | null;
};

export type AuthResponse = {
  user: AuthUser;
  access_token: string | null;
  challenge_token: string | null;
  token_type: string;
  mfa_required: boolean;
  mfa_enabled: boolean;
};

export const ACCESS_TOKEN_STORAGE_KEY = 'checklist_access_token';
export const ORIGINAL_ACCESS_TOKEN_STORAGE_KEY = 'checklist_original_access_token';
export const ROLE_SWITCH_ACTIVE_STORAGE_KEY = 'checklist_role_switch_active';
export const AUTH_STATE_CHANGED_EVENT = 'checklist-auth-state-changed';

export type AuthStateChangedDetail = {
  full_name?: string | null;
};

export function notifyAuthStateChanged(detail?: AuthStateChangedDetail) {
  if (typeof window === 'undefined') {
    return;
  }
  window.dispatchEvent(new CustomEvent(AUTH_STATE_CHANGED_EVENT, { detail }));
}

export function persistAccessToken(token: string | null) {
  if (typeof window === 'undefined') {
    return;
  }
  if (token) {
    window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  }
  notifyAuthStateChanged();
}

export function beginRoleSwitchSession(temporaryToken: string) {
  if (typeof window === 'undefined') {
    return;
  }
  const currentToken = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  if (currentToken) {
    window.localStorage.setItem(ORIGINAL_ACCESS_TOKEN_STORAGE_KEY, currentToken);
  }
  console.log('[auth] beginRoleSwitchSession - setting ROLE_SWITCH_ACTIVE_STORAGE_KEY to "1"');
  window.localStorage.setItem(ROLE_SWITCH_ACTIVE_STORAGE_KEY, '1');
  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, temporaryToken);
  notifyAuthStateChanged();
}

export function isRoleSwitchSessionActive() {
  if (typeof window === 'undefined') {
    return false;
  }
  const flag = window.localStorage.getItem(ROLE_SWITCH_ACTIVE_STORAGE_KEY);
  const result = flag === '1';
  console.log('[auth] isRoleSwitchSessionActive - flag value:', flag, 'result:', result);
  return result;
}

export function clearRoleSwitchSession() {
  if (typeof window === 'undefined') {
    return;
  }
  console.log('[auth] clearRoleSwitchSession - clearing role switch flags');
  window.localStorage.removeItem(ORIGINAL_ACCESS_TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(ROLE_SWITCH_ACTIVE_STORAGE_KEY);
  notifyAuthStateChanged();
}

export function restoreOriginalAccessToken() {
  if (typeof window === 'undefined') {
    return false;
  }
  const originalToken = window.localStorage.getItem(ORIGINAL_ACCESS_TOKEN_STORAGE_KEY);
  if (!originalToken) {
    return false;
  }
  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, originalToken);
  clearRoleSwitchSession();
  notifyAuthStateChanged();
  return true;
}

export type RegisterPayload = {
  email: string;
  password: string;
  company_name: string;
  company_industry?: string;
  company_size?: string;
  company_region?: string;
  full_name?: string;
  username?: string;
  job_title?: string;
  department?: string;
};

export async function registerAccount(payload: RegisterPayload) {
  return apiPost<AuthResponse, RegisterPayload>('/auth/register', payload);
}

export type LoginPayload = {
  email: string;
  password: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  token: string;
  new_password: string;
  confirm_password: string;
};

export async function loginAccount(payload: LoginPayload) {
  return apiPost<AuthResponse, LoginPayload>('/auth/login', payload);
}

export async function verifyMfaChallenge(payload: { challenge_token: string; code: string }) {
  return apiPost<AuthResponse, { challenge_token: string; code: string }>('/auth/mfa/challenge/verify', payload);
}

export async function forgotPassword(payload: ForgotPasswordPayload) {
  return apiPost<MessageResponse, ForgotPasswordPayload>('/auth/forgot-password', payload);
}

export async function resetPassword(payload: ResetPasswordPayload) {
  return apiPost<MessageResponse, ResetPasswordPayload>('/auth/reset-password', payload);
}

export type MessageResponse = {
  message: string;
};

export async function logoutAccount() {
  return apiPostEmptyWithAuth<MessageResponse>('/auth/logout');
}

export type MfaSetupDetailsResponse = {
  secret: string;
  provisioning_uri: string;
  svg_qr?: string;
  verified: boolean;
};

export async function getCurrentUser() {
  return apiGetWithAuth<AuthResponse>('/auth/me');
}

export async function startMfaSetup() {
  return apiPost<MfaSetupDetailsResponse, Record<string, never>>('/auth/mfa/setup', {});
}

export async function verifyMfaCode(payload: { code: string; challenge_token?: string }) {
  return apiPost<AuthResponse, { code: string; challenge_token?: string }>('/auth/mfa/verify', payload);
}

export async function assignUserRole(payload: { userId: string; role: UserRole }) {
  return apiPatch<AuthResponse, { role: UserRole }>(`/auth/admin/users/${payload.userId}/role`, {
    role: payload.role,
  });
}

export function getRoleKey(role: UserRole): UserRoleKey {
  if (role === 0) return 'admin';
  if (role === 1) return 'auditor';
  return 'customer';
}

export function getRoleHomePath(role: UserRole): string {
  if (role === 0) return '/admin';
  if (role === 1) return '/admin';
  return '/dashboard';
}

export function getUserDisplayName(user: AuthUser) {
  const fullName = user.full_name?.trim();
  if (fullName) {
    return fullName;
  }

  const name = user.name?.trim();
  if (name) {
    return name;
  }

  const firstName = user.first_name?.trim();
  const lastName = user.last_name?.trim();
  if (firstName || lastName) {
    return [firstName, lastName].filter(Boolean).join(' ');
  }

  return user.email.split('@')[0] ?? user.email;
}

/** Compact navbar label, e.g. "Lukáš V." from "Lukáš Novák". */
export function getUserShortDisplayName(user: AuthUser): string {
  const fullName = getUserDisplayName(user);
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return fullName;
  }
  const first = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${first} ${lastInitial}.`;
}

/** Navbar display name for admin layout when /auth/me may omit full_name. */
export async function resolveAdminNavbarDisplayName(
  user: AuthUser,
  eventPatch?: string | null,
): Promise<string> {
  const fromPatch = eventPatch?.trim();
  if (fromPatch) {
    return fromPatch;
  }

  const fromMe = user.full_name?.trim();
  if (fromMe) {
    return fromMe;
  }

  if (getRoleKey(user.role) === 'admin') {
    try {
      const profile = await getAdminProfile();
      const fromProfile = profile.full_name?.trim();
      if (fromProfile) {
        return fromProfile;
      }
    } catch {
      // fall through to email-based display name
    }
  }

  return getUserDisplayName(user);
}
