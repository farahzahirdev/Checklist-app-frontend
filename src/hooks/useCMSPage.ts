'use client';

import { useEffect, useState } from 'react';
import { getPageBySlug, PageDetail } from '@/lib/api/cms-api';
import { useLocale } from '@/lib/i18n';

/**
 * Hook to fetch CMS page content with fallback
 * Automatically handles language from i18n context
 */
export function useCMSPage(slug: string) {
  const { locale } = useLocale();
  const [page, setPage] = useState<PageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPage = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPageBySlug(slug, locale);
        if (isMounted) {
          setPage(data);
        }
      } catch (err) {
        // Silently fail - public pages show fallback content
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load page');
          setPage(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPage();

    return () => {
      isMounted = false;
    };
  }, [slug, locale]);

  return { page, loading, error };
}
