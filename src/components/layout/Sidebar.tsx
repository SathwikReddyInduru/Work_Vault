import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Globe,
  AppWindow,
  FileText,
  Link2,
  CheckSquare,
  Wrench,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useUIStore } from '@/store/ui.store';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/websites', icon: Globe, label: 'Websites' },
  { path: '/applications', icon: AppWindow, label: 'Applications' },
  { path: '/notes', icon: FileText, label: 'Notes' },
  { path: '/links', icon: Link2, label: 'Quick Links' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { path: '/tools', icon: Wrench, label: 'Tools' },
];

const bottomItems = [
  { path: '/settings', icon: Settings, label: 'Settings' },
];

interface NavItemProps {
  path: string;
  icon: React.ElementType;
  label: string;
  collapsed: boolean;
  exact?: boolean;
}

const SidebarNavItem: React.FC<NavItemProps> = ({ path, icon: Icon, label, collapsed, exact }) => {
  const location = useLocation();
  const isActive = exact ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <NavLink
      to={path}
      title={collapsed ? label : undefined}
      className={clsx(
        'sidebar-item',
        isActive ? 'sidebar-item-active' : 'sidebar-item-inactive',
        collapsed && 'justify-center px-2'
      )}
    >
      <Icon size={18} className="flex-shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
      {isActive && !collapsed && (
        <span className="ml-auto w-1.5 h-1.5 bg-blue-300 rounded-full flex-shrink-0" />
      )}
    </NavLink>
  );
};

export const Sidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <aside
      className={clsx(
        'flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-200 flex-shrink-0',
        sidebarCollapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={clsx(
        'flex items-center gap-3 px-4 py-5 border-b border-slate-800',
        sidebarCollapsed && 'justify-center px-2'
      )}>
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Shield size={16} className="text-white" />
        </div>
        {!sidebarCollapsed && (
          <div>
            <p className="text-sm font-bold text-white leading-tight">WorkVault</p>
            <p className="text-[10px] text-slate-500 leading-tight">Secure Workspace</p>
          </div>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-0.5">
        {navItems.map((item) => (
          <SidebarNavItem
            key={item.path}
            {...item}
            exact={item.path === '/'}
            collapsed={sidebarCollapsed}
          />
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="px-2 pb-2 border-t border-slate-800 pt-2 flex flex-col gap-0.5">
        {bottomItems.map((item) => (
          <SidebarNavItem
            key={item.path}
            {...item}
            collapsed={sidebarCollapsed}
          />
        ))}
        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className={clsx(
            'sidebar-item sidebar-item-inactive mt-1',
            sidebarCollapsed && 'justify-center px-2'
          )}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : (
            <>
              <ChevronLeft size={18} />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
