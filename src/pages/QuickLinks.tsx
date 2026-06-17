import { PageWrapper } from '@/components/layout/PageWrapper';
import { LinkCard } from '@/components/links/LinkCard';
import { LinkForm } from '@/components/links/LinkForm';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchBar } from '@/components/ui/SearchBar';
import { PageLoader } from '@/components/ui/Spinner';
import { useLinks } from '@/hooks/useLinks';
import type { QuickLink } from '@/types/link.types';
import type { LinkFormValues } from '@/utils/validators';
import { Link2, Plus, Search } from 'lucide-react';
import React, { useMemo, useState } from 'react';

const sanitize = (values: LinkFormValues) => ({
  title: values.title.trim(),
  url: values.url.trim(),
  category: values.category,
  description: values.description?.trim() || undefined,
  icon: values.icon?.trim() ?? '',
  is_favorite: values.is_favorite ?? false,
});

const QuickLinks: React.FC = () => {
  const { links, loading, create, update, remove, toggleFavorite } = useLinks();

  const [query, setQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<QuickLink | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<QuickLink | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = !q
      ? links
      : links.filter((l) =>
          [l.title, l.url, l.category, l.description]
            .filter(Boolean)
            .some((field) => field!.toLowerCase().includes(q))
        );

    return [...list].sort((a, b) => {
      if (a.is_favorite !== b.is_favorite) return a.is_favorite ? -1 : 1;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }, [links, query]);

  const handleAdd = () => {
    setEditingLink(null);
    setFormOpen(true);
  };

  const handleEdit = (link: QuickLink) => {
    setEditingLink(link);
    setFormOpen(true);
  };

  const handleFormSubmit = async (values: LinkFormValues) => {
    const payload = sanitize(values);
    if (editingLink) {
      return update({ id: editingLink.id, ...payload });
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
        <div className="w-8 h-8 bg-cyan-600/20 rounded-lg flex items-center justify-center">
          <Link2 size={16} className="text-cyan-400" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Quick Links</h2>
          <p className="text-xs text-slate-500">
            {links.length} saved {links.length === 1 ? 'link' : 'links'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <SearchBar value={query} onChange={setQuery} placeholder="Search links..." className="w-64" />
        <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={handleAdd}>
          Add Link
        </Button>
      </div>
    </div>
  );

  return (
    <PageWrapper header={header}>
      {loading ? (
        <PageLoader />
      ) : links.length === 0 ? (
        <EmptyState
          icon={Link2}
          title="No quick links yet"
          description="Save your first quick link to get started."
          action={
            <Button variant="primary" icon={<Plus size={14} />} onClick={handleAdd}>
              Add Link
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matches found"
          description={`No links match "${query}".`}
          action={
            <Button variant="secondary" onClick={() => setQuery('')}>
              Clear search
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((link) => (
            <LinkCard
              key={link.id}
              link={link}
              onEdit={handleEdit}
              onDelete={setDeleteTarget}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}

      <LinkForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        link={editingLink}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="Delete Quick Link"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
      />
    </PageWrapper>
  );
};

export default QuickLinks;