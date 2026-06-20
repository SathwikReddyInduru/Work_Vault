import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import type { Application } from '@/types/application.types';
import { APP_ENVIRONMENTS } from '@/utils/constants';
import { applicationSchema, type ApplicationFormValues } from '@/utils/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import { clsx } from 'clsx';
import { Eye, EyeOff, Star, Wand2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

interface AppFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ApplicationFormValues) => Promise<boolean> | void;
  application?: Application | null;
  loading?: boolean;
}

const emptyDefaults: ApplicationFormValues = {
  name: '',
  url: '',
  username: '',
  password: '',
  network_name: '',
  environment: 'production',
  notes: '',
  is_favorite: false,
};

const toDefaults = (application?: Application | null): ApplicationFormValues =>
  application
    ? {
        name: application.name,
        url: application.url ?? '',
        username: application.username ?? '',
        password: application.password ?? '',
        network_name: application.network_name ?? '',
        environment: application.environment,
        notes: application.notes ?? '',
        is_favorite: application.is_favorite,
      }
    : emptyDefaults;

const generateFallbackPassword = (length = 16): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*';
  let out = '';
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
};

export const AppForm: React.FC<AppFormProps> = ({
  open,
  onClose,
  onSubmit,
  application,
  loading = false,
}) => {
  const isEdit = Boolean(application?.id);
  const [showPassword, setShowPassword] = useState(false);
  const [generating, setGenerating] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: toDefaults(application),
  });

  useEffect(() => {
    if (open) {
      reset(toDefaults(application));
      setShowPassword(false);
    }
  }, [open, application, reset]);

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

  const submit = async (values: ApplicationFormValues) => {
    const ok = await onSubmit(values);
    if (ok !== false) onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Application' : 'Add Application'}
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
            {isEdit ? 'Save Changes' : 'Add Application'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Name"
            placeholder="e.g. Internal Admin Panel"
            error={errors.name?.message}
            {...register('name')}
          />
          <Controller
            control={control}
            name="environment"
            render={({ field }) => (
              <Select
                label="Environment"
                options={APP_ENVIRONMENTS.map((e) => ({ value: e.value, label: e.label }))}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
              />
            )}
          />
        </div>

        <Input
          label="URL"
          placeholder="https://example.com (optional)"
          error={errors.url?.message}
          {...register('url')}
        />

        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Network Name"
            placeholder="Optional"
            error={errors.network_name?.message}
            {...register('network_name')}
          />
          <Input
            label="Username"
            placeholder="Optional"
            error={errors.username?.message}
            {...register('username')}
          />
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
        </div>

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