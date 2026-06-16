import { useState, useEffect, useCallback } from 'react';
import type { Application, CreateApplicationInput, UpdateApplicationInput } from '@/types/application.types';
import { useToast } from './useToast';

const api = () => (window as any).electronAPI;

export const useApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api().getApplications();
      if (res.success) setApplications(res.data ?? []);
    } catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async (data: CreateApplicationInput) => {
    const res = await api().createApplication(data);
    if (res.success) { toast.success('Application added'); await load(); return true; }
    toast.error('Failed to add', res.error); return false;
  };

  const update = async (data: UpdateApplicationInput) => {
    const res = await api().updateApplication(data);
    if (res.success) { toast.success('Application updated'); await load(); return true; }
    toast.error('Failed to update', res.error); return false;
  };

  const remove = async (id: number) => {
    const res = await api().deleteApplication(id);
    if (res.success) { toast.success('Application deleted'); await load(); return true; }
    toast.error('Failed to delete', res.error); return false;
  };

  const toggleFavorite = async (id: number) => {
    await api().toggleApplicationFavorite(id); await load();
  };

  return { applications, loading, create, update, remove, toggleFavorite, reload: load };
};
