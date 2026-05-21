import { apiGetWithAuth, apiPatch } from '@/lib/api';

export type SettingValueType = 'string' | 'int' | 'bool' | 'json';

export type SystemSetting = {
  id: string;
  key: string;
  value: string;
  value_type: SettingValueType;
  category: string;
  description: string | null;
  is_secret: boolean;
  has_value: boolean;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
};

export type SystemSettingListResponse = {
  total: number;
  categories: string[];
  settings: SystemSetting[];
};

type ApiAuth = {
  token?: string | null;
};

export async function getSystemSettings(category?: string, auth?: ApiAuth) {
  const params = new URLSearchParams();
  if (category) {
    params.set('category', category);
  }
  const suffix = params.toString() ? `?${params.toString()}` : '';
  return apiGetWithAuth<SystemSettingListResponse>(`/admin/settings${suffix}`, auth);
}

export async function updateSystemSetting(settingKey: string, value: string, reason: string | undefined, auth?: ApiAuth) {
  return apiPatch<SystemSetting, { value: string; reason?: string }>(
    `/admin/settings/${settingKey}`,
    { value, reason },
    auth,
  );
}
