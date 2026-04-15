const DEFAULT_API_BASE_URL = 'https://checklist-app-backend-wine.vercel.app/api/v1';

export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
}

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
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
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
): Promise<TResponse> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(errorMessageFromResponse(response.status, raw));
  }

  return (raw ? JSON.parse(raw) : null) as TResponse;
}
