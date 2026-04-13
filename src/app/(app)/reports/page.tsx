import { DomainScoresPanel } from '@/components/report/domain-scores-panel';
import { ExecutiveSummarySidebar } from '@/components/report/executive-summary-sidebar';
import { FindingsTable } from '@/components/report/findings-table';
import { mockReportSummary } from '@/lib/checklist-mocks';

export default function ReportsPage() {
  // Implementation guide for frontend dev:
  // Purpose: Customer report view with all client-requested sections.
  // Backend touchpoints (planned):
  // - GET /api/v1/reports/:assessmentId/summary
  // - GET /api/v1/reports/:assessmentId/findings
  // - POST /api/v1/reports/:assessmentId/export/pdf
  // Acceptance criteria:
  // - Executive summary sidebar visible
  // - Maturity score/overview/top priorities displayed
  // - Domain scores + findings + export actions displayed
  const summary = mockReportSummary;

  return (
    <section className="space-y-5">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/85">Customer</p>
        <h1 className="text-3xl font-semibold">Reports</h1>
      </header>

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <ExecutiveSummarySidebar summary={summary} />
        <article className="rounded-2xl border border-white/15 bg-black/25 p-5">
          <h2 className="text-xl font-semibold">Maturity Overview</h2>
          <p className="mt-3 text-sm text-zinc-300">Maturity score: {summary.maturityScore}</p>
          <p className="mt-2 text-sm text-zinc-400">{summary.maturityOverview}</p>
          <div className="mt-4">
            <h3 className="font-medium">Top Priorities</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-300">
              {summary.topPriorities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="mt-4 text-sm text-zinc-300">
            <p>Total questions answered: {summary.totalQuestionsAnswered}</p>
            <p>Standard covered: {summary.standardsCovered.join(', ')}</p>
          </div>
        </article>
      </div>

      <DomainScoresPanel domainScores={summary.domainScores} />

      <article className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-red-400/35 bg-red-500/10 p-4 text-sm">High risks: {summary.highRisks}</div>
        <div className="rounded-xl border border-amber-400/35 bg-amber-500/10 p-4 text-sm">Medium risks: {summary.mediumRisks}</div>
        <div className="rounded-xl border border-emerald-400/35 bg-emerald-500/10 p-4 text-sm">Low risks: {summary.lowRisks}</div>
      </article>

      <FindingsTable findings={summary.findings} />

      <article className="rounded-2xl border border-white/15 bg-black/25 p-5 text-sm">
        <h3 className="text-lg font-semibold">Export Options</h3>
        <div className="mt-3 flex flex-wrap gap-3">
          <button type="button" className="rounded-lg border border-cyan-300/35 px-3 py-2 text-cyan-100">
            Export PDF
          </button>
          <button type="button" className="rounded-lg border border-white/20 px-3 py-2 text-zinc-200">
            View Recommendations
          </button>
        </div>
      </article>

      <article className="rounded-2xl border border-white/15 bg-black/25 p-5 text-sm">
        <h3 className="text-lg font-semibold">What Next</h3>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-zinc-300">
          <li>Review this report with leadership.</li>
          <li>Take actions for high-risk findings first.</li>
          <li>Reassess after remediation.</li>
        </ul>
        <h4 className="mt-4 font-medium">Highlights Findings</h4>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-zinc-300">
          {summary.highlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>
    </section>
  );
}
