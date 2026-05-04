'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getCurrentUser, getRoleKey, getUserDisplayName, logoutAccount, persistAccessToken, type UserRoleKey } from '@/lib/auth';
import { AdminAccessProvider } from '@/lib/admin-access';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [role, setRole] = useState<UserRoleKey | ''>('');
  const [roleLoaded, setRoleLoaded] = useState(false);
  const [displayName, setDisplayName] = useState('User');

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: 'home' },
    { href: '/admin/checklists', label: 'Checklist Content', icon: 'checklist' },
    { href: '/admin/users', label: 'Users & access', icon: 'users' },
    { href: '/admin/support', label: 'Support', icon: 'report' },
    { href: '/admin/logs', label: 'Audit Logs', icon: 'shield' },
  ] as const;
  const isReadOnly = role !== 'admin';
  const visibleNavItems = isReadOnly
    ? navItems.filter((item) => item.href === '/admin' || item.href === '/admin/checklists' || item.href === '/admin/users')
    : navItems;
  const isChecklistPanelRoute = /^\/admin\/checklists\/[^/]+\/?$/.test(pathname);

  useEffect(() => {
    if (!roleLoaded) return;
    if (!isReadOnly) return;
    const isAllowedAuditorRoute =
      pathname === '/admin' || pathname.startsWith('/admin/checklists') || pathname.startsWith('/admin/users');
    if (!isAllowedAuditorRoute) {
      router.replace('/admin/checklists');
    }
  }, [isReadOnly, pathname, roleLoaded, router]);

  useEffect(() => {
    let cancelled = false;
    async function loadRole() {
      try {
        const response = await getCurrentUser();
        if (!cancelled) {
          setRole(getRoleKey(response.user.role));
          setDisplayName(getUserDisplayName(response.user));
          setRoleLoaded(true);
        }
      } catch {
        if (!cancelled) {
          setRoleLoaded(true);
        }
      }
    }
    void loadRole();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    setLogoutLoading(true);
    try {
      await logoutAccount();
    } catch {
      // API logout may fail if token is already invalid.
    } finally {
      persistAccessToken(null);
      setLogoutLoading(false);
      setMobileNavOpen(false);
      router.push('/login');
      router.refresh();
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
    if (name === 'settings') return <path d="M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Zm8 2.5-1.5.8a6.7 6.7 0 0 1-.4 1l.8 1.5-1.8 1.8-1.5-.8a6.7 6.7 0 0 1-1 .4L14 20h-4l-.6-1.5a6.7 6.7 0 0 1-1-.4l-1.5.8-1.8-1.8.8-1.5a6.7 6.7 0 0 1-.4-1L4 12l1.5-.8c.1-.35.25-.69.4-1l-.8-1.5L6.9 6.9l1.5.8c.31-.16.65-.29 1-.4L10 6h4l.6 1.5c.35.1.69.24 1 .4l1.5-.8 1.8 1.8-.8 1.5c.15.31.29.65.4 1L20 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />;
    if (name === 'logout') return <path d="M10 18H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4M14 15l3-3-3-3M17 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />;
    return null;
  };

  // Implementation guide for frontend dev:
  // 1) Protect this layout with admin-only guard once auth context is wired.
  // 2) Keep checklist management as top priority domain in admin nav.
  return (
    <section className="relative h-screen w-full overflow-hidden bg-[#f4f6fb] text-[#182843]">
      {isChecklistPanelRoute ? (
        <div className="h-full w-full overflow-hidden">
          <AdminAccessProvider isReadOnly={isReadOnly}>
            <div className="h-full w-full">{children}</div>
          </AdminAccessProvider>
        </div>
      ) : null}

      {!isChecklistPanelRoute ? (
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
            <span className="text-xl font-semibold text-white">Checklist KB</span>
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
                  {item.label}
                </Link>
              );
            })}
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
              {logoutLoading ? 'Logging out...' : 'Log out'}
            </button>
          </nav>
        </aside>
        <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
          <header className="flex items-center justify-between border-b border-[#dde6f5] bg-[linear-gradient(120deg,#071733,#0c2144_45%,#13356d)] px-5 py-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Open sidebar"
                onClick={() => setMobileNavOpen((prev) => !prev)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#2d4f83] bg-[#182843] text-[#dce8ff] hover:bg-[#223657] lg:hidden"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-[#2d4f83] bg-[#182843] px-3 py-2 text-sm font-medium text-[#dce8ff] hover:bg-[#223657]"
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#d6e4ff] text-[#274b84]">
                  {displayName.charAt(0).toUpperCase() || 'U'}
                </span>
                {displayName}
              </button>
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
