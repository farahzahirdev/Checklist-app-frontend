'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  AUTH_STATE_CHANGED_EVENT,
  getCurrentUser,
  getRoleKey,
  logoutAccount,
  persistAccessToken,
  resolveAdminNavbarDisplayName,
  type UserRoleKey,
} from '@/lib/auth';
import { AdminAccessProvider } from '@/lib/admin-access';
import { AdminLanguageSwitcher } from '@/components/admin-language-switcher';
import { translate, useLocale } from '@/lib/i18n';
import { adminMessages } from '@/locales/admin';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { locale } = useLocale();
  const t = (key: string) => translate(adminMessages, locale, key);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [role, setRole] = useState<UserRoleKey | ''>('');
  const [roleLoaded, setRoleLoaded] = useState(false);
  const [displayName, setDisplayName] = useState('User');

  const navItems = [
    { href: '/admin', labelKey: 'nav.dashboard', icon: 'home' },
    { href: '/admin/products', labelKey: 'nav.products', icon: 'box' },
    { href: '/admin/checklists', labelKey: 'nav.checklists', icon: 'checklist' },
    { href: '/admin/users', labelKey: 'nav.users', icon: 'users' },
    { href: '/admin/cms', labelKey: 'nav.cms', icon: 'cms' },
    { href: '/admin/support', labelKey: 'nav.support', icon: 'report' },
    { href: '/admin/logs', labelKey: 'nav.logs', icon: 'shield' },
    { href: '/admin/settings', labelKey: 'nav.settings', icon: 'settings' },
  ] as const;
  const auditorNavHrefs = new Set(['/admin', '/admin/checklists', '/admin/users']);
  const isReadOnly = role !== 'admin';
  const visibleNavItems = isReadOnly
    ? navItems.filter((item) => auditorNavHrefs.has(item.href))
    : navItems;
  const isChecklistPanelRoute = /^\/admin\/checklists\/[^/]+\/?$/.test(pathname);
  const isCmsPreviewFrame = pathname === '/admin/cms/preview-frame';

  useEffect(() => {
    if (!roleLoaded) return;
    if (!isReadOnly) return;
    const isAllowedAuditorRoute =
      pathname === '/admin' ||
      pathname.startsWith('/admin/assessments') ||
      pathname.startsWith('/admin/reports') ||
      pathname.startsWith('/admin/checklists') ||
      pathname.startsWith('/admin/users') ||
      pathname.startsWith('/admin/profile');
    if (!isAllowedAuditorRoute) {
      router.replace('/admin');
    }
  }, [isReadOnly, pathname, roleLoaded, router]);

  useEffect(() => {
    let cancelled = false;
    async function loadRole(event?: Event) {
      const patch = (event as CustomEvent<{ full_name?: string | null }> | undefined)?.detail;
      try {
        const response = await getCurrentUser();
        if (!cancelled) {
          setRole(getRoleKey(response.user.role));
          const name = await resolveAdminNavbarDisplayName(response.user, patch?.full_name);
          if (!cancelled) {
            setDisplayName(name);
            setRoleLoaded(true);
          }
        }
      } catch {
        if (!cancelled) {
          setRoleLoaded(true);
        }
      }
    }
    const onAuthStateChanged = (event: Event) => {
      void loadRole(event);
    };
    void loadRole();
    window.addEventListener(AUTH_STATE_CHANGED_EVENT, onAuthStateChanged);
    return () => {
      cancelled = true;
      window.removeEventListener(AUTH_STATE_CHANGED_EVENT, onAuthStateChanged);
    };
  }, []);

  async function handleLogout() {
    setLogoutLoading(true);
    // Clear local token and navigate first to ensure immediate sign-out UX.
    try {
      persistAccessToken(null);
      setMobileNavOpen(false);
      // Use replace to prevent going back to protected routes
      void router.replace('/login');
      // best-effort server logout without blocking navigation
      void logoutAccount().catch(() => {
        // ignore server logout errors
      });
    } finally {
      setLogoutLoading(false);
    }
  }

  const iconByName = (name: string) => {
    if (name === 'home') return <path d="M3 11.5 12 4l9 7.5M6 10v9h12v-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />;
    if (name === 'clipboard') return <path d="M8 4h8l4 4v12H8zM15 4v4h4M11 13h6M11 17h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />;
    if (name === 'report') return <path d="M7 4h8l4 4v12H7zM15 4v4h4M10 13h6M10 17h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />;
    if (name === 'checklist') return <path d="M8 4h8l4 4v12H8zM15 4v4h4M10 12h5M10 16h5M9 12h.01M9 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />;
    if (name === 'box') return <path d="M4 7.5 12 4l8 3.5v9L12 20l-8-3.5v-9ZM4 7.5l8 3.5 8-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />;
    if (name === 'users') return <path d="M9 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.5-1A2.5 2.5 0 1 0 14 6.5 2.5 2.5 0 0 0 16.5 9ZM4 19c0-2.8 2.2-5 5-5h1c2.8 0 5 2.2 5 5M14 18.6c.3-1.6 1.6-2.8 3.2-2.8h.8c1.2 0 2.2.5 2.8 1.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />;
    if (name === 'shield') return <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" stroke="currentColor" strokeWidth="1.8" />;
    if (name === 'cms') return <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />;
    if (name === 'settings') {
      return (
        <g transform="translate(12 12) scale(0.22) translate(-45 -45)">
          <path
            d="M34.268 90c-.669 0-1.338-.132-1.975-.395l-9.845-4.079c-1.274-.527-2.267-1.519-2.795-2.795-.528-1.274-.528-2.679 0-3.953 1.216-2.936.075-5.558-1.399-7.032-1.474-1.475-4.094-2.615-7.033-1.399-1.273.529-2.677.528-3.952.001-1.275-.528-2.268-1.52-2.795-2.795l-4.078-9.844c-1.089-2.63.164-5.657 2.794-6.748C6.128 49.745 7.174 47.085 7.174 45c0-2.084-1.046-4.745-3.983-5.962-1.274-.528-2.267-1.52-2.795-2.795-.528-1.274-.528-2.678 0-3.952l4.078-9.844c1.09-2.631 4.12-3.883 6.747-2.795 2.936 1.216 5.558.075 7.033-1.399 1.474-1.474 2.616-4.095 1.399-7.032-1.09-2.631.164-5.657 2.795-6.747l9.844-4.077c1.274-.528 2.678-.528 3.953 0 1.275.528 2.268 1.521 2.795 2.796 1.216 2.936 3.877 3.982 5.962 3.982 2.085 0 4.745-1.046 5.962-3.983 1.09-2.631 4.115-3.885 6.748-2.795l9.845 4.077c1.274.528 2.267 1.52 2.795 2.795.527 1.274.527 2.679-.001 3.953-1.217 2.936-.074 5.557 1.399 7.031 1.475 1.474 4.097 2.615 7.032 1.399 1.277-.528 2.68-.527 3.953 0 1.275.528 2.268 1.521 2.796 2.796l4.077 9.843c1.089 2.631-.165 5.658-2.795 6.747-2.937 1.217-3.983 3.878-3.983 5.962 0 2.085 1.046 4.745 3.983 5.962 2.629 1.091 3.883 4.117 2.795 6.747l-4.079 9.845c-.527 1.273-1.52 2.266-2.795 2.795-1.273.528-2.679.528-3.954-.001-2.934-1.217-5.557-.074-7.031 1.399-1.474 1.475-2.615 4.096-1.399 7.032.528 1.274.528 2.678.001 3.953-.528 1.275-1.521 2.267-2.796 2.796l-9.844 4.077c-2.63 1.09-5.657-.166-6.748-2.794-1.217-2.938-3.877-3.985-5.962-3.985-2.084 0-4.746 1.047-5.962 3.984-.527 1.273-1.52 2.266-2.794 2.795C35.607 89.868 34.937 90 34.268 90zM25.491 80.293l8.349 3.459c2.105-4.294 6.31-6.926 11.161-6.926 4.852 0 9.056 2.633 11.16 6.926l8.348-3.459c-1.547-4.524-.435-9.358 2.996-12.788 3.431-3.431 8.265-4.544 12.789-2.996l3.459-8.348c-4.294-2.104-6.926-6.309-6.926-11.16 0-4.852 2.632-9.057 6.926-11.162l-3.459-8.349c-4.523 1.549-9.359.435-12.789-2.994-3.432-3.431-4.543-8.265-2.996-12.789l-8.348-3.458c-2.103 4.293-6.308 6.925-11.16 6.925-4.852 0-9.057-2.632-11.162-6.925l-8.349 3.458c1.548 4.524.436 9.358-2.995 12.789-3.431 3.431-8.264 4.544-12.789 2.994l-3.458 8.349c4.294 2.105 6.926 6.31 6.926 11.162 0 4.852-2.632 9.056-6.926 11.16l3.458 8.348c4.525-1.547 9.359-.435 12.789 2.995 1.112 4.834 2.224 9.668.676 14.192zM45.001 65.781C33.543 65.781 24.22 56.459 24.22 45c0-11.459 9.323-20.781 20.781-20.781S65.783 33.541 65.783 45C65.783 56.459 56.46 65.781 45.001 65.781zM45.001 30.218C36.851 30.218 30.22 36.85 30.22 45c0 8.151 6.631 14.782 14.781 14.782 8.151 0 14.782-6.631 14.782-14.782C59.783 36.85 53.153 30.218 45.001 30.218z"
            fill="currentColor"
            fillRule="nonzero"
          />
        </g>
      );
    }
    if (name === 'logout') return <path d="M10 18H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4M14 15l3-3-3-3M17 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />;
    return null;
  };

  // Implementation guide for frontend dev:
  // 1) Protect this layout with admin-only guard once auth context is wired.
  // 2) Keep checklist management as top priority domain in admin nav.
  return (
    <section className="relative h-screen w-full overflow-hidden bg-[#f4f6fb] text-[#182843]">
      {isChecklistPanelRoute || isCmsPreviewFrame ? (
        <div className="h-full w-full overflow-hidden">
          <AdminAccessProvider isReadOnly={isReadOnly}>
            <div className="h-full w-full">{children}</div>
          </AdminAccessProvider>
        </div>
      ) : null}

      {!isChecklistPanelRoute && !isCmsPreviewFrame ? (
        <>
      {mobileNavOpen ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setMobileNavOpen(false)}
          className="absolute inset-0 z-20 bg-[#06142f]/45 lg:hidden"
        />
      ) : null}
      <div className="grid h-full min-h-0 lg:grid-cols-[250px_1fr]">
        <aside
          className={`absolute inset-y-0 left-0 z-30 h-full w-[250px] border-r border-[#13305c] bg-[linear-gradient(180deg,#06142f,#071a39)] px-4 py-5 text-[#d8e6ff] transition-transform duration-200 lg:static lg:w-auto lg:translate-x-0 ${
            mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Link href="/admin" className="flex items-center gap-2 border-b border-[#1f3f73] pb-4">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#102f63] text-[#5ea2ff]">
              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden="true">
                <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </span>
            <span className="text-xl font-semibold text-white">{t('brand.name')}</span>
          </Link>
          <nav className="mt-4 flex flex-col gap-1.5 text-[15px]">
            {visibleNavItems.map((item) => {
              const href = item.href as string;
              const pathUnderNavHref = (p: string, base: string) =>
                p === base || p.startsWith(`${base}/`) || p.startsWith(`${base}?`);
              const pathClaimedByOtherNav = visibleNavItems.some(
                (other) =>
                  other.href !== '/admin' && pathUnderNavHref(pathname, other.href as string),
              );
              const active =
                href === '/admin'
                  ? pathname === '/admin' || (pathname.startsWith('/admin') && !pathClaimedByOtherNav)
                  : pathUnderNavHref(pathname, href);
              return (
                <Link
                  key={item.href}
                  href={item.href as any}
                  onClick={() => setMobileNavOpen(false)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2.5 transition-colors ${
                    active ? 'bg-[#163a72] text-white' : 'text-[#b8cae7] hover:bg-[#10284f] hover:text-white'
                  }`}
                >
                  <span className="inline-flex h-5 w-5 items-center justify-center">
                    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden="true">
                      {iconByName(item.icon)}
                    </svg>
                  </span>
                  {t(item.labelKey)}
                </Link>
              );
            })}
            <div className="mt-2 lg:hidden">
              <AdminLanguageSwitcher fullWidth />
            </div>
            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={logoutLoading}
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-[#b8cae7] transition-colors hover:bg-[#10284f] hover:text-white disabled:opacity-60"
            >
              <span className="inline-flex h-5 w-5 items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden="true">
                  {iconByName('logout')}
                </svg>
              </span>
              {logoutLoading ? t('actions.loggingOut') : t('actions.logout')}
            </button>
          </nav>
        </aside>
        <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
          <header className="flex items-center justify-between border-b border-[#dde6f5] bg-[linear-gradient(120deg,#071733,#0c2144_45%,#13356d)] px-5 py-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={t('actions.openSidebar')}
                onClick={() => setMobileNavOpen((prev) => !prev)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#2d4f83] bg-[#182843] text-[#dce8ff] hover:bg-[#223657] lg:hidden"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden lg:block">
                <AdminLanguageSwitcher align="right" />
              </div>
              <Link
                href="/admin/profile"
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  pathname.startsWith('/admin/profile')
                    ? 'border-[#5ea2ff] bg-[#223657] text-white'
                    : 'border-[#2d4f83] bg-[#182843] text-[#dce8ff] hover:bg-[#223657]'
                }`}
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#d6e4ff] text-[#274b84]">
                  {displayName.charAt(0).toUpperCase() || 'U'}
                </span>
                {displayName}
              </Link>
            </div>
          </header>
          <div className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4 md:p-5">
            <AdminAccessProvider isReadOnly={isReadOnly}>
              <div>{children}</div>
            </AdminAccessProvider>
          </div>
        </div>
      </div>
        </>
      ) : null}
    </section>
  );
}
