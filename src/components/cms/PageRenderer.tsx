'use client';

import React from 'react';
import heroBackground from '@/assets/cybersecurity-background-59ognpsy7izka4l9.png';
import { PageDetail, PageSection } from '@/lib/api/cms-api';

interface PageRendererProps {
  page: PageDetail | null;
  fallback: React.ReactNode;
}

/**
 * Renders a CMS page or fallback content
 * Maps section types to their corresponding display components
 */
export function PageRenderer({ page, fallback }: PageRendererProps) {
  // If no page from CMS, show fallback
  if (!page) {
    return <>{fallback}</>;
  }

  return (
    <main className="overflow-x-hidden bg-[#f3f5fb]">
      {page.sections && page.sections.length > 0 ? (
        page.sections
          .sort((a, b) => a.order - b.order)
          .map((section) => (
            <SectionRenderer key={section.id} section={section} />
          ))
      ) : (
        // If page exists but has no sections, show fallback
        fallback
      )}
    </main>
  );
}

/**
 * Renders individual section based on section type
 */
function SectionRenderer({ section }: { section: PageSection }) {
  const data = section.data || {};

  switch (section.section_type) {
    case 'hero':
      return <HeroSectionRenderer data={data} />;
    case 'products':
      return <ProductSectionRenderer data={data} />;
    case 'faq':
      return <FAQSectionRenderer data={data} />;
    case 'cards':
      return <CardsSectionRenderer data={data} />;
    case 'cta':
      return <CTASectionRenderer data={data} />;
    case 'trust':
      return <TrustSectionRenderer data={data} />;
    case 'how-it-works':
      return <HowItWorksSectionRenderer data={data} />;
    case 'documentation-grid':
      return <DocumentationGridRenderer data={data} />;
    case 'bundles':
      return <BundlesSectionRenderer data={data} />;
    case 'why-choose':
      return <WhyChooseSectionRenderer data={data} />;
    case 'use_cases':
      return <UseCasesSectionRenderer data={data} />;
    case 'steps':
      return <StepsSectionRenderer data={data} />;
    case 'contact_info':
      return <ContactInfoSectionRenderer data={data} />;
    case 'legal':
      return <LegalSectionRenderer data={data} />;
    case 'standard':
      return <StandardSectionRenderer data={data} />;
    default:
      return <div className="p-4 text-gray-500">Unknown section type: {section.section_type}</div>;
  }
}

// Section Renderers

