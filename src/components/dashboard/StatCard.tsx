// src/components/dashboard/StatCard.tsx
import { clsx } from 'clsx';
import { LucideIcon } from 'lucide-react';
import React from 'react';

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color: 'blue' | 'purple' | 'green' | 'yellow' | 'red' | 'cyan';
  onClick?: () => void;
}

const colorMap = {
  blue:   { bg: 'bg-blue-500/10',   icon: 'text-blue-400',   border: 'border-blue-500/20',   glow: 'bg-blue-500' },
  purple: { bg: 'bg-purple-500/10', icon: 'text-purple-400', border: 'border-purple-500/20', glow: 'bg-purple-500' },
  green:  { bg: 'bg-emerald-500/10',icon: 'text-emerald-400',border: 'border-emerald-500/20',glow: 'bg-emerald-500' },
  yellow: { bg: 'bg-amber-500/10',  icon: 'text-amber-400',  border: 'border-amber-500/20',  glow: 'bg-amber-500' },
  red:    { bg: 'bg-red-500/10',    icon: 'text-red-400',    border: 'border-red-500/20',    glow: 'bg-red-500' },
  cyan:   { bg: 'bg-cyan-500/10',   icon: 'text-cyan-400',   border: 'border-cyan-500/20',   glow: 'bg-cyan-500' },
};

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color, onClick }) => {
  const c = colorMap[color];
  return (
    <div
      onClick={onClick}
      className={clsx(
        'relative overflow-hidden rounded-2xl border bg-slate-800/50 p-4 transition-all duration-200 group',
        c.border,
        onClick && 'cursor-pointer hover:bg-slate-800 hover:scale-[1.02] hover:shadow-lg'
      )}
    >
      {/* Subtle corner glow */}
      <div className={clsx('absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-15 transition-opacity group-hover:opacity-25', c.glow)} />

      <div className="relative flex flex-col gap-3">
        {/* Icon */}
        <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center', c.bg)}>
          <Icon size={17} className={c.icon} />
        </div>
        {/* Value + label */}
        <div>
          <p className="text-2xl font-bold text-slate-100 tabular-nums leading-none mb-1">
            {value.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 font-medium">{label}</p>
        </div>
      </div>
    </div>
  );
};