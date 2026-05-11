'use client';

import React, { useState } from 'react';
import { Monitor, Tablet, Smartphone, X } from 'lucide-react';
import type { PageDetail } from '@/lib/api/cms-api';
import heroBackground from '@/assets/cybersecurity-background-59ognpsy7izka4l9.png';

interface CMSPreviewProps {
  page: PageDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

type ViewportType = 'desktop' | 'tablet' | 'mobile';

interface ViewportConfig {
  name: string;
  width: number;
  height: number;
  icon: React.ReactNode;
}

const VIEWPORTS: Record<ViewportType, ViewportConfig> = {
  desktop: {
    name: 'Desktop (1920×1080)',
    width: 1920,
    height: 1080,
    icon: <Monitor className="w-4 h-4" />,
  },
  tablet: {
    name: 'Tablet (768×1024)',
    width: 768,
    height: 1024,
    icon: <Tablet className="w-4 h-4" />,
  },
  mobile: {
    name: 'Mobile (375×667)',
    width: 375,
    height: 667,
    icon: <Smartphone className="w-4 h-4" />,
  },
};

/**
 * Preview section based on type
 */
function PreviewSection({ section, viewport }: any) {
  const baseClasses = 'px-6 py-8 space-y-4';
  
  switch (section.section_type) {
    case 'hero':
      const heroImage = section.data.background_image && !section.data.background_image.startsWith('/assets/')
        ? section.data.background_image
        : heroBackground.src;
      const backgroundImage = `linear-gradient(rgba(4, 9, 22, 0.56), rgba(4, 9, 22, 0.72)), url(${heroImage})`;

      return (
        <div
          className={`${baseClasses} text-white`}
          style={{
            backgroundImage,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
            <div className="space-y-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#5ea2ff] opacity-90">
                {section.data.kicker || 'Hero Section'}
              </div>
              <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl">
                {section.data.title}
              </h1>
              {section.data.subtitle && (
                <p className="text-sm sm:text-base text-[#d4e2f6]">{section.data.subtitle}</p>
              )}
              {section.data.description && (
                <p className="text-xs sm:text-sm leading-6 text-[#d4e2f6]">{section.data.description}</p>
              )}
            </div>

            {section.data.mockup && (
              <div className="overflow-hidden rounded-2xl border border-[#325a99]/80 bg-[#edf1f9] text-[#152948] shadow-[0_24px_70px_rgba(0,0,0,0.4)]">
                <div className="grid md:grid-cols-[120px_1fr]">
                  <aside className="bg-[#0b1a39] p-2 text-[#dce8ff]">
                    <p className="mb-2 text-xs font-semibold">{section.data.mockup.brand || 'AuditReady'}</p>
                    <ul className="space-y-1 text-[10px]">
                      {(section.data.mockup.nav ? Object.values(section.data.mockup.nav) : ['Dashboard', 'Checklists', 'Reports', 'Settings']).map((item: any, index: number) => (
                        <li key={index} className={`rounded px-2 py-1 ${index === 0 ? 'bg-[#17376d]' : 'text-[#a0b4d5]'}`}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </aside>
                  <div className="p-3">
                    <div className="rounded-xl bg-white p-2.5">
                      <p className="text-xs font-semibold text-[#1a2c4f]">{section.data.mockup.dashboard?.title || 'Dashboard'}</p>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {Object.values(section.data.mockup.dashboard?.metrics || {
                          overallReadiness: 'Overall Readiness',
                          completed: 'Completed',
                          openFindings: 'Open Findings',
                        }).map((label: any, index: number) => (
                          <div key={index} className="flex min-h-[72px] flex-col rounded-lg border border-[#e2e8f5] bg-[#f8fbff] p-2">
                            <p className="text-[10px] leading-[1.1] text-[#6f7f98]">{label}</p>
                            <div className="mt-auto h-1.5 rounded-full bg-[#d6e2f7]">
                              <div className="h-full w-[72%] rounded-full bg-[#2e82ff]" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    
    case 'features':
      return (
        <div className={baseClasses}>
          <h2 className="text-2xl font-bold text-gray-900">Key Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {section.data.items?.map((item: any, idx: number) => (
              <div key={idx} className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-600 mt-2">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      );
    
    case 'products':
      return (
        <div className={baseClasses}>
          <h2 className="text-2xl font-bold text-gray-900">Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {section.data.items?.map((item: any, idx: number) => (
              <div key={idx} className="border rounded-lg p-4 hover:shadow-lg transition">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.subtitle}</p>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{item.price}</span>
                </div>
                {item.badge && (
                  <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    {item.badge}
                  </span>
                )}
                <ul className="mt-3 space-y-1">
                  {item.points?.map((point: string, pidx: number) => (
                    <li key={pidx} className="text-xs text-gray-600 flex items-center gap-2">
                      <span className="text-green-600">✓</span> {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      );
    
    case 'faqs':
      return (
        <div className={baseClasses}>
          <h2 className="text-2xl font-bold text-gray-900">FAQ</h2>
          <div className="space-y-3">
            {section.data.items?.map((item: any, idx: number) => (
              <details key={idx} className="border rounded-lg">
                <summary className="p-4 font-semibold cursor-pointer hover:bg-gray-50">
                  {item.question}
                </summary>
                <div className="px-4 py-2 text-sm text-gray-600 border-t bg-gray-50">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      );
    
    case 'cta':
      return (
        <div className={`${baseClasses} bg-blue-50 border-l-4 border-blue-600`}>
          <h2 className="text-2xl font-bold text-gray-900">{section.data.title}</h2>
          <p className="text-gray-700">{section.data.description}</p>
          <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            {section.data.buttonText}
          </button>
        </div>
      );
    
    case 'contact_info':
      return (
        <div className={baseClasses}>
          <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
          <div className="space-y-2 text-gray-700">
            <p>📧 {section.data.email}</p>
            <p>📞 {section.data.phone}</p>
            <p>📍 {section.data.address}</p>
          </div>
        </div>
      );
    
    case 'legal':
      return (
        <div className={baseClasses}>
          <h1 className="text-3xl font-bold text-gray-900">{section.data.title}</h1>
          <div className="text-gray-700 space-y-4 whitespace-pre-line text-sm">
            {section.data.content}
          </div>
        </div>
      );
    
    case 'standard':
      return (
        <div className={baseClasses}>
          <div className="text-gray-700">{section.data.content}</div>
        </div>
      );
    
    default:
      return (
        <div className={baseClasses}>
          <p className="text-gray-500 italic">Section type: {section.section_type}</p>
        </div>
      );
  }
}

/**
 * Responsive CMS Preview Component
 * Shows preview of how page looks on different devices
 */
export function CMSPreview({ page, isOpen, onClose }: CMSPreviewProps) {
  const [activeViewport, setActiveViewport] = useState<ViewportType>('desktop');

  if (!isOpen) return null;

  const viewport = VIEWPORTS[activeViewport];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">Preview</h2>
            <p className="text-sm text-gray-600 mt-1">
              {page?.title} — {page?.language.toUpperCase()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Viewport Selector */}
        <div className="flex gap-2 px-6 py-4 border-b bg-gray-50">
          {(Object.entries(VIEWPORTS) as [ViewportType, ViewportConfig][]).map(
            ([key, config]) => (
              <button
                key={key}
                onClick={() => setActiveViewport(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  activeViewport === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border hover:bg-gray-100'
                }`}
              >
                {config.icon}
                <span className="text-sm font-medium">{config.name}</span>
              </button>
            )
          )}
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-auto bg-gray-100 p-8 flex items-start justify-center">
          <div
            className="bg-white shadow-xl transition-all duration-300 overflow-hidden rounded-lg"
            style={{
              width: `${viewport.width}px`,
              maxHeight: `${viewport.height}px`,
              border: '1px solid #e5e7eb',
            }}
          >
            {/* Device Bezel */}
            <div className="border-[12px] border-gray-900 rounded-[20px] overflow-hidden bg-white">
              <div
                className="bg-white overflow-y-auto"
                style={{ height: `${viewport.height - 24}px` }}
              >
                {/* Page Content */}
                <div>
                  {/* Page Meta */}
                  <div className="px-6 py-4 border-b text-xs text-gray-500">
                    <strong>Title:</strong> {page?.title}
                    <br />
                    <strong>Meta:</strong> {page?.meta_description}
                  </div>

                  {/* Sections */}
                  {page?.sections && page.sections.length > 0 ? (
                    <div>
                      {page.sections
                        .sort((a, b) => a.order - b.order)
                        .map((section) => (
                          <PreviewSection
                            key={section.id}
                            section={section}
                            viewport={activeViewport}
                          />
                        ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-400">
                      No sections to preview
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t text-sm text-gray-600">
          Tip: Resize your browser window to see how the preview adapts responsively
        </div>
      </div>
    </div>
  );
}
