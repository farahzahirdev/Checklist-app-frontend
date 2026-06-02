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

interface Feature {
  index: number;
  title?: string;
  description?: string;
}

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
            {/* Preview Content - Real data */}
            <div className="h-full overflow-y-auto">
              {page ? (
                <div className="min-h-full">
                  {/* Navigation */}
                  <div className="bg-[#0d1f3c] px-4 py-2 flex items-center justify-between sticky top-0 z-10">
                    <span className="text-white text-xs font-medium">{page.title}</span>
                    <div className="flex gap-4">
                      <span className="text-white/70 text-xs">{t('preview.home')}</span>
                      <span className="text-white/70 text-xs">{t('preview.products')}</span>
                    </div>
                  </div>

                  {/* Render sections in order */}
                  {page.sections?.sort((a, b) => a.order - b.order).map((section) => {
                    const sectionData = { ...section.data, ...contentChanges };
                    
                    // Hero Section
                    if (section.section_type === 'hero' || section.section_type === 'product-hero') {
                      return (
                        <div key={section.id} className="bg-gradient-to-br from-[#0d1f3c] to-[#1a3a6e] px-6 py-8 text-center">
                          {sectionData.title && (
                            <h1 className="text-white text-xl font-semibold mb-2" dangerouslySetInnerHTML={{ __html: sectionData.title }} />
                          )}
                          {sectionData.subtitle && (
                            <p className="text-white/80 text-xs mb-4" dangerouslySetInnerHTML={{ __html: sectionData.subtitle }} />
                          )}
                          {sectionData.description && (
                            <p className="text-white/70 text-xs mb-4" dangerouslySetInnerHTML={{ __html: sectionData.description }} />
                          )}
                          <button className="bg-[#3b82f6] text-white text-xs px-4 py-2 rounded">
                            {sectionData.button_text || t('preview.getStarted')}
                          </button>
                        </div>
                      );
                    }
                    
                    // Cards Section
                    if (section.section_type === 'cards') {
                      const features: Feature[] = [];
                      // Extract features from data
                      Object.keys(sectionData).forEach(key => {
                        if (key.startsWith('features.') && key.includes('.title')) {
                          const index = key.split('.')[1];
                          features.push({
                            index: parseInt(index),
                            title: sectionData[`features.${index}.title`],
                            description: sectionData[`features.${index}.description`]
                          });
                        }
                      });
                      
                      return (
                        <div key={section.id} className="p-4 grid grid-cols-2 gap-3">
                          {features.sort((a, b) => a.index - b.index).map((feature) => (
                            <div key={feature.index} className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-3">
                              {feature.title && (
                                <div className="font-semibold text-[#1e293b] text-xs mb-1" dangerouslySetInnerHTML={{ __html: feature.title }} />
                              )}
                              {feature.description && (
                                <div className="text-[#64748b] text-xs" dangerouslySetInnerHTML={{ __html: feature.description }} />
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    }
                    
                    // Text/Content Section
                    if (section.section_type === 'text' || section.section_type === 'content') {
                      return (
                        <div key={section.id} className="p-6">
                          {sectionData.title && (
                            <h2 className="text-lg font-semibold text-[#1e293b] mb-2" dangerouslySetInnerHTML={{ __html: sectionData.title }} />
                          )}
                          {sectionData.content && (
                            <div className="text-[#64748b] text-sm" dangerouslySetInnerHTML={{ __html: sectionData.content }} />
                          )}
                        </div>
                      );
                    }
                    
                    // CTA Section
                    if (section.section_type === 'cta') {
                      return (
                        <div key={section.id} className="bg-[#f0f9ff] px-6 py-4 text-center">
                          {sectionData.title && (
                            <h2 className="text-base font-semibold text-[#0369a1] mb-2" dangerouslySetInnerHTML={{ __html: sectionData.title }} />
                          )}
                          {sectionData.description && (
                            <p className="text-sm text-[#0c4a6e] mb-3" dangerouslySetInnerHTML={{ __html: sectionData.description }} />
                          )}
                          <button className="bg-[#0369a1] text-white text-xs px-4 py-2 rounded">
                            {sectionData.button_text || t('preview.learnMore')}
                          </button>
                        </div>
                      );
                    }
                    
                    // Footer Section
                    if (section.section_type === 'footer') {
                      return (
                        <div key={section.id} className="bg-[#0d1f3c] px-4 py-3 text-center">
                          {sectionData.content && (
                            <span className="text-white/60 text-xs" dangerouslySetInnerHTML={{ __html: sectionData.content }} />
                          )}
                          <span className="text-white/60 text-xs">
                            © 2026 AuditReady · {t('preview.privacy')} · {t('preview.terms')}
                          </span>
                        </div>
                      );
                    }
                    
                    // Default section rendering
                    return (
                      <div key={section.id} className="p-4">
                        {sectionData.title && (
                          <h2 className="text-base font-semibold text-[#1e293b] mb-2" dangerouslySetInnerHTML={{ __html: sectionData.title }} />
                        )}
                        {sectionData.content && (
                          <div className="text-[#64748b] text-sm" dangerouslySetInnerHTML={{ __html: sectionData.content }} />
                        )}
                      </div>
                    );
                  })}

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
