import React from 'react';
import { clsx } from 'clsx';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  noPadding?: boolean;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  className,
  header,
  noPadding,
}) => (
  <div className="flex flex-col h-full overflow-hidden">
    {header && (
      <div className="flex-shrink-0 px-6 py-4 border-b border-slate-800 bg-slate-900/30">
        {header}
      </div>
    )}
    <div
      className={clsx(
        'flex-1 overflow-y-auto',
        !noPadding && 'p-6',
        className
      )}
    >
      {children}
    </div>
  </div>
);
