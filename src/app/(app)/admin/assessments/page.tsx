const assessmentRows = [
  { company: 'Acme Corp', checklist: 'Cybersecurity Checklist', owner: 'Sarah Khan', started: 'Apr 12, 2026', due: 'Apr 19, 2026', status: 'In Progress' },
  { company: 'Blue Harbor', checklist: 'ISO Readiness', owner: 'Diego Ross', started: 'Apr 10, 2026', due: 'Apr 17, 2026', status: 'Awaiting Review' },
  { company: 'Delta Systems', checklist: 'SOC 2 Baseline', owner: 'Maya Lee', started: 'Apr 08, 2026', due: 'Apr 15, 2026', status: 'Published' },
  { company: 'Nova Health', checklist: 'HIPAA Controls', owner: 'Ali Ahmed', started: 'Apr 07, 2026', due: 'Apr 14, 2026', status: 'Expired' },
] as const;

const statusClass: Record<string, string> = {
  'In Progress': 'bg-[#eef4ff] text-[#3f74df]',
  'Awaiting Review': 'bg-[#fff4df] text-[#b6862f]',
  Published: 'bg-[#e9f8ef] text-[#2f9960]',
  Expired: 'bg-[#ffedf0] text-[#cc5163]',
};

type AssessmentsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminAssessmentsPage({ searchParams }: AssessmentsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const statusFilterRaw = resolvedSearchParams.status;
  const statusFilter = (Array.isArray(statusFilterRaw) ? statusFilterRaw[0] : statusFilterRaw)?.trim() ?? '';
  const filteredRows = statusFilter ? assessmentRows.filter((row) => row.status.toLowerCase() === statusFilter.toLowerCase()) : assessmentRows;

  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-[#dbe4f4] bg-white px-5 py-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6f82a3]">Assessments</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1f2d45]">Assessment Management</h1>
        <p className="mt-1 text-sm text-[#607594]">Track active assessment windows, review queues, and expirations.</p>
        {statusFilter ? <p className="mt-2 text-sm font-semibold text-[#3e69b0]">Filtered by status: {statusFilter}</p> : null}
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Active', value: '28', tone: 'bg-[#eaf2ff] text-[#3f74df]' },
          { label: 'Awaiting Review', value: '6', tone: 'bg-[#fff4df] text-[#b6862f]' },
          { label: 'Published', value: '42', tone: 'bg-[#e9f8ef] text-[#2f9960]' },
          { label: 'Expired', value: '4', tone: 'bg-[#ffedf0] text-[#cc5163]' },
        ].map((stat) => (
          <article key={stat.label} className="rounded-2xl border border-[#e2e8f5] bg-white px-4 py-3 shadow-sm">
            <p className="text-sm font-medium text-[#6a7d9a]">{stat.label}</p>
            <p className={`mt-2 inline-flex rounded-lg px-2.5 py-1 text-2xl font-semibold ${stat.tone}`}>{stat.value}</p>
          </article>
        ))}
      </div>

      <article className="overflow-hidden rounded-2xl border border-[#e2e8f5] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ecf0f8] px-4 py-3">
          <h2 className="text-xl font-semibold text-[#243555]">All Assessments</h2>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Search company or checklist"
              className="w-64 rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm text-[#2a3d5f] outline-none focus:border-[#7ea6e7]"
            />
            <button type="button" className="rounded-xl border border-[#d4dced] px-3 py-2 text-sm font-semibold text-[#425f8f]">
              Filters
            </button>
          </div>
        </div>

        <div className="overflow-x-auto px-4 py-3">
          <table className="min-w-full text-left text-sm text-[#2b3e60]">
            <thead className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7a8ca8]">
              <tr className="border-b border-[#edf2f9]">
                <th className="py-2 pr-4">Company</th>
                <th className="py-2 pr-4">Checklist</th>
                <th className="py-2 pr-4">Owner</th>
                <th className="py-2 pr-4">Started</th>
                <th className="py-2 pr-4">Due</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={`${row.company}-${row.checklist}`} className="border-b border-[#edf2f9] last:border-0">
                  <td className="py-3 pr-4 font-semibold text-[#25375a]">{row.company}</td>
                  <td className="py-3 pr-4 text-[#5f7395]">{row.checklist}</td>
                  <td className="py-3 pr-4 text-[#5f7395]">{row.owner}</td>
                  <td className="py-3 pr-4 text-[#5f7395]">{row.started}</td>
                  <td className="py-3 pr-4 text-[#5f7395]">{row.due}</td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-md px-2 py-1 text-xs font-semibold ${statusClass[row.status]}`}>{row.status}</span>
                  </td>
                  <td className="py-3">
                    <button type="button" className="text-sm font-semibold text-[#3e69b0]">
                      Open
                    </button>
                  </td>
                </tr>
              ))}
              {!filteredRows.length ? (
                <tr>
                  <td className="py-3 text-[#607594]" colSpan={7}>
                    No assessments match the selected status.
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
