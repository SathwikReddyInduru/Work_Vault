// src/components/layout/TopBar.tsx
import { useAuth } from '@/contexts/AuthContext';
import { useSearchStore } from '@/store/search.store';
import { clsx } from 'clsx';
import { Lock, Search, Settings, ShieldCheck, ShieldOff } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/websites': 'Website Credentials',
  '/applications': 'Application Credentials',
  '/db-connections': 'DB Connections',
  '/notes': 'Notes Vault',
  '/links': 'Quick Links',
  '/tasks': 'Task Manager',
  '/tools': 'Developer Tools',
  '/settings': 'Settings',
};

export const TopBar: React.FC = () => {
  const { globalQuery, setGlobalQuery } = useSearchStore();
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPin, lock } = useAuth();
  const title = pageTitles[location.pathname] ?? 'WorkVault';

  const [menuOpen, setMenuOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });

  // Position the portal dropdown under the avatar button
  const openMenu = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setMenuOpen((o) => !o);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current && !menuRef.current.contains(target) &&
        btnRef.current && !btnRef.current.contains(target)
      ) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const handleLock = () => {
    setMenuOpen(false);
    lock();
  };

  const handleSettings = () => {
    setMenuOpen(false);
    navigate('/settings');
  };

  return (
    <header className="h-16 bg-slate-900/80 border-b border-slate-800 flex items-center gap-4 px-5 flex-shrink-0 backdrop-blur-sm">
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
        <button
          ref={btnRef}
          onClick={openMenu}
          className={clsx(
            'w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white transition-all',
            menuOpen && 'ring-2 ring-blue-400/50'
          )}
          title="Account menu"
        >
          W
        </button>
      </div>

      {/* Portal dropdown — renders at document.body level, above everything */}
      {menuOpen && createPortal(
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: menuPos.top, right: menuPos.right, zIndex: 9999 }}
          className="w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-1 overflow-hidden"
        >
          {/* Header */}
          <div className="px-3 py-2.5 border-b border-slate-700">
            <p className="text-xs font-semibold text-slate-200">WorkVault</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {hasPin
                ? <ShieldCheck size={10} className="text-emerald-400" />
                : <ShieldOff size={10} className="text-slate-500" />
              }
              <p className="text-[10px] text-slate-500">
                {hasPin ? 'PIN lock enabled' : 'No PIN set'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="py-1">
            <button
              onClick={handleSettings}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:bg-slate-700/60 hover:text-slate-100 transition-colors"
            >
              <Settings size={13} />
              Settings &amp; Security
            </button>

            {hasPin && (
              <button
                onClick={handleLock}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-amber-400/80 hover:bg-amber-500/10 hover:text-amber-300 transition-colors"
              >
                <Lock size={13} />
                Lock WorkVault
              </button>
            )}
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};