'use client';

import { useEffect, useMemo, useState } from 'react';
import { getCurrentUser, type AuthUser } from '@/lib/auth';
import { ensureActiveCompanyId, getActiveCompanyId, setActiveCompanyId } from '@/lib/company-context';
import { listMyCompanies, selectCustomerCompany, type CustomerCompany } from '@/lib/customer-companies';

type Props = {
  label?: string;
  compact?: boolean;
  onCompanyChange?: (companyId: string) => void;
};

export default function CompanySwitcher({ label = 'Company', compact = false, onCompanyChange }: Props) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [companies, setCompanies] = useState<CustomerCompany[]>([]);
  const [activeCompanyId, setLocalActiveCompanyId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const activeCompany = useMemo(
    () => companies.find((company) => company.id === activeCompanyId) ?? null,
    [activeCompanyId, companies],
  );

  useEffect(() => {
    let mounted = true;

    async function loadCompanies() {
      setLoading(true);
      setError('');
      try {
        const [me, response] = await Promise.all([getCurrentUser(), listMyCompanies()]);
        if (!mounted) return;
        setUser(me.user);
        setCompanies(response.companies ?? []);
        const preferred = ensureActiveCompanyId(me.user.primary_company_id);
        const nextActive = preferred || response.companies?.[0]?.id || '';
        if (nextActive) {
          setLocalActiveCompanyId(nextActive);
          setActiveCompanyId(nextActive);
          onCompanyChange?.(nextActive);
        }
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load companies');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadCompanies();
    return () => {
      mounted = false;
    };
  }, [onCompanyChange]);

  async function handleChange(companyId: string) {
    setLocalActiveCompanyId(companyId);
    setActiveCompanyId(companyId);
    onCompanyChange?.(companyId);
    setSaving(true);
    setError('');
    try {
      await selectCustomerCompany(companyId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to select company');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className={compact ? 'text-xs text-[#6c83a8]' : 'rounded-xl border border-[#dbe4f4] bg-white p-4 text-sm text-[#607594]'}>Loading companies...</div>;
  }

  if (error && !companies.length) {
    return <p className="rounded-xl border border-[#f0c7cf] bg-[#fff2f4] px-3 py-2 text-sm text-[#b63d51]">{error}</p>;
  }

  return (
    <div className={compact ? 'space-y-2' : 'rounded-2xl border border-[#dbe4f4] bg-white p-4 shadow-sm'}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[#6f82a3]">{label}</p>
          <p className="text-sm font-semibold text-[#1f2d45]">
            {activeCompany?.name || user?.primary_company_id ? 'Active company' : 'No company selected'}
          </p>
        </div>
        {saving ? <span className="text-xs text-[#607594]">Saving...</span> : null}
      </div>
      <select
        value={activeCompanyId}
        onChange={(event) => void handleChange(event.target.value)}
        className="mt-3 w-full rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring"
      >
        <option value="">Select a company</option>
        {companies.map((company) => (
          <option key={company.id} value={company.id}>
            {company.name}
          </option>
        ))}
      </select>
      {activeCompany ? <p className="text-xs text-[#607594]">Slug: {activeCompany.slug}</p> : null}
      {error ? <p className="text-xs text-[#b63d51]">{error}</p> : null}
    </div>
  );
}
