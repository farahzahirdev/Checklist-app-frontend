'use client';

import { useEffect, useState } from 'react';
import { ACCESS_TOKEN_STORAGE_KEY } from '@/lib/auth';
import { getAdminActivity, type AdminActivityItem } from '@/lib/dashboard';
import { translate, translateOr, useLocale } from '@/lib/i18n';
import { adminDashboardMessages } from '@/locales/admin-dashboard';

function humanizeToken(value: string) {
  return value
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

type AdminRecentActivityFeedProps = {
  limit?: number;
};

export function AdminRecentActivityFeed({ limit = 3 }: AdminRecentActivityFeedProps) {
  const { locale } = useLocale();
  const t = (key: string, values?: Record<string, string>) => translate(adminDashboardMessages, locale, key, values);
  const [activity, setActivity] = useState<AdminActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const activityActionLabel = (action: string) =>
    translateOr(adminDashboardMessages, locale, `activity.action.${action}`, humanizeToken(action));
  const activitySourceLabel = (source: string) =>
    translateOr(adminDashboardMessages, locale, `activity.source.${source}`, humanizeToken(source));
  const activityEntityLabel = (entityType: string) =>
    translateOr(adminDashboardMessages, locale, `activity.entity.${entityType}`, humanizeToken(entityType));

  const formatActivityNote = (note: string | null) => {
    if (!note) return null;
    const match = note.match(/^(\d+)\s+([A-Za-z]{3})$/);
    if (!match) return note;
    const amountCents = Number(match[1]);
    const currency = match[2].toUpperCase();
    if (!Number.isFinite(amountCents)) return note;
    try {
      return new Intl.NumberFormat(locale === 'cs' ? 'cs-CZ' : 'en-US', {
        style: 'currency',
        currency,
      }).format(amountCents / 100);
    } catch {
      return note;
    }
  };

  const activityDetail = (item: AdminActivityItem) => {
    const formattedNote = formatActivityNote(item.note);
    if (formattedNote) return formattedNote;
    return t('activity.detail', {
      source: activitySourceLabel(item.source),
      entity: activityEntityLabel(item.entity_type),
    });
  };

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const token = typeof window !== 'undefined' ? window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) : null;
        if (!token) {
          throw new Error('missing_bearer_token');
        }
        const items = await getAdminActivity({ token });
        if (!cancelled) {
          setActivity(items);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load activity');
          setActivity([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const visible = activity.slice(0, limit);

  return (
    <div className="space-y-3">
      {loading ? (
        <p className="py-2 text-center text-sm text-[#6f82a3]">{t('empty.loading')}</p>
      ) : error ? (
        <p className="py-2 text-center text-sm text-[#c43e53]">{error}</p>
      ) : visible.length ? (
        <div className="divide-y divide-[#dbe4f4]">
          {visible.map((item, idx) => (
            <div key={`${item.entity_id}-${item.occurred_at}-${idx}`} className="py-2.5 text-sm text-[#2f4264] first:pt-0">
              <p className="font-semibold text-[#25375a]">{activityActionLabel(item.action)}</p>
              <p className="text-[#5f7395]">{activityDetail(item)}</p>
              <p className="text-xs text-[#7a8ca8]">{new Date(item.occurred_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-2 text-center text-sm text-[#6f82a3]">{t('empty.noRecentActivity')}</p>
      )}
    </div>
  );
}
