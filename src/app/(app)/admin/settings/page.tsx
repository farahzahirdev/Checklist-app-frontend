export default function AdminSettingsPage() {
  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-[#dbe4f4] bg-white px-5 py-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6f82a3]">Settings</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1f2d45]">Platform Settings</h1>
        <p className="mt-1 text-sm text-[#607594]">Configure organization defaults, security options, and retention policies.</p>
      </header>

      <div className="grid gap-3 xl:grid-cols-[1.2fr_1fr]">
        <article className="rounded-2xl border border-[#e2e8f5] bg-white p-4 shadow-sm">
          <h2 className="text-xl font-semibold text-[#243555]">General Configuration</h2>
          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="text-sm font-medium text-[#566b8d]">Organization Name</span>
              <input
                type="text"
                defaultValue="Checklist KB"
                className="mt-1 w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm text-[#2a3d5f] outline-none focus:border-[#7ea6e7]"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[#566b8d]">Default Assessment Window (days)</span>
              <input
                type="number"
                defaultValue={7}
                className="mt-1 w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm text-[#2a3d5f] outline-none focus:border-[#7ea6e7]"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[#566b8d]">Data Retention (hours)</span>
              <input
                type="number"
                defaultValue={48}
                className="mt-1 w-full rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm text-[#2a3d5f] outline-none focus:border-[#7ea6e7]"
              />
            </label>
            <button type="button" className="rounded-xl border border-[#2d4f83] bg-[#182843] px-4 py-2 text-sm font-semibold text-white hover:bg-[#223657]">
              Save Changes
            </button>
          </div>
        </article>

        <article className="rounded-2xl border border-[#e2e8f5] bg-white p-4 shadow-sm">
          <h2 className="text-xl font-semibold text-[#243555]">Security Controls</h2>
          <div className="mt-4 space-y-3 text-sm text-[#4f6487]">
            {[
              'Enforce MFA for admins',
              'Require strong password policy',
              'Lock account after repeated failures',
              'Enable audit log export permissions',
            ].map((item) => (
              <label key={item} className="flex items-center justify-between rounded-xl border border-[#e3e9f6] bg-[#f9fbff] px-3 py-2">
                <span>{item}</span>
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#3f74df]" />
              </label>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
