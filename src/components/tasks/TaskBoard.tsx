// src/components/tasks/TaskBoard.tsx
import type { Task, TaskStatus } from '@/types/task.types';
import { clsx } from 'clsx';
import { AlertCircle, CheckCircle2, Clock, Loader2, Plus } from 'lucide-react';
import React from 'react';
import { TaskCard } from './TaskCard';

interface TaskBoardProps {
  tasks: Task[];
  loading: boolean;
  onAdd: (defaultStatus: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
}

interface Column {
  status: TaskStatus;
  label: string;
  icon: React.ReactNode;
  headerClass: string;
  countClass: string;
}

const COLUMNS: Column[] = [
  {
    status: 'todo',
    label: 'To Do',
    icon: <Clock size={14} className="text-slate-400" />,
    headerClass: 'border-slate-700',
    countClass: 'bg-slate-700 text-slate-400',
  },
  {
    status: 'in_progress',
    label: 'In Progress',
    icon: <AlertCircle size={14} className="text-blue-400" />,
    headerClass: 'border-blue-500/30',
    countClass: 'bg-blue-500/20 text-blue-400',
  },
  {
    status: 'done',
    label: 'Done',
    icon: <CheckCircle2 size={14} className="text-emerald-400" />,
    headerClass: 'border-emerald-500/30',
    countClass: 'bg-emerald-500/20 text-emerald-400',
  },
];

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  loading,
  onAdd,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.status);

        return (
          <div key={col.status} className="flex flex-col min-h-0">
            {/* Column header */}
            <div
              className={clsx(
                'flex items-center justify-between px-3 py-2.5 mb-3 bg-slate-800/60 rounded-xl border',
                col.headerClass
              )}
            >
              <div className="flex items-center gap-2">
                {col.icon}
                <span className="text-sm font-semibold text-slate-200">{col.label}</span>
                <span className={clsx('text-[10px] font-medium px-1.5 py-0.5 rounded-full', col.countClass)}>
                  {colTasks.length}
                </span>
              </div>
              <button
                onClick={() => onAdd(col.status)}
                className="p-1 text-slate-500 hover:text-slate-300 hover:bg-slate-700 rounded transition-colors"
                title={`Add to ${col.label}`}
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Cards */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 pb-2">
              {colTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <p className="text-xs text-slate-600">No tasks here</p>
                  <button
                    onClick={() => onAdd(col.status)}
                    className="mt-2 text-xs text-slate-500 hover:text-slate-400 underline underline-offset-2 transition-colors"
                  >
                    Add one
                  </button>
                </div>
              ) : (
                colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};