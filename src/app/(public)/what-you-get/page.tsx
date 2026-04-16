import Link from 'next/link';
import { PublicFooter } from '@/components/public-footer';
import heroBackground from '@/assets/cybersecurity-background-59ognpsy7izka4l9.png';

export default function WhatYouGetPage() {
  const heroStyle = {
    backgroundImage: `radial-gradient(circle at 20% 20%, rgba(16, 55, 114, 0.62) 0%, rgba(7, 22, 47, 0.72) 45%, rgba(4, 16, 34, 0.78) 100%), url(${heroBackground.src})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  } as const;

  return (
    <main className="overflow-x-hidden bg-[#f3f5fb]">
      <section className="relative overflow-hidden border-b border-[#12315b]" style={heroStyle}>
        <div className="pointer-events-none absolute inset-0 opacity-35">
          <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-[#2262d9]/40 blur-3xl" />
          <div className="absolute right-24 top-6 h-72 w-72 rounded-full bg-[#143f8f]/40 blur-3xl" />
        </div>
        <div className="relative mx-auto grid min-h-[560px] max-w-[1440px] items-center gap-8 px-4 py-12 sm:px-6 md:px-6 md:py-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="inline-flex rounded-full border border-[#255da8] bg-[#12366c] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#9ac3ff] motion-safe:animate-fade-in motion-safe:delay-75">
              Real insights, real value
            </p>
            <h1 className="mt-4 text-5xl font-semibold leading-tight text-white motion-safe:animate-fade-in-up motion-safe:delay-100 sm:text-6xl">
              Everything You Need to
              <br />
              <span className="text-[#3f8bff]">Understand and Improve</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-[#c7d8f8] motion-safe:animate-fade-in-up motion-safe:delay-200">
              Checklist KB turns your answers into clear insights, so you can close gaps, strengthen your security
              posture, and get audit-ready with confidence.
            </p>
            <div className="mt-7 flex flex-wrap gap-3 motion-safe:animate-fade-in-up motion-safe:delay-300">
              <Link
                href="/products"
                className="rounded-xl border border-[#1f7bff] bg-[#1f7bff] px-6 py-3 font-semibold text-white transition-colors duration-200 hover:bg-[#2e87ff] active:scale-[0.98] motion-safe:active:transition-transform"
              >
                Try the Demo
              </Link>
              <Link
                href="/products/audit-readiness-checklist"
                className="rounded-xl border border-[#375785] bg-[#0a2246] px-6 py-3 font-semibold text-[#dbe8ff] transition-colors duration-200 hover:bg-[#123162] active:scale-[0.98] motion-safe:active:transition-transform"
              >
                See Example Report
              </Link>
            </div>
          </div>

          <div className="relative motion-safe:animate-fade-in-right motion-safe:delay-200">
            <div className="overflow-hidden rounded-2xl border border-[#2f4f86] bg-[#f8fbff] shadow-[0_20px_50px_rgba(0,0,0,0.45)] transition-shadow duration-500 ease-out motion-safe:hover:shadow-[0_24px_60px_rgba(0,0,0,0.42)]">
              <div className="grid md:grid-cols-[182px_1fr]">
                <aside className="min-h-[336px] bg-[#091d3f] p-4 text-[#d7e6ff]">
                  <p className="mb-4 text-sm font-semibold uppercase tracking-[0.15em]">Checklist KB</p>
                  <ul className="space-y-2.5 text-sm">
                    <li className="rounded-md px-2 py-1.5 text-[#a8bedf]">Dashboard</li>
                    <li className="rounded-md px-2 py-1.5 text-[#a8bedf]">Checklist</li>
                    <li className="rounded-md px-2 py-1.5 text-[#a8bedf]">Evidence</li>
                    <li className="rounded-md bg-[#163f7d] px-2 py-1.5">Reports</li>
                    <li className="rounded-md px-2 py-1.5 text-[#a8bedf]">Settings</li>
                  </ul>
                </aside>
                <div className="p-5 text-[#1f3253]">
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#4e6c96]">Reports</p>
                  <h3 className="mt-2 text-base font-semibold sm:text-lg">Executive Summary</h3>
                  <div className="mt-4 rounded-lg border border-[#e2e8f4] bg-white p-3">
                    <div className="flex items-center gap-3 text-xs font-semibold">
                      <span className="rounded-full bg-[#2f7dff] px-2 py-0.5 text-white">Overview</span>
                      <span className="text-[#6d809f]">Sections</span>
                      <span className="text-[#6d809f]">Answers</span>
                    </div>
                    <div className="mt-3 grid items-center gap-3 sm:grid-cols-[1fr_180px]">
                      <div>
                        <p className="text-sm text-[#5c7397]">Maturity Score</p>
                        <p className="mt-1 text-5xl font-bold leading-none text-[#1f355d]">62%</p>
                        <p className="mt-1 text-sm font-medium text-[#39a06a]">+12% vs. last assessment</p>
                        <div className="mt-3 h-1.5 rounded-full bg-[#d8e4f7]">
                          <div className="h-full w-[62%] rounded-full bg-[#2f7dff]" />
                        </div>
                      </div>
                      <svg viewBox="0 0 320 210" className="h-32 w-full" fill="none" aria-hidden="true">
                        <g stroke="#e4ebf8" strokeWidth="1.2">
                          <polygon points="160,32 237,70 237,140 160,178 83,140 83,70" />
                          <polygon points="160,56 214,83 214,127 160,154 106,127 106,83" />
                          <polygon points="160,78 194,96 194,114 160,132 126,114 126,96" />
                        </g>
                        <g stroke="#e4ebf8" strokeWidth="1.2">
                          <line x1="160" y1="105" x2="160" y2="32" />
                          <line x1="160" y1="105" x2="237" y2="70" />
                          <line x1="160" y1="105" x2="237" y2="140" />
                          <line x1="160" y1="105" x2="160" y2="178" />
                          <line x1="160" y1="105" x2="83" y2="140" />
                          <line x1="160" y1="105" x2="83" y2="70" />
                        </g>
                        <polygon
                          points="160,52 220,78 222,136 160,166 102,134 108,82"
                          fill="#93b5f3"
                          fillOpacity="0.42"
                          stroke="#5e97ed"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-4 hidden w-52 rounded-2xl border border-[#d7e2f5] bg-white p-4 shadow-[0_16px_30px_rgba(0,0,0,0.2)] sm:block">
              <p className="text-sm font-semibold text-[#2a3e63]">Top Priorities</p>
              <ul className="mt-2 space-y-1.5 text-xs">
                <li className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[#c43939]">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#ef4b4b]" />
                    High
                  </span>
                  <span className="font-semibold text-[#c43939]">7</span>
                </li>
                <li className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[#946d15]">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#f2b535]" />
                    Medium
                  </span>
                  <span className="font-semibold text-[#946d15]">12</span>
                </li>
                <li className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[#2f8b54]">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#44c479]" />
                    Low
                  </span>
                  <span className="font-semibold text-[#2f8b54]">5</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8 border-y border-[#dbe2ee] bg-[#eceff5]">
        <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 md:px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#8a99b2]">
            Trusted by organizations that take security seriously
          </p>
          <div className="mt-4 grid gap-3 text-center text-[31px] font-semibold text-[#7d8da8] sm:grid-cols-3 md:grid-cols-5">
            <span>TECHSOLVE</span>
            <span>NEXORA</span>
            <span>DATAVANCE</span>
            <span>SECURITAS</span>
            <span>CLOUDWELL</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-12 sm:px-6 md:px-6">
        <h2 className="text-center text-4xl font-semibold text-[#1a2440]">Here&apos;s What You Get</h2>
        <p className="mt-2 text-center text-lg text-[#5e7293]">Clear outputs. Actionable insights. Audit-ready results.</p>

        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[#d7deeb] bg-[#f2fbf6] p-5 shadow-sm transition-shadow duration-300 ease-out motion-safe:transition-transform motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-md">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f7ee] text-[#30b271]">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
                <path d="M4 17h16M6 14l3-3 3 2 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <h3 className="mt-3 text-2xl font-semibold text-[#1f355d]">Clear Gap Analysis</h3>
            <p className="mt-2 text-sm text-[#5e7293]">See where you stand and what needs improvement.</p>
            <ul className="mt-4 space-y-1.5 text-sm text-[#4e6283]">
              <li className="flex items-center gap-2">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#30b271] text-white">
                  <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" aria-hidden="true">
                    <path d="m2.6 6 2 2 4.8-4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                Visual maturity overview
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#30b271] text-white">
                  <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" aria-hidden="true">
                    <path d="m2.6 6 2 2 4.8-4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                Section-by-section scores
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#30b271] text-white">
                  <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" aria-hidden="true">
                    <path d="m2.6 6 2 2 4.8-4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                Easy to understand
              </li>
            </ul>
          </article>
          <article className="rounded-2xl border border-[#d7deeb] bg-[#f2f7ff] p-5 shadow-sm transition-shadow duration-300 ease-out motion-safe:transition-transform motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-md">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#e9f0ff] text-[#3c7df0]">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
                <path d="M7 3h8l4 4v14H7zM15 3v4h4M10 13h6M10 17h6" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </span>
            <h3 className="mt-3 text-2xl font-semibold text-[#1f355d]">Structured Report</h3>
            <p className="mt-2 text-sm text-[#5e7293]">A professional PDF report you can share with your team or auditor.</p>
            <ul className="mt-4 space-y-1.5 text-sm text-[#4e6283]">
              <li className="flex items-center gap-2">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#3c7df0] text-white">
                  <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" aria-hidden="true">
                    <path d="m2.6 6 2 2 4.8-4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                Executive summary
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#3c7df0] text-white">
                  <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" aria-hidden="true">
                    <path d="m2.6 6 2 2 4.8-4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                Detailed findings
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#3c7df0] text-white">
                  <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" aria-hidden="true">
                    <path d="m2.6 6 2 2 4.8-4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                Maturity score
              </li>
            </ul>
          </article>
          <article className="rounded-2xl border border-[#d7deeb] bg-[#fffaf0] p-5 shadow-sm transition-shadow duration-300 ease-out motion-safe:transition-transform motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-md">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#fff5df] text-[#f2b535]">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
                <path
                  d="M16.121 7.937c-1.326-1.187-3.039-1.732-4.824-1.535-2.94.325-5.236 2.706-5.46 5.662-.134 1.78.501 3.529 1.743 4.799.539.551.835 1.307.835 2.131v4.013a.994.994 0 0 0 .993.993h5.177a.994.994 0 0 0 .993-.993v-4.076c0-.776.298-1.524.818-2.051A6.531 6.531 0 0 0 18.172 12.5c0-1.755-.75-3.437-2.05-4.563Zm-1.543 11.61v1.056H13.667a.267.267 0 1 0 0 .534h.911v1.056H8.422v-1.056h3.74a.267.267 0 1 0 0-.534h-3.74v-1.056h6.156Zm-.46 4.186H9.882a.46.46 0 0 1-.46-.46v-.566h5.156v.566a.46.46 0 0 1-.46.46Zm1.17-6.101a3.763 3.763 0 0 0-.97 2.222H8.41a3.843 3.843 0 0 0-.983-2.239 5.147 5.147 0 0 1-1.592-4.386c.204-2.69 2.296-4.858 4.974-5.154a5.266 5.266 0 0 1 4.394 1.398 5.093 5.093 0 0 1 .085 7.16ZM15.5 12.1a.267.267 0 0 1-.267-.267 3.075 3.075 0 0 0-1.043-2.332 2.92 2.92 0 0 0-2.445-.778.267.267 0 1 1-.059-.531 3.45 3.45 0 0 1 2.861.908 3.607 3.607 0 0 1 1.22 2.733.267.267 0 0 1-.267.267Z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <h3 className="mt-3 text-2xl font-semibold text-[#1f355d]">Actionable Recommendations</h3>
            <p className="mt-2 text-sm text-[#5e7293]">Know exactly what to fix, in what order, and where to start.</p>
            <ul className="mt-4 space-y-1.5 text-sm text-[#4e6283]">
              <li className="flex items-center gap-2">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#f2b535] text-white">
                  <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" aria-hidden="true">
                    <path d="m2.6 6 2 2 4.8-4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                Prioritized by risk and impact
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#f2b535] text-white">
                  <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" aria-hidden="true">
                    <path d="m2.6 6 2 2 4.8-4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                Practical next steps
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#f2b535] text-white">
                  <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" aria-hidden="true">
                    <path d="m2.6 6 2 2 4.8-4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                Built-in guidance
              </li>
            </ul>
          </article>
          <article className="rounded-2xl border border-[#d7deeb] bg-[#f6f3ff] p-5 shadow-sm transition-shadow duration-300 ease-out motion-safe:transition-transform motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-md">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#f1ecff] text-[#6c62f7]">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
                <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </span>
            <h3 className="mt-3 text-2xl font-semibold text-[#1f355d]">Stronger Audit Readiness</h3>
            <p className="mt-2 text-sm text-[#5e7293]">Build confidence before the auditor arrives.</p>
            <ul className="mt-4 space-y-1.5 text-sm text-[#4e6283]">
              <li className="flex items-center gap-2">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#6c62f7] text-white">
                  <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" aria-hidden="true">
                    <path d="m2.6 6 2 2 4.8-4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                Identify gaps early
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#6c62f7] text-white">
                  <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" aria-hidden="true">
                    <path d="m2.6 6 2 2 4.8-4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                Improve with evidence
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#6c62f7] text-white">
                  <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" aria-hidden="true">
                    <path d="m2.6 6 2 2 4.8-4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                Save time and reduce stress
              </li>
            </ul>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-6 sm:px-6 md:px-6">
        <div className="rounded-3xl border border-[#dde4f2] bg-[#eef3fb] p-5 shadow-[0_14px_28px_rgba(22,38,72,0.08)] transition-shadow duration-300 motion-safe:animate-fade-in-up motion-safe:hover:shadow-[0_18px_34px_rgba(22,38,72,0.12)] sm:p-6">
          <h3 className="text-center text-3xl font-semibold text-[#1b2f52]">Example Report Preview</h3>
          <p className="mt-2 text-center text-sm text-[#5f7393]">
            Every report is tailored to your answers. Exportable. Shareable. Actionable.
          </p>
          <div className="mt-5 grid items-stretch gap-4 lg:grid-cols-3">
            <article className="flex h-full flex-col rounded-2xl border border-[#d9e2f1] bg-white p-4 transition-shadow duration-300 motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md">
              <p className="text-sm font-semibold text-[#1f355d]">Maturity Overview</p>
              <div className="mt-3 flex flex-1 rounded-xl border border-[#e4eaf6] bg-[#fbfcff] p-3">
                <div className="grid w-full grid-cols-[1fr_104px] gap-3">
                  <div className="flex items-center justify-center rounded-xl bg-[#f3f7ff] p-2">
                    <svg viewBox="0 0 320 210" className="h-24 w-full" fill="none" aria-hidden="true">
                      <g stroke="#e4ebf8" strokeWidth="1.2">
                        <polygon points="160,32 237,70 237,140 160,178 83,140 83,70" />
                        <polygon points="160,56 214,83 214,127 160,154 106,127 106,83" />
                        <polygon points="160,78 194,96 194,114 160,132 126,114 126,96" />
                      </g>
                      <g stroke="#e4ebf8" strokeWidth="1.2">
                        <line x1="160" y1="105" x2="160" y2="32" />
                        <line x1="160" y1="105" x2="237" y2="70" />
                        <line x1="160" y1="105" x2="237" y2="140" />
                        <line x1="160" y1="105" x2="160" y2="178" />
                        <line x1="160" y1="105" x2="83" y2="140" />
                        <line x1="160" y1="105" x2="83" y2="70" />
                      </g>
                      <polygon
                        points="160,52 220,78 222,136 160,166 102,134 108,82"
                        fill="#93b5f3"
                        fillOpacity="0.42"
                        stroke="#5e97ed"
                        strokeWidth="2"
                      />
                      <text x="160" y="22" textAnchor="middle" className="fill-[#6f7f98] text-[10px]">Governance</text>
                      <text x="252" y="74" textAnchor="start" className="fill-[#6f7f98] text-[10px]">Risk Mgmt.</text>
                      <text x="250" y="140" textAnchor="start" className="fill-[#6f7f98] text-[10px]">Asset Mgmt.</text>
                      <text x="160" y="198" textAnchor="middle" className="fill-[#6f7f98] text-[10px]">Incident Mgmt.</text>
                      <text x="70" y="140" textAnchor="end" className="fill-[#6f7f98] text-[10px]">Operations</text>
                      <text x="70" y="74" textAnchor="end" className="fill-[#6f7f98] text-[10px]">Compliance</text>
                    </svg>
                  </div>
                  <ul className="space-y-0.5 text-xs text-[#47608a]">
                    <li className="flex items-center justify-between gap-2 border-b border-[#e5ebf7] pb-0.5"><span className="font-semibold text-[#2f75e8]">Governance</span><span className="font-semibold">72%</span></li>
                    <li className="flex items-center justify-between gap-2 border-b border-[#e5ebf7] pb-0.5"><span className="font-semibold text-[#2f75e8]">Risk Mgmt.</span><span className="font-semibold">58%</span></li>
                    <li className="flex items-center justify-between gap-2 border-b border-[#e5ebf7] pb-0.5"><span className="font-semibold text-[#2f75e8]">Asset Mgmt.</span><span className="font-semibold">45%</span></li>
                    <li className="flex items-center justify-between gap-2 border-b border-[#e5ebf7] pb-0.5"><span className="font-semibold text-[#2f75e8]">Access Control</span><span className="font-semibold">65%</span></li>
                    <li className="flex items-center justify-between gap-2 border-b border-[#e5ebf7] pb-0.5"><span className="font-semibold text-[#2f75e8]">Operations</span><span className="font-semibold">55%</span></li>
                    <li className="flex items-center justify-between gap-2"><span className="font-semibold text-[#2f75e8]">Compliance</span><span className="font-semibold">70%</span></li>
                  </ul>
                </div>
              </div>
            </article>
            <article className="flex h-full flex-col rounded-2xl border border-[#d9e2f1] bg-white p-4 transition-shadow duration-300 motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md">
              <p className="text-sm font-semibold text-[#1f355d]">Top Priorities</p>
              <div className="mt-3 flex flex-1 flex-col rounded-xl border border-[#e4eaf6] bg-[#fbfcff] p-3">
                <div className="grid grid-cols-[18px_1fr_60px] items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#7a8ca8]">
                  <span />
                  <span>Finding</span>
                  <span className="text-right">Impact</span>
                </div>
                <div className="mt-2 flex-1 space-y-2 text-xs text-[#334f7a]">
                  <div className="grid grid-cols-[18px_1fr_60px] items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[#ef4b4b]" />
                    <span>MFA not enforced for all users</span>
                    <span className="text-right font-semibold text-[#c43939]">High</span>
                  </div>
                  <div className="grid grid-cols-[18px_1fr_60px] items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[#f2b535]" />
                    <span>Asset inventory incomplete</span>
                    <span className="text-right font-semibold text-[#946d15]">Medium</span>
                  </div>
                  <div className="grid grid-cols-[18px_1fr_60px] items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[#44c479]" />
                    <span>Policy review overdue</span>
                    <span className="text-right font-semibold text-[#2f8b54]">Low</span>
                  </div>
                </div>
              </div>
            </article>
            <article className="flex h-full flex-col rounded-2xl border border-[#d9e2f1] bg-white p-4 transition-shadow duration-300 motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md">
              <p className="text-sm font-semibold text-[#1f355d]">Detailed Findings</p>
              <div className="mt-3 flex flex-1 flex-col rounded-xl border border-[#e4eaf6] bg-[#fbfcff] p-3">
                <div className="grid grid-cols-2 gap-3 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#7a8ca8]">
                  <span>Finding</span>
                  <span>Recommendation</span>
                </div>
                <div className="mt-2 flex-1 space-y-3 text-xs text-[#334f7a]">
                  <div className="grid grid-cols-2 gap-3">
                    <p>Some critical systems are missing regular vulnerability scans.</p>
                    <p>Schedule automated scans and review results monthly.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <p>Access reviews are not documented consistently.</p>
                    <p>Implement quarterly access reviews and keep evidence.</p>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-6 sm:px-6 md:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-[#d4e4de] bg-[#eef7f2] p-5 transition-shadow duration-300 motion-safe:animate-fade-in-up motion-safe:hover:shadow-md sm:p-6">
          <div className="pointer-events-none absolute -right-10 top-1/2 hidden h-44 w-44 -translate-y-1/2 rounded-full bg-[#d8f0e4] md:block" />
          <div className="relative">
            <div className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#dff2e7] text-[#2ea96b]">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
                  <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" stroke="currentColor" strokeWidth="1.8" />
                  <path d="m9.2 12.2 2 2 3.8-4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <div>
                <h3 className="text-3xl font-semibold text-[#1e3a4b]">Your Data Is Safe With Us</h3>
                <p className="mt-1 text-sm text-[#5f7982]">We built Checklist KB with security and privacy by design.</p>
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <article className="rounded-2xl border border-[#d6e7e0] bg-white/80 p-4">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#edf7f0] text-[#2f5a4a]">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                    <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                </span>
                <p className="mt-2 text-lg font-semibold text-[#1f355d]">MFA Protection</p>
                <p className="mt-1 text-sm text-[#5f7982]">Secure login with multi-factor authentication.</p>
              </article>
              <article className="rounded-2xl border border-[#d6e7e0] bg-white/80 p-4">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#edf7f0] text-[#2f5a4a]">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                    <path d="M7 10V8a5 5 0 0 1 10 0v2M6 10h12v10H6z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
                <p className="mt-2 text-lg font-semibold text-[#1f355d]">Encrypted Storage</p>
                <p className="mt-1 text-sm text-[#5f7982]">All files are encrypted in transit and at rest.</p>
              </article>
              <article className="rounded-2xl border border-[#d6e7e0] bg-white/80 p-4">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#edf7f0] text-[#2f5a4a]">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M12 8v4l2.5 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
                <p className="mt-2 text-lg font-semibold text-[#1f355d]">Automatic Deletion</p>
                <p className="mt-1 text-sm text-[#5f7982]">Your data is deleted automatically after 48 hours.</p>
              </article>
              <article className="rounded-2xl border border-[#d6e7e0] bg-white/80 p-4">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#edf7f0] text-[#2f5a4a]">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                    <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" stroke="currentColor" strokeWidth="1.8" />
                    <path d="m9.4 12.2 1.8 1.8 3.6-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <p className="mt-2 text-lg font-semibold text-[#1f355d]">Private by Default</p>
                <p className="mt-1 text-sm text-[#5f7982]">Your data stays private and always will.</p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-12 sm:px-6 md:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-[#204f9a] bg-gradient-to-r from-[#0f3f93] via-[#0f4cb1] to-[#1c63d5] px-6 py-6 text-white shadow-[0_18px_34px_rgba(17,62,148,0.28)] transition-shadow duration-300 motion-safe:animate-fade-in-up motion-safe:hover:shadow-[0_22px_38px_rgba(17,62,148,0.32)] sm:px-8">
          <div className="pointer-events-none absolute -right-8 -top-12 hidden h-32 w-32 rounded-full border border-white/20 md:block" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-4xl font-semibold">Ready to See the Value for Yourself?</h3>
              <p className="mt-2 text-base text-[#d7e6ff]">Start your assessment in minutes. No credit card required for the demo.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/products"
                className="rounded-xl border border-white/70 bg-white px-6 py-3 font-semibold text-[#13449f] transition-colors duration-200 hover:bg-[#edf4ff] active:scale-[0.98] motion-safe:active:transition-transform"
              >
                Try the Demo
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-[#9ac0ff] bg-[#2e79ff] px-6 py-3 font-semibold text-white transition-colors duration-200 hover:bg-[#3b86ff] active:scale-[0.98] motion-safe:active:transition-transform"
              >
                Get Access
              </Link>
            </div>
          </div>
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
