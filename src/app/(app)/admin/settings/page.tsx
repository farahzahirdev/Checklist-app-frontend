'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ADMIN_PAGE_HERO_EYEBROW_CLASS,
  ADMIN_PAGE_HERO_HEADER_CLASS,
  ADMIN_PAGE_HERO_SUBTITLE_CLASS,
  ADMIN_PAGE_HERO_TITLE_CLASS,
} from '@/app/(app)/admin/admin-page-title';
import { translate, useLocale } from '@/lib/i18n';
import { adminSettingsMessages } from '@/locales/admin-settings';
import { getSystemSettings, SystemSetting, updateSystemSetting } from '@/lib/admin-settings';
import {
  asBoolValue,
  categoryDescriptionKey,
  settingDescriptionKey,
  settingLabelKey,
  settingUnitKey,
  sortCategories,
  sortSettings,
} from '@/lib/admin-settings-display';
import { useAdminAccess } from '@/lib/admin-access';

type EditState = {
  settingId: string | null;
  value: string;
  reason: string;
};

function CategoryIcon({ category }: { category: string }) {
  if (category === 'email') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
        <path
          d="M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  if (category === 'payment') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
        <path d="M3 8h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="14" r="1.5" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }
  if (category === 'security') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
        <path
          d="M12 2l8 3v5c0 5-8 7-8 7s-8-2-8-7V5l8-3Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="m10 13 2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (category === 'routing') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
        <path d="M3 7h4M3 12h4M3 17h4M10 5l6 7-6 7M21 5l-6 7 6 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (category === 'storage') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
        <path d="M3 7h18a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3 12h18a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }
  if (category === 'cache') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
        <path
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (category === 'lifecycle') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path d="M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StatusPill({ enabled, label }: { enabled: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        enabled ? 'bg-[#e9f8ef] text-[#2d7b45]' : 'bg-[#edf1f8] text-[#607594]'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${enabled ? 'bg-[#2d7b45]' : 'bg-[#94a3b8]'}`} />
      {label}
    </span>
  );
}

