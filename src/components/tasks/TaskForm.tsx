// src/components/tasks/TaskForm.tsx
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import type { Task, TaskStatus } from '@/types/task.types';
import { TASK_PRIORITIES, TASK_STATUSES } from '@/utils/constants';
import { taskSchema, type TaskFormValues } from '@/utils/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => Promise<boolean>;
  initial?: Task | null;
  defaultStatus?: TaskStatus;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  open,
  onClose,
  onSubmit,
  initial,
  defaultStatus = 'todo',
}) => {
  const isEdit = !!initial;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      name: initial?.name ?? '',
      description: initial?.description ?? '',
      priority: initial?.priority ?? 'medium',
      due_date: initial?.due_date?.slice(0, 10) ?? '',
      status: initial?.status ?? defaultStatus,
    },
  });

  // Sync form values when initial changes
  React.useEffect(() => {
    reset({
      name: initial?.name ?? '',
      description: initial?.description ?? '',
      priority: initial?.priority ?? 'medium',
      due_date: initial?.due_date?.slice(0, 10) ?? '',
      status: initial?.status ?? defaultStatus,
    });
  }, [initial, defaultStatus, reset]);

  const submit = async (values: TaskFormValues) => {
    const ok = await onSubmit(values);
    if (ok) { reset(); onClose(); }
  };

  const labelClass = 'block text-xs font-medium text-slate-400 mb-1.5';
  const selectClass =
    'w-full bg-slate-700/60 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-colors';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Task' : 'New Task'}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" form="task-form" loading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Create Task'}
          </Button>
        </>
      }
    >
      <form id="task-form" onSubmit={handleSubmit(submit)} className="space-y-4">
        {/* Name */}
        <div>
          <label className={labelClass}>Task name <span className="text-red-400">*</span></label>
          <Input
            {...register('name')}
            placeholder="e.g. Review pull request"
            error={errors.name?.message}
            autoFocus
          />
        </div>

        {/* Description */}
        <div>
          <label className={labelClass}>Description</label>
          <textarea
            {...register('description')}
            rows={3}
            placeholder="Optional details about this task…"
            className="w-full bg-slate-700/60 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-colors resize-none placeholder:text-slate-500"
          />
        </div>

        {/* Priority + Status row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Priority</label>
            <select {...register('priority')} className={selectClass}>
              {TASK_PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select {...register('status')} className={selectClass}>
              {TASK_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Due date */}
        <div>
          <label className={labelClass}>Due date</label>
          <input
            type="date"
            {...register('due_date')}
            className={selectClass}
          />
          {errors.due_date && (
            <p className="mt-1 text-xs text-red-400">{errors.due_date.message}</p>
          )}
        </div>
      </form>
    </Modal>
  );
};