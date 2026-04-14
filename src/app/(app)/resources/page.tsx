export default function ResourcesPage() {
  // Implementation guide for frontend dev:
  // Purpose: Customer resources library (templates, remediation guides, FAQ links).
  // Backend touchpoints (planned):
  // - GET /api/v1/resources
  // Acceptance criteria:
  // - Resource categories are listed
  // - Download/open actions are visible
  return (
    <section className="space-y-5">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/85">Customer</p>
        <h1 className="text-3xl font-semibold">Resources</h1>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-white/15 bg-black/25 p-5">
          <h2 className="text-lg font-semibold">Policy Templates</h2>
          <p className="mt-2 text-sm text-zinc-300">Starter templates for governance, incident response, and access control.</p>
        </article>
        <article className="rounded-2xl border border-white/15 bg-black/25 p-5">
          <h2 className="text-lg font-semibold">Implementation Guides</h2>
          <p className="mt-2 text-sm text-zinc-300">Step-by-step guides linked to high-priority findings.</p>
        </article>
      </div>
    </section>
  );
}
