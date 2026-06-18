import { Badge } from '@/components/ui/Badge';
import { useClipboard } from '@/hooks/useClipboard';
import type { Website } from '@/types/website.types';
import { extractHostname, formatRelativeTime, maskPassword } from '@/utils/formatters';
import { clsx } from 'clsx';
import {
  Copy, ExternalLink,
  Eye, EyeOff,
  Globe,
  Pencil,
  Star,
  Trash2,
} from 'lucide-react';
import React, { useState } from 'react';

interface WebsiteTableProps {
  websites: Website[];
  onEdit: (website: Website) => void;
  onDelete: (website: Website) => void;
  onToggleFavorite: (id: number) => void;
}

export const WebsiteTable: React.FC<WebsiteTableProps> = ({
  websites,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => (
  <div className="card overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700/60 bg-slate-900/40">
            <th className="text-left font-medium text-slate-400 text-xs uppercase tracking-wide px-4 py-3 w-8" />
            <th className="text-left font-medium text-slate-400 text-xs uppercase tracking-wide px-4 py-3">Name</th>
            <th className="text-left font-medium text-slate-400 text-xs uppercase tracking-wide px-4 py-3">Network / Username</th>
            <th className="text-left font-medium text-slate-400 text-xs uppercase tracking-wide px-4 py-3">Password</th>
            <th className="text-left font-medium text-slate-400 text-xs uppercase tracking-wide px-4 py-3">Tags</th>
            <th className="text-left font-medium text-slate-400 text-xs uppercase tracking-wide px-4 py-3">Updated</th>
            <th className="text-right font-medium text-slate-400 text-xs uppercase tracking-wide px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {websites.map((website) => (
            <WebsiteTableRow
              key={website.id}
              website={website}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

interface RowProps {
  website: Website;
  onEdit: (website: Website) => void;
  onDelete: (website: Website) => void;
  onToggleFavorite: (id: number) => void;
}

const WebsiteTableRow: React.FC<RowProps> = ({
  website,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const { copy, copySequential } = useClipboard();

  // Copies all credentials first, THEN opens the URL so the app
  // keeps focus during the entire copy sequence.
  const openUrl = async () => {
    const credentials = [
      website.network_name ? { value: website.network_name, label: 'Network name copied' } : null,
      website.username     ? { value: website.username,     label: 'Username copied' }      : null,
      website.password     ? { value: website.password,     label: 'Password copied' }      : null,
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
    <tr className="border-b border-slate-800 hover:bg-slate-800/40 transition-colors">
      <td className="px-4 py-3">
        <button
          onClick={() => onToggleFavorite(website.id)}
          className="text-slate-500 hover:text-yellow-400 transition-colors"
        >
          <Star size={14} className={clsx(website.is_favorite && 'fill-yellow-400 text-yellow-400')} />
        </button>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-slate-700/60 flex items-center justify-center">
            <Globe size={13} className="text-slate-400" />
          </div>
          <div className="min-w-0">
            <p className="text-slate-100 font-medium truncate max-w-[180px]">{website.name}</p>
            <button
              onClick={openUrl}
              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              <span className="truncate max-w-[160px]">{extractHostname(website.url)}</span>
              <ExternalLink size={9} className="flex-shrink-0" />
            </button>
          </div>
        </div>
      </td>

      <td className="px-4 py-3">
        <div className="flex flex-col gap-0.5 text-xs text-slate-400 max-w-[180px]">
          {website.network_name && <span className="truncate text-slate-300">{website.network_name}</span>}
          {website.username && <span className="truncate">{website.username}</span>}
          {!website.network_name && !website.username && <span className="text-slate-600 italic">—</span>}
        </div>
      </td>

      <td className="px-4 py-3">
        {website.password ? (
          <div className="flex items-center gap-2">
            <span className="text-slate-300 font-mono text-xs tracking-wide">
              {showPassword ? website.password : maskPassword(website.password)}
            </span>
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
          </div>
        ) : (
          <span className="text-slate-600 italic text-xs">—</span>
        )}
      </td>

      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1 max-w-[160px]">
          {website.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="slate">{tag}</Badge>
          ))}
          {website.tags.length > 2 && (
            <Badge variant="slate">+{website.tags.length - 2}</Badge>
          )}
        </div>
      </td>

      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
        {formatRelativeTime(website.updated_at)}
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
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
      </td>
    </tr>
  );
};