'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { PageDetail } from '@/lib/api/cms-api';

interface IframePreviewProps {
  /** Logical viewport width the preview should render at (e.g. 1280, 768, 375). */
  width: number;
  page: PageDetail | null;
  contentChanges?: Record<string, string>;
  className?: string;
}

type PreviewOutboundMessage = {
  type: 'cms-preview-update';
  page: PageDetail | null;
  contentChanges: Record<string, string>;
};

/**
 * Embeds a real Next.js preview document in an iframe so Tailwind breakpoints
 * and CSS media queries resolve against the selected device width.
 */
export function IframePreview({
  width,
  page,
  contentChanges = {},
  className = '',
}: IframePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState(width);
  const [contentHeight, setContentHeight] = useState(600);
  const [iframeReady, setIframeReady] = useState(false);

  const previewSrc = `/admin/cms/preview-frame?w=${width}`;

  const postUpdate = useCallback(() => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    const message: PreviewOutboundMessage = {
      type: 'cms-preview-update',
      page,
      contentChanges,
    };
    win.postMessage(message, window.location.origin);
  }, [page, contentChanges]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'cms-preview-ready') {
        setIframeReady(true);
        postUpdate();
      }
      if (event.data?.type === 'cms-preview-height' && typeof event.data.height === 'number') {
        setContentHeight(event.data.height);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [postUpdate]);

  useEffect(() => {
    setIframeReady(false);
    setContentHeight(600);
  }, [width, previewSrc]);

  useEffect(() => {
    if (!iframeReady) return;
    postUpdate();
  }, [iframeReady, postUpdate]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setAvailableWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = Math.min(availableWidth / width, 1);
  const scaledHeight = contentHeight * scale;

  return (
    <div ref={containerRef} className={className} style={{ width: '100%' }}>
      <div
        className="mx-auto overflow-hidden border border-gray-200 bg-white shadow-xl transition-all duration-300"
        style={{
          width: `${width * scale}px`,
          height: `${scaledHeight}px`,
        }}
      >
        <iframe
          ref={iframeRef}
          key={previewSrc}
          src={previewSrc}
          title="CMS live preview"
          style={{
            width: `${width}px`,
            height: `${contentHeight}px`,
            border: '0',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            display: 'block',
          }}
        />
      </div>
    </div>
  );
}
