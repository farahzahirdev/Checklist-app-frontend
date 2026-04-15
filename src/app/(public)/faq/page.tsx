'use client';

import { useState } from 'react';
import { PublicFooter } from '@/components/public-footer';
import heroBackground from '@/assets/cybersecurity-background-59ognpsy7izka4l9.png';

const faqs = [
  {
    q: 'When does my 7-day window begin?',
    a: 'The 7-day completion window starts only when you click Start Assessment, not immediately after payment.',
  },
  {
    q: 'Is evidence upload mandatory?',
    a: 'No. Uploads are optional, but recommended to support auditor review and report quality.',
  },
  {
    q: 'How is access unlocked after payment?',
    a: 'Access is unlocked automatically after Stripe webhook confirmation is processed by the backend.',
  },
  {
    q: 'Which roles are supported?',
    a: 'The platform supports admin/operator, read-only auditor, and customer roles.',
  },
  {
    q: 'Can I save progress and continue later?',
    a: 'Yes. Your assessment progress is saved so you can continue within your active access window.',
  },
  {
    q: 'How do I get my final report?',
    a: 'After completing the checklist, your report is available in the Reports area for download and sharing.',
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number>(0);

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
        <div className="relative mx-auto flex min-h-[560px] max-w-[1440px] flex-col justify-center px-4 py-12 sm:px-6 md:px-6 md:py-16">
          <p className="inline-flex self-start rounded-full border border-[#255da8] bg-[#12366c] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#9ac3ff] motion-safe:animate-fade-in motion-safe:delay-75">
            Help center
          </p>
          <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-tight text-white motion-safe:animate-fade-in-up motion-safe:delay-100 sm:text-6xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[#c7d8f8] motion-safe:animate-fade-in-up motion-safe:delay-200">
            Everything you need to know about access, assessments, reports, and platform security.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 md:px-6 md:py-14">
        <div className="rounded-2xl border border-[#dce5f2] bg-[#edf2fa] p-5 transition-shadow duration-300 motion-safe:animate-fade-in-up motion-safe:hover:shadow-md sm:p-6">
          <h2 className="text-3xl font-semibold text-[#1a2440]">Quick Answers</h2>
          <p className="mt-2 text-sm text-[#5e7293]">Click a question to expand details.</p>
          <div className="mt-6 space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <article key={faq.q} className="overflow-hidden rounded-xl border border-[#d7deeb] bg-white transition-shadow duration-300 motion-safe:hover:shadow-sm">
                  <button
                    type="button"
                    onClick={() => setOpenIndex((current) => (current === index ? -1 : index))}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <h3 className="text-lg font-semibold text-[#1f2741]">{faq.q}</h3>
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-sm transition ${
                        isOpen
                          ? 'border-[#3b7df0] bg-[#eaf1ff] text-[#2f6ee0]'
                          : 'border-[#d7deeb] bg-[#f7f9ff] text-[#7a8ca8]'
                      }`}
                    >
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="border-t border-[#e6ecf7] px-6 py-5">
                        <p className="max-w-5xl text-[#56617f]">{faq.a}</p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-10 sm:px-6 md:px-6 md:pb-14">
        <article className="rounded-2xl border border-[#17489b] bg-[linear-gradient(90deg,#0b2f73,#0e3f9d)] p-5 text-white transition-shadow duration-300 motion-safe:animate-fade-in-up motion-safe:hover:shadow-[0_18px_34px_rgba(17,62,148,0.28)] md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-3xl font-semibold">Still have questions?</h3>
              <p className="mt-1 text-sm text-[#d2e2ff]">Reach out and we&apos;ll help you get the answers you need.</p>
            </div>
            <a
              href="/contact"
              className="rounded-xl border border-white/35 bg-white px-5 py-2.5 font-semibold text-[#123e8b] transition-colors duration-200 hover:bg-[#e9f1ff] active:scale-[0.98] motion-safe:active:transition-transform"
            >
              Contact Us
            </a>
          </div>
        </article>
      </section>
      <PublicFooter />
    </main>
  );
}
