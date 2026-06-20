// src/components/dbconnections/DbConnectionForm.tsx

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Star } from 'lucide-react';
import { clsx } from 'clsx';
import { dbConnectionSchema, type DbConnectionFormValues } from '@/utils/validators';
import type { DbConnection, DbConnectionType } from '@/types/dbconnection.types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface DbConnectionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: DbConnectionFormValues) => Promise<boolean>;
  initial?: DbConnection | null;
}

const TYPES: { value: DbConnectionType; label: string; desc: string }[] = [
  { value: 'direct', label: 'Direct', desc: 'Host / Port / Service Name' },
  { value: 'tns',    label: 'TNS',    desc: 'TNS alias from tnsnames.ora' },
  { value: 'ldap',   label: 'LDAP',   desc: 'LDAP directory lookup' },
];

const labelCls = 'block text-xs font-medium text-slate-400 mb-1.5';
const selectCls = 'w-full bg-slate-700/60 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-colors';

export const DbConnectionForm: React.FC<DbConnectionFormProps> = ({
  open, onClose, onSubmit, initial,
}) => {
  const isEdit = !!initial;
  const [showPwd, setShowPwd] = useState(false);

  const {
    register, handleSubmit, reset, watch, setValue,
    formState: { errors, isSubmitting },
  } = useForm<DbConnectionFormValues>({
    resolver: zodResolver(dbConnectionSchema),
    defaultValues: {
      name: initial?.name ?? '',
      type: (initial?.type as DbConnectionType) ?? 'direct',
      user_schema: initial?.user_schema ?? '',
      password: initial?.password ?? '',
      host: initial?.host ?? '192.168.',
      port: initial?.port ?? 1521,
      service_name: initial?.service_name ?? '',
      tns_alias: initial?.tns_alias ?? '',
      notes: initial?.notes ?? '',
      is_favorite: !!initial?.is_favorite,
    },
  });

  const connType = watch('type');
  const isFav = watch('is_favorite');

  useEffect(() => {
    reset({
      name: initial?.name ?? '',
      type: (initial?.type as DbConnectionType) ?? 'direct',
      user_schema: initial?.user_schema ?? '',
      password: initial?.password ?? '',
      host: initial?.host ?? '192.168.',
      port: initial?.port ?? 1521,
      service_name: initial?.service_name ?? '',
      tns_alias: initial?.tns_alias ?? '',
      notes: initial?.notes ?? '',
      is_favorite: !!initial?.is_favorite,
    });
  }, [initial, reset]);

  const submit = async (values: DbConnectionFormValues) => {
    const ok = await onSubmit(values);
    if (ok) { reset(); onClose(); }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit DB Connection' : 'New DB Connection'}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" form="dbconn-form" loading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Save Connection'}
          </Button>
        </>
      }
    >
      <form id="dbconn-form" onSubmit={handleSubmit(submit)} className="space-y-4">
        {/* Name + Favorite */}
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className={labelCls}>Connection name <span className="text-red-400">*</span></label>
            <Input {...register('name')} placeholder="e.g. Production Oracle" error={errors.name?.message} autoFocus />
          </div>
          <button
            type="button"
            onClick={() => setValue('is_favorite', !isFav, { shouldDirty: true })}
            className={clsx(
              'mb-0.5 p-2.5 rounded-xl border transition-colors',
              isFav
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                : 'bg-slate-700/60 border-slate-600 text-slate-500 hover:text-slate-300'
            )}
            title="Mark as favorite"
          >
            <Star size={15} className={isFav ? 'fill-amber-400' : ''} />
          </button>
        </div>

        {/* Connection type tabs */}
        <div>
          <label className={labelCls}>Connection type</label>
          <div className="flex gap-1.5">
            {TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setValue('type', t.value, { shouldDirty: true })}
                className={clsx(
                  'flex-1 py-2 px-3 rounded-xl border text-xs font-medium transition-all text-center',
                  connType === t.value
                    ? 'bg-violet-600/20 border-violet-500/40 text-violet-300'
                    : 'bg-slate-700/40 border-slate-600 text-slate-500 hover:text-slate-300 hover:border-slate-500'
                )}
              >
                <p>{t.label}</p>
                <p className="text-[9px] font-normal opacity-70 mt-0.5">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* User / Schema + Password */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>User / Schema <span className="text-red-400">*</span></label>
            <Input {...register('user_schema')} placeholder="e.g. IZZI_QC" error={errors.user_schema?.message} />
          </div>
          <div>
            <label className={labelCls}>Password</label>
            <div className="relative">
              <Input
                {...register('password')}
                type={showPwd ? 'text' : 'password'}
                placeholder="••••••••"
                className="pr-9"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* Direct / LDAP fields */}
        {connType !== 'tns' && (
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className={labelCls}>Host</label>
              <Input {...register('host')} placeholder="e.g. 192.168.1.1" error={errors.host?.message} />
            </div>
            <div>
              <label className={labelCls}>Port</label>
              <Input
                {...register('port', { valueAsNumber: true })}
                type="number"
                placeholder="1521"
                error={errors.port?.message}
              />
            </div>
          </div>
        )}

        {/* Service name (direct/ldap) or TNS alias */}
        {connType === 'tns' ? (
          <div>
            <label className={labelCls}>TNS Alias</label>
            <Input {...register('tns_alias')} placeholder="e.g. ATTTEST" error={errors.tns_alias?.message} />
          </div>
        ) : (
          <div>
            <label className={labelCls}>Service Name</label>
            <Input {...register('service_name')} placeholder="e.g. ATTTEST" error={errors.service_name?.message} />
          </div>
        )}

        {/* Notes */}
        <div>
          <label className={labelCls}>Notes</label>
          <textarea
            {...register('notes')}
            rows={2}
            placeholder="Optional notes about this connection…"
            className="w-full bg-slate-700/60 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-colors resize-none placeholder:text-slate-500"
          />
        </div>
      </form>
    </Modal>
  );
};