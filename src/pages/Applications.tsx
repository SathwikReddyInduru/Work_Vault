import { AppCard } from '@/components/applications/AppCard';
import { AppForm } from '@/components/applications/AppForm';
import { AppTable } from '@/components/applications/AppTable';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchBar } from '@/components/ui/SearchBar';
import { PageLoader } from '@/components/ui/Spinner';
import { useApplications } from '@/hooks/useApplications';
import type { Application } from '@/types/application.types';
import { APP_ENVIRONMENTS } from '@/utils/constants';
import type { ApplicationFormValues } from '@/utils/validators';
import { AppWindow, LayoutGrid, List, Plus, Search } from 'lucide-react';
import React, { useMemo, useState } from 'react';

type ViewMode = 'grid' | 'table';

const sanitize = (values: ApplicationFormValues) => ({
  name: values.name.trim(),
  url: values.url?.trim() || undefined,
  username: values.username?.trim() || undefined,
  password: values.password?.trim() || undefined,
  network_name: values.network_name?.trim() || undefined,
  environment: values.environment,
  notes: values.notes?.trim() || undefined,
  is_favorite: values.is_favorite ?? false,
});

const envLabel = (value: string) =>
  APP_ENVIRONMENTS.find((e) => e.value === value)?.label ?? value;

const Applications: React.FC = () => {
  const { applications, loading, create, update, remove, toggleFavorite } = useApplications();

  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [formOpen, setFormOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Application | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = !q
      ? applications
      : applications.filter((a) =>
          [a.name, a.url, a.username, envLabel(a.environment)]
            .filter(Boolean)
            .some((field) => field!.toLowerCase().includes(q))
        );

    return [...list].sort((a, b) => {
      if (a.is_favorite !== b.is_favorite) return a.is_favorite ? -1 : 1;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }, [applications, query]);

  const handleAdd = () => {
    setEditingApp(null);
    setFormOpen(true);
  };

  const handleEdit = (application: Application) => {
    setEditingApp(application);
    setFormOpen(true);
  };

  const handleFormSubmit = async (values: ApplicationFormValues) => {
    const payload = sanitize(values);
    if (editingApp) {
      return update({ id: editingApp.id, ...payload });
    }
    return create(payload);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await remove(deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
  };

  const header = (
    <div className="flex items-center justify-between gap-5 w-full">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
          <AppWindow size={16} className="text-purple-400" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Applications</h2>
          <p className="text-xs text-slate-500">
            {applications.length} saved {applications.length === 1 ? 'application' : 'applications'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <SearchBar value={query} onChange={setQuery} placeholder="Search applications..." className="w-64" />

        <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('grid')}
            className={
              viewMode === 'grid'
                ? 'p-1.5 rounded-md bg-slate-700 text-slate-100'
                : 'p-1.5 rounded-md text-slate-500 hover:text-slate-200'
            }
            title="Grid view"
          >
            <LayoutGrid size={14} />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={
              viewMode === 'table'
                ? 'p-1.5 rounded-md bg-slate-700 text-slate-100'
                : 'p-1.5 rounded-md text-slate-500 hover:text-slate-200'
            }
            title="Table view"
          >
            <List size={14} />
          </button>
        </div>

        <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={handleAdd}>
          Add Application
        </Button>
      </div>
    </div>
  );

  return (
    <PageWrapper header={header}>
      {loading ? (
        <PageLoader />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={AppWindow}
          title="No applications yet"
          description="Save your first application credential to get started."
          action={
            <Button variant="primary" icon={<Plus size={14} />} onClick={handleAdd}>
              Add Application
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matches found"
          description={`No applications match "${query}".`}
          action={
            <Button variant="secondary" onClick={() => setQuery('')}>
              Clear search
            </Button>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((application) => (
            <AppCard
              key={application.id}
              application={application}
              onEdit={handleEdit}
              onDelete={setDeleteTarget}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      ) : (
        <AppTable
          applications={filtered}
          onEdit={handleEdit}
          onDelete={setDeleteTarget}
          onToggleFavorite={toggleFavorite}
        />
      )}

      <AppForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        application={editingApp}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="Delete Application"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
      />
    </PageWrapper>
  );
};

export default Applications;