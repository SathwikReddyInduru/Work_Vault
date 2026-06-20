// src/pages/Tasks.tsx
import { PageWrapper } from '@/components/layout/PageWrapper';
import { TaskBoard } from '@/components/tasks/TaskBoard';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { SearchBar } from '@/components/ui/SearchBar';
import { useTasks } from '@/hooks/useTasks';
import type { Task, TaskStatus } from '@/types/task.types';
import type { TaskFormValues } from '@/utils/validators';
import { clsx } from 'clsx';
import { CheckSquare, Plus, Search, SlidersHorizontal } from 'lucide-react';
import React, { useMemo, useState } from 'react';

// ── Date filter ───────────────────────────────────────────────────────────────

type DateFilter = 'all' | 'today' | 'week' | 'overdue';

const DATE_FILTERS: { value: DateFilter; label: string; desc: string }[] = [
  { value: 'all',     label: 'All tasks',   desc: 'Show everything regardless of due date' },
  { value: 'today',   label: 'Due today',   desc: 'Tasks due before end of today' },
  { value: 'week',    label: 'This week',   desc: 'Tasks due within the next 7 days' },
  { value: 'overdue', label: 'Overdue',     desc: 'Past-due tasks that aren\'t done' },
];

function parseDue(due_date: string): number {
  const s = due_date.length === 10 ? `${due_date}T23:59:59` : due_date;
  return new Date(s).getTime();
}

function applyDateFilter(tasks: Task[], filter: DateFilter): Task[] {
  if (filter === 'all') return tasks;
  const now        = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todayEnd   = todayStart + 24 * 60 * 60 * 1000 - 1;
  const weekEnd    = todayStart + 7  * 24 * 60 * 60 * 1000 - 1;

  return tasks.filter((t) => {
    if (!t.due_date || t.status === 'done') return false;
    const due = parseDue(t.due_date);
    if (Number.isNaN(due)) return false;
    if (filter === 'overdue') return due < todayStart;
    if (filter === 'today')   return due >= todayStart && due <= todayEnd;
    if (filter === 'week')    return due >= todayStart && due <= weekEnd;
    return true;
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

const Tasks: React.FC = () => {
  const { tasks, loading, create, update, remove, updateStatus } = useTasks();

  const [search, setSearch]           = useState('');
  const [dateFilter, setDateFilter]   = useState<DateFilter>('all');
  const [filterOpen, setFilterOpen]       = useState(false);
  const [formOpen, setFormOpen]           = useState(false);
  const [editTarget, setEditTarget]       = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('todo');
  const [deleteTarget, setDeleteTarget]   = useState<Task | null>(null);
  const [deleting, setDeleting]           = useState(false);

  // Badge counts — computed from full task list so they don't flicker
  const dateCounts = useMemo(() => ({
    today:   applyDateFilter(tasks, 'today').length,
    week:    applyDateFilter(tasks, 'week').length,
    overdue: applyDateFilter(tasks, 'overdue').length,
  }), [tasks]);

  const filtered = useMemo(() => {
    const dateFiltered = applyDateFilter(tasks, dateFilter);
    const q = search.trim().toLowerCase();
    if (!q) return dateFiltered;
    return dateFiltered.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.description ?? '').toLowerCase().includes(q)
    );
  }, [tasks, dateFilter, search]);

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
    if (editTarget) return update({ id: editTarget.id, ...values });
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

  const showBoard     = loading || filtered.length > 0 || (dateFilter === 'all' && !search && tasks.length > 0);
  const emptyFiltered = !loading && tasks.length > 0 && filtered.length === 0 && (dateFilter !== 'all' || !!search);
  const isFiltered    = dateFilter !== 'all';

  const activeFilter = DATE_FILTERS.find((f) => f.value === dateFilter)!;

  const header = (
    <div className="flex items-center justify-between gap-4 w-full">
      {/* Left — title */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="w-8 h-8 bg-amber-600/20 rounded-lg flex items-center justify-center">
          <CheckSquare size={16} className="text-amber-400" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Tasks</h2>
          <p className="text-xs text-slate-500">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} total
          </p>
        </div>
      </div>

      {/* Right — search + filter + add */}
      <div className="flex items-center gap-2">
        {tasks.length > 0 && (
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search tasks…"
            className="w-56"
          />
        )}
        {tasks.length > 0 && (
          <button
            onClick={() => setFilterOpen(true)}
            className={clsx(
              'relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
              isFiltered
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200 hover:bg-slate-700'
            )}
          >
            <SlidersHorizontal size={13} />
            Filter
            {isFiltered && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute -top-0.5 -right-0.5" />
            )}
          </button>
        )}
        <Button icon={<Plus size={15} />} size="sm" onClick={() => openAdd('todo')}>
          Add Task
        </Button>
      </div>
    </div>
  );

  return (
    <PageWrapper header={header}>
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

      {/* Empty state — filter/search has no results */}
      {emptyFiltered && (
        <EmptyState
          icon={Search}
          title={
            search
              ? 'No matching tasks'
              : dateFilter === 'overdue' ? 'No overdue tasks'
              : dateFilter === 'today'   ? 'Nothing due today'
              :                            'Nothing due this week'
          }
          description={search ? `No tasks match "${search}".` : "Great — you're on top of things."}
          action={
            <Button variant="secondary" onClick={() => { setSearch(''); setDateFilter('all'); }}>
              Clear filters
            </Button>
          }
        />
      )}

      {/* Board */}
      {showBoard && (
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

      {/* Filter modal */}
      <Modal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter tasks"
        size="sm"
        footer={
          isFiltered ? (
            <Button
              variant="secondary"
              onClick={() => { setDateFilter('all'); setFilterOpen(false); }}
            >
              Clear filter
            </Button>
          ) : undefined
        }
      >
        <div className="flex flex-col gap-2">
          <p className="text-xs text-slate-500 mb-1">Show tasks by due date</p>
          {DATE_FILTERS.map(({ value, label, desc }) => {
            const count =
              value === 'today'   ? dateCounts.today   :
              value === 'week'    ? dateCounts.week     :
              value === 'overdue' ? dateCounts.overdue  : null;
            const active    = dateFilter === value;
            const isOverdue = value === 'overdue';

            return (
              <button
                key={value}
                onClick={() => { setDateFilter(value); setFilterOpen(false); }}
                className={clsx(
                  'w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all',
                  active
                    ? isOverdue
                      ? 'bg-red-500/10 border-red-500/30 text-red-300'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : 'bg-slate-900/40 border-slate-700/50 text-slate-300 hover:bg-slate-700/40 hover:border-slate-600'
                )}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{label}</p>
                  <p className={clsx('text-[11px] mt-0.5', active ? 'opacity-70' : 'text-slate-500')}>{desc}</p>
                </div>
                {count !== null && count > 0 && (
                  <span className={clsx(
                    'ml-3 flex-shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full',
                    active
                      ? isOverdue ? 'bg-red-500/30 text-red-200' : 'bg-amber-500/30 text-amber-200'
                      : isOverdue ? 'bg-red-500/15 text-red-400' : 'bg-slate-700 text-slate-400'
                  )}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Modal>

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
