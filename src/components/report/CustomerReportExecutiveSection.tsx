'use client';

import Link from 'next/link';
import type { Route } from 'next';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import type { CustomerReportDataResponse, CustomerReportDomainDatum, CustomerReportSummary } from '@/lib/reports';
import { customerReportOverallPercentage, sectionScoreDisplayName } from '@/lib/reports';
import { getSeverityColor, getSeverityLabel } from '@/components/report/report-dashboard';

function formatReportDate(value: string | null | undefined) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString(undefined, { dateStyle: 'long' });
}

function emailDomain(email: string) {
  const i = email.indexOf('@');
  return i >= 0 ? email.slice(i + 1) : email;
}

function maturityWordFromPct(pct: number) {
  if (pct >= 80) return 'Established';
  if (pct >= 60) return 'Developing';
  if (pct >= 40) return 'Emerging';
  return 'Early';
}

function reportDisplayId(report: CustomerReportSummary) {
  const code = report.report_code?.trim();
  if (code) return code;
  return `RPT-${report.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
}

function domainDatumLabel(d: CustomerReportDomainDatum, index: number): string {
  const raw =
    d.title ??
    d.domain ??
    d.name ??
    d.section_title ??
    d.chapter_title ??
    d.report_domain;
  const s = raw != null ? String(raw).trim() : '';
  return s || `Domain ${index + 1}`;
}

function domainDatumPct(d: CustomerReportDomainDatum): number {
  const v = d.percentage ?? d.score_pct ?? d.pct ?? d.score_percentage;
  if (typeof v === 'number' && Number.isFinite(v)) return Math.round(Math.min(100, Math.max(0, v)));
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number.parseFloat(v);
    if (Number.isFinite(n)) return Math.round(Math.min(100, Math.max(0, n)));
  }
  const score = d.score;
  const max = d.max_score;
  if (typeof score === 'number' && typeof max === 'number' && max > 0) {
    return Math.round(Math.min(100, Math.max(0, (score / max) * 100)));
  }
  return 0;
}

function companyWebsiteHref(raw: string | null | undefined): string | null {
  const w = raw?.trim();
  if (!w) return null;
  if (/^https?:\/\//i.test(w)) return w;
  return `https://${w}`;
}

function JumpLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="mt-4 inline-flex text-sm font-semibold text-[#0066ff] hover:underline scroll-mt-24">
      {children}
    </a>
  );
}

function ShieldLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 36" fill="none" aria-hidden>
      <defs>
        <linearGradient id="custExecShield" x1="6" y1="4" x2="28" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60a5fa" />
          <stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <path
        d="M16 2 30 8v12c0 9-6 17-14 20C4 37-2 29-2 20V8L16 2Z"
        fill="url(#custExecShield)"
        stroke="white"
        strokeOpacity="0.35"
        strokeWidth="1.2"
      />
      <path d="M16 12v10m0 0 4-4m-4 4-4-4" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MaturityRing({ percent, label }: { percent: number; label: string }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, percent) / 100) * c;
  return (
    <div className="flex flex-col items-center py-1">
      <div className="relative h-[132px] w-[132px]">
        <svg className="-rotate-90" width="132" height="132" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="#e8edf5" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="#0066ff"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
          <span className="text-2xl font-bold tabular-nums text-[#0f172a]">{Math.round(percent)}%</span>
          <span className="text-sm font-semibold text-[#0066ff]">{label}</span>
        </div>
      </div>
    </div>
  );
}

