'use client';

import { useEffect, useMemo, useState } from 'react';
import { ADMIN_PAGE_TITLE_CLASS } from '@/app/(app)/admin/admin-page-title';
import { translate, useLocale } from '@/lib/i18n';
import { adminSettingsMessages } from '@/locales/admin-settings';
import { getSystemSettings, SystemSetting, updateSystemSetting } from '@/lib/admin-settings';
import { useAdminAccess } from '@/lib/admin-access';

type EditState = {
  settingId: string | null;
  value: string;
  reason: string;
};

function asBoolValue(value: string): boolean {
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
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
        setSettings(data.settings);
        setCategories(data.categories);
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
    if (activeCategory === 'all') {
      return settings;
    }
    return settings.filter((item) => item.category === activeCategory);
  }, [activeCategory, settings]);

  const grouped = useMemo(() => {
    const groups: Record<string, SystemSetting[]> = {};
    for (const item of visibleSettings) {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    }
    return groups;
  }, [visibleSettings]);

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
      setSettings((prev) => prev.map((entry) => (entry.id === item.id ? updated : entry)));
      setSuccess(t('actions.saved'));
      cancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.save'));
    } finally {
      setSaving(false);
    }
  }

  function categoryLabel(category: string) {
    if (category === 'email') {
      return t('category.email');
    }
    if (category === 'lifecycle') {
      return t('category.lifecycle');
    }
    return category;
  }

  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-[#dbe4f4] bg-white px-5 py-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6f82a3]">{t('hero.eyebrow')}</p>
        <h1 className={`mt-2 ${ADMIN_PAGE_TITLE_CLASS}`}>{t('hero.title')}</h1>
        <p className="mt-1 text-sm text-[#607594]">{t('hero.subtitle')}</p>
      </header>

      <article className="rounded-2xl border border-[#e2e8f5] bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-[#243555]">{t('general.title')}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                activeCategory === 'all'
                  ? 'border-[#2d4f83] bg-[#182843] text-white'
                  : 'border-[#d4dced] bg-[#f7f9fe] text-[#36507b]'
              }`}
            >
              {t('category.all')}
            </button>
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                  activeCategory === category
                    ? 'border-[#2d4f83] bg-[#182843] text-white'
                    : 'border-[#d4dced] bg-[#f7f9fe] text-[#36507b]'
                }`}
              >
                {categoryLabel(category)}
              </button>
            ))}
          </div>
        </div>

        {isReadOnly ? (
          <p className="mt-3 rounded-lg border border-[#f2d7a7] bg-[#fff9ef] px-3 py-2 text-xs text-[#8a6733]">
            {t('messages.readOnly')}
          </p>
        ) : null}
        {error ? <p className="mt-3 rounded-lg border border-[#f0c7cf] bg-[#fff2f4] px-3 py-2 text-xs text-[#b63d51]">{error}</p> : null}
        {success ? <p className="mt-3 rounded-lg border border-[#cde7d2] bg-[#f2fbf4] px-3 py-2 text-xs text-[#2d7b45]">{success}</p> : null}

        {loading ? (
          <p className="mt-4 text-sm text-[#607594]">{t('messages.loading')}</p>
        ) : null}

        {!loading ? (
          <div className="mt-4 space-y-4">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="rounded-xl border border-[#e2e8f5] bg-[#fbfcff]">
                <div className="border-b border-[#e2e8f5] px-3 py-2 text-sm font-semibold text-[#3a547d]">
                  {categoryLabel(category)}
                </div>
                <div className="divide-y divide-[#e7edf8]">
                  {items.map((item) => {
                    const isEditing = edit.settingId === item.id;
                    const boolType = item.value_type === 'bool';
                    return (
                      <div key={item.id} className="px-3 py-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-[#243555]">{item.key}</p>
                            <p className="text-xs text-[#5f7598]">{item.description ?? t('messages.noDescription')}</p>
                          </div>
                          <div className="text-xs uppercase tracking-[0.12em] text-[#7e90aa]">{item.value_type}</div>
                        </div>

                        <div className="mt-2 space-y-2">
                          {isEditing ? (
                            <>
                              {boolType ? (
                                <label className="inline-flex items-center gap-2 text-sm text-[#2a3d5f]">
                                  <input
                                    type="checkbox"
                                    checked={asBoolValue(edit.value)}
                                    onChange={(event) =>
                                      setEdit((prev) => ({ ...prev, value: event.target.checked ? 'true' : 'false' }))
                                    }
                                    className="h-4 w-4 accent-[#3f74df]"
                                    disabled={saving}
                                  />
                                  {asBoolValue(edit.value) ? t('field.enabled') : t('field.disabled')}
                                </label>
                              ) : (
                                <input
                                  type={item.value_type === 'int' ? 'number' : 'text'}
                                  value={edit.value}
                                  onChange={(event) => setEdit((prev) => ({ ...prev, value: event.target.value }))}
                                  className="w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm text-[#2a3d5f] outline-none focus:border-[#7ea6e7]"
                                  disabled={saving}
                                />
                              )}
                              <input
                                type="text"
                                value={edit.reason}
                                onChange={(event) => setEdit((prev) => ({ ...prev, reason: event.target.value }))}
                                placeholder={t('field.reason')}
                                className="w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm text-[#2a3d5f] outline-none focus:border-[#7ea6e7]"
                                disabled={saving}
                              />
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => void saveEdit(item)}
                                  disabled={saving}
                                  className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                                >
                                  {saving ? t('actions.saving') : t('actions.save')}
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEdit}
                                  disabled={saving}
                                  className="rounded-lg border border-[#d4dced] bg-white px-3 py-1.5 text-xs font-semibold text-[#36507b] disabled:opacity-60"
                                >
                                  {t('actions.cancel')}
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="rounded-lg border border-[#e2e8f5] bg-white px-3 py-1.5 text-sm text-[#2a3d5f]">
                                {boolType ? (asBoolValue(item.value) ? t('field.enabled') : t('field.disabled')) : item.value}
                              </div>
                              <button
                                type="button"
                                onClick={() => beginEdit(item)}
                                disabled={isReadOnly || item.is_locked}
                                className="rounded-lg border border-[#d4dced] bg-white px-3 py-1.5 text-xs font-semibold text-[#36507b] disabled:opacity-50"
                              >
                                {item.is_locked ? t('field.locked') : t('actions.edit')}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </article>

    </section>
  );
}
