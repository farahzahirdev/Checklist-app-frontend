'use client';

import React, { useState } from 'react';
import { PageSection } from '@/lib/api/cms-api';
import { updateSection, deleteSection } from '@/lib/api/cms-api';
import { toast } from 'sonner';
import { Trash2, ChevronDown, ChevronUp, Eye, Edit3, Save, X } from 'lucide-react';

interface SectionEditorProps {
  section: PageSection;
  onUpdate?: () => void;
}

// Rich text editor component
function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = '',
  className = '' 
}: { 
  value: string; 
  onChange: (value: string) => void; 
  placeholder?: string; 
  className?: string; 
}) {
  const [isHtmlMode, setIsHtmlMode] = useState(false);

  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      <div className="flex justify-between items-center px-3 py-2 bg-gray-50 border-b">
        <span className="text-sm font-medium">Rich Text Editor</span>
        <button
          onClick={() => setIsHtmlMode(!isHtmlMode)}
          className="text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
        >
          {isHtmlMode ? 'Visual' : 'HTML'}
        </button>
      </div>
      
      {isHtmlMode ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={6}
          className="w-full px-3 py-2 font-mono text-sm border-0 focus:outline-none"
        />
      ) : (
        <div className="min-h-[150px]">
          <div className="flex gap-1 p-2 border-b bg-gray-50">
            <button
              onClick={() => onChange(value + '<strong>Bold</strong>')}
              className="px-2 py-1 text-xs font-bold border rounded hover:bg-gray-100"
              title="Bold"
            >
              B
            </button>
            <button
              onClick={() => onChange(value + '<em>Italic</em>')}
              className="px-2 py-1 text-xs italic border rounded hover:bg-gray-100"
              title="Italic"
            >
              I
            </button>
            <button
              onClick={() => onChange(value + '<u>Underline</u>')}
              className="px-2 py-1 text-xs underline border rounded hover:bg-gray-100"
              title="Underline"
            >
              U
            </button>
            <div className="w-px bg-gray-300" />
            <button
              onClick={() => onChange(value + '<h2>Heading</h2>')}
              className="px-2 py-1 text-xs border rounded hover:bg-gray-100"
              title="Heading"
            >
              H2
            </button>
            <button
              onClick={() => onChange(value + '<p>Paragraph</p>')}
              className="px-2 py-1 text-xs border rounded hover:bg-gray-100"
              title="Paragraph"
            >
              P
            </button>
            <button
              onClick={() => onChange(value + '<ul><li>List item</li></ul>')}
              className="px-2 py-1 text-xs border rounded hover:bg-gray-100"
              title="Bullet List"
            >
              •
            </button>
            <div className="w-px bg-gray-300" />
            <button
              onClick={() => onChange(value + '<a href="#">Link</a>')}
              className="px-2 py-1 text-xs border rounded hover:bg-gray-100"
              title="Link"
            >
              🔗
            </button>
          </div>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={8}
            className="w-full px-3 py-2 border-0 focus:outline-none resize-none"
          />
        </div>
      )}
    </div>
  );
}

