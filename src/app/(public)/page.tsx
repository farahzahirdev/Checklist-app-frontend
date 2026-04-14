import Link from 'next/link';
import heroBackground from '@/assets/Lq6brmg8jRUNyRnyv5SBxe.jpg';
import { PublicFooter } from '@/components/public-footer';

const highlights = [
  { title: 'Audit Ready', body: 'Know where you stand.' },
  { title: 'Save Time', body: 'Focus on what matters.' },
  { title: 'Secure & Private', body: 'Your data stays protected.' },
];

const checklistBullets = [
  'Know your readiness before the audit',
  'Get clear and actionable results',
  'Prove compliance with confidence',
];

const docsBullets = [
  'Policies, procedures, and templates',
  'Aligned with NIS2, ISO 27001 and more',
  'Save time and reduce the effort',
];

function ArrowRightIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" aria-hidden="true">
      <path d="M4 10h10m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckCircleIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="8" fill="currentColor" />
      <path d="m7 10.3 2 2 4-4.3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function HomePage() {
  const heroStyle = {
    backgroundImage: `linear-gradient(rgba(4, 9, 22, 0.58), rgba(4, 9, 22, 0.74)), url(${heroBackground.src})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  } as const;

  return (
    <main className="overflow-x-hidden bg-[#f3f5fb]">
      <section style={heroStyle}>
        <div className="mx-auto grid min-h-[560px] w-full max-w-[1440px] items-center gap-10 px-4 py-10 text-white sm:px-6 sm:py-12 md:gap-12 md:px-6 md:py-16 lg:grid-cols-2 lg:gap-14">
          <div className="space-y-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#5ea2ff]">Cybersecurity Simplified</p>
            <h1 className="max-w-xl text-4xl font-semibold leading-[1.02] sm:text-5xl md:text-6xl">
              Be ready.
              <br />
              Stay confident.
            </h1>
            <p className="max-w-xl text-lg leading-7 text-[#d4e2f6] sm:text-xl sm:leading-8">
              Practical tools that help you prepare for audits, close gaps, and prove security with confidence.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/resources"
                className="inline-flex items-center gap-2 rounded-xl border border-[#1f7bff] bg-[#1f7bff] px-6 py-3 text-base font-semibold text-white hover:bg-[#2e87ff]"
              >
                Explore Products
                <ArrowRightIcon />
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl border border-[#365a92] bg-[#0d1d3a]/75 px-6 py-3 text-base font-semibold text-[#e3eeff] hover:bg-[#1a2e56]"
              >
                See How It Works
                <ArrowRightIcon />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {highlights.map((item) => (
                <div key={item.title} className="flex items-start gap-2 rounded-xl border border-[#335687]/75 bg-[#0a1a38]/72 p-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#3a7ce2] text-[#4e90f6]">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
                      <path d="M12 3 5 6v5.2c0 4.4 2.8 8 7 9.8 4.2-1.8 7-5.4 7-9.8V6l-7-3Z" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#dce9ff]">{item.title}</p>
                    <p className="mt-1 text-xs text-[#98abc7]">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-2xl border border-[#325a99]/80 bg-[#edf1f9] text-[#152948] shadow-[0_24px_70px_rgba(0,0,0,0.55)]">
              <div className="grid md:grid-cols-[180px_1fr]">
                <aside className="h-full bg-[#0b1a39] p-3 text-[#dce8ff]">
                  <p className="mb-3 text-sm font-semibold">Checklist KB</p>
                  <ul className="space-y-2 text-xs">
                    <li className="rounded-md bg-[#17376d] px-2 py-1.5">Dashboard</li>
                    <li className="rounded-md px-2 py-1.5 text-[#a0b4d5]">Checklists</li>
                    <li className="rounded-md px-2 py-1.5 text-[#a0b4d5]">Reports</li>
                    <li className="rounded-md px-2 py-1.5 text-[#a0b4d5]">Settings</li>
                  </ul>
                </aside>
                <div className="p-4">
                  <div className="mb-3 rounded-xl bg-white p-3">
                    <p className="text-sm font-semibold text-[#1a2c4f]">Dashboard</p>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div>
                        <p className="text-[11px] text-[#6f7f98]">Overall Readiness</p>
                        <p className="text-2xl font-bold text-[#173a73] sm:text-[26px] xl:text-3xl">72%</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-[#6f7f98]">Confined</p>
                        <p className="text-2xl font-bold text-[#173a73] sm:text-[26px] xl:text-3xl">18/25</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-[#6f7f98]">Open Findings</p>
                        <p className="text-2xl font-bold text-[#173a73] sm:text-[26px] xl:text-3xl">7</p>
                      </div>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-[#d6e2f7]">
                      <div className="h-full w-[72%] rounded-full bg-[#2e82ff]" />
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="rounded-xl bg-white p-3">
                      <p className="text-xs font-semibold text-[#263d62]">Recent Activity</p>
                      <ul className="mt-2 space-y-2 text-[11px] text-[#4f668a]">
                        <li>Audit Readiness Checklist</li>
                        <li>Documentation Package</li>
                        <li>RTSO Op Analysis</li>
                      </ul>
                    </div>
                    <div className="rounded-xl bg-white p-3">
                      <p className="text-xs font-semibold text-[#263d62]">Top Domains</p>
                      <div className="mt-2">
                        <svg viewBox="0 0 220 150" className="h-24 w-full" fill="none" aria-hidden="true">
                          <g stroke="#e1e9f7" strokeWidth="1">
                            <polygon points="110,22 152,44 152,92 110,114 68,92 68,44" />
                            <polygon points="110,40 137,54 137,82 110,96 83,82 83,54" />
                            <line x1="110" y1="68" x2="110" y2="22" />
                            <line x1="110" y1="68" x2="152" y2="44" />
                            <line x1="110" y1="68" x2="152" y2="92" />
                            <line x1="110" y1="68" x2="110" y2="114" />
                            <line x1="110" y1="68" x2="68" y2="92" />
                            <line x1="110" y1="68" x2="68" y2="44" />
                          </g>
                          <polygon points="110,32 145,48 147,90 110,108 75,88 81,50" fill="#96b8f3" fillOpacity="0.35" stroke="#5e97ed" strokeWidth="1.8" />
                          <text x="110" y="14" textAnchor="middle" className="fill-[#6f7f98] text-[8px]">Governance</text>
                          <text x="165" y="47" className="fill-[#6f7f98] text-[8px]">Risk</text>
                          <text x="164" y="57" className="fill-[#6f7f98] text-[8px]">Management</text>
                          <text x="160" y="94" className="fill-[#6f7f98] text-[8px]">Access</text>
                          <text x="160" y="104" className="fill-[#6f7f98] text-[8px]">Control</text>
                          <text x="53" y="58" textAnchor="end" className="fill-[#6f7f98] text-[8px]">Asset</text>
                          <text x="53" y="68" textAnchor="end" className="fill-[#6f7f98] text-[8px]">Management</text>
                          <text x="58" y="95" textAnchor="end" className="fill-[#6f7f98] text-[8px]">Incident</text>
                          <text x="58" y="105" textAnchor="end" className="fill-[#6f7f98] text-[8px]">Management</text>
                        </svg>
                        <div className="mt-1 flex items-center justify-center gap-4 text-[10px] font-medium text-[#6f7f98]">
                          <span className="inline-flex items-center gap-1">
                            <span className="h-2 w-2 rounded-[2px] bg-[#2f7dff]" />
                            Current
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <span className="h-2 w-2 rounded-[2px] bg-[#98dbc0]" />
                            Target
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 sm:py-14 md:px-6 md:py-20">
        <h2 className="text-3xl font-semibold tracking-tight text-[#202743] sm:text-4xl md:text-5xl">Choose the Right Solution</h2>
        <p className="mt-3 text-base text-[#6f7893] md:text-lg">Each product is designed to make cybersecurity inconveniences easier.</p>
        <div className="mt-8 grid gap-6 sm:mt-10 md:mt-12 md:grid-cols-2 md:gap-8 lg:gap-10">
          <article className="rounded-2xl border border-[#d7deeb] bg-white p-6 text-[#1d2540] shadow-sm sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-start justify-between gap-4 xl:flex-nowrap">
              <div className="flex min-w-0 items-center gap-3">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf1ff] text-[#2e7cff]">
                  <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden="true">
                    <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" stroke="currentColor" strokeWidth="1.8" />
                    <path d="m9.4 12.2 1.8 1.8 3.6-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <h3 className="leading-tight">
                  <span className="block whitespace-nowrap text-2xl font-semibold sm:text-3xl lg:text-[34px] xl:text-[40px]">Audit Readiness</span>
                  <span className="block text-2xl font-normal sm:text-3xl lg:text-[34px] xl:text-[40px]">Checklist</span>
                </h3>
              </div>
              <span className="whitespace-nowrap rounded-xl bg-[#d5f4df] px-3 py-1 text-sm font-semibold text-[#2a8a49]">Available Now</span>
            </div>
            <p className="mt-6 text-base leading-7 text-[#56617f] md:text-[18px]">
              Prepare for audits with a guided checklist, identify, gaps, upload evidence, and get a reviewed report.
            </p>
            <ul className="mt-6 space-y-3 text-base text-[#3a4a6d] md:text-[18px]">
              {checklistBullets.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-[#2f7dff]" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/resources" className="mt-6 inline-flex items-center gap-2 text-lg font-semibold text-[#2f7dff] hover:text-[#2568d6]">
              View Product
              <ArrowRightIcon />
            </Link>
          </article>

          <article className="rounded-2xl border border-[#d7deeb] bg-white p-6 text-[#1d2540] shadow-sm sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-start justify-between gap-4 xl:flex-nowrap">
              <div className="flex min-w-0 items-center gap-3">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf1ff] text-[#2e7cff]">
                  <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden="true">
                    <path d="M8 3h6l5 5v13H8z" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M11 13h5M11 17h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
                <h3 className="leading-tight">
                  <span className="block text-2xl font-semibold sm:text-3xl lg:text-[34px] xl:text-[40px]">Documentation</span>
                  <span className="block text-2xl font-normal sm:text-3xl lg:text-[34px] xl:text-[40px]">Packages</span>
                </h3>
              </div>
              <span className="whitespace-nowrap rounded-xl bg-[#e3e8ff] px-3 py-1 text-sm font-semibold text-[#5f72d6]">Coming Soon</span>
            </div>
            <p className="mt-6 text-base leading-7 text-[#56617f] md:text-[18px]">
              Get audit-ready faster with professional documentation tailored to your framework.
            </p>
            <ul className="mt-6 space-y-3 text-base text-[#3a4a6d] md:text-[18px]">
              {docsBullets.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-[#2f7dff]" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/resources" className="mt-6 inline-flex items-center gap-2 text-lg font-semibold text-[#2f7dff] hover:text-[#2568d6]">
              Learn More
              <ArrowRightIcon />
            </Link>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-14 sm:px-6 md:px-6 md:pb-20">
        <div className="relative rounded-2xl border border-[#d9dfeb] bg-[#f7f9ff] p-6 sm:p-8 lg:p-12">
          <h3 className="text-center text-2xl font-semibold text-[#202743] sm:text-3xl md:text-5xl">From Uncertainty to Audit-Ready in 3 Steps</h3>
          <p className="mt-2 text-center text-base text-[#6f7893] md:text-lg">A simple process that gives you clarity and control.</p>

          <div className="relative mt-8 grid gap-8 overflow-x-hidden sm:mt-10 md:mt-12 md:grid-cols-3 md:gap-10">
            <article className="space-y-4">
              <div className="relative flex items-center gap-3">
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e6edff] text-[#2f7dff]">
                  <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden="true">
                    <rect x="6" y="4" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M9 9h6M9 13h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#2f7dff] text-lg font-semibold text-white">1</span>
                <span className="absolute left-[118px] right-[-18px] top-1/2 hidden -translate-y-1/2 border-t-2 border-dashed border-[#9eb6e8] md:block" />
                <svg
                  viewBox="0 0 14 14"
                  className="absolute right-[-18px] top-1/2 hidden h-4 w-4 -translate-y-1/2 text-[#9eb6e8] md:block"
                  fill="none"
                  aria-hidden="true"
                >
                  <path d="M2 2 11 7 2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-[#1f2741] sm:text-2xl md:text-3xl lg:text-4xl">Choose a Product</h4>
              <p className="text-base text-[#576486] md:text-lg">Pick the solution that fits your needs.</p>
            </article>

            <article className="space-y-4">
              <div className="relative flex items-center gap-3">
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e6edff] text-[#2f7dff]">
                  <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden="true">
                    <path d="M8 3h6l5 5v13H8z" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M11 13h5M11 17h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#2f7dff] text-lg font-semibold text-white">2</span>
                <span className="absolute left-[118px] right-[-18px] top-1/2 hidden -translate-y-1/2 border-t-2 border-dashed border-[#9eb6e8] md:block" />
                <svg
                  viewBox="0 0 14 14"
                  className="absolute right-[-18px] top-1/2 hidden h-4 w-4 -translate-y-1/2 text-[#9eb6e8] md:block"
                  fill="none"
                  aria-hidden="true"
                >
                  <path d="M2 2 11 7 2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-[#1f2741] sm:text-2xl md:text-3xl lg:text-4xl">Assess & Improve</h4>
              <ul className="space-y-1 text-base text-[#576486] md:text-lg">
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-[#2f7dff]" />
                  Answer guided questions, identify gaps.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-[#2f7dff]" />
                  Aligned with NIS2, ISO 27001 and more
                </li>
              </ul>
            </article>

            <article className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e6edff] text-[#2f7dff]">
                  <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden="true">
                    <path d="M6.5 3.5h7l4 4V20h-11z" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M13.5 3.5v4h4" stroke="currentColor" strokeWidth="1.8" />
                    <circle cx="17.1" cy="17.1" r="3.8" fill="#34c979" stroke="#ffffff" strokeWidth="1.2" />
                    <path d="m15.4 17.2 1.2 1.2 2.3-2.4" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#2f7dff] text-lg font-semibold text-white">3</span>
              </div>
              <h4 className="text-xl font-semibold text-[#1f2741] sm:text-2xl md:text-3xl lg:text-4xl">Get Results</h4>
              <ul className="space-y-1 text-base text-[#576486] md:text-lg">
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-[#2f7dff]" />
                  Receive a clear report
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-[#2f7dff]" />
                  and know your next steps.
                </li>
              </ul>
            </article>
          </div>
        </div>

        <div className="mt-10 md:mt-12">
          <h3 className="text-2xl font-semibold text-[#202743] sm:text-3xl md:text-5xl">Built by professionals with real audit and cybersecurity experience</h3>
          <p className="mt-3 max-w-5xl text-base text-[#6f7893] md:text-lg">
            Expertise designed based on years of hands-on cybersecurity and audit knowledge. Trusted by organizations to improve their security and simplify compliance.
          </p>
          <Link href="/about-us" className="mt-4 inline-flex items-center gap-2 text-lg font-semibold text-[#2f7dff] hover:text-[#2568d6]">
            Learn more about us
            <ArrowRightIcon />
          </Link>
        </div>

        <div className="mt-10 rounded-2xl border border-[#264579] bg-[linear-gradient(120deg,#091229,#0b1a39_48%,#0e2348)] px-5 py-6 text-white sm:px-8 md:mt-12 md:px-10 md:py-7">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-[#3a7ce2] bg-[#102a57] text-[#77aefc]">
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden="true">
                  <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              </span>
              <div>
                <p className="text-2xl font-semibold md:text-4xl">Ready to get started?</p>
                <p className="text-sm text-[#c7d8f8] md:text-base">Explore our process and take the first step to audit readiness.</p>
              </div>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#1f7bff] bg-[#1f7bff] px-6 py-3 text-base font-semibold hover:bg-[#2e87ff] md:px-8 md:text-lg">
                Get Access
                <ArrowRightIcon />
              </Link>
              <Link href="/resources" className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#456298] px-6 py-3 text-base font-semibold text-[#e5eeff] hover:bg-[#173160] md:px-8 md:text-lg">
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
