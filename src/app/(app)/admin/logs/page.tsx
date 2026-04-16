const auditRows = [
  { actor: 'John Novak', action: 'Published report', target: 'Delta Systems / SOC 2 Baseline', timestamp: 'Apr 21, 2026 10:42', severity: 'Info' },
  { actor: 'Sarah Khan', action: 'Assigned role: auditor', target: 'nina.ford@blueharbor.com', timestamp: 'Apr 21, 2026 09:18', severity: 'Warning' },
  { actor: 'System', action: 'Retention cleanup completed', target: '45 evidence files removed', timestamp: 'Apr 21, 2026 03:00', severity: 'Info' },
  { actor: 'System', action: 'Failed webhook attempt', target: 'Stripe event retry scheduled', timestamp: 'Apr 20, 2026 18:04', severity: 'Critical' },
] as const;

const severityClass: Record<string, string> = {
  Info: 'bg-[#eaf2ff] text-[#3f74df]',
  Warning: 'bg-[#fff4df] text-[#b6862f]',
  Critical: 'bg-[#ffedf0] text-[#cc5163]',
};

export default function AdminAuditLogsPage() {
  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-[#dbe4f4] bg-white px-5 py-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6f82a3]">Audit Logs</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1f2d45]">Activity Audit Trail</h1>
        <p className="mt-1 text-sm text-[#607594]">Security-sensitive actions and system events for compliance review.</p>
      </header>

      <article className="overflow-hidden rounded-2xl border border-[#e2e8f5] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ecf0f8] px-4 py-3">
          <h2 className="text-xl font-semibold text-[#243555]">Recent Events</h2>
          <div className="flex items-center gap-2">
            <button type="button" className="rounded-xl border border-[#d4dced] px-3 py-2 text-sm font-semibold text-[#425f8f]">
              Date Range
            </button>
            <button type="button" className="rounded-xl border border-[#2d4f83] bg-[#182843] px-4 py-2 text-sm font-semibold text-white hover:bg-[#223657]">
              Download CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto px-4 py-3">
          <table className="min-w-full text-left text-sm text-[#2b3e60]">
            <thead className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7a8ca8]">
              <tr className="border-b border-[#edf2f9]">
                <th className="py-2 pr-4">Actor</th>
                <th className="py-2 pr-4">Action</th>
                <th className="py-2 pr-4">Target</th>
                <th className="py-2 pr-4">Timestamp</th>
                <th className="py-2">Severity</th>
              </tr>
            </thead>
            <tbody>
              {auditRows.map((row) => (
                <tr key={`${row.action}-${row.timestamp}`} className="border-b border-[#edf2f9] last:border-0">
                  <td className="py-3 pr-4 font-semibold text-[#25375a]">{row.actor}</td>
                  <td className="py-3 pr-4 text-[#5f7395]">{row.action}</td>
                  <td className="py-3 pr-4 text-[#5f7395]">{row.target}</td>
                  <td className="py-3 pr-4 text-[#5f7395]">{row.timestamp}</td>
                  <td className="py-3">
                    <span className={`rounded-md px-2 py-1 text-xs font-semibold ${severityClass[row.severity]}`}>{row.severity}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
