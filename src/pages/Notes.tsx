import { NoteEditor } from '@/components/notes/NoteEditor';
import { NoteList } from '@/components/notes/NoteList';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useNotes } from '@/hooks/useNotes';
import type { Note } from '@/types/note.types';
import type { NoteFormValues } from '@/utils/validators';
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

  return (
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
  );
};

export default Notes;