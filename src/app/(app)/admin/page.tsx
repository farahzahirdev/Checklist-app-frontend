const stats = [
  { label: 'Active Assessments', value: '32', tone: 'blue' },
  { label: 'Pending Review', value: '6', tone: 'amber' },
  { label: 'Final Reports Published', value: '42', tone: 'green' },
  { label: 'Expired Assessments', value: '4', tone: 'rose' },
] as const;

const pending = [
  { company: 'Acme Corpor', checklist: 'Cybersecurity Checklist', date: 'Apr 21, 2024' },
  { company: 'Beta Co. Ltd', checklist: 'Cybersecurity Checklist', date: 'Apr 21, 2024' },
  { company: 'Gamma Tech', checklist: 'Cybersecurity Checklist', date: 'Apr 21, 2024' },
  { company: 'Delta Systems', checklist: 'Cybersecurity Checklist', date: 'Apr 21, 2024' },
  { company: 'Echo Ventures', checklist: 'Cybersecurity Checklist', date: 'Apr 21, 2024' },
] as const;

const activity = [
  { title: 'New payment completed', detail: 'New payment was completed for 2 users', when: '5 minutes ago', tone: 'green' },
  { title: 'Assessment Started', detail: 'Canon entered her first assessment', when: '1 hour ago', tone: 'blue' },
  { title: 'Delta Systems Inc.', detail: 'Screenshots System certificates', when: '1 hour ago', tone: 'green' },
  { title: 'John Novak', detail: 'Delta Systems uploaded report for download.', when: '2 hours ago', tone: 'indigo' },
  { title: 'John Novak', detail: 'John posted note for Echo Ventures', when: '2 days ago', tone: 'indigo' },
  { title: 'Delta Systems Inc.', detail: 'Screenshots was deleted in retention', when: '3 days ago', tone: 'slate' },
] as const;

const toneClass: Record<string, string> = {
  blue: 'bg-[#e9f0ff] text-[#3c7df0]',
  amber: 'bg-[#fff6e4] text-[#d2962f]',
  green: 'bg-[#e9f7ef] text-[#34a366]',
  rose: 'bg-[#ffedf0] text-[#de5b6d]',
  indigo: 'bg-[#eef0ff] text-[#6860e8]',
  slate: 'bg-[#edf0f6] text-[#5d6d87]',
};

