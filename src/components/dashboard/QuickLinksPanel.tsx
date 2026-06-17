// src/components/dashboard/QuickLinksPanel.tsx
import { LinkForm } from '@/components/links/LinkForm';
import type { QuickLink } from '@/types/link.types';
import type { LinkFormValues } from '@/utils/validators';
import { clsx } from 'clsx';
import { ExternalLink, Link2, Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const api = () => (window as any).electronAPI;

export const QuickLinksPanel: React.FC = () => {
  const [links, setLinks] = useState<QuickLink[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const res = await api().getLinks();
      if (res.success) setLinks(res.data ?? []);
    } catch { /* silent — panel is non-critical */ }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (values: LinkFormValues): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await api().createLink(values);
      if (res.success) { await load(); return true; }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const openLink = (url: string) => {
    if (window.electronAPI?.openExternal) {
      window.electronAPI.openExternal(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-800/50 p-5 flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-700/60 flex items-center justify-center">
            <Link2 size={13} className="text-slate-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">Quick Links</h3>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className="w-6 h-6 rounded-md bg-slate-700/60 hover:bg-slate-700 flex items-center justify-center transition-colors"
          title="Add quick link"
        >
          <Plus size={12} className="text-slate-400" />
        </button>
      </div>

      {/* Links grid — scrollable */}
      {links.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <p className="text-xs text-slate-600 text-center">No quick links yet.</p>
          <button
            onClick={() => setFormOpen(true)}
            className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Plus size={12} /> Add your first link
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-3 gap-2">
            {links.map((link) => (
              <button
                key={link.id}
                onClick={() => openLink(link.url)}
                title={link.url}
                className={clsx(
                  'group flex flex-col items-center gap-1.5 p-2.5 rounded-xl',
                  'bg-slate-700/30 hover:bg-slate-700/60 border border-transparent',
                  'hover:border-slate-600/50 transition-all text-center'
                )}
              >
                {/* Icon / Emoji */}
                <div className="w-9 h-9 rounded-xl bg-slate-700/60 flex items-center justify-center text-xl leading-none group-hover:scale-110 transition-transform">
                  {link.icon?.trim() ? (
                    <span>{link.icon}</span>
                  ) : (
                    <ExternalLink size={15} className="text-slate-400" />
                  )}
                </div>
                {/* Title */}
                <span className="text-[10px] font-medium text-slate-300 leading-tight line-clamp-2 w-full">
                  {link.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <LinkForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
        loading={loading}
      />
    </div>
  );
};