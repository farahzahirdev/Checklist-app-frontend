'use client';

import React, { useState } from 'react';
import { Monitor, Tablet, Smartphone } from 'lucide-react';
import { translate, useLocale } from '@/lib/i18n';
import { adminCmsMessages } from '@/locales/admin-cms';
import { PageDetail } from '@/lib/api/cms-api';
import { PageRenderer } from '@/components/cms/PageRenderer';
import { SiteHeader } from '@/components/site-header';
import { PublicFooter } from '@/components/public-footer';

interface CMSPreviewPaneProps {
  page: PageDetail | null;
  contentChanges?: Record<string, string>;
  className?: string;
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';

export function CMSPreviewPane({ page, contentChanges = {}, className = '' }: CMSPreviewPaneProps) {
  const { locale } = useLocale();
  const t = (key: string, values?: Record<string, string>) => translate(adminCmsMessages, locale, key, values);
  const [device, setDevice] = useState<DeviceType>('desktop');

  const deviceConfigs: Record<DeviceType, { width: number; scale: number }> = {
    desktop: { width: 1200, scale: 0.33 }, // 400px sidebar width / 1200px content
    tablet: { width: 768, scale: 0.52 },   // 400px sidebar width / 768px content  
    mobile: { width: 375, scale: 1.0 },   // 375px fits nicely in 400px sidebar
  };

  const handleDeviceChange = (newDevice: DeviceType) => {
    setDevice(newDevice);
  };

  // Create a modified page object with live content changes
  const previewPage = page ? {
    ...page,
    sections: page.sections?.map(section => ({
      ...section,
      data: { ...section.data, ...contentChanges }
    })) || []
  } : null;

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Device Toggle */}
      <div className="flex items-center justify-center gap-2 px-4 py-2 border-b border-[#e5e7eb] bg-white">
        <button
          type="button"
          onClick={() => handleDeviceChange('desktop')}
          className={`p-2 rounded-md border transition-colors ${
            device === 'desktop'
              ? 'bg-[#1a56a0] text-white border-[#1a56a0]'
              : 'bg-white text-[#6b7280] border-[#e5e7eb] hover:border-[#1a56a0]'
          }`}
        >
          <Monitor className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleDeviceChange('tablet')}
          className={`p-2 rounded-md border transition-colors ${
            device === 'tablet'
              ? 'bg-[#1a56a0] text-white border-[#1a56a0]'
              : 'bg-white text-[#6b7280] border-[#e5e7eb] hover:border-[#1a56a0]'
          }`}
        >
          <Tablet className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleDeviceChange('mobile')}
          className={`p-2 rounded-md border transition-colors ${
            device === 'mobile'
              ? 'bg-[#1a56a0] text-white border-[#1a56a0]'
              : 'bg-white text-[#6b7280] border-[#e5e7eb] hover:border-[#1a56a0]'
          }`}
        >
          <Smartphone className="w-4 h-4" />
        </button>
      </div>

      {/* Preview Frame */}
      <div className="flex-1 overflow-hidden p-4 bg-[#e8eaed]">
        <div className="flex justify-center items-start h-full overflow-auto">
          <div className="relative" style={{ width: '100%' }}>
            {/* Scaled container to fit sidebar */}
            <div
              className="bg-white shadow-xl transition-all duration-300 border border-gray-200 origin-top"
              style={{
                width: `${deviceConfigs[device].width}px`,
                transform: `scale(${deviceConfigs[device].scale})`,
                transformOrigin: 'top center',
              }}
            >
              {previewPage ? (
                <div className="public-shell min-h-screen bg-slate-950 text-slate-100">
                  {/* Site Header */}
                  <SiteHeader />
                  
                  {/* Page Content */}
                  <PageRenderer 
                    page={previewPage} 
                    fallback={() => <div>Loading...</div>}
                  />
                  
                  {/* Footer */}
                  <PublicFooter />
                </div>
              ) : (
                <div className="flex items-center justify-center h-96 bg-white">
                  <p className="text-sm text-[#6b7280]">No page selected for preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
