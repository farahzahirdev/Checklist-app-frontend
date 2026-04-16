import Link from 'next/link';
import bgImage from '@/assets/enhancing-company-security-with-devsecops-1cd3ef018cfd4451906d426172a2ecae.jpg';
import { PublicFooter } from '@/components/public-footer';

function ArrowRightIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" aria-hidden="true">
      <path d="M4 10h10m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ContactPage() {
  const heroStyle = {
    backgroundImage: `linear-gradient(rgba(243, 246, 255, 0.68), rgba(243, 246, 255, 0.74)), url(${bgImage.src})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  } as const;

  return (
    <main className="overflow-x-hidden bg-[#f3f5fb]">
      <section style={heroStyle}>
        <div className="mx-auto grid min-h-[560px] w-full max-w-[1440px] gap-8 px-4 py-8 sm:px-6 md:px-6 md:py-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#4d7fd3] motion-safe:animate-fade-in motion-safe:delay-75">Contact Us</p>
              <h1 className="text-4xl font-semibold text-[#1a2440] motion-safe:animate-fade-in-up motion-safe:delay-100 sm:text-5xl">Contact Us</h1>
              <p className="max-w-lg text-xl leading-8 text-[#334768] motion-safe:animate-fade-in-up motion-safe:delay-200">
                Have a question about audit readiness or the product?
              </p>
            </div>

            <form className="max-w-xl space-y-4 rounded-2xl border border-[#d4dced] bg-white/70 p-4 shadow-sm backdrop-blur transition-shadow duration-300 motion-safe:animate-fade-in-up motion-safe:delay-300 motion-safe:hover:shadow-md sm:p-5">
              <label className="block">
                <span className="text-sm font-medium text-[#2d3f62]">Name</span>
                <input
                  type="text"
                  className="mt-1 w-full rounded-lg border border-[#d5deef] bg-white/85 px-3 py-2 text-[#1d2a42] outline-none ring-[#2f7dff]/35 transition-shadow duration-200 focus:ring-2"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-[#2d3f62]">Email</span>
                <input
                  type="email"
                  className="mt-1 w-full rounded-lg border border-[#d5deef] bg-white/85 px-3 py-2 text-[#1d2a42] outline-none ring-[#2f7dff]/35 transition-shadow duration-200 focus:ring-2"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-[#2d3f62]">Company (optional)</span>
                <input
                  type="text"
                  className="mt-1 w-full rounded-lg border border-[#d5deef] bg-white/85 px-3 py-2 text-[#1d2a42] outline-none ring-[#2f7dff]/35 transition-shadow duration-200 focus:ring-2"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-[#2d3f62]">Message</span>
                <textarea
                  rows={3}
                  placeholder="Describe your situation (e.g., upcoming audit, missing documentation, unclear requirements)"
                  className="mt-1 w-full rounded-lg border border-[#d5deef] bg-white/85 px-3 py-2 text-[#1d2a42] outline-none ring-[#2f7dff]/35 transition-shadow duration-200 focus:ring-2"
                />
              </label>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-[#1f7bff] bg-[#1f7bff] px-6 py-3 text-lg font-semibold text-white transition-colors duration-200 hover:bg-[#2e87ff] active:scale-[0.98] motion-safe:active:transition-transform"
              >
                Send Message
                <ArrowRightIcon />
              </button>
            </form>
          </div>

          <div className="flex items-start lg:pt-[86px]">
            <div className="w-full max-w-xl rounded-2xl border border-[#d4dced] bg-white/72 p-6 shadow-sm backdrop-blur transition-shadow duration-300 motion-safe:animate-fade-in-right motion-safe:delay-200 motion-safe:hover:shadow-md sm:p-8">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8efff] text-[#2f7dff]">
                <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" aria-hidden="true">
                  <rect x="3" y="5.5" width="18" height="13" rx="2.4" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <h2 className="mt-5 text-2xl font-semibold text-[#1f2741] sm:text-3xl">Prefer direct contact?</h2>
              <p className="mt-2 text-lg text-[#4c5f80] sm:text-xl">Feel free to email us anytime.</p>
              <p className="mt-6 inline-flex max-w-full items-center gap-3 break-all text-lg font-semibold text-[#1f2741] sm:text-2xl lg:text-3xl">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8efff] text-[#2f7dff]">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                    <path d="M3 7.5h18v9H3z" stroke="currentColor" strokeWidth="1.8" />
                    <path d="m3.5 8 8.5 6 8.5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                info@checklistkb.com
              </p>
              <p className="mt-5 text-lg text-[#4c5f80] sm:text-xl">We respond within 24 hours.</p>
            </div>
          </div>
        </div>
      </section>

      <section style={heroStyle}>
        <div className="mx-auto max-w-[1440px] px-4 py-12 text-center sm:px-6 md:px-6 md:py-14">
          <h2 className="text-3xl font-semibold text-[#1a2440] motion-safe:animate-fade-in-up sm:text-4xl md:text-5xl">Start your assessment today</h2>
          <p className="mx-auto mt-3 max-w-3xl text-lg text-[#495b7a] motion-safe:animate-fade-in-up motion-safe:delay-100 md:text-xl">
            Get access to our tools and simplify your cybersecurity audit process.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 motion-safe:animate-fade-in-up motion-safe:delay-200">
            <Link
              href="/register"
              className="inline-flex min-w-[240px] items-center justify-center gap-2 rounded-xl border border-[#1f7bff] bg-[#1f7bff] px-8 py-3 text-xl font-semibold text-white transition-colors duration-200 hover:bg-[#2e87ff] active:scale-[0.98] motion-safe:active:transition-transform"
            >
              Get Access
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
            <Link
              href="/products"
              className="inline-flex min-w-[240px] items-center justify-center gap-2 rounded-xl border border-[#cfd8ea] bg-white/85 px-8 py-3 text-xl font-semibold text-[#233553] transition-colors duration-200 hover:bg-white active:scale-[0.98] motion-safe:active:transition-transform"
            >
              View Products
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 md:px-6 md:py-10">
        <div className="rounded-2xl border border-[#d7deeb] bg-white p-5 shadow-sm transition-shadow duration-300 motion-safe:animate-fade-in-up motion-safe:hover:shadow-md md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-[#d7deeb] bg-[#eef2ff] text-[#2f7dff]">
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden="true">
                  <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              </span>
              <div>
                <p className="text-2xl font-semibold text-[#1f2741] md:text-3xl">Start your assessment today</p>
                <p className="mt-1 text-base text-[#546684] md:text-lg">Sign up now and simplify your cybersecurity audit process.</p>
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#1f7bff] bg-[#1f7bff] px-7 py-3 text-base font-semibold text-white transition-colors duration-200 hover:bg-[#2e87ff] active:scale-[0.98] motion-safe:active:transition-transform md:text-lg"
              >
                Get Access
                <ArrowRightIcon />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#cfd8ea] bg-white px-7 py-3 text-base font-semibold text-[#233553] transition-colors duration-200 hover:bg-[#f7f9ff] active:scale-[0.98] motion-safe:active:transition-transform md:text-lg"
              >
                View Products
                <ArrowRightIcon />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
