'use client';

'use client';

import React, { useState } from 'react';
import { PageSection } from '@/lib/api/cms-api';
import { updateSection, deleteSection } from '@/lib/api/cms-api';
import { toast } from 'sonner';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface SectionEditorProps {
  section: PageSection;
  onUpdate?: () => void;
}

export function SectionEditor({ section, onUpdate }: SectionEditorProps) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sectionData, setSectionData] = useState(section.data || {});

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
      <div
        className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <h3 className="font-medium capitalize">{section.section_type}</h3>
          <p className="text-sm text-gray-500">Order: {section.order}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="text-red-600 hover:text-red-800"
            title="Delete section"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="p-4 border-t space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Section Data (JSON)</label>
            <textarea
              value={JSON.stringify(sectionData, null, 2)}
              onChange={(e) => {
                try {
                  setSectionData(JSON.parse(e.target.value));
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

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setExpanded(false)}
              className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:bg-blue-400"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
