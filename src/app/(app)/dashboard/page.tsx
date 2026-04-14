import Link from 'next/link';
import { mockReportSummary } from '@/lib/checklist-mocks';

export default function DashboardPage() {
  // Implementation guide for frontend dev:
  // Purpose: Customer landing page after auth/payment with progress and next actions.
  // Backend touchpoints (planned):
  // - GET /api/v1/access/status
  // - GET /api/v1/assessment/current
  // - GET /api/v1/reports/latest-summary
  // Acceptance criteria:
  // - Shows high-level progress and risk counters
  // - Navigation CTA to assessment, reports, resources
  const summary = mockReportSummary;

  return (
    <section className="space-y-8">
      <header className="space-y-4">
        <p className="text-xs uppercase tracking-[0.34em] text-cyan-200/90">
          Customer
        </p>
        <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-zinc-100 md:text-5xl">
          Dashboard
        </h1>
        <p className="max-w-3xl text-base leading-7 text-zinc-300">
          Track assessment progress, risk priorities, and next steps before moving into detailed answers.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <article className="rounded-xl border border-white/15 bg-black/25 p-4 text-sm">Maturity Score: {summary.maturityScore}</article>
        <article className="rounded-xl border border-red-400/35 bg-red-500/10 p-4 text-sm">High Risks: {summary.highRisks}</article>
        <article className="rounded-xl border border-amber-400/35 bg-amber-500/10 p-4 text-sm">Medium Risks: {summary.mediumRisks}</article>
        <article className="rounded-xl border border-emerald-400/35 bg-emerald-500/10 p-4 text-sm">Low Risks: {summary.lowRisks}</article>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Link href="/assessment" className="rounded-2xl border border-white/15 bg-black/25 p-5 hover:bg-white/10">
          <h2 className="text-lg font-semibold">Go to Assessment</h2>
          <p className="mt-2 text-sm text-zinc-300">Continue section-by-section questionnaire.</p>
        </Link>
        <Link href="/reports" className="rounded-2xl border border-white/15 bg-black/25 p-5 hover:bg-white/10">
          <h2 className="text-lg font-semibold">View Reports</h2>
          <p className="mt-2 text-sm text-zinc-300">Review summary, findings, and export options.</p>
        </Link>
        <Link href="/resources" className="rounded-2xl border border-white/15 bg-black/25 p-5 hover:bg-white/10">
          <h2 className="text-lg font-semibold">Open Resources</h2>
          <p className="mt-2 text-sm text-zinc-300">Templates and remediation guidance.</p>
        </Link>
      </section>
    </section>
  );
}