import { apiGetWithAuth, apiPatch, apiPost, apiPostEmptyWithAuth } from '@/lib/api';

export type UserRole = 'admin' | 'auditor' | 'customer';
type UserRoleCode = 0 | 1 | 2;

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
  is_active: boolean;
};

export type AuthResponse = {
  user: AuthUser;
  access_token: string | null;
  challenge_token?: string | null;
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
  const response = await apiPost<AuthResponse, typeof payload>('/auth/register', payload);
  return normalizeAuthResponse(response);
}

export type LoginPayload = {
  email: string;
  password: string;
};

export async function loginAccount(payload: LoginPayload) {
  const response = await apiPost<AuthResponse, LoginPayload>('/auth/login', payload);
  return normalizeAuthResponse(response);
}

export type LoginMfaChallengePayload = {
  challenge_token: string;
  code: string;
};

export async function verifyLoginMfaChallenge(payload: LoginMfaChallengePayload) {
  const response = await apiPost<AuthResponse, LoginMfaChallengePayload>('/auth/mfa/challenge/verify', payload);
  return normalizeAuthResponse(response);
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
  verified: boolean;
};

export async function getCurrentUser() {
  const response = await apiGetWithAuth<AuthResponse>('/auth/me');
  return normalizeAuthResponse(response);
}

export async function startMfaSetup() {
  return apiPost<MfaSetupDetailsResponse, Record<string, never>>('/auth/mfa/setup', {});
}

export async function verifyMfaCode(payload: { code: string }) {
  const response = await apiPost<AuthResponse, { code: string }>('/auth/mfa/verify', payload);
  return normalizeAuthResponse(response);
}

export async function assignUserRole(payload: { userId: string; role: UserRole }) {
  const response = await apiPatch<AuthResponse, { role: UserRole }>(`/auth/admin/users/${payload.userId}/role`, {
    role: payload.role,
  });
  return normalizeAuthResponse(response);
}

export function getRoleHomePath(role: UserRole): string {
  if (role === 'admin') return '/admin/checklists';
  if (role === 'auditor') return '/reports';
  return '/dashboard';
}

type AuthResponseWithRoleCode = Omit<AuthResponse, 'user'> & {
  user: Omit<AuthUser, 'role'> & { role: UserRole | UserRoleCode };
};

function normalizeUserRole(role: UserRole | UserRoleCode): UserRole {
  if (role === 0) return 'admin';
  if (role === 1) return 'auditor';
  if (role === 2) return 'customer';
  return role;
}

function normalizeAuthResponse(response: AuthResponseWithRoleCode): AuthResponse {
  return {
    ...response,
    user: {
      ...response.user,
      role: normalizeUserRole(response.user.role),
    },
  };
}
