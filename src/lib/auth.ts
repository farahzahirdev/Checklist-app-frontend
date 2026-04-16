import { apiGetWithAuth, apiPatch, apiPost, apiPostEmptyWithAuth } from '@/lib/api';

export type UserRole = 0 | 1 | 2;
export type UserRoleKey = 'admin' | 'auditor' | 'customer';

export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  role: UserRole;
  is_active: boolean;
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

export function persistAccessToken(token: string | null) {
  if (typeof window === 'undefined') {
    return;
  }
  if (token) {
    window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  }
}

export async function registerAccount(payload: { email: string; password: string }) {
  return apiPost<AuthResponse, typeof payload>('/auth/register', payload);
}

export type LoginPayload = {
  email: string;
  password: string;
};

export async function loginAccount(payload: LoginPayload) {
  return apiPost<AuthResponse, LoginPayload>('/auth/login', payload);
}

export async function verifyMfaChallenge(payload: { challenge_token: string; code: string }) {
  return apiPost<AuthResponse, { challenge_token: string; code: string }>('/auth/mfa/challenge/verify', payload);
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
  if (role === 1) return '/auditor';
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
