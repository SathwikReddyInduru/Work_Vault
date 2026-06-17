import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { TagInput } from '@/components/ui/TagInput';
import type { Website } from '@/types/website.types';
import { websiteSchema, type WebsiteFormValues } from '@/utils/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import { clsx } from 'clsx';
import { Eye, EyeOff, Star, Wand2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

interface WebsiteFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: WebsiteFormValues) => Promise<boolean> | void;
  website?: Website | null;
  loading?: boolean;
}

const emptyDefaults: WebsiteFormValues = {
  name: '',
  url: '',
  username: '',
  network_name: '',
  password: '',
  notes: '',
  tags: [],
  is_favorite: false,
};

const toDefaults = (website?: Website | null): WebsiteFormValues =>
  website
    ? {
        name: website.name,
        url: website.url,
        username: website.username ?? '',
        network_name: website.network_name ?? '',
        password: website.password ?? '',
        notes: website.notes ?? '',
        tags: website.tags ?? [],
        is_favorite: website.is_favorite,
      }
    : emptyDefaults;

const generateFallbackPassword = (length = 16): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*';
  let out = '';
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
};

export const WebsiteForm: React.FC<WebsiteFormProps> = ({
  open,
  onClose,
  onSubmit,
  website,
  loading = false,
}) => {
  const isEdit = Boolean(website?.id);
  const [showPassword, setShowPassword] = useState(false);
  const [generating, setGenerating] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<WebsiteFormValues>({
    resolver: zodResolver(websiteSchema),
    defaultValues: toDefaults(website),
  });

  useEffect(() => {
    if (open) {
      reset(toDefaults(website));
      setShowPassword(false);
    }
  }, [open, website, reset]);

  const handleGeneratePassword = async () => {
    setGenerating(true);
    try {
      if (window.electronAPI) {
        const res = await window.electronAPI.generatePassword({
          length: 16,
          uppercase: true,
          lowercase: true,
          numbers: true,
          symbols: true,
        });
        if (res.success && res.data) {
          setValue('password', res.data, { shouldDirty: true });
          setShowPassword(true);
          return;
        }
      }
      setValue('password', generateFallbackPassword(), { shouldDirty: true });
      setShowPassword(true);
    } finally {
      setGenerating(false);
    }
  };

  const submit = async (values: WebsiteFormValues) => {
    const ok = await onSubmit(values);
    if (ok !== false) onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Website' : 'Add Website'}
      size="lg"
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
            {isEdit ? 'Save Changes' : 'Add Website'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Name"
            placeholder="e.g. GitHub"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="URL"
            placeholder="https://example.com"
            error={errors.url?.message}
            {...register('url')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Username"
            placeholder="Optional"
            error={errors.username?.message}
            {...register('username')}
          />
          <Input
            label="Network Name"
            placeholder="Optional"
            error={errors.network_name?.message}
            {...register('network_name')}
          />
        </div>

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Optional"
          error={errors.password?.message}
          {...register('password')}
          rightElement={
            <span className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleGeneratePassword}
                disabled={generating}
                title="Generate password"
                className="p-1 text-slate-500 hover:text-blue-400 transition-colors disabled:opacity-50"
              >
                <Wand2 size={14} />
              </button>
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                title={showPassword ? 'Hide password' : 'Show password'}
                className="p-1 text-slate-500 hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </span>
          }
        />

        <Controller
          control={control}
          name="tags"
          render={({ field }) => (
            <TagInput
              label="Tags"
              value={field.value ?? []}
              onChange={field.onChange}
              placeholder="Add tag..."
            />
          )}
        />

        <Textarea
          label="Notes"
          placeholder="Optional notes..."
          error={errors.notes?.message}
          {...register('notes')}
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