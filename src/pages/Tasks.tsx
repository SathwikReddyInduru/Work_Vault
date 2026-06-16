// src/pages/Tasks.tsx
import { PageWrapper } from '@/components/layout/PageWrapper';
import { TaskBoard } from '@/components/tasks/TaskBoard';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTasks } from '@/hooks/useTasks';
import type { Task, TaskStatus } from '@/types/task.types';
import type { TaskFormValues } from '@/utils/validators';
import { CheckSquare, Plus, Search } from 'lucide-react';
import React, { useMemo, useState } from 'react';

const Tasks: React.FC = () => {
  const { tasks, loading, create, update, remove, updateStatus } = useTasks();

  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('todo');
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filter tasks by search query
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.description ?? '').toLowerCase().includes(q)
    );
  }, [tasks, search]);

  const openAdd = (status: TaskStatus = 'todo') => {
    setEditTarget(null);
    setDefaultStatus(status);
    setFormOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditTarget(task);
    setDefaultStatus(task.status);
    setFormOpen(true);
  };

  const handleSubmit = async (values: TaskFormValues): Promise<boolean> => {
    if (editTarget) {
      return update({ id: editTarget.id, ...values });
    }
    return create(values);
  };

  const handleStatusChange = async (task: Task, status: TaskStatus) => {
    await updateStatus(task.id, status);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await remove(deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
  };

  return (
    <PageWrapper>
      {/* Page header */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-800/80 mb-5">
        <div>
          <h1 className="text-lg font-bold text-slate-100">Tasks</h1>
          <p className="text-xs text-slate-500 mt-0.5">{tasks.length} task{tasks.length !== 1 ? 's' : ''} total</p>
        </div>
        <Button icon={<Plus size={15} />} size="sm" onClick={() => openAdd('todo')}>
          Add Task
        </Button>
      </div>

      {/* Search */}
      {tasks.length > 0 && (
        <div className="relative mb-5">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks…"
            className="w-full max-w-sm bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 placeholder:text-slate-500 transition-colors"
          />
        </div>
      )}

      {/* Empty state — no tasks at all */}
      {!loading && tasks.length === 0 && (
        <EmptyState
          icon={CheckSquare}
          title="No tasks yet"
          description="Create your first task to start tracking your work."
          action={
            <Button icon={<Plus size={15} />} size="sm" onClick={() => openAdd('todo')}>
              Add Task
            </Button>
          }
        />
      )}

      {/* Empty search result */}
      {!loading && tasks.length > 0 && filtered.length === 0 && search && (
        <EmptyState
          icon={CheckSquare}
          title="No matching tasks"
          description={`No tasks match "${search}".`}
        />
      )}

      {/* Board */}
      {(loading || filtered.length > 0 || (!search && tasks.length > 0)) && (
        <div className="flex-1 min-h-0">
          <TaskBoard
            tasks={filtered}
            loading={loading}
            onAdd={openAdd}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
            onStatusChange={handleStatusChange}
          />
        </div>
      )}

      {/* Form modal */}
      <TaskForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditTarget(null); }}
        onSubmit={handleSubmit}
        initial={editTarget}
        defaultStatus={defaultStatus}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete task?"
        message={`"${deleteTarget?.name}" will be permanently deleted.`}
      />
    </PageWrapper>
  );
};

export default Tasks;