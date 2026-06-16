import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
}) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 border border-slate-700">
      <Icon size={28} className="text-slate-500" />
    </div>
    <h3 className="text-base font-semibold text-slate-300 mb-1">{title}</h3>
    {description && <p className="text-sm text-slate-500 max-w-xs mb-5">{description}</p>}
    {action}
  </div>
);
