import type { Route } from 'next';

const GET_ACCESS_LABELS = new Set(['Get Access', 'Získat přístup']);

const VIEW_PRODUCTS_LABELS = new Set([
  'View Product',
  'View Products',
  'Zobrazit produkt',
  'Zobrazit produkty',
]);

/** Legacy CMS / fallback URLs that should point at the products listing. */
const LEGACY_PRODUCTS_LIST_PATHS = new Set([
  '/register',
  '/products/audit-readiness',
  '/products/audit-readiness-checklist',
]);

/**
 * Normalize public marketing CTA hrefs so Get Access and View Product(s)
 * always route to the products page.
 */
export function publicMarketingButtonHref(button: {
  url?: string;
  href?: string;
  text?: string;
}): Route {
  const raw = (button.url || button.href || '#').trim();
  const label = String(button.text ?? '').trim();

  if (!LEGACY_PRODUCTS_LIST_PATHS.has(raw)) {
    return (raw || '/') as Route;
  }

  if (GET_ACCESS_LABELS.has(label)) {
    return '/register';
  }
  if (VIEW_PRODUCTS_LABELS.has(label)) {
    return '/products';
  }

  return raw as Route;
}

export function publicMarketingButtonIsPrimary(button: {
  primary?: boolean;
  variant?: string;
}): boolean {
  return button.primary === true || button.variant === 'primary';
}
