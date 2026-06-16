// src/components/tasks/TaskCard.tsx
import { Badge } from '@/components/ui/Badge';
import type { Task, TaskStatus } from '@/types/task.types';
import { formatDate } from '@/utils/formatters';
import { clsx } from 'clsx';
import { AlertCircle, Calendar, CheckCircle2, Clock, GripVertical, Pencil, Trash2 } from 'lucide-react';
import React from 'react';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
}

const STATUS_NEXT: Record<TaskStatus, TaskStatus | null> = {
  todo: 'in_progress',
  in_progress: 'done',
  done: null,
};

const STATUS_ICONS: Record<TaskStatus, React.ReactNode> = {
  todo: <Clock size={13} className="text-slate-400" />,
  in_progress: <AlertCircle size={13} className="text-blue-400" />,
  done: <CheckCircle2 size={13} className="text-emerald-400" />,
};

const PRIORITY_BADGE: Record<string, 'blue' | 'yellow' | 'red'> = {
  low: 'blue',
  medium: 'yellow',
  high: 'red',
};

function isDueSoon(due: string | null): boolean {
  if (!due) return false;
  const diff = new Date(due).getTime() - Date.now();
  return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000; // within 3 days
}

function isOverdue(due: string | null, status: TaskStatus): boolean {
  if (!due || status === 'done') return false;
  return new Date(due).getTime() < Date.now();
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onStatusChange }) => {
  const next = STATUS_NEXT[task.status];
  const overdue = isOverdue(task.due_date, task.status);
  const dueSoon = isDueSoon(task.due_date);

  return (
    <div
      className={clsx(
        'group bg-slate-800 border rounded-xl p-3.5 space-y-2.5 hover:border-slate-600 transition-all duration-150',
        task.status === 'done' ? 'border-slate-700/50 opacity-70' : 'border-slate-700'
      )}
    >
      {/* Header row */}
      <div className="flex items-start gap-2">
        <GripVertical
          size={14}
          className="mt-0.5 text-slate-600 flex-shrink-0 cursor-grab active:cursor-grabbing"
        />
        <p
          className={clsx(
            'flex-1 text-sm font-medium leading-snug',
            task.status === 'done' ? 'line-through text-slate-500' : 'text-slate-200'
          )}
        >
          {task.name}
        </p>
        {/* Actions — shown on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="p-1 text-slate-500 hover:text-slate-300 hover:bg-slate-700 rounded transition-colors"
            title="Edit"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={() => onDelete(task)}
            className="p-1 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded transition-colors"
            title="Delete"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 pl-5">
          {task.description}
        </p>
      )}

      {/* Footer row */}
      <div className="flex items-center justify-between pl-5 gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Priority badge */}
          <Badge variant={PRIORITY_BADGE[task.priority]} className="text-[10px] px-1.5 py-0.5 capitalize">
            {task.priority}
          </Badge>

          {/* Due date */}
          {task.due_date && (
            <span
              className={clsx(
                'flex items-center gap-1 text-[10px]',
                overdue ? 'text-red-400' : dueSoon ? 'text-yellow-400' : 'text-slate-500'
              )}
            >
              <Calendar size={10} />
              {formatDate(task.due_date)}
            </span>
          )}
        </div>

        {/* Advance status button */}
        {next && (
          <button
            onClick={() => onStatusChange(task, next)}
            className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 px-1.5 py-0.5 rounded hover:bg-slate-700 transition-colors"
            title={`Move to ${next.replace('_', ' ')}`}
          >
            {STATUS_ICONS[task.status]}
            <span className="capitalize">{next.replace('_', ' ')} →</span>
          </button>
        )}
        {task.status === 'done' && (
          <span className="flex items-center gap-1 text-[10px] text-emerald-500">
            {STATUS_ICONS.done}
            Done
          </span>
        )}
      </div>
    </div>
  );
};