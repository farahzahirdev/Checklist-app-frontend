'use client';

import React from 'react';
import { PageDetail, PageSection } from '@/lib/api/cms-api';

interface PageRendererProps {
  page: PageDetail | null;
  fallback: React.ReactNode;
}

/**
 * Renders a CMS page or fallback content
 * Maps section types to their corresponding display components
 */
export function PageRenderer({ page, fallback }: PageRendererProps) {
  // If no page from CMS, show fallback
  if (!page) {
    return <>{fallback}</>;
  }

  return (
    <div className="cms-page">
      {page.sections && page.sections.length > 0 ? (
        page.sections
          .sort((a, b) => a.order - b.order)
          .map((section) => (
            <SectionRenderer key={section.id} section={section} />
          ))
      ) : (
        // If page exists but has no sections, show fallback
        fallback
      )}
    </div>
  );
}

/**
 * Renders individual section based on section type
 */
function SectionRenderer({ section }: { section: PageSection }) {
  const data = section.data || {};

  switch (section.section_type) {
    case 'hero':
      return <HeroSectionRenderer data={data} />;
    case 'products':
      return <ProductSectionRenderer data={data} />;
    case 'faq':
      return <FAQSectionRenderer data={data} />;
    case 'use_cases':
      return <UseCasesSectionRenderer data={data} />;
    case 'steps':
      return <StepsSectionRenderer data={data} />;
    case 'contact_info':
      return <ContactInfoSectionRenderer data={data} />;
    case 'legal':
      return <LegalSectionRenderer data={data} />;
    case 'standard':
      return <StandardSectionRenderer data={data} />;
    default:
      return <div className="p-4 text-gray-500">Unknown section type: {section.section_type}</div>;
  }
}

// Section Renderers

function HeroSectionRenderer({ data }: { data: Record<string, any> }) {
  return (
    <section className="py-12 md:py-20 px-4 bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto text-center">
        {data.title && <h1 className="text-4xl md:text-5xl font-bold mb-4">{data.title}</h1>}
        {data.subtitle && <p className="text-lg md:text-xl text-gray-600 mb-8">{data.subtitle}</p>}
        {data.button_text && data.button_link && (
          <a
            href={data.button_link}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            {data.button_text}
          </a>
        )}
        {data.image_url && (
          <img
            src={data.image_url}
            alt={data.title || 'Hero'}
            className="mt-8 rounded-lg shadow-lg max-w-full h-auto"
          />
        )}
      </div>
    </section>
  );
}

function ProductSectionRenderer({ data }: { data: Record<string, any> }) {
  const products = data.products || [];

  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {data.title && <h2 className="text-3xl font-bold mb-8 text-center">{data.title}</h2>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product: any, idx: number) => (
            <div key={idx} className="border rounded-lg p-6 hover:shadow-lg transition">
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded mb-4"
                />
              )}
              <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
              <p className="text-gray-600 mb-4">{product.description}</p>
              {product.price && (
                <p className="text-2xl font-bold text-blue-600 mb-4">{product.price}</p>
              )}
              {product.category && (
                <span className="inline-block bg-gray-100 px-3 py-1 rounded text-sm">
                  {product.category}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSectionRenderer({ data }: { data: Record<string, any> }) {
  const items = data.items || [];

  return (
    <section className="py-12 px-4 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        {data.title && <h2 className="text-3xl font-bold mb-8 text-center">{data.title}</h2>}
        <div className="space-y-4">
          {items.map((item: any, idx: number) => (
            <FAQItem key={idx} question={item.question} answer={item.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = React.useState(false);

  return (
    <details
      className="border rounded-lg p-4 cursor-pointer"
      open={open}
      onClick={() => setOpen(!open)}
    >
      <summary className="font-medium flex justify-between items-center">
        {question}
        <span>{open ? '−' : '+'}</span>
      </summary>
      <p className="mt-3 text-gray-600">{answer}</p>
    </details>
  );
}

function UseCasesSectionRenderer({ data }: { data: Record<string, any> }) {
  const items = data.items || [];

  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {data.title && <h2 className="text-3xl font-bold mb-8 text-center">{data.title}</h2>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item: any, idx: number) => (
            <div key={idx} className="text-center">
              {item.icon && <div className="text-4xl mb-4">{item.icon}</div>}
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StepsSectionRenderer({ data }: { data: Record<string, any> }) {
  const items = data.items || [];

  return (
    <section className="py-12 px-4 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        {data.title && <h2 className="text-3xl font-bold mb-8 text-center">{data.title}</h2>}
        <div className="space-y-6">
          {items.map((item: any, idx: number) => (
            <div key={idx} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-semibold">
                  {item.number || idx + 1}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactInfoSectionRenderer({ data }: { data: Record<string, any> }) {
  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-2xl mx-auto text-center">
        {data.title && <h2 className="text-3xl font-bold mb-8">{data.title}</h2>}
        {data.email && (
          <p className="text-lg mb-2">
            <strong>Email:</strong>{' '}
            <a href={`mailto:${data.email}`} className="text-blue-600 hover:underline">
              {data.email}
            </a>
          </p>
        )}
        {data.phone && (
          <p className="text-lg mb-2">
            <strong>Phone:</strong> {data.phone}
          </p>
        )}
        {data.address && (
          <p className="text-lg mb-2">
            <strong>Address:</strong> {data.address}
          </p>
        )}
      </div>
    </section>
  );
}

function LegalSectionRenderer({ data }: { data: Record<string, any> }) {
  return (
    <section className="py-12 px-4 bg-white max-w-4xl mx-auto prose prose-sm">
      {data.content && <div dangerouslySetInnerHTML={{ __html: data.content }} />}
    </section>
  );
}

function StandardSectionRenderer({ data }: { data: Record<string, any> }) {
  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-4xl mx-auto prose">
        {data.content && <div dangerouslySetInnerHTML={{ __html: data.content }} />}
      </div>
    </section>
  );
}
