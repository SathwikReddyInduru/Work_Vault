import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Input';
import { TagInput } from '@/components/ui/TagInput';
import type { Note } from '@/types/note.types';
import { NOTE_CATEGORIES } from '@/utils/constants';
import { formatRelativeTime } from '@/utils/formatters';
import { noteSchema, type NoteFormValues } from '@/utils/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import { clsx } from 'clsx';
import { FileText, Pin, Plus, Trash2 } from 'lucide-react';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

interface NoteEditorProps {
  note: Note | null;
  isComposing: boolean;
  onSave: (values: NoteFormValues) => Promise<boolean> | void;
  onDelete: (note: Note) => void;
  onTogglePin: (id: number) => void;
  onNew: () => void;
  loading?: boolean;
}

const emptyDefaults: NoteFormValues = {
  title: '',
  content: '',
  category: 'General',
  tags: [],
  is_pinned: false,
};

const toDefaults = (note: Note | null): NoteFormValues =>
  note
    ? {
        title: note.title,
        content: note.content,
        category: note.category,
        tags: note.tags ?? [],
        is_pinned: note.is_pinned,
      }
    : emptyDefaults;

const categoryOptions = NOTE_CATEGORIES.map((c) => ({ value: c, label: c }));

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  isComposing,
  onSave,
  onDelete,
  onTogglePin,
  onNew,
  loading = false,
}) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: toDefaults(note),
  });

  useEffect(() => {
    reset(toDefaults(note));
  }, [note, isComposing, reset]);

  if (!note && !isComposing) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={FileText}
          title="Select a note"
          description="Choose a note from the list, or create a new one."
          action={
            <Button variant="primary" size="sm" icon={<Plus size={13} />} onClick={onNew}>
              New Note
            </Button>
          }
        />
      </div>
    );
  }

  const submit = (values: NoteFormValues) => {
    onSave(values);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="flex-shrink-0 flex items-center justify-between gap-3 px-5 py-3 border-b border-slate-800">
        <div className="flex items-center gap-2 min-w-0">
          {note && (
            <span className="text-xs text-slate-500 flex-shrink-0">
              Updated {formatRelativeTime(note.updated_at)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {note && (
            <>
              <button
                onClick={() => onTogglePin(note.id)}
                title={note.is_pinned ? 'Unpin note' : 'Pin note'}
                className={clsx(
                  'p-1.5 rounded-lg transition-colors',
                  note.is_pinned
                    ? 'text-amber-400 hover:bg-slate-800'
                    : 'text-slate-500 hover:text-amber-400 hover:bg-slate-800'
                )}
              >
                <Pin size={15} className={clsx(note.is_pinned && 'fill-amber-400')} />
              </button>
              <button
                onClick={() => onDelete(note)}
                title="Delete note"
                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit(submit)}
            loading={loading || isSubmitting}
            disabled={!isDirty && !isComposing}
          >
            Save
          </Button>
        </div>
      </div>

      {/* Title + meta */}
      <div className="flex-shrink-0 flex flex-col gap-3 px-5 py-4 border-b border-slate-800">
        <input
          {...register('title')}
          placeholder="Untitled"
          className="w-full bg-transparent text-xl font-semibold text-slate-100 placeholder-slate-600 outline-none"
        />
        <div className="flex items-center gap-3">
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Select
                options={categoryOptions}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                className="w-40"
              />
            )}
          />
          <Controller
            control={control}
            name="tags"
            render={({ field }) => (
              <TagInput
                value={field.value ?? []}
                onChange={field.onChange}
                placeholder="Add tag..."
                className="flex-1"
              />
            )}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <textarea
          {...register('content')}
          placeholder="Start typing..."
          className="w-full h-full min-h-[300px] bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none resize-none leading-relaxed"
        />
      </div>
    </div>
  );
};