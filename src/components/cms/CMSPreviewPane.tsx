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
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-[#0d6e3f] bg-[#0d6e3f] text-white hover:bg-[#0a5a32] transition-colors shadow-sm ${className}`}
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
      <div className="flex-1 overflow-hidden p-6 bg-[#e8eaed]">
        <div className="flex justify-center h-full">
          <div
            className="bg-white rounded-lg overflow-hidden shadow-xl transition-all duration-300 border border-gray-200"
            style={{
              width: deviceWidths[device],
              maxWidth: '100%',
              height: '500px',
            }}
          >
            {/* Preview Content - Real data */}
            <div className="h-[calc(100%-120px)] overflow-y-auto bg-slate-950">
              {page ? (
                <div className="min-h-full">
                  {/* Realistic Site Header */}
                  <header className="sticky top-0 z-50 border-b border-[#1f3f73] bg-[linear-gradient(120deg,#071733,#0c2144_45%,#13356d)] backdrop-blur">
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#2f5ba6] bg-[#0b1d3f]">
                          <svg viewBox="0 0 24 24" className="h-3 w-3 text-[#62a2ff]" fill="none" aria-hidden="true">
                            <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" fill="currentColor" fillOpacity="0.35" stroke="currentColor" strokeWidth="1.8" />
                            <path d="m9.4 12.2 1.8 1.8 3.6-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        <span className="text-sm font-semibold text-[#edf4ff]">AuditReady</span>
                      </div>
                      <nav className="flex items-center gap-4 text-xs font-medium text-[#d8e2f2]">
                        <span className="text-[#62a2ff]">Home</span>
                        <span className="text-[#b3c2dc]">Products</span>
                        <span className="text-[#b3c2dc]">Contact</span>
                        <span className="text-[#b3c2dc]">FAQ</span>
                      </nav>
                    </div>
                  </header>

                  {/* Render sections in order */}
                  {page.sections?.sort((a, b) => a.order - b.order).map((section) => {
                    const sectionData = { ...section.data, ...contentChanges };
                    
                    // Hero Section
                    if (section.section_type === 'hero' || section.section_type === 'product-hero') {
                      return (
                        <div key={section.id} className="bg-gradient-to-br from-[#0d1f3c] to-[#1a3a6e] px-6 py-12 text-center">
                          {sectionData.title && (
                            <h1 className="text-white text-2xl font-bold mb-3" dangerouslySetInnerHTML={{ __html: sectionData.title }} />
                          )}
                          {sectionData.subtitle && (
                            <p className="text-white/90 text-sm mb-4" dangerouslySetInnerHTML={{ __html: sectionData.subtitle }} />
                          )}
                          {sectionData.description && (
                            <p className="text-white/80 text-sm mb-6 max-w-2xl mx-auto" dangerouslySetInnerHTML={{ __html: sectionData.description }} />
                          )}
                          {sectionData.button_text && (
                            <button className="bg-[#3b82f6] text-white text-sm px-6 py-2 rounded-md hover:bg-[#2563eb] transition-colors">
                              {sectionData.button_text}
                            </button>
                          )}
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
                        <div key={section.id} className="px-6 py-8">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {features.sort((a, b) => a.index - b.index).map((feature) => (
                              <div key={feature.index} className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-4 hover:shadow-md transition-shadow">
                                {feature.title && (
                                  <div className="font-semibold text-[#1e293b] text-sm mb-2" dangerouslySetInnerHTML={{ __html: feature.title }} />
                                )}
                                {feature.description && (
                                  <div className="text-[#64748b] text-xs" dangerouslySetInnerHTML={{ __html: feature.description }} />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    
                    // Text/Content Section
                    if (section.section_type === 'text' || section.section_type === 'content') {
                      return (
                        <div key={section.id} className="px-6 py-8">
                          {sectionData.title && (
                            <h2 className="text-xl font-semibold text-[#1e293b] mb-3" dangerouslySetInnerHTML={{ __html: sectionData.title }} />
                          )}
                          {sectionData.content && (
                            <div className="text-[#64748b] text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: sectionData.content }} />
                          )}
                        </div>
                      );
                    }
                    
                    // CTA Section
                    if (section.section_type === 'cta') {
                      return (
                        <div key={section.id} className="bg-[#f0f9ff] px-6 py-8 text-center">
                          {sectionData.title && (
                            <h2 className="text-lg font-semibold text-[#0369a1] mb-3" dangerouslySetInnerHTML={{ __html: sectionData.title }} />
                          )}
                          {sectionData.description && (
                            <p className="text-sm text-[#0c4a6e] mb-4" dangerouslySetInnerHTML={{ __html: sectionData.description }} />
                          )}
                          {sectionData.button_text && (
                            <button className="bg-[#0369a1] text-white text-sm px-6 py-2 rounded-md hover:bg-[#0284c7] transition-colors">
                              {sectionData.button_text}
                            </button>
                          )}
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
                        </div>
                      );
                    }
                    
                    // Default section rendering
                    return (
                      <div key={section.id} className="px-6 py-6">
                        {sectionData.title && (
                          <h2 className="text-lg font-semibold text-[#1e293b] mb-3" dangerouslySetInnerHTML={{ __html: sectionData.title }} />
                        )}
                        {sectionData.content && (
                          <div className="text-[#64748b] text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: sectionData.content }} />
                        )}
                      </div>
                    );
                  })}

                  {/* Realistic Footer */}
                  <footer className="border-t border-[#0f274f] bg-[#040d21] text-[#a7b7d3]">
                    <div className="grid gap-4 px-4 py-4 text-xs">
                      <div className="flex items-center gap-2 border-b border-[#12315a] pb-3">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-[#0e2e64] text-[#4e91ff]">
                          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" aria-hidden="true">
                            <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" stroke="currentColor" strokeWidth="1.8" />
                          </svg>
                        </span>
                        <span className="text-sm font-semibold text-white">AuditReady</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#dbe8ff]">Navigation</p>
                          <div className="space-y-1">
                            <span className="block text-[#b3c2dc]">Products</span>
                            <span className="block text-[#b3c2dc]">FAQ</span>
                            <span className="block text-[#b3c2dc]">Contact</span>
                          </div>
                        </div>
                        <div>
                          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#dbe8ff]">Legal</p>
                          <div className="space-y-1">
                            <span className="block text-[#b3c2dc]">Privacy Policy</span>
                            <span className="block text-[#b3c2dc]">Cookies</span>
                            <span className="block text-[#b3c2dc]">Terms of Service</span>
                          </div>
                        </div>
                      </div>
                      <div className="pt-2 text-center">
                        <p>© 2026 AuditReady. All rights reserved.</p>
                      </div>
                    </div>
                  </footer>
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
