import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useClipboard } from '@/hooks/useClipboard';
import type { QuickLink } from '@/types/link.types';
import { extractHostname, formatRelativeTime } from '@/utils/formatters';
import { clsx } from 'clsx';
import { Copy, ExternalLink, Link2, Pencil, Star, Trash2 } from 'lucide-react';
import React from 'react';

interface LinkCardProps {
  link: QuickLink;
  onEdit: (link: QuickLink) => void;
  onDelete: (link: QuickLink) => void;
  onToggleFavorite: (id: number) => void;
}

export const LinkCard: React.FC<LinkCardProps> = ({
  link,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  const { copy } = useClipboard();

  const openUrl = () => {
    if (window.electronAPI) {
      window.electronAPI.openExternal(link.url);
    } else {
      window.open(link.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card className="flex flex-col gap-3 p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-slate-700/60 flex items-center justify-center">
            <Link2 size={16} className="text-slate-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-100 truncate">{link.title}</h3>
            <button
              onClick={openUrl}
              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors truncate"
            >
              <span className="truncate">{extractHostname(link.url)}</span>
              <ExternalLink size={10} className="flex-shrink-0" />
            </button>
          </div>
        </div>
        <button
          onClick={() => onToggleFavorite(link.id)}
          className="flex-shrink-0 p-1 text-slate-500 hover:text-yellow-400 transition-colors"
        >
          <Star size={16} className={clsx(link.is_favorite && 'fill-yellow-400 text-yellow-400')} />
        </button>
      </div>

      <Badge variant="blue" className="w-fit">{link.category}</Badge>

      {link.description && (
        <p className="text-xs text-slate-400 line-clamp-2">{link.description}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
        <span className="text-xs text-slate-600">Updated {formatRelativeTime(link.updated_at)}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => copy(link.url, 'Link copied')}
            className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-700/60 rounded-lg transition-colors"
          >
            <Copy size={13} />
          </button>
          <button
            onClick={() => onEdit(link)}
            className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-slate-700/60 rounded-lg transition-colors"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(link)}
            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-700/60 rounded-lg transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </Card>
  );
};