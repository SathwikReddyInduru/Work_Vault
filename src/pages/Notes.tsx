import { NoteEditor } from '@/components/notes/NoteEditor';
import { NoteList } from '@/components/notes/NoteList';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/ui/SearchBar';
import { useNotes } from '@/hooks/useNotes';
import type { Note } from '@/types/note.types';
import type { NoteFormValues } from '@/utils/validators';
import { FileText, Plus } from 'lucide-react';
import React, { useMemo, useState } from 'react';

const sanitize = (values: NoteFormValues) => ({
  title: values.title.trim() || 'Untitled',
  content: values.content ?? '',
  category: values.category,
  tags: values.tags ?? [],
  is_pinned: values.is_pinned ?? false,
});

const Notes: React.FC = () => {
  const { notes, create, update, remove, togglePin } = useNotes();

  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);
  const [deleting, setDeleting] = useState(false);

  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedId) ?? null,
    [notes, selectedId]
  );

  const handleSelect = (note: Note) => {
    setSelectedId(note.id);
    setIsComposing(false);
  };

  const handleNew = () => {
    setSelectedId(null);
    setIsComposing(true);
  };

  const handleSave = async (values: NoteFormValues) => {
    const payload = sanitize(values);
    if (isComposing) {
      const ok = await create(payload);
      if (ok) setIsComposing(false);
      return ok;
    }
    if (selectedNote) {
      return update({ id: selectedNote.id, ...payload });
    }
    return false;
  };

  const handleDelete = (note: Note) => setDeleteTarget(note);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await remove(deleteTarget.id);
    setDeleting(false);
    if (selectedId === deleteTarget.id) {
      setSelectedId(null);
      setIsComposing(false);
    }
    setDeleteTarget(null);
  };

  const header = (
    <div className="flex items-center justify-between gap-4 w-full">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-amber-600/20 rounded-lg flex items-center justify-center">
          <FileText size={16} className="text-amber-400" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Notes</h2>
          <p className="text-xs text-slate-500">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <SearchBar value={query} onChange={setQuery} placeholder="Search notes..." className="w-64" />
        <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={handleNew}>
          New Note
        </Button>
      </div>
    </div>
  );

  return (
    <PageWrapper header={header} noPadding>
      <div className="flex h-full overflow-hidden">
        <NoteList
          notes={notes}
          activeId={selectedId}
          query={query}
          onQueryChange={setQuery}
          onSelect={handleSelect}
          onNew={handleNew}
          onTogglePin={togglePin}
        />

        <NoteEditor
          note={selectedNote}
          isComposing={isComposing}
          onSave={handleSave}
          onDelete={handleDelete}
          onTogglePin={togglePin}
          onNew={handleNew}
        />

        <ConfirmDialog
          open={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
          loading={deleting}
          title="Delete Note"
          message={`Are you sure you want to delete "${deleteTarget?.title || 'Untitled'}"? This cannot be undone.`}
          confirmLabel="Delete"
        />
      </div>
    </PageWrapper>
  );
};

export default Notes;