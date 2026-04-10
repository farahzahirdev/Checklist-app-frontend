export function SiteHeader() {
  return (
    <header className="border-b border-white/10 bg-black/20 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-300/80">
            Checklist App
          </p>
          <p className="text-xs text-slate-400">Frontend boilerplate</p>
        </div>
        <nav className="text-sm text-slate-300">
          <span>Public site</span>
          <span className="mx-3 text-slate-500">/</span>
          <span>App shell</span>
        </nav>
      </div>
    </header>
  );
}
