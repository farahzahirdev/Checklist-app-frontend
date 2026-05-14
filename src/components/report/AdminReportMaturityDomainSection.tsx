'use client';

import { useMemo } from 'react';

import type { ReportResponse, ReportSectionOverview } from '@/lib/reports';

function shortLabel(text: string, max = 12) {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function clampPct(n: number): number {
  return Math.round(Math.min(100, Math.max(0, Number.isFinite(n) ? n : 0)));
}

function readSectionTargetPct(s: ReportSectionOverview): number | null {
  const raw = s.target_percentage;
  if (typeof raw === 'number' && Number.isFinite(raw)) return clampPct(raw);
  return null;
}

/**
 * Spider / radar chart: one spoke per expanded vertex (see buildSpiderSeries for n=1 and n=2).
 * Axes from center, concentric webs, current fill + dashed target polygon.
 */
function SectionSpiderChart({
  labels,
  values,
  targetValues,
  areaHint,
}: {
  labels: string[];
  values: number[];
  targetValues: number[];
  /** Explains 3- or 4-axis stand-ins when there are fewer than three real domains. */
  areaHint: string | null;
}) {
  const cx = 150;
  const cy = 150;
  const rMax = 95;
  const n = labels.length;
  const toPoint = (value: number, i: number) => {
    const angle = (-Math.PI / 2 + (2 * Math.PI * i) / n) as number;
    const rad = rMax * (clampPct(value) / 100);
    return [cx + rad * Math.cos(angle), cy + rad * Math.sin(angle)] as const;
  };
  const curPts = values.map((v, i) => toPoint(v, i));
  const curPoly = curPts.map(([x, y]) => `${x},${y}`).join(' ');
  const tgtPoly =
    targetValues.length === n
      ? targetValues.map((v, i) => toPoint(v, i)).map(([x, y]) => `${x},${y}`).join(' ')
      : '';
  const gridLevels = [25, 50, 75, 100];

  return (
    <div className="flex w-full max-w-[340px] flex-col items-center">
      <svg viewBox="0 0 300 300" className="h-auto w-full max-w-[320px]" aria-label="Maturity spider chart by checklist section">
        {gridLevels.map((lvl) => {
          const ring = labels.map((_, i) => {
            const angle = (-Math.PI / 2 + (2 * Math.PI * i) / n) as number;
            const rad = rMax * (lvl / 100);
            return [cx + rad * Math.cos(angle), cy + rad * Math.sin(angle)] as const;
          });
          const d = `M ${ring.map(([x, y]) => `${x} ${y}`).join(' L ')} Z`;
          return <path key={lvl} d={d} fill="none" stroke="#e2e8f0" strokeWidth="1" />;
        })}
        {labels.map((_, i) => {
          const angle = (-Math.PI / 2 + (2 * Math.PI * i) / n) as number;
          const x2 = cx + rMax * Math.cos(angle);
          const y2 = cy + rMax * Math.sin(angle);
          return <line key={`axis-${i}`} x1={cx} y1={cy} x2={x2} y2={y2} stroke="#e8edf5" strokeWidth="1.2" />;
        })}
        {labels.map((label, i) => {
          const trimmed = label.trim();
          if (!trimmed) return null;
          const angle = (-Math.PI / 2 + (2 * Math.PI * i) / n) as number;
          const tx = cx + (rMax + 18) * Math.cos(angle);
          const ty = cy + (rMax + 18) * Math.sin(angle);
          return (
            <text
              key={`lbl-${i}`}
              x={tx}
              y={ty}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-[#64748b] font-medium"
              style={{ fontSize: n > 6 ? '8px' : '9px' }}
            >
              {shortLabel(trimmed, n > 6 ? 9 : 11)}
            </text>
          );
        })}
        {tgtPoly ? (
          <polygon points={tgtPoly} fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="6 4" opacity={0.88} />
        ) : null}
        <polygon
          points={curPoly}
          fill="rgba(37,99,235,0.14)"
          stroke="#2563eb"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {curPts.map(([x, y], i) => (
          <circle key={`pt-${i}`} cx={x} cy={y} r={4} fill="#fff" stroke="#2563eb" strokeWidth="2" />
        ))}
      </svg>
      {areaHint ? (
        <p className="mt-1 max-w-[280px] text-center text-[0.7rem] text-[#64748b]">{areaHint}</p>
      ) : null}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-[0.65rem] font-semibold text-[#64748b]">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-4 rounded-sm bg-[#2563eb]/80" aria-hidden />
          Current
        </span>
        {tgtPoly ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-4 border-t-2 border-dashed border-emerald-500" aria-hidden />
            Target
          </span>
        ) : (
          <span className="text-center text-[#94a3b8]">Target when API provides per-section targets</span>
        )}
      </div>
    </div>
  );
}

const DEFAULT_TARGET_BAND = 85;

function buildSpiderSeries(sections: ReportSectionOverview[]): {
  labels: string[];
  values: number[];
  targetValues: number[];
  areaHint: string | null;
} | null {
  if (!sections.length) return null;

  const labelFor = (s: ReportSectionOverview) =>
    (s.section_title ?? s.section_code ?? 'Section').trim() || 'Section';
  const pctFor = (s: ReportSectionOverview) => clampPct(Number(s.percentage) || 0);

  if (sections.length === 1) {
    const s = sections[0]!;
    const label = labelFor(s);
    const v = pctFor(s);
    const t = readSectionTargetPct(s) ?? DEFAULT_TARGET_BAND;
    return {
      labels: [label, '', ''],
      values: [v, v, v],
      targetValues: [t, t, t],
      areaHint: `One section — same score on three axes so the chart is a closed area: ${shortLabel(label, 40)}.`,
    };
  }

  /**
   * Two real spokes = a line, not a polygon. Use four spokes (N, E, S, W): alternate
   * section A and B so the path forms a proper quadrilateral.
   */
  if (sections.length === 2) {
    const [a, b] = sections;
    const l1 = labelFor(a!);
    const l2 = labelFor(b!);
    const v1 = pctFor(a!);
    const v2 = pctFor(b!);
    const t1 = readSectionTargetPct(a!) ?? DEFAULT_TARGET_BAND;
    const t2 = readSectionTargetPct(b!) ?? DEFAULT_TARGET_BAND;
    return {
      labels: [l1, l2, '', ''],
      values: [v1, v2, v1, v2],
      targetValues: [t1, t2, t1, t2],
      areaHint: `Two sections — ${shortLabel(l1, 22)} and ${shortLabel(l2, 22)} each appear on two opposite axes so the shaded area is visible.`,
    };
  }

  const labels = sections.map(labelFor);
  const values = sections.map(pctFor);
  const targetValues = sections.map((s) => readSectionTargetPct(s) ?? DEFAULT_TARGET_BAND);
  return { labels, values, targetValues, areaHint: null };
}

function barToneClass(pct: number): string {
  if (pct >= 70) return 'bg-[#2563eb]';
  if (pct >= 45) return 'bg-[#ea580c]';
  return 'bg-[#dc2626]';
}

function DomainScoreShield({ pct }: { pct: number }) {
  const stroke = pct >= 70 ? '#2563eb' : pct >= 45 ? '#ea580c' : '#dc2626';
  const fill = pct >= 70 ? '#eff6ff' : pct >= 45 ? '#fff7ed' : '#fef2f2';
  return (
    <svg width="26" height="30" viewBox="0 0 40 44" className="shrink-0" aria-hidden>
      <path
        d="M20 2 36 8v14c0 10-7 18-16 20-9-2-16-10-16-20V8L20 2Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.6"
      />
      <path d="M20 14v10M20 28h.01" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function sectionRowKey(s: ReportSectionOverview, index: number): string {
  return s.section_id || s.section_code || s.chapter_code || `sec-${index}`;
}

export function AdminReportMaturityDomainSection({ report }: { report: ReportResponse }) {
  const { sections, spider } = useMemo(() => {
    const list = [...(report.section_overviews ?? [])].sort((a, b) =>
      (a.section_code ?? a.chapter_code ?? '').localeCompare(b.section_code ?? b.chapter_code ?? ''),
    );
    return { sections: list, spider: buildSpiderSeries(list) };
  }, [report.section_overviews]);

  if (!sections.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] px-4 py-6 text-center sm:px-6">
        <h2 className="text-base font-semibold text-[#0f172a]">Maturity overview</h2>
        <p className="mt-2 text-sm text-[#64748b]">
          No <code className="rounded bg-[#e2e8f0] px-1 text-xs">section_overviews</code> on this report yet. Domain scores
          and the radar chart populate from that payload.
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-0 rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6 md:p-8">
      <h2 className="text-xl font-semibold text-[#0f172a] sm:text-2xl">Maturity overview</h2>
      <p className="mt-1 text-sm text-[#64748b] sm:text-base">Your score by checklist section (domain).</p>

      <div className="mt-6 grid min-w-0 gap-8 xl:grid-cols-2 xl:items-start">
        <div className="flex min-w-0 justify-center xl:justify-start">
          {spider ? (
            <SectionSpiderChart
              labels={spider.labels}
              values={spider.values}
              targetValues={spider.targetValues}
              areaHint={spider.areaHint}
            />
          ) : null}
        </div>

        <div className="min-w-0">
          <h3 className="text-base font-semibold text-[#0f172a]">Domain scores</h3>
          <div className="mt-4 overflow-x-auto rounded-xl border border-[#e8edf5]">
            <table className="w-full min-w-[280px] text-left text-sm">
              <thead className="border-b border-[#e8edf5] bg-[#f8fafc] text-xs font-semibold uppercase tracking-wide text-[#64748b]">
                <tr>
                  <th className="px-3 py-2.5">Domain</th>
                  <th className="px-3 py-2.5">Score</th>
                  <th className="hidden px-3 py-2.5 sm:table-cell">vs last</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef2f9]">
                {sections.map((s, idx) => {
                  const pct = Math.round(Math.min(100, Math.max(0, Number(s.percentage) || 0)));
                  const title = (s.section_title ?? s.section_code ?? 'Section').trim();
                  const code = (s.section_code ?? s.chapter_code ?? '').trim();
                  return (
                    <tr key={sectionRowKey(s, idx)}>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <DomainScoreShield pct={pct} />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-[#0f172a]">{title}</p>
                            {code ? <p className="text-xs text-[#64748b]">{code}</p> : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 min-w-[4rem] flex-1 overflow-hidden rounded-full bg-[#e2e8f0]">
                            <div className={`h-full rounded-full ${barToneClass(pct)}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="shrink-0 tabular-nums font-semibold text-[#0f172a]">{pct}%</span>
                        </div>
                      </td>
                      <td className="hidden px-3 py-3 text-[#94a3b8] sm:table-cell">—</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
