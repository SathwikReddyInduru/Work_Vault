import { useClipboard } from '@/hooks/useClipboard';
import type { Application } from '@/types/application.types';
import { APP_ENVIRONMENTS, ENV_COLORS } from '@/utils/constants';
import { extractHostname, formatRelativeTime, maskPassword } from '@/utils/formatters';
import { clsx } from 'clsx';
import {
    AppWindow,
    Copy, ExternalLink,
    Eye, EyeOff,
    Pencil,
    Star,
    Trash2,
} from 'lucide-react';
import React, { useState } from 'react';

interface AppTableProps {
  applications: Application[];
  onEdit: (application: Application) => void;
  onDelete: (application: Application) => void;
  onToggleFavorite: (id: number) => void;
}

const envLabel = (value: string) =>
  APP_ENVIRONMENTS.find((e) => e.value === value)?.label ?? value;

export const AppTable: React.FC<AppTableProps> = ({
  applications,
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
            <th className="text-left font-medium text-slate-400 text-xs uppercase tracking-wide px-4 py-3">Environment</th>
            <th className="text-left font-medium text-slate-400 text-xs uppercase tracking-wide px-4 py-3">Username</th>
            <th className="text-left font-medium text-slate-400 text-xs uppercase tracking-wide px-4 py-3">Password</th>
            <th className="text-left font-medium text-slate-400 text-xs uppercase tracking-wide px-4 py-3">Updated</th>
            <th className="text-right font-medium text-slate-400 text-xs uppercase tracking-wide px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((application) => (
            <AppTableRow
              key={application.id}
              application={application}
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
  application: Application;
  onEdit: (application: Application) => void;
  onDelete: (application: Application) => void;
  onToggleFavorite: (id: number) => void;
}

const AppTableRow: React.FC<RowProps> = ({
  application,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const { copy } = useClipboard();

  const openUrl = () => {
    if (!application.url) return;
    if (window.electronAPI) {
      window.electronAPI.openExternal(application.url);
    } else {
      window.open(application.url, '_blank', 'noopener,noreferrer');
    }
  };

  const hostname = extractHostname(application.url);

  return (
    <tr className="border-b border-slate-800 hover:bg-slate-800/40 transition-colors">
      <td className="px-4 py-3">
        <button
          onClick={() => onToggleFavorite(application.id)}
          className="text-slate-500 hover:text-yellow-400 transition-colors"
        >
          <Star size={14} className={clsx(application.is_favorite && 'fill-yellow-400 text-yellow-400')} />
        </button>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-slate-700/60 flex items-center justify-center">
            <AppWindow size={13} className="text-slate-400" />
          </div>
          <div className="min-w-0">
            <p className="text-slate-100 font-medium truncate max-w-[180px]">{application.name}</p>
            {hostname ? (
              <button
                onClick={openUrl}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                <span className="truncate max-w-[160px]">{hostname}</span>
                <ExternalLink size={9} className="flex-shrink-0" />
              </button>
            ) : (
              <span className="text-xs text-slate-600 italic">No URL</span>
            )}
          </div>
        </div>
      </td>

      <td className="px-4 py-3">
        <span className={clsx('badge border', ENV_COLORS[application.environment])}>
          {envLabel(application.environment)}
        </span>
      </td>

      <td className="px-4 py-3">
        <span className="text-xs text-slate-400 truncate max-w-[160px] block">
          {application.username || <span className="text-slate-600 italic">—</span>}
        </span>
      </td>

      <td className="px-4 py-3">
        {application.password ? (
          <div className="flex items-center gap-2">
            <span className="text-slate-300 font-mono text-xs tracking-wide">
              {showPassword ? application.password : maskPassword(application.password)}
            </span>
            <button
              onClick={() => setShowPassword((v) => !v)}
              className="text-slate-500 hover:text-slate-200 transition-colors"
            >
              {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
            </button>
            <button
              onClick={() => copy(application.password!, 'Password copied')}
              className="text-slate-500 hover:text-slate-200 transition-colors"
            >
              <Copy size={12} />
            </button>
          </div>
        ) : (
          <span className="text-slate-600 italic text-xs">—</span>
        )}
      </td>

      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
        {formatRelativeTime(application.updated_at)}
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onEdit(application)}
            className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-slate-700/60 rounded-lg transition-colors"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(application)}
            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-700/60 rounded-lg transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  );
};