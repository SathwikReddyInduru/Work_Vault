import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchBar } from '@/components/ui/SearchBar';
import { PageLoader } from '@/components/ui/Spinner';
import { WebsiteCard } from '@/components/websites/WebsiteCard';
import { WebsiteForm } from '@/components/websites/WebsiteForm';
import { WebsiteTable } from '@/components/websites/WebsiteTable';
import { useWebsites } from '@/hooks/useWebsites';
import type { Website } from '@/types/website.types';
import type { WebsiteFormValues } from '@/utils/validators';
import { Globe, LayoutGrid, List, Plus, Search } from 'lucide-react';
import React, { useMemo, useState } from 'react';

type ViewMode = 'grid' | 'table';

const sanitize = (values: WebsiteFormValues) => ({
  name: values.name.trim(),
  url: values.url.trim(),
  username: values.username?.trim() || undefined,
  network_name: values.network_name?.trim() || undefined,
  password: values.password?.trim() || undefined,
  notes: values.notes?.trim() || undefined,
  tags: values.tags ?? [],
  is_favorite: values.is_favorite ?? false,
});

const Websites: React.FC = () => {
  const { websites, loading, create, update, remove, toggleFavorite } = useWebsites();

  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [formOpen, setFormOpen] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<Website | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Website | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = !q
      ? websites
      : websites.filter((w) =>
          [w.name, w.url, w.username, w.network_name, ...w.tags]
            .filter(Boolean)
            .some((field) => field!.toLowerCase().includes(q))
        );

    return [...list].sort((a, b) => {
      if (a.is_favorite !== b.is_favorite) return a.is_favorite ? -1 : 1;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }, [websites, query]);

  const handleAdd = () => {
    setEditingWebsite(null);
    setFormOpen(true);
  };

  const handleEdit = (website: Website) => {
    setEditingWebsite(website);
    setFormOpen(true);
  };

  const handleFormSubmit = async (values: WebsiteFormValues) => {
    const payload = sanitize(values);
    if (editingWebsite) {
      return update({ id: editingWebsite.id, ...payload });
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
    <div className="flex items-center justify-between gap-4 w-full">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
          <Globe size={16} className="text-blue-400" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Websites</h2>
          <p className="text-xs text-slate-500">
            {websites.length} saved {websites.length === 1 ? 'credential' : 'credentials'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <SearchBar value={query} onChange={setQuery} placeholder="Search websites..." className="w-64" />

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
          Add Website
        </Button>
      </div>
    </div>
  );

  return (
    <PageWrapper header={header}>
      {loading ? (
        <PageLoader />
      ) : websites.length === 0 ? (
        <EmptyState
          icon={Globe}
          title="No websites yet"
          description="Save your first website credential to get started."
          action={
            <Button variant="primary" icon={<Plus size={14} />} onClick={handleAdd}>
              Add Website
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matches found"
          description={`No websites match "${query}".`}
          action={
            <Button variant="secondary" onClick={() => setQuery('')}>
              Clear search
            </Button>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((website) => (
            <WebsiteCard
              key={website.id}
              website={website}
              onEdit={handleEdit}
              onDelete={setDeleteTarget}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      ) : (
        <WebsiteTable
          websites={filtered}
          onEdit={handleEdit}
          onDelete={setDeleteTarget}
          onToggleFavorite={toggleFavorite}
        />
      )}

      <WebsiteForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        website={editingWebsite}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="Delete Website"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
      />
    </PageWrapper>
  );
};

export default Websites;