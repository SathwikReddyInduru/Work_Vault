import { Card } from '@/components/ui/Card';
import { useClipboard } from '@/hooks/useClipboard';
import type { Application } from '@/types/application.types';
import { APP_ENVIRONMENTS, ENV_COLORS } from '@/utils/constants';
import { extractHostname, formatRelativeTime, maskPassword } from '@/utils/formatters';
import { clsx } from 'clsx';
import {
    AppWindow,
    Copy,
    ExternalLink,
    Eye, EyeOff,
    Pencil,
    Star,
    Trash2,
    User,
} from 'lucide-react';
import React, { useState } from 'react';

interface AppCardProps {
  application: Application;
  onEdit: (application: Application) => void;
  onDelete: (application: Application) => void;
  onToggleFavorite: (id: number) => void;
}

const envLabel = (value: string) =>
  APP_ENVIRONMENTS.find((e) => e.value === value)?.label ?? value;

export const AppCard: React.FC<AppCardProps> = ({
  application,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const { copy } = useClipboard();

  const hostname = extractHostname(application.url);

  const openUrl = () => {
    if (!application.url) return;
    if (window.electronAPI) {
      window.electronAPI.openExternal(application.url);
    } else {
      window.open(application.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card className="flex flex-col gap-3 p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-slate-700/60 flex items-center justify-center">
            <AppWindow size={16} className="text-slate-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-100 truncate">{application.name}</h3>
            {hostname ? (
              <button
                onClick={openUrl}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors truncate"
              >
                <span className="truncate">{hostname}</span>
                <ExternalLink size={10} className="flex-shrink-0" />
              </button>
            ) : (
              <span className="text-xs text-slate-600 italic">No URL</span>
            )}
          </div>
        </div>
        <button
          onClick={() => onToggleFavorite(application.id)}
          className="flex-shrink-0 p-1 text-slate-500 hover:text-yellow-400 transition-colors"
        >
          <Star
            size={16}
            className={clsx(application.is_favorite && 'fill-yellow-400 text-yellow-400')}
          />
        </button>
      </div>

      {/* Environment badge */}
      <span className={clsx('badge w-fit border', ENV_COLORS[application.environment])}>
        {envLabel(application.environment)}
      </span>

      {/* Credentials */}
      <div className="flex flex-col gap-1.5 text-xs">
        {application.username && (
          <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-slate-900/60 rounded-lg">
            <span className="flex items-center gap-1.5 text-slate-400 min-w-0">
              <User size={12} className="flex-shrink-0" />
              <span className="truncate">{application.username}</span>
            </span>
            <button
              onClick={() => copy(application.username!, 'Username copied')}
              className="flex-shrink-0 text-slate-500 hover:text-slate-200 transition-colors"
            >
              <Copy size={12} />
            </button>
          </div>
        )}
        {application.password && (
          <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-slate-900/60 rounded-lg">
            <span className="text-slate-300 font-mono tracking-wide truncate">
              {showPassword ? application.password : maskPassword(application.password)}
            </span>
            <span className="flex items-center gap-1 flex-shrink-0">
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
            </span>
          </div>
        )}
        {!application.username && !application.password && (
          <p className="text-slate-600 italic px-2.5 py-1.5">No credentials saved</p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
        <span className="text-xs text-slate-600">Updated {formatRelativeTime(application.updated_at)}</span>
        <div className="flex items-center gap-1">
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
      </div>
    </Card>
  );
};