export default function AdminSettingsPage() {
  const { locale } = useLocale();
  const { isReadOnly } = useAdminAccess();
  const t = (key: string, values?: Record<string, string>) => translate(adminSettingsMessages, locale, key, values);

  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [edit, setEdit] = useState<EditState>({ settingId: null, value: '', reason: '' });

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await getSystemSettings();
        if (!mounted) {
          return;
        }
        setSettings(sortSettings(data.settings));
        setCategories(sortCategories(data.categories));
      } catch (err) {
        setError(err instanceof Error ? err.message : t('errors.load'));
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, [locale]);

  const visibleSettings = useMemo(() => {
    const filtered =
      activeCategory === 'all' ? settings : settings.filter((item) => item.category === activeCategory);
    return sortSettings(filtered);
  }, [activeCategory, settings]);

  const grouped = useMemo(() => {
    const groups: Record<string, SystemSetting[]> = {};
    for (const item of visibleSettings) {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    }
    return Object.entries(groups).sort(([a], [b]) => {
      const sorted = sortCategories([a, b]);
      return sorted.indexOf(a) - sorted.indexOf(b);
    });
  }, [visibleSettings]);

  function settingLabel(item: SystemSetting) {
    const key = settingLabelKey(item.key);
    const translated = t(key);
    if (translated !== key) return translated;
    return item.description ?? item.key.replace(/_/g, ' ');
  }

  function settingDescription(item: SystemSetting) {
    const key = settingDescriptionKey(item.key);
    const translated = t(key);
    if (translated !== key) return translated;
    return item.description ?? t('messages.noDescription');
  }

  function categoryLabel(category: string) {
    const key = `category.${category}`;
    const translated = t(key);
    if (translated !== key) return translated;
    return category.replace(/_/g, ' ');
  }

  function categoryDescription(category: string) {
    const key = categoryDescriptionKey(category);
    const translated = t(key);
    if (translated !== key) return translated;
    return '';
  }

  function formatDisplayValue(item: SystemSetting): string {
    if (item.value_type === 'bool') {
      return asBoolValue(item.value) ? t('field.enabled') : t('field.disabled');
    }
    const unitKey = settingUnitKey(item.key);
    if (unitKey && item.value_type === 'int') {
      const unit = t(unitKey);
      return `${item.value} ${unit}`;
    }
    if (item.is_secret && item.value) {
      return '••••••••';
    }
    return item.value;
  }

  function beginEdit(item: SystemSetting) {
    setEdit({ settingId: item.id, value: item.value, reason: '' });
    setSuccess('');
    setError('');
  }

  function cancelEdit() {
    setEdit({ settingId: null, value: '', reason: '' });
  }

  async function saveEdit(item: SystemSetting) {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updated = await updateSystemSetting(item.key, edit.value, edit.reason || undefined);
      setSettings((prev) => sortSettings(prev.map((entry) => (entry.id === item.id ? updated : entry))));
      setSuccess(t('actions.saved'));
      cancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.save'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-4">
      <header className={ADMIN_PAGE_HERO_HEADER_CLASS}>
        <p className={ADMIN_PAGE_HERO_EYEBROW_CLASS}>{t('hero.eyebrow')}</p>
        <h1 className={ADMIN_PAGE_HERO_TITLE_CLASS}>{t('hero.title')}</h1>
        <p className={ADMIN_PAGE_HERO_SUBTITLE_CLASS}>{t('hero.subtitle')}</p>
      </header>

      <article className="overflow-hidden rounded-2xl border border-[#e2e8f5] bg-white shadow-sm">
        <div className="border-b border-[#e7edf8] bg-[linear-gradient(180deg,#fbfcff_0%,#f4f7fc_100%)] px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#1a2d4d]">{t('general.title')}</h2>
              {!loading && settings.length > 0 ? (
                <p className="mt-1 text-sm text-[#607594]">
                  {t('general.summary', {
                    count: String(settings.length),
                    categories: String(categories.length),
                  })}
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-3">
              <label htmlFor="category-filter" className="text-sm font-medium text-[#36507b]">
                {t('general.filter')}:
              </label>
              <select
                id="category-filter"
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="rounded-lg border border-[#d4dced] bg-white px-3 py-2 text-sm font-medium text-[#36507b] shadow-sm transition hover:border-[#b8c9e6] focus:border-[#2d4f83] focus:outline-none focus:ring-2 focus:ring-[#2d4f83]/20"
              >
                <option value="all">{t('category.all')}</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {categoryLabel(category)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="p-5">
          {isReadOnly ? (
            <p className="mb-4 rounded-xl border border-[#f2d7a7] bg-[#fff9ef] px-4 py-3 text-sm text-[#8a6733]">
              {t('messages.readOnly')}
            </p>
          ) : null}
          {error ? (
            <p className="mb-4 rounded-xl border border-[#f0c7cf] bg-[#fff2f4] px-4 py-3 text-sm text-[#b63d51]">{error}</p>
          ) : null}
          {success ? (
            <p className="mb-4 rounded-xl border border-[#cde7d2] bg-[#f2fbf4] px-4 py-3 text-sm text-[#2d7b45]">{success}</p>
          ) : null}

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((row) => (
                <div key={row} className="h-20 animate-pulse rounded-xl bg-[#eef2f9]" />
              ))}
              <p className="text-sm text-[#607594]">{t('messages.loading')}</p>
            </div>
          ) : null}

          {!loading && visibleSettings.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[#d4dced] bg-[#fbfcff] px-4 py-8 text-center text-sm text-[#607594]">
              {t('messages.empty')}
            </p>
          ) : null}

          {!loading && grouped.length > 0 ? (
            <div className="space-y-5">
              {grouped.map(([category, items]) => (
                <section key={category} className="overflow-hidden rounded-2xl border border-[#e2e8f5]">
                  <div className="flex items-start gap-3 border-b border-[#e7edf8] bg-[linear-gradient(90deg,#f7faff_0%,#ffffff_100%)] px-4 py-3.5">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eaf2ff] text-[#3e69b0]">
                      <CategoryIcon category={category} />
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-[#1a2d4d]">{categoryLabel(category)}</h3>
                      {categoryDescription(category) ? (
                        <p className="mt-0.5 text-sm text-[#607594]">{categoryDescription(category)}</p>
                      ) : null}
                    </div>
                  </div>

                  <ul className="divide-y divide-[#edf2fa]">
                    {items.map((item) => {
                      const isEditing = edit.settingId === item.id;
                      const boolType = item.value_type === 'bool';
                      const enabled = asBoolValue(item.value);
                      const unitKey = settingUnitKey(item.key);

                      return (
                        <li key={item.id} className="px-4 py-4 transition-colors hover:bg-[#fbfcff]">
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-[#1a2d4d]">{settingLabel(item)}</p>
                              <p className="mt-1 text-sm leading-relaxed text-[#607594]">{settingDescription(item)}</p>
                            </div>

                            {!isEditing ? (
                              <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
                                {boolType ? (
                                  <StatusPill enabled={enabled} label={enabled ? t('field.enabled') : t('field.disabled')} />
                                ) : (
                                  <span className="rounded-xl border border-[#e2e8f5] bg-[#f7f9fe] px-3 py-1.5 text-sm font-medium text-[#243555]">
                                    {formatDisplayValue(item)}
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => beginEdit(item)}
                                  disabled={isReadOnly || item.is_locked}
                                  className="rounded-xl border border-[#c5d2eb] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#3e69b0] transition hover:border-[#7ea6e7] hover:bg-[#f4f8ff] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {item.is_locked ? t('field.locked') : t('actions.edit')}
                                </button>
                              </div>
                            ) : null}
                          </div>

                          {isEditing ? (
                            <div className="mt-4 rounded-xl border border-[#d4e3fb] bg-[#f7faff] p-4">
                              <div className="space-y-3">
                                {boolType ? (
                                  <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#d4dced] bg-white px-3 py-2.5">
                                    <span className="text-sm font-medium text-[#2a3d5f]">
                                      {asBoolValue(edit.value) ? t('field.on') : t('field.off')}
                                    </span>
                                    <span className="relative inline-flex h-6 w-11 items-center">
                                      <input
                                        type="checkbox"
                                        checked={asBoolValue(edit.value)}
                                        onChange={(event) =>
                                          setEdit((prev) => ({ ...prev, value: event.target.checked ? 'true' : 'false' }))
                                        }
                                        className="peer sr-only"
                                        disabled={saving}
                                      />
                                      <span className="h-6 w-11 rounded-full bg-[#cbd5e1] transition peer-checked:bg-[#3e69b0]" />
                                      <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
                                    </span>
                                  </label>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type={item.value_type === 'int' ? 'number' : 'text'}
                                      value={edit.value}
                                      onChange={(event) => setEdit((prev) => ({ ...prev, value: event.target.value }))}
                                      className="w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2.5 text-sm text-[#2a3d5f] outline-none focus:border-[#7ea6e7] focus:ring-2 focus:ring-[#7ea6e7]/20"
                                      disabled={saving}
                                    />
                                    {unitKey ? (
                                      <span className="shrink-0 rounded-lg bg-white px-2.5 py-2 text-sm font-medium text-[#607594]">
                                        {t(unitKey)}
                                      </span>
                                    ) : null}
                                  </div>
                                )}

                                <div>
                                  <input
                                    type="text"
                                    value={edit.reason}
                                    onChange={(event) => setEdit((prev) => ({ ...prev, reason: event.target.value }))}
                                    placeholder={t('field.reason')}
                                    className="w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2.5 text-sm text-[#2a3d5f] outline-none focus:border-[#7ea6e7] focus:ring-2 focus:ring-[#7ea6e7]/20"
                                    disabled={saving}
                                  />
                                  <p className="mt-1.5 text-xs text-[#7e90aa]">{t('field.reasonHint')}</p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => void saveEdit(item)}
                                    disabled={saving}
                                    className="rounded-xl border border-[#2d4f83] bg-[linear-gradient(180deg,#182843_0%,#223657_100%)] px-4 py-2 text-xs font-semibold text-white shadow-sm disabled:opacity-60"
                                  >
                                    {saving ? t('actions.saving') : t('actions.save')}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={cancelEdit}
                                    disabled={saving}
                                    className="rounded-xl border border-[#d4dced] bg-white px-4 py-2 text-xs font-semibold text-[#36507b] disabled:opacity-60"
                                  >
                                    {t('actions.cancel')}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          ) : null}
        </div>
      </article>
    </section>
  );
}
