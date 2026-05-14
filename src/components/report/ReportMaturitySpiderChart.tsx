'use client';

/**
 * Shared spider / radar chart for report maturity by section (domain).
 * Used on admin report detail and customer report executive maturity overview.
 */

export type MaturitySpiderSourceRow = {
  section_title?: string | null;
  section_code?: string | null;
  chapter_code?: string | null;
  percentage: number;
  target_percentage?: number | null;
};

export function shortLabelForSpider(text: string, max = 12) {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export function clampSpiderPct(n: number): number {
  return Math.round(Math.min(100, Math.max(0, Number.isFinite(n) ? n : 0)));
}

export function readSpiderRowTargetPct(s: MaturitySpiderSourceRow): number | null {
  const raw = s.target_percentage;
  if (typeof raw === 'number' && Number.isFinite(raw)) return clampSpiderPct(raw);
  return null;
}

const DEFAULT_TARGET_BAND = 85;

/**
 * Spider / radar chart: one spoke per expanded vertex (see buildSpiderSeries for n=1 and n=2).
 * Axes from center, concentric webs, current fill + dashed target polygon.
 */
export function ReportMaturitySectionSpiderChart({
  labels,
  values,
  targetValues,
  areaHint,
  ariaLabel,
  legendCurrent,
  legendTarget,
  legendTargetWhenApi,
  /** Customer executive uses brand blue; admin uses slate-blue. */
  currentStroke = '#2563eb',
  currentFill = 'rgba(37,99,235,0.14)',
}: {
  labels: string[];
  values: number[];
  targetValues: number[];
  areaHint: string | null;
  ariaLabel: string;
  legendCurrent: string;
  legendTarget: string;
  legendTargetWhenApi: string;
  currentStroke?: string;
  currentFill?: string;
}) {
  const cx = 150;
  const cy = 150;
  const rMax = 95;
  const n = labels.length;
  const toPoint = (value: number, i: number) => {
    const angle = (-Math.PI / 2 + (2 * Math.PI * i) / n) as number;
    const rad = rMax * (clampSpiderPct(value) / 100);
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
      <svg viewBox="0 0 300 300" className="h-auto w-full max-w-[320px]" aria-label={ariaLabel}>
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
              {shortLabelForSpider(trimmed, n > 6 ? 9 : 11)}
            </text>
          );
        })}
        {tgtPoly ? (
          <polygon points={tgtPoly} fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="6 4" opacity={0.88} />
        ) : null}
        <polygon
          points={curPoly}
          fill={currentFill}
          stroke={currentStroke}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {curPts.map(([x, y], i) => (
          <circle key={`pt-${i}`} cx={x} cy={y} r={4} fill="#fff" stroke={currentStroke} strokeWidth="2" />
        ))}
      </svg>
      {areaHint ? (
        <p className="mt-1 max-w-[280px] text-center text-[0.7rem] text-[#64748b]">{areaHint}</p>
      ) : null}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-[0.65rem] font-semibold text-[#64748b]">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-4 rounded-sm opacity-90" style={{ backgroundColor: currentStroke }} aria-hidden />
          {legendCurrent}
        </span>
        {tgtPoly ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-4 border-t-2 border-dashed border-emerald-500" aria-hidden />
            {legendTarget}
          </span>
        ) : (
          <span className="text-center text-[#94a3b8]">{legendTargetWhenApi}</span>
        )}
      </div>
    </div>
  );
}

export function buildMaturitySpiderSeries(
  sections: MaturitySpiderSourceRow[],
  sectionFallback: string,
  hintOne: (shortLabelText: string) => string,
  hintTwo: (l1: string, l2: string) => string,
): {
  labels: string[];
  values: number[];
  targetValues: number[];
  areaHint: string | null;
} | null {
  if (!sections.length) return null;

  const labelFor = (s: MaturitySpiderSourceRow) =>
    (s.section_title ?? s.section_code ?? sectionFallback).trim() || sectionFallback;
  const pctFor = (s: MaturitySpiderSourceRow) => clampSpiderPct(Number(s.percentage) || 0);

  if (sections.length === 1) {
    const s = sections[0]!;
    const label = labelFor(s);
    const v = pctFor(s);
    const t = readSpiderRowTargetPct(s) ?? DEFAULT_TARGET_BAND;
    return {
      labels: [label, '', ''],
      values: [v, v, v],
      targetValues: [t, t, t],
      areaHint: hintOne(shortLabelForSpider(label, 40)),
    };
  }

  if (sections.length === 2) {
    const [a, b] = sections;
    const l1 = labelFor(a!);
    const l2 = labelFor(b!);
    const v1 = pctFor(a!);
    const v2 = pctFor(b!);
    const t1 = readSpiderRowTargetPct(a!) ?? DEFAULT_TARGET_BAND;
    const t2 = readSpiderRowTargetPct(b!) ?? DEFAULT_TARGET_BAND;
    return {
      labels: [l1, l2, '', ''],
      values: [v1, v2, v1, v2],
      targetValues: [t1, t2, t1, t2],
      areaHint: hintTwo(shortLabelForSpider(l1, 22), shortLabelForSpider(l2, 22)),
    };
  }

  const labels = sections.map(labelFor);
  const values = sections.map(pctFor);
  const targetValues = sections.map((s) => readSpiderRowTargetPct(s) ?? DEFAULT_TARGET_BAND);
  return { labels, values, targetValues, areaHint: null };
}
