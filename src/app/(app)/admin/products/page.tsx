'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ADMIN_PAGE_TITLE_CLASS } from '@/app/(app)/admin/admin-page-title';
import { AdminBreadcrumbs } from '@/components/admin-breadcrumbs';
import { translate, useLocale } from '@/lib/i18n';
import { adminProductsMessages } from '@/locales/admin-products';

import {
  createAdminProduct,
  createAdminProductCategory,
  listAdminProductCategories,
  listAdminProducts,
  syncChecklistProducts,
  updateAdminProduct,
  type AdminProduct,
  type AdminProductCategory,
  type ProductKind,
  type ProductStatus,
} from '@/lib/admin-products';

const statusClass: Record<string, string> = {
  published: 'bg-[#e9f8ef] text-[#2f9960]',
  draft: 'bg-[#fff4df] text-[#b6862f]',
  coming_soon: 'bg-[#eaf2ff] text-[#3f74df]',
  archived: 'bg-[#edf1f8] text-[#607594]',
};

const kindClass: Record<string, string> = {
  checklist: 'bg-[#edf6ff] text-[#3568a9]',
  documentation: 'bg-[#f3edff] text-[#6944b2]',
  module: 'bg-[#edf8f0] text-[#2f9960]',
};

type ProductFormState = {
  name: string;
  slug: string;
  short_description: string;
  category_code: string;
  product_kind: ProductKind;
  status: ProductStatus;
};

type CategoryFormState = {
  code: string;
  name: string;
  description: string;
};

