'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import {
  listMyCompanies,
  createCustomerCompany,
  updateCustomerCompany,
  leaveCustomerCompany,
  type CustomerCompany,
  type CreateCustomerCompanyPayload,
} from '@/lib/customer-companies';
import { getActiveCompanyId, setActiveCompanyId } from '@/lib/company-context';

export default function CompanyManagement() {
  const [companies, setCompanies] = useState<CustomerCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [region, setRegion] = useState('');
  const [country, setCountry] = useState('');
  const [industry, setIndustry] = useState('');
  const [size, setSize] = useState('');
  const [description, setDescription] = useState('');
  const [framework, setFramework] = useState('');

  async function loadCompanies() {
    setLoading(true);
    try {
      const response = await listMyCompanies();
      setCompanies(response.companies || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load companies');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCompanies();
  }, []);

  function resetForm() {
    setName('');
    setSlug('');
    setEmail('');
    setWebsite('');
    setRegion('');
    setCountry('');
    setIndustry('');
    setSize('');
    setDescription('');
    setFramework('');
    setEditingId(null);
  }

  function openFormForEdit(company: CustomerCompany) {
    setEditingId(company.id);
    setName(company.name);
    setSlug(company.slug);
    setEmail(company.email || '');
    setWebsite(company.website || '');
    setRegion(company.region || '');
    setCountry(company.country || '');
    setIndustry(company.industry || '');
    setSize(company.size || '');
    setDescription(company.description || '');
    setFramework(company.compliance_framework || '');
    setShowForm(true);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !slug.trim()) {
      toast.error('Company name and slug are required.');
      return;
    }

    setSaving(true);
    try {
      const payload: CreateCustomerCompanyPayload = {
        name: name.trim(),
        slug: slug.trim(),
        email: email.trim() || null,
        website: website.trim() || null,
        region: region.trim() || null,
        country: country.trim() || null,
        industry: industry.trim() || null,
        size: size.trim() || null,
        description: description.trim() || null,
        compliance_framework: framework.trim() || null,
      };

      if (editingId) {
        await updateCustomerCompany(editingId, payload);
        toast.success('Company updated successfully.');
      } else {
        await createCustomerCompany(payload);
        toast.success('Company created successfully.');
      }

      await loadCompanies();
      resetForm();
      setShowForm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save company.');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(companyId: string) {
    if (!window.confirm('Are you sure you want to leave this company?')) return;

    try {
      await leaveCustomerCompany(companyId);
      toast.success('You left the company.');
      const active = getActiveCompanyId();
      if (active === companyId) {
        setActiveCompanyId(null);
      }
      await loadCompanies();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to leave company.');
    }
  }

  return (
    <article className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-[#1f2d45]">Manage Companies</h3>
          <p className="mt-1 text-sm text-[#607594]">Create and manage your companies/tenants for multi-tenant access.</p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm font-semibold text-white hover:bg-[#223657]"
          >
            + Add Company
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-[#dbe4f4] bg-[#f9fafc] p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1.5 text-sm">
              <span className="text-[#4f6281]">
                Company name <span className="text-[#c43e53]">*</span>
              </span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g., Acme Corp"
                className="w-full rounded-lg border border-[#d4dced] bg-white px-3 py-2 text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring"
                required
              />
            </label>
            <label className="block space-y-1.5 text-sm">
              <span className="text-[#4f6281]">
                Slug <span className="text-[#c43e53]">*</span>
              </span>
              <input
                type="text"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder="e.g., acme-corp"
                className="w-full rounded-lg border border-[#d4dced] bg-white px-3 py-2 text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring"
                required
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1.5 text-sm">
              <span className="text-[#4f6281]">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="company@example.com"
                className="w-full rounded-lg border border-[#d4dced] bg-white px-3 py-2 text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring"
              />
            </label>
            <label className="block space-y-1.5 text-sm">
              <span className="text-[#4f6281]">Website</span>
              <input
                type="url"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
                placeholder="https://example.com"
                className="w-full rounded-lg border border-[#d4dced] bg-white px-3 py-2 text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1.5 text-sm">
              <span className="text-[#4f6281]">Industry</span>
              <input
                type="text"
                value={industry}
                onChange={(event) => setIndustry(event.target.value)}
                placeholder="e.g., Technology"
                className="w-full rounded-lg border border-[#d4dced] bg-white px-3 py-2 text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring"
              />
            </label>
            <label className="block space-y-1.5 text-sm">
              <span className="text-[#4f6281]">Company size</span>
              <input
                type="text"
                value={size}
                onChange={(event) => setSize(event.target.value)}
                placeholder="e.g., 100-500"
                className="w-full rounded-lg border border-[#d4dced] bg-white px-3 py-2 text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1.5 text-sm">
              <span className="text-[#4f6281]">Region</span>
              <input
                type="text"
                value={region}
                onChange={(event) => setRegion(event.target.value)}
                placeholder="e.g., North America"
                className="w-full rounded-lg border border-[#d4dced] bg-white px-3 py-2 text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring"
              />
            </label>
            <label className="block space-y-1.5 text-sm">
              <span className="text-[#4f6281]">Country</span>
              <input
                type="text"
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                placeholder="e.g., USA"
                className="w-full rounded-lg border border-[#d4dced] bg-white px-3 py-2 text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring"
              />
            </label>
          </div>

          <label className="block space-y-1.5 text-sm">
            <span className="text-[#4f6281]">Compliance framework</span>
            <input
              type="text"
              value={framework}
              onChange={(event) => setFramework(event.target.value)}
              placeholder="e.g., ISO 27001"
              className="w-full rounded-lg border border-[#d4dced] bg-white px-3 py-2 text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring"
            />
          </label>

          <label className="block space-y-1.5 text-sm">
            <span className="text-[#4f6281]">Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Company description"
              rows={3}
              className="w-full rounded-lg border border-[#d4dced] bg-white px-3 py-2 text-[#243555] outline-none ring-[#8bb4ff]/50 focus:ring"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm font-semibold text-white hover:bg-[#223657] disabled:opacity-60"
            >
              {saving ? 'Saving...' : editingId ? 'Update Company' : 'Create Company'}
            </button>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
              className="rounded-lg border border-[#d4dced] px-3 py-2 text-sm text-[#2a3d5f] hover:bg-[#f6f9ff]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-[#607594]">Loading companies...</p>
      ) : companies.length === 0 ? (
        <p className="rounded-lg border border-[#dbe4f4] bg-[#f7f9fe] p-3 text-sm text-[#607594]">No companies yet. Create one to get started.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[#dbe4f4]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#dbe4f4] bg-[#f7f9fe]">
                <th className="px-4 py-3 text-left font-semibold text-[#4f6281]">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-[#4f6281]">Slug</th>
                <th className="px-4 py-3 text-left font-semibold text-[#4f6281]">Industry</th>
                <th className="px-4 py-3 text-left font-semibold text-[#4f6281]">Region</th>
                <th className="px-4 py-3 text-right font-semibold text-[#4f6281]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id} className="border-b border-[#eef2fa] hover:bg-[#f9fafc]">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-[#1f2d45]">{company.name}</p>
                      {company.email && <p className="text-xs text-[#607594]">{company.email}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#607594]">{company.slug}</td>
                  <td className="px-4 py-3 text-[#607594]">{company.industry || '-'}</td>
                  <td className="px-4 py-3 text-[#607594]">{company.region || '-'}</td>
                  <td className="space-x-2 px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => openFormForEdit(company)}
                      className="text-xs font-semibold text-[#2d4f83] hover:text-[#1f3f73]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void onDelete(company.id)}
                      className="text-xs font-semibold text-[#c43e53] hover:text-[#a83045]"
                    >
                      Leave
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}