function HeroSectionRenderer({ data }: { data: Record<string, any> }) {
  const heroImage = data.background_image && !data.background_image.startsWith('/assets/')
    ? data.background_image
    : heroBackground.src;
  const backgroundImage = `linear-gradient(rgba(4, 9, 22, 0.56), rgba(4, 9, 22, 0.72)), url(${heroImage})`;

  return (
    <section
      className="px-4 py-8 md:py-10 text-white"
      style={{
        backgroundImage,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="mx-auto grid min-h-[400px] w-full max-w-6xl items-start gap-5 sm:min-h-[420px] md:gap-7 lg:min-h-[440px] lg:grid-cols-2 lg:items-center lg:gap-8 xl:max-w-6xl 2xl:max-w-[90rem]">
        <div className="space-y-4">
          {data.kicker && (
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#5ea2ff]">
              {data.kicker}
            </p>
          )}
          {data.title && <h1 className="max-w-xl text-4xl font-semibold leading-tight md:text-5xl">{data.title}</h1>}
          {data.subtitle && <p className="max-w-xl text-lg text-[#d4e2f6] md:text-xl">{data.subtitle}</p>}
          {data.description && <p className="max-w-xl text-sm leading-7 text-[#d4e2f6] md:text-base">{data.description}</p>}
          {(data.buttons || data.button_text) && (
            <div className="flex flex-wrap gap-3 pt-2">
              {Array.isArray(data.buttons)
                ? data.buttons.map((button: any, index: number) => (
                    <a
                      key={index}
                      href={button.url || '#'}
                      className={`inline-flex items-center rounded-lg px-5 py-3 text-sm font-medium transition ${
                        button.primary
                          ? 'bg-[#2e82ff] text-white hover:bg-[#276fd5]'
                          : 'border border-white/25 bg-white/10 text-white hover:bg-white/15'
                      }`}
                    >
                      {button.text}
                    </a>
                  ))
                : data.button_text && data.button_link && (
                    <a
                      href={data.button_link}
                      className="inline-flex items-center rounded-lg bg-[#2e82ff] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#276fd5]"
                    >
                      {data.button_text}
                    </a>
                  )}
            </div>
          )}
        </div>

        {data.mockup && (
          <div className="relative mx-auto w-full max-w-[620px] lg:max-w-[640px] lg:justify-self-end">
            <div className="overflow-hidden rounded-2xl border border-[#325a99]/80 bg-[#edf1f9] text-[#152948] shadow-[0_24px_70px_rgba(0,0,0,0.55)]">
              <div className="grid md:grid-cols-[180px_1fr]">
                <aside className="h-full bg-[#0b1a39] p-2.5 text-[#dce8ff]">
                  <p className="mb-2 text-sm font-semibold">{data.mockup.brand || 'AuditReady'}</p>
                  <ul className="space-y-1.5 text-xs">
                    {(data.mockup.nav ? Object.values(data.mockup.nav) : ['Dashboard', 'Checklists', 'Reports', 'Settings']).map((item: any, index: number) => (
                      <li key={index} className={`rounded-md px-2 py-1.5 ${index === 0 ? 'bg-[#17376d]' : 'text-[#a0b4d5]'}`}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </aside>
                <div className="p-3">
                  <div className="mb-2 rounded-xl bg-white p-2.5">
                    <p className="text-sm font-semibold text-[#1a2c4f]">{data.mockup.dashboard?.title || 'Dashboard'}</p>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {(Object.entries(data.mockup.dashboard?.metrics || {
                        overallReadiness: 'Overall Readiness',
                        completed: 'Completed',
                        openFindings: 'Open Findings',
                      }) as Array<[string, string]>).map(([key, label]) => (
                        <div key={key} className="flex h-full min-h-[94px] flex-col rounded-lg border border-[#e2e8f5] bg-[#f8fbff] p-2">
                          <p className="min-h-[24px] text-[11px] leading-[1.1] text-[#6f7f98]">{label}</p>
                          <p className="min-h-[34px] text-xl font-bold leading-tight text-[#173a73] sm:text-2xl lg:text-[22px] xl:text-2xl 2xl:text-3xl">72%</p>
                          <div className="mt-auto h-1.5 rounded-full bg-[#d6e2f7]">
                            <div className="h-full w-[72%] rounded-full bg-[#2e82ff]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    <div className="rounded-xl bg-white p-2.5">
                      <p className="text-xs font-semibold text-[#263d62]">Recent Activity</p>
                      <ul className="mt-1.5 space-y-1.5 text-[11px] text-[#4f668a]">
                        <li>Audit Readiness Checklist</li>
                        <li>Documentation Package</li>
                        <li>NIS2 Gap Analysis</li>
                      </ul>
                    </div>
                    <div className="rounded-xl bg-white p-2.5">
                      <p className="text-xs font-semibold text-[#263d62]">Top Domains</p>
                      <div className="mt-1.5 space-y-2 text-[11px] text-[#4f668a]">
                        <div>Governance</div>
                        <div>Risk Management</div>
                        <div>Access Control</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ProductSectionRenderer({ data }: { data: Record<string, any> }) {
  const products = data.products || [];

  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {data.title && <h2 className="text-3xl font-bold mb-8 text-center">{data.title}</h2>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product: any, idx: number) => (
            <div key={idx} className="border rounded-lg p-6 hover:shadow-lg transition">
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded mb-4"
                />
              )}
              <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
              <p className="text-gray-600 mb-4">{product.description}</p>
              {product.price && (
                <p className="text-2xl font-bold text-blue-600 mb-4">{product.price}</p>
              )}
              {product.category && (
                <span className="inline-block bg-gray-100 px-3 py-1 rounded text-sm">
                  {product.category}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSectionRenderer({ data }: { data: Record<string, any> }) {
  const items = data.items || [];

  return (
    <section className="py-12 px-4 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        {data.title && <h2 className="text-3xl font-bold mb-8 text-center">{data.title}</h2>}
        <div className="space-y-4">
          {items.map((item: any, idx: number) => (
            <FAQItem key={idx} question={item.question} answer={item.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = React.useState(false);

  return (
    <details
      className="border rounded-lg p-4 cursor-pointer"
      open={open}
      onClick={() => setOpen(!open)}
    >
      <summary className="font-medium flex justify-between items-center">
        {question}
        <span>{open ? '−' : '+'}</span>
      </summary>
      <p className="mt-3 text-gray-600">{answer}</p>
    </details>
  );
}

function UseCasesSectionRenderer({ data }: { data: Record<string, any> }) {
  const items = data.items || [];

  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {data.title && <h2 className="text-3xl font-bold mb-8 text-center">{data.title}</h2>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item: any, idx: number) => (
            <div key={idx} className="text-center">
              {item.icon && <div className="text-4xl mb-4">{item.icon}</div>}
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StepsSectionRenderer({ data }: { data: Record<string, any> }) {
  const items = data.items || [];

  return (
    <section className="py-12 px-4 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        {data.title && <h2 className="text-3xl font-bold mb-8 text-center">{data.title}</h2>}
        <div className="space-y-6">
          {items.map((item: any, idx: number) => (
            <div key={idx} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-semibold">
                  {item.number || idx + 1}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactInfoSectionRenderer({ data }: { data: Record<string, any> }) {
  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-2xl mx-auto text-center">
        {data.title && <h2 className="text-3xl font-bold mb-8">{data.title}</h2>}
        {data.email && (
          <p className="text-lg mb-2">
            <strong>Email:</strong>{' '}
            <a href={`mailto:${data.email}`} className="text-blue-600 hover:underline">
              {data.email}
            </a>
          </p>
        )}
        {data.phone && (
          <p className="text-lg mb-2">
            <strong>Phone:</strong> {data.phone}
          </p>
        )}
        {data.address && (
          <p className="text-lg mb-2">
            <strong>Address:</strong> {data.address}
          </p>
        )}
      </div>
    </section>
  );
}

function LegalSectionRenderer({ data }: { data: Record<string, any> }) {
  return (
    <section className="py-12 px-4 bg-white max-w-4xl mx-auto prose prose-sm">
      {data.content && <div dangerouslySetInnerHTML={{ __html: data.content }} />}
    </section>
  );
}

function StandardSectionRenderer({ data }: { data: Record<string, any> }) {
  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-4xl mx-auto prose">
        {data.content && <div dangerouslySetInnerHTML={{ __html: data.content }} />}
      </div>
    </section>
  );
}

// Enhanced section renderers for new section types

function CardsSectionRenderer({ data }: { data: Record<string, any> }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:px-8 md:py-12 lg:max-w-5xl lg:px-10 xl:max-w-6xl 2xl:max-w-[90rem]">
      <div className="grid gap-4 lg:grid-cols-2">
        {(data.cards || []).map((card: any, index: number) => (
          <article 
            key={index} 
            className="rounded-2xl border border-[#d7deeb] bg-white p-6 transition-shadow duration-300 ease-out motion-safe:animate-fade-in-up motion-safe:transition-transform motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-lg md:p-8"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start gap-4">
              {card.icon && (
                <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#2f7dff]">
                  {card.icon === 'users' && (
                    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden="true">
                      <circle cx="8" cy="10" r="3" stroke="currentColor" strokeWidth="1.8"></circle>
                      <circle cx="16.5" cy="8.5" r="2.5" stroke="currentColor" strokeWidth="1.8"></circle>
                      <path d="M4 19c0-2.6 2.1-4.7 4.7-4.7h1.1c2.6 0 4.7 2.1 4.7 4.7M13.3 18.5c.3-1.8 1.8-3.1 3.6-3.1h.9c1.3 0 2.4.6 3.1 1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"></path>
                    </svg>
                  )}
                  {card.icon === 'check' && (
                    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden="true">
                      <circle cx="12" cy="11" r="6" stroke="currentColor" strokeWidth="1.8"></circle>
                      <path d="m9.5 11.2 1.8 1.8 3.3-3.7M9 18.5l-1 2.5 4-1.3 4 1.3-1-2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  )}
                  {card.icon === 'lightbulb' && (
                    <svg viewBox="0 0 90 90" className="h-8 w-8 text-[#2f7dff]" fill="none" aria-hidden="true">
                      <path d="M 60.453 29.767 c -4.971 -4.454 -11.394 -6.499 -18.088 -5.76 c -11.024 1.218 -19.632 10.146 -20.469 21.229" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"></path>
                    </svg>
                  )}
                  {card.icon === 'target' && (
                    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden="true">
                      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8"></circle>
                      <circle cx="12" cy="12" r="4.6" stroke="currentColor" strokeWidth="1.8"></circle>
                      <circle cx="12" cy="12" r="1.3" fill="currentColor"></circle>
                      <path d="m12 12 4.8-4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"></path>
                    </svg>
                  )}
                </span>
              )}
              <div>
                <h3 className="text-2xl font-semibold text-[#1f2741] md:text-3xl">{card.title}</h3>
                {card.content && (
                  <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[#55627e] md:text-[15px] md:leading-relaxed">{card.content}</p>
                )}
                {card.points && (
                  <ul className="mt-3 space-y-2.5 text-sm leading-snug text-[#445675] md:text-[15px] md:leading-relaxed">
                    {card.points.map((point: string, i: number) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2f7dff] text-[10px] font-bold leading-none text-white">✓</span>
                        <span className="min-w-0">{point}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CTASectionRenderer({ data }: { data: Record<string, any> }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 md:px-8 md:pb-16 lg:max-w-5xl lg:px-10 xl:max-w-6xl 2xl:max-w-[90rem]">
      <div className="mt-8 rounded-2xl border border-[#264579] bg-[linear-gradient(120deg,#091229,#0b1a39_48%,#0e2348)] px-5 py-6 text-white motion-safe:animate-fade-in-up motion-safe:delay-150 sm:px-8 md:px-10 md:py-7">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex min-w-0 items-center gap-5">
            <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[#3a7ce2] bg-[#102a57] text-[#77aefc]">
              <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" aria-hidden="true">
                <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" stroke="currentColor" strokeWidth="1.8"></path>
              </svg>
            </span>
            <div className="min-w-0">
              {data.title && <p className="text-2xl font-semibold md:text-4xl">{data.title}</p>}
              {data.subtitle && <p className="mt-1 text-sm text-[#c7d8f8] md:text-base">{data.subtitle}</p>}
            </div>
          </div>
          <div className="ml-auto flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            {(data.buttons || []).map((button: any, index: number) => (
              <a
                key={index}
                href={button.url || '#'}
                className={`inline-flex min-w-[180px] items-center justify-center gap-2 whitespace-nowrap rounded-xl px-6 py-3 text-base font-semibold transition-colors duration-200 active:scale-[0.98] motion-safe:active:transition-transform md:text-lg ${
                  button.primary
                    ? 'border border-[#1f7bff] bg-[#1f7bff] hover:bg-[#2e87ff]'
                    : 'border border-[#456298] text-[#e5eeff] hover:bg-[#173160]'
                }`}
              >
                {button.text}
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
                  <path d="M4 10h10m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustSectionRenderer({ data }: { data: Record<string, any> }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 md:px-8 md:pb-16 lg:max-w-5xl lg:px-10 xl:max-w-6xl 2xl:max-w-[90rem]">
      {data.title && (
        <h3 className="text-center text-3xl font-semibold text-[#202743] motion-safe:animate-fade-in-up md:text-4xl">
          {data.title}
        </h3>
      )}
      {data.subtitle && (
        <p className="mt-2 text-center text-base text-[#6f7893] motion-safe:animate-fade-in-up motion-safe:delay-75 md:text-lg">
          {data.subtitle}
        </p>
      )}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(data.cards || []).map((card: any, index: number) => (
          <article 
            key={index} 
            className="rounded-2xl border border-[#d7deeb] bg-white p-5 transition-shadow duration-300 ease-out motion-safe:animate-fade-in-up motion-safe:transition-transform motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-md"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {card.icon && (
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#eef2ff] text-[#2f7dff]">
                {card.icon === 'document' && (
                  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden="true">
                    <rect x="6" y="4" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.8"></rect>
                    <path d="M9 9h6M9 13h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"></path>
                  </svg>
                )}
                {card.icon === 'graduation' && (
                  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden="true">
                    <path d="m4 9 8-5 8 5-8 5-8-5Zm3 2.5v4.5c0 1.6 2.2 3 5 3s5-1.4 5-3v-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"></path>
                  </svg>
                )}
                {card.icon === 'shield' && (
                  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden="true">
                    <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" stroke="currentColor" strokeWidth="1.8"></path>
                  </svg>
                )}
                {card.icon === 'handshake' && (
                  <svg viewBox="0 0 90 90" className="h-7 w-7 text-[#2f7dff]" fill="none" aria-hidden="true">
                    <path d="M 89.689 16.621 c -0.198 -0.188 -0.461 -0.284 -0.739 -0.274 c -6.479 0.321 -13.518 1.398 -22.148 3.389" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"></path>
                  </svg>
                )}
              </span>
            )}
            <h4 className="mt-3 text-xl font-semibold text-[#1f2741] md:text-2xl">{card.title}</h4>
            <p className="mt-2 text-sm leading-6 text-[#55627e] md:text-[15px] md:leading-relaxed">{card.content}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function HowItWorksSectionRenderer({ data }: { data: Record<string, any> }) {
  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        {data.title && <h2 className="text-3xl font-bold mb-4 text-center">{data.title}</h2>}
        {data.subtitle && <p className="text-lg text-gray-600 mb-8 text-center">{data.subtitle}</p>}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {(data.steps || []).map((step: any, index: number) => (
            <div key={index} className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-600 text-white font-bold text-lg mb-4">
                {step.number || index + 1}
              </div>
              <h3 className="font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DocumentationGridRenderer({ data }: { data: Record<string, any> }) {
  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {data.title && <h2 className="text-3xl font-bold mb-4">{data.title}</h2>}
        {data.subtitle && <p className="text-lg text-gray-600 mb-8">{data.subtitle}</p>}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(data.documents || []).map((doc: any, index: number) => (
            <div key={index} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="font-semibold mb-2">{doc.name}</h3>
              <p className="text-gray-600 mb-4">{doc.subtitle}</p>
              <div className="flex justify-between items-center">
                <span className="text-blue-600 font-semibold">{doc.price}</span>
                {doc.badge && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    {doc.badge}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BundlesSectionRenderer({ data }: { data: Record<string, any> }) {
  return (
    <section className="py-12 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {data.title && <h2 className="text-3xl font-bold mb-4 text-center">{data.title}</h2>}
        {data.subtitle && <p className="text-lg text-gray-600 mb-8 text-center">{data.subtitle}</p>}
        <div className="grid gap-6 md:grid-cols-3">
          {(data.bundles || []).map((bundle: any, index: number) => (
            <div key={index} className={`border rounded-lg p-6 ${bundle.badge ? 'ring-2 ring-blue-500' : ''}`}>
              {bundle.badge && (
                <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded text-center mb-4">
                  {bundle.badge}
                </div>
              )}
              <h3 className="font-bold text-lg mb-2">{bundle.title}</h3>
              <p className="text-gray-600 mb-4">{bundle.subtitle}</p>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-blue-600">{bundle.price}</div>
                {bundle.originalPrice && (
                  <div className="text-gray-500 line-through">{bundle.originalPrice}</div>
                )}
                {bundle.save && (
                  <div className="text-green-600 font-semibold">{bundle.save}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyChooseSectionRenderer({ data }: { data: Record<string, any> }) {
  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        {data.title && <h2 className="text-3xl font-bold mb-8 text-center">{data.title}</h2>}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(data.points || []).map((point: string, index: number) => (
            <div key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="h-6 w-6 rounded-full bg-green-600 text-white flex items-center justify-center text-sm">
                  ✓
                </div>
              </div>
              <p className="text-gray-700">{point}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
