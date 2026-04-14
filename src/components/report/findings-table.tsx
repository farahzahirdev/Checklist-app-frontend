import type { Finding } from '@/lib/checklist-types';

interface FindingsTableProps {
  findings: Finding[];
}

export function FindingsTable({ findings }: FindingsTableProps) {
  // Frontend dev implementation guide:
  // Add sorting/filtering by risk impact and domain once API pagination is available.
  return (
    <section className="rounded-2xl border border-white/15 bg-black/25 p-5">
      <h3 className="text-lg font-semibold">Detailed Findings Preview</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="text-left text-zinc-300">
              <th className="border-b border-white/15 p-2">ID</th>
              <th className="border-b border-white/15 p-2">Finding</th>
              <th className="border-b border-white/15 p-2">Domain</th>
              <th className="border-b border-white/15 p-2">Risk Impact</th>
              <th className="border-b border-white/15 p-2">Recommendation</th>
            </tr>
          </thead>
          <tbody>
            {findings.map((finding) => (
              <tr key={finding.id}>
                <td className="border-b border-white/10 p-2">{finding.id}</td>
                <td className="border-b border-white/10 p-2">{finding.finding}</td>
                <td className="border-b border-white/10 p-2">{finding.domain}</td>
                <td className="border-b border-white/10 p-2">{finding.riskImpact}</td>
                <td className="border-b border-white/10 p-2">{finding.recommendation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
