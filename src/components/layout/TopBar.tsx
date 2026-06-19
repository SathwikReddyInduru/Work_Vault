// src/components/layout/TopBar.tsx
import { useAuth } from '@/contexts/AuthContext';
import { useNotificationsStore } from '@/store/notifications.store';
import { clsx } from 'clsx';
import { Lock, Settings, ShieldCheck, ShieldOff, Bell, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { GlobalSearch } from './GlobalSearch';

export const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const { hasPin, lock } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });

  const [notifOpen, setNotifOpen] = useState(false);
  const notifBtnRef = useRef<HTMLButtonElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);
  const [notifPos, setNotifPos] = useState({ top: 0, right: 0 });

  const notifications = useNotificationsStore((s) => s.notifications);
  const hasNotifications = notifications.length > 0;
  const dismiss = useNotificationsStore((s) => s.dismiss);
  const dismissAll = useNotificationsStore((s) => s.dismissAll);

  const openNotifMenu = () => {
    if (notifBtnRef.current) {
      const rect = notifBtnRef.current.getBoundingClientRect();
      setNotifPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setNotifOpen((o) => !o);
  };

  const goToNotification = (route: string) => {
    setNotifOpen(false);
    navigate(route);
  };

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

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current && !menuRef.current.contains(target) &&
        btnRef.current && !btnRef.current.contains(target)
      ) {
        setMenuOpen(false);
      }
      if (
        notifMenuRef.current && !notifMenuRef.current.contains(target) &&
        notifBtnRef.current && !notifBtnRef.current.contains(target)
      ) {
        setNotifOpen(false);
      }
    };
    if (menuOpen || notifOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen, notifOpen]);

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

      <GlobalSearch />

      <div className="ml-auto flex items-center gap-2">
        <button
          ref={notifBtnRef}
          onClick={openNotifMenu}
          className={clsx(
            'relative w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all',
            notifOpen && 'bg-slate-800 text-slate-200'
          )}
          title="Notifications"
        >
          <Bell size={15} />
          {hasNotifications && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-slate-900" />
          )}
        </button>

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

      {menuOpen && createPortal(
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: menuPos.top, right: menuPos.right, zIndex: 9999 }}
          className="w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-1 overflow-hidden"
        >
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

      {notifOpen && createPortal(
        <div
          ref={notifMenuRef}
          style={{ position: 'fixed', top: notifPos.top, right: notifPos.right, zIndex: 9999 }}
          className="w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-1 overflow-hidden"
        >
          <div className="px-3 py-2.5 border-b border-slate-700 flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-200">Notifications</p>
            {hasNotifications && (
              <button
                onClick={dismissAll}
                className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {hasNotifications ? (
            <div className="max-h-72 overflow-y-auto py-1">
              {notifications.map((n) => {
                const dotColor = n.severity === 'critical' ? 'bg-red-500' : n.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-400';
                return (
                  <div key={n.id} className="flex items-start hover:bg-slate-700/60 transition-colors group">
                    <button
                      onClick={() => goToNotification(n.route)}
                      className="flex-1 flex items-start gap-2.5 px-3 py-3 text-left"
                    >
                      <span className={clsx('w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0', dotColor)} />
                      <span className="min-w-0">
                        <p className="text-xs font-medium text-slate-200">{n.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{n.description}</p>
                      </span>
                    </button>
                    <button
                      onClick={() => dismiss(n.id)}
                      className="p-3 text-slate-600 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                      title="Dismiss"
                    >
                      <X size={11} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="px-3 py-4 text-xs text-slate-500 text-center">You're all caught up.</p>
          )}
        </div>,
        document.body
      )}
    </header>
  );
};