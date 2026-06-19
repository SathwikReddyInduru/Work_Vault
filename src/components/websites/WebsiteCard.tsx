import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useClipboard } from '@/hooks/useClipboard';
import type { Website } from '@/types/website.types';
import { extractHostname, formatRelativeTime, maskPassword } from '@/utils/formatters';
import { clsx } from 'clsx';
import {
  Copy,
  ExternalLink,
  Eye, EyeOff,
  Globe,
  Pencil,
  Star,
  Trash2,
  User,
} from 'lucide-react';
import React, { useState } from 'react';

interface WebsiteCardProps {
  website: Website;
  onEdit: (website: Website) => void;
  onDelete: (website: Website) => void;
  onToggleFavorite: (id: number) => void;
}

export const WebsiteCard: React.FC<WebsiteCardProps> = ({
  website,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const { copy, copySequential } = useClipboard();

  const hostname = extractHostname(website.url);

  // Copies all credentials first, THEN opens the URL so the app
  // keeps focus during the entire copy sequence.
  const openUrl = async () => {
    const credentials = [
      website.password     ? { value: website.password,     label: 'Password copied' }      : null,
      website.username     ? { value: website.username,     label: 'Username copied' }      : null,
      website.network_name ? { value: website.network_name, label: 'Network name copied' } : null,
    ].filter(Boolean) as { value: string; label: string }[];

    if (credentials.length > 0) {
      await copySequential(credentials, 1000);
    }

    // Open URL only after all copies are done
    if (window.electronAPI) {
      window.electronAPI.openExternal(website.url);
    } else {
      window.open(website.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card className="flex flex-col gap-3 p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-slate-700/60 flex items-center justify-center">
            <Globe size={16} className="text-slate-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-100 truncate">{website.name}</h3>
            <button
              onClick={openUrl}
              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors truncate"
            >
              <span className="truncate">{hostname}</span>
              <ExternalLink size={10} className="flex-shrink-0" />
            </button>
          </div>
        </div>
        <button
          onClick={() => onToggleFavorite(website.id)}
          className="flex-shrink-0 p-1 text-slate-500 hover:text-yellow-400 transition-colors"
        >
          <Star
            size={16}
            className={clsx(website.is_favorite && 'fill-yellow-400 text-yellow-400')}
          />
        </button>
      </div>

      {/* Credentials */}
      <div className="flex flex-col gap-1.5 text-xs">
        {website.network_name && (
          <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-slate-900/60 rounded-lg">
            <span className="flex items-center gap-1.5 text-slate-400 min-w-0">
              <Globe size={12} className="flex-shrink-0" />
              <span className="truncate">{website.network_name}</span>
            </span>
            <button
              onClick={() => copy(website.network_name!, 'Network name copied')}
              className="flex-shrink-0 text-slate-500 hover:text-slate-200 transition-colors"
            >
              <Copy size={12} />
            </button>
          </div>
        )}
        {website.username && (
          <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-slate-900/60 rounded-lg">
            <span className="flex items-center gap-1.5 text-slate-400 min-w-0">
              <User size={12} className="flex-shrink-0" />
              <span className="truncate">{website.username}</span>
            </span>
            <button
              onClick={() => copy(website.username!, 'Username copied')}
              className="flex-shrink-0 text-slate-500 hover:text-slate-200 transition-colors"
            >
              <Copy size={12} />
            </button>
          </div>
        )}
        {website.password && (
          <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-slate-900/60 rounded-lg">
            <span className="text-slate-300 font-mono tracking-wide truncate">
              {showPassword ? website.password : maskPassword(website.password)}
            </span>
            <span className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => setShowPassword((v) => !v)}
                className="text-slate-500 hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
              </button>
              <button
                onClick={() => copy(website.password!, 'Password copied')}
                className="text-slate-500 hover:text-slate-200 transition-colors"
              >
                <Copy size={12} />
              </button>
            </span>
          </div>
        )}
        {!website.network_name && !website.username && !website.password && (
          <p className="text-slate-600 italic px-2.5 py-1.5">No credentials saved</p>
        )}
      </div>

      {/* Tags */}
      {website.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {website.tags.map((tag) => (
            <Badge key={tag} variant="slate">{tag}</Badge>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
        <span className="text-xs text-slate-600">Updated {formatRelativeTime(website.updated_at)}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(website)}
            className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-slate-700/60 rounded-lg transition-colors"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(website)}
            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-700/60 rounded-lg transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </Card>
  );
};