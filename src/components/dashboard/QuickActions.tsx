// src/components/dashboard/QuickActions.tsx
import { clsx } from 'clsx';
import { AppWindow, CheckSquare, FileText, Globe, Link2, Wrench, Zap } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const actions = [
  { label: 'Website',     icon: Globe,       route: '/websites',     color: 'text-blue-400',   bg: 'bg-blue-500/10',   hover: 'hover:bg-blue-500/20 hover:border-blue-500/30'   },
  { label: 'App',         icon: AppWindow,   route: '/applications', color: 'text-purple-400', bg: 'bg-purple-500/10', hover: 'hover:bg-purple-500/20 hover:border-purple-500/30' },
  { label: 'Note',        icon: FileText,    route: '/notes',        color: 'text-emerald-400',bg: 'bg-emerald-500/10',hover: 'hover:bg-emerald-500/20 hover:border-emerald-500/30'},
  { label: 'Link',        icon: Link2,       route: '/links',        color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   hover: 'hover:bg-cyan-500/20 hover:border-cyan-500/30'   },
  { label: 'Task',        icon: CheckSquare, route: '/tasks',        color: 'text-amber-400',  bg: 'bg-amber-500/10',  hover: 'hover:bg-amber-500/20 hover:border-amber-500/30'  },
  { label: 'Tools',       icon: Wrench,      route: '/tools',        color: 'text-orange-400', bg: 'bg-orange-500/10', hover: 'hover:bg-orange-500/20 hover:border-orange-500/30' },
];

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-800/50 p-5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
          <Zap size={13} className="text-amber-400" />
        </div>
        <h3 className="text-sm font-semibold text-slate-200">Quick Actions</h3>
      </div>

      {/* 2×3 grid — uniform cells */}
      <div className="grid grid-cols-3 gap-2 flex-1">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.route}
              onClick={() => navigate(a.route)}
              className={clsx(
                'flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-slate-700/40 transition-all duration-150 group',
                a.hover
              )}
            >
              <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center transition-colors', a.bg)}>
                <Icon size={16} className={a.color} />
              </div>
              <span className="text-[10px] font-medium text-slate-500 group-hover:text-slate-300 text-center leading-tight transition-colors">
                {a.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};