export default function AdminDashboardPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-4xl font-semibold tracking-tight text-[#1f2d45]">Admin Dashboard</h1>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.label} className="rounded-2xl border border-[#e2e8f5] bg-white px-4 py-3 shadow-sm">
            <div className="flex items-start gap-2">
              <span className={`mt-1 inline-flex h-7 w-7 items-center justify-center rounded-lg ${toneClass[stat.tone]}`}>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                  <path d="M7 5h10v14H7zM9 9h6M9 13h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </span>
              <div>
                <p className="text-2xl leading-6 font-semibold text-[#273a5a]">{stat.value}</p>
                <p className="mt-1 text-sm font-medium text-[#5b6f91]">{stat.label}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.4fr_1fr]">
        <article className="overflow-hidden rounded-2xl border border-[#e2e8f5] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#ecf0f8] px-4 py-3">
            <h2 className="text-2xl font-semibold text-[#243555]">Assessments Awaiting Review</h2>
            <span className="text-xl font-semibold leading-none text-[#a7b4ca]">...</span>
          </div>
          <div className="px-4 py-2">
            <div className="grid grid-cols-[1.2fr_1.2fr_0.8fr_0.5fr] gap-2 border-b border-[#edf2f9] pb-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#7a8ca8]">
              <span>Company</span>
              <span>Checklist</span>
              <span>Completion Date</span>
              <span>Status</span>
            </div>
            <div className="divide-y divide-[#edf2f9]">
              {pending.map((row) => (
                <div key={row.company} className="grid grid-cols-[1.2fr_1.2fr_0.8fr_0.5fr] gap-2 py-3 text-sm text-[#2b3e60]">
                  <span className="font-semibold text-[#25375a]">{row.company}</span>
                  <span className="text-[#5f7395]">{row.checklist}</span>
                  <span className="text-[#5f7395]">{row.date}</span>
                  <span>
                    <span className="rounded-md bg-[#fff3de] px-2 py-1 text-xs font-semibold text-[#b9872c]">Review</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-[#ecf0f8] px-4 py-3">
            <button type="button" className="text-sm font-semibold text-[#3e69b0] hover:text-[#2f59a1]">
              Review Draft Report
            </button>
            <button type="button" className="rounded-xl border border-[#2f7dff] bg-[#2f7dff] px-5 py-2 text-sm font-semibold text-white hover:bg-[#3b86ff]">
              Review
            </button>
          </div>
        </article>

        <article className="overflow-hidden rounded-2xl border border-[#e2e8f5] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#ecf0f8] px-4 py-3">
            <h2 className="text-2xl font-semibold text-[#243555]">Recent Activity</h2>
            <span className="text-xl font-semibold leading-none text-[#a7b4ca]">...</span>
          </div>
          <div className="divide-y divide-[#edf2f9] px-4">
            {activity.map((item, idx) => (
              <div key={`${item.title}-${idx}`} className="flex items-start gap-3 py-3">
                <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${toneClass[item.tone]}`}>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                    <path d="m6.5 12 3.3 3.3L17.5 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#2a3d5f]">{item.title}</p>
                  <p className="text-xs text-[#657995]">{item.detail}</p>
                </div>
                <span className="ml-auto whitespace-nowrap text-xs text-[#7c8da6]">{item.when}</span>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.4fr_1fr]">
        <article className="overflow-hidden rounded-2xl border border-[#e2e8f5] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#ecf0f8] px-4 py-3">
            <h2 className="text-2xl font-semibold text-[#243555]">Assessment Status Distribution</h2>
            <span className="text-xl font-semibold leading-none text-[#a7b4ca]">...</span>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-[210px_1fr]">
            <div className="flex items-center justify-center">
              <div className="relative h-44 w-44">
                <svg viewBox="0 0 120 120" className="h-full w-full" fill="none" aria-hidden="true">
                  <circle cx="60" cy="60" r="42" stroke="#e8eef8" strokeWidth="12" />
                  <circle cx="60" cy="60" r="42" stroke="#4b83ee" strokeWidth="12" strokeLinecap="round" strokeDasharray="52 264" strokeDashoffset="0" />
                  <circle cx="60" cy="60" r="42" stroke="#f1be63" strokeWidth="12" strokeLinecap="round" strokeDasharray="86 264" strokeDashoffset="-58" />
                  <circle cx="60" cy="60" r="42" stroke="#6ab896" strokeWidth="12" strokeLinecap="round" strokeDasharray="42 264" strokeDashoffset="-150" />
                  <circle cx="60" cy="60" r="42" stroke="#e26673" strokeWidth="12" strokeLinecap="round" strokeDasharray="22 264" strokeDashoffset="-198" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-[44px] font-semibold leading-none text-[#2a3c5f]">32</p>
                  <p className="text-sm font-semibold text-[#6b7e9b]">Progress</p>
                  <p className="text-[28px] font-semibold leading-none text-[#2a3c5f]">65</p>
                </div>
              </div>
            </div>
            <div>
              <ul className="space-y-2 text-base text-[#465c81]">
                <li className="flex items-center justify-between gap-2"><span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#4b83ee]" />Ready to start</span><span className="font-semibold">8</span></li>
                <li className="flex items-center justify-between gap-2"><span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#f1be63]" />In progress</span><span className="font-semibold">18</span></li>
                <li className="flex items-center justify-between gap-2"><span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#f4d07c]" />Waiting for review</span><span className="font-semibold">6</span></li>
                <li className="flex items-center justify-between gap-2"><span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#6ab896]" />Published</span><span className="font-semibold">42</span></li>
                <li className="flex items-center justify-between gap-2"><span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#e26673]" />Expired</span><span className="font-semibold">4</span></li>
              </ul>
              <p className="mt-4 text-sm text-[#6c7e98]">Operates: 65</p>
            </div>
          </div>
        </article>

        <article className="overflow-hidden rounded-2xl border border-[#e2e8f5] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#ecf0f8] px-4 py-3">
            <h2 className="text-2xl font-semibold text-[#243555]">Recent Activity</h2>
            <span className="text-xl font-semibold leading-none text-[#a7b4ca]">...</span>
          </div>
          <div className="divide-y divide-[#edf2f9] px-4">
            {[
              { title: 'Payment completed', detail: 'Acme Systems onboarded. Stripe', when: '5 minutes ago', tone: 'green' },
              { title: 'Gamma Tech LLC', detail: 'Created opening checklist', when: '1 hours ago', tone: 'blue' },
              { title: 'Delta Systems Inc.', detail: 'Entered cybersecurity checklist', when: '1 hours ago', tone: 'green' },
              { title: 'John Novak', detail: 'Delta Systems has report serialized', when: '2 hours ago', tone: 'indigo' },
            ].map((item, idx) => (
              <div key={`${item.title}-${idx}`} className="flex items-start gap-3 py-3">
                <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${toneClass[item.tone]}`}>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                    <path d="m6.5 12 3.3 3.3L17.5 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#2a3d5f]">{item.title}</p>
                  <p className="text-xs text-[#657995]">{item.detail}</p>
                </div>
                <span className="ml-auto whitespace-nowrap text-xs text-[#7c8da6]">{item.when}</span>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.4fr_1fr]">
        <article className="overflow-hidden rounded-2xl border border-[#e2e8f5] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#ecf0f8] px-4 py-3">
            <h2 className="text-2xl font-semibold text-[#243555]">Assessment / Birtha Vertime</h2>
            <span className="text-xl font-semibold leading-none text-[#a7b4ca]">...</span>
          </div>
          <div className="divide-y divide-[#edf2f9] px-4">
            {[
              { label: 'Assessments pending deletion', value: '3' },
              { label: 'Evidence files pending deletion', value: '45' },
              { label: 'Generated PDFs pending deletion', value: '8' },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-3 text-sm text-[#2f4264]">
                <span className="inline-flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-[#eaf0ff] text-[#4d7ee8]">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
                      <path d="M7 6h10v12H7zM9 10h6M9 14h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </span>
                  {row.label}
                </span>
                <span className="text-xl font-semibold text-[#2e4062]">{row.value}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-[#ecf0f8] px-4 py-3">
            <p className="text-sm text-[#6c7e98]">Last cleanup run: 3 hours ago</p>
            <span className="rounded-lg bg-[#e8f7ef] px-3 py-1 text-sm font-semibold text-[#339864]">Successful</span>
          </div>
        </article>

        <article className="overflow-hidden rounded-2xl border border-dashed border-[#d8deea] bg-white/70 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#ecf0f8] px-4 py-3">
            <h2 className="text-2xl font-semibold text-[#243555]">New Widget / Empty Block</h2>
            <span className="text-xl font-semibold leading-none text-[#a7b4ca]">...</span>
          </div>
          <div className="flex min-h-[176px] flex-col items-center justify-center text-center text-[#7f8da4]">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#d3daea] bg-[#f8faff] text-xl">+</span>
            <p className="mt-3 text-sm">Reserved for future admin module</p>
          </div>
        </article>
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.4fr_1fr]">
        <article className="overflow-hidden rounded-2xl border border-[#e2e8f5] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#ecf0f8] px-4 py-3">
            <h2 className="text-2xl font-semibold text-[#243555]">Retention / Deletion Status</h2>
            <span className="text-xl font-semibold leading-none text-[#a7b4ca]">...</span>
          </div>
          <div className="divide-y divide-[#edf2f9] px-4">
            {[
              { label: 'Assessments pending deletion', value: '3' },
              { label: 'Evidence files pending deletion', value: '45' },
              { label: 'Generated PDFs pending deletion', value: '8' },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-3 text-sm text-[#2f4264]">
                <span className="inline-flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-[#eaf0ff] text-[#4d7ee8]">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
                      <path d="M7 6h10v12H7zM9 10h6M9 14h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </span>
                  {row.label}
                </span>
                <span className="text-xl font-semibold text-[#2e4062]">{row.value}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-[#ecf0f8] px-4 py-3">
            <p className="text-sm text-[#6c7e98]">Last cleanup run: 3 hours ago</p>
            <span className="rounded-lg bg-[#e8f7ef] px-3 py-1 text-sm font-semibold text-[#339864]">Successful</span>
          </div>
        </article>

        <article className="overflow-hidden rounded-2xl border border-[#e2e8f5] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#ecf0f8] px-4 py-3">
            <h2 className="text-2xl font-semibold text-[#243555]">System Health</h2>
            <span className="text-xl font-semibold leading-none text-[#a7b4ca]">...</span>
          </div>
          <div className="divide-y divide-[#edf2f9] px-4">
            {['Payments', 'Email notifications', 'PDF generation', 'Storage'].map((item) => (
              <div key={item} className="flex items-center justify-between py-3">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#304567]">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#e9f7ef] text-[#339864]">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
                      <path d="m6.5 12 3.3 3.3L17.5 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {item}
                </span>
                <span className="rounded-md bg-[#e8f7ef] px-2 py-0.5 text-xs font-semibold text-[#339864]">OK</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
