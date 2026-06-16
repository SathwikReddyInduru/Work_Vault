import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchBar } from '@/components/ui/SearchBar';
import type { Note } from '@/types/note.types';
import { FileText, Plus, Search } from 'lucide-react';
import React, { useMemo } from 'react';
import { NoteCard } from './NoteCard';

interface NoteListProps {
  notes: Note[];
  activeId: number | null;
  query: string;
  onQueryChange: (q: string) => void;
  onSelect: (note: Note) => void;
  onNew: () => void;
  onTogglePin: (id: number) => void;
}

export const NoteList: React.FC<NoteListProps> = ({
  notes,
  activeId,
  query,
  onQueryChange,
  onSelect,
  onNew,
  onTogglePin,
}) => {
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = !q
      ? notes
      : notes.filter((n) =>
          [n.title, n.content, n.category, ...n.tags]
            .filter(Boolean)
            .some((field) => field!.toLowerCase().includes(q))
        );

    return [...list].sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }, [notes, query]);

  return (
    <div className="flex flex-col h-full w-80 flex-shrink-0 border-r border-slate-800">
      <div className="flex-shrink-0 flex flex-col gap-2 p-3 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-100 px-1">Notes</h2>
          <Button variant="ghost" size="sm" icon={<Plus size={13} />} onClick={onNew}>
            New
          </Button>
        </div>
        <SearchBar value={query} onChange={onQueryChange} placeholder="Search notes..." />
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {notes.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No notes yet"
            description="Create your first note."
            action={
              <Button variant="primary" size="sm" icon={<Plus size={13} />} onClick={onNew}>
                New Note
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No matches"
            description={`No notes match "${query}".`}
          />
        ) : (
          <div className="flex flex-col gap-1">
            {filtered.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                active={note.id === activeId}
                onClick={() => onSelect(note)}
                onTogglePin={onTogglePin}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};