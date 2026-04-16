import Link from 'next/link';
import { PublicFooter } from '@/components/public-footer';
import heroBackground from '@/assets/cybersecurity-background-59ognpsy7izka4l9.png';

const highlights = [
  {
    title: 'Role-specific guidance',
    body: 'Relevant insights for your responsibilities.',
  },
  {
    title: 'Faster, confident decisions',
    body: 'Know what matters and what to fix.',
  },
  {
    title: 'Stronger audit outcomes',
    body: 'Show your work, close gaps, get ready.',
  },
];

export default function WhoItsForPage() {
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
              Built for teams, valuable at every level
            </p>
            <h1 className="mt-4 text-5xl font-semibold leading-tight text-white motion-safe:animate-fade-in-up motion-safe:delay-100 sm:text-6xl">
              Built for Everyone Involved
              <br />
              in <span className="text-[#3f8bff]">Cybersecurity Readiness</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-[#c7d8f8] motion-safe:animate-fade-in-up motion-safe:delay-200">
              Checklist KB helps the right people ask the right questions, take action, and demonstrate progress.
            </p>

            <div className="mt-7 grid gap-3 motion-safe:animate-fade-in-up motion-safe:delay-300 sm:grid-cols-3">
              {highlights.map((item) => (
                <article key={item.title} className="rounded-xl border border-[#2c4f84] bg-[#0d2246]/80 p-4 transition-colors duration-300 ease-out motion-safe:transition-transform motion-safe:hover:-translate-y-0.5">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#12366c] text-[#78abff]">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                      <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                  </span>
                  <h2 className="mt-3 text-sm font-semibold text-white">{item.title}</h2>
                  <p className="mt-1 text-xs text-[#a9c0e6]">{item.body}</p>
                </article>
              ))}
            </div>

          </div>

          <div className="relative motion-safe:animate-fade-in-right motion-safe:delay-200">
            <div className="overflow-hidden rounded-2xl border border-[#2f4f86] bg-[#f8fbff] shadow-[0_20px_50px_rgba(0,0,0,0.45)] transition-shadow duration-500 ease-out motion-safe:hover:shadow-[0_24px_60px_rgba(0,0,0,0.42)]">
              <div className="grid md:grid-cols-[168px_1fr]">
                <aside className="min-h-[286px] bg-[#091d3f] p-4 text-[#d7e6ff]">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em]">Checklist KB</p>
                  <ul className="space-y-2.5 text-xs">
                    <li className="rounded-md px-2 py-1.5 text-[#a8bedf]">Dashboard</li>
                    <li className="rounded-md px-2 py-1.5 text-[#a8bedf]">Checklist</li>
                    <li className="rounded-md px-2 py-1.5 text-[#a8bedf]">Evidence</li>
                    <li className="rounded-md bg-[#163f7d] px-2 py-1.5">Reports</li>
                    <li className="rounded-md px-2 py-1.5 text-[#a8bedf]">Settings</li>
                  </ul>
                </aside>
                <div className="p-5 text-[#1f3253]">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#4e6c96]">1.1 Information Security Policies</p>
                  <h3 className="mt-2 text-sm font-semibold sm:text-base">Does your organization have documented information security policies?</h3>
                  <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_150px]">
                    <div className="rounded-lg border border-[#e2e8f4] bg-white p-3 text-xs">
                      <div className="grid grid-cols-4 gap-2">
                        <span className="rounded-md border border-[#1f7bff] bg-[#1f7bff] px-2 py-1 text-center font-semibold text-white">Yes</span>
                        <span className="rounded-md border border-[#d7e2f7] bg-[#f7fbff] px-2 py-1 text-center text-[#5f7596]">Partly</span>
                        <span className="rounded-md border border-[#d7e2f7] bg-[#f7fbff] px-2 py-1 text-center text-[#5f7596]">No</span>
                        <span className="rounded-md border border-[#d7e2f7] bg-[#f7fbff] px-2 py-1 text-center text-[#5f7596]">Not sure</span>
                      </div>
                      <div className="mt-3 rounded-md border border-[#e4eaf6] bg-[#fbfcff] px-3 py-2 text-[#4d6388]">Add a note...</div>
                      <div className="mt-3 rounded-md border border-[#e4eaf6] bg-[#fbfcff] p-2 text-[#4d6388]">policy_v1.2.pdf</div>
                    </div>
                    <div className="rounded-lg border border-[#e2e8f4] bg-white p-3 text-xs">
                      <p className="font-semibold text-[#4d6388]">Progress</p>
                      <p className="mt-1 text-xl font-bold text-[#1f355d]">42%</p>
                      <div className="mt-2 h-1.5 rounded-full bg-[#d8e4f7]">
                        <div className="h-full w-[42%] rounded-full bg-[#2f7dff]" />
                      </div>
                      <p className="mt-3 font-semibold text-[#4d6388]">Answered</p>
                      <ul className="mt-2 space-y-1 text-[#4e6283]">
                        <li className="flex items-center justify-between"><span>Yes</span><span className="font-semibold">12</span></li>
                        <li className="flex items-center justify-between"><span>Partly</span><span className="font-semibold">5</span></li>
                        <li className="flex items-center justify-between"><span>No</span><span className="font-semibold">3</span></li>
                        <li className="flex items-center justify-between"><span>Not sure</span><span className="font-semibold">2</span></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-12 -right-4 hidden w-56 rounded-2xl border border-[#d7e2f5] bg-white p-4 shadow-[0_16px_30px_rgba(0,0,0,0.2)] sm:block">
              <p className="text-sm font-semibold text-[#2a3e63]">Maturity Overview</p>
              <div className="relative mt-2 h-28">
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
                  <polygon points="160,52 220,78 222,136 160,166 102,134 108,82" fill="#93b5f3" fillOpacity="0.42" stroke="#5e97ed" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 md:px-6 md:py-14">
        <h2 className="text-center text-5xl font-semibold text-[#1a2440]">Who It&apos;s For</h2>
        <p className="mt-2 text-center text-lg text-[#5e7293]">Different roles. Shared goal. Audit-ready confidence.</p>
        <div className="mt-7 grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="flex h-full flex-col rounded-2xl border border-[#d7deeb] bg-[#f2f7ff] p-5 shadow-sm transition-shadow duration-300 ease-out motion-safe:transition-transform motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-md">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#e9f0ff] text-[#3c7df0]">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
                <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </span>
            <h3 className="mt-3 min-h-[56px] text-2xl font-semibold text-[#1f355d]">CISO &amp; Security Teams</h3>
            <p className="mt-2 min-h-[66px] text-sm text-[#5e7293]">Assess your security posture, identify gaps, and prioritize what matters.</p>
            <ul className="mt-4 space-y-1.5 text-sm text-[#4e6283]">
              <li className="flex items-center gap-2"><span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#3c7df0] text-white text-[10px]">✓</span>Map controls to frameworks</li>
              <li className="flex items-center gap-2"><span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#3c7df0] text-white text-[10px]">✓</span>Identify and mitigate risks</li>
              <li className="flex items-center gap-2"><span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#3c7df0] text-white text-[10px]">✓</span>Track progress over time</li>
            </ul>
          </article>
          <article className="flex h-full flex-col rounded-2xl border border-[#d7deeb] bg-[#f2fbf6] p-5 shadow-sm transition-shadow duration-300 ease-out motion-safe:transition-transform motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-md">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f7ee] text-[#30b271]">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
                <path d="M7 3h8l4 4v14H7zM15 3v4h4M10 13h6M10 17h6" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </span>
            <h3 className="mt-3 min-h-[56px] text-2xl font-semibold text-[#1f355d]">IT &amp; Compliance Teams</h3>
            <p className="mt-2 min-h-[66px] text-sm text-[#5e7293]">Turn complex requirements into clear tasks and evidence.</p>
            <ul className="mt-4 space-y-1.5 text-sm text-[#4e6283]">
              <li className="flex items-center gap-2"><span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#30b271] text-white text-[10px]">✓</span>Answer guided questions</li>
              <li className="flex items-center gap-2"><span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#30b271] text-white text-[10px]">✓</span>Upload evidence securely</li>
              <li className="flex items-center gap-2"><span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#30b271] text-white text-[10px]">✓</span>Stay organized and audit-ready</li>
            </ul>
          </article>
          <article className="flex h-full flex-col rounded-2xl border border-[#d7deeb] bg-[#fffaf0] p-5 shadow-sm transition-shadow duration-300 ease-out motion-safe:transition-transform motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-md">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#fff5df] text-[#f2b535]">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
                <path d="M4 7h16M7 7V5h10v2m-9 0v12h8V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <h3 className="mt-3 min-h-[56px] text-2xl font-semibold text-[#1f355d]">Management</h3>
            <p className="mt-2 min-h-[66px] text-sm text-[#5e7293]">Get clear, actionable insights to make better risk-based decisions.</p>
            <ul className="mt-4 space-y-1.5 text-sm text-[#4e6283]">
              <li className="flex items-center gap-2"><span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#f2b535] text-white text-[10px]">✓</span>Understand your risk exposure</li>
              <li className="flex items-center gap-2"><span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#f2b535] text-white text-[10px]">✓</span>See prioritized recommendations</li>
              <li className="flex items-center gap-2"><span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#f2b535] text-white text-[10px]">✓</span>Support strategic planning</li>
            </ul>
          </article>
          <article className="flex h-full flex-col rounded-2xl border border-[#d7deeb] bg-[#f6f3ff] p-5 shadow-sm transition-shadow duration-300 ease-out motion-safe:transition-transform motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-md">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#f1ecff] text-[#6c62f7]">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
                <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7 9c0-3.5 3.1-6 7-6s7 2.5 7 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <h3 className="mt-3 min-h-[56px] text-2xl font-semibold text-[#1f355d]">Auditors &amp; Consultants</h3>
            <p className="mt-2 min-h-[66px] text-sm text-[#5e7293]">Save time with structured, consistent output your clients can trust.</p>
            <ul className="mt-4 space-y-1.5 text-sm text-[#4e6283]">
              <li className="flex items-center gap-2"><span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#6c62f7] text-white text-[10px]">✓</span>Review ready-to-share reports</li>
              <li className="flex items-center gap-2"><span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#6c62f7] text-white text-[10px]">✓</span>Validate evidence with ease</li>
              <li className="flex items-center gap-2"><span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#6c62f7] text-white text-[10px]">✓</span>Deliver more value, faster</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-4 sm:px-6 md:px-6">
        <article className="rounded-2xl border border-[#d9e2f0] bg-[#edf2fa] p-5 transition-shadow duration-300 motion-safe:animate-fade-in-up motion-safe:hover:shadow-md md:p-7">
          <h3 className="text-center text-4xl font-semibold text-[#1a2440]">Real-World Use Cases</h3>
          <p className="mt-2 text-center text-base text-[#5e7293]">How organizations use Checklist KB to get ahead.</p>
          <div className="mt-6 grid items-stretch gap-3 md:grid-cols-3">
            <div className="h-full rounded-xl border border-[#dce5f2] bg-white p-4 transition-shadow duration-300 motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#e9f0ff] text-[#3c7df0]">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
                    <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
                <div className="min-h-[86px]">
                  <p className="text-base font-semibold text-[#1f355d]">Preparing for an Audit</p>
                  <p className="mt-1 text-sm text-[#5e7293]">Identify gaps, collect evidence, and walk into audits with confidence.</p>
                </div>
              </div>
            </div>
            <div className="h-full rounded-xl border border-[#dce5f2] bg-white p-4 transition-shadow duration-300 motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#e9f0ff] text-[#3c7df0]">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                    <path d="m4 16 5-5 3 3 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M15 7h4v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div className="min-h-[86px]">
                  <p className="text-base font-semibold text-[#1f355d]">Improving Security Posture</p>
                  <p className="mt-1 text-sm text-[#5e7293]">Turn findings into actions that reduce risk and strengthen your organization.</p>
                </div>
              </div>
            </div>
            <div className="h-full rounded-xl border border-[#dce5f2] bg-white p-4 transition-shadow duration-300 motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#e9f0ff] text-[#3c7df0]">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                    <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                </span>
                <div className="min-h-[86px]">
                  <p className="text-base font-semibold text-[#1f355d]">Supporting Compliance</p>
                  <p className="mt-1 text-sm text-[#5e7293]">Align with frameworks and regulations like ISO 27001, NIS2, and more.</p>
                </div>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-4 sm:px-6 md:px-6">
        <article className="rounded-2xl border border-[#d7e7de] bg-[#edf7f0] p-5 transition-shadow duration-300 motion-safe:animate-fade-in-up motion-safe:hover:shadow-md md:p-6">
          <div className="grid gap-4 lg:grid-cols-[1.15fr_3fr]">
            <div className="border-b border-[#d2e6da] pb-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-5">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d9efe0] text-[#35a26f]">
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden="true">
                  <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" stroke="currentColor" strokeWidth="1.8" />
                  <path d="m9.4 12.2 1.8 1.8 3.6-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <p className="mt-3 text-3xl font-semibold text-[#1f3a31]">Your Data. Your Control.</p>
              <p className="mt-2 text-sm font-semibold text-[#35584a]">We take security and privacy seriously.</p>
              <p className="mt-2 text-sm text-[#4f6f61]">Built with security by design and strict data handling practices.</p>
            </div>
            <div className="mt-2 grid gap-4 sm:grid-cols-2 lg:mt-3 lg:grid-cols-4 lg:pl-2">
              <div className="border-b border-[#d2e6da] pb-3 sm:border-b-0 sm:border-r sm:pr-3 lg:pr-4">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#edf7f0] text-[#2f5a4a]">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                    <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                </span>
                <p className="mt-2 font-semibold text-[#254a3b]">MFA Protection</p>
                <p className="mt-1 text-sm text-[#4f6f61]">Secure login with multi-factor authentication.</p>
              </div>
              <div className="border-b border-[#d2e6da] pb-3 sm:border-b-0 sm:border-r sm:pr-3 lg:pr-4">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#edf7f0] text-[#2f5a4a]">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                    <path d="M7 10V8a5 5 0 0 1 10 0v2M6 10h12v10H6z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
                <p className="mt-2 font-semibold text-[#254a3b]">Encrypted Storage</p>
                <p className="mt-1 text-sm text-[#4f6f61]">All files are encrypted in transit and at rest.</p>
              </div>
              <div className="border-b border-[#d2e6da] pb-3 sm:border-b-0 sm:border-r sm:pr-3 lg:pr-4">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#edf7f0] text-[#2f5a4a]">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M12 8v4l2.5 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
                <p className="mt-2 font-semibold text-[#254a3b]">Automatic Deletion</p>
                <p className="mt-1 text-sm text-[#4f6f61]">Your data is deleted automatically after 48 hours.</p>
              </div>
              <div>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#edf7f0] text-[#2f5a4a]">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                    <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" stroke="currentColor" strokeWidth="1.8" />
                    <path d="m9.4 12.2 1.8 1.8 3.6-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <p className="mt-2 font-semibold text-[#254a3b]">Private by Default</p>
                <p className="mt-1 text-sm text-[#4f6f61]">Your data stays private and always will.</p>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-10 sm:px-6 md:px-6">
        <article className="rounded-2xl border border-[#17489b] bg-[linear-gradient(90deg,#0b2f73,#0e3f9d)] p-5 text-white transition-shadow duration-300 motion-safe:animate-fade-in-up motion-safe:hover:shadow-[0_18px_34px_rgba(17,62,148,0.28)] md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-3xl font-semibold">The right insights. For the right people.</h3>
              <p className="mt-1 text-sm text-[#d2e2ff]">See how Checklist KB can help your team get ready.</p>
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
