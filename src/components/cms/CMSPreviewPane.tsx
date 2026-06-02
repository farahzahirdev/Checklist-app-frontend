'use client';

import React, { useState, useEffect } from 'react';
import { Monitor, Tablet, Smartphone, Eye, EyeOff, Info } from 'lucide-react';
import { translate, useLocale } from '@/lib/i18n';
import { adminCmsMessages } from '@/locales/admin-cms';
import { PageDetail } from '@/lib/api/cms-api';

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
  const [isVisible, setIsVisible] = useState(false);

  const deviceWidths: Record<DeviceType, string> = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  };

  const handleDeviceChange = (newDevice: DeviceType) => {
    setDevice(newDevice);
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  if (!isVisible) {
    return (
      <button
        type="button"
        onClick={toggleVisibility}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-[#0d6e3f] bg-[#0d6e3f] text-white hover:bg-[#0a5a32] transition-colors ${className}`}
      >
        <Eye className="w-4 h-4" />
        <span className="text-sm font-medium">{t('preview.showPreview')}</span>
      </button>
    );
  }

  return (
    <div className={`flex flex-col border-l border-[#e5e7eb] bg-[#f9fafb] ${className}`}>
      {/* Preview Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5e7eb] bg-white">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-[#6b7280]" />
          <span className="text-sm font-medium text-[#6b7280]">{t('preview.livePreview')}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Device Toggle Buttons */}
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => handleDeviceChange('desktop')}
              title={t('preview.desktop')}
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
              title={t('preview.tablet')}
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
              title={t('preview.mobile')}
              className={`p-2 rounded-md border transition-colors ${
                device === 'mobile'
                  ? 'bg-[#1a56a0] text-white border-[#1a56a0]'
                  : 'bg-white text-[#6b7280] border-[#e5e7eb] hover:border-[#1a56a0]'
              }`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={toggleVisibility}
            className="p-2 rounded-md hover:bg-[#f3f4f6] text-[#6b7280] transition-colors"
            title={t('preview.hidePreview')}
          >
            <EyeOff className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preview Frame */}
      <div className="flex-1 overflow-hidden p-4 bg-[#e8eaed]">
        <div className="flex justify-center h-full">
          <div
            className="bg-white rounded-lg overflow-hidden shadow-lg transition-all duration-300"
            style={{
              width: deviceWidths[device],
              maxWidth: '100%',
              height: '100%',
            }}
          >
            {/* Preview Content - Simplified mock */}
            <div className="h-full overflow-y-auto">
              {page ? (
                <div className="min-h-full">
                  {/* Navigation */}
                  <div className="bg-[#0d1f3c] px-4 py-2 flex items-center justify-between">
                    <span className="text-white text-xs font-medium">{page.title}</span>
                    <div className="flex gap-4">
                      <span className="text-white/70 text-xs">{t('preview.home')}</span>
                      <span className="text-white/70 text-xs">{t('preview.products')}</span>
                    </div>
                  </div>

                  {/* Hero Section */}
                  <div className="bg-gradient-to-br from-[#0d1f3c] to-[#1a3a6e] px-6 py-8 text-center">
                    {page.sections?.find(s => s.section_type === 'hero')?.data?.title && (
                      <h1 className="text-white text-xl font-semibold mb-2">
                        {page.sections.find(s => s.section_type === 'hero')?.data?.title}
                      </h1>
                    )}
                    {page.sections?.find(s => s.section_type === 'hero')?.data?.subtitle && (
                      <p className="text-white/80 text-xs mb-4">
                        {page.sections.find(s => s.section_type === 'hero')?.data?.subtitle}
                      </p>
                    )}
                    <button className="bg-[#3b82f6] text-white text-xs px-4 py-2 rounded">
                      {t('preview.getStarted')}
                    </button>
                  </div>

                  {/* Cards Section */}
                  <div className="p-4 grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-3">
                        <div className="font-semibold text-[#1e293b] text-xs mb-1">
                          {t('preview.cardTitle', { num: String(i) })}
                        </div>
                        <div className="text-[#64748b] text-xs">
                          {t('preview.cardDescription')}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="bg-[#0d1f3c] px-4 py-3 text-center">
                    <span className="text-white/60 text-xs">
                      © 2026 AuditReady · {t('preview.privacy')} · {t('preview.terms')}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-[#9ca3af] text-sm">
                  {t('preview.noPageSelected')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Footer */}
      <div className="px-4 py-2 border-t border-[#e5e7eb] bg-white text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-[#9ca3af]">
          <Info className="w-3 h-3" />
          <span>{t('preview.typingNotice')}</span>
        </div>
      </div>
    </div>
  );
}
