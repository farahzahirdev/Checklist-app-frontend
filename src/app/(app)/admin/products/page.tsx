'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { TipTapRichTextEditor } from '@/components/cms/TipTapRichTextEditor';
import {
  ADMIN_PAGE_HERO_EYEBROW_CLASS,
  ADMIN_PAGE_HERO_HEADER_CLASS,
  ADMIN_PAGE_HERO_SUBTITLE_CLASS,
  ADMIN_PAGE_TITLE_CLASS,
} from '@/app/(app)/admin/admin-page-title';
import { translate, useLocale } from '@/lib/i18n';
import { adminProductsMessages } from '@/locales/admin-products';

import {
  createAdminProduct,
  createAdminProductCategory,
  deleteAdminProduct,
  getAdminProduct,
  listAdminProductCategories,
  listAdminProducts,
  uploadProductBrochurePdf,
  uploadProductDocumentationFile,
  uploadProductHeroImage,
  updateAdminProduct,
  updateAdminProductCategory,
  type AdminProduct,
  type AdminProductCategory,
  type CreateAdminProductPayload,
  type DocumentationFile,
  type ProductKind,
  type ProductStatus,
} from '@/lib/admin-products';
import { getApiBaseUrl } from '@/lib/api';

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

type ToolbarSelectOption = { value: string; label: string };

