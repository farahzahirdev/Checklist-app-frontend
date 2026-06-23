'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link as LinkIcon,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';

interface TipTapRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  t: (key: string, values?: Record<string, string>) => string;
}

export function TipTapRichTextEditor({
  value,
  onChange,
  placeholder = '',
  className = '',
  t,
}: TipTapRichTextEditorProps) {
  const isUserEditing = useRef(false);
  const lastSyncedValue = useRef(value);

  const editorExtensions = React.useMemo(
    () => [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
        underline: false,
        link: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    []
  );

const editor = useEditor({
  extensions: editorExtensions,
  onUpdate: ({ editor }) => {
    isUserEditing.current = true;
    const html = editor.getHTML();
    onChange(html);
    // Reset the editing flag after a short delay
    setTimeout(() => {
      isUserEditing.current = false;
    }, 100);
  },
  onFocus: () => {
    isUserEditing.current = true;
  },
  onBlur: () => {
    isUserEditing.current = false;
  },
  editorProps: {
    attributes: {
      class: 'focus:outline-none min-h-[200px] p-4 text-[#1f2d45] leading-relaxed',
    },
  },
});

  // Only update editor content from props if value changed externally (not from user editing)
  useEffect(() => {
    if (!editor) return;
    // Only update if the value has changed and isn't currently being edited
    const currentHTML = editor.getHTML();
    if (value !== currentHTML && !isUserEditing.current) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt(t('sectionEditor.richText.linkPrompt'), previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor, t]);

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({
    onClick,
    isActive = false,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`rounded px-2 py-1.5 text-sm transition-colors ${
        isActive
          ? 'bg-[#3b82f6] text-white'
          : 'text-[#425f8f] hover:bg-[#edf4ff] hover:text-[#1f2d45]'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className={`overflow-hidden rounded-xl border border-[#dbe4f4] bg-white [color-scheme:light] ${className}`}>
      <style jsx global>{`
        .tiptap h1 {
          font-size: 1.875rem;
          font-weight: 700;
          line-height: 2.25rem;
          margin-bottom: 1rem;
          margin-top: 1.5rem;
        }
        .tiptap h2 {
          font-size: 1.5rem;
          font-weight: 600;
          line-height: 2rem;
          margin-bottom: 0.75rem;
          margin-top: 1.25rem;
        }
        .tiptap h3 {
          font-size: 1.25rem;
          font-weight: 600;
          line-height: 1.75rem;
          margin-bottom: 0.5rem;
          margin-top: 1rem;
        }
        .tiptap p {
          margin-bottom: 0.75rem;
        }
        .tiptap ul,
        .tiptap ol {
          margin-bottom: 0.75rem;
          padding-left: 1.5rem;
        }
        .tiptap ul {
          list-style-type: disc;
        }
        .tiptap ol {
          list-style-type: decimal;
        }
        .tiptap li {
          margin-bottom: 0.25rem;
        }
        .tiptap a {
          color: #2563eb;
          text-decoration: underline;
        }
        .tiptap a:hover {
          color: #1d4ed8;
        }
        .tiptap code {
          background-color: #f1f5f9;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.875rem;
        }
        .tiptap strong {
          font-weight: 700;
        }
        .tiptap em {
          font-style: italic;
        }
        .tiptap u {
          text-decoration: underline;
        }
      `}</style>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-[#eef2fa] bg-[#f7f9fe] p-2">
        {/* Undo/Redo */}
        <div className="flex items-center gap-1 border-r border-[#dbe4f4] pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            title={t('sectionEditor.richText.undo')}
          >
            <Undo className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            title={t('sectionEditor.richText.redo')}
          >
            <Redo className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 border-r border-[#dbe4f4] pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title={t('sectionEditor.richText.h1')}
          >
            <Heading1 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title={t('sectionEditor.richText.h2')}
          >
            <Heading2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title={t('sectionEditor.richText.h3')}
          >
            <Heading3 className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* Text Formatting */}
        <div className="flex items-center gap-1 border-r border-[#dbe4f4] pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title={t('sectionEditor.richText.bold')}
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title={t('sectionEditor.richText.italic')}
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title={t('sectionEditor.richText.underline')}
          >
            <UnderlineIcon className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            title={t('sectionEditor.richText.code')}
          >
            <Code className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 border-r border-[#dbe4f4] pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title={t('sectionEditor.richText.bulletList')}
          >
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title={t('sectionEditor.richText.orderedList')}
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-1 border-r border-[#dbe4f4] pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            title={t('sectionEditor.richText.alignLeft')}
          >
            <AlignLeft className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            title={t('sectionEditor.richText.alignCenter')}
          >
            <AlignCenter className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            title={t('sectionEditor.richText.alignRight')}
          >
            <AlignRight className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* Link */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={setLink}
            isActive={editor.isActive('link')}
            title={t('sectionEditor.richText.insertLink')}
          >
            <LinkIcon className="w-4 h-4" />
          </ToolbarButton>
        </div>
      </div>

      {/* Editor */}
      <div className="min-h-[200px]">
        <EditorContent editor={editor} placeholder={placeholder} />
      </div>
    </div>
  );
}
