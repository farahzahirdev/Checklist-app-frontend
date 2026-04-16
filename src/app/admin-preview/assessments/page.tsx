'use client';

import { useState } from 'react';

type AssessmentRow = {
  company: string;
  checklist: string;
  owner: string;
  started: string;
  due: string;
  status: 'In Progress' | 'Awaiting Review' | 'Published' | 'Expired';
};

const initialAssessmentRows: AssessmentRow[] = [
  { company: 'Acme Corp', checklist: 'Cybersecurity Checklist', owner: 'Sarah Khan', started: 'Apr 12, 2026', due: 'Apr 19, 2026', status: 'In Progress' },
  { company: 'Blue Harbor', checklist: 'ISO Readiness', owner: 'Diego Ross', started: 'Apr 10, 2026', due: 'Apr 17, 2026', status: 'Awaiting Review' },
  { company: 'Delta Systems', checklist: 'SOC 2 Baseline', owner: 'Maya Lee', started: 'Apr 08, 2026', due: 'Apr 15, 2026', status: 'Published' },
  { company: 'Nova Health', checklist: 'HIPAA Controls', owner: 'Ali Ahmed', started: 'Apr 07, 2026', due: 'Apr 14, 2026', status: 'Expired' },
];

const statusClass: Record<string, string> = {
  'In Progress': 'bg-[#eef4ff] text-[#3f74df]',
  'Awaiting Review': 'bg-[#fff4df] text-[#b6862f]',
  Published: 'bg-[#e9f8ef] text-[#2f9960]',
  Expired: 'bg-[#ffedf0] text-[#cc5163]',
};

export default function AdminPreviewAssessmentsPage() {
  const [assessmentRows, setAssessmentRows] = useState<AssessmentRow[]>(initialAssessmentRows);

  function updateStatus(company: string, status: AssessmentRow['status']) {
    setAssessmentRows((prev) => prev.map((row) => (row.company === company ? { ...row, status } : row)));
  }

  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-[#dbe4f4] bg-white px-5 py-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6f82a3]">Assessments</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1f2d45]">Assessment Management (Preview)</h1>
      </header>
      <article className="overflow-hidden rounded-2xl border border-[#e2e8f5] bg-white shadow-sm">
        <div className="overflow-x-auto px-4 py-3">
          <table className="min-w-full text-left text-sm text-[#2b3e60]">
            <thead className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7a8ca8]">
              <tr className="border-b border-[#edf2f9]">
                <th className="py-2 pr-4">Company</th><th className="py-2 pr-4">Checklist</th><th className="py-2 pr-4">Owner</th><th className="py-2 pr-4">Started</th><th className="py-2 pr-4">Due</th><th className="py-2 pr-4">Status</th><th className="py-2">Update</th>
              </tr>
            </thead>
            <tbody>
              {assessmentRows.map((row) => (
                <tr key={`${row.company}-${row.checklist}`} className="border-b border-[#edf2f9] last:border-0">
                  <td className="py-3 pr-4 font-semibold text-[#25375a]">{row.company}</td>
                  <td className="py-3 pr-4 text-[#5f7395]">{row.checklist}</td>
                  <td className="py-3 pr-4 text-[#5f7395]">{row.owner}</td>
                  <td className="py-3 pr-4 text-[#5f7395]">{row.started}</td>
                  <td className="py-3 pr-4 text-[#5f7395]">{row.due}</td>
                  <td className="py-3 pr-4"><span className={`rounded-md px-2 py-1 text-xs font-semibold ${statusClass[row.status]}`}>{row.status}</span></td>
                  <td className="py-3">
                    <select
                      value={row.status}
                      onChange={(event) => updateStatus(row.company, event.target.value as AssessmentRow['status'])}
                      className="rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-2 py-1 text-xs font-semibold text-[#3e69b0]"
                    >
                      <option value="In Progress">In Progress</option>
                      <option value="Awaiting Review">Awaiting Review</option>
                      <option value="Published">Published</option>
                      <option value="Expired">Expired</option>
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
