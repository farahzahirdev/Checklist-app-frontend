'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { Route } from 'next';
import { LogoutButton } from '@/components/logout-button';
import {
  ACCESS_TOKEN_STORAGE_KEY,
  clearRoleSwitchSession,
  getCurrentUser,
  getRoleKey,
  isRoleSwitchSessionActive,
  restoreOriginalAccessToken,
  type UserRoleKey,
} from '@/lib/auth';
import { endAdminRoleSwitch } from '@/lib/admin-users';

export default function AppLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const [authReady, setAuthReady] = useState(false);
  const [role, setRole] = useState<UserRoleKey | ''>('');
  const [roleSwitchActive, setRoleSwitchActive] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdminPath = pathname?.startsWith('/admin') ?? false;
  const isPaymentPath = pathname?.startsWith('/payment') ?? false;
  const dashboardActive = pathname === '/dashboard';
  const assessmentActive = pathname?.startsWith('/assessment') ?? false;
  const accessActive = pathname?.startsWith('/access') ?? false;

  function canAccessPath(currentRole: UserRoleKey, currentPath: string): boolean {
    if (currentPath.startsWith('/admin')) {
      return currentRole === 'admin' || currentRole === 'auditor';
    }
    if (currentPath.startsWith('/auditor')) {
      return currentRole === 'auditor' || currentRole === 'admin';
    }
    if (currentPath.startsWith('/reports')) {
      return currentRole === 'admin' || currentRole === 'auditor';
    }
    if (currentPath.startsWith('/assessment')) {
      return currentRole === 'customer';
    }
    if (currentPath.startsWith('/access')) {
      return currentRole === 'customer';
    }
    if (currentPath.startsWith('/payment')) {
      return currentRole === 'customer';
    }
    return true;
  }

  function defaultPathForRole(currentRole: UserRoleKey): string {
    if (currentRole === 'admin') {
      return '/admin';
    }
    if (currentRole === 'auditor') {
      return '/admin';
    }
    return '/dashboard';
  }

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      if (typeof window === 'undefined') {
        return;
      }
      const token = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
      if (!token) {
        router.push('/login');
        return;
      }
      try {
        const response = await getCurrentUser();
        if (cancelled) return;
        setRole(getRoleKey(response.user.role));
        setRoleSwitchActive(isRoleSwitchSessionActive());
        setAuthReady(true);
      } catch {
        window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
        if (!cancelled) {
          router.push('/login');
        }
      }
    }

    void checkAuth();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function onReturnToAdmin() {
    try {
      await endAdminRoleSwitch();
    } catch {
      // Continue with local recovery even if API call fails.
    } finally {
      const restored = restoreOriginalAccessToken();
      if (!restored) {
        clearRoleSwitchSession();
      }
      setRoleSwitchActive(false);
      router.push('/admin');
      router.refresh();
    }
  }

  useEffect(() => {
    if (!authReady) return;
    if (!pathname) return;
    if (!role) return;
    if (!canAccessPath(role, pathname)) {
      router.push(defaultPathForRole(role) as Route);
    }
  }, [authReady, pathname, role, router]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (!authReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6 py-8 text-[#1f2d45] md:py-10">
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-10 w-10 animate-spin rounded-full border-4 border-[#dbe4f4] border-t-[#2f4f83]"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-[#4c607d]">Validating session...</p>
        </div>
      </main>
    );
  }

  return (
    isAdminPath ? (
      <main className="min-h-screen bg-[#e9eef8] text-[#ffffff]">{children}</main>
    ) : (
      <main className="min-h-screen bg-white text-[#1f2d45]">
        {!isPaymentPath ? (
          <header
            className="w-full border-b border-[#2f4d82] px-6 py-5 md:px-8 md:py-6"
            style={{ background: 'linear-gradient(180deg, #06142f, #071a39)' }}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-[#9dc5ff]">Checklist App</p>
                <p className="mt-2 text-xl font-semibold text-white md:text-2xl">Customer Workspace</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen((previous) => !previous)}
                className="inline-flex items-center rounded-md border border-[#345793] px-3 py-2 text-sm text-[#d8e2f2] hover:bg-[#1f7bff]/20 md:hidden"
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle navigation menu"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
              <nav className="hidden items-center gap-3 text-sm text-[#d8e2f2] md:flex">
                {role === 'customer' ? (
                  <>
                    <Link
                      href="/dashboard"
                      className={`rounded-lg border px-3 py-1.5 ${
                        dashboardActive
                          ? 'border-[#1f7bff] bg-[#1f7bff]/25 text-[#f3f8ff] hover:bg-[#1f7bff]/35'
                          : 'border-[#345793] text-[#d8e2f2] hover:bg-[#1f7bff]/20'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/assessment"
                      className={`rounded-lg border px-3 py-1.5 ${
                        assessmentActive
                          ? 'border-[#1f7bff] bg-[#1f7bff]/25 text-[#f3f8ff] hover:bg-[#1f7bff]/35'
                          : 'border-[#345793] text-[#d8e2f2] hover:bg-[#1f7bff]/20'
                      }`}
                    >
                      Assessment
                    </Link>
                    <Link
                      href="/access"
                      className={`rounded-lg border px-3 py-1.5 ${
                        accessActive
                          ? 'border-[#1f7bff] bg-[#1f7bff]/25 text-[#f3f8ff] hover:bg-[#1f7bff]/35'
                          : 'border-[#345793] text-[#d8e2f2] hover:bg-[#1f7bff]/20'
                      }`}
                    >
                      Access
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/" className="rounded-lg border border-[#345793] px-3 py-1.5 hover:bg-[#1f7bff]/20">
                      Public
                    </Link>
                    <Link href="/reports" className="rounded-lg border border-[#345793] px-3 py-1.5 hover:bg-[#1f7bff]/20">
                      Reports
                    </Link>
                    <Link href="/products/audit-readiness-checklist" className="rounded-lg border border-[#345793] px-3 py-1.5 hover:bg-[#1f7bff]/20">
                      Product Details
                    </Link>
                    <Link href="/health" className="rounded-lg border border-[#345793] px-3 py-1.5 hover:bg-[#1f7bff]/20">
                      Health
                    </Link>
                  </>
                )}
                <LogoutButton />
                {roleSwitchActive ? (
                  <button
                    type="button"
                    onClick={() => void onReturnToAdmin()}
                    className="rounded-lg border border-amber-300/70 bg-amber-500/10 px-3 py-1.5 text-amber-100 hover:bg-amber-500/20"
                  >
                    Return to Admin
                  </button>
                ) : null}
              </nav>
            </div>
            {mobileMenuOpen ? (
              <nav className="mt-4 flex flex-col gap-2 border-t border-[#2f4d82] pt-4 text-sm text-[#d8e2f2] md:hidden">
                {role === 'customer' ? (
                  <>
                    <Link
                      href="/dashboard"
                      className={`rounded-lg border px-3 py-2 ${
                        dashboardActive
                          ? 'border-[#1f7bff] bg-[#1f7bff]/25 text-[#f3f8ff] hover:bg-[#1f7bff]/35'
                          : 'border-[#345793] text-[#d8e2f2] hover:bg-[#1f7bff]/20'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/assessment"
                      className={`rounded-lg border px-3 py-2 ${
                        assessmentActive
                          ? 'border-[#1f7bff] bg-[#1f7bff]/25 text-[#f3f8ff] hover:bg-[#1f7bff]/35'
                          : 'border-[#345793] text-[#d8e2f2] hover:bg-[#1f7bff]/20'
                      }`}
                    >
                      Assessment
                    </Link>
                    <Link
                      href="/access"
                      className={`rounded-lg border px-3 py-2 ${
                        accessActive
                          ? 'border-[#1f7bff] bg-[#1f7bff]/25 text-[#f3f8ff] hover:bg-[#1f7bff]/35'
                          : 'border-[#345793] text-[#d8e2f2] hover:bg-[#1f7bff]/20'
                      }`}
                    >
                      Access
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/" className="rounded-lg border border-[#345793] px-3 py-2 hover:bg-[#1f7bff]/20">
                      Public
                    </Link>
                    <Link href="/reports" className="rounded-lg border border-[#345793] px-3 py-2 hover:bg-[#1f7bff]/20">
                      Reports
                    </Link>
                    <Link href="/products/audit-readiness-checklist" className="rounded-lg border border-[#345793] px-3 py-2 hover:bg-[#1f7bff]/20">
                      Product Details
                    </Link>
                    <Link href="/health" className="rounded-lg border border-[#345793] px-3 py-2 hover:bg-[#1f7bff]/20">
                      Health
                    </Link>
                  </>
                )}
                <LogoutButton />
                {roleSwitchActive ? (
                  <button
                    type="button"
                    onClick={() => void onReturnToAdmin()}
                    className="rounded-lg border border-amber-300/70 bg-amber-500/10 px-3 py-2 text-amber-100 hover:bg-amber-500/20"
                  >
                    Return to Admin
                  </button>
                ) : null}
              </nav>
            ) : null}
          </header>
        ) : null}

        <div className={isPaymentPath ? 'py-8 md:py-10' : 'px-6 py-8 md:px-8 md:py-10'}>{children}</div>
      </main>
    )
  );
}