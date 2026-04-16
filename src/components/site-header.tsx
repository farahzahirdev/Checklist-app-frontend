'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));
  const navLinkClass = (href: string) =>
    isActive(href) ? 'text-[#62a2ff] hover:text-[#8ebdff]' : 'text-[#b3c2dc] hover:text-[#ffffff]';
  const mobileNavLinkClass = (href: string) =>
    isActive(href) ? 'rounded-lg px-2 py-1.5 text-[#62a2ff] hover:bg-[#1f7bff]/20' : 'rounded-lg px-2 py-1.5 text-[#b3c2dc] hover:bg-[#1f7bff]/20';

  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <header className="border-b border-[#284776] bg-[#050b1a]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#2f5ba6] bg-[#0b1d3f]">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#62a2ff]" fill="none" aria-hidden="true">
              <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" fill="currentColor" fillOpacity="0.35" stroke="currentColor" strokeWidth="1.8" />
              <path d="m9.4 12.2 1.8 1.8 3.6-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <p className="text-xl font-semibold text-[#edf4ff]">Checklist KB</p>
        </Link>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#345793] text-[#e8f0ff] hover:bg-[#1f7bff]/20 md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <nav className="hidden flex-wrap items-center gap-6 text-sm font-medium text-[#d8e2f2] md:flex">
          <Link href="/" className={navLinkClass('/')}>
            Home
          </Link>
          <Link href="/resources" className={navLinkClass('/resources')}>
            Products
          </Link>
          <Link href="/about-us" className={navLinkClass('/about-us')}>
            About Us
          </Link>
          <Link href="/contact" className={navLinkClass('/contact')}>
            Contact
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-[#345793] px-4 py-2 text-[#e8f0ff] hover:bg-[#1f7bff]/20"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-[#1f7bff] bg-[#1f7bff] px-4 py-2 text-[#f5f8ff] hover:bg-[#2e87ff]"
          >
            Get Access
          </Link>
        </nav>
      </div>

      {mobileOpen ? (
        <nav className="border-t border-[#284776] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3 text-sm font-medium text-[#d8e2f2]">
            <Link href="/" className={mobileNavLinkClass('/')} onClick={() => setMobileOpen(false)}>
              Home
            </Link>
            <Link href="/resources" className={mobileNavLinkClass('/resources')} onClick={() => setMobileOpen(false)}>
              Products
            </Link>
            <Link href="/about-us" className={mobileNavLinkClass('/about-us')} onClick={() => setMobileOpen(false)}>
              About Us
            </Link>
            <Link href="/contact" className={mobileNavLinkClass('/contact')} onClick={() => setMobileOpen(false)}>
              Contact
            </Link>
            <div className="mt-2 flex gap-2">
              <Link
                href="/login"
                className="flex-1 rounded-lg border border-[#345793] px-4 py-2 text-center text-[#e8f0ff] hover:bg-[#1f7bff]/20"
                onClick={() => setMobileOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="flex-1 rounded-lg border border-[#1f7bff] bg-[#1f7bff] px-4 py-2 text-center text-[#f5f8ff] hover:bg-[#2e87ff]"
                onClick={() => setMobileOpen(false)}
              >
                Get Access
              </Link>
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
