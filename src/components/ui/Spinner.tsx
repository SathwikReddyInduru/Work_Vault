import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface SpinnerProps {
  size?: number;
  className?: string;
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 20, className, label }) => (
  <div className={clsx('flex flex-col items-center justify-center gap-3', className)}>
    <Loader2 size={size} className="animate-spin text-blue-400" />
    {label && <p className="text-sm text-slate-400">{label}</p>}
  </div>
);

export const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center h-64">
    <Spinner size={28} label="Loading..." />
  </div>
);
