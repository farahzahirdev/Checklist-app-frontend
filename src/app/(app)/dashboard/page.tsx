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
        <p className="text-xs uppercase tracking-[0.34em] text-[#9dc5ff]">
          Customer
        </p>
        <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-white md:text-5xl">
          Dashboard
        </h1>
        <p className="max-w-3xl text-base leading-7 text-[#d8e2f2]">
          Track assessment progress, risk priorities, and next steps before moving into detailed answers.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <article className="rounded-xl border border-[#345793] bg-[#0d1d3a] p-4 text-sm">Maturity Score: {summary.maturityScore}</article>
        <article className="rounded-xl border border-[#9d6dff]/50 bg-[#9d6dff]/10 p-4 text-sm">High Risks: {summary.highRisks}</article>
        <article className="rounded-xl border border-[#6581b0]/55 bg-[#22385d]/35 p-4 text-sm">Medium Risks: {summary.mediumRisks}</article>
        <article className="rounded-xl border border-[#7ddf95]/55 bg-[#7ddf95]/10 p-4 text-sm">Low Risks: {summary.lowRisks}</article>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Link href="/assessment" className="rounded-2xl border border-[#345793] bg-[#0d1d3a] p-5 hover:bg-[#1a2f56]">
          <h2 className="text-lg font-semibold">Go to Assessment</h2>
          <p className="mt-2 text-sm text-[#97a5bb]">Continue section-by-section questionnaire.</p>
        </Link>
        <Link href="/reports" className="rounded-2xl border border-[#345793] bg-[#0d1d3a] p-5 hover:bg-[#1a2f56]">
          <h2 className="text-lg font-semibold">View Reports</h2>
          <p className="mt-2 text-sm text-[#97a5bb]">Review summary, findings, and export options.</p>
        </Link>
        <Link href="/resources" className="rounded-2xl border border-[#345793] bg-[#0d1d3a] p-5 hover:bg-[#1a2f56]">
          <h2 className="text-lg font-semibold">Open Resources</h2>
          <p className="mt-2 text-sm text-[#97a5bb]">Templates and remediation guidance.</p>
        </Link>
      </section>
    </section>
  );
}