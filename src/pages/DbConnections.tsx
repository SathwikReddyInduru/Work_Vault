// src/pages/DbConnections.tsx

import React, { useState, useMemo } from 'react';
import { Database, LayoutGrid, List, Plus, Search } from 'lucide-react';
import { useDbConnections } from '@/hooks/useDbConnections';
import { DbConnectionCard } from '@/components/dbconnections/DbConnectionCard';
import { DbConnectionTable } from '@/components/dbconnections/DbConnectionTable';
import { DbConnectionForm } from '@/components/dbconnections/DbConnectionForm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchBar } from '@/components/ui/SearchBar';
import { Button } from '@/components/ui/Button';
import { PageWrapper } from '@/components/layout/PageWrapper';
import type { DbConnection } from '@/types/dbconnection.types';
import type { DbConnectionFormValues } from '@/utils/validators';

type ViewMode = 'grid' | 'table';

const DbConnections: React.FC = () => {
  const { connections, loading, create, update, remove, toggleFavorite } = useDbConnections();

  const [search, setSearch]           = useState('');
  const [viewMode, setViewMode]       = useState<ViewMode>('grid');
  const [formOpen, setFormOpen]       = useState(false);
  const [editTarget, setEditTarget]   = useState<DbConnection | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DbConnection | null>(null);
  const [deleting, setDeleting]       = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return connections;
    return connections.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.user_schema.toLowerCase().includes(q) ||
        (c.host ?? '').toLowerCase().includes(q) ||
        (c.service_name ?? '').toLowerCase().includes(q)
    );
  }, [connections, search]);

  const openAdd  = () => { setEditTarget(null); setFormOpen(true); };
  const openEdit = (c: DbConnection) => { setEditTarget(c); setFormOpen(true); };

  const handleSubmit = async (values: DbConnectionFormValues): Promise<boolean> => {
    if (editTarget) return update(editTarget.id, values);
    return create(values);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await remove(deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
  };

  const header = (
    <div className="flex items-center justify-between gap-4 w-full">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-violet-600/20 rounded-lg flex items-center justify-center">
          <Database size={16} className="text-violet-400" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-100">DB Connections</h2>
          <p className="text-xs text-slate-500">
            {connections.length} connection{connections.length !== 1 ? 's' : ''} saved
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, user, host, service…" className="w-64" />

        {/* View toggle */}
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

        <Button icon={<Plus size={15} />} size="sm" onClick={openAdd}>
          Add Connection
        </Button>
      </div>
    </div>
  );

  return (
    <PageWrapper header={header}>
      {/* Empty states */}
      {!loading && connections.length === 0 && (
        <EmptyState
          icon={Database}
          title="No DB connections yet"
          description="Save your first database connection to get started."
          action={
            <Button icon={<Plus size={15} />} size="sm" onClick={openAdd}>
              Add Connection
            </Button>
          }
        />
      )}

      {!loading && connections.length > 0 && filtered.length === 0 && search && (
        <EmptyState
          icon={Search}
          title="No matching connections"
          description={`No connections match "${search}".`}
          action={
            <Button variant="secondary" onClick={() => setSearch('')}>
              Clear search
            </Button>
          }
        />
      )}

      {/* Grid / Table */}
      {filtered.length > 0 && (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((c) => (
              <DbConnectionCard
                key={c.id}
                connection={c}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        ) : (
          <DbConnectionTable
            connections={filtered}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
            onToggleFavorite={toggleFavorite}
          />
        )
      )}

      {/* Form modal */}
      <DbConnectionForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditTarget(null); }}
        onSubmit={handleSubmit}
        initial={editTarget}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete connection?"
        message={`"${deleteTarget?.name}" will be permanently deleted.`}
      />
    </PageWrapper>
  );
};

export default DbConnections;
