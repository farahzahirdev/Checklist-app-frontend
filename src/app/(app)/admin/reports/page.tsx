const reportRows = [
  { company: 'Acme Corp', checklist: 'Cybersecurity Checklist', completedOn: 'Apr 21, 2026', reviewer: 'John Novak', status: 'Ready' },
  { company: 'Blue Harbor', checklist: 'ISO Readiness', completedOn: 'Apr 20, 2026', reviewer: 'Nina Ford', status: 'Draft' },
  { company: 'Delta Systems', checklist: 'SOC 2 Baseline', completedOn: 'Apr 18, 2026', reviewer: 'John Novak', status: 'Published' },
  { company: 'Nova Health', checklist: 'HIPAA Controls', completedOn: 'Apr 17, 2026', reviewer: 'Maya Lee', status: 'Published' },
] as const;

const statusClass: Record<string, string> = {
  Ready: 'bg-[#eaf2ff] text-[#3f74df]',
  Draft: 'bg-[#fff4df] text-[#b6862f]',
  Published: 'bg-[#e9f8ef] text-[#2f9960]',
};

type ReportsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminReportsPage({ searchParams }: ReportsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const statusFilterRaw = resolvedSearchParams.status;
  const statusFilter = (Array.isArray(statusFilterRaw) ? statusFilterRaw[0] : statusFilterRaw)?.trim() ?? '';
  const filteredRows = statusFilter ? reportRows.filter((row) => row.status.toLowerCase() === statusFilter.toLowerCase()) : reportRows;

  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-[#dbe4f4] bg-white px-5 py-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6f82a3]">Reports</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1f2d45]">Report Center</h1>
        <p className="mt-1 text-sm text-[#607594]">Review generated assessment reports and publish approved versions.</p>
        {statusFilter ? <p className="mt-2 text-sm font-semibold text-[#3e69b0]">Filtered by status: {statusFilter}</p> : null}
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        {[
          { label: 'Reports Ready', value: '9' },
          { label: 'Draft Reports', value: '6' },
          { label: 'Published This Week', value: '18' },
        ].map((item) => (
          <article key={item.label} className="rounded-2xl border border-[#e2e8f5] bg-white px-4 py-3 shadow-sm">
            <p className="text-sm font-medium text-[#6a7d9a]">{item.label}</p>
            <p className="mt-1 text-3xl font-semibold text-[#273a5a]">{item.value}</p>
          </article>
        ))}
      </div>

      <article className="overflow-hidden rounded-2xl border border-[#e2e8f5] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#ecf0f8] px-4 py-3">
          <h2 className="text-xl font-semibold text-[#243555]">Recent Reports</h2>
          <button type="button" className="rounded-xl border border-[#2d4f83] bg-[#182843] px-4 py-2 text-sm font-semibold text-white hover:bg-[#223657]">
            Export Log
          </button>
        </div>

        <div className="overflow-x-auto px-4 py-3">
          <table className="min-w-full text-left text-sm text-[#2b3e60]">
            <thead className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7a8ca8]">
              <tr className="border-b border-[#edf2f9]">
                <th className="py-2 pr-4">Company</th>
                <th className="py-2 pr-4">Checklist</th>
                <th className="py-2 pr-4">Completed</th>
                <th className="py-2 pr-4">Reviewer</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={`${row.company}-${row.completedOn}`} className="border-b border-[#edf2f9] last:border-0">
                  <td className="py-3 pr-4 font-semibold text-[#25375a]">{row.company}</td>
                  <td className="py-3 pr-4 text-[#5f7395]">{row.checklist}</td>
                  <td className="py-3 pr-4 text-[#5f7395]">{row.completedOn}</td>
                  <td className="py-3 pr-4 text-[#5f7395]">{row.reviewer}</td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-md px-2 py-1 text-xs font-semibold ${statusClass[row.status]}`}>{row.status}</span>
                  </td>
                  <td className="py-3">
                    <button type="button" className="text-sm font-semibold text-[#3e69b0]">
                      View Report
                    </button>
                  </td>
                </tr>
              ))}
              {!filteredRows.length ? (
                <tr>
                  <td className="py-3 text-[#607594]" colSpan={6}>
                    No reports match the selected status.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
