import { ADMIN_PAGE_TITLE_CLASS } from '@/app/(app)/admin/admin-page-title';

const products = [
  { name: 'Cybersecurity Baseline', version: 'v2.4', tier: 'Standard', status: 'Active', updatedAt: 'Apr 19, 2026' },
  { name: 'ISO Readiness Pack', version: 'v1.8', tier: 'Pro', status: 'Active', updatedAt: 'Apr 16, 2026' },
  { name: 'SOC 2 Evidence Kit', version: 'v3.1', tier: 'Enterprise', status: 'Draft', updatedAt: 'Apr 14, 2026' },
  { name: 'Privacy Control Bundle', version: 'v1.1', tier: 'Standard', status: 'Archived', updatedAt: 'Apr 10, 2026' },
] as const;

const statusClass: Record<string, string> = {
  Active: 'bg-[#e9f8ef] text-[#2f9960]',
  Draft: 'bg-[#fff4df] text-[#b6862f]',
  Archived: 'bg-[#edf1f8] text-[#607594]',
};

export default function AdminProductsPage() {
  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-[#dbe4f4] bg-white px-5 py-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6f82a3]">Products</p>
        <h1 className={`mt-2 ${ADMIN_PAGE_TITLE_CLASS}`}>Product Catalog</h1>
        <p className="mt-1 text-sm text-[#607594]">Manage product bundles, pricing tiers, and publish status.</p>
      </header>

      <article className="overflow-hidden rounded-2xl border border-[#e2e8f5] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ecf0f8] px-4 py-3">
          <h2 className="text-xl font-semibold text-[#243555]">Catalog Items</h2>
          <button type="button" className="rounded-xl border border-[#2d4f83] bg-[#182843] px-4 py-2 text-sm font-semibold text-white hover:bg-[#223657]">
            Add Product
          </button>
        </div>

        <div className="overflow-x-auto px-4 py-3">
          <table className="min-w-full text-left text-sm text-[#2b3e60]">
            <thead className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7a8ca8]">
              <tr className="border-b border-[#edf2f9]">
                <th className="py-2 pr-4">Product</th>
                <th className="py-2 pr-4">Version</th>
                <th className="py-2 pr-4">Tier</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Updated</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.name} className="border-b border-[#edf2f9] last:border-0">
                  <td className="py-3 pr-4 font-semibold text-[#25375a]">{product.name}</td>
                  <td className="py-3 pr-4 text-[#5f7395]">{product.version}</td>
                  <td className="py-3 pr-4 text-[#5f7395]">{product.tier}</td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-md px-2 py-1 text-xs font-semibold ${statusClass[product.status]}`}>{product.status}</span>
                  </td>
                  <td className="py-3 pr-4 text-[#5f7395]">{product.updatedAt}</td>
                  <td className="py-3">
                    <button type="button" className="text-sm font-semibold text-[#3e69b0]">
                      Edit
                    </button>
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
