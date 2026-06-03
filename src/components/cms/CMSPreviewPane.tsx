'use client';

import React, { useState } from 'react';
import { Monitor, Tablet, Smartphone } from 'lucide-react';
import { translate, useLocale } from '@/lib/i18n';
import { adminCmsMessages } from '@/locales/admin-cms';
import { PageDetail } from '@/lib/api/cms-api';
import heroBackground from '@/assets/cybersecurity-background-59ognpsy7izka4l9.png';

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

function resourcesIcon(name: string, className = 'h-6 w-6') {
  switch (name) {
    case 'calendar':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8 3v4M16 3v4M4 9h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'clipboard-check':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <rect x="6" y="4" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M9 9h6M9 13h3m1 4 2 2 3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'shield-check':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="m9.4 12.2 1.8 1.8 3.6-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'shield':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path d="M12 2 4 5v6c0 5.3 3.4 9.6 8 11 4.6-1.4 8-5.7 8-11V5l-8-3Z" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <circle cx="12" cy="11" r="6" stroke="currentColor" strokeWidth="1.8" />
          <path d="m9.5 11.2 1.8 1.8 3.3-3.7M9 18.5l-1 2.5 4-1.3 4 1.3-1-2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

export function CMSPreviewPane({ page, contentChanges = {}, className = '' }: CMSPreviewPaneProps) {
  const { locale } = useLocale();
  const t = (key: string, values?: Record<string, string>) => translate(adminCmsMessages, locale, key, values);
  const [device, setDevice] = useState<DeviceType>('desktop');

  const deviceWidths: Record<DeviceType, { width: string; height: string }> = {
    desktop: { width: '100%', height: '600px' },
    tablet: { width: '360px', height: '700px' },
    mobile: { width: '320px', height: '600px' },
  };

  const handleDeviceChange = (newDevice: DeviceType) => {
    setDevice(newDevice);
  };

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
          <div
            className="bg-white rounded-lg overflow-hidden shadow-xl transition-all duration-300 border border-gray-200 flex-shrink-0"
            style={{
              width: deviceWidths[device].width,
              maxWidth: '100%',
              height: deviceWidths[device].height,
              minHeight: '400px',
            }}
          >
            {/* Preview Content - Real data */}
            <div className="h-full overflow-y-auto bg-[#f3f5fb]">
              {page ? (
                <div className="min-h-full">
                  {page.sections?.sort((a, b) => a.order - b.order).map((section) => {
                    const sectionData = { ...section.data, ...contentChanges };

                    // Hero Section
                    if (section.section_type === 'hero' || section.section_type === 'product-hero') {
                      const heroImage = sectionData.background_image && !sectionData.background_image.startsWith('/assets/')
                        ? sectionData.background_image
                        : heroBackground.src;
                      const heroStyle = {
                        backgroundImage: `linear-gradient(rgba(243, 246, 255, 0.88), rgba(243, 246, 255, 0.92)), url(${heroImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                      };

                      const buttons = Array.isArray(sectionData.buttons) ? sectionData.buttons : [];
                      const highlights = Array.isArray(sectionData.highlights) ? sectionData.highlights : [];

                      return (
                        <div key={section.id} style={heroStyle} className="px-4 py-6 text-[#1a2440]">
                          <div className="space-y-4">
                            {/* Back link */}
                            {sectionData.back_to_products && (
                              <div className="text-sm">
                                <span className="text-[#64799d]">← {sectionData.back_to_products}</span>
                              </div>
                            )}

                            {/* Badge */}
                            {sectionData.badge && (
                              <span className="inline-flex rounded-full bg-[#dfe8ff] px-3 py-1 text-xs text-[#5278be]">
                                {sectionData.badge}
                              </span>
                            )}

                            {/* Title with icon */}
                            <div className="flex items-start gap-3">
                              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#dfe9ff] text-[#2f7dff]">
                                {resourcesIcon('shield-check', 'h-6 w-6')}
                              </span>
                              <div>
                                {Array.isArray(sectionData.title_lines) && sectionData.title_lines.length > 0 ? (
                                  <h1 className="text-xl font-bold leading-tight">
                                    {sectionData.title_lines[0]}
                                    {sectionData.title_lines[1] && <><br />{sectionData.title_lines[1]}</>}
                                  </h1>
                                ) : sectionData.title ? (
                                  <h1 className="text-xl font-bold" dangerouslySetInnerHTML={{ __html: sectionData.title }} />
                                ) : null}
                              </div>
                            </div>

                            {/* Subtitle */}
                            {sectionData.subtitle && (
                              <p className="text-sm text-[#4f6282]" dangerouslySetInnerHTML={{ __html: sectionData.subtitle }} />
                            )}

                            {/* Buttons */}
                            {buttons.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {buttons.map((button: any, idx: number) => (
                                  <button
                                    key={idx}
                                    className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                                      button.primary 
                                        ? 'border-[#1f7bff] bg-[#1f7bff] text-white hover:bg-[#2e87ff]' 
                                        : 'border-[#b5c7e7] bg-white/85 text-[#334a72] hover:bg-white'
                                    }`}
                                  >
                                    {button.text}
                                    <svg viewBox="0 0 20 20" className="h-3 w-3" fill="none" aria-hidden="true">
                                      <path d="M4 10h10m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* Highlights */}
                            {highlights.length > 0 && (
                              <div className="grid gap-2 pt-2 sm:grid-cols-2">
                                {highlights.map((item: any, idx: number) => (
                                  <div key={idx} className="flex items-start gap-2 text-[#3f5375]">
                                    <span className="mt-0.5 text-[#2f7dff]">{resourcesIcon(item.icon || 'shield', 'h-4 w-4')}</span>
                                    <div>
                                      <p className="text-sm font-semibold">{item.title}</p>
                                      <p className="text-xs text-[#627796]">{item.body}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Mockup */}
                            {sectionData.mockup && (
                              <div className="mt-4 overflow-hidden rounded-xl border border-[#c9d7ef] bg-[#f7f9fe] shadow-lg">
                                <div className="grid grid-cols-[120px_1fr]">
                                  <aside className="bg-[#0b1a39] p-2 text-[#dce8ff]">
                                    <p className="mb-2 text-xs font-semibold">{sectionData.mockup.brand || 'AuditReady'}</p>
                                    <ul className="space-y-1 text-[10px]">
                                      {(sectionData.mockup.nav ? Object.values(sectionData.mockup.nav) : ['Dashboard', 'Checklists', 'Reports', 'Settings']).map((item: any, index: number) => (
                                        <li key={index} className={`rounded px-1.5 py-1 ${index === 1 ? 'bg-[#17376d]' : 'text-[#a0b4d5]'}`}>
                                          {item}
                                        </li>
                                      ))}
                                    </ul>
                                  </aside>
                                  <div className="p-2">
                                    <div className="rounded-lg bg-white p-2">
                                      <p className="text-xs font-semibold text-[#253d63]">{sectionData.mockup.sectionTitle || '1.1 Information Security Policies'}</p>
                                      <div className="mt-1 grid gap-1">
                                        <div>
                                          <p className="text-xs font-semibold text-[#1f2741]">{sectionData.mockup.question || ''}</p>
                                          <p className="text-[10px] text-[#6b7e9b]">{sectionData.mockup.questionHelp || ''}</p>
                                        </div>
                                        {sectionData.mockup.progress && (
                                          <div className="rounded bg-[#f7f9ff] p-1.5 text-xs text-[#5f7292]">
                                            <p className="font-semibold text-[#344d75]">{sectionData.mockup.progress}</p>
                                            <p className="text-lg font-bold text-[#1f355d]">42%</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }

                    // Main Benefit Section
                    if (section.section_type === 'main-benefit') {
                      return (
                        <div key={section.id} className="px-4 py-6">
                          <div className="rounded-2xl border border-[#d7deeb] bg-white p-6">
                            {sectionData.title && (
                              <h2 className="text-xl font-semibold text-[#1f2741] mb-4" dangerouslySetInnerHTML={{ __html: sectionData.title }} />
                            )}
                            {sectionData.description && (
                              <p className="text-sm text-[#55627e] leading-relaxed" dangerouslySetInnerHTML={{ __html: sectionData.description }} />
                            )}
                          </div>
                        </div>
                      );
                    }

                    // Use Cases Section
                    if (section.section_type === 'use-cases') {
                      const items = Array.isArray(sectionData.items) ? sectionData.items : [];
                      return (
                        <div key={section.id} className="px-4 py-6">
                          {sectionData.title && (
                            <h2 className="text-xl font-semibold text-[#1f2741] mb-4">{sectionData.title}</h2>
                          )}
                          <div className="space-y-3">
                            {items.map((item: any, idx: number) => (
                              <div key={idx} className="rounded-xl border border-[#d7deeb] bg-white p-4">
                                <h3 className="text-sm font-semibold text-[#1f2741] mb-2">{item.title}</h3>
                                <p className="text-xs text-[#55627e]" dangerouslySetInnerHTML={{ __html: item.description }} />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    // How It Works Section
                    if (section.section_type === 'how-it-works') {
                      const steps = Array.isArray(sectionData.steps) ? sectionData.steps : [];
                      return (
                        <div key={section.id} className="px-4 py-6">
                          {sectionData.title && (
                            <h2 className="text-xl font-semibold text-[#1f2741] mb-4">{sectionData.title}</h2>
                          )}
                          <div className="space-y-4">
                            {steps.map((step: any, idx: number) => (
                              <div key={idx} className="flex gap-3">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2f7dff] text-xs font-bold text-white">
                                  {idx + 1}
                                </span>
                                <div>
                                  <h3 className="text-sm font-semibold text-[#1f2741]">{step.title}</h3>
                                  <p className="text-xs text-[#55627e] mt-1" dangerouslySetInnerHTML={{ __html: step.description }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    // Who It's For Section
                    if (section.section_type === 'who-its-for') {
                      const items = Array.isArray(sectionData.items) ? sectionData.items : [];
                      return (
                        <div key={section.id} className="px-4 py-6">
                          {sectionData.title && (
                            <h2 className="text-xl font-semibold text-[#1f2741] mb-4">{sectionData.title}</h2>
                          )}
                          <div className="grid gap-3 sm:grid-cols-2">
                            {items.map((item: any, idx: number) => (
                              <div key={idx} className="rounded-xl border border-[#d7deeb] bg-white p-4">
                                <h3 className="text-sm font-semibold text-[#1f2741]">{item.title}</h3>
                                <p className="text-xs text-[#55627e] mt-1" dangerouslySetInnerHTML={{ __html: item.description }} />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    // What You Get Section
                    if (section.section_type === 'what-you-get') {
                      const cards = Array.isArray(sectionData.cards) ? sectionData.cards : [];
                      return (
                        <div key={section.id} className="px-4 py-6">
                          {sectionData.title && (
                            <h2 className="text-xl font-semibold text-[#1f2741] mb-4">{sectionData.title}</h2>
                          )}
                          <div className="space-y-3">
                            {cards.map((card: any, idx: number) => (
                              <div key={idx} className="rounded-xl border border-[#d7deeb] bg-white p-4">
                                <div className="flex items-start gap-3">
                                  <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef2ff] text-[#2f7dff]">
                                    {resourcesIcon(card.icon || 'shield-check', 'h-4 w-4')}
                                  </span>
                                  <div>
                                    <h3 className="text-sm font-semibold text-[#1f2741]">{card.title}</h3>
                                    <p className="text-xs text-[#55627e] mt-1" dangerouslySetInnerHTML={{ __html: card.description }} />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    // Cards Section
                    if (section.section_type === 'cards') {
                      const features: Feature[] = [];
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
                        <div key={section.id} className="px-4 py-6">
                          <div className="space-y-4">
                            {features.sort((a, b) => a.index - b.index).map((feature) => (
                              <div key={feature.index} className="flex items-start gap-3 rounded-xl border border-[#d7deeb] bg-white p-4">
                                <span className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef2ff] text-[#2f7dff]">
                                  {resourcesIcon('shield-check', 'h-5 w-5')}
                                </span>
                                <div>
                                  {feature.title && (
                                    <h3 className="text-base font-semibold text-[#1f2741]" dangerouslySetInnerHTML={{ __html: feature.title }} />
                                  )}
                                  {feature.description && (
                                    <p className="mt-1 text-xs text-[#55627e]" dangerouslySetInnerHTML={{ __html: feature.description }} />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    // Text/Content Section
                    if (section.section_type === 'text' || section.section_type === 'content') {
                      return (
                        <div key={section.id} className="px-4 py-6">
                          {sectionData.title && (
                            <h2 className="text-lg font-semibold text-[#1e293b] mb-3" dangerouslySetInnerHTML={{ __html: sectionData.title }} />
                          )}
                          {sectionData.content && (
                            <div 
                              className="prose prose-sm max-w-none text-[#475569]" 
                              dangerouslySetInnerHTML={{ __html: sectionData.content }} 
                            />
                          )}
                        </div>
                      );
                    }

                    // FAQ Section
                    if (section.section_type === 'faq') {
                      const questions = Array.isArray(sectionData.questions) ? sectionData.questions : [];
                      return (
                        <div key={section.id} className="px-4 py-6">
                          {sectionData.title && (
                            <h2 className="text-lg font-semibold text-[#1e293b] mb-4">{sectionData.title}</h2>
                          )}
                          <div className="space-y-3">
                            {questions.map((qa: any, idx: number) => (
                              <div key={idx} className="rounded-xl border border-[#e2e8f0] bg-white p-4">
                                <h3 className="text-sm font-semibold text-[#1e293b]">{qa.question}</h3>
                                {qa.answer && (
                                  <p className="mt-2 text-xs text-[#64748b]" dangerouslySetInnerHTML={{ __html: qa.answer }} />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    // CTA Section
                    if (section.section_type === 'cta') {
                      const buttons = Array.isArray(sectionData.buttons) ? sectionData.buttons : [];
                      return (
                        <div key={section.id} className="px-4 py-8">
                          <div className="rounded-2xl border border-[#d7deeb] bg-white p-6 text-center">
                            {sectionData.title && (
                              <h2 className="text-xl font-semibold text-[#1f2741] mb-3" dangerouslySetInnerHTML={{ __html: sectionData.title }} />
                            )}
                            {sectionData.subtitle && (
                              <p className="text-sm text-[#55627e] mb-4" dangerouslySetInnerHTML={{ __html: sectionData.subtitle }} />
                            )}
                            <div className="flex flex-wrap gap-2 justify-center">
                              {buttons.map((button: any, idx: number) => (
                                <button
                                  key={idx}
                                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                                    button.primary 
                                      ? 'border-[#2f7dff] bg-[#2f7dff] text-white hover:bg-[#1a5cd8]' 
                                      : 'border-[#b5c7e7] bg-white text-[#334a72] hover:bg-[#f8fafc]'
                                  }`}
                                >
                                  {button.text}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // Default fallback
                    return (
                      <div key={section.id} className="px-4 py-6">
                        <div className="rounded-xl border border-[#e2e8f0] bg-white p-4">
                          <p className="text-xs text-[#64748b]">Section type: {section.section_type}</p>
                          <pre className="mt-2 text-[10px] bg-[#f8fafc] p-2 rounded overflow-auto max-h-32">
                            {JSON.stringify(section.data, null, 2)}
                          </pre>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
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
