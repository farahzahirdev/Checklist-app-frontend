import Link from 'next/link';
import { PublicFooter } from '@/components/public-footer';
import heroBackground from '@/assets/cybersecurity-background-59ognpsy7izka4l9.png';

function CheckBadgeIcon() {
  return (
    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#ddf5e8] text-[#2f9c65]">
      <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" aria-hidden="true">
        <path d="m4.2 8.1 2.2 2.2 5.2-5.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export default function ProductsPage() {
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
              Documentation blueprints
            </p>
            <h1 className="mt-4 text-5xl font-semibold leading-tight text-white motion-safe:animate-fade-in-up motion-safe:delay-100 sm:text-6xl">
              Close Gaps. Save Time.
              <br />
              Get Expert-Ready <span className="text-[#3f8bff]">Documentation.</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-[#c7d8f8] motion-safe:animate-fade-in-up motion-safe:delay-200">
              Buy individual policy sections with ready-to-use templates, guidelines, and admin instructions - written
              by security experts, aligned to ISO 27001, NIS2, and best practices.
            </p>
            <div className="mt-7 grid gap-3 motion-safe:animate-fade-in-up motion-safe:delay-300 sm:grid-cols-3">
              <article className="rounded-xl border border-[#2c4f84] bg-[#0d2246]/80 p-4 transition-colors duration-300 ease-out motion-safe:transition-transform motion-safe:hover:-translate-y-0.5">
                <p className="text-sm font-semibold text-white">Audit-ready</p>
                <p className="mt-1 text-xs text-[#a9c0e6]">Aligned to frameworks</p>
              </article>
              <article className="rounded-xl border border-[#2c4f84] bg-[#0d2246]/80 p-4 transition-colors duration-300 ease-out motion-safe:transition-transform motion-safe:hover:-translate-y-0.5">
                <p className="text-sm font-semibold text-white">Instant delivery</p>
                <p className="mt-1 text-xs text-[#a9c0e6]">Download and use</p>
              </article>
              <article className="rounded-xl border border-[#2c4f84] bg-[#0d2246]/80 p-4 transition-colors duration-300 ease-out motion-safe:transition-transform motion-safe:hover:-translate-y-0.5">
                <p className="text-sm font-semibold text-white">Expert written</p>
                <p className="mt-1 text-xs text-[#a9c0e6]">Practical. Clear. Complete.</p>
              </article>
            </div>
          </div>

          <div className="relative motion-safe:animate-fade-in-right motion-safe:delay-200">
            <div className="overflow-hidden rounded-2xl border border-[#2f4f86] bg-[#f8fbff] shadow-[0_20px_50px_rgba(0,0,0,0.45)] transition-shadow duration-500 ease-out motion-safe:hover:shadow-[0_24px_60px_rgba(0,0,0,0.42)]">
              <div className="grid md:grid-cols-[175px_1fr]">
                <aside className="min-h-[340px] bg-[#091d3f] p-4 text-[#d7e6ff]">
                  <p className="mb-4 text-sm font-semibold uppercase tracking-[0.15em]">Checklist KB</p>
                  <ul className="space-y-2.5 text-sm">
                    <li className="rounded-md px-2 py-1.5 text-[#a8bedf]">Dashboard</li>
                    <li className="rounded-md bg-[#163f7d] px-2 py-1.5">Checklist</li>
                    <li className="rounded-md px-2 py-1.5 text-[#a8bedf]">Evidence</li>
                    <li className="rounded-md px-2 py-1.5 text-[#a8bedf]">Reports</li>
                    <li className="rounded-md px-2 py-1.5 text-[#a8bedf]">Settings</li>
                  </ul>
                </aside>
                <div className="p-5 text-[#1f3253]">
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#4e6c96]">Documentation Library</p>
                  <div className="mt-3 space-y-2.5">
                    <div className="rounded-lg border border-[#e2e8f4] bg-white p-3 text-base">Mobile Device Policy</div>
                    <div className="rounded-lg border border-[#e2e8f4] bg-white p-3 text-base">Access Control Policy</div>
                    <div className="rounded-lg border border-[#e2e8f4] bg-white p-3 text-base">Incident Response Policy</div>
                    <div className="rounded-lg border border-[#e2e8f4] bg-white p-3 text-base">Data Classification Policy</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-4 hidden w-56 rounded-2xl border border-[#d7e2f5] bg-white p-4 shadow-[0_16px_30px_rgba(0,0,0,0.2)] sm:block">
              <p className="text-sm font-semibold text-[#2a3e63]">Mobile Device Policy</p>
              <ul className="mt-2 space-y-1 text-xs text-[#4c5f80]">
                <li>Policy Document (PDF)</li>
                <li>User Guidelines (PDF)</li>
                <li>Admin Guidelines (PDF)</li>
              </ul>
              <p className="mt-3 text-lg font-bold text-[#1f355d]">€149</p>
              <button type="button" className="mt-2 w-full rounded-lg bg-[#1f7bff] px-3 py-2 text-sm font-semibold text-white">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] space-y-4 px-4 py-10 sm:px-6 md:px-6 md:py-14">
        <article className="rounded-2xl border border-[#d7e7de] bg-[#edf7f0] p-5 md:p-6">
          <div className="grid gap-3 md:grid-cols-[1.1fr_3fr]">
            <div>
              <h3 className="text-3xl font-semibold text-[#1a2440]">How it works</h3>
              <p className="mt-2 text-sm text-[#5e7293]">Find the section you need. Download. Customize. Stay compliant.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-[#d2e6da] bg-white/70 p-4">
                <p className="text-sm font-semibold text-[#1f355d]">1. Find the Gap</p>
                <p className="mt-1 text-xs text-[#5e7293]">Your assessment shows what&apos;s missing.</p>
              </div>
              <div className="rounded-xl border border-[#d2e6da] bg-white/70 p-4">
                <p className="text-sm font-semibold text-[#1f355d]">2. Choose a Section</p>
                <p className="mt-1 text-xs text-[#5e7293]">Pick the policy section you need.</p>
              </div>
              <div className="rounded-xl border border-[#d2e6da] bg-white/70 p-4">
                <p className="text-sm font-semibold text-[#1f355d]">3. Download Instantly</p>
                <p className="mt-1 text-xs text-[#5e7293]">Get the documents in PDF and DOCX.</p>
              </div>
              <div className="rounded-xl border border-[#d2e6da] bg-white/70 p-4">
                <p className="text-sm font-semibold text-[#1f355d]">4. Customize &amp; Use</p>
                <p className="mt-1 text-xs text-[#5e7293]">Adapt to your organization. You&apos;re ready.</p>
              </div>
            </div>
          </div>
        </article>

        <div>
          <h3 className="text-4xl font-semibold text-[#1a2440]">Browse Documentation Sections</h3>
          <p className="mt-2 text-base text-[#5e7293]">Each section includes a policy, user guidelines, and admin guidelines.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {['All', 'Access & Identity', 'Devices & Endpoints', 'Data Protection', 'Operations', 'Governance', 'Response'].map(
              (chip) => (
                <button
                  key={chip}
                  type="button"
                  className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${
                    chip === 'Devices & Endpoints'
                      ? 'border-[#1f7bff] bg-[#1f7bff] text-white'
                      : 'border-[#d7deeb] bg-white text-[#5e7293] hover:bg-[#f7f9ff]'
                  }`}
                >
                  {chip}
                </button>
              ),
            )}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          {[
            {
              name: 'Mobile Device Policy',
              price: '€149',
              subtitle: 'Define rules for corporate and personal mobile devices.',
              badge: 'Popular',
              points: ['Policy Document', 'User Guidelines', 'Admin Guidelines'],
            },
            {
              name: 'Remote Work Policy',
              price: '€149',
              subtitle: 'Secure and productive remote work, clearly defined.',
              points: ['Policy Document', 'User Guidelines', 'Admin Guidelines'],
            },
            {
              name: 'Access Control Policy',
              price: '€179',
              subtitle: 'Manage who has access to what, and under which conditions.',
              points: ['Policy Document', 'User Guidelines', 'Admin Guidelines', 'Admin Guidelines (Advanced)'],
            },
            {
              name: 'Incident Response Policy',
              price: '€199',
              subtitle: 'Be ready when incidents happen. Act fast. Act right.',
              points: ['Policy Document', 'User Guidelines', 'Admin Guidelines', 'Response Playbooks'],
            },
            {
              name: 'Data Classification Policy',
              price: '€149',
              subtitle: 'Define how data is labeled, handled, and protected.',
              points: ['Policy Document', 'User Guidelines', 'Admin Guidelines'],
            },
          ].map((doc) => (
            <article key={doc.name} className="flex h-full flex-col rounded-2xl border border-[#d7deeb] bg-white p-4 shadow-sm transition-shadow duration-300 ease-out motion-safe:transition-transform motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-md">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-[#1f2741]">{doc.name}</h2>
                {doc.badge ? (
                  <span className="rounded-full bg-[#dbf8e9] px-2 py-0.5 text-[10px] font-semibold text-[#2f9c65]">
                    {doc.badge}
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm text-[#5e7293]">{doc.subtitle}</p>
              <ul className="mt-3 space-y-1.5 text-xs text-[#5f7394]">
                {doc.points.map((point) => (
                  <li key={point} className="flex items-center gap-2">
                    <CheckBadgeIcon />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-auto pt-5 text-2xl font-semibold text-[#1f355d]">{doc.price}</p>
              <button
                type="button"
                className="mt-3 w-full rounded-lg border border-[#1f7bff] bg-[#1f7bff]/10 px-3 py-2 text-sm font-semibold text-[#1f7bff] hover:bg-[#1f7bff]/20"
              >
                View Details
              </button>
            </article>
          ))}
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.9fr_1fr]">
          <article className="rounded-2xl border border-[#d7deeb] bg-[#eef2fa] p-5 transition-shadow duration-300 ease-out motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md md:p-6">
            <h3 className="text-3xl font-semibold text-[#1a2440]">Bundle &amp; Save</h3>
            <p className="mt-2 text-sm text-[#5e7293]">Get multiple sections and save up to 25%.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="flex h-full flex-col rounded-xl border border-[#d7deeb] bg-white p-4 text-center">
                <p className="font-semibold text-[#1f355d]">Essential Bundle</p>
                <p className="mt-1 text-sm text-[#5e7293]">3 sections of your choice</p>
                <p className="mt-2 text-xs font-semibold text-[#2f9c65]">Save 10%</p>
                <p className="mt-auto pt-3 text-3xl font-bold text-[#1f355d]">€399</p>
                <p className="mt-1 text-xs text-[#7e8fa9] line-through">€447</p>
                <button type="button" className="mt-3 rounded-lg border border-[#b8c9e8] px-3 py-1.5 text-sm font-semibold text-[#355d99]">
                  Choose Sections
                </button>
              </div>
              <div className="flex h-full flex-col rounded-xl border-2 border-[#2f7dff] bg-white p-4 text-center">
                <p className="inline-flex rounded-full bg-[#2f7dff] px-3 py-0.5 text-xs font-semibold uppercase tracking-[0.08em] text-white">
                  Most Popular
                </p>
                <p className="mt-2 font-semibold text-[#1f355d]">Professional Bundle</p>
                <p className="mt-1 text-sm text-[#5e7293]">5 sections of your choice</p>
                <p className="mt-2 text-xs font-semibold text-[#2f9c65]">Save 20%</p>
                <p className="mt-auto pt-3 text-3xl font-bold text-[#1f355d]">€599</p>
                <p className="mt-1 text-xs text-[#7e8fa9] line-through">€745</p>
                <button type="button" className="mt-3 rounded-lg border border-[#1f7bff] bg-[#1f7bff] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#2e87ff]">
                  Choose Sections
                </button>
              </div>
              <div className="flex h-full flex-col rounded-xl border border-[#d7deeb] bg-white p-4 text-center">
                <p className="font-semibold text-[#1f355d]">Complete Bundle</p>
                <p className="mt-1 text-sm text-[#5e7293]">10 sections of your choice</p>
                <p className="mt-2 text-xs font-semibold text-[#2f9c65]">Save 25%</p>
                <p className="mt-auto pt-3 text-3xl font-bold text-[#1f355d]">€999</p>
                <p className="mt-1 text-xs text-[#7e8fa9] line-through">€1,490</p>
                <button type="button" className="mt-3 rounded-lg border border-[#b8c9e8] px-3 py-1.5 text-sm font-semibold text-[#355d99]">
                  Choose Sections
                </button>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-[#d7e7de] bg-[#edf7f0] p-5 transition-shadow duration-300 ease-out motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md md:p-6">
            <h3 className="text-3xl font-semibold text-[#1f3a31]">Why organizations choose our documentation</h3>
            <ul className="mt-4 space-y-2.5 text-base leading-7 text-[#2f7f57]">
              <li className="flex items-center gap-2.5"><CheckBadgeIcon />Written by cybersecurity experts</li>
              <li className="flex items-center gap-2.5"><CheckBadgeIcon />Aligned to ISO 27001, NIS2 and best practices</li>
              <li className="flex items-center gap-2.5"><CheckBadgeIcon />Ready to customize and use</li>
              <li className="flex items-center gap-2.5"><CheckBadgeIcon />Saves weeks of manual work</li>
              <li className="flex items-center gap-2.5"><CheckBadgeIcon />Used by auditors and security teams</li>
            </ul>
          </article>
        </div>

        <article className="rounded-2xl border border-[#17489b] bg-[linear-gradient(90deg,#0b2f73,#0e3f9d)] p-5 text-white transition-shadow duration-300 ease-out motion-safe:animate-fade-in-up motion-safe:hover:shadow-[0_18px_34px_rgba(17,62,148,0.28)] md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-3xl font-semibold">Found a gap. Now close it.</h3>
              <p className="mt-1 text-sm text-[#d2e2ff]">Get the right documentation section and move forward with confidence.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/products/audit-readiness-checklist" className="rounded-xl border border-white/35 bg-white px-5 py-2.5 font-semibold text-[#123e8b] transition-colors duration-200 hover:bg-[#e9f1ff] active:scale-[0.98] motion-safe:active:transition-transform">
                View Product Details
              </Link>
              <button
                type="button"
                aria-label="Open cart"
                className="rounded-xl border border-[#1f7bff] bg-[#1f7bff] px-4 py-2.5 text-white transition-colors duration-200 hover:bg-[#2e87ff] active:scale-[0.98] motion-safe:active:transition-transform"
              >
                <svg viewBox="0 0 90 90" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path
                    d="M89.138 21.425c-.824-1.103-2.087-1.736-3.464-1.736H17.129l-.886-3.413c-.704-2.713-3.153-4.607-5.956-4.607H1"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M78.642 60.522H26.441L14.308 13.669M17.648 21.69h68.025c.74 0 1.418.34 1.861.933.443.592.577 1.338.367 2.048l-5.809 19.649c-.518 1.75-2.152 2.972-3.977 2.972h-53.3"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="35.47" cy="71.509" r="6.822" stroke="currentColor" strokeWidth="4" />
                  <circle cx="68.27" cy="71.509" r="6.822" stroke="currentColor" strokeWidth="4" />
                </svg>
              </button>
            </div>
          </div>
        </article>
      </section>

      <PublicFooter />
    </main>
  );
}
