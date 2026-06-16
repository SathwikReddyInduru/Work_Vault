import { create } from 'zustand';
import type { DashboardStats } from '@/types/electron.types';

interface DashboardState {
  stats: DashboardStats | null;
  loading: boolean;
  setStats: (stats: DashboardStats) => void;
  setLoading: (v: boolean) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: null,
  loading: false,
  setStats: (stats) => set({ stats }),
  setLoading: (loading) => set({ loading }),
}));
