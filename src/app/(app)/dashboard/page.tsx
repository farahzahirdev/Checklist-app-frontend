import { MilestoneOneControlCenter } from '@/components/milestone-one-control-center';

export default function DashboardPage() {
  return (
    <section className="space-y-8">
      <header className="space-y-4">
        <p className="text-xs uppercase tracking-[0.34em] text-cyan-200/90">
          Milestone 1 Frontend
        </p>
        <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-zinc-100 md:text-5xl">
          Access Control Center
        </h1>
        <p className="max-w-3xl text-base leading-7 text-zinc-300">
          This screen validates the secure access lifecycle end-to-end: API reachability, TOTP setup and
          verification, payment unlock simulation, and preview of the 7-day assessment window rule.
        </p>
      </header>
      <MilestoneOneControlCenter />
    </section>
  );
}