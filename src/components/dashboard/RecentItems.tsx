// src/components/dashboard/RecentItems.tsx
import type { DashboardStats } from '@/types/electron.types';
import { extractHostname, formatRelativeTime, truncate } from '@/utils/formatters';
import { clsx } from 'clsx';
import { AppWindow, ArrowRight, Clock, Database, FileText, Globe, Link2 } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface RecentItemsProps { stats: DashboardStats; }

type RecentItem = {
  kind: 'website' | 'application' | 'note' | 'link' | 'dbconnection';
  id: number; title: string; subtitle: string; time: string;
};

const kindMeta = {
  website:     { icon: Globe,      color: 'text-blue-400',    bg: 'bg-blue-500/10',    route: '/websites'     },
  application: { icon: AppWindow,  color: 'text-purple-400',  bg: 'bg-purple-500/10',  route: '/applications' },
  note:        { icon: FileText,   color: 'text-emerald-400', bg: 'bg-emerald-500/10', route: '/notes'        },
  link:        { icon: Link2,      color: 'text-cyan-400',    bg: 'bg-cyan-500/10',    route: '/links'        },
  dbconnection:{ icon: Database,   color: 'text-orange-400',  bg: 'bg-orange-500/10',  route: '/db-connections' },
};

export const RecentItems: React.FC<RecentItemsProps> = ({ stats }) => {
  const navigate = useNavigate();

  // Only last 3 items across all types
  const items: RecentItem[] = [
    ...stats.recentWebsites.map((w) => ({ kind: 'website' as const, id: w.id, title: w.name, subtitle: extractHostname(w.url) || w.url, time: w.created_at })),
    ...stats.recentApplications.map((a) => ({ kind: 'application' as const, id: a.id, title: a.name, subtitle: a.environment, time: a.created_at })),
    ...stats.recentNotes.map((n) => ({ kind: 'note' as const, id: n.id, title: n.title, subtitle: n.category, time: n.created_at })),
    ...stats.recentLinks.map((l) => ({ kind: 'link' as const, id: l.id, title: l.title, subtitle: l.category, time: l.created_at })),
    ...stats.recentDbConnections.map((d) => ({ kind: 'dbconnection' as const, id: d.id, title: d.name, subtitle: d.host ?? d.service_name ?? d.type, time: d.created_at })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 4);

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-800/50 p-5 flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-700/60 flex items-center justify-center">
            <Clock size={13} className="text-slate-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">Recently Added</h3>
        </div>
        {items.length > 0 && (
          <span className="text-[10px] font-medium text-slate-600 bg-slate-700/40 px-2 py-0.5 rounded-full">
            {items.length} items
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-slate-600 text-center">No items yet — start adding credentials, notes or links.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto flex flex-col gap-0.5">
          {items.map((item, idx) => {
            const meta = kindMeta[item.kind];
            const Icon = meta.icon;
            return (
              <button
                key={`${item.kind}-${item.id}-${idx}`}
                onClick={() => navigate(meta.route)}
                className="flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-slate-700/40 transition-colors group text-left w-full"
              >
                <div className={clsx('w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0', meta.bg)}>
                  <Icon size={13} className={meta.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-200 truncate">{truncate(item.title, 38)}</p>
                  <p className="text-[10px] text-slate-500 truncate capitalize">{item.subtitle}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-[10px] text-slate-600">{formatRelativeTime(item.time)}</span>
                  <ArrowRight size={11} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};