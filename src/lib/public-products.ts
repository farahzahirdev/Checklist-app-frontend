import { getApiBaseUrl } from '@/lib/api';
import type { CustomerChecklist } from '@/lib/checklist-api';

export type PublicProductKind = 'checklist' | 'documentation' | 'module';
export type PublicProductStatus = 'draft' | 'published' | 'coming_soon' | 'archived';

export type PublicProductPricing = {
  price_id: string | null;
  amount_cents: number | null;
  currency: string | null;
  available: boolean;
} | null;

export type PublicProductCategory = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product_count: number;
};

export type PublicProductChecklist = {
  checklist_id: string;
  checklist_title: string | null;
  checklist_version: string | null;
} | null;

export type PublicProductChecklistType = {
  checklist_type_id: string;
  checklist_type_code: string;
  checklist_type_name: string;
} | null;

export type PublicProduct = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  product_kind: PublicProductKind;
  status: PublicProductStatus;
  display_order: number;
  is_featured: boolean;
  brochure_pdf_url: string | null;
  hero_image_url: string | null;
  external_url: string | null;
  cta_label: string | null;
  created_at: string;
  updated_at: string;
  category: PublicProductCategory | null;
  parent_product_id: string | null;
  checklist: PublicProductChecklist;
  checklist_type: PublicProductChecklistType;
  pricing?: PublicProductPricing;
};

export type PublicProductsCategoryGroup = {
  category: PublicProductCategory;
  products: PublicProduct[];
};

export type PublicProductsResponse = {
  total: number;
  categories: PublicProductsCategoryGroup[];
};

export type PublicProductDetail = PublicProduct & {
  pricing: PublicProductPricing;
  checkout_available?: boolean;
};

function acceptLanguageHeader(): string {
  if (typeof window === 'undefined') return 'cs-CZ';
  const locale = window.localStorage.getItem('checklist_locale') || 'cs';
  const normalized = locale.toLowerCase();
  if (normalized.startsWith('cs')) return 'cs-CZ';
  return 'en-US';
}

async function readJsonOrThrow(response: Response): Promise<unknown> {
  const raw = await response.text();
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const data = JSON.parse(raw) as { detail?: unknown };
      if (typeof data.detail === 'string') message = data.detail;
    } catch {
      if (raw) message = raw;
    }
    throw new Error(message);
  }
  return raw ? JSON.parse(raw) : null;
}

/** Public catalog (no auth). */
export async function listPublicProducts(): Promise<PublicProductsResponse> {
  const response = await fetch(`${getApiBaseUrl()}/products`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Accept-Language': acceptLanguageHeader(),
    },
    cache: 'no-store',
  });
  const data = await readJsonOrThrow(response);
  return data as PublicProductsResponse;
}

/** Public product by slug; returns null when not found (404). */
export async function getPublicProductBySlug(slug: string): Promise<PublicProductDetail | null> {
  const trimmed = slug.trim();
  if (!trimmed) return null;
  const response = await fetch(`${getApiBaseUrl()}/products/${encodeURIComponent(trimmed)}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Accept-Language': acceptLanguageHeader(),
    },
    cache: 'no-store',
  });
  if (response.status === 404) return null;
  const data = await readJsonOrThrow(response);
  return data as PublicProductDetail;
}

export function flattenPublicProducts(response: PublicProductsResponse): PublicProduct[] {
  return response.categories.flatMap((group) => group.products);
}

export function isPublicCatalogProductPublished(product: PublicProduct): boolean {
  return product.status === 'published';
}

/** Public catalogue cards: published and coming-soon (excludes draft/archived). */
export function isPublicCatalogProductListable(product: PublicProduct): boolean {
  return product.status === 'published' || product.status === 'coming_soon';
}

/** True when pricing is missing or amount_cents was not set (null/undefined). */
export function isPublicProductPriceUnset(
  pricing: PublicProductPricing | { amount_cents?: number | null } | null | undefined,
): boolean {
  if (!pricing) return true;
  return pricing.amount_cents == null;
}

/** Format catalogue price; unset/null price shows coming-soon label instead of free. */
export function formatPublicProductPriceLabel(
  pricing: PublicProductPricing | { amount_cents?: number | null; currency?: string | null } | null | undefined,
  locale: string,
  labels: { free: string; comingSoon: string },
): string {
  if (isPublicProductPriceUnset(pricing)) return labels.comingSoon;
  const amountCents = pricing!.amount_cents!;
  if (amountCents === 0) return labels.free;
  const amount = amountCents / 100;
  const currency = (pricing!.currency || 'USD').toUpperCase();
  try {
    return new Intl.NumberFormat(locale === 'cs' ? 'cs-CZ' : 'en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export function canPurchasePublicCatalogProduct(
  status: PublicProductStatus | string,
  pricing: PublicProductPricing | { amount_cents?: number | null } | null | undefined,
): boolean {
  if (status === 'coming_soon') return false;
  if (isPublicProductPriceUnset(pricing)) return false;
  return (pricing!.amount_cents ?? 0) > 0;
}

/** Map API checklist product to the checklist shape used by /products cards and detail. */
export function publicChecklistProductToCustomerChecklist(product: PublicProduct | PublicProductDetail): CustomerChecklist | null {
  const checklistId = product.checklist?.checklist_id;
  if (!checklistId || product.product_kind !== 'checklist') return null;

  const amountCents = product.pricing?.amount_cents;
  const pricing =
    product.pricing && typeof amountCents === 'number' && amountCents > 0
      ? {
          price_id: product.pricing.price_id ?? '',
          amount_cents: amountCents,
          currency: (product.pricing.currency || 'USD').toUpperCase(),
        }
      : null;

  return {
    id: checklistId,
    title: product.name,
    checklist_type: {
      id: product.checklist_type?.checklist_type_id ?? '',
      code: product.checklist_type?.checklist_type_code ?? '',
      name: product.checklist_type?.checklist_type_name ?? '',
      description:
        (product.short_description ?? product.description ?? product.checklist?.checklist_title ?? '').trim() ||
        ' ',
    },
    version: String(product.checklist?.checklist_version ?? ''),
    status: product.status === 'published' ? 'published' : 'draft',
    created_at: product.created_at,
    updated_at: product.updated_at,
    warning: null,
    pricing,
  };
}
