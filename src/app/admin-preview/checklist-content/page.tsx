'use client';

import { useState } from 'react';

type ChecklistRow = {
  id: string;
  title: string;
  lawDecree: string;
  status: 'Published' | 'Draft' | 'Archived';
};

const initialChecklists: ChecklistRow[] = [
  { id: '1', title: 'Cybersecurity Checklist', lawDecree: 'NIST CSF + ISO mapped controls', status: 'Published' },
  { id: '2', title: 'SOC 2 Baseline', lawDecree: 'Trust Services Criteria', status: 'Draft' },
  { id: '3', title: 'HIPAA Controls', lawDecree: 'Security Rule Safeguards', status: 'Published' },
  { id: '4', title: 'Privacy Governance', lawDecree: 'GDPR + internal policy mapping', status: 'Archived' },
];

export default function AdminPreviewChecklistContentPage() {
  const [checklists, setChecklists] = useState<ChecklistRow[]>(initialChecklists);
  const [title, setTitle] = useState('');
  const [lawDecree, setLawDecree] = useState('');
  const [status, setStatus] = useState<ChecklistRow['status']>('Draft');
  const [editingId, setEditingId] = useState<string | null>(null);

  function resetForm() {
    setTitle('');
    setLawDecree('');
    setStatus('Draft');
    setEditingId(null);
  }

  function onSubmit() {
    if (!title.trim() || !lawDecree.trim()) return;
    if (editingId) {
      setChecklists((prev) =>
        prev.map((item) =>
          item.id === editingId ? { ...item, title: title.trim(), lawDecree: lawDecree.trim(), status } : item,
        ),
      );
      resetForm();
      return;
    }
    setChecklists((prev) => [
      { id: `new-${Date.now()}`, title: title.trim(), lawDecree: lawDecree.trim(), status },
      ...prev,
    ]);
    resetForm();
  }

  function onEdit(item: ChecklistRow) {
    setEditingId(item.id);
    setTitle(item.title);
    setLawDecree(item.lawDecree);
    setStatus(item.status);
  }

  function onDelete(id: string) {
    setChecklists((prev) => prev.filter((item) => item.id !== id));
    if (editingId === id) resetForm();
  }

  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-[#dbe4f4] bg-white px-5 py-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6f82a3]">Checklist Content</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1f2d45]">Checklist Schemas (Preview CRUD)</h1>
      </header>
      <article className="rounded-2xl border border-[#e2e8f5] bg-white p-4 shadow-sm">
        <div className="grid gap-2 md:grid-cols-[1fr_1fr_170px_auto]">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Checklist title"
            className="rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm text-[#2a3d5f]"
          />
          <input
            value={lawDecree}
            onChange={(event) => setLawDecree(event.target.value)}
            placeholder="Regulation or description"
            className="rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm text-[#2a3d5f]"
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as ChecklistRow['status'])}
            className="rounded-xl border border-[#d4dced] bg-[#f7f9fe] px-3 py-2 text-sm text-[#2a3d5f]"
          >
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
            <option value="Archived">Archived</option>
          </select>
          <div className="flex gap-2">
            <button onClick={onSubmit} type="button" className="rounded-xl border border-[#2f7dff] bg-[#2f7dff] px-3 py-2 text-sm font-semibold text-white">
              {editingId ? 'Update' : 'Add'}
            </button>
            {editingId ? (
              <button onClick={resetForm} type="button" className="rounded-xl border border-[#d4dced] px-3 py-2 text-sm font-semibold text-[#425f8f]">
                Cancel
              </button>
            ) : null}
          </div>
        </div>
      </article>
      <div className="grid gap-3 md:grid-cols-2">
        {checklists.map((checklist) => (
          <article key={checklist.id} className="rounded-2xl border border-[#e2e8f5] bg-white p-4 shadow-sm">
            <p className="text-lg font-semibold text-[#25375a]">{checklist.title}</p>
            <p className="mt-1 text-sm text-[#5f7395]">{checklist.lawDecree}</p>
            <p className="mt-2"><span className="rounded-md bg-[#edf1f8] px-2 py-1 text-xs font-semibold text-[#607594]">Status: {checklist.status}</span></p>
            <div className="mt-4 flex items-center gap-3">
              <button onClick={() => onEdit(checklist)} type="button" className="text-sm font-semibold text-[#3e69b0]">Edit</button>
              <button onClick={() => onDelete(checklist.id)} type="button" className="text-sm font-semibold text-[#c74d5f]">Delete</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