function AdminToolbarSelect({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: string;
  onChange: (next: string) => void;
  options: ToolbarSelectOption[];
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(ev: PointerEvent) {
      const el = rootRef.current;
      if (el && !el.contains(ev.target as Node)) setOpen(false);
    }
    function handleKeyDown(ev: KeyboardEvent) {
      if (ev.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative min-w-[12rem] shrink-0 ${open ? 'z-[60]' : 'z-[20]'}`}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((previous) => !previous)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-[#b8c9e6] bg-[linear-gradient(180deg,#ffffff_0%,#f0f5ff_100%)] px-3.5 py-2 text-left text-sm font-semibold text-[#1a2d4d] shadow-sm outline-none transition hover:border-[#7a9bd4] hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#3e69b0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f7fc]"
      >
        <span className="truncate">{selected.label}</span>
        <svg
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden
          className={`h-4 w-4 shrink-0 text-[#4a6aa3] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path
            d="M5 7.5 10 12.5 15 7.5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open ? (
        <ul
          className="absolute left-0 right-0 z-[70] mt-1 max-h-64 overflow-auto rounded-xl border border-[#c5d2eb] bg-white py-1 shadow-[0_12px_28px_rgba(15,40,84,0.12)] ring-1 ring-[#0a1f4a]/5"
          role="listbox"
        >
          {options.map((opt) => {
            const isActive = opt.value === value;
            return (
              <li key={opt.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  className={`flex w-full items-center px-3 py-2 text-left text-sm transition-colors ${
                    isActive
                      ? 'bg-[linear-gradient(90deg,#eef4ff_0%,#f7faff_100%)] font-semibold text-[#10284f]'
                      : 'text-[#334866] hover:bg-[#f4f8ff]'
                  }`}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  {opt.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

type ProductFormState = {
  name: string;
  slug: string;
  short_description: string;
  description: string;
  benefits: string;
  category_code: string;
  product_kind: ProductKind;
  status: ProductStatus;
  brochure_pdf_url: string;
  documentation_files: DocumentationFile[];
  hero_image_url: string;
  external_url: string;
  cta_label: string;
  display_order: string;
  is_featured: boolean;
};

type CategoryFormState = {
  code: string;
  name: string;
  description: string;
  display_order: string;
  is_active: boolean;
};

const INPUT_CLASS =
  'w-full rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm text-[#25375a] outline-none focus:border-[#3e69b0]';

function productToForm(product: AdminProduct, categories: AdminProductCategory[]): ProductFormState {
  return {
    name: product.name,
    slug: product.slug,
    short_description: product.short_description ?? '',
    description: product.description ?? '',
    benefits: product.benefits ?? '',
    category_code: product.category?.code ?? categories[0]?.code ?? '',
    product_kind: product.product_kind,
    status: product.status,
    brochure_pdf_url: product.brochure_pdf_url ?? '',
    documentation_files: product.documentation_files ?? [],
    hero_image_url: product.hero_image_url ?? '',
    external_url: product.external_url ?? '',
    cta_label: product.cta_label ?? '',
    display_order: String(product.display_order ?? 0),
    is_featured: product.is_featured ?? false,
  };
}

function emptyProductForm(categories: AdminProductCategory[]): ProductFormState {
  return {
    name: '',
    slug: '',
    short_description: '',
    description: '',
    benefits: '',
    category_code: categories[0]?.code ?? '',
    product_kind: 'documentation',
    status: 'draft',
    brochure_pdf_url: '',
    documentation_files: [],
    hero_image_url: '',
    external_url: '',
    cta_label: '',
    display_order: '0',
    is_featured: false,
  };
}

function emptyCategoryForm(): CategoryFormState {
  return { code: '', name: '', description: '', display_order: '0', is_active: true };
}

function optionalNullableText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function absoluteMediaUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const base = getApiBaseUrl().replace(/\/$/, '');
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${base}${path}`;
}

function categoryToForm(category: AdminProductCategory): CategoryFormState {
  return {
    code: category.code,
    name: category.name,
    description: category.description ?? '',
    display_order: String(category.display_order ?? 0),
    is_active: category.is_active,
  };
}

export default function AdminProductsPage() {
  const { locale } = useLocale();
  const t = (key: string, values?: Record<string, string>) => translate(adminProductsMessages, locale, key, values);

  const [loading, setLoading] = useState(true);
  const [savingProduct, setSavingProduct] = useState(false);
  const [uploadingHeroImage, setUploadingHeroImage] = useState(false);
  const [uploadingBrochurePdf, setUploadingBrochurePdf] = useState(false);
  const [uploadingDocumentationFile, setUploadingDocumentationFile] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [loadingProductDetail, setLoadingProductDetail] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [productPendingDelete, setProductPendingDelete] = useState<AdminProduct | null>(null);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminProductCategory[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminProductCategory | null>(null);
  const [productForm, setProductForm] = useState<ProductFormState>(() => emptyProductForm([]));
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(() => emptyCategoryForm());
  const productsLoadSeq = useRef(0);

  const statusFilterOptions = useMemo(
    () => [
      { value: 'all', label: translate(adminProductsMessages, locale, 'filters.statusAll') },
      { value: 'published', label: translate(adminProductsMessages, locale, 'status.published') },
      { value: 'draft', label: translate(adminProductsMessages, locale, 'status.draft') },
      { value: 'coming_soon', label: translate(adminProductsMessages, locale, 'status.coming_soon') },
      { value: 'archived', label: translate(adminProductsMessages, locale, 'status.archived') },
    ],
    [locale],
  );

  const categoryFilterOptions = useMemo(
    () => [
      { value: 'all', label: translate(adminProductsMessages, locale, 'filters.categoryAll') },
      ...categories.map((c) => ({ value: c.code, label: c.name })),
    ],
    [locale, categories],
  );

  const queryParams = useMemo(
    (): {
      limit: number;
      search?: string;
      category_code?: string;
      status?: ProductStatus | '';
    } => ({
      limit: 200,
      search: search.trim() || undefined,
      category_code: categoryFilter !== 'all' ? categoryFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : '',
    }),
    [search, categoryFilter, statusFilter],
  );

  function resetProductForm() {
    setEditingProduct(null);
    setProductForm(emptyProductForm(categories));
  }

  function openCreateProductModal() {
    resetProductForm();
    setShowProductModal(true);
  }

  function openEditCategoryModal(category: AdminProductCategory) {
    setEditingCategory(category);
    setCategoryForm(categoryToForm(category));
    setShowCategoryModal(true);
  }

  async function openEditProductModal(product: AdminProduct) {
    setEditingProduct(product);
    setProductForm(productToForm(product, categories));
    setShowProductModal(true);
    setLoadingProductDetail(true);
    try {
      const detail = await getAdminProduct(product.id);
      setEditingProduct(detail);
      setProductForm(productToForm(detail, categories));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toast.loadProductFailed'));
    } finally {
      setLoadingProductDetail(false);
    }
  }

  function buildProductPayload(): CreateAdminProductPayload {
    const displayOrder = Number.parseInt(productForm.display_order, 10);
    return {
      name: productForm.name.trim(),
      slug: productForm.slug.trim() || undefined,
      short_description: optionalNullableText(productForm.short_description),
      description: optionalNullableText(productForm.description),
      benefits: optionalNullableText(productForm.benefits),
      category_code: productForm.category_code,
      product_kind: productForm.product_kind,
      status: productForm.status,
      brochure_pdf_url: optionalNullableText(productForm.brochure_pdf_url),
      documentation_files: productForm.documentation_files.map((file) => ({
        url: file.url,
        filename: file.filename,
        file_type: file.file_type,
      })),
      hero_image_url: optionalNullableText(productForm.hero_image_url),
      external_url: optionalNullableText(productForm.external_url),
      cta_label: optionalNullableText(productForm.cta_label),
      display_order: Number.isFinite(displayOrder) ? displayOrder : undefined,
      is_featured: productForm.is_featured,
    };
  }

  async function handleHeroImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('toast.heroImageTypeInvalid'));
      event.target.value = '';
      return;
    }

    setUploadingHeroImage(true);
    try {
      const imageUrl = await uploadProductHeroImage(file);
      setProductForm((previous) => ({ ...previous, hero_image_url: imageUrl }));
      toast.success(t('toast.heroImageUploaded'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toast.heroImageUploadFailed'));
    } finally {
      setUploadingHeroImage(false);
      event.target.value = '';
    }
  }

  async function handleBrochurePdfUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error(t('toast.brochurePdfTypeInvalid'));
      event.target.value = '';
      return;
    }

    setUploadingBrochurePdf(true);
    try {
      const pdfUrl = await uploadProductBrochurePdf(file);
      setProductForm((previous) => ({ ...previous, brochure_pdf_url: pdfUrl }));
      toast.success(t('toast.brochurePdfUploaded'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toast.brochurePdfUploadFailed'));
    } finally {
      setUploadingBrochurePdf(false);
      event.target.value = '';
    }
  }

  async function handleDocumentationFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === 'application/pdf';
    const isDocx = file.name.endsWith('.docx');
    
    if (!isPdf && !isDocx) {
      toast.error(t('toast.documentationFileTypeInvalid'));
      event.target.value = '';
      return;
    }

    setUploadingDocumentationFile(true);
    try {
      const uploadedFile = await uploadProductDocumentationFile(file);
      setProductForm((previous) => ({ 
        ...previous, 
        documentation_files: [...previous.documentation_files, uploadedFile] 
      }));
      toast.success(t('toast.documentationFileUploaded'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toast.documentationFileUploadFailed'));
    } finally {
      setUploadingDocumentationFile(false);
      event.target.value = '';
    }
  }

  function handleDeleteDocumentationFile(fileId: string) {
    setProductForm((previous) => ({
      ...previous,
      documentation_files: previous.documentation_files.filter((f) => f.id !== fileId),
    }));
    toast.success(t('toast.documentationFileDeleted'));
  }

  async function handleConfirmDeleteProduct() {
    if (!productPendingDelete) return;

    const product = productPendingDelete;
    setDeletingProductId(product.id);
    try {
      await deleteAdminProduct(product.id);
      toast.success(t('toast.productDeleted'));
      if (editingProduct?.id === product.id) {
        setShowProductModal(false);
        resetProductForm();
      }
      setProductPendingDelete(null);
      await loadProducts();
      await loadCategories();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toast.productDeleteFailed'));
    } finally {
      setDeletingProductId(null);
    }
  }

  const loadCategories = useCallback(async () => {
    const response = await listAdminProductCategories({ limit: 200 });
    setCategories(response.categories);
  }, []);

  const loadProducts = useCallback(async () => {
    const seq = ++productsLoadSeq.current;
    const response = await listAdminProducts(queryParams);
    if (seq !== productsLoadSeq.current) {
      return;
    }
    setProducts(response.products);
  }, [queryParams]);

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
  }, [loadProducts, loading]);

  async function handleSaveCategory() {
    const code = categoryForm.code.trim();
    const name = categoryForm.name.trim();
    if (!code || !name) {
      toast.error(t('toast.categoryRequired'));
      return;
    }
    const displayOrder = Number.parseInt(categoryForm.display_order, 10);
    setSavingCategory(true);
    try {
      if (editingCategory) {
        await updateAdminProductCategory(editingCategory.id, {
          name,
          description: categoryForm.description.trim() || undefined,
          display_order: Number.isFinite(displayOrder) ? displayOrder : undefined,
          is_active: categoryForm.is_active,
        });
        toast.success(t('toast.categoryUpdated'));
      } else {
        await createAdminProductCategory({
          code,
          name,
          description: categoryForm.description.trim() || undefined,
          display_order: Number.isFinite(displayOrder) ? displayOrder : undefined,
          is_active: categoryForm.is_active,
        });
        toast.success(t('toast.categoryCreated'));
      }
      setShowCategoryModal(false);
      setEditingCategory(null);
      setCategoryForm(emptyCategoryForm());
      await loadCategories();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : editingCategory
            ? t('toast.categoryUpdateFailed')
            : t('toast.categoryCreateFailed'),
      );
    } finally {
      setSavingCategory(false);
    }
  }

  async function handleSaveProduct() {
    const payload = buildProductPayload();

    if (!payload.name || !payload.category_code) {
      toast.error(t('toast.productRequired'));
      return;
    }

    setSavingProduct(true);
    try {
      if (editingProduct) {
        const updated = await updateAdminProduct(editingProduct.id, payload);
        setProducts((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        toast.success(t('toast.productUpdated'));
      } else {
        const created = await createAdminProduct(payload);
        setProducts((prev) => [created, ...prev.filter((item) => item.id !== created.id)]);
        toast.success(t('toast.productCreated'));
      }
      setShowProductModal(false);
      resetProductForm();
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
      <header className={ADMIN_PAGE_HERO_HEADER_CLASS}>
        <p className={ADMIN_PAGE_HERO_EYEBROW_CLASS}>{t('hero.eyebrow')}</p>
        <h1 className={`mt-2 ${ADMIN_PAGE_TITLE_CLASS} text-white`}>{t('hero.title')}</h1>
        <p className={ADMIN_PAGE_HERO_SUBTITLE_CLASS}>{t('hero.subtitle')}</p>
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

      <article className="rounded-2xl border border-[#e2e8f5] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ecf0f8] px-4 py-3">
          <h2 className="text-xl font-semibold text-[#243555]">{t('section.title')}</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openCreateProductModal}
              className="rounded-xl border border-[#2d4f83] bg-[#182843] px-4 py-2 text-sm font-semibold text-white hover:bg-[#223657]"
            >
              {t('actions.add')}
            </button>
          </div>
        </div>

        <div className="relative z-20 flex flex-wrap items-center gap-3 border-b border-[#ecf0f8] px-4 py-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('search.placeholder')}
            className="min-w-[240px] flex-1 rounded-xl border border-[#d4dced] bg-white px-3 py-2 text-sm text-[#25375a] outline-none focus:border-[#3e69b0]"
          />
          <AdminToolbarSelect
            ariaLabel={t('filters.ariaStatus')}
            value={statusFilter}
            onChange={(next) => setStatusFilter(next as ProductStatus | 'all')}
            options={statusFilterOptions}
          />
          <AdminToolbarSelect
            ariaLabel={t('filters.ariaCategory')}
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={categoryFilterOptions}
          />
        </div>

        <div className="relative z-0 overflow-x-auto px-4 py-3">
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
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => void openEditProductModal(product)}
                          className="text-sm font-semibold text-[#3e69b0]"
                        >
                          {t('actions.edit')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setProductPendingDelete(product)}
                          disabled={deletingProductId === product.id}
                          className="text-sm font-semibold text-[#cc5163] disabled:opacity-60"
                        >
                          {deletingProductId === product.id ? t('actions.deleting') : t('actions.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </article>

      <article className="overflow-hidden rounded-2xl border border-[#e2e8f5] bg-white shadow-sm">
        <div className="border-b border-[#ecf0f8] px-4 py-3">
          <h2 className="text-xl font-semibold text-[#243555]">{t('section.categories')}</h2>
        </div>
        <div className="overflow-x-auto px-4 py-3">
          <table className="min-w-full text-left text-sm text-[#2b3e60]">
            <thead className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7a8ca8]">
              <tr className="border-b border-[#edf2f9]">
                <th className="py-2 pr-4">{t('form.categoryName')}</th>
                <th className="py-2 pr-4">{t('form.categoryCode')}</th>
                <th className="py-2 pr-4">{t('th.products')}</th>
                <th className="py-2 pr-4">{t('th.active')}</th>
                <th className="py-2">{t('th.action')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="py-6 text-sm text-[#5f7395]" colSpan={5}>
                    {t('state.loading')}
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td className="py-6 text-sm text-[#5f7395]" colSpan={5}>
                    {t('state.categoriesEmpty')}
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="border-b border-[#edf2f9] last:border-0">
                    <td className="py-3 pr-4 font-semibold text-[#25375a]">{category.name}</td>
                    <td className="py-3 pr-4 text-[#5f7395]">{category.code}</td>
                    <td className="py-3 pr-4 text-[#5f7395]">{category.product_count}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`rounded-md px-2 py-1 text-xs font-semibold ${
                          category.is_active ? 'bg-[#e9f8ef] text-[#2f9960]' : 'bg-[#edf1f8] text-[#607594]'
                        }`}
                      >
                        {category.is_active ? t('status.published') : t('status.archived')}
                      </span>
                    </td>
                    <td className="py-3">
                      <button
                        type="button"
                        onClick={() => openEditCategoryModal(category)}
                        className="text-sm font-semibold text-[#3e69b0]"
                      >
                        {t('actions.editCategory')}
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
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#08162c]/70 px-4 py-6">
          <article className="flex max-h-[min(90vh,820px)] w-full max-w-2xl flex-col rounded-2xl border border-[#d5deef] bg-white shadow-2xl scheme-light">
            <div className="border-b border-[#ecf0f8] px-5 py-4">
              <h3 className="text-lg font-semibold text-[#243555]">
                {editingProduct ? t('modal.editTitle') : t('modal.createTitle')}
              </h3>
              {loadingProductDetail ? (
                <p className="mt-1 text-sm text-[#5f7395]">{t('state.loadingProduct')}</p>
              ) : null}
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-1 md:col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6f82a3]">{t('form.name')}</span>
                  <input
                    value={productForm.name}
                    onChange={(event) => setProductForm((previous) => ({ ...previous, name: event.target.value }))}
                    disabled={loadingProductDetail}
                    className={INPUT_CLASS}
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6f82a3]">{t('form.slug')}</span>
                  <input
                    value={productForm.slug}
                    onChange={(event) => setProductForm((previous) => ({ ...previous, slug: event.target.value }))}
                    disabled={loadingProductDetail}
                    className={INPUT_CLASS}
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6f82a3]">{t('form.category')}</span>
                  <select
                    value={productForm.category_code}
                    onChange={(event) => setProductForm((previous) => ({ ...previous, category_code: event.target.value }))}
                    disabled={loadingProductDetail}
                    className={INPUT_CLASS}
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
                    disabled={loadingProductDetail || Boolean(editingProduct?.checklist?.checklist_id)}
                    className={INPUT_CLASS}
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
                    disabled={loadingProductDetail}
                    className={INPUT_CLASS}
                  >
                    <option value="draft">{t('status.draft')}</option>
                    <option value="published">{t('status.published')}</option>
                    <option value="coming_soon">{t('status.coming_soon')}</option>
                    <option value="archived">{t('status.archived')}</option>
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6f82a3]">{t('form.displayOrder')}</span>
                  <input
                    type="number"
                    value={productForm.display_order}
                    onChange={(event) => setProductForm((previous) => ({ ...previous, display_order: event.target.value }))}
                    disabled={loadingProductDetail}
                    className={INPUT_CLASS}
                  />
                </label>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.is_featured}
                      onChange={(event) => setProductForm((previous) => ({ ...previous, is_featured: event.target.checked }))}
                      disabled={loadingProductDetail}
                      className="h-4 w-4 rounded border-[#d4dced] text-[#3e69b0]"
                    />
                    <span className="text-sm font-medium text-[#25375a]">{t('form.isFeatured')}</span>
                  </label>
                </div>
                {editingProduct?.checklist?.checklist_id ? (
                  <div className="md:col-span-2 rounded-xl border border-[#dde6f5] bg-[#f4f7fc] px-3 py-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6f82a3]">{t('form.checklistLinked')}</p>
                    <p className="mt-1 text-sm font-semibold text-[#25375a]">
                      {editingProduct.checklist.checklist_title ?? editingProduct.name}
                      {editingProduct.checklist.checklist_version
                        ? ` (${editingProduct.checklist.checklist_version})`
                        : ''}
                    </p>
                    <p className="mt-1 text-xs text-[#5f7395]">{t('form.checklistReadOnly')}</p>
                  </div>
                ) : null}
                <label className="space-y-1 md:col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6f82a3]">{t('form.shortDescription')}</span>
                  <textarea
                    value={productForm.short_description}
                    onChange={(event) =>
                      setProductForm((previous) => ({ ...previous, short_description: event.target.value }))
                    }
                    rows={2}
                    disabled={loadingProductDetail}
                    className={INPUT_CLASS}
                  />
                </label>
                <div className="space-y-1 md:col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6f82a3]">
                    {t('form.description')}
                  </span>
                  <TipTapRichTextEditor
                    value={productForm.description}
                    onChange={(value) => setProductForm((previous) => ({ ...previous, description: value }))}
                    placeholder={t('form.descriptionPlaceholder')}
                    t={t}
                  />
                </div>
                <label className="space-y-1 md:col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6f82a3]">{t('form.documentationFiles')}</span>
                  <div className="flex flex-col gap-2">
                    {productForm.documentation_files.length > 0 ? (
                      <div className="space-y-2">
                        {productForm.documentation_files.map((file) => (
                          <div key={file.id} className="flex items-center justify-between rounded-xl border border-[#d4dced] bg-[#f8fbff] px-3 py-2 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-[#456087]">{file.filename}</span>
                              <a
                                href={absoluteMediaUrl(file.url)}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-semibold text-[#3e69b0] hover:underline"
                              >
                                {t('actions.previewDocument')}
                              </a>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteDocumentationFile(file.id)}
                              disabled={loadingProductDetail}
                              className="text-xs font-semibold text-[#b63d51] hover:text-[#d64a63] disabled:text-[#d4dced]"
                            >
                              {t('actions.delete')}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="min-h-10 rounded-xl border border-[#d4dced] bg-[#f8fbff] px-3 py-2 text-sm text-[#456087]">
                        {t('state.noDocumentationFiles')}
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <label className="inline-flex cursor-pointer items-center rounded-xl border border-[#cad5e8] bg-white px-3 py-2 text-xs font-semibold text-[#38506f] hover:bg-[#f7faff]">
                        <input
                          type="file"
                          accept=".pdf,.docx,application/pdf"
                          onChange={(event) => void handleDocumentationFileUpload(event)}
                          disabled={loadingProductDetail || uploadingDocumentationFile}
                          className="hidden"
                        />
                        {uploadingDocumentationFile ? t('actions.uploadingDocument') : t('actions.uploadDocument')}
                      </label>
                    </div>
                  </div>
                </label>
                <label className="space-y-1 md:col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6f82a3]">{t('form.heroImageUrl')}</span>
                  <div className="flex flex-col gap-2">
                    <div className="min-h-10 rounded-xl border border-[#d4dced] bg-[#f8fbff] px-3 py-2 text-sm text-[#456087]">
                      {productForm.hero_image_url || t('state.noHeroImage')}
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="inline-flex cursor-pointer items-center rounded-xl border border-[#cad5e8] bg-white px-3 py-2 text-xs font-semibold text-[#38506f] hover:bg-[#f7faff]">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) => void handleHeroImageUpload(event)}
                          disabled={loadingProductDetail || uploadingHeroImage}
                          className="hidden"
                        />
                        {uploadingHeroImage ? t('actions.uploadingImage') : t('actions.uploadImage')}
                      </label>
                      {productForm.hero_image_url ? (
                        <a
                          href={productForm.hero_image_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-[#3e69b0] hover:underline"
                        >
                          {t('actions.previewImage')}
                        </a>
                      ) : null}
                    </div>
                  </div>
                </label>
                <label className="space-y-1 md:col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6f82a3]">{t('form.brochurePdfUrl')}</span>
                  <div className="flex flex-col gap-2">
                    <div className="min-h-10 rounded-xl border border-[#d4dced] bg-[#f8fbff] px-3 py-2 text-sm text-[#456087]">
                      {productForm.brochure_pdf_url || t('state.noBrochurePdf')}
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="inline-flex cursor-pointer items-center rounded-xl border border-[#cad5e8] bg-white px-3 py-2 text-xs font-semibold text-[#38506f] hover:bg-[#f7faff]">
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(event) => void handleBrochurePdfUpload(event)}
                          disabled={loadingProductDetail || uploadingBrochurePdf}
                          className="hidden"
                        />
                        {uploadingBrochurePdf ? t('actions.uploadingPdf') : t('actions.uploadPdf')}
                      </label>
                      {productForm.brochure_pdf_url ? (
                        <a
                          href={productForm.brochure_pdf_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-[#3e69b0] hover:underline"
                        >
                          {t('actions.previewPdf')}
                        </a>
                      ) : null}
                    </div>
                  </div>
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6f82a3]">{t('form.externalUrl')}</span>
                  <input
                    value={productForm.external_url}
                    onChange={(event) => setProductForm((previous) => ({ ...previous, external_url: event.target.value }))}
                    disabled={loadingProductDetail}
                    placeholder={t('form.externalUrlPlaceholder')}
                    className={INPUT_CLASS}
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6f82a3]">{t('form.ctaLabel')}</span>
                  <input
                    value={productForm.cta_label}
                    onChange={(event) => setProductForm((previous) => ({ ...previous, cta_label: event.target.value }))}
                    disabled={loadingProductDetail}
                    placeholder={t('form.ctaLabelPlaceholder')}
                    className={INPUT_CLASS}
                  />
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-[#ecf0f8] px-5 py-4">
              <button
                type="button"
                onClick={() => {
                  setShowProductModal(false);
                  resetProductForm();
                }}
                className="rounded-xl border border-[#cad5e8] bg-white px-4 py-2 text-sm font-semibold text-[#38506f] hover:bg-[#f7faff]"
              >
                {t('actions.cancel')}
              </button>
              <button
                type="button"
                onClick={() => void handleSaveProduct()}
                disabled={savingProduct || loadingProductDetail || uploadingHeroImage || uploadingBrochurePdf || uploadingDocumentationFile}
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
          <article className="w-full max-w-lg rounded-2xl border border-[#d5deef] bg-white p-5 shadow-2xl scheme-light">
            <h3 className="text-lg font-semibold text-[#243555]">
              {editingCategory ? t('modal.editCategoryTitle') : t('modal.categoryTitle')}
            </h3>
            <div className="mt-4 grid gap-3">
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6f82a3]">{t('form.categoryCode')}</span>
                <input
                  value={categoryForm.code}
                  onChange={(event) => setCategoryForm((previous) => ({ ...previous, code: event.target.value }))}
                  readOnly={Boolean(editingCategory)}
                  disabled={Boolean(editingCategory)}
                  className={`${INPUT_CLASS} ${editingCategory ? 'cursor-not-allowed bg-[#f4f7fc] text-[#607594]' : ''}`}
                />
                {editingCategory ? (
                  <p className="text-xs leading-relaxed text-[#607594]">{t('form.categoryCodeLocked')}</p>
                ) : null}
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6f82a3]">{t('form.categoryName')}</span>
                <input
                  value={categoryForm.name}
                  onChange={(event) => setCategoryForm((previous) => ({ ...previous, name: event.target.value }))}
                  className={INPUT_CLASS}
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
                  className={INPUT_CLASS}
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6f82a3]">{t('form.displayOrder')}</span>
                <input
                  type="number"
                  value={categoryForm.display_order}
                  onChange={(event) => setCategoryForm((previous) => ({ ...previous, display_order: event.target.value }))}
                  className={INPUT_CLASS}
                />
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={categoryForm.is_active}
                  onChange={(event) => setCategoryForm((previous) => ({ ...previous, is_active: event.target.checked }))}
                  className="h-4 w-4 rounded border-[#d4dced] text-[#3e69b0]"
                />
                <span className="text-sm font-medium text-[#25375a]">{t('form.isActive')}</span>
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowCategoryModal(false);
                  setEditingCategory(null);
                  setCategoryForm(emptyCategoryForm());
                }}
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
                {savingCategory
                  ? t('actions.saving')
                  : editingCategory
                    ? t('actions.saveCategory')
                    : t('actions.createCategory')}
              </button>
            </div>
          </article>
        </div>
      ) : null}

      {productPendingDelete ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#08162c]/70 px-4 py-6">
          <article className="w-full max-w-md rounded-2xl border border-[#d5deef] bg-white p-6 shadow-2xl scheme-light">
            <h3 className="text-lg font-semibold text-[#243555]">{t('modal.delete.title')}</h3>
            <p className="mt-2 text-sm font-medium text-[#25375a]">{productPendingDelete.name}</p>
            <p className="mt-2 text-sm text-[#607594]">
              {productPendingDelete.product_kind === 'checklist'
                ? t('confirm.deleteChecklistProduct')
                : t('confirm.deleteProduct')}
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setProductPendingDelete(null)}
                disabled={deletingProductId === productPendingDelete.id}
                className="rounded-xl border border-[#cad5e8] bg-white px-4 py-2 text-sm font-semibold text-[#38506f] hover:bg-[#f7faff] disabled:opacity-60"
              >
                {t('actions.cancel')}
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmDeleteProduct()}
                disabled={deletingProductId === productPendingDelete.id}
                className="rounded-xl border border-[#d45f6b] bg-[#fff1f3] px-4 py-2 text-sm font-semibold text-[#a73a46] hover:bg-[#ffe4e8] disabled:opacity-60"
              >
                {deletingProductId === productPendingDelete.id ? t('actions.deleting') : t('actions.confirmDelete')}
              </button>
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
}
