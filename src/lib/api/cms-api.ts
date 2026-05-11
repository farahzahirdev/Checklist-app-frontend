import { API_BASE_URL } from '@/lib/config';
import { ACCESS_TOKEN_STORAGE_KEY } from '@/lib/auth';

// Types
export interface PageSection {
  id: string;
  page_id: string;
  section_type: string;
  order: number;
  data?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: string;
  slug: string;
  language: string;
  title: string;
  meta_description?: string;
  status: 'draft' | 'published';
  content_type: string;
  created_by_id: string;
  updated_by_id: string;
  created_at: string;
  updated_at: string;
}

export interface PageDetail extends Page {
  sections: PageSection[];
}

export interface CMSImage {
  id: string;
  filename: string;
  file_path: string;
  mime_type: string;
  file_size?: number;
  alt_text?: string;
  uploaded_by_id: string;
  is_active: boolean;
  used_in_pages?: Record<string, any>;
  created_at: string;
  updated_at: string;
  file_url?: string;
}

// ============================================================================
// PAGE API CALLS
// ============================================================================

export async function getAllPages(
  language?: string,
  status?: string,
  skip = 0,
  limit = 100
) {
  const params = new URLSearchParams();
  if (language) params.append('language', language);
  if (status) params.append('status', status);
  params.append('skip', skip.toString());
  params.append('limit', limit.toString());

  const response = await fetch(`${API_BASE_URL}/api/cms/pages?${params}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch pages: ${response.statusText}`);
  }

  return response.json();
}

export async function getPageBySlug(
  slug: string,
  language: string,
  authToken?: string | null
): Promise<PageDetail> {
  const response = await fetch(
    `${API_BASE_URL}/api/cms/pages/${slug}?language=${language}`,
    {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Page '${slug}' not found`);
    }
    throw new Error(`Failed to fetch page: ${response.statusText}`);
  }

  return response.json();
}

export async function getPageById(
  pageId: string,
  language: string
): Promise<PageDetail> {
  const response = await fetch(
    `${API_BASE_URL}/api/cms/pages/${pageId}?language=${language}`,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)}`,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Page '${pageId}' not found`);
    }
    throw new Error(`Failed to fetch page: ${response.statusText}`);
  }

  return response.json();
}

export async function createPage(data: {
  slug: string;
  language: string;
  title: string;
  meta_description?: string;
  status: string;
  content_type: string;
}): Promise<PageDetail> {
  const response = await fetch(`${API_BASE_URL}/api/cms/pages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create page');
  }

  return response.json();
}

export async function updatePage(
  pageId: string,
  data: {
    title?: string;
    meta_description?: string;
    status?: string;
    content_type?: string;
  }
): Promise<PageDetail> {
  const response = await fetch(`${API_BASE_URL}/api/cms/pages/${pageId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to update page');
  }

  return response.json();
}

export async function togglePublishPage(
  pageId: string,
  status: 'draft' | 'published'
): Promise<PageDetail> {
  const response = await fetch(`${API_BASE_URL}/api/cms/pages/${pageId}/publish`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to update page status');
  }

  return response.json();
}

export async function deletePage(pageId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/cms/pages/${pageId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to delete page');
  }
}

// ============================================================================
// SECTION API CALLS
// ============================================================================

export async function createSection(
  data: {
    page_id: string;
    section_type: string;
    order: number;
    data?: Record<string, any>;
  }
): Promise<PageSection> {
  const response = await fetch(`${API_BASE_URL}/api/cms/sections`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create section');
  }

  return response.json();
}

export async function updateSection(
  sectionId: string,
  data: {
    section_type?: string;
    order?: number;
    data?: Record<string, any>;
  }
): Promise<PageSection> {
  const response = await fetch(`${API_BASE_URL}/api/cms/sections/${sectionId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to update section');
  }

  return response.json();
}

export async function deleteSection(sectionId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/cms/sections/${sectionId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to delete section');
  }
}

// ============================================================================
// IMAGE API CALLS
// ============================================================================

export async function getAllImages(
  skip = 0,
  limit = 100
) {
  const params = new URLSearchParams();
  params.append('skip', skip.toString());
  params.append('limit', limit.toString());

  const response = await fetch(`${API_BASE_URL}/api/cms/images?${params}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch images: ${response.statusText}`);
  }

  return response.json();
}

export async function uploadImage(
  file: File,
  altText?: string
): Promise<CMSImage> {
  const formData = new FormData();
  formData.append('file', file);
  if (altText) formData.append('alt_text', altText);

  const response = await fetch(`${API_BASE_URL}/api/cms/images/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to upload image');
  }

  return response.json();
}

export async function updateImage(
  imageId: string,
  data: {
    alt_text?: string;
  }
): Promise<CMSImage> {
  const response = await fetch(`${API_BASE_URL}/api/cms/images/${imageId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to update image');
  }

  return response.json();
}

export async function deleteImage(imageId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/cms/images/${imageId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to delete image');
  }
}
