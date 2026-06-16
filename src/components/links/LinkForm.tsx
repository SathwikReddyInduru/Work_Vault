import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import type { QuickLink } from '@/types/link.types';
import { LINK_CATEGORIES } from '@/utils/constants';
import { linkSchema, type LinkFormValues } from '@/utils/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import { clsx } from 'clsx';
import { Star } from 'lucide-react';
import React, { useEffect } from 'react';
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
  is_favorite: false,
};

const toDefaults = (link?: QuickLink | null): LinkFormValues =>
  link
    ? {
        title: link.title,
        url: link.url,
        category: link.category,
        description: link.description ?? '',
        is_favorite: link.is_favorite,
      }
    : emptyDefaults;

const categoryOptions = LINK_CATEGORIES.map((c) => ({ value: c, label: c }));

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
    formState: { errors, isSubmitting },
  } = useForm<LinkFormValues>({
    resolver: zodResolver(linkSchema),
    defaultValues: toDefaults(link),
  });

  useEffect(() => {
    if (open) reset(toDefaults(link));
  }, [open, link, reset]);

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