// Section type-specific editors
function SectionDataEditor({ 
  sectionType, 
  data, 
  onChange 
}: { 
  sectionType: string; 
  data: any; 
  onChange: (data: any) => void; 
}) {
  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const updateNestedField = (parent: string, field: string, value: any) => {
    onChange({ 
      ...data, 
      [parent]: { 
        ...data[parent], 
        [field]: value 
      } 
    });
  };

  const updateNestedArrayField = (parent: string, index: number, field: string, value: any) => {
    const newArray = [...(data[parent] || [])];
    newArray[index] = { ...newArray[index], [field]: value };
    onChange({ 
      ...data, 
      [parent]: newArray
    });
  };

  switch (sectionType) {
    case 'hero':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Kicker</label>
            <input
              type="text"
              value={data.kicker || ''}
              onChange={(e) => updateField('kicker', e.target.value)}
              className="w-full border px-3 py-2 rounded"
              placeholder="e.g., About Us"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={data.title || ''}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full border px-3 py-2 rounded"
              placeholder="Main title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Subtitle</label>
            <input
              type="text"
              value={data.subtitle || ''}
              onChange={(e) => updateField('subtitle', e.target.value)}
              className="w-full border px-3 py-2 rounded"
              placeholder="Subtitle text"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Accent Text</label>
            <input
              type="text"
              value={data.accent || ''}
              onChange={(e) => updateField('accent', e.target.value)}
              className="w-full border px-3 py-2 rounded"
              placeholder="Highlighted accent text"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <RichTextEditor
              value={data.description || ''}
              onChange={(value) => updateField('description', value)}
              placeholder="Main description text"
            />
          </div>
        </div>
      );

    case 'cards':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Section Title</label>
            <input
              type="text"
              value={data.title || ''}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full border px-3 py-2 rounded"
              placeholder="Section title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Cards</label>
            <div className="space-y-3">
              {(data.cards || []).map((card: any, index: number) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">Card {index + 1}</h4>
                    <button
                      onClick={() => {
                        const newCards = [...(data.cards || [])];
                        newCards.splice(index, 1);
                        updateField('cards', newCards);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={card.title || ''}
                      onChange={(e) => updateNestedArrayField('cards', index, 'title', e.target.value)}
                      className="w-full border px-3 py-2 rounded text-sm"
                      placeholder="Card title"
                    />
                    <RichTextEditor
                      value={card.content || ''}
                      onChange={(value) => updateNestedArrayField('cards', index, 'content', value)}
                      placeholder="Card content"
                      className="text-sm"
                    />
                    {card.points && (
                      <div>
                        <label className="block text-xs font-medium mb-1">Points (one per line)</label>
                        <textarea
                          value={card.points.join('\n') || ''}
                          onChange={(e) => {
                            const newCards = [...(data.cards || [])];
                            newCards[index] = { ...newCards[index], points: e.target.value.split('\n').filter(p => p.trim()) };
                            updateField('cards', newCards);
                          }}
                          rows={3}
                          className="w-full border px-2 py-1 rounded text-xs"
                          placeholder="• Point 1&#10;• Point 2"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <button
                onClick={() => updateField('cards', [...(data.cards || []), { title: '', content: '', points: [] }])}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded text-gray-600 hover:border-gray-400 hover:text-gray-700"
              >
                + Add Card
              </button>
            </div>
          </div>
        </div>
      );

    case 'faq':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Section Title</label>
            <input
              type="text"
              value={data.title || ''}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full border px-3 py-2 rounded"
              placeholder="Section title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Subtitle</label>
            <input
              type="text"
              value={data.subtitle || ''}
              onChange={(e) => updateField('subtitle', e.target.value)}
              className="w-full border px-3 py-2 rounded"
              placeholder="Section subtitle"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Questions & Answers</label>
            <div className="space-y-3">
              {(data.questions || []).map((qa: any, index: number) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">Q&A {index + 1}</h4>
                    <button
                      onClick={() => {
                        const newQuestions = [...(data.questions || [])];
                        newQuestions.splice(index, 1);
                        updateField('questions', newQuestions);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={qa.question || ''}
                      onChange={(e) => updateNestedArrayField('questions', index, 'question', e.target.value)}
                      className="w-full border px-3 py-2 rounded text-sm"
                      placeholder="Question"
                    />
                    <RichTextEditor
                      value={qa.answer || ''}
                      onChange={(value) => updateNestedArrayField('questions', index, 'answer', value)}
                      placeholder="Answer"
                      className="text-sm"
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={() => updateField('questions', [...(data.questions || []), { question: '', answer: '' }])}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded text-gray-600 hover:border-gray-400 hover:text-gray-700"
              >
                + Add Question
              </button>
            </div>
          </div>
        </div>
      );

    case 'cta':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={data.title || ''}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full border px-3 py-2 rounded"
              placeholder="CTA title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Subtitle</label>
            <RichTextEditor
              value={data.subtitle || ''}
              onChange={(value) => updateField('subtitle', value)}
              placeholder="CTA subtitle"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Buttons</label>
            <div className="space-y-2">
              {(data.buttons || []).map((button: any, index: number) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={button.text || ''}
                    onChange={(e) => updateNestedArrayField('buttons', index, 'text', e.target.value)}
                    className="flex-1 border px-3 py-2 rounded text-sm"
                    placeholder="Button text"
                  />
                  <input
                    type="text"
                    value={button.url || ''}
                    onChange={(e) => updateNestedArrayField('buttons', index, 'url', e.target.value)}
                    className="flex-1 border px-3 py-2 rounded text-sm"
                    placeholder="URL"
                  />
                  <select
                    value={button.primary ? 'true' : 'false'}
                    onChange={(e) => updateNestedArrayField('buttons', index, 'primary', e.target.value === 'true')}
                    className="border px-3 py-2 rounded text-sm"
                  >
                    <option value="true">Primary</option>
                    <option value="false">Secondary</option>
                  </select>
                  <button
                    onClick={() => {
                      const newButtons = [...(data.buttons || [])];
                      newButtons.splice(index, 1);
                      updateField('buttons', newButtons);
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => updateField('buttons', [...(data.buttons || []), { text: '', url: '', primary: false }])}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded text-gray-600 hover:border-gray-400 hover:text-gray-700"
              >
                + Add Button
              </button>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div>
          <label className="block text-sm font-medium mb-2">Section Data (JSON)</label>
          <textarea
            value={JSON.stringify(data, null, 2)}
            onChange={(e) => {
              try {
                onChange(JSON.parse(e.target.value));
              } catch {
                // Let user fix JSON
              }
            }}
            rows={10}
            className="w-full border px-3 py-2 rounded font-mono text-sm"
            placeholder="{}"
          />
          <p className="text-xs text-gray-500 mt-1">
            Edit the JSON data structure for this section
          </p>
        </div>
      );
  }
}

export function EnhancedSectionEditor({ section, onUpdate }: SectionEditorProps) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sectionData, setSectionData] = useState(section.data || {});
  const [isPreview, setIsPreview] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Delete this section?')) return;

    try {
      setLoading(true);
      await deleteSection(section.id);
      toast.success('Section deleted');
      onUpdate?.();
    } catch (error) {
      toast.error('Failed to delete section');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateSection(section.id, { data: sectionData });
      toast.success('Section updated');
      onUpdate?.();
    } catch (error) {
      toast.error('Failed to update section');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="flex justify-between items-center p-4 bg-gray-50">
        <div>
          <h3 className="font-medium capitalize">{section.section_type}</h3>
          <p className="text-sm text-gray-500">Order: {section.order}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPreview(!isPreview)}
            className={`p-2 rounded ${isPreview ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            title={isPreview ? 'Edit' : 'Preview'}
          >
            {isPreview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800"
            title="Delete section"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gray-600 hover:bg-gray-100 p-1 rounded"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t">
          {isPreview ? (
            <div className="p-6">
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-700">
                  <strong>Preview Mode:</strong> This is how the section will appear on the frontend.
                </p>
              </div>
              <SectionPreview sectionType={section.section_type} data={sectionData} />
            </div>
          ) : (
            <div className="p-4 space-y-4">
              <SectionDataEditor
                sectionType={section.section_type}
                data={sectionData}
                onChange={setSectionData}
              />

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  onClick={() => setExpanded(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 disabled:bg-blue-400"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Simple preview component
function SectionPreview({ sectionType, data }: { sectionType: string; data: any }) {
  switch (sectionType) {
    case 'hero':
      return (
        <div className="space-y-4 p-6 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
          {data.kicker && <p className="text-sm text-blue-600 font-medium">{data.kicker}</p>}
          {data.title && <h1 className="text-2xl font-bold text-gray-900">{data.title}</h1>}
          {data.subtitle && <p className="text-lg text-gray-600">{data.subtitle}</p>}
          {data.accent && <p className="text-xl text-blue-600 font-semibold">{data.accent}</p>}
          {data.description && (
            <div 
              className="prose prose-sm max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: data.description }}
            />
          )}
        </div>
      );

    case 'cards':
      return (
        <div className="space-y-4 p-6">
          {data.title && <h2 className="text-xl font-bold mb-4">{data.title}</h2>}
          <div className="grid gap-4 md:grid-cols-2">
            {(data.cards || []).map((card: any, index: number) => (
              <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
                <h3 className="font-semibold mb-2">{card.title}</h3>
                {card.content && (
                  <div 
                    className="prose prose-sm max-w-none text-gray-600 mb-3"
                    dangerouslySetInnerHTML={{ __html: card.content }}
                  />
                )}
                {card.points && (
                  <ul className="space-y-1">
                    {card.points.map((point: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">•</span>
                        <span className="text-sm">{point}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      );

    case 'faq':
      return (
        <div className="space-y-4 p-6">
          {data.title && <h2 className="text-xl font-bold mb-2">{data.title}</h2>}
          {data.subtitle && <p className="text-gray-600 mb-4">{data.subtitle}</p>}
          <div className="space-y-3">
            {(data.questions || []).map((qa: any, index: number) => (
              <div key={index} className="border rounded-lg p-4 bg-white">
                <h3 className="font-semibold mb-2">{qa.question}</h3>
                {qa.answer && (
                  <div 
                    className="prose prose-sm max-w-none text-gray-600"
                    dangerouslySetInnerHTML={{ __html: qa.answer }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      );

    case 'cta':
      return (
        <div className="space-y-4 p-6 border rounded-lg bg-gradient-to-r from-green-50 to-blue-50">
          {data.title && <h2 className="text-xl font-bold">{data.title}</h2>}
          {data.subtitle && (
            <div 
              className="prose prose-sm max-w-none text-gray-700 mb-4"
              dangerouslySetInnerHTML={{ __html: data.subtitle }}
            />
          )}
          <div className="flex gap-3">
            {(data.buttons || []).map((button: any, index: number) => (
              <button
                key={index}
                className={`px-4 py-2 rounded ${
                  button.primary 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {button.text}
              </button>
            ))}
          </div>
        </div>
      );

    default:
      return (
        <div className="p-6 border rounded-lg bg-gray-50">
          <h3 className="font-medium mb-2">Section Type: {sectionType}</h3>
          <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-60">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      );
  }
}
