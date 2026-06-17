import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Input';
import type { Note } from '@/types/note.types';
import { NOTE_CATEGORIES } from '@/utils/constants';
import { noteSchema, type NoteFormValues } from '@/utils/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import { clsx } from 'clsx';
import { FileText, Pin, Plus, Trash2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
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
      <div className="flex-shrink-0 px-4 py-3 border-b border-slate-800">
        <div className="flex items-center justify-between gap-4 h-10 px-4 rounded-full border border-slate-700 bg-slate-800">

          <div className="flex items-center gap-2 flex-1 min-w-0">

            <input
              {...register('title')}
              placeholder="Untitled"
              className="w-32 flex-shrink-0 bg-transparent text-xs font-semibold text-slate-100 placeholder-slate-500 outline-none border-r border-slate-700 pr-3"
            />

            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <select
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="flex-shrink-0 bg-transparent text-xs text-slate-300 outline-none border-r border-slate-700 pr-3 cursor-pointer"
                >
                  {categoryOptions.map((o) => (
                    <option
                      key={o.value}
                      value={o.value}
                      className="bg-slate-800"
                    >
                      {o.label}
                    </option>
                  ))}
                </select>
              )}
            />

            <Controller
              control={control}
              name="tags"
              render={({ field }) => (
                <InlineTagInput
                  value={field.value ?? []}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {note && (
              <>
                <button
                  onClick={() => onTogglePin(note.id)}
                  title={note.is_pinned ? 'Unpin note' : 'Pin note'}
                  className={clsx(
                    'p-1.5 rounded-lg transition-colors',
                    note.is_pinned
                      ? 'text-amber-400'
                      : 'text-slate-500 hover:text-amber-400'
                  )}
                >
                  <Pin
                    size={15}
                    className={clsx(note.is_pinned && 'fill-amber-400')}
                  />
                </button>

                <button
                  onClick={() => onDelete(note)}
                  title="Delete note"
                  className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg transition-colors"
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

/* Compact single-line tag input for toolbar use */
const InlineTagInput: React.FC<{ value: string[]; onChange: (tags: string[]) => void }> = ({
  value,
  onChange,
}) => {
  const [input, setInput] = useState('');

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !value.includes(trimmed)) onChange([...value, trimmed]);
    setInput('');
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['Enter', ',', ' '].includes(e.key)) {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="flex items-center gap-1 min-w-0 overflow-hidden">
      {value.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] rounded-full border border-blue-500/30 flex-shrink-0"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((t) => t !== tag))}
            className="hover:text-white"
          >
            <X size={9} />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        onBlur={() => input && addTag(input)}
        placeholder={value.length === 0 ? 'Add tag...' : ''}
        className="min-w-[60px] w-24 bg-transparent text-xs text-slate-100 placeholder-slate-500 outline-none"
      />
    </div>
  );
};