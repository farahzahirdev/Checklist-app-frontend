import Link from 'next/link';
import { PublicFooter } from '@/components/public-footer';
import heroBackground from '@/assets/cybersecurity-background-59ognpsy7izka4l9.png';

const steps = [
  {
    title: 'Choose a checklist',
    body: 'Pick the compliance framework or checklist that matches your needs.',
  },
  {
    title: 'Answer guided questions',
    body: 'We break down requirements into clear, structured questions so you always know what to do.',
  },
  {
    title: 'Upload evidence (optional)',
    body: 'Attach documents, screenshots, or files that support your answers.',
  },
  {
    title: 'Get your report',
    body: 'Download a reviewed report with your maturity score, insights, and recommendations.',
  },
  {
    title: 'Your data is deleted',
    body: 'Assessment-related data follows the retention window and deletion policy.',
  },
];

export default function HowItWorksPage() {
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
        <div className="relative mx-auto grid min-h-[560px] max-w-[1440px] items-center gap-8 px-4 py-14 sm:px-6 md:px-6 md:py-20 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6da7ff] motion-safe:animate-fade-in motion-safe:delay-75">How It Works</p>
            <h1 className="mt-3 text-5xl font-semibold leading-tight text-white motion-safe:animate-fade-in-up motion-safe:delay-100 sm:text-6xl">Simple steps. Powerful results.</h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-[#c7d8f8] motion-safe:animate-fade-in-up motion-safe:delay-200">
              Checklist KB guides you through a proven process to assess your security posture, find gaps, and get
              audit-ready - faster.
            </p>
            <div className="mt-7 flex flex-wrap gap-3 motion-safe:animate-fade-in-up motion-safe:delay-300">
              <Link
                href="/register"
                className="rounded-xl border border-[#1f7bff] bg-[#1f7bff] px-6 py-3 font-semibold text-white transition-colors duration-200 hover:bg-[#2e87ff] active:scale-[0.98] motion-safe:active:transition-transform"
              >
                Get Access
              </Link>
              <Link
                href="/products"
                className="rounded-xl border border-[#375785] bg-[#0a2246] px-6 py-3 font-semibold text-[#dbe8ff] transition-colors duration-200 hover:bg-[#123162] active:scale-[0.98] motion-safe:active:transition-transform"
              >
                View Products
              </Link>
            </div>
          </div>

          <div className="relative motion-safe:animate-fade-in-right motion-safe:delay-200">
            <div className="overflow-hidden rounded-2xl border border-[#2f4f86] bg-[#f8fbff] shadow-[0_20px_50px_rgba(0,0,0,0.45)] transition-shadow duration-500 ease-out motion-safe:hover:shadow-[0_24px_60px_rgba(0,0,0,0.42)]">
              <div className="grid md:grid-cols-[160px_1fr]">
                <aside className="min-h-[340px] bg-[#091d3f] p-3 text-[#d7e6ff]">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em]">Checklist KB</p>
                  <ul className="space-y-2 text-xs">
                    <li className="rounded-md bg-[#163f7d] px-2 py-1.5">Dashboard</li>
                    <li className="rounded-md px-2 py-1.5 text-[#a8bedf]">Checklist</li>
                    <li className="rounded-md px-2 py-1.5 text-[#a8bedf]">Evidence</li>
                    <li className="rounded-md px-2 py-1.5 text-[#a8bedf]">Reports</li>
                  </ul>
                </aside>
                <div className="min-h-[340px] p-4 text-[#1f3253]">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#4e6c96]">1.1 Information Security Policies</p>
                  <h3 className="mt-2 text-sm font-semibold sm:text-base">Does your organization have documented information security policies?</h3>
                  <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_140px]">
                    <div className="rounded-lg border border-[#e2e8f4] bg-white p-3">
                      <p className="text-xs text-[#5c7397]">Answers</p>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        <span className="rounded-md border border-[#d7e2f7] bg-[#f7fbff] px-2 py-1">Yes</span>
                        <span className="rounded-md border border-[#d7e2f7] bg-[#f7fbff] px-2 py-1">Partly</span>
                        <span className="rounded-md border border-[#d7e2f7] bg-[#f7fbff] px-2 py-1">No</span>
                        <span className="rounded-md border border-[#d7e2f7] bg-[#f7fbff] px-2 py-1">Not sure</span>
                      </div>
                    </div>
                    <div className="rounded-lg border border-[#e2e8f4] bg-white p-3 text-xs">
                      <p className="font-semibold text-[#4d6388]">Progress</p>
                      <p className="mt-1 text-xl font-bold text-[#1f355d]">42%</p>
                      <div className="mt-2 h-1.5 rounded-full bg-[#d8e4f7]">
                        <div className="h-full w-[42%] rounded-full bg-[#2f7dff]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute -right-6 -bottom-10 z-40 hidden w-72 rounded-2xl border border-[#d7e2f5] bg-white px-4 py-3 shadow-[0_16px_35px_rgba(67,95,145,0.22)] sm:block md:-bottom-12 lg:-bottom-14 xl:-bottom-16">
              <p className="text-[30px] font-semibold leading-none text-[#253d63]">Maturity Overview</p>
              <div className="relative mt-2 h-44">
                <svg viewBox="0 0 320 210" className="h-full w-full" fill="none" aria-hidden="true">
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
                  <text x="255" y="74" textAnchor="start" className="fill-[#6f7f98] text-[10px]">Risk Mgmt.</text>
                  <text x="255" y="137" textAnchor="start" className="fill-[#6f7f98] text-[10px]">Asset Mgnce</text>
                  <text x="160" y="197" textAnchor="middle" className="fill-[#6f7f98] text-[10px]">Incident Mgmt.</text>
                  <text x="65" y="137" textAnchor="end" className="fill-[#6f7f98] text-[10px]">Operations</text>
                  <text x="65" y="74" textAnchor="end" className="fill-[#6f7f98] text-[10px]">Risk Mgt.</text>
                  <text x="56" y="106" textAnchor="end" className="fill-[#6f7f98] text-[10px]">Physical</text>
                  <text x="56" y="118" textAnchor="end" className="fill-[#6f7f98] text-[10px]">Security</text>
                  <text x="245" y="170" textAnchor="middle" className="fill-[#6f7f98] text-[10px]">Access Control</text>
                </svg>
              </div>
              <div className="mt-1 flex items-center justify-center gap-4 text-[11px] font-medium text-[#6f7f98]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-[2px] bg-[#2f7dff]" />
                  Current
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-[2px] bg-[#98dbc0]" />
                  Target
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 md:px-6 md:py-14">
        <div className="rounded-2xl border border-[#d7deeb] bg-[#eef2f8] p-5 transition-shadow duration-300 motion-safe:animate-fade-in-up motion-safe:hover:shadow-md md:p-7">
          <h2 className="text-center text-3xl font-semibold text-[#1a2440] sm:text-4xl">The 5-Step Process</h2>
          <p className="mt-2 text-center text-lg text-[#5e7293]">Designed to be clear, guided, and efficient.</p>

          <ol className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {steps.map((step, index) => (
              <li key={step.title} className="relative rounded-xl border border-[#dde5f2] bg-white p-4 text-[#2a3c5f] transition-shadow duration-300 ease-out motion-safe:transition-transform motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-md">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#eef3ff] text-[#2f7dff]">
                  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden="true">
                    <path
                      d={
                        index === 0
                          ? 'M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z'
                          : index === 1
                            ? 'M4 5h16v10H8l-4 4V5Zm5 3h6M9 11h4'
                            : index === 2
                              ? 'M12 3v12m0 0-4-4m4 4 4-4M5 17h14'
                              : index === 3
                                ? 'M7 3h8l4 4v14H7zM15 3v4h4M10 13h6M10 17h6'
                                : 'M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z'
                      }
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="mt-3 text-sm font-semibold text-[#1f7bff]">{index + 1}</p>
                <h3 className="mt-1 text-base font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-[#5e7293]">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>

        <article className="mt-5 rounded-2xl border border-[#d7deeb] bg-[#eef2f8] p-5 transition-shadow duration-300 motion-safe:animate-fade-in-up motion-safe:hover:shadow-md md:p-7">
          <h2 className="text-center text-3xl font-semibold text-[#1a2440] sm:text-4xl">A Closer Look at Each Step</h2>
          <p className="mt-2 text-center text-base text-[#5e7293]">Here&apos;s what happens behind the scenes.</p>
          <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <article className="flex h-full flex-col transition-transform duration-300 motion-safe:hover:-translate-y-0.5">
              <div className="h-[165px] rounded-xl border border-[#dde5f2] bg-white p-3">
                <p className="text-[11px] font-semibold text-[#506382]">Select a Checklist</p>
                <div className="mt-2 space-y-1 text-[10px] text-[#4f6282]">
                  <div className="rounded border border-[#e4ebf8] bg-[#f8fbff] px-2 py-1">Information Security</div>
                  <div className="rounded border border-[#e4ebf8] bg-[#f8fbff] px-2 py-1">GDPR Readiness</div>
                  <div className="rounded border border-[#e4ebf8] bg-[#f8fbff] px-2 py-1">ISO 27001</div>
                  <div className="rounded border border-[#e4ebf8] bg-[#f8fbff] px-2 py-1">NIS2 Compliance</div>
                </div>
              </div>
              <h3 className="mt-3 min-h-[36px] text-[31px] font-semibold leading-none text-[#1f355d]">1. Choose</h3>
              <p className="mt-1 min-h-[78px] text-sm text-[#5e7293]">Select from expert-built checklists based on real regulations and standards.</p>
            </article>
            <article className="flex h-full flex-col transition-transform duration-300 motion-safe:hover:-translate-y-0.5">
              <div className="h-[165px] rounded-xl border border-[#dde5f2] bg-white p-3">
                <p className="text-[11px] font-semibold text-[#506382]">Question 1.2</p>
                <p className="mt-2 text-[10px] font-medium text-[#1f355d]">Do you have a documented information security policy?</p>
                <div className="mt-2 grid grid-cols-4 gap-1 text-[9px]">
                  <span className="rounded border border-[#d7e2f7] bg-[#2f7dff] px-1.5 py-1 text-white">Yes</span>
                  <span className="rounded border border-[#d7e2f7] bg-[#f7fbff] px-1.5 py-1 text-black">Partly</span>
                  <span className="rounded border border-[#d7e2f7] bg-[#f7fbff] px-1.5 py-1 text-black">No</span>
                  <span className="rounded border border-[#d7e2f7] bg-[#f7fbff] px-1.5 py-1 text-black">Not sure</span>
                </div>
              </div>
              <h3 className="mt-3 min-h-[36px] text-[31px] font-semibold leading-none text-[#1f355d]">2. Answer</h3>
              <p className="mt-1 min-h-[78px] text-sm text-[#5e7293]">Answer guided questions with helpful explanations and real-world examples.</p>
            </article>
            <article className="flex h-full flex-col transition-transform duration-300 motion-safe:hover:-translate-y-0.5">
              <div className="h-[165px] rounded-xl border border-[#dde5f2] bg-white p-3">
                <p className="text-[11px] font-semibold text-[#506382]">Upload Evidence</p>
                <div className="mt-2 rounded border border-[#dbe5f7] bg-[#f7fbff] py-2 text-center text-[10px] text-[#4f6282]">
                  Drag &amp; drop files here
                </div>
                <div className="mt-2 rounded border border-[#e4ebf8] bg-white px-2 py-1 text-[10px] text-[#4f6282]">policy_v1.2.pdf</div>
              </div>
              <h3 className="mt-3 min-h-[36px] text-[31px] font-semibold leading-none text-[#1f355d]">3. Upload</h3>
              <p className="mt-1 min-h-[78px] text-sm text-[#5e7293]">Provide evidence when you have it. It&apos;s optional but helps strengthen your results.</p>
            </article>
            <article className="flex h-full flex-col transition-transform duration-300 motion-safe:hover:-translate-y-0.5">
              <div className="h-[165px] rounded-xl border border-[#dde5f2] bg-white p-3">
                <p className="text-[11px] font-semibold text-[#506382]">Reports</p>
                <div className="mt-2 flex items-center gap-2 text-[9px]">
                  <span className="rounded-full bg-[#2f7dff] px-2 py-0.5 font-semibold text-white">Overview</span>
                  <span className="rounded-full bg-[#eef3ff] px-2 py-0.5 text-[#5c7397]">Sections</span>
                  <span className="rounded-full bg-[#eef3ff] px-2 py-0.5 text-[#5c7397]">Answers</span>
                </div>
                <p className="mt-2 text-[10px] text-[#5c7397]">Maturity Score</p>
                <p className="text-[30px] font-bold leading-none text-[#1f355d]">62%</p>
                <div className="mt-2 h-1.5 rounded-full bg-[#d8e4f7]">
                  <div className="h-full w-[62%] rounded-full bg-[#2f7dff]" />
                </div>
              </div>
              <h3 className="mt-3 min-h-[36px] text-[31px] font-semibold leading-none text-[#1f355d]">4. Report</h3>
              <p className="mt-1 min-h-[78px] text-sm text-[#5e7293]">Get a clear report with your score, gap analysis, and prioritized recommendations.</p>
            </article>
            <article className="flex h-full flex-col transition-transform duration-300 motion-safe:hover:-translate-y-0.5">
              <div className="h-[165px] rounded-xl border border-[#dceee1] bg-[#e7f8eb] p-3 text-center">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#35c283] text-white">✓</span>
                <p className="mt-2 text-xs font-semibold text-[#2b5e49]">All data deleted</p>
                <p className="mt-1 text-[10px] text-[#4f6f61]">Your data has been securely deleted.</p>
              </div>
              <h3 className="mt-3 min-h-[36px] text-[31px] font-semibold leading-none text-[#1f355d]">5. Delete</h3>
              <p className="mt-1 min-h-[78px] text-sm text-[#5e7293]">We automatically delete your data within 48 hours. No long-term storage.</p>
            </article>
          </div>
        </article>

        <article className="mt-5 rounded-2xl border border-[#d7e7de] bg-[#edf7f0] p-5 transition-shadow duration-300 motion-safe:animate-fade-in-up motion-safe:hover:shadow-md md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <h3 className="text-3xl font-semibold text-[#1f3a31]">Secure by Design</h3>
              <p className="mt-2 text-base text-[#466357]">Your security and privacy are our top priorities.</p>
            </div>
            <span className="inline-flex h-28 w-28 items-center justify-center rounded-full bg-[#d9efe0] text-[#35a26f]">
              <svg viewBox="0 0 24 24" className="h-12 w-12" fill="none" aria-hidden="true">
                <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" stroke="currentColor" strokeWidth="1.8" />
                <path d="m9.4 12.2 1.8 1.8 3.6-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <div className="rounded-xl border border-[#d2e6da] bg-white/70 p-4 transition-shadow duration-300 motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#edf7f0] text-[#2f5a4a]">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              </span>
              <p className="mt-2 font-semibold text-[#254a3b]">MFA Protection</p>
              <p className="mt-1 text-sm text-[#4f6f61]">Secure login with multi-factor authentication.</p>
            </div>
            <div className="rounded-xl border border-[#d2e6da] bg-white/70 p-4 transition-shadow duration-300 motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#edf7f0] text-[#2f5a4a]">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path d="M7 10V8a5 5 0 0 1 10 0v2M6 10h12v10H6z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </span>
              <p className="mt-2 font-semibold text-[#254a3b]">Encrypted Storage</p>
              <p className="mt-1 text-sm text-[#4f6f61]">All files are encrypted in transit and at rest.</p>
            </div>
            <div className="rounded-xl border border-[#d2e6da] bg-white/70 p-4 transition-shadow duration-300 motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#edf7f0] text-[#2f5a4a]">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M12 8v4l2.5 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </span>
              <p className="mt-2 font-semibold text-[#254a3b]">Automatic Deletion</p>
              <p className="mt-1 text-sm text-[#4f6f61]">Your data is deleted automatically after 48 hours.</p>
            </div>
            <div className="rounded-xl border border-[#d2e6da] bg-white/70 p-4 transition-shadow duration-300 motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#edf7f0] text-[#2f5a4a]">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" stroke="currentColor" strokeWidth="1.8" />
                  <path d="m9.4 12.2 1.8 1.8 3.6-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <p className="mt-2 font-semibold text-[#254a3b]">Private by Default</p>
              <p className="mt-1 text-sm text-[#4f6f61]">Your data stays private - and always will.</p>
            </div>
          </div>
        </article>

        <article className="mt-5 rounded-2xl border border-[#17489b] bg-[linear-gradient(90deg,#0b2f73,#0e3f9d)] p-5 text-white transition-shadow duration-300 motion-safe:animate-fade-in-up motion-safe:hover:shadow-[0_18px_34px_rgba(17,62,148,0.28)] md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-3xl font-semibold">Ready to get audit-ready?</h3>
              <p className="mt-1 text-sm text-[#d2e2ff]">Start your assessment in minutes.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/products" className="rounded-xl border border-white/35 bg-white px-5 py-2.5 font-semibold text-[#123e8b] transition-colors duration-200 hover:bg-[#e9f1ff] active:scale-[0.98] motion-safe:active:transition-transform">
                Try the Demo
              </Link>
              <Link href="/register" className="rounded-xl border border-[#1f7bff] bg-[#1f7bff] px-5 py-2.5 font-semibold text-white transition-colors duration-200 hover:bg-[#2e87ff] active:scale-[0.98] motion-safe:active:transition-transform">
                Get Access
              </Link>
            </div>
          </div>
        </article>
      </section>
      <PublicFooter />
    </main>
  );
}
