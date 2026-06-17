// src/components/links/LinkForm.tsx
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import type { QuickLink } from '@/types/link.types';
import { LINK_CATEGORIES } from '@/utils/constants';
import { linkSchema, type LinkFormValues } from '@/utils/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import { clsx } from 'clsx';
import { Star, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

interface LinkFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: LinkFormValues) => Promise<boolean> | void;
  link?: QuickLink | null;
  loading?: boolean;
}

const emptyDefaults: LinkFormValues = {
  title: '',
  url: '',
  category: 'General',
  description: '',
  icon: '',
  is_favorite: false,
};

const toDefaults = (link?: QuickLink | null): LinkFormValues =>
  link
    ? {
        title: link.title,
        url: link.url,
        category: link.category,
        description: link.description ?? '',
        icon: link.icon ?? '',
        is_favorite: link.is_favorite,
      }
    : emptyDefaults;

const categoryOptions = LINK_CATEGORIES.map((c) => ({ value: c, label: c }));

// Quick emoji suggestions for links
const EMOJI_SUGGESTIONS = ['🔗', '🌐', '📖', '🛠️', '📊', '🚀', '⚙️', '📁', '🔑', '💡', '📝', '🏠', '🎯', '🔍', '📡'];

export const LinkForm: React.FC<LinkFormProps> = ({
  open,
  onClose,
  onSubmit,
  link,
  loading = false,
}) => {
  const isEdit = Boolean(link?.id);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LinkFormValues>({
    resolver: zodResolver(linkSchema),
    defaultValues: toDefaults(link),
  });

  const iconValue = watch('icon');
  const [pickerOpen, setPickerOpen] = useState(false);
  const iconFieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) reset(toDefaults(link));
    setPickerOpen(false);
  }, [open, link, reset]);

  // Close the emoji picker on outside click or Escape
  useEffect(() => {
    if (!pickerOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (iconFieldRef.current && !iconFieldRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPickerOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [pickerOpen]);

  const submit = async (values: LinkFormValues) => {
    const ok = await onSubmit(values);
    if (ok !== false) onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Quick Link' : 'Add Quick Link'}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit(submit)}
            loading={loading || isSubmitting}
          >
            {isEdit ? 'Save Changes' : 'Add Link'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
        <Input
          label="Title"
          placeholder="e.g. Team Wiki"
          error={errors.title?.message}
          {...register('title')}
        />

        <Input
          label="URL"
          placeholder="https://example.com"
          error={errors.url?.message}
          {...register('url')}
        />

        {/* Icon / Emoji field */}
        <div className="flex flex-col gap-1.5" ref={iconFieldRef}>
          <label className="text-xs font-medium text-slate-400">
            Icon <span className="text-slate-600 font-normal">(emoji or leave blank)</span>
          </label>
          <div className="flex items-center gap-2">
            {/* Preview — click to open emoji picker */}
            <button
              type="button"
              onClick={() => setPickerOpen((o) => !o)}
              aria-expanded={pickerOpen}
              title="Choose an emoji"
              className={clsx(
                'w-9 h-9 rounded-lg border flex items-center justify-center text-lg flex-shrink-0 transition-colors',
                pickerOpen
                  ? 'bg-slate-700 border-blue-500/60 ring-1 ring-blue-500/30'
                  : 'bg-slate-700/60 border-slate-600/50 hover:bg-slate-700'
              )}
            >
              {iconValue?.trim() || <span className="text-slate-600 text-xs">?</span>}
            </button>
            <input
              {...register('icon')}
              placeholder="Paste emoji, e.g. 🚀"
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20"
            />
          </div>
          {errors.icon?.message && (
            <p className="text-xs text-red-400">{errors.icon.message}</p>
          )}

          {/* Emoji picker panel — opens below when the preview box is clicked */}
          {pickerOpen && (
            <div className="rounded-lg border border-slate-700 bg-slate-800/80 p-2.5 flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => {
                  setValue('icon', '', { shouldDirty: true });
                  setPickerOpen(false);
                }}
                title="No icon"
                className="w-7 h-7 rounded-md flex items-center justify-center transition-colors hover:bg-slate-700 bg-slate-800 text-slate-500"
              >
                <X size={13} />
              </button>
              {EMOJI_SUGGESTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setValue('icon', emoji, { shouldDirty: true });
                    setPickerOpen(false);
                  }}
                  className={clsx(
                    'w-7 h-7 rounded-md text-base flex items-center justify-center transition-colors hover:bg-slate-700',
                    iconValue === emoji ? 'bg-slate-700 ring-1 ring-blue-500/50' : 'bg-slate-800'
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <Select
              label="Category"
              options={categoryOptions}
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
            />
          )}
        />

        <Textarea
          label="Description"
          placeholder="Optional description..."
          error={errors.description?.message}
          {...register('description')}
        />

        <Controller
          control={control}
          name="is_favorite"
          render={({ field }) => (
            <button
              type="button"
              onClick={() => field.onChange(!field.value)}
              className={clsx(
                'flex items-center gap-2 self-start px-3 py-2 rounded-lg border text-sm font-medium transition-colors',
                field.value
                  ? 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
              )}
            >
              <Star size={14} className={clsx(field.value && 'fill-yellow-400')} />
              Mark as favorite
            </button>
          )}
        />
      </form>
    </Modal>
  );
};