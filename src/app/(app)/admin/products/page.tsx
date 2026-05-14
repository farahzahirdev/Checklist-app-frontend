'use client';

import { ADMIN_PAGE_TITLE_CLASS } from '@/app/(app)/admin/admin-page-title';
import { translate, useLocale } from '@/lib/i18n';
import { adminProductsMessages } from '@/locales/admin-products';

const products = [
  {
    name: 'Cybersecurity Baseline',
    version: 'v2.4',
    tierKey: 'standard' as const,
    statusKey: 'active' as const,
    updatedAt: 'Apr 19, 2026',
  },
  {
    name: 'ISO Readiness Pack',
    version: 'v1.8',
    tierKey: 'pro' as const,
    statusKey: 'active' as const,
    updatedAt: 'Apr 16, 2026',
  },
  {
    name: 'SOC 2 Evidence Kit',
    version: 'v3.1',
    tierKey: 'enterprise' as const,
    statusKey: 'draft' as const,
    updatedAt: 'Apr 14, 2026',
  },
  {
    name: 'Privacy Control Bundle',
    version: 'v1.1',
    tierKey: 'standard' as const,
    statusKey: 'archived' as const,
    updatedAt: 'Apr 10, 2026',
  },
];

const statusClass: Record<string, string> = {
  active: 'bg-[#e9f8ef] text-[#2f9960]',
  draft: 'bg-[#fff4df] text-[#b6862f]',
  archived: 'bg-[#edf1f8] text-[#607594]',
};

export default function AdminProductsPage() {
  const { locale } = useLocale();
  const t = (key: string, values?: Record<string, string>) => translate(adminProductsMessages, locale, key, values);

  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-[#dbe4f4] bg-white px-5 py-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6f82a3]">{t('hero.eyebrow')}</p>
        <h1 className={`mt-2 ${ADMIN_PAGE_TITLE_CLASS}`}>{t('hero.title')}</h1>
        <p className="mt-1 text-sm text-[#607594]">{t('hero.subtitle')}</p>
      </header>

      <article className="overflow-hidden rounded-2xl border border-[#e2e8f5] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ecf0f8] px-4 py-3">
          <h2 className="text-xl font-semibold text-[#243555]">{t('section.title')}</h2>
          <button
            type="button"
            className="rounded-xl border border-[#2d4f83] bg-[#182843] px-4 py-2 text-sm font-semibold text-white hover:bg-[#223657]"
          >
            {t('actions.add')}
          </button>
        </div>

        <div className="overflow-x-auto px-4 py-3">
          <table className="min-w-full text-left text-sm text-[#2b3e60]">
            <thead className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7a8ca8]">
              <tr className="border-b border-[#edf2f9]">
                <th className="py-2 pr-4">{t('th.product')}</th>
                <th className="py-2 pr-4">{t('th.version')}</th>
                <th className="py-2 pr-4">{t('th.tier')}</th>
                <th className="py-2 pr-4">{t('th.status')}</th>
                <th className="py-2 pr-4">{t('th.updated')}</th>
                <th className="py-2">{t('th.action')}</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.name} className="border-b border-[#edf2f9] last:border-0">
                  <td className="py-3 pr-4 font-semibold text-[#25375a]">{product.name}</td>
                  <td className="py-3 pr-4 text-[#5f7395]">{product.version}</td>
                  <td className="py-3 pr-4 text-[#5f7395]">{t(`tier.${product.tierKey}`)}</td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-md px-2 py-1 text-xs font-semibold ${statusClass[product.statusKey]}`}>
                      {t(`status.${product.statusKey}`)}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-[#5f7395]">{product.updatedAt}</td>
                  <td className="py-3">
                    <button type="button" className="text-sm font-semibold text-[#3e69b0]">
                      {t('actions.edit')}
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