export default function AdminProductsPage() {
  const { locale } = useLocale();
  const t = (key: string, values?: Record<string, string>) => translate(adminProductsMessages, locale, key, values);

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminProductCategory[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [productForm, setProductForm] = useState<ProductFormState>({
    name: '',
    slug: '',
    short_description: '',
    category_code: '',
    product_kind: 'documentation',
    status: 'draft',
  });
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>({
    code: '',
    name: '',
    description: '',
  });

  const queryParams = useMemo(
    () => ({
      limit: 200,
      search: search.trim() || undefined,
      category_code: categoryFilter !== 'all' ? categoryFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : '',
    }),
    [search, categoryFilter, statusFilter],
  );

  function resetProductForm() {
    setEditingProduct(null);
    setProductForm({
      name: '',
      slug: '',
      short_description: '',
      category_code: categories[0]?.code ?? '',
      product_kind: 'documentation',
      status: 'draft',
    });
  }

  function openCreateProductModal() {
    resetProductForm();
    setShowProductModal(true);
  }

  function openEditProductModal(product: AdminProduct) {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      slug: product.slug,
      short_description: product.short_description ?? '',
      category_code: product.category?.code ?? categories[0]?.code ?? '',
      product_kind: product.product_kind,
      status: product.status,
    });
    setShowProductModal(true);
  }

  async function loadCategories() {
    const response = await listAdminProductCategories({ limit: 200 });
    setCategories(response.categories);
  }

  async function loadProducts() {
    const response = await listAdminProducts(queryParams);
    setProducts(response.products);
  }

  async function hydrateData() {
    setLoading(true);
    try {
      await Promise.all([loadCategories(), loadProducts()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toast.loadFailed'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void hydrateData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loading) return;
    void loadProducts().catch((err) => {
      toast.error(err instanceof Error ? err.message : t('toast.loadFailed'));
    });
  }, [queryParams, loading]);

  async function handleSyncChecklists() {
    setSyncing(true);
    try {
      const response = await syncChecklistProducts();
      setProducts(response.products);
      toast.success(t('toast.syncSuccess'));
      await loadCategories();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toast.syncFailed'));
    } finally {
      setSyncing(false);
    }
  }

  async function handleSaveCategory() {
    const code = categoryForm.code.trim();
    const name = categoryForm.name.trim();
    if (!code || !name) {
      toast.error(t('toast.categoryRequired'));
      return;
    }
    setSavingCategory(true);
    try {
      await createAdminProductCategory({
        code,
        name,
        description: categoryForm.description.trim() || undefined,
      });
      toast.success(t('toast.categoryCreated'));
      setShowCategoryModal(false);
      setCategoryForm({ code: '', name: '', description: '' });
      await loadCategories();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toast.categoryCreateFailed'));
    } finally {
      setSavingCategory(false);
    }
  }

  async function handleSaveProduct() {
    const payload = {
      name: productForm.name.trim(),
      slug: productForm.slug.trim() || undefined,
      short_description: productForm.short_description.trim() || undefined,
      category_code: productForm.category_code,
      product_kind: productForm.product_kind,
      status: productForm.status,
    };

    if (!payload.name || !payload.category_code) {
      toast.error(t('toast.productRequired'));
      return;
    }

    setSavingProduct(true);
    try {
      if (editingProduct) {
        await updateAdminProduct(editingProduct.id, payload);
        toast.success(t('toast.productUpdated'));
      } else {
        await createAdminProduct(payload);
        toast.success(t('toast.productCreated'));
      }
      setShowProductModal(false);
      await loadProducts();
      await loadCategories();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toast.productSaveFailed'));
    } finally {
      setSavingProduct(false);
    }
  }

  const totals = {
    all: products.length,
    published: products.filter((item) => item.status === 'published').length,
    draft: products.filter((item) => item.status === 'draft').length,
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(locale === 'cs' ? 'cs-CZ' : 'en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-[#dbe4f4] bg-white px-5 py-4 shadow-sm">
        <AdminBreadcrumbs
          items={[
            { label: t('crumbs.dashboard'), href: '/admin' },
            { label: t('crumbs.products') },
          ]}
        />
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6f82a3]">{t('hero.eyebrow')}</p>
        <h1 className={`mt-2 ${ADMIN_PAGE_TITLE_CLASS}`}>{t('hero.title')}</h1>
        <p className="mt-1 text-sm text-[#607594]">{t('hero.subtitle')}</p>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        {[
          { label: t('kpi.total'), value: totals.all.toString() },
          { label: t('kpi.published'), value: totals.published.toString() },
          { label: t('kpi.draft'), value: totals.draft.toString() },
        ].map((item) => (
          <article key={item.label} className="rounded-2xl border border-[#13305c] bg-[linear-gradient(140deg,#071733_0%,#0c2144_50%,#13356d_100%)] p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.14em] text-[#9db8e6]">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
          </article>
        ))}
      </div>

      <article className="overflow-hidden rounded-2xl border border-[#e2e8f5] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ecf0f8] px-4 py-3">
          <h2 className="text-xl font-semibold text-[#243555]">{t('section.title')}</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSyncChecklists}
              disabled={syncing}
              className="rounded-xl border border-[#2d4f83] bg-white px-4 py-2 text-sm font-semibold text-[#2d4f83] hover:bg-[#f2f7ff] disabled:opacity-70"
            >
              {syncing ? t('actions.syncing') : t('actions.sync')}
            </button>
            <button
              type="button"
              onClick={() => setShowCategoryModal(true)}
              className="rounded-xl border border-[#2d4f83] bg-white px-4 py-2 text-sm font-semibold text-[#2d4f83] hover:bg-[#f2f7ff]"
            >
              {t('actions.addCategory')}
            </button>
            <button
              type="button"
              onClick={openCreateProductModal}
              className="rounded-xl border border-[#2d4f83] bg-[#182843] px-4 py-2 text-sm font-semibold text-white hover:bg-[#223657]"
            >
              {t('actions.add')}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-b border-[#ecf0f8] px-4 py-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('search.placeholder')}
            className="min-w-[240px] flex-1 rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm text-[#25375a] outline-none focus:border-[#3e69b0]"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as ProductStatus | 'all')}
            className="rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm text-[#25375a]"
          >
            <option value="all">{t('filters.statusAll')}</option>
            <option value="published">{t('status.published')}</option>
            <option value="draft">{t('status.draft')}</option>
            <option value="coming_soon">{t('status.coming_soon')}</option>
            <option value="archived">{t('status.archived')}</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm text-[#25375a]"
          >
            <option value="all">{t('filters.categoryAll')}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.code}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto px-4 py-3">
          <table className="min-w-full text-left text-sm text-[#2b3e60]">
            <thead className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7a8ca8]">
              <tr className="border-b border-[#edf2f9]">
                <th className="py-2 pr-4">{t('th.product')}</th>
                <th className="py-2 pr-4">{t('th.category')}</th>
                <th className="py-2 pr-4">{t('th.kind')}</th>
                <th className="py-2 pr-4">{t('th.status')}</th>
                <th className="py-2 pr-4">{t('th.updated')}</th>
                <th className="py-2">{t('th.action')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="py-6 text-sm text-[#5f7395]" colSpan={6}>
                    {t('state.loading')}
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td className="py-6 text-sm text-[#5f7395]" colSpan={6}>
                    {t('state.empty')}
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-b border-[#edf2f9] last:border-0">
                    <td className="py-3 pr-4">
                      <p className="font-semibold text-[#25375a]">{product.name}</p>
                      <p className="mt-1 text-xs text-[#6f82a3]">/{product.slug}</p>
                    </td>
                    <td className="py-3 pr-4 text-[#5f7395]">{product.category?.name ?? '-'}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`rounded-md px-2 py-1 text-xs font-semibold ${kindClass[product.product_kind] ?? 'bg-[#edf1f8] text-[#607594]'}`}
                      >
                        {t(`kind.${product.product_kind}`)}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-md px-2 py-1 text-xs font-semibold ${statusClass[product.status] ?? 'bg-[#edf1f8] text-[#607594]'}`}>
                        {t(`status.${product.status}`)}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-[#5f7395]">{formatDate(product.updated_at)}</td>
                    <td className="py-3">
                      <button
                        type="button"
                        onClick={() => openEditProductModal(product)}
                        className="text-sm font-semibold text-[#3e69b0]"
                      >
                        {t('actions.edit')}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </article>

      {showProductModal ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#08162c]/70 px-4">
          <article className="w-full max-w-xl rounded-2xl border border-[#d5deef] bg-white p-5 shadow-2xl">
            <h3 className="text-lg font-semibold text-[#243555]">
              {editingProduct ? t('modal.editTitle') : t('modal.createTitle')}
            </h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="space-y-1 md:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6f82a3]">{t('form.name')}</span>
                <input
                  value={productForm.name}
                  onChange={(event) => setProductForm((previous) => ({ ...previous, name: event.target.value }))}
                  className="w-full rounded-xl border border-[#d4dced] px-3 py-2 text-sm text-[#25375a] outline-none focus:border-[#3e69b0]"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6f82a3]">{t('form.slug')}</span>
                <input
                  value={productForm.slug}
                  onChange={(event) => setProductForm((previous) => ({ ...previous, slug: event.target.value }))}
                  className="w-full rounded-xl border border-[#d4dced] px-3 py-2 text-sm text-[#25375a] outline-none focus:border-[#3e69b0]"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6f82a3]">{t('form.category')}</span>
                <select
                  value={productForm.category_code}
                  onChange={(event) => setProductForm((previous) => ({ ...previous, category_code: event.target.value }))}
                  className="w-full rounded-xl border border-[#d4dced] px-3 py-2 text-sm text-[#25375a]"
                >
                  <option value="">{t('form.selectCategory')}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.code}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6f82a3]">{t('form.kind')}</span>
                <select
                  value={productForm.product_kind}
                  onChange={(event) =>
                    setProductForm((previous) => ({ ...previous, product_kind: event.target.value as ProductKind }))
                  }
                  className="w-full rounded-xl border border-[#d4dced] px-3 py-2 text-sm text-[#25375a]"
                >
                  <option value="checklist">{t('kind.checklist')}</option>
                  <option value="documentation">{t('kind.documentation')}</option>
                  <option value="module">{t('kind.module')}</option>
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6f82a3]">{t('form.status')}</span>
                <select
                  value={productForm.status}
                  onChange={(event) =>
                    setProductForm((previous) => ({ ...previous, status: event.target.value as ProductStatus }))
                  }
                  className="w-full rounded-xl border border-[#d4dced] px-3 py-2 text-sm text-[#25375a]"
                >
                  <option value="draft">{t('status.draft')}</option>
                  <option value="published">{t('status.published')}</option>
                  <option value="coming_soon">{t('status.coming_soon')}</option>
                  <option value="archived">{t('status.archived')}</option>
                </select>
              </label>
              <label className="space-y-1 md:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6f82a3]">{t('form.shortDescription')}</span>
                <textarea
                  value={productForm.short_description}
                  onChange={(event) =>
                    setProductForm((previous) => ({ ...previous, short_description: event.target.value }))
                  }
                  rows={3}
                  className="w-full rounded-xl border border-[#d4dced] px-3 py-2 text-sm text-[#25375a] outline-none focus:border-[#3e69b0]"
                />
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="rounded-xl border border-[#cad5e8] bg-white px-4 py-2 text-sm font-semibold text-[#38506f] hover:bg-[#f7faff]"
              >
                {t('actions.cancel')}
              </button>
              <button
                type="button"
                onClick={() => void handleSaveProduct()}
                disabled={savingProduct}
                className="rounded-xl border border-[#2d4f83] bg-[#182843] px-4 py-2 text-sm font-semibold text-white hover:bg-[#223657] disabled:opacity-70"
              >
                {savingProduct ? t('actions.saving') : t('actions.save')}
              </button>
            </div>
          </article>
        </div>
      ) : null}

      {showCategoryModal ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#08162c]/70 px-4">
          <article className="w-full max-w-lg rounded-2xl border border-[#d5deef] bg-white p-5 shadow-2xl">
            <h3 className="text-lg font-semibold text-[#243555]">{t('modal.categoryTitle')}</h3>
            <div className="mt-4 grid gap-3">
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6f82a3]">{t('form.categoryCode')}</span>
                <input
                  value={categoryForm.code}
                  onChange={(event) => setCategoryForm((previous) => ({ ...previous, code: event.target.value }))}
                  className="w-full rounded-xl border border-[#d4dced] px-3 py-2 text-sm text-[#25375a] outline-none focus:border-[#3e69b0]"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6f82a3]">{t('form.categoryName')}</span>
                <input
                  value={categoryForm.name}
                  onChange={(event) => setCategoryForm((previous) => ({ ...previous, name: event.target.value }))}
                  className="w-full rounded-xl border border-[#d4dced] px-3 py-2 text-sm text-[#25375a] outline-none focus:border-[#3e69b0]"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6f82a3]">{t('form.description')}</span>
                <textarea
                  value={categoryForm.description}
                  onChange={(event) =>
                    setCategoryForm((previous) => ({ ...previous, description: event.target.value }))
                  }
                  rows={3}
                  className="w-full rounded-xl border border-[#d4dced] px-3 py-2 text-sm text-[#25375a] outline-none focus:border-[#3e69b0]"
                />
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="rounded-xl border border-[#cad5e8] bg-white px-4 py-2 text-sm font-semibold text-[#38506f] hover:bg-[#f7faff]"
              >
                {t('actions.cancel')}
              </button>
              <button
                type="button"
                onClick={() => void handleSaveCategory()}
                disabled={savingCategory}
                className="rounded-xl border border-[#2d4f83] bg-[#182843] px-4 py-2 text-sm font-semibold text-white hover:bg-[#223657] disabled:opacity-70"
              >
                {savingCategory ? t('actions.saving') : t('actions.createCategory')}
              </button>
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
}
