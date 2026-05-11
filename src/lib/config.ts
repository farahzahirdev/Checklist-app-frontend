/**
 * Configuration for frontend application
 */

// API Base URL for backend requests
const DEFAULT_API_BASE_URL = 'http://localhost:8000/api/v1';

function normalizeApiBaseUrl(url: string) {
  return url.replace(/\/api\/api\/v1\/?$/, '/api/v1').replace(/\/$/, '');
}

export const API_BASE_URL = normalizeApiBaseUrl(
  process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL
);

// Auth configuration
export const ACCESS_TOKEN_KEY = 'access_token';

// API Endpoints
export const API_ENDPOINTS = {
  auth: {
    login: '/api/v1/auth/login',
    register: '/api/v1/auth/signup',
    me: '/api/v1/auth/me',
    logout: '/api/v1/auth/logout',
  },
  cms: {
    pages: '/api/cms/pages',
    sections: '/api/cms/sections',
    images: '/api/cms/images',
  },
} as const;
