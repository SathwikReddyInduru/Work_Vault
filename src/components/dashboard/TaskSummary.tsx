// src/components/dashboard/TaskSummary.tsx
import { TaskForm } from '@/components/tasks/TaskForm';
import { useTasksStore } from '@/store/tasks.store';
import { useTasks } from '@/hooks/useTasks';
import { formatDate, truncate } from '@/utils/formatters';
import type { TaskFormValues } from '@/utils/validators';
import { clsx } from 'clsx';
import { CheckCircle2, Circle, Clock, ExternalLink, ListTodo, Plus } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

const STATUS_NEXT: Record<string, string | null> = {
  todo: 'in_progress',
  in_progress: 'done',
  done: null,
};

export const TaskSummary: React.FC = () => {
  const navigate = useNavigate();
  const tasks             = useTasksStore((s) => s.tasks);
  const { create, updateStatus } = useTasks();
  const [formOpen, setFormOpen]   = useState(false);

  const pending    = tasks.filter((t) => t.status !== 'done');
  const todo       = tasks.filter((t) => t.status === 'todo').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const done       = tasks.filter((t) => t.status === 'done').length;
  const total      = tasks.length || 1;
  const pct        = Math.round((done / total) * 100);

  // Pick the single most-urgent pending task:
  // overdue first, then soonest due date, then any without a date
  const urgent = pending.slice().sort((a, b) => {
    const getTime = (d: string | null) =>
      d ? new Date(d.length === 10 ? `${d}T23:59:59` : d).getTime() : Infinity;
    return getTime(a.due_date) - getTime(b.due_date);
  })[0] ?? null;

  const handleCreate = async (values: TaskFormValues): Promise<boolean> => create(values);

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
        <div className="flex items-center gap-2">
          {pending.length > 0 && (
            <span className="text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/25 px-2 py-0.5 rounded-full">
              {pending.length} pending
            </span>
          )}
          <button
            onClick={() => setFormOpen(true)}
            className="flex items-center gap-1 text-[10px] font-medium text-slate-400 hover:text-slate-200 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 px-2 py-1 rounded-lg transition-colors"
          >
            <Plus size={11} /> Add Task
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left — counters + progress */}
        <div className="col-span-12 md:col-span-5 space-y-3">
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

        {/* Right — single most-urgent task */}
        <div className="col-span-12 md:col-span-6 flex flex-col justify-between">
          {urgent ? (() => {
            const s = statusMeta[urgent.status];
            const StatusIcon = s.icon;
            const dueDateStr = urgent.due_date && urgent.due_date.length === 10
              ? `${urgent.due_date}T23:59:59`
              : urgent.due_date;
            const isOverdue = dueDateStr && new Date(dueDateStr) < new Date();

            return (
              <>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-2">Up next</p>
                  <div className="bg-slate-900/50 border border-slate-700/40 rounded-xl p-3 group">
                    <div className="flex items-start gap-2.5">
                      {/* Status toggle */}
                      <button
                        onClick={() => { const next = STATUS_NEXT[urgent.status]; if (next) updateStatus(urgent.id, next as any); }}
                        title={STATUS_NEXT[urgent.status] ? `Move to ${STATUS_NEXT[urgent.status]!.replace('_', ' ')}` : 'Done'}
                        className="mt-0.5 flex-shrink-0 hover:scale-110 transition-transform"
                        disabled={!STATUS_NEXT[urgent.status]}
                      >
                        <StatusIcon size={14} className={s.color} />
                      </button>

                      {/* Task info — clicking navigates to /tasks */}
                      <button onClick={() => navigate('/tasks')} className="flex-1 min-w-0 text-left">
                        <p className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors truncate">
                          {truncate(urgent.name, 36)}
                        </p>
                        {urgent.description && (
                          <p className="text-[10px] text-slate-500 mt-0.5 truncate">{urgent.description}</p>
                        )}
                        {dueDateStr && (
                          <p className={clsx('text-[10px] mt-1 font-medium', isOverdue ? 'text-red-400' : 'text-amber-400')}>
                            {isOverdue ? '⚠ Overdue · ' : '🗓 Due '}{formatDate(dueDateStr)}
                          </p>
                        )}
                      </button>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className={clsx('w-1.5 h-1.5 rounded-full', priorityDot[urgent.priority])} title={urgent.priority} />
                        <ExternalLink size={10} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/tasks')}
                  className="mt-3 text-[11px] font-medium text-slate-500 hover:text-slate-300 rounded-lg py-1.5 transition-colors"
                >
                  View all tasks →
                </button>
              </>
            );
          })() : (
            <div className="flex flex-col items-center justify-center h-full py-4 gap-2">
              <p className="text-xs text-slate-600 text-center">
                {tasks.length === 0 ? 'No tasks yet.' : '🎉 All tasks complete!'}
              </p>
              {tasks.length === 0 && (
                <button
                  onClick={() => setFormOpen(true)}
                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
                >
                  <Plus size={10} /> Add your first task
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <TaskForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
};
