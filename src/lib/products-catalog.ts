// Phase 1 (frontend-only) product catalogue.
//
// Until the backend exposes a real Product entity, we model the catalogue with
// a small static registry for non-checklist products (documentation items,
// "coming soon" modules), plus a thin adapter for audit products that map to
// published checklists. The dynamic detail page resolves a slug to one of
// these kinds at render time.

import type { AuditIconKind } from '@/components/products/audit-icon';
import type { CustomerChecklist } from '@/lib/checklist-api';

export type ProductKind = 'audit' | 'documentation' | 'builder';
export type ProductStatus = 'available' | 'coming_soon';

export type DocumentationCategory =
  | 'Access & Identity'
  | 'Devices & Endpoints'
  | 'Data Protection'
  | 'Operations'
  | 'Governance'
  | 'Response';

export type DocumentationProduct = {
  kind: 'documentation';
  id:
    | 'mobileDevice'
    | 'remoteWork'
    | 'accessControl'
    | 'incidentResponse'
    | 'dataClassification'
    | 'securityGovernance';
  slug: string;
  status: ProductStatus;
  price: string;
  badge: boolean;
  category: DocumentationCategory;
  iconKind: AuditIconKind;
  points: Array<'policyDocument' | 'userGuidelines' | 'adminGuidelines' | 'adminGuidelinesAdvanced' | 'responsePlaybooks'>;
};

export type BuilderProduct = {
  kind: 'builder';
  id: 'backupPlanBuilder' | 'drpBuilder';
  slug: string;
  status: ProductStatus;
  iconKind: AuditIconKind;
};

export const DOCUMENTATION_PRODUCTS: DocumentationProduct[] = [
  {
    kind: 'documentation',
    id: 'mobileDevice',
    slug: 'doc-mobile-device-policy',
    status: 'coming_soon',
    price: '€149',
    badge: true,
    category: 'Devices & Endpoints',
    iconKind: 'clipboard',
    points: ['policyDocument', 'userGuidelines', 'adminGuidelines'],
  },
  {
    kind: 'documentation',
    id: 'remoteWork',
    slug: 'doc-remote-work-policy',
    status: 'coming_soon',
    price: '€149',
    badge: false,
    category: 'Operations',
    iconKind: 'clipboard',
    points: ['policyDocument', 'userGuidelines', 'adminGuidelines'],
  },
  {
    kind: 'documentation',
    id: 'accessControl',
    slug: 'doc-access-control-policy',
    status: 'coming_soon',
    price: '€179',
    badge: false,
    category: 'Access & Identity',
    iconKind: 'lock',
    points: ['policyDocument', 'userGuidelines', 'adminGuidelines', 'adminGuidelinesAdvanced'],
  },
  {
    kind: 'documentation',
    id: 'incidentResponse',
    slug: 'doc-incident-response-policy',
    status: 'coming_soon',
    price: '€199',
    badge: false,
    category: 'Response',
    iconKind: 'shield',
    points: ['policyDocument', 'userGuidelines', 'adminGuidelines', 'responsePlaybooks'],
  },
  {
    kind: 'documentation',
    id: 'dataClassification',
    slug: 'doc-data-classification-policy',
    status: 'coming_soon',
    price: '€149',
    badge: false,
    category: 'Data Protection',
    iconKind: 'clipboard',
    points: ['policyDocument', 'userGuidelines', 'adminGuidelines'],
  },
  {
    kind: 'documentation',
    id: 'securityGovernance',
    slug: 'doc-security-governance-policy',
    status: 'coming_soon',
    price: '€189',
    badge: false,
    category: 'Governance',
    iconKind: 'certificate',
    points: ['policyDocument', 'userGuidelines', 'adminGuidelines'],
  },
];

export const BUILDER_PRODUCTS: BuilderProduct[] = [
  {
    kind: 'builder',
    id: 'backupPlanBuilder',
    slug: 'backup-plan-builder',
    status: 'coming_soon',
    iconKind: 'clipboard',
  },
  {
    kind: 'builder',
    id: 'drpBuilder',
    slug: 'drp-builder',
    status: 'coming_soon',
    iconKind: 'shield',
  },
];

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isLikelyChecklistId(slug: string): boolean {
  return UUID_RE.test(slug.trim());
}

export function findDocumentationProductBySlug(slug: string): DocumentationProduct | null {
  return DOCUMENTATION_PRODUCTS.find((p) => p.slug === slug) ?? null;
}

export function findBuilderProductBySlug(slug: string): BuilderProduct | null {
  return BUILDER_PRODUCTS.find((p) => p.slug === slug) ?? null;
}

export function buildAuditProductHref(checklistId: string): string {
  return `/products/${encodeURIComponent(checklistId)}`;
}

export function buildDocumentationProductHref(product: DocumentationProduct): string {
  return `/products/${product.slug}`;
}

export function buildBuilderProductHref(product: BuilderProduct): string {
  return `/products/${product.slug}`;
}

export type ResolvedProduct =
  | { kind: 'audit'; status: 'available'; checklist: CustomerChecklist }
  | { kind: 'documentation'; status: ProductStatus; documentation: DocumentationProduct }
  | { kind: 'builder'; status: ProductStatus; builder: BuilderProduct };
