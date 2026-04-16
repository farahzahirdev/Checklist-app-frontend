'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aboutMenuOpen, setAboutMenuOpen] = useState(false);
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));
  const navLinkClass = (href: string) =>
    isActive(href) ? 'text-[#62a2ff] hover:text-[#8ebdff]' : 'text-[#b3c2dc] hover:text-[#ffffff]';
  const mobileNavLinkClass = (href: string) =>
    isActive(href) ? 'rounded-lg px-2 py-1.5 text-[#62a2ff] hover:bg-[#1f7bff]/20' : 'rounded-lg px-2 py-1.5 text-[#b3c2dc] hover:bg-[#1f7bff]/20';

  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <header className="relative z-50 border-b border-[#284776] bg-[#050b1a]/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1440px] items-center px-4 py-4 sm:px-6 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#2f5ba6] bg-[#0b1d3f]">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#62a2ff]" fill="none" aria-hidden="true">
              <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" fill="currentColor" fillOpacity="0.35" stroke="currentColor" strokeWidth="1.8" />
              <path d="m9.4 12.2 1.8 1.8 3.6-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <p className="text-xl font-semibold text-[#edf4ff]">Checklist KB</p>
        </Link>

        <div className="hidden flex-1 justify-center md:flex">
          <nav className="flex flex-wrap items-center gap-6 text-sm font-medium text-[#d8e2f2]">
            <Link href="/" className={navLinkClass('/')}>
              Home
            </Link>
            <Link href="/products" className={navLinkClass('/products')}>
              Products
            </Link>
            <Link href="/contact" className={navLinkClass('/contact')}>
              Contact
            </Link>
            <div
              className="relative"
              onMouseEnter={() => setAboutMenuOpen(true)}
              onMouseLeave={() => setAboutMenuOpen(false)}
            >
              <button
                type="button"
                className={`${navLinkClass('/about-us')} inline-flex items-center gap-1`}
                aria-haspopup="menu"
                aria-expanded={aboutMenuOpen}
                onClick={() => setAboutMenuOpen((prev) => !prev)}
              >
                About Us
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
                  <path d="m5 7 5 6 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div
                className={`absolute left-0 top-full z-[100] w-52 rounded-xl border border-[#2d4d81] bg-[#08162f] p-2 shadow-xl transition duration-150 ${
                  aboutMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'
                }`}
              >
                <Link href="/about-us" className="block rounded-lg px-3 py-2 text-sm text-[#d8e2f2] hover:bg-[#1f7bff]/20" onClick={() => setAboutMenuOpen(false)}>
                  About Us
                </Link>
                <Link href="/how-it-works" className="block rounded-lg px-3 py-2 text-sm text-[#d8e2f2] hover:bg-[#1f7bff]/20" onClick={() => setAboutMenuOpen(false)}>
                  How It Works
                </Link>
                <Link href="/what-you-get" className="block rounded-lg px-3 py-2 text-sm text-[#d8e2f2] hover:bg-[#1f7bff]/20" onClick={() => setAboutMenuOpen(false)}>
                  What You Get
                </Link>
                <Link href="/who-its-for" className="block rounded-lg px-3 py-2 text-sm text-[#d8e2f2] hover:bg-[#1f7bff]/20" onClick={() => setAboutMenuOpen(false)}>
                  Who It&apos;s For
                </Link>
                <Link href="/faq" className="block rounded-lg px-3 py-2 text-sm text-[#d8e2f2] hover:bg-[#1f7bff]/20" onClick={() => setAboutMenuOpen(false)}>
                  FAQ
                </Link>
              </div>
            </div>
          </nav>
        </div>

        <div className="ml-auto hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-lg border border-[#345793] px-4 py-2 text-sm font-medium text-[#e8f0ff] hover:bg-[#1f7bff]/20"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-[#1f7bff] bg-[#1f7bff] px-4 py-2 text-sm font-medium text-[#f5f8ff] hover:bg-[#2e87ff]"
          >
            Get Access
          </Link>
        </div>

        <button
          type="button"
          className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#345793] text-[#e8f0ff] hover:bg-[#1f7bff]/20 md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

      </div>

      {mobileOpen ? (
        <nav className="border-t border-[#284776] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3 text-sm font-medium text-[#d8e2f2]">
            <Link href="/" className={mobileNavLinkClass('/')} onClick={() => setMobileOpen(false)}>
              Home
            </Link>
            <Link href="/products" className={mobileNavLinkClass('/products')} onClick={() => setMobileOpen(false)}>
              Products
            </Link>
            <Link href="/contact" className={mobileNavLinkClass('/contact')} onClick={() => setMobileOpen(false)}>
              Contact
            </Link>
            <div className="mt-2 rounded-lg border border-[#284776] bg-[#09162f]/70 p-2">
              <p className="px-2 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#88aee4]">About & Guidance</p>
              <Link href="/about-us" className={mobileNavLinkClass('/about-us')} onClick={() => setMobileOpen(false)}>
                About Us
              </Link>
              <Link href="/how-it-works" className={mobileNavLinkClass('/how-it-works')} onClick={() => setMobileOpen(false)}>
                How It Works
              </Link>
              <Link href="/what-you-get" className={mobileNavLinkClass('/what-you-get')} onClick={() => setMobileOpen(false)}>
                What You Get
              </Link>
              <Link href="/who-its-for" className={mobileNavLinkClass('/who-its-for')} onClick={() => setMobileOpen(false)}>
                Who It&apos;s For
              </Link>
              <Link href="/faq" className={mobileNavLinkClass('/faq')} onClick={() => setMobileOpen(false)}>
                FAQ
              </Link>
            </div>
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
