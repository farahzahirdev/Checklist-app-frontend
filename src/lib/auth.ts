import { apiPost, apiPostEmpty } from '@/lib/api';

export type UserRole = 'admin' | 'auditor' | 'customer';

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
  mfa_code?: string;
};

export async function loginAccount(payload: LoginPayload) {
  return apiPost<AuthResponse, LoginPayload>('/auth/login', payload);
}

export type MessageResponse = {
  message: string;
};

export async function logoutAccount() {
  return apiPostEmpty<MessageResponse>('/auth/logout');
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
