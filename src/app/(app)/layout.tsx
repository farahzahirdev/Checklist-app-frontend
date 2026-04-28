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
  getUserDisplayName,
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
  const [displayName, setDisplayName] = useState('User');
  const [roleSwitchActive, setRoleSwitchActive] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdminPath = pathname?.startsWith('/admin') ?? false;
  const isPaymentPath = pathname === '/payment' || pathname?.startsWith('/payment/') || false;
  const isPaymentsPath = pathname?.startsWith('/payments') ?? false;
  const dashboardActive = pathname === '/dashboard';
  const assessmentActive = pathname?.startsWith('/assessment') ?? false;
  const accessActive = pathname?.startsWith('/access') ?? false;
  const purchaseActive = isPaymentPath;
  const paymentsActive = isPaymentsPath;
  const isCustomerShell = role === 'customer';
  const needsCustomerMfa = isCustomerShell && mfaRequired && !mfaEnabled;

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
    // Customer onboarding gate: until MFA is enabled, allow only the payment onboarding flow.
    if (currentRole === 'customer' && mfaRequired && !mfaEnabled) {
      return currentPath.startsWith('/payment');
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
    if (currentPath.startsWith('/payments')) {
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
        setDisplayName(getUserDisplayName(response.user));
        setRoleSwitchActive(isRoleSwitchSessionActive());
        setMfaRequired(Boolean(response.mfa_required));
        setMfaEnabled(Boolean(response.mfa_enabled));
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
    if (!authReady) return;
    if (!pathname) return;
    if (!needsCustomerMfa) return;
    // Ensure customer cannot land on protected routes without completing MFA.
    if (!pathname.startsWith('/payment')) {
      router.replace('/payment');
    }
  }, [authReady, needsCustomerMfa, pathname, router]);

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
      isCustomerShell && isPaymentPath ? (
        <main className="min-h-screen bg-white text-[#1f2d45]">
          <div className="py-8 md:py-10">{children}</div>
        </main>
      ) : isCustomerShell ? (
        <main className="relative h-screen w-full overflow-hidden bg-[#f4f6fb] text-[#182843]">
          {mobileMenuOpen ? (
            <button
              type="button"
              aria-label="Close sidebar overlay"
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 z-20 bg-[#06142f]/45 lg:hidden"
            />
          ) : null}
          <div className="grid h-full min-h-0 lg:grid-cols-[250px_1fr]">
            <aside
              className={`absolute inset-y-0 left-0 z-30 h-full w-[250px] border-r border-[#13305c] bg-[linear-gradient(180deg,#06142f,#071a39)] px-4 py-5 text-[#d8e6ff] transition-transform duration-200 lg:static lg:w-auto lg:translate-x-0 ${
                mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              <Link href="/dashboard" className="flex items-center gap-2 border-b border-[#1f3f73] pb-4">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#102f63] text-[#5ea2ff]">
                  <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden="true">
                    <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                </span>
                <span className="text-xl font-semibold text-white">Checklist KB</span>
              </Link>
              <nav className="mt-4 flex flex-col gap-1.5 text-[15px]">
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-2 rounded-xl px-3 py-2.5 transition-colors ${
                    dashboardActive ? 'bg-[#163a72] text-white' : 'text-[#b8cae7] hover:bg-[#10284f] hover:text-white'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/assessment"
                  className={`flex items-center gap-2 rounded-xl px-3 py-2.5 transition-colors ${
                    assessmentActive ? 'bg-[#163a72] text-white' : 'text-[#b8cae7] hover:bg-[#10284f] hover:text-white'
                  }`}
                >
                  Assessment
                </Link>
                <Link
                  href="/access"
                  className={`flex items-center gap-2 rounded-xl px-3 py-2.5 transition-colors ${
                    accessActive ? 'bg-[#163a72] text-white' : 'text-[#b8cae7] hover:bg-[#10284f] hover:text-white'
                  }`}
                >
                  Access
                </Link>
                <Link
                  href="/payment"
                  className={`flex items-center gap-2 rounded-xl px-3 py-2.5 transition-colors ${
                    purchaseActive ? 'bg-[#163a72] text-white' : 'text-[#b8cae7] hover:bg-[#10284f] hover:text-white'
                  }`}
                >
                  Purchase
                </Link>
                <Link
                  href="/payments"
                  className={`flex items-center gap-2 rounded-xl px-3 py-2.5 transition-colors ${
                    paymentsActive ? 'bg-[#163a72] text-white' : 'text-[#b8cae7] hover:bg-[#10284f] hover:text-white'
                  }`}
                >
                  Payments
                </Link>
                <LogoutButton />
                {roleSwitchActive ? (
                  <button
                    type="button"
                    onClick={() => void onReturnToAdmin()}
                    className="mt-2 rounded-xl border border-amber-300/70 bg-amber-500/10 px-3 py-2 text-left text-sm text-amber-100 hover:bg-amber-500/20"
                  >
                    Return to Admin
                  </button>
                ) : null}
              </nav>
            </aside>
            <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
              <header className="flex items-center justify-between border-b border-[#dde6f5] bg-[linear-gradient(120deg,#071733,#0c2144_45%,#13356d)] px-5 py-5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Open sidebar"
                    onClick={() => setMobileMenuOpen((prev) => !prev)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#2d4f83] bg-[#182843] text-[#dce8ff] hover:bg-[#223657] lg:hidden"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </button>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9dc5ff]">Customer Workspace</p>
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
              <div className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4 md:p-5">{children}</div>
            </div>
          </div>
        </main>
      ) : (
        <main className="min-h-screen bg-white text-[#1f2d45]">
          <div className={isPaymentPath ? 'py-8 md:py-10' : 'px-6 py-8 md:px-8 md:py-10'}>{children}</div>
        </main>
      )
    )
  );
}