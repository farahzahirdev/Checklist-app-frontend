'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { listMyCompanies, type CustomerCompany } from '@/lib/customer-companies';
import { getActiveCompanyId, setActiveCompanyId } from '@/lib/company-context';

export default function NavbarCompanySelector() {
  const [companies, setCompanies] = useState<CustomerCompany[]>([]);
  const [activeCompanyId, setActiveCompany] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeCompany = companies.find((c) => c.id === activeCompanyId);

  useEffect(() => {
    let mounted = true;

    async function loadCompanies() {
      try {
        const response = await listMyCompanies();
        if (!mounted) return;
        setCompanies(response.companies || []);

        const stored = getActiveCompanyId();
        if (stored) {
          setActiveCompany(stored);
        } else if (response.companies && response.companies.length > 0) {
          const firstCompanyId = response.companies[0].id;
          setActiveCompanyId(firstCompanyId);
          setActiveCompany(firstCompanyId);
        }
      } catch {
        // Fail silently in navbar
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadCompanies();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
    return undefined;
  }, [dropdownOpen]);

  const handleSelectCompany = (companyId: string) => {
    setActiveCompanyId(companyId);
    setActiveCompany(companyId);
    setDropdownOpen(false);
  };

  if (loading || companies.length === 0) {
    return (
      <Link
        href={'/profile?tab=companies' as any}
        className="inline-flex items-center gap-2 rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm font-medium text-[#dce8ff] hover:bg-[#223657]"
      >
        <span className="inline-flex h-5 w-5 items-center justify-center rounded text-[#6ba3ff]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </span>
        Add Company
      </Link>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="inline-flex items-center gap-2 rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm font-medium text-[#dce8ff] hover:bg-[#223657]"
      >
        <span className="inline-flex h-5 w-5 items-center justify-center rounded text-[#6ba3ff]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </span>
        <span className="truncate max-w-[120px]">{activeCompany?.name || 'Select Company'}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-[#2d4f83] bg-[#182843] shadow-lg">
          <div className="max-h-64 overflow-y-auto">
            {companies.map((company) => (
              <button
                key={company.id}
                type="button"
                onClick={() => handleSelectCompany(company.id)}
                className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                  activeCompanyId === company.id
                    ? 'bg-[#2a5aa8] text-white font-medium'
                    : 'text-[#b8cae7] hover:bg-[#223657] hover:text-white'
                }`}
              >
                <p className="font-medium">{company.name}</p>
                <p className="text-xs opacity-75">{company.slug}</p>
              </button>
            ))}
          </div>

          <div className="border-t border-[#2d4f83] p-2">
            <Link
              href={'/profile?tab=companies' as any}
              className="flex items-center gap-2 rounded px-3 py-2 text-sm text-[#6ba3ff] hover:bg-[#223657]"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
              </svg>
              Add New Company
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
