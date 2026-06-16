import React from 'react';
import { Search, Bell } from 'lucide-react';
import { useSearchStore } from '@/store/search.store';
import { useLocation } from 'react-router-dom';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/websites': 'Website Credentials',
  '/applications': 'Application Credentials',
  '/notes': 'Notes Vault',
  '/links': 'Quick Links',
  '/tasks': 'Task Manager',
  '/tools': 'Developer Tools',
  '/settings': 'Settings',
};

export const TopBar: React.FC = () => {
  const { globalQuery, setGlobalQuery } = useSearchStore();
  const location = useLocation();
  const title = pageTitles[location.pathname] ?? 'WorkVault';

  return (
    <header className="h-14 bg-slate-900/80 border-b border-slate-800 flex items-center gap-4 px-5 flex-shrink-0 backdrop-blur-sm">
      <h1 className="text-sm font-semibold text-slate-200 flex-shrink-0">{title}</h1>

      <div className="flex-1 max-w-md relative flex items-center">
        <Search size={14} className="absolute left-3 text-slate-500 pointer-events-none" />
        <input
          type="text"
          value={globalQuery}
          onChange={(e) => setGlobalQuery(e.target.value)}
          placeholder="Global search..."
          className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
          <Bell size={16} />
        </button>
        <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
          W
        </div>
      </div>
    </header>
  );
};
