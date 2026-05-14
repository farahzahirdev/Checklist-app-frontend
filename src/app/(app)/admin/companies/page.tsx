'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { AdminBreadcrumbs } from '@/components/admin-breadcrumbs';
import { ADMIN_PAGE_HERO_EYEBROW_CLASS, ADMIN_PAGE_HERO_HEADER_CLASS, ADMIN_PAGE_HERO_SUBTITLE_CLASS, ADMIN_PAGE_TITLE_CLASS } from '@/app/(app)/admin/admin-page-title';
import { createAdminCompany, listAdminCompanies, updateAdminCompany, type AdminCompany } from '@/lib/admin-companies';
import { translate, useLocale } from '@/lib/i18n';
import { adminCompaniesMessages } from '@/locales/admin-companies';

type CompanyFormState = {
  name: string;
  slug: string;
  email: string;
  website: string;
  region: string;
  country: string;
  industry: string;
  size: string;
  description: string;
  compliance_framework: string;
};

const EMPTY_FORM: CompanyFormState = {
  name: '',
  slug: '',
  email: '',
  website: '',
  region: '',
  country: '',
  industry: '',
  size: '',
  description: '',
  compliance_framework: '',
};

function toPayload(form: CompanyFormState) {
  return {
    name: form.name.trim(),
    slug: form.slug.trim(),
    email: form.email.trim() || undefined,
    website: form.website.trim() || undefined,
    region: form.region.trim() || undefined,
    country: form.country.trim() || undefined,
    industry: form.industry.trim() || undefined,
    size: form.size.trim() || undefined,
    description: form.description.trim() || undefined,
    compliance_framework: form.compliance_framework.trim() || undefined,
  };
}

export default function AdminCompaniesPage() {
  const { locale } = useLocale();
  const t = (key: string, values?: Record<string, string>) => translate(adminCompaniesMessages, locale, key, values);
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<CompanyFormState>(EMPTY_FORM);

  async function loadCompanies() {
    setLoading(true);
    setError('');
    try {
      const response = await listAdminCompanies({ limit: 100 });
      setCompanies(response.companies);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('toast.loadFailed');
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCompanies();
  }, []);

  async function onCreateCompany(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error(t('toast.nameSlugRequired'));
      return;
    }
    setSaving(true);
    try {
      await createAdminCompany(toPayload(form));
      setForm(EMPTY_FORM);
      await loadCompanies();
      toast.success(t('toast.created'));
    } catch (err) {
      const message = err instanceof Error ? err.message : t('toast.createFailed');
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleCompany(company: AdminCompany) {
    try {
      await updateAdminCompany(company.id, { is_active: !company.is_active });
      await loadCompanies();
      toast.success(company.is_active ? t('toast.deactivated') : t('toast.activated'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toast.updateFailed'));
    }
  }

  return (
    <section className="space-y-4">
      <header className={ADMIN_PAGE_HERO_HEADER_CLASS}>
        <AdminBreadcrumbs
          variant="onDark"
          items={[{ label: t('crumbs.dashboard'), href: '/admin' }, { label: t('crumbs.companies') }]}
        />
        <p className={ADMIN_PAGE_HERO_EYEBROW_CLASS}>{t('hero.eyebrow')}</p>
        <h1 className={`mt-2 ${ADMIN_PAGE_TITLE_CLASS} text-white`}>{t('hero.title')}</h1>
        <p className={ADMIN_PAGE_HERO_SUBTITLE_CLASS}>{t('hero.subtitle')}</p>
      </header>

      {error ? <p className="rounded-xl border border-[#ffccd3] bg-[#fff3f5] px-3 py-2 text-sm text-[#c43e53]">{error}</p> : null}

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-2xl border border-[#d4dced] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#6f82a3]">{t('list.eyebrow')}</p>
              <h2 className="mt-1 text-xl font-semibold text-[#1f2d45]">{t('list.title')}</h2>
            </div>
            <button type="button" onClick={() => void loadCompanies()} className="rounded-lg border border-[#d4dced] px-3 py-2 text-sm text-[#2a3d5f] hover:bg-[#f6f9ff]">
              {loading ? t('list.refreshing') : t('list.refresh')}
            </button>
          </div>
          <div className="mt-4 overflow-hidden rounded-xl border border-[#e4eaf6]">
            <div className="grid grid-cols-[1.4fr_0.8fr_0.5fr_auto] gap-3 border-b border-[#e4eaf6] bg-[#f7f9fe] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#607594]">
              <span>{t('th.name')}</span>
              <span>{t('th.slug')}</span>
              <span>{t('th.status')}</span>
              <span className="text-right">{t('th.action')}</span>
            </div>
            <ul className="divide-y divide-[#eef2fa] bg-white">
              {companies.map((company) => (
                <li key={company.id} className="grid grid-cols-[1.4fr_0.8fr_0.5fr_auto] items-center gap-3 px-4 py-3 text-sm">
                  <div>
                    <p className="font-semibold text-[#1f2d45]">{company.name}</p>
                    <p className="text-xs text-[#607594]">
                      {t('created')} {new Date(company.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="truncate text-[#445c7e]">{company.slug}</span>
                  <span className={company.is_active ? 'font-semibold text-[#2f9960]' : 'font-semibold text-[#c43e53]'}>
                    {company.is_active ? t('status.active') : t('status.inactive')}
                  </span>
                  <div className="justify-self-end">
                    <button
                      type="button"
                      onClick={() => void toggleCompany(company)}
                      className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#223657]"
                    >
                      {company.is_active ? t('action.deactivate') : t('action.activate')}
                    </button>
                  </div>
                </li>
              ))}
              {!companies.length && !loading ? (
                <li className="px-4 py-5 text-sm text-[#607594]">{t('empty')}</li>
              ) : null}
            </ul>
          </div>
        </article>

        <article className="rounded-2xl border border-[#d4dced] bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-[#6f82a3]">{t('form.eyebrow')}</p>
          <h2 className="mt-1 text-xl font-semibold text-[#1f2d45]">{t('form.title')}</h2>
          <form className="mt-4 space-y-3" onSubmit={onCreateCompany}>
            {(
              [
                ['name', 'field.name'],
                ['slug', 'field.slug'],
                ['email', 'field.email'],
                ['website', 'field.website'],
                ['region', 'field.region'],
                ['country', 'field.country'],
                ['industry', 'field.industry'],
                ['size', 'field.size'],
                ['compliance_framework', 'field.compliance_framework'],
              ] as const
            ).map(([field, labelKey]) => (
              <label key={field} className="block space-y-1 text-sm">
                <span className="text-[#3f5677]">{t(labelKey)}</span>
                <input
                  value={form[field as keyof CompanyFormState]}
                  onChange={(event) => setForm((previous) => ({ ...previous, [field]: event.target.value }))}
                  className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-[#243555] outline-none focus:ring-2 focus:ring-[#8bb4ff]/50"
                />
              </label>
            ))}
            <label className="block space-y-1 text-sm">
              <span className="text-[#3f5677]">{t('field.description')}</span>
              <textarea
                value={form.description}
                onChange={(event) => setForm((previous) => ({ ...previous, description: event.target.value }))}
                rows={4}
                className="w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-[#243555] outline-none focus:ring-2 focus:ring-[#8bb4ff]/50"
              />
            </label>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg border border-[#2d4f83] bg-[#182843] px-4 py-2 text-sm font-semibold text-white hover:bg-[#223657] disabled:opacity-60"
            >
              {saving ? t('submit.creating') : t('submit.create')}
            </button>
          </form>
        </article>
      </div>
    </section>
  );
}