'use client';

import React, { useState } from 'react';
import { Monitor, Tablet, Smartphone } from 'lucide-react';
import { PageDetail } from '@/lib/api/cms-api';
import { IframePreview } from '@/components/cms/IframePreview';

interface CMSPreviewPaneProps {
  page: PageDetail | null;
  contentChanges?: Record<string, string>;
  className?: string;
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';

export function CMSPreviewPane({ page, contentChanges = {}, className = '' }: CMSPreviewPaneProps) {
  const [device, setDevice] = useState<DeviceType>('desktop');

  const deviceWidths: Record<DeviceType, number> = {
    desktop: 1280,
    tablet: 768,
    mobile: 375,
  };

  const handleDeviceChange = (newDevice: DeviceType) => {
    setDevice(newDevice);
  };

  return (
    <div className={`flex h-full min-h-0 flex-col ${className}`}>
      {/* Device Toggle */}
      <div className="flex shrink-0 items-center justify-center gap-2 border-b border-[#e5e7eb] bg-white px-4 py-2">
        <button
          type="button"
          onClick={() => handleDeviceChange('desktop')}
          className={`rounded-md border p-2 transition-colors ${
            device === 'desktop'
              ? 'bg-[#1a56a0] text-white border-[#1a56a0]'
              : 'bg-white text-[#6b7280] border-[#e5e7eb] hover:border-[#1a56a0]'
          }`}
          aria-label="Desktop preview"
        >
          <Monitor className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => handleDeviceChange('tablet')}
          className={`rounded-md border p-2 transition-colors ${
            device === 'tablet'
              ? 'bg-[#1a56a0] text-white border-[#1a56a0]'
              : 'bg-white text-[#6b7280] border-[#e5e7eb] hover:border-[#1a56a0]'
          }`}
          aria-label="Tablet preview"
        >
          <Tablet className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => handleDeviceChange('mobile')}
          className={`rounded-md border p-2 transition-colors ${
            device === 'mobile'
              ? 'bg-[#1a56a0] text-white border-[#1a56a0]'
              : 'bg-white text-[#6b7280] border-[#e5e7eb] hover:border-[#1a56a0]'
          }`}
          aria-label="Mobile preview"
        >
          <Smartphone className="h-4 w-4" />
        </button>
      </div>

      {/* Preview Frame — only this region scrolls; does not scroll the admin page */}
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain bg-[#e8eaed] p-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {page ? (
          <IframePreview
            width={deviceWidths[device]}
            page={page}
            contentChanges={contentChanges}
          />
        ) : (
          <div className="flex h-96 items-center justify-center rounded-md bg-white">
            <p className="text-sm text-[#6b7280]">No page selected for preview</p>
          </div>
        )}
      </div>
    </div>
  );
}
