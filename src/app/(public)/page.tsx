const highlights = [
  'Public website shell',
  'Authenticated app layout',
  'Milestone 1 ready structure',
];

export default function HomePage() {
  return (
    <main className="min-h-[calc(100vh-73px)] bg-[radial-gradient(circle_at_top,_#17324d,_#08111b_58%,_#05080d)]">
      <section className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-6xl flex-col justify-center px-6 py-16 text-slate-100">
        <div className="max-w-3xl space-y-8">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">
            Checklist App
          </p>
          <h1 className="text-5xl font-semibold tracking-tight text-white md:text-7xl">
            A secure foundation for the checklist platform.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
            This frontend scaffold separates the public site and the app shell so milestone 1 can move fast without tying the UI to Docker or deployment details.
          </p>
          <div className="flex flex-wrap gap-3">
            {highlights.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
