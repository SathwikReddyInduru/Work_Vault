import { EmptyState } from '@/components/ui/EmptyState';
import type { Note } from '@/types/note.types';
import { FileText, Search } from 'lucide-react';
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
    <div className="flex flex-col h-full w-72 flex-shrink-0 border-r border-slate-800">

      {/* Recent pill header */}
      <div className="flex-shrink-0 pt-4 pb-2">
        <div className="flex flex-col items-center">
          <span className="mt-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Recent
          </span>

          <div className="mt-5 w-[80%] h-px bg-slate-700 rounded-full" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {notes.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No notes yet"
            description="Create your first note using the button above."
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