// src/pages/Dashboard.tsx
import { FavoriteResources } from '@/components/dashboard/FavoriteResources';
import { QuickLinksPanel } from '@/components/dashboard/QuickLinksPanel';
import { RecentItems } from '@/components/dashboard/RecentItems';
import { StatCard } from '@/components/dashboard/StatCard';
import { TaskSummary } from '@/components/dashboard/TaskSummary';
import { PageLoader } from '@/components/ui/Spinner';
import type { DashboardStats } from '@/types/electron.types';
import {
  AppWindow,
  CheckSquare,
  Database,
  FileText,
  Globe,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MOCK_STATS: DashboardStats = {
  totalWebsites: 0, totalApplications: 0, totalLinks: 0,
  totalNotes: 0, totalTasks: 0, pendingTasks: 0, totalDbConnections: 0,
  recentWebsites: [], recentApplications: [], recentNotes: [],
  recentLinks: [], recentDbConnections: [], favoritesWebsites: [], favoritesLinks: [],
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const load = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      if (window.electronAPI) {
        const [statsRes] = await Promise.all([
          window.electronAPI.getDashboardStats(),
        ]);
        setStats(statsRes.success && statsRes.data ? statsRes.data : MOCK_STATS);
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
    { label: 'Websites',       value: s.totalWebsites,     icon: Globe,       color: 'blue'   as const, route: '/websites'       },
    { label: 'Applications',   value: s.totalApplications, icon: AppWindow,   color: 'purple' as const, route: '/applications'   },
    { label: 'DB Connections', value: s.totalDbConnections, icon: Database,    color: 'cyan'   as const, route: '/db-connections' },
    { label: 'Notes',          value: s.totalNotes,         icon: FileText,    color: 'green'  as const, route: '/notes'          },
    { label: 'Total Tasks',    value: s.totalTasks,         icon: CheckSquare, color: 'yellow' as const, route: '/tasks'          },
    { label: 'Pending Tasks',  value: s.pendingTasks,       icon: TrendingUp,  color: 'red'    as const, route: '/tasks'          },
  ];

  const refreshLabel = lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Page header — fixed, never scrolls ───────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 h-20 border-b border-slate-800/80">
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

      {/* ── Body — no page-level scroll; children manage their own ───────────── */}
      <div className="flex-1 overflow-hidden flex flex-col p-5 gap-4 min-h-0">

        {/* Row 1 — 6 stat cards, uniform grid, fixed height */}
        <div className="flex-shrink-0 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
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

        {/* Row 2 — three columns, each scrolls internally; fills remaining space */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-3 gap-4">
          <RecentItems stats={s} />
          <FavoriteResources stats={s} />
          <QuickLinksPanel />
        </div>

        {/* Row 3 — task summary, fixed height */}
        <div className="flex-shrink-0">
          <TaskSummary />
        </div>

      </div>
    </div>
  );
};

export default Dashboard;