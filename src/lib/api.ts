const DEFAULT_API_BASE_URL = 'https://checklist-app-backend-wine.vercel.app/api/v1';
const ACCESS_TOKEN_STORAGE_KEY = 'checklist_access_token';

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

type ApiRequestOptions = {
  skipSessionRefresh?: boolean;
};

export class ApiError extends Error {
  status: number;
  detail: unknown;

  constructor(status: number, detail: unknown, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

let refreshInFlight: Promise<string | null> | null = null;

export function isSessionInvalidError(error: unknown): boolean {
  if (!(error instanceof ApiError)) {
    return false;
  }
  if (error.status !== 401) {
    return false;
  }
  const detail = typeof error.detail === 'string' ? error.detail : '';
  return (
    detail === 'token_expired' ||
    detail === 'invalid_token' ||
    detail === 'invalid_token_type' ||
    detail === 'invalid_token_subject' ||
    detail === 'missing_bearer_token' ||
    detail === 'user_not_found' ||
    detail === 'invalid_credentials'
  );
}

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
    if (detail === 'token_expired') {
      return 'Your session has expired. Please sign in again.';
    }
    if (detail === 'invalid_token' || detail === 'invalid_token_type' || detail === 'invalid_token_subject') {
      return 'Your session is no longer valid. Please sign in again.';
    }
    // File upload error messages
    if (detail === 'file_too_large') {
      return 'Request payload is too large. Maximum size is 10MB.';
    }
    if (detail === 'invalid_file_type') {
      return 'File type not allowed. Only PDF, PNG, and JPEG files are supported.';
    }
    if (detail === 'malware_detected') {
      return 'File was flagged as potentially unsafe and rejected.';
    }
    if (detail === 'upload_failed') {
      return 'File upload failed. Please try again.';
    }
    if (detail === 'invalid_request') {
      return 'Invalid request. Please check your input and try again.';
    }
    if (detail === 'request_too_large') {
      return 'Request payload is too large. Maximum size is 10MB.';
    }
    if (detail === 'internal_server_error') {
      return 'An internal server error occurred. Please try again later.';
    }
    if (detail === 'service_unavailable') {
      return 'Service is temporarily unavailable. Please try again later.';
    }
    if (detail === 'bad_gateway') {
      return 'Service temporarily unavailable. Please try again later.';
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
  if (status === 413) {
    return 'Request is too large. Please reduce the file size and try again.';
  }
  if (status === 500) {
    return 'Failed to complete request. Please try again later.';
  }
  if (status === 502 || status === 503) {
    return 'Service is temporarily unavailable. Please try again later.';
  }
  if (status === 504) {
    return 'The server took too long to respond. Please try again later.';
  }

  if (!raw) {
    return 'Failed to complete request. Please try again later.';
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

function parseApiFailure(response: Response, raw: string): ApiError {
  let detail: unknown = raw;
  try {
    const data = JSON.parse(raw) as { detail?: unknown };
    if (data.detail !== undefined) {
      detail = data.detail;
    }
  } catch {
    // keep raw body
  }
  return new ApiError(response.status, detail, errorMessageFromResponse(response.status, raw));
}

async function fetchWithFriendlyError(input: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch {
    throw new Error('Failed to complete request. Please try again later.');
  }
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
  return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

function storeAccessTokenSilently(token: string) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
}

function buildHeaders(
  auth?: ApiAuth,
  options?: { includeJsonContentType?: boolean; tokenOverride?: string | null },
): Record<string, string> {
  const token = options?.tokenOverride !== undefined ? options.tokenOverride : resolveToken(auth);
  const headers: Record<string, string> = {};
  if (options?.includeJsonContentType !== false) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const toAcceptLanguage = (raw: string | null | undefined) => {
    const normalized = (raw ?? '').toLowerCase();
    if (normalized.startsWith('cs')) return 'cs-CZ';
    if (normalized.startsWith('en')) return 'en-US';
    return 'cs-CZ';
  };
  if (typeof window !== 'undefined') {
    const locale = window.localStorage.getItem('checklist_locale') || 'cs';
    headers['Accept-Language'] = toAcceptLanguage(locale);
  } else {
    headers['Accept-Language'] = 'cs-CZ';
  }
  return headers;
}

async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') {
    return null;
  }
  const currentToken = resolveToken();
  if (!currentToken) {
    return null;
  }
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const response = await fetchWithFriendlyError(`${getApiBaseUrl()}/auth/refresh`, {
          method: 'POST',
          headers: buildHeaders({ token: currentToken }),
          cache: 'no-store',
        });
        const raw = await response.text();
        if (!response.ok) {
          return null;
        }
        const data = raw ? (JSON.parse(raw) as { access_token?: string | null }) : null;
        const nextToken = data?.access_token?.trim();
        if (!nextToken) {
          return null;
        }
        storeAccessTokenSilently(nextToken);
        return nextToken;
      } catch {
        return null;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

async function sendAuthedRequest(
  path: string,
  init: RequestInit,
  auth?: ApiAuth,
  options?: ApiRequestOptions,
): Promise<Response> {
  const url = `${getApiBaseUrl()}${path}`;
  const token = resolveToken(auth);
  const method = (init.method ?? 'GET').toUpperCase();
  const includeJsonContentType =
    !(init.body instanceof FormData) && method !== 'GET' && method !== 'DELETE';

  const firstResponse = await fetchWithFriendlyError(url, {
    ...init,
    headers: buildHeaders(auth, {
      includeJsonContentType,
      tokenOverride: token,
    }),
  });

  if (firstResponse.status !== 401 || options?.skipSessionRefresh || !token) {
    return firstResponse;
  }

  const refreshedToken = await refreshAccessToken();
  if (!refreshedToken) {
    return firstResponse;
  }

  return fetchWithFriendlyError(url, {
    ...init,
    headers: buildHeaders(auth, {
      includeJsonContentType,
      tokenOverride: refreshedToken,
    }),
  });
}

export async function apiGetWithAuth<T>(path: string, auth?: ApiAuth, options?: ApiRequestOptions): Promise<T> {
  const response = await sendAuthedRequest(
    path,
    {
      method: 'GET',
      cache: 'no-store',
    },
    auth,
    options,
  );

  const raw = await response.text();

  if (!response.ok) {
    throw parseApiFailure(response, raw);
  }

  return (raw ? JSON.parse(raw) : null) as T;
}

/** Authenticated GET returning a binary body (e.g. PDF). Omits JSON Content-Type. */
export async function apiGetBlobWithAuth(path: string, auth?: ApiAuth, options?: ApiRequestOptions): Promise<Blob> {
  const response = await sendAuthedRequest(
    path,
    {
      method: 'GET',
      cache: 'no-store',
    },
    auth,
    options,
  );

  if (!response.ok) {
    const raw = await response.text();
    throw parseApiFailure(response, raw);
  }

  return response.blob();
}

export async function apiPost<TResponse, TPayload>(
  path: string,
  payload: TPayload,
  auth?: ApiAuth,
  options?: ApiRequestOptions,
): Promise<TResponse> {
  const response = await sendAuthedRequest(
    path,
    {
      method: 'POST',
      body: JSON.stringify(payload),
      cache: 'no-store',
    },
    auth,
    options,
  );

  const raw = await response.text();

  if (!response.ok) {
    throw parseApiFailure(response, raw);
  }

  return (raw ? JSON.parse(raw) : null) as TResponse;
}

export async function apiPostFormData<TResponse>(
  path: string,
  payload: FormData,
  auth?: ApiAuth,
  options?: ApiRequestOptions,
): Promise<TResponse> {
  const response = await sendAuthedRequest(
    path,
    {
      method: 'POST',
      body: payload,
      cache: 'no-store',
    },
    auth,
    options,
  );

  const raw = await response.text();

  if (!response.ok) {
    throw parseApiFailure(response, raw);
  }

  return (raw ? JSON.parse(raw) : null) as TResponse;
}

export async function apiPostEmpty<TResponse>(path: string): Promise<TResponse> {
  return apiPostEmptyWithAuth<TResponse>(path);
}

export async function apiPostEmptyWithAuth<TResponse>(
  path: string,
  auth?: ApiAuth,
  options?: ApiRequestOptions,
): Promise<TResponse> {
  const response = await sendAuthedRequest(
    path,
    {
      method: 'POST',
      cache: 'no-store',
    },
    auth,
    options,
  );

  const raw = await response.text();

  if (!response.ok) {
    throw parseApiFailure(response, raw);
  }

  return (raw ? JSON.parse(raw) : null) as TResponse;
}

export async function apiPut<TResponse, TPayload>(
  path: string,
  payload: TPayload,
  auth?: ApiAuth,
  options?: ApiRequestOptions,
): Promise<TResponse> {
  const response = await sendAuthedRequest(
    path,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
      cache: 'no-store',
    },
    auth,
    options,
  );

  const raw = await response.text();

  if (!response.ok) {
    throw parseApiFailure(response, raw);
  }

  return (raw ? JSON.parse(raw) : null) as TResponse;
}

export async function apiPatch<TResponse, TPayload>(
  path: string,
  payload: TPayload,
  auth?: ApiAuth,
  options?: ApiRequestOptions,
): Promise<TResponse> {
  const response = await sendAuthedRequest(
    path,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
      cache: 'no-store',
    },
    auth,
    options,
  );

  const raw = await response.text();

  if (!response.ok) {
    throw parseApiFailure(response, raw);
  }

  return (raw ? JSON.parse(raw) : null) as TResponse;
}

export async function apiDelete<TResponse>(path: string, auth?: ApiAuth, options?: ApiRequestOptions): Promise<TResponse> {
  const response = await sendAuthedRequest(
    path,
    {
      method: 'DELETE',
      cache: 'no-store',
    },
    auth,
    options,
  );

  const raw = await response.text();

  if (!response.ok) {
    throw parseApiFailure(response, raw);
  }

  return (raw ? JSON.parse(raw) : null) as TResponse;
}
