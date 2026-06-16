import { Badge } from '@/components/ui/Badge';
import type { Note } from '@/types/note.types';
import { formatRelativeTime, truncate } from '@/utils/formatters';
import { clsx } from 'clsx';
import { FileText, Pin } from 'lucide-react';
import React from 'react';

interface NoteCardProps {
  note: Note;
  active: boolean;
  onClick: () => void;
  onTogglePin: (id: number) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  active,
  onClick,
  onTogglePin,
}) => (
  <div
    onClick={onClick}
    className={clsx(
      'group flex flex-col gap-1.5 px-3 py-2.5 rounded-lg cursor-pointer border transition-all duration-150',
      active
        ? 'bg-blue-600/15 border-blue-500/30'
        : 'bg-transparent border-transparent hover:bg-slate-800/60'
    )}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-start gap-2 min-w-0">
        <FileText size={13} className="flex-shrink-0 mt-0.5 text-slate-500" />
        <h4 className={clsx('text-sm font-medium truncate', active ? 'text-slate-100' : 'text-slate-300')}>
          {note.title || 'Untitled'}
        </h4>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onTogglePin(note.id);
        }}
        className={clsx(
          'flex-shrink-0 transition-colors',
          note.is_pinned ? 'text-amber-400' : 'text-slate-600 opacity-0 group-hover:opacity-100 hover:text-amber-400'
        )}
      >
        <Pin size={12} className={clsx(note.is_pinned && 'fill-amber-400')} />
      </button>
    </div>

    {note.content && (
      <p className="text-xs text-slate-500 line-clamp-2 pl-[21px]">
        {truncate(note.content.replace(/\s+/g, ' '), 100)}
      </p>
    )}

    <div className="flex items-center justify-between gap-2 pl-[21px]">
      <Badge variant="purple" className="text-[10px]">{note.category}</Badge>
      <span className="text-[10px] text-slate-600 flex-shrink-0">{formatRelativeTime(note.updated_at)}</span>
    </div>
  </div>
);