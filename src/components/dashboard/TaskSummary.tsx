// src/components/dashboard/TaskSummary.tsx
import type { Task } from '@/types/task.types';
import { formatDate, truncate } from '@/utils/formatters';
import { clsx } from 'clsx';
import { CheckCircle2, Circle, Clock, ListTodo } from 'lucide-react';
import React from 'react';

interface TaskSummaryProps { tasks: Task[]; pendingCount: number; }

const priorityDot: Record<string, string> = {
  high:   'bg-red-500',
  medium: 'bg-amber-500',
  low:    'bg-emerald-500',
};

const statusMeta = {
  todo:        { icon: Circle,       color: 'text-slate-500' },
  in_progress: { icon: Clock,        color: 'text-blue-400'  },
  done:        { icon: CheckCircle2, color: 'text-emerald-400' },
};

export const TaskSummary: React.FC<TaskSummaryProps> = ({ tasks, pendingCount }) => {
  const pending     = tasks.filter((t) => t.status !== 'done').slice(0, 5);
  const todo        = tasks.filter((t) => t.status === 'todo').length;
  const inProgress  = tasks.filter((t) => t.status === 'in_progress').length;
  const done        = tasks.filter((t) => t.status === 'done').length;
  const total       = tasks.length || 1;
  const pct         = Math.round((done / total) * 100);

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-800/50 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-700/60 flex items-center justify-center">
            <ListTodo size={13} className="text-slate-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">Task Overview</h3>
        </div>
        {pendingCount > 0 && (
          <span className="text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/25 px-2 py-0.5 rounded-full">
            {pendingCount} pending
          </span>
        )}
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left — progress + counters */}
        <div className="col-span-12 md:col-span-5 space-y-3">
          {/* Counters row */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'To Do',       value: todo,       dot: 'bg-slate-500' },
              { label: 'In Progress', value: inProgress, dot: 'bg-blue-500'  },
              { label: 'Done',        value: done,       dot: 'bg-emerald-500' },
            ].map(({ label, value, dot }) => (
              <div key={label} className="bg-slate-900/50 border border-slate-700/40 rounded-xl px-3 py-2.5 text-center">
                <p className="text-lg font-bold text-slate-100 tabular-nums">{value}</p>
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <span className={clsx('w-1.5 h-1.5 rounded-full', dot)} />
                  <p className="text-[10px] text-slate-500">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          {tasks.length > 0 && (
            <div>
              <div className="flex justify-between text-[10px] text-slate-500 mb-1.5">
                <span>Completion</span>
                <span className="font-semibold text-slate-300">{pct}%</span>
              </div>
              <div className="h-2 bg-slate-700/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="hidden md:flex col-span-1 items-stretch justify-center">
          <div className="w-px bg-slate-700/50 my-1" />
        </div>

        {/* Right — pending task list */}
        <div className="col-span-12 md:col-span-6">
          {pending.length === 0 ? (
            <div className="flex items-center justify-center h-full py-4">
              <p className="text-xs text-slate-600 text-center">
                {tasks.length === 0 ? 'No tasks yet — add some to track your work.' : '🎉 All tasks complete!'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {pending.map((task) => {
                const s = statusMeta[task.status];
                const StatusIcon = s.icon;
                const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';
                return (
                  <div key={task.id} className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-slate-700/30 transition-colors">
                    <StatusIcon size={13} className={s.color} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-200 truncate">{truncate(task.name, 34)}</p>
                      {task.due_date && (
                        <p className={clsx('text-[10px]', isOverdue ? 'text-red-400' : 'text-slate-500')}>
                          {isOverdue ? '⚠ Overdue · ' : ''}{formatDate(task.due_date)}
                        </p>
                      )}
                    </div>
                    <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', priorityDot[task.priority])} title={task.priority} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};