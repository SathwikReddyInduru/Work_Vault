import React from 'react';
import { Search, X } from 'lucide-react';
import { clsx } from 'clsx';

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  className,
  autoFocus,
}) => (
  <div className={clsx('relative flex items-center', className)}>
    <Search size={15} className="absolute left-3 text-slate-500 pointer-events-none" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      className="input-base w-full pl-9 pr-8 h-9 text-sm"
    />
    {value && (
      <button
        onClick={() => onChange('')}
        className="absolute right-2 text-slate-500 hover:text-slate-300 transition-colors"
      >
        <X size={14} />
      </button>
    )}
  </div>
);
