import { apiDelete, apiGetWithAuth, apiPatch, apiPost, apiPostFormData, getApiBaseUrl } from '@/lib/api';

export type ProductKind = 'checklist' | 'documentation' | 'module';
export type ProductStatus = 'draft' | 'published' | 'coming_soon' | 'archived';

export type ProductPricingInfo = {
  price_id: string | null;
  amount_cents: number | null;
  currency: string | null;
  available: boolean;
};

export type AdminProductCategory = {
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

export type DocumentationFile = {
  id: string;
  url: string;
  filename: string;
  file_type: 'pdf' | 'docx';
  uploaded_at: string;
};

export type AdminProduct = {
  id: string;
  category: AdminProductCategory | null;
  parent_product_id: string | null;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  product_kind: ProductKind;
  status: ProductStatus;
  display_order: number;
  is_featured: boolean;
  brochure_pdf_url: string | null;
  documentation_files: DocumentationFile[];
  hero_image_url: string | null;
  external_url: string | null;
  cta_label: string | null;
  stripe_product_id: string | null;
  pricing: ProductPricingInfo | null;
  checklist?: {
    checklist_id: string;
    checklist_title: string | null;
    checklist_version: string | null;
  } | null;
  checklist_type?: {
    checklist_type_id: string;
    checklist_type_code: string;
    checklist_type_name: string;
  } | null;
  created_at: string;
  updated_at: string;
};

export type AdminProductListResponse = {
  total: number;
  products: AdminProduct[];
  skip: number;
  limit: number;
};

export type AdminCategoryListResponse = {
  total: number;
  categories: AdminProductCategory[];
  skip: number;
  limit: number;
};

export type ListAdminProductsParams = {
  skip?: number;
  limit?: number;
  search?: string;
  category_code?: string;
  status?: ProductStatus | '';
};

export type CreateAdminProductPayload = {
  category_code: string;
  name: string;
  slug?: string;
  short_description?: string;
  description?: string;
  product_kind?: ProductKind;
  status?: ProductStatus;
  checklist_id?: string;
  checklist_type_id?: string;
  checklist_type_code?: string;
  parent_product_id?: string;
  display_order?: number;
  is_featured?: boolean;
  brochure_pdf_url?: string;
  documentation_files?: DocumentationFile[];
  hero_image_url?: string;
  external_url?: string;
  cta_label?: string;
};

export type UpdateAdminProductPayload = Partial<CreateAdminProductPayload>;

export type CreateAdminCategoryPayload = {
  code: string;
  name: string;
  description?: string;
  display_order?: number;
  is_active?: boolean;
};

export type UpdateAdminCategoryPayload = Partial<CreateAdminCategoryPayload>;

function cleanPayload<T extends Record<string, unknown>>(payload: T): T {
  const out = { ...payload };
  for (const [key, value] of Object.entries(out)) {
    if (value === undefined) {
      delete out[key as keyof T];
    }
  }
  return out;
}

export async function listAdminProducts(params?: ListAdminProductsParams) {
  const query = new URLSearchParams();
  if (typeof params?.skip === 'number') query.set('skip', String(params.skip));
  if (typeof params?.limit === 'number') query.set('limit', String(params.limit));
  if (params?.search) query.set('search', params.search);
  if (params?.category_code) query.set('category_code', params.category_code);
  if (params?.status) query.set('status', params.status);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiGetWithAuth<AdminProductListResponse>(`/admin/products${suffix}`);
}

export async function listAdminProductCategories(params?: { skip?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (typeof params?.skip === 'number') query.set('skip', String(params.skip));
  if (typeof params?.limit === 'number') query.set('limit', String(params.limit));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiGetWithAuth<AdminCategoryListResponse>(`/admin/products/categories${suffix}`);
}

export async function createAdminProduct(payload: CreateAdminProductPayload) {
  return apiPost<AdminProduct, CreateAdminProductPayload>('/admin/products', cleanPayload(payload));
}

export async function getAdminProduct(productId: string) {
  return apiGetWithAuth<AdminProduct>(`/admin/products/${encodeURIComponent(productId)}`);
}

export async function updateAdminProduct(productId: string, payload: UpdateAdminProductPayload) {
  return apiPatch<AdminProduct, UpdateAdminProductPayload>(`/admin/products/${encodeURIComponent(productId)}`, cleanPayload(payload));
}

export async function createAdminProductCategory(payload: CreateAdminCategoryPayload) {
  return apiPost<AdminProductCategory, CreateAdminCategoryPayload>('/admin/products/categories', cleanPayload(payload));
}

export async function updateAdminProductCategory(categoryId: string, payload: UpdateAdminCategoryPayload) {
  return apiPatch<AdminProductCategory, UpdateAdminCategoryPayload>(
    `/admin/products/categories/${encodeURIComponent(categoryId)}`,
    cleanPayload(payload),
  );
}

export async function deleteChecklistProduct(checklistId: string) {
  await apiDelete<unknown>(`/admin/products/checklist/${encodeURIComponent(checklistId)}`);
}

export async function deleteAdminProduct(productId: string) {
  await apiDelete<unknown>(`/admin/products/${encodeURIComponent(productId)}`);
}

export async function syncChecklistProducts() {
  return apiPost<AdminProductListResponse, Record<string, never>>('/admin/products/sync-checklists', {});
}

type MediaUploadResponse = {
  id: string;
};

async function uploadProductMedia(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const uploaded = await apiPostFormData<MediaUploadResponse>('/media/upload', formData);
  return `${getApiBaseUrl()}/media/${encodeURIComponent(uploaded.id)}/direct`;
}

export async function uploadProductHeroImage(file: File): Promise<string> {
  return uploadProductMedia(file);
}

export async function uploadProductBrochurePdf(file: File): Promise<string> {
  return uploadProductMedia(file);
}

export async function uploadProductDocumentationFile(file: File): Promise<DocumentationFile> {
  const url = await uploadProductMedia(file);
  const fileType = file.type === 'application/pdf' ? 'pdf' : 
                   file.name.endsWith('.docx') ? 'docx' : 'pdf';
  return {
    id: Date.now().toString(), // Temporary ID, will be replaced by backend
    url,
    filename: file.name,
    file_type: fileType,
    uploaded_at: new Date().toISOString(),
  };
}
