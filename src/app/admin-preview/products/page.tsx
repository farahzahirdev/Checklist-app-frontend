'use client';

import { useState } from 'react';

type ProductRow = {
  name: string;
  version: string;
  tier: string;
  status: 'Active' | 'Draft' | 'Archived';
  updatedAt: string;
};

const initialProducts: ProductRow[] = [
  { name: 'Cybersecurity Baseline', version: 'v2.4', tier: 'Standard', status: 'Active', updatedAt: 'Apr 19, 2026' },
  { name: 'ISO Readiness Pack', version: 'v1.8', tier: 'Pro', status: 'Active', updatedAt: 'Apr 16, 2026' },
  { name: 'SOC 2 Evidence Kit', version: 'v3.1', tier: 'Enterprise', status: 'Draft', updatedAt: 'Apr 14, 2026' },
  { name: 'Privacy Control Bundle', version: 'v1.1', tier: 'Standard', status: 'Archived', updatedAt: 'Apr 10, 2026' },
];

const statusClass: Record<string, string> = {
  Active: 'bg-[#e9f8ef] text-[#2f9960]',
  Draft: 'bg-[#fff4df] text-[#b6862f]',
  Archived: 'bg-[#edf1f8] text-[#607594]',
};

export default function AdminPreviewProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>(initialProducts);

  function updateStatus(name: string, status: ProductRow['status']) {
    setProducts((prev) => prev.map((item) => (item.name === name ? { ...item, status } : item)));
  }

  function removeProduct(name: string) {
    setProducts((prev) => prev.filter((item) => item.name !== name));
  }

  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-[#dbe4f4] bg-white px-5 py-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6f82a3]">Products</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1f2d45]">Product Catalog (Preview)</h1>
      </header>
      <article className="overflow-hidden rounded-2xl border border-[#e2e8f5] bg-white shadow-sm">
        <div className="overflow-x-auto px-4 py-3">
          <table className="min-w-full text-left text-sm text-[#2b3e60]">
            <thead className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7a8ca8]">
              <tr className="border-b border-[#edf2f9]">
                <th className="py-2 pr-4">Product</th><th className="py-2 pr-4">Version</th><th className="py-2 pr-4">Tier</th><th className="py-2 pr-4">Status</th><th className="py-2 pr-4">Updated</th><th className="py-2 pr-4">Update Status</th><th className="py-2">Delete</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.name} className="border-b border-[#edf2f9] last:border-0">
                  <td className="py-3 pr-4 font-semibold text-[#25375a]">{product.name}</td>
                  <td className="py-3 pr-4 text-[#5f7395]">{product.version}</td>
                  <td className="py-3 pr-4 text-[#5f7395]">{product.tier}</td>
                  <td className="py-3 pr-4"><span className={`rounded-md px-2 py-1 text-xs font-semibold ${statusClass[product.status]}`}>{product.status}</span></td>
                  <td className="py-3 pr-4 text-[#5f7395]">{product.updatedAt}</td>
                  <td className="py-3 pr-4">
                    <select
                      value={product.status}
                      onChange={(event) => updateStatus(product.name, event.target.value as ProductRow['status'])}
                      className="rounded-lg border border-[#d4dced] bg-[#f7f9fe] px-2 py-1 text-xs font-semibold text-[#3e69b0]"
                    >
                      <option value="Active">Active</option>
                      <option value="Draft">Draft</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </td>
                  <td className="py-3">
                    <button type="button" onClick={() => removeProduct(product.name)} className="text-sm font-semibold text-[#c74d5f]">Delete</button>
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
