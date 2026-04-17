const DEFAULT_API_BASE_URL = 'https://checklist-app-backend-wine.vercel.app/api/v1';
// const DEFAULT_API_BASE_URL = 'http://localhost:8000/api/v1';

export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
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

function buildHeaders(auth?: ApiAuth): Record<string, string> {
  const token = resolveToken(auth);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
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
