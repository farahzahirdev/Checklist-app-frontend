import Link from 'next/link';
import heroBackground from '@/assets/cybersecurity-background-59ognpsy7izka4l9.png';
import { PublicFooter } from '@/components/public-footer';

function ArrowRightIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" aria-hidden="true">
      <path d="M4 10h10m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AboutUsPage() {
  const heroStyle = {
    backgroundImage: `linear-gradient(rgba(4, 9, 22, 0.56), rgba(4, 9, 22, 0.72)), url(${heroBackground.src})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  } as const;

  return (
    <main className="overflow-x-hidden bg-[#f3f5fb]">
      <section style={heroStyle}>
        <div className="mx-auto grid min-h-[560px] w-full max-w-[1440px] items-center gap-10 px-4 py-10 text-white sm:px-6 sm:py-12 md:gap-12 md:px-6 md:py-16 lg:grid-cols-2 lg:gap-14">
          <div className="space-y-7">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#5ea2ff] motion-safe:animate-fade-in motion-safe:delay-75">About Us</p>
            <h1 className="max-w-xl text-4xl font-semibold leading-[1.04] motion-safe:animate-fade-in-up motion-safe:delay-100 sm:text-5xl md:text-6xl">
              Built by
              <br />
              cybersecurity
              <br />
              <span className="text-[#2f7dff]">professionals.</span>
            </h1>
            <p className="max-w-xl text-lg leading-8 text-[#d4e2f6] motion-safe:animate-fade-in-up motion-safe:delay-200">
              We simplify audit preparation for today&apos;s cybersecurity challenges. Our mission is to give security and compliance teams clarity, structure, and confidence — without the complexity.
            </p>
          </div>

          <div className="relative motion-safe:animate-fade-in-right motion-safe:delay-150">
            <div className="overflow-hidden rounded-2xl border border-[#325a99]/80 bg-[#edf1f9] text-[#152948] shadow-[0_24px_70px_rgba(0,0,0,0.55)] transition-shadow duration-500 ease-out motion-safe:hover:shadow-[0_28px_80px_rgba(0,0,0,0.5)]">
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
                        <p className="text-[11px] text-[#6f7f98]">Completed</p>
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
                        <li>NIS2 Gap Analysis</li>
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
                          <text x="165" y="57" className="fill-[#6f7f98] text-[8px]">Management</text>
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

      <section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 md:px-6 md:py-12">
        <div className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-[#d7deeb] bg-white p-6 transition-shadow duration-300 ease-out motion-safe:animate-fade-in-up motion-safe:transition-transform motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-lg md:p-8">
            <div className="flex items-start gap-4">
              <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#2f7dff]">
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden="true">
                  <circle cx="8" cy="10" r="3" stroke="currentColor" strokeWidth="1.8" />
                  <circle cx="16.5" cy="8.5" r="2.5" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M4 19c0-2.6 2.1-4.7 4.7-4.7h1.1c2.6 0 4.7 2.1 4.7 4.7M13.3 18.5c.3-1.8 1.8-3.1 3.6-3.1h.9c1.3 0 2.4.6 3.1 1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </span>
              <div>
                <h3 className="text-2xl font-semibold text-[#1f2741] md:text-[40px]">Who We Are</h3>
                <p className="mt-2 text-base leading-8 text-[#55627e] md:text-[18px]">
                  We are cybersecurity professionals with hands-on experience in audits, compliance, and incident response. Over the years, we have worked with organizations across different industries, helping them strengthen their security and prepare for audits with confidence.
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-[#d7deeb] bg-white p-6 transition-shadow duration-300 ease-out motion-safe:animate-fade-in-up motion-safe:delay-100 motion-safe:transition-transform motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-lg md:p-8">
            <div className="flex items-start gap-4">
              <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#2f7dff]">
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden="true">
                  <circle cx="12" cy="11" r="6" stroke="currentColor" strokeWidth="1.8" />
                  <path d="m9.5 11.2 1.8 1.8 3.3-3.7M9 18.5l-1 2.5 4-1.3 4 1.3-1-2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <div>
                <h3 className="text-2xl font-semibold text-[#1f2741] md:text-[40px]">Our Experience</h3>
                <ul className="mt-3 space-y-2 text-base text-[#445675] md:text-[18px]">
                  <li className="flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#2f7dff] text-white">✓</span>
                    Cybersecurity and audit expertise
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#2f7dff] text-white">✓</span>
                    ISO 27001, NIS2 and other security frameworks
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#2f7dff] text-white">✓</span>
                    Security assessments and incident response
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#2f7dff] text-white">✓</span>
                    Real-world experience across multiple industries
                  </li>
                </ul>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-[#d7deeb] bg-white p-6 transition-shadow duration-300 ease-out motion-safe:animate-fade-in-up motion-safe:delay-200 motion-safe:transition-transform motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-lg md:p-8">
            <div className="flex items-start gap-4">
              <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#2f7dff]">
                <svg viewBox="0 0 90 90" className="h-8 w-8 text-[#2f7dff]" fill="none" aria-hidden="true">
                  <path d="M 60.453 29.767 c -4.971 -4.454 -11.394 -6.499 -18.088 -5.76 c -11.024 1.218 -19.632 10.146 -20.469 21.229 c -0.504 6.674 1.879 13.233 6.537 17.996 c 2.02 2.065 3.132 4.903 3.132 7.991 v 15.05 c 0 2.055 1.672 3.727 3.727 3.727 h 19.415 c 2.055 0 3.727 -1.672 3.727 -3.727 V 70.989 c 0 -2.91 1.117 -5.713 3.066 -7.688 c 4.303 -4.363 6.672 -10.141 6.672 -16.268 C 68.172 40.453 65.358 34.16 60.453 29.767 z M 56.434 72.224 v 3.963 h -3.417 c -0.553 0 -1 0.447 -1 1 s 0.447 1 1 1 h 3.417 v 3.963 H 33.566 v -3.963 H 47.59 c 0.553 0 1 -0.447 1 -1 s -0.447 -1 -1 -1 H 33.566 v -3.963 H 56.434 z M 54.707 88 H 35.292 c -0.952 0 -1.727 -0.774 -1.727 -1.727 v -2.124 h 22.868 v 2.124 C 56.434 87.226 55.659 88 54.707 88 z M 60.076 61.896 c -2.141 2.171 -3.424 5.173 -3.606 8.327 H 33.52 c -0.22 -3.224 -1.492 -6.176 -3.657 -8.39 c -4.256 -4.352 -6.433 -10.346 -5.973 -16.447 c 0.764 -10.124 8.626 -18.279 18.694 -19.392 c 0.82 -0.091 1.636 -0.136 2.445 -0.136 c 5.225 0 10.155 1.874 14.089 5.397 c 4.482 4.014 7.053 9.764 7.053 15.776 C 66.172 52.632 64.007 57.91 60.076 61.896 z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M 57.777 45.543 c -0.553 0 -1 -0.448 -1 -1 c 0 -3.345 -1.43 -6.543 -3.924 -8.776 c -2.527 -2.264 -5.792 -3.303 -9.199 -2.927" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M 45 18.487 V 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M 59.64 22.312 l 8.194 -14.193" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M 30.36 22.312 L 22.166 8.119" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M 70.589 32.897 l 13.964 -8.062" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M 19.183 32.765 l -13.735 -7.93" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </span>
              <div>
                <h3 className="text-2xl font-semibold text-[#1f2741] md:text-[40px]">Why This Product Exists</h3>
                <p className="mt-2 text-base leading-8 text-[#55627e] md:text-[18px]">
                  We saw that many organizations were not unprepared because of lack of effort, but because of unclear requirements, missing documentation, and the lack of a structured approach. Existing tools were either too complex or not focused on what really matters during an audit.
                </p>
                <p className="mt-4 text-base font-semibold text-[#303f60] md:text-[18px]">Checklist KB was created to change that.</p>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-[#d7deeb] bg-white p-6 transition-shadow duration-300 ease-out motion-safe:animate-fade-in-up motion-safe:delay-300 motion-safe:transition-transform motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-lg md:p-8">
            <div className="flex items-start gap-4">
              <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#2f7dff]">
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
                  <circle cx="12" cy="12" r="4.6" stroke="currentColor" strokeWidth="1.8" />
                  <circle cx="12" cy="12" r="1.3" fill="currentColor" />
                  <path d="m12 12 4.8-4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </span>
              <div>
                <h3 className="text-2xl font-semibold text-[#1f2741] md:text-[40px]">Our Approach</h3>
                <p className="mt-2 text-base leading-8 text-[#55627e] md:text-[18px]">
                  We believe audit preparation should be practical, clear, and evidence-based. That&apos;s why we built a solution that focuses on what really matters and guides you step by step.
                </p>
                <ul className="mt-3 space-y-2 text-base text-[#445675] md:text-[18px]">
                  <li className="flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#2f7dff] text-white">✓</span>
                    Practical, not theoretical
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#2f7dff] text-white">✓</span>
                    Focused on real audit readiness
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#2f7dff] text-white">✓</span>
                    Evidence-based approach
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#2f7dff] text-white">✓</span>
                    Simple and structured workflow
                  </li>
                </ul>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-14 sm:px-6 md:px-6 md:pb-16">
        <h3 className="text-center text-3xl font-semibold text-[#202743] motion-safe:animate-fade-in-up md:text-4xl">Trust & Credentials</h3>
        <p className="mt-2 text-center text-base text-[#6f7893] motion-safe:animate-fade-in-up motion-safe:delay-75 md:text-lg">
          We combine real-world experience with recognized knowledge and standards.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-2xl border border-[#d7deeb] bg-white p-5 transition-shadow duration-300 ease-out motion-safe:animate-fade-in-up motion-safe:transition-transform motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-md">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#eef2ff] text-[#2f7dff]">
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden="true">
                <rect x="6" y="4" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
                <path d="M9 9h6M9 13h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <h4 className="mt-3 text-2xl font-semibold text-[#1f2741]">Real-World Experience</h4>
            <p className="mt-2 text-base leading-7 text-[#55627e]">
              Years of hands-on work with audits, security assessments, and incident response.
            </p>
          </article>

          <article className="rounded-2xl border border-[#d7deeb] bg-white p-5 transition-shadow duration-300 ease-out motion-safe:animate-fade-in-up motion-safe:delay-100 motion-safe:transition-transform motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-md">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#eef2ff] text-[#2f7dff]">
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden="true">
                <path d="m4 9 8-5 8 5-8 5-8-5Zm3 2.5v4.5c0 1.6 2.2 3 5 3s5-1.4 5-3v-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <h4 className="mt-3 text-2xl font-semibold text-[#1f2741]">Certifications</h4>
            <p className="mt-2 text-base leading-7 text-[#55627e]">
              Industry-recognized certifications including CISSP, CySA+, and ISO 27001 Lead Auditor.
            </p>
          </article>

          <article className="rounded-2xl border border-[#d7deeb] bg-white p-5 transition-shadow duration-300 ease-out motion-safe:animate-fade-in-up motion-safe:delay-200 motion-safe:transition-transform motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-md">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#eef2ff] text-[#2f7dff]">
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden="true">
                <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </span>
            <h4 className="mt-3 text-2xl font-semibold text-[#1f2741]">Security Standards</h4>
            <p className="mt-2 text-base leading-7 text-[#55627e]">
              Deep knowledge of frameworks such as NIS2, ISO 27001, and other international standards.
            </p>
          </article>

          <article className="rounded-2xl border border-[#d7deeb] bg-white p-5 transition-shadow duration-300 ease-out motion-safe:animate-fade-in-up motion-safe:delay-300 motion-safe:transition-transform motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-md">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#eef2ff] text-[#2f7dff]">
              <svg viewBox="0 0 90 90" className="h-7 w-7 text-[#2f7dff]" fill="none" aria-hidden="true">
                <path
                  d="M 89.689 16.621 c -0.198 -0.188 -0.461 -0.284 -0.739 -0.274 c -6.479 0.321 -13.518 1.398 -22.148 3.389 c -0.271 0.063 -0.504 0.235 -0.643 0.476 c -0.139 0.241 -0.17 0.529 -0.088 0.794 l 0.838 2.704 c -6.363 -2.413 -15.313 -3.802 -23.06 -3.497 c -2.84 0 -6.082 1.409 -9.045 3.5 H 23.089 l 0.839 -2.708 c 0.083 -0.266 0.05 -0.553 -0.088 -0.794 c -0.138 -0.241 -0.371 -0.414 -0.642 -0.476 c -8.63 -1.991 -15.668 -3.068 -22.148 -3.389 c -0.269 -0.012 -0.54 0.085 -0.739 0.274 C 0.112 16.81 0 17.072 0 17.346 v 34.342 c 0 0.553 0.448 1 1 1 h 12.378 c 0.438 0 0.826 -0.285 0.955 -0.704 l 0.472 -1.523 c 10.187 11.872 20.546 22.775 28.634 22.775 c 1.557 0 3.029 -0.411 4.401 -1.29 l 0.211 0.214 c 0.944 0.956 2.209 1.487 3.561 1.495 c 0.011 0 0.021 0 0.032 0 c 1.339 0 2.597 -0.515 3.546 -1.451 c 0.834 -0.825 1.299 -1.873 1.436 -2.956 c 0.93 0.771 2.061 1.18 3.206 1.18 c 1.281 -0.001 2.564 -0.484 3.547 -1.454 c 1.109 -1.096 1.58 -2.581 1.456 -4.025 c 0.446 0.11 0.897 0.185 1.35 0.185 c 1.283 0 2.538 -0.443 3.448 -1.342 c 0.956 -0.944 1.487 -2.209 1.495 -3.561 s -0.507 -2.622 -1.387 -3.507 c -0.368 -0.453 -0.748 -0.888 -1.121 -1.334 l 6.816 -4.149 l 0.23 0.742 c 0.13 0.419 0.517 0.704 0.955 0.704 H 89 c 0.553 0 1 -0.447 1 -1 V 17.346 C 90 17.072 89.888 16.81 89.689 16.621 z M 12.641 50.688 H 2 V 18.403 c 5.806 0.359 12.122 1.335 19.699 3.043 L 12.641 50.688 z M 68.227 62.368 c -1.139 1.126 -3.31 1.005 -4.556 -0.258 c -0.017 -0.017 -0.039 -0.023 -0.057 -0.038 c -0.067 -0.077 -0.118 -0.163 -0.191 -0.237 l -10.95 -11.086 c -0.39 -0.392 -1.021 -0.396 -1.415 -0.009 c -0.393 0.389 -0.396 1.021 -0.009 1.415 l 10.95 11.086 c 0.569 0.575 0.88 1.343 0.875 2.16 c -0.005 0.816 -0.325 1.58 -0.901 2.148 c -1.195 1.183 -3.128 1.168 -4.31 -0.026 l -2.425 -2.455 c -0.002 -0.002 -0.003 -0.004 -0.004 -0.005 l -10.95 -11.085 c -0.389 -0.391 -1.022 -0.396 -1.414 -0.009 c -0.393 0.389 -0.397 1.021 -0.009 1.415 L 53.81 66.47 c 1.182 1.195 1.17 3.129 -0.026 4.31 c -1.196 1.182 -3.13 1.168 -4.31 -0.026 l -13.38 -13.545 c -0.389 -0.392 -1.022 -0.398 -1.414 -0.008 c -0.393 0.388 -0.397 1.021 -0.009 1.414 l 11.711 11.855 c -7.435 3.974 -19.75 -9.239 -30.877 -22.268 l 6.965 -22.487 h 9.815 c -2.741 2.432 -5.001 5.336 -6.092 7.983 c -1.396 3.386 -0.487 5.29 0.521 6.291 c 0.026 0.026 0.054 0.051 0.083 0.074 c 3.843 3.047 7.628 3.815 13.523 -2.283 c 2.001 0.122 3.705 -0.225 5.184 -1.064 c 8.306 5.807 15.937 12.961 22.749 21.343 C 69.435 59.254 69.423 61.188 68.227 62.368 z M 67.318 53.842 c -6.406 -7.41 -13.527 -13.843 -21.216 -19.146 c -0.341 -0.236 -0.793 -0.236 -1.134 -0.001 c -1.322 0.907 -2.939 1.251 -4.944 1.055 c -0.311 -0.034 -0.614 0.084 -0.827 0.31 c -5.585 5.943 -8.344 4.656 -11.109 2.473 c -0.996 -1.039 -0.577 -2.784 -0.046 -4.073 c 2.224 -5.398 10.113 -12.246 15.846 -12.247 c 8.172 -0.313 17.649 1.276 23.786 3.967 l 7.152 23.091 L 67.318 53.842 z M 88 50.688 H 77.358 l -9.058 -29.242 c 7.577 -1.708 13.894 -2.684 19.699 -3.043 V 50.688 z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <h4 className="mt-3 text-2xl font-semibold text-[#1f2741]">Practical Partnerships</h4>
            <p className="mt-2 text-base leading-7 text-[#55627e]">
              Collaboration with organizations to strengthen their security and achieve compliance goals.
            </p>
          </article>
        </div>

        <div className="mt-8 rounded-2xl border border-[#264579] bg-[linear-gradient(120deg,#091229,#0b1a39_48%,#0e2348)] px-5 py-6 text-white motion-safe:animate-fade-in-up motion-safe:delay-150 sm:px-8 md:px-10 md:py-7">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex min-w-0 items-center gap-5">
              <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[#3a7ce2] bg-[#102a57] text-[#77aefc]">
                <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" aria-hidden="true">
                  <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              </span>
              <div className="min-w-0">
                <p className="text-2xl font-semibold md:text-4xl">Want to know more about our work?</p>
                <p className="mt-1 text-sm text-[#c7d8f8] md:text-base">
                  We&apos;re always open to new conversations about how we can help you and your organization stay secure and audit-ready.
                </p>
              </div>
            </div>
            <div className="ml-auto flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex min-w-[180px] items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-[#1f7bff] bg-[#1f7bff] px-6 py-3 text-base font-semibold transition-colors duration-200 hover:bg-[#2e87ff] active:scale-[0.98] motion-safe:active:transition-transform md:text-lg"
              >
                Contact Us
                <ArrowRightIcon />
              </Link>
              <Link
                href="/resources"
                className="inline-flex min-w-[210px] items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-[#456298] px-6 py-3 text-base font-semibold text-[#e5eeff] transition-colors duration-200 hover:bg-[#173160] active:scale-[0.98] motion-safe:active:transition-transform md:text-lg"
              >
                Explore Products
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
