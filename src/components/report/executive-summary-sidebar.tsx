import type { ReportSummary } from '@/lib/checklist-types';

interface ExecutiveSummarySidebarProps {
  summary: ReportSummary;
}

export function ExecutiveSummarySidebar({ summary }: ExecutiveSummarySidebarProps) {
  // Frontend dev implementation guide:
  // Wire this with report detail endpoint and add loading skeleton in reports page.
  return (
    <aside className="rounded-2xl border border-white/15 bg-black/25 p-5 text-sm">
      <h3 className="text-lg font-semibold">Executive Summary</h3>
      <p className="mt-3">Corporation: {summary.corporationName}</p>
      <p className="mt-1">Date: {summary.reportDate}</p>
      <p className="mt-1">Report ID: {summary.reportId}</p>
    </aside>
  );
}
