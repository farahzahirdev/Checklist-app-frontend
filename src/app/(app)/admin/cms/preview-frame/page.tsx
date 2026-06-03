'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { PageDetail } from '@/lib/api/cms-api';
import { PageRenderer } from '@/components/cms/PageRenderer';
import { SiteHeader } from '@/components/site-header';

type PreviewMessage =
  | { type: 'cms-preview-update'; page: PageDetail | null; contentChanges?: Record<string, string> }
  | { type: 'cms-preview-ready' };

function applyContentChanges(
  page: PageDetail | null,
  contentChanges: Record<string, string>,
): PageDetail | null {
  if (!page) return null;
  return {
    ...page,
    sections:
      page.sections?.map((section) => ({
        ...section,
        data: { ...section.data, ...contentChanges },
      })) ?? [],
  };
}

export default function CmsPreviewFramePage() {
  const searchParams = useSearchParams();
  const viewportWidth = Math.max(320, Number(searchParams.get('w')) || 1280);

  const [page, setPage] = useState<PageDetail | null>(null);
  const [contentChanges, setContentChanges] = useState<Record<string, string>>({});

  const previewPage = useMemo(
    () => applyContentChanges(page, contentChanges),
    [page, contentChanges],
  );

  // Pin layout viewport so Tailwind breakpoints match the selected device.
  useEffect(() => {
    let meta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'viewport';
      document.head.appendChild(meta);
    }
    meta.content = `width=${viewportWidth}, initial-scale=1`;

    document.documentElement.style.width = `${viewportWidth}px`;
    document.documentElement.style.maxWidth = '100%';
    document.documentElement.style.overflowX = 'hidden';
    document.body.style.margin = '0';
    document.body.style.overflowX = 'hidden';
  }, [viewportWidth]);

  useEffect(() => {
    const onMessage = (event: MessageEvent<PreviewMessage>) => {
      if (event.data?.type !== 'cms-preview-update') return;
      setPage(event.data.page);
      setContentChanges(event.data.contentChanges ?? {});
    };

    window.addEventListener('message', onMessage);
    window.parent.postMessage({ type: 'cms-preview-ready' }, window.location.origin);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  // Report content height so the parent iframe wrapper fits without extra scroll.
  useEffect(() => {
    const postHeight = () => {
      const shell = document.querySelector('.cms-preview-shell') as HTMLElement | null;
      const target = shell ?? document.body;
      const height = Math.ceil(target.getBoundingClientRect().height);
      if (height > 0) {
        window.parent.postMessage(
          { type: 'cms-preview-height', height },
          window.location.origin,
        );
      }
    };

    postHeight();
    const ro = new ResizeObserver(postHeight);
    const shell = document.querySelector('.cms-preview-shell');
    if (shell) ro.observe(shell);
    else ro.observe(document.body);
    return () => ro.disconnect();
  }, [previewPage, viewportWidth]);

  return (
    <div className="cms-preview-shell public-shell min-h-0 bg-slate-950 text-slate-100">
      <style>{`
        .min-h-screen { min-height: 0 !important; }
      `}</style>
      <SiteHeader />
      {previewPage ? (
        <PageRenderer page={previewPage} fallback={() => <div>Loading...</div>} />
      ) : (
        <div className="flex h-48 items-center justify-center bg-white text-sm text-[#6b7280]">
          Loading preview…
        </div>
      )}
    </div>
  );
}
