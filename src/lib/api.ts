const DEFAULT_API_BASE_URL = 'https://checklist-app-backend-wine.vercel.app/api/v1';

export function getApiBaseUrl() {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL;

  if (!url) {
    throw new Error('API base URL is not defined');
  }

  return url;
}

type ApiAuth =
  | {
      token?: string | null;
    }
  | undefined;

function messageFromApiDetail(detail: unknown): string | null {
  if (typeof detail === 'string') {
    if (detail === 'email_already_registered') {
      return 'This email is already registered.';
    }
    if (detail === 'invalid_credentials') {
      return 'Invalid email or password.';
    }
    if (detail === 'mfa_code_invalid') {
      return 'The MFA code is invalid. Please try again.';
    }
    if (detail === 'missing_uppercase') {
      return 'Password should include at least one uppercase letter.';
    }
    if (detail === 'missing_lowercase') {
      return 'Password should include at least one lowercase letter.';
    }
    if (/^[a-z0-9_]+$/.test(detail)) {
      const sentence = detail.replace(/_/g, ' ');
      return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
    }
    return detail;
  }
  if (Array.isArray(detail)) {
    const msgs = detail
      .filter((item): item is { msg?: string } => Boolean(item) && typeof item === 'object')
      .map((item) => item.msg)
      .filter((m): m is string => Boolean(m));
    if (msgs.length) {
      return msgs.join(' ');
    }
  }
  return null;
}

function errorMessageFromResponse(status: number, raw: string): string {
  if (!raw) {
    return `Request failed with status ${status}`;
  }
  try {
    const data = JSON.parse(raw) as { detail?: unknown };
    const fromDetail = data.detail !== undefined ? messageFromApiDetail(data.detail) : null;
    if (fromDetail) {
      return fromDetail;
    }
  } catch {
    // fall through
  }
  return `Request failed with status ${status}: ${raw}`;
}

export async function apiGet<T>(path: string): Promise<T> {
  return apiGetWithAuth<T>(path);
}

function resolveToken(auth?: ApiAuth): string | null {
  if (auth?.token !== undefined) {
    return auth.token;
  }
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage.getItem('checklist_access_token');
}

function buildHeaders(auth?: ApiAuth, options?: { includeJsonContentType?: boolean }): Record<string, string> {
  const token = resolveToken(auth);
  const headers: Record<string, string> = {};
  if (options?.includeJsonContentType !== false) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (typeof window !== 'undefined') {
    const locale = window.localStorage.getItem('checklist_locale') || window.navigator.language || 'en';
    headers['Accept-Language'] = locale;
  } else {
    headers['Accept-Language'] = 'en';
  }
  return headers;
}

export async function apiGetWithAuth<T>(path: string, auth?: ApiAuth): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    headers: buildHeaders(auth),
    cache: 'no-store',
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(errorMessageFromResponse(response.status, raw));
  }

  return (raw ? JSON.parse(raw) : null) as T;
}

export async function apiPost<TResponse, TPayload>(
  path: string,
  payload: TPayload,
  auth?: ApiAuth,
): Promise<TResponse> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: 'POST',
    headers: buildHeaders(auth),
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(errorMessageFromResponse(response.status, raw));
  }

  return (raw ? JSON.parse(raw) : null) as TResponse;
}

export async function apiPostFormData<TResponse>(
  path: string,
  payload: FormData,
  auth?: ApiAuth,
): Promise<TResponse> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: 'POST',
    headers: buildHeaders(auth, { includeJsonContentType: false }),
    body: payload,
    cache: 'no-store',
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(errorMessageFromResponse(response.status, raw));
  }

  return (raw ? JSON.parse(raw) : null) as TResponse;
}

export async function apiPostEmpty<TResponse>(path: string): Promise<TResponse> {
  return apiPostEmptyWithAuth<TResponse>(path);
}

export async function apiPostEmptyWithAuth<TResponse>(path: string, auth?: ApiAuth): Promise<TResponse> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: 'POST',
    headers: buildHeaders(auth),
    cache: 'no-store',
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(errorMessageFromResponse(response.status, raw));
  }

  return (raw ? JSON.parse(raw) : null) as TResponse;
}

export async function apiPut<TResponse, TPayload>(
  path: string,
  payload: TPayload,
  auth?: ApiAuth,
): Promise<TResponse> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: 'PUT',
    headers: buildHeaders(auth),
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(errorMessageFromResponse(response.status, raw));
  }

  return (raw ? JSON.parse(raw) : null) as TResponse;
}

export async function apiPatch<TResponse, TPayload>(
  path: string,
  payload: TPayload,
  auth?: ApiAuth,
): Promise<TResponse> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: 'PATCH',
    headers: buildHeaders(auth),
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(errorMessageFromResponse(response.status, raw));
  }

  return (raw ? JSON.parse(raw) : null) as TResponse;
}

export async function apiDelete<TResponse>(path: string, auth?: ApiAuth): Promise<TResponse> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: 'DELETE',
    headers: buildHeaders(auth),
    cache: 'no-store',
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(errorMessageFromResponse(response.status, raw));
  }

  return (raw ? JSON.parse(raw) : null) as TResponse;
}
