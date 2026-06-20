// src/components/dashboard/FavoriteResources.tsx
import type { DashboardStats } from '@/types/electron.types';
import { extractHostname, truncate } from '@/utils/formatters';
import { clsx } from 'clsx';
import { AppWindow, Database, ExternalLink, Globe, Link2, Star } from 'lucide-react';
import React from 'react';

interface FavoriteResourcesProps { stats: DashboardStats; }

const kindMeta = {
  website:      { icon: Globe,      color: 'text-blue-400',   bg: 'bg-blue-500/10'   },
  link:         { icon: Link2,      color: 'text-cyan-400',   bg: 'bg-cyan-500/10'   },
  application:  { icon: AppWindow,  color: 'text-purple-400', bg: 'bg-purple-500/10' },
  dbconnection: { icon: Database,   color: 'text-violet-400', bg: 'bg-violet-500/10' },
};

export const FavoriteResources: React.FC<FavoriteResourcesProps> = ({ stats }) => {
  const openUrl = (url: string) => {
    if (window.electronAPI) window.electronAPI.openExternal(url);
    else window.open(url, '_blank');
  };

  const allFavorites = [
    ...stats.favoritesWebsites.map((w) => ({
      id: w.id, kind: 'website' as const,
      title: w.name, url: w.url, subtitle: extractHostname(w.url),
    })),
    ...stats.favoritesLinks.map((l) => ({
      id: l.id, kind: 'link' as const,
      title: l.title, url: l.url, subtitle: l.category,
    })),
    ...(stats.favoritesApplications ?? []).map((a) => ({
      id: a.id, kind: 'application' as const,
      title: a.name, url: a.url ?? '', subtitle: a.environment,
    })),
    ...(stats.favoritesDbConnections ?? []).map((d) => ({
      id: d.id, kind: 'dbconnection' as const,
      title: d.name, url: '', subtitle: d.host ? `${d.host}:${d.port ?? 1521}` : (d.tns_alias ?? 'TNS'),
    })),
  ].slice(0, 6);

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-800/50 p-5 flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Star size={13} className="text-amber-400 fill-amber-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">Favorites</h3>
        </div>
        {allFavorites.length > 0 && (
          <span className="text-[10px] font-medium text-slate-600 bg-slate-700/40 px-2 py-0.5 rounded-full">
            {allFavorites.length} saved
          </span>
        )}
      </div>

      {allFavorites.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-slate-600 text-center">
            Star websites, links, applications, or DB connections to pin them here.
          </p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-1.5">
          {allFavorites.map((item) => {
            const meta = kindMeta[item.kind];
            const Icon = meta.icon;
            const clickable = !!item.url;
            return (
              <button
                key={`${item.kind}-${item.id}`}
                onClick={() => clickable && openUrl(item.url)}
                disabled={!clickable}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-900/40 border border-slate-700/30 transition-all group text-left',
                  clickable
                    ? 'hover:bg-slate-700/50 hover:border-slate-600/60 cursor-pointer'
                    : 'cursor-default'
                )}
              >
                <div className={clsx('w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0', meta.bg)}>
                  <Icon size={13} className={meta.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-200 truncate">{truncate(item.title, 28)}</p>
                  <p className="text-[10px] text-slate-500 truncate capitalize">{item.subtitle}</p>
                </div>
                {clickable && (
                  <ExternalLink size={11} className="text-slate-600 opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