function shortLabel(text: string, max = 14) {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function readOptionalTargetPct(row: unknown): number | null {
  if (!row || typeof row !== 'object') return null;
  const o = row as Record<string, unknown>;
  const raw = o.target_percentage ?? o.target_pct ?? o.target_score_pct;
  if (typeof raw === 'number' && Number.isFinite(raw)) return Math.min(100, Math.max(0, Math.round(raw)));
  if (typeof raw === 'string' && raw.trim() !== '') {
    const n = Number.parseFloat(raw);
    if (Number.isFinite(n)) return Math.min(100, Math.max(0, Math.round(n)));
  }
  return null;
}

function DynamicRadarChart({
  labels,
  values,
  targetValues,
}: {
  labels: string[];
  values: number[];
  targetValues?: number[] | null;
}) {
  const cx = 150;
  const cy = 150;
  const rMax = 95;
  const n = labels.length;
  const toPoint = (value: number, i: number) => {
    const angle = (-Math.PI / 2 + (2 * Math.PI * i) / n) as number;
    const rad = rMax * (Math.min(100, Math.max(0, value)) / 100);
    return [cx + rad * Math.cos(angle), cy + rad * Math.sin(angle)] as const;
  };
  const curPts = values.map((v, i) => toPoint(v, i));
  const curPoly = curPts.map(([x, y]) => `${x},${y}`).join(' ');
  const tgt =
    Array.isArray(targetValues) && targetValues.length === n
      ? targetValues.map((v, i) => toPoint(v, i))
      : null;
  const tgtPoly = tgt ? tgt.map(([x, y]) => `${x},${y}`).join(' ') : '';
  const gridLevels = [25, 50, 75, 100];

  return (
    <div className="flex w-full max-w-[280px] flex-col items-center">
    <svg viewBox="0 0 300 300" className="h-auto w-full max-w-[280px]" aria-label="Score overview by area">
      {gridLevels.map((lvl) => {
        const ring = labels.map((_, i) => {
          const angle = (-Math.PI / 2 + (2 * Math.PI * i) / n) as number;
          const rad = rMax * (lvl / 100);
          return [cx + rad * Math.cos(angle), cy + rad * Math.sin(angle)] as const;
        });
        const d = `M ${ring.map(([x, y]) => `${x} ${y}`).join(' L ')} Z`;
        return <path key={lvl} d={d} fill="none" stroke="#e2e8f0" strokeWidth="1" />;
      })}
      {labels.map((label, i) => {
        const angle = (-Math.PI / 2 + (2 * Math.PI * i) / n) as number;
        const x1 = cx + 28 * Math.cos(angle);
        const y1 = cy + 28 * Math.sin(angle);
        const x2 = cx + rMax * Math.cos(angle);
        const y2 = cy + rMax * Math.sin(angle);
        const tx = cx + (rMax + 18) * Math.cos(angle);
        const ty = cy + (rMax + 18) * Math.sin(angle);
        return (
          <g key={`${label}-${i}`}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#e8edf5" strokeWidth="1" />
            <text
              x={tx}
              y={ty}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-[#64748b] text-[9px] font-medium"
              style={{ fontSize: '9px' }}
            >
              {shortLabel(label, 12)}
            </text>
          </g>
        );
      })}
      {tgt ? (
        <polygon points={tgtPoly} fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="6 4" opacity={0.88} />
      ) : null}
      <polygon points={curPoly} fill="rgba(0,102,255,0.12)" stroke="#0066ff" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-[0.65rem] font-semibold text-[#64748b]">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-4 rounded-sm bg-[#0066ff]/80" aria-hidden />
          Current
        </span>
        {tgt ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-4 border-t-2 border-dashed border-emerald-500" aria-hidden />
            Target
          </span>
        ) : (
          <span className="text-center text-[#94a3b8]">Target when API includes target scores</span>
        )}
      </div>
    </div>
  );
}

function RiskShield({ variant }: { variant: 'high' | 'medium' | 'low' }) {
  const stroke = variant === 'high' ? '#dc2626' : variant === 'medium' ? '#ea580c' : '#16a34a';
  const fill = variant === 'high' ? '#fef2f2' : variant === 'medium' ? '#fff7ed' : '#f0fdf4';
  return (
    <svg width="36" height="40" viewBox="0 0 40 44" fill="none" aria-hidden>
      <path d="M20 2 36 8v14c0 10-7 18-16 20-9-2-16-10-16-20V8L20 2Z" fill={fill} stroke={stroke} strokeWidth="1.6" />
      {variant === 'low' ? (
        <path d="M14 22l4 4 8-8" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      ) : (
        <path d="M20 14v10M20 28h.01" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      )}
    </svg>
  );
}

export function CustomerReportExecutiveSection({
  data,
  report,
}: {
  data: CustomerReportDataResponse;
  report: CustomerReportSummary;
}) {
  const overallPct = customerReportOverallPercentage(data);
  const maturityLabel = maturityWordFromPct(overallPct);
  const severity = getSeverityColor(overallPct);

  const companyName = data.company_name ?? report.company_name ?? data.customer_name;
  const companyWebsite = data.company_website ?? report.company_website;

  const workflowUi = useMemo(() => {
    const map: Record<CustomerReportSummary['status'], { label: string; className: string }> = {
      draft_generated: { label: 'Draft', className: 'bg-[#fff4df] text-[#b45309]' },
      under_review: { label: 'Under review', className: 'bg-[#dbeafe] text-[#1d4ed8]' },
      changes_requested: { label: 'Changes requested', className: 'bg-[#ffedd5] text-[#c2410c]' },
      approved: { label: 'Approved', className: 'bg-[#dcfce7] text-[#15803d]' },
      published: { label: 'Published', className: 'bg-[#dcfce7] text-[#15803d]' },
    };
    return map[report.status];
  }, [report.status]);

  const priorityCounts = useMemo(() => {
    const high = data.findings.filter((f) => f.priority === 'high').length;
    const medium = data.findings.filter((f) => f.priority === 'medium').length;
    const low = data.findings.filter((f) => f.priority === 'low').length;
    return { high, medium, low };
  }, [data.findings]);

  const topByPriority = useMemo(() => {
    const pick = (p: 'high' | 'medium' | 'low', prefix: string, n: number) =>
      data.findings
        .filter((f) => f.priority === p)
        .slice(0, n)
        .map((f, i) => ({
          code: `${prefix}-${String(i + 1).padStart(2, '0')}`,
          title: f.question_text.length > 52 ? `${f.question_text.slice(0, 50)}…` : f.question_text,
        }));
    return {
      high: pick('high', 'H', 3),
      medium: pick('medium', 'M', 3),
      low: pick('low', 'L', 3),
    };
  }, [data.findings]);

  const radarSeries = useMemo(() => {
    const targetsFromRows = (rows: unknown[], n: number): number[] | null => {
      const slice = rows.slice(0, n);
      const mapped = slice.map((row) => readOptionalTargetPct(row));
      if (mapped.length !== n || mapped.some((x) => x === null)) return null;
      return mapped as number[];
    };

    const fromSections = data.section_scores.slice(0, 10).map((s) => ({
      label: sectionScoreDisplayName(s),
      pct: Math.round(s.percentage),
    }));
    if (fromSections.length >= 2) {
      const labels = fromSections.map((x) => x.label);
      const values = fromSections.map((x) => x.pct);
      const targetValues = targetsFromRows(data.section_scores, labels.length);
      return { labels, values, targetValues };
    }
    const dd = data.domain_data;
    if (Array.isArray(dd) && dd.length >= 2) {
      const rows = dd.slice(0, 10).map((d, i) => ({
        label: domainDatumLabel(d, i),
        pct: domainDatumPct(d),
      }));
      const labels = rows.map((x) => x.label);
      const values = rows.map((x) => x.pct);
      const targetValues = targetsFromRows(dd, labels.length);
      return { labels, values, targetValues };
    }
    const chapters = data.chapter_data.slice(0, 10).map((ch) => ({
      label: ch.title,
      pct: Math.round(ch.percentage),
    }));
    if (chapters.length >= 2) {
      const labels = chapters.map((x) => x.label);
      const values = chapters.map((x) => x.pct);
      const targetValues = targetsFromRows(data.chapter_data, labels.length);
      return { labels, values, targetValues };
    }
    return null;
  }, [data.section_scores, data.domain_data, data.chapter_data]);

  const domainRows = useMemo(() => {
    const vs = '—' as const;
    const dd = data.domain_data;
    if (Array.isArray(dd) && dd.length) {
      return dd.slice(0, 12).map((d, i) => ({
        title: domainDatumLabel(d, i),
        pct: domainDatumPct(d),
        vsLast: vs,
      }));
    }
    const chapters = data.chapter_data;
    if (chapters.length) {
      return chapters.map((ch) => ({
        title: ch.title,
        pct: Math.round(ch.percentage),
        vsLast: vs,
      }));
    }
    return data.section_scores.map((s) => ({
      title: sectionScoreDisplayName(s),
      pct: Math.round(s.percentage),
      vsLast: vs,
    }));
  }, [data.domain_data, data.chapter_data, data.section_scores]);

  const frameworkBullets = useMemo(() => {
    if (data.chapter_data.length) {
      return data.chapter_data.slice(0, 6).map((ch) => ch.title);
    }
    return [data.checklist_title];
  }, [data.chapter_data, data.checklist_title]);

  const bannerBody = useMemo(() => {
    const parts: string[] = [];
    parts.push(
      `This view reflects your results for ${data.checklist_title}. Overall maturity is about ${Math.round(overallPct)}% of the maximum checklist score.`,
    );
    parts.push(`Checklist completion is ${Math.round(data.completion_percentage)}%.`);
    if (data.findings.length) {
      parts.push(`The assessment recorded ${data.findings.length} finding${data.findings.length === 1 ? '' : 's'} for follow-up.`);
    } else {
      parts.push('No formal findings were recorded for this assessment.');
    }
    return parts.join(' ');
  }, [data.checklist_title, data.completion_percentage, data.findings.length, overallPct]);

  const questionBreakdown = useMemo(() => {
    /** Prefer explicit counts — `question_score_distribution` is score bands, not answered vs partial. */
    const total = data.total_questions;
    const answered = data.answered_questions;
    if (typeof total === 'number' && total > 0 && typeof answered === 'number') {
      const unanswered = Math.max(0, total - answered);
      const answeredPct = Math.round((answered / total) * 100);
      const unansweredPct = Math.round((unanswered / total) * 100);
      return {
        mode: 'totals' as const,
        total,
        answered,
        unanswered,
        answeredPct,
        unansweredPct,
      };
    }

    const dist = data.question_score_distribution;
    if (Array.isArray(dist) && dist.length > 0) {
      return { mode: 'distribution' as const, dist };
    }

    return {
      mode: 'completion_only' as const,
      completion: Math.round(data.completion_percentage),
    };
  }, [data.question_score_distribution, data.total_questions, data.answered_questions, data.completion_percentage]);

  const highlights = useMemo(() => {
    const labelFor = (tone: 'strong' | 'attention' | 'progress') => {
      if (tone === 'strong') return 'Strong';
      if (tone === 'attention') return 'Needs attention';
      return 'Good progress';
    };
    const fromSummaries = data.section_summaries.slice(0, 3).map((s) => ({
      tone: 'progress' as const,
      label: labelFor('progress'),
      text: s.summary_text.length > 160 ? `${s.summary_text.slice(0, 158)}…` : s.summary_text,
    }));
    if (fromSummaries.length) return fromSummaries;

    const strong = data.section_scores.filter((s) => s.percentage >= 75).slice(0, 2);
    const weak = data.section_scores.filter((s) => s.percentage < 60).slice(0, 1);
    const built: { tone: 'strong' | 'attention' | 'progress'; label: string; text: string }[] = [];
    for (const s of strong) {
      built.push({
        tone: 'strong',
        label: labelFor('strong'),
        text: `${sectionScoreDisplayName(s)} is performing well (${Math.round(s.percentage)}%).`,
      });
    }
    for (const s of weak) {
      built.push({
        tone: 'attention',
        label: labelFor('attention'),
        text: `${sectionScoreDisplayName(s)} may need attention (${Math.round(s.percentage)}%).`,
      });
    }
    if (built.length) return built.slice(0, 3);
    return [
      {
        tone: 'progress' as const,
        label: labelFor('progress'),
        text: 'Review section scores and findings below for a full picture of control maturity.',
      },
    ];
  }, [data.section_summaries, data.section_scores]);

  const whatsNext = useMemo(() => {
    const fromSuggestions = data.public_suggestions
      .map((s) => s.suggestion_text.trim())
      .filter(Boolean)
      .slice(0, 5);
    if (fromSuggestions.length) return fromSuggestions;
    const steps: string[] = [];
    if (data.findings.length) {
      steps.push('Review prioritized findings with owners and agree remediation timelines.');
    }
    steps.push('Share this report with stakeholders responsible for the assessed controls.');
    steps.push('Track improvements and plan a follow-up assessment when remediation work is done.');
    return steps;
  }, [data.public_suggestions, data.findings.length]);

  const findingDomain = (f: (typeof data.findings)[0]) => f.report_domain?.trim() || 'General';

  const recommendationsHref = data.public_suggestions.length > 0 ? '#report-suggestions' : '#detailed-findings';

  return (
    <div className="overflow-hidden rounded-2xl border border-[#c9d6ee] bg-[#eef2f9] shadow-[0_8px_40px_-16px_rgba(15,23,42,0.15)]">
      <div className="flex flex-col lg:flex-row lg:items-stretch">
        <aside className="flex w-full flex-col justify-between bg-[linear-gradient(180deg,#050f24_0%,#0a1a3d_55%,#0d2149_100%)] px-4 py-5 text-white sm:px-5 lg:max-w-[min(100%,260px)] lg:shrink-0 lg:border-r lg:border-white/10">
          <div>
            <h1 className="text-xl font-semibold leading-tight tracking-tight sm:text-2xl">Executive summary</h1>
            <p className="mt-1 text-[0.65rem] font-medium uppercase tracking-[0.12em] text-[#8fb0e6]">Security report</p>

            <dl className="mt-5 space-y-3.5 text-sm">
              <div className="flex gap-2.5">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#93c5fd]" aria-hidden>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M4 20V10M4 10l6-4 6 4 6-4v10" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10 10v10M14 10v10" strokeLinecap="round" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <dt className="text-[0.6rem] font-semibold uppercase tracking-wide text-[#8fb0e6]">Company</dt>
                  <dd className="mt-0.5 font-semibold text-white">{companyName}</dd>
                  <dd className="text-xs text-[#b8cce8]">
                    {companyWebsite ? (
                      (() => {
                        const href = companyWebsiteHref(companyWebsite);
                        return href ? (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="break-all text-[#bfdbfe] underline decoration-white/30 underline-offset-2 hover:text-white"
                          >
                            {companyWebsite}
                          </a>
                        ) : (
                          <span className="break-all">{companyWebsite}</span>
                        );
                      })()
                    ) : (
                      <span>({emailDomain(data.customer_email)})</span>
                    )}
                  </dd>
                </div>
              </div>
              <div className="flex gap-2.5">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#93c5fd]" aria-hidden>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path d="M8 3v4M16 3v4M3 11h18" strokeLinecap="round" />
                  </svg>
                </span>
                <div>
                  <dt className="text-[0.6rem] font-semibold uppercase tracking-wide text-[#8fb0e6]">Date</dt>
                  <dd className="mt-0.5 font-semibold">{formatReportDate(data.assessment_date)}</dd>
                </div>
              </div>
              <div className="flex gap-2.5">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#93c5fd]" aria-hidden>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M4 7h16v10H4z" strokeLinejoin="round" />
                    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <dt className="text-[0.6rem] font-semibold uppercase tracking-wide text-[#8fb0e6]">Report ID</dt>
                  <dd className="mt-0.5 break-all font-mono text-xs font-semibold tracking-wide text-[#e0ecff]">
                    {reportDisplayId(report)}
                  </dd>
                </div>
              </div>
            </dl>
          </div>

          <div className="mt-6 flex gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-[0.7rem] leading-snug text-[#c7d9f5] lg:mt-8">
            <svg viewBox="0 0 24 24" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#93c5fd]" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <path d="M12 3l8 4v5c0 5-3.5 9.5-8 11-4.5-1.5-8-6-8-11V7l8-4Z" strokeLinejoin="round" />
              <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p>Confidential — internal use only.</p>
          </div>
        </aside>

        <div className="min-w-0 flex-1 bg-[#f4f7fc] p-3 sm:p-4 md:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <Link href={'/reports' as Route} className="text-sm font-semibold text-[#0066ff] hover:underline">
              ← Back to reports
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${workflowUi.className}`}>{workflowUi.label}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${severity.badge}`}>
                {getSeverityLabel(overallPct)}
              </span>
            </div>
          </div>

          <div className="flex gap-3 rounded-xl border border-[#bfdbfe] bg-[#e8f2ff] px-3 py-3 sm:px-4 sm:py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#0066ff] shadow-sm" aria-hidden>
              <ShieldLogo className="h-7 w-7" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold leading-snug text-[#0f172a] sm:text-lg">
                Your security. Clear insights. Confident next steps.
              </h2>
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-[#64748b]">
                {data.checklist_title}
              </p>
              <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-[#475569] sm:text-[0.9375rem]">{bannerBody}</p>
            </div>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-sm sm:p-5">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#64748b]">Maturity score</p>
              <MaturityRing percent={overallPct} label={maturityLabel} />
              <p className="mt-2 text-center text-xs text-[#64748b]">Prior assessment comparison is not included in this report.</p>
              <p className="mt-1 text-center text-sm font-semibold text-[#334155]">
                Checklist completion {Math.round(data.completion_percentage)}%
              </p>
            </article>
            <article className="rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-sm sm:p-5">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#64748b]">Top priorities</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="flex justify-between font-semibold text-[#b91c1c]">
                  <span>{priorityCounts.high}</span> High
                </li>
                <li className="flex justify-between font-semibold text-[#c2410c]">
                  <span>{priorityCounts.medium}</span> Medium
                </li>
                <li className="flex justify-between font-semibold text-[#15803d]">
                  <span>{priorityCounts.low}</span> Low
                </li>
              </ul>
              <JumpLink href="#detailed-findings">See details →</JumpLink>
            </article>
            <article className="rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-sm sm:p-5">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#64748b]">Total questions</p>
              {questionBreakdown.mode === 'distribution' ? (
                <>
                  <p className="mt-2 text-xs font-semibold text-[#64748b]">Score distribution</p>
                  <ul className="mt-2 space-y-1.5 text-sm text-[#475569]">
                    {questionBreakdown.dist.map((row, idx) => (
                      <li key={`${row.score}-${idx}`} className="flex justify-between">
                        <span>Score {row.score}</span>
                        <span className="font-semibold text-[#0f172a]">
                          {row.count}{' '}
                          <span className="font-normal text-[#64748b]">({Math.round(row.percentage)}%)</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : questionBreakdown.mode === 'totals' ? (
                <>
                  <p className="mt-2 text-3xl font-bold tabular-nums text-[#0f172a]">{questionBreakdown.total}</p>
                  <ul className="mt-3 space-y-1.5 text-sm text-[#475569]">
                    <li className="flex justify-between">
                      <span>Answered</span>
                      <span className="font-semibold text-[#0f172a]">
                        {questionBreakdown.answered}{' '}
                        <span className="font-normal text-[#64748b]">({questionBreakdown.answeredPct}%)</span>
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span>Unanswered</span>
                      <span className="font-semibold text-[#0f172a]">
                        {questionBreakdown.unanswered}{' '}
                        <span className="font-normal text-[#64748b]">({questionBreakdown.unansweredPct}%)</span>
                      </span>
                    </li>
                  </ul>
                </>
              ) : (
                <>
                  <p className="mt-2 text-3xl font-bold tabular-nums text-[#0f172a]">{questionBreakdown.completion}%</p>
                  <p className="mt-2 text-sm text-[#475569]">Checklist completion (per-question counts not provided for this report).</p>
                </>
              )}
              <JumpLink href="#detailed-findings">See details →</JumpLink>
            </article>
            <article id="framework-areas" className="rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-sm sm:p-5 scroll-mt-24">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#64748b]">Standards covered</p>
              <ul className="mt-3 space-y-2">
                {frameworkBullets.map((title, idx) => (
                  <li key={`${title}-${idx}`} className="flex items-center gap-2 text-sm font-medium text-[#0f172a]">
                    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#dcfce7] text-[#16a34a]">
                      <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M3 8.5 6.5 12 13 5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="leading-snug">{title}</span>
                  </li>
                ))}
              </ul>
              {data.standard_covered_all != null ? (
                <p className="mt-3 text-xs text-[#64748b]">
                  <span className="font-semibold text-[#475569]">All standards covered:</span>{' '}
                  {data.standard_covered_all ? 'Yes' : 'No'}
                </p>
              ) : null}
              <JumpLink href="#maturity-overview">See mapping →</JumpLink>
            </article>
          </div>
        </div>
      </div>

      <div className="border-t border-[#dce5f2] bg-[#f4f7fc] px-3 py-4 sm:px-5 md:px-6">
        <div className="space-y-4">
          <article id="maturity-overview" className="rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-sm sm:p-5 scroll-mt-24">
            <h3 className="text-lg font-semibold text-[#0f172a]">Maturity overview</h3>
            <p className="mt-1 text-sm text-[#64748b]">
              Current performance across assessment areas. “vs last” is shown only when a prior assessment exists in your data (otherwise —).
            </p>
            <div className="mt-4 flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-between">
              {radarSeries ? (
                <DynamicRadarChart
                  labels={radarSeries.labels}
                  values={radarSeries.values}
                  targetValues={radarSeries.targetValues}
                />
              ) : (
                <p className="max-w-xs text-center text-sm text-[#64748b]">
                  Add at least two scored areas (sections, chapters, or domains) to show a radar chart.
                </p>
              )}
              <div className="w-full min-w-0 flex-1 overflow-x-auto">
                <table className="w-full min-w-[280px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#e8edf5] text-[0.65rem] font-semibold uppercase tracking-wide text-[#64748b]">
                      <th className="pb-2 pr-2">Domain</th>
                      <th className="pb-2 pr-2">Score</th>
                      <th className="pb-2">vs last</th>
                    </tr>
                  </thead>
                  <tbody>
                    {domainRows.length ? (
                      domainRows.map((row, idx) => {
                        const barColor =
                          row.pct >= 80 ? 'bg-emerald-500' : row.pct >= 60 ? 'bg-[#0066ff]' : row.pct >= 45 ? 'bg-amber-500' : 'bg-red-500';
                        return (
                          <tr key={`${row.title}-${idx}`} className="border-b border-[#f1f5f9] last:border-0">
                            <td className="py-2.5 pr-2 font-medium text-[#0f172a]">{row.title}</td>
                            <td className="py-2.5 pr-2">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-20 overflow-hidden rounded-full bg-[#eef2f9]">
                                  <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(row.pct, 100)}%` }} />
                                </div>
                                <span className="tabular-nums font-semibold text-[#0f172a]">{row.pct}%</span>
                              </div>
                            </td>
                            <td className="py-2.5 text-xs font-semibold text-[#64748b]" title="No prior assessment in payload">
                              {row.vsLast}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={3} className="py-4 text-sm text-[#64748b]">
                          No domain or chapter breakdown in this report yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </article>

          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-sm sm:p-5">
                <h3 className="text-base font-semibold text-[#0f172a]">Highlights</h3>
                <ul className="mt-3 space-y-3 text-sm text-[#475569]">
                  {highlights.map((h, i) => (
                    <li key={`hl-${i}-${h.text.slice(0, 24)}`} className="flex gap-2">
                      <span className="mt-0.5 text-[#0066ff]" aria-hidden>
                        {h.tone === 'strong' ? '●' : h.tone === 'attention' ? '▲' : '◆'}
                      </span>
                      <span>
                        <span className="font-semibold text-[#0f172a]">{h.label}: </span>
                        {h.text}
                      </span>
                    </li>
                  ))}
                </ul>
                <JumpLink href="#detailed-findings">See all findings →</JumpLink>
            </article>

            <article className="rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-sm sm:p-5">
                <h3 className="text-base font-semibold text-[#0f172a]">Top priorities</h3>
                <ul className="mt-3 space-y-3">
                  {data.findings
                    .filter((f) => f.priority === 'high')
                    .slice(0, 4)
                    .map((f, i) => (
                      <li key={`${f.question_text}-${i}`} className="rounded-xl border border-[#fee2e2] bg-[#fffafa] p-3">
                        <span className="text-[0.65rem] font-bold uppercase tracking-wide text-[#b91c1c]">High</span>
                        <p className="mt-1 text-sm font-semibold text-[#0f172a]">{f.question_text}</p>
                        <p className="mt-1 text-xs text-[#64748b]">
                          H-{String(i + 1).padStart(2, '0')} · {findingDomain(f)}
                        </p>
                      </li>
                    ))}
                  {!data.findings.some((f) => f.priority === 'high') ? (
                    <li className="text-sm text-[#64748b]">No high-priority findings recorded.</li>
                  ) : null}
                </ul>
                {data.findings.length > 0 ? (
                  <JumpLink href="#detailed-findings">See all {data.findings.length} findings →</JumpLink>
                ) : null}
            </article>

            <article className="rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-sm sm:p-5">
                <h3 className="text-base font-semibold text-[#0f172a]">What&apos;s next?</h3>
                <ol className="mt-4 space-y-4">
                  {whatsNext.map((step, i) => (
                    <li key={`${step}-${i}`} className="flex gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0066ff] text-sm font-bold text-white">
                        {i + 1}
                      </span>
                      <p className="text-sm leading-relaxed text-[#475569]">{step}</p>
                    </li>
                  ))}
                </ol>
                <a
                  href={recommendationsHref}
                  className="mt-5 block w-full rounded-xl bg-[#0066ff] py-2.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-[#0052cc] scroll-mt-24"
                >
                  View recommendations
                </a>
            </article>
          </div>

          <section className="mt-6" aria-labelledby="cust-top-findings">
            <h3 id="cust-top-findings" className="text-lg font-semibold text-[#0f172a]">
              Top findings
            </h3>
            <p className="mt-1 text-sm text-[#64748b]">Highest-impact gaps and observations from this assessment.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <article className="rounded-2xl border border-red-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <RiskShield variant="high" />
                  <span className="text-2xl font-bold text-red-600">{priorityCounts.high}</span>
                </div>
                <ul className="mt-3 space-y-2.5 text-sm text-[#334155]">
                  {topByPriority.high.length ? (
                    topByPriority.high.map((item) => (
                      <li key={item.code}>
                        <span className="font-semibold text-[#0f172a]">{item.code}</span>{' '}
                        <span className="text-[#64748b]">{item.title}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-[#64748b]">No high-priority findings.</li>
                  )}
                </ul>
                <JumpLink href="#detailed-findings">View all high-risk findings →</JumpLink>
              </article>
              <article className="rounded-2xl border border-orange-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <RiskShield variant="medium" />
                  <span className="text-2xl font-bold text-orange-600">{priorityCounts.medium}</span>
                </div>
                <ul className="mt-3 space-y-2.5 text-sm text-[#334155]">
                  {topByPriority.medium.length ? (
                    topByPriority.medium.map((item) => (
                      <li key={item.code}>
                        <span className="font-semibold text-[#0f172a]">{item.code}</span>{' '}
                        <span className="text-[#64748b]">{item.title}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-[#64748b]">No medium-priority findings.</li>
                  )}
                </ul>
                <JumpLink href="#detailed-findings">View all medium-risk findings →</JumpLink>
              </article>
              <article className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <RiskShield variant="low" />
                  <span className="text-2xl font-bold text-emerald-600">{priorityCounts.low}</span>
                </div>
                <ul className="mt-3 space-y-2.5 text-sm text-[#334155]">
                  {topByPriority.low.length ? (
                    topByPriority.low.map((item) => (
                      <li key={item.code}>
                        <span className="font-semibold text-[#0f172a]">{item.code}</span>{' '}
                        <span className="text-[#64748b]">{item.title}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-[#64748b]">No low-priority findings.</li>
                  )}
                </ul>
                <JumpLink href="#detailed-findings">View all low-risk findings →</JumpLink>
              </article>
            </div>
          </section>

          <footer className="mt-8 flex flex-col gap-2 border-t border-[#dce5f2] pt-4 text-xs text-[#64748b] sm:flex-row sm:justify-between sm:text-sm">
            <p>This report is confidential and intended for internal use only.</p>
            <p className="tabular-nums">Report ref: {report.id.slice(0, 8)}…</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
