'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';
import neonNetworkBg from '@/assets/Neon-Network-Overlay.jpg';

export function WorkspaceSummaryStatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="flex min-w-0 flex-1 gap-3 rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-[0_12px_40px_rgba(15,23,42,0.1)] sm:p-5">
      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eff6ff] text-[#0066ff]">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-[#64748b]">{label}</p>
        <p className="mt-0.5 text-2xl font-bold leading-none text-[#0f172a]">{value}</p>
        <p className="mt-1 text-xs text-[#64748b]">{hint}</p>
      </div>
    </div>
  );
}

export function CustomerAuditWorkspaceHero({
  kicker,
  title,
  subtitle,
  stats,
}: {
  kicker: string;
  title: string;
  subtitle: string;
  stats: ReactNode;
}) {
  return (
    <header className="relative w-full overflow-hidden pb-14 sm:pb-16">
      <Image src={neonNetworkBg} alt="" fill priority className="object-cover" sizes="100vw" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(4,12,32,0.94)_0%,rgba(8,24,56,0.82)_50%,rgba(12,40,88,0.55)_100%)]" />
      <div
        className="pointer-events-none absolute right-8 top-1/2 hidden -translate-y-1/2 opacity-40 lg:block"
        aria-hidden="true"
      >
        <div className="relative h-48 w-48 xl:h-56 xl:w-56">
          <div className="absolute inset-0 rounded-full bg-[#0066ff]/20 blur-3xl" />
          <svg viewBox="0 0 120 120" className="relative h-full w-full text-[#3b82f6]" fill="none">
            <path d="M60 8 20 24v28c0 26.5 17 50.4 40 56 23-5.6 40-29.5 40-56V24L60 8Z" stroke="currentColor" strokeWidth="2" />
            <path d="m44 58 12 12 22-26" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="relative w-full px-5 pt-8 sm:px-6 sm:pt-10 lg:px-8 xl:px-10">
        <div className="min-w-0 max-w-3xl xl:pr-56">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7eb8ff]">{kicker}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.5rem]">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#c8daf5] sm:text-base">{subtitle}</p>
        </div>
        <div className="relative z-10 mt-8 mb-[-2.75rem] grid w-full gap-3 sm:mb-[-3.25rem] sm:grid-cols-2 xl:grid-cols-4">
          {stats}
        </div>
      </div>
    </header>
  );
}
