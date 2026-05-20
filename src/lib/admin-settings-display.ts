import type { SystemSetting } from '@/lib/admin-settings';

export const SETTING_CATEGORY_ORDER = ['email', 'lifecycle'] as const;

export const SETTING_KEY_ORDER: Record<string, string[]> = {
  email: [
    'email_enabled',
    'email_provider',
    'email_from_name',
    'email_from_address',
    'email_reply_to',
    'smtp_host',
    'smtp_port',
    'smtp_use_tls',
    'graph_client_id',
    'graph_client_secret',
    'graph_tenant_id',
    'graph_mailbox',
    'graph_redirect_uri',
    'graph_refresh_token',
    'email_max_retries',
    'email_retry_delay_seconds',
  ],
  lifecycle: ['assessment_completion_days', 'evidence_retention_hours'],
};

export function settingLabelKey(key: string): string {
  return `setting.${key}.label`;
}

export function settingDescriptionKey(key: string): string {
  return `setting.${key}.description`;
}

export function settingUnitKey(key: string): string | null {
  if (key.endsWith('_days')) return 'unit.days';
  if (key.endsWith('_hours')) return 'unit.hours';
  if (key.endsWith('_seconds')) return 'unit.seconds';
  return null;
}

export function sortSettings(items: SystemSetting[]): SystemSetting[] {
  return [...items].sort((a, b) => {
    const categoryOrderA = SETTING_CATEGORY_ORDER.indexOf(a.category as (typeof SETTING_CATEGORY_ORDER)[number]);
    const categoryOrderB = SETTING_CATEGORY_ORDER.indexOf(b.category as (typeof SETTING_CATEGORY_ORDER)[number]);
    const catA = categoryOrderA === -1 ? 999 : categoryOrderA;
    const catB = categoryOrderB === -1 ? 999 : categoryOrderB;
    if (catA !== catB) return catA - catB;

    const order = SETTING_KEY_ORDER[a.category] ?? [];
    const indexA = order.indexOf(a.key);
    const indexB = order.indexOf(b.key);
    const keyA = indexA === -1 ? 999 : indexA;
    const keyB = indexB === -1 ? 999 : indexB;
    if (keyA !== keyB) return keyA - keyB;
    return a.key.localeCompare(b.key);
  });
}

export function sortCategories(categories: string[]): string[] {
  return [...categories].sort((a, b) => {
    const indexA = SETTING_CATEGORY_ORDER.indexOf(a as (typeof SETTING_CATEGORY_ORDER)[number]);
    const indexB = SETTING_CATEGORY_ORDER.indexOf(b as (typeof SETTING_CATEGORY_ORDER)[number]);
    const orderA = indexA === -1 ? 999 : indexA;
    const orderB = indexB === -1 ? 999 : indexB;
    if (orderA !== orderB) return orderA - orderB;
    return a.localeCompare(b);
  });
}

export function asBoolValue(value: string): boolean {
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

export function categoryDescriptionKey(category: string): string {
  return `category.${category}.description`;
}
