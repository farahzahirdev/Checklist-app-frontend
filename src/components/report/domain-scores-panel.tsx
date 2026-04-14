import type { DomainScore } from '@/lib/checklist-types';

interface DomainScoresPanelProps {
  domainScores: DomainScore[];
}

export function DomainScoresPanel({ domainScores }: DomainScoresPanelProps) {
  // Frontend dev implementation guide:
  // Replace static bars with chart library (e.g., recharts) once design is finalized.
  return (
    <section className="rounded-2xl border border-white/15 bg-black/25 p-5">
      <h3 className="text-lg font-semibold">Domain Scores</h3>
      <ul className="mt-4 space-y-2 text-sm">
        {domainScores.map((item) => (
          <li key={item.domain} className="rounded-lg border border-white/15 p-2">
            {item.domain}: {item.score}
          </li>
        ))}
      </ul>
    </section>
  );
}
