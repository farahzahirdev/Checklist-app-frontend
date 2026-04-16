'use client';

import { useState } from 'react';

type ReportRow = {
  company: string;
  checklist: string;
  completedOn: string;
  reviewer: string;
  status: 'Ready' | 'Draft' | 'Published';
};

const initialReportRows: ReportRow[] = [
  { company: 'Acme Corp', checklist: 'Cybersecurity Checklist', completedOn: 'Apr 21, 2026', reviewer: 'John Novak', status: 'Ready' },
  { company: 'Blue Harbor', checklist: 'ISO Readiness', completedOn: 'Apr 20, 2026', reviewer: 'Nina Ford', status: 'Draft' },
  { company: 'Delta Systems', checklist: 'SOC 2 Baseline', completedOn: 'Apr 18, 2026', reviewer: 'John Novak', status: 'Published' },
  { company: 'Nova Health', checklist: 'HIPAA Controls', completedOn: 'Apr 17, 2026', reviewer: 'Maya Lee', status: 'Published' },
];

const statusClass: Record<string, string> = {
  Ready: 'bg-[#eaf2ff] text-[#3f74df]',
  Draft: 'bg-[#fff4df] text-[#b6862f]',
  Published: 'bg-[#e9f8ef] text-[#2f9960]',
};

export default function AdminPreviewReportsPage() {
  const [reportRows, setReportRows] = useState<ReportRow[]>(initialReportRows);

  function updateStatus(company: string, status: ReportRow['status']) {
    setReportRows((prev) => prev.map((row) => (row.company === company ? { ...row, status } : row)));
  }

  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-[#dbe4f4] bg-white px-5 py-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6f82a3]">Reports</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1f2d45]">Report Center (Preview)</h1>
      </header>
      <article className="overflow-hidden rounded-2xl border border-[#e2e8f5] bg-white shadow-sm">
        <div className="overflow-x-auto px-4 py-3">
          <table className="min-w-full text-left text-sm text-[#2b3e60]">
            <thead className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7a8ca8]">
              <tr className="border-b border-[#edf2f9]">
                <th className="py-2 pr-4">Company</th><th className="py-2 pr-4">Checklist</th><th className="py-2 pr-4">Completed</th><th className="py-2 pr-4">Reviewer</th><th className="py-2 pr-4">Status</th><th className="py-2">Update</th>
              </tr>
            </thead>
            <tbody>
              {reportRows.map((row) => (
                <tr key={`${row.company}-${row.completedOn}`} className="border-b border-[#edf2f9] last:border-0">
                  <td className="py-3 pr-4 font-semibold text-[#25375a]">{row.company}</td>
                  <td className="py-3 pr-4 text-[#5f7395]">{row.checklist}</td>
                  <td className="py-3 pr-4 text-[#5f7395]">{row.completedOn}</td>
                  <td className="py-3 pr-4 text-[#5f7395]">{row.reviewer}</td>
                  <td className="py-3 pr-4"><span className={`rounded-md px-2 py-1 text-xs font-semibold ${statusClass[row.status]}`}>{row.status}</span></td>
                  <td className="py-3">
                    <select
                      value={row.status}
                      onChange={(event) => updateStatus(row.company, event.target.value as ReportRow['status'])}
                      className="rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-2 py-1 text-xs font-semibold text-[#3e69b0]"
                    >
                      <option value="Ready">Ready</option>
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                    </select>
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
