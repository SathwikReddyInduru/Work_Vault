// src/pages/Dashboard.tsx
import { FavoriteResources } from '@/components/dashboard/FavoriteResources';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentItems } from '@/components/dashboard/RecentItems';
import { StatCard } from '@/components/dashboard/StatCard';
import { TaskSummary } from '@/components/dashboard/TaskSummary';
import { PageLoader } from '@/components/ui/Spinner';
import type { DashboardStats } from '@/types/electron.types';
import type { Task } from '@/types/task.types';
import {
  AppWindow,
  CheckSquare,
  FileText,
  Globe,
  Link2,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MOCK_STATS: DashboardStats = {
  totalWebsites: 0, totalApplications: 0, totalLinks: 0,
  totalNotes: 0, totalTasks: 0, pendingTasks: 0,
  recentWebsites: [], recentApplications: [], recentNotes: [],
  recentLinks: [], favoritesWebsites: [], favoritesLinks: [],
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const load = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      if (window.electronAPI) {
        const [statsRes, tasksRes] = await Promise.all([
          window.electronAPI.getDashboardStats(),
          window.electronAPI.getTasks(),
        ]);
        setStats(statsRes.success && statsRes.data ? statsRes.data : MOCK_STATS);
        if (tasksRes.success && tasksRes.data) setTasks(tasksRes.data);
      } else {
        setStats(MOCK_STATS);
      }
    } catch {
      setStats(MOCK_STATS);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLastRefresh(new Date());
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <PageLoader />;

  const s = stats ?? MOCK_STATS;

  const statCards = [
    { label: 'Websites',      value: s.totalWebsites,     icon: Globe,       color: 'blue'   as const, route: '/websites'     },
    { label: 'Applications',  value: s.totalApplications, icon: AppWindow,   color: 'purple' as const, route: '/applications' },
    { label: 'Notes',         value: s.totalNotes,        icon: FileText,    color: 'green'  as const, route: '/notes'        },
    { label: 'Quick Links',   value: s.totalLinks,        icon: Link2,       color: 'cyan'   as const, route: '/links'        },
    { label: 'Total Tasks',   value: s.totalTasks,        icon: CheckSquare, color: 'yellow' as const, route: '/tasks'        },
    { label: 'Pending Tasks', value: s.pendingTasks,      icon: TrendingUp,  color: 'red'    as const, route: '/tasks'        },
  ];

  const refreshLabel = lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
        <div>
          <h1 className="text-sm font-bold text-slate-100 tracking-tight">Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">Your workspace at a glance</p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
        >
          <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing…' : `Updated ${refreshLabel}`}
        </button>
      </div>

      {/* ── Scrollable body ───────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">

        {/* Row 1 — 6 stat cards, uniform grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          {statCards.map((card) => (
            <StatCard
              key={card.label}
              label={card.label}
              value={card.value}
              icon={card.icon}
              color={card.color}
              onClick={() => navigate(card.route)}
            />
          ))}
        </div>

        {/* Row 2 — three equal columns: Recent | Favorites | Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ minHeight: '260px' }}>
          <RecentItems stats={s} />
          <FavoriteResources stats={s} />
          <QuickActions />
        </div>

        {/* Row 3 — full-width task overview */}
        <TaskSummary tasks={tasks} pendingCount={s.pendingTasks} />

      </div>
    </div>
  );
};

export default Dashboard;