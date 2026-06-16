import { useState, useEffect, useCallback } from 'react';
import type { Website, CreateWebsiteInput, UpdateWebsiteInput } from '@/types/website.types';
import { useToast } from './useToast';

const api = () => (window as any).electronAPI;

export const useWebsites = () => {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api().getWebsites();
      if (res.success) setWebsites(res.data ?? []);
    } catch { /* no electron */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async (data: CreateWebsiteInput) => {
    const res = await api().createWebsite(data);
    if (res.success) { toast.success('Website added'); await load(); return true; }
    toast.error('Failed to add website', res.error); return false;
  };

  const update = async (data: UpdateWebsiteInput) => {
    const res = await api().updateWebsite(data);
    if (res.success) { toast.success('Website updated'); await load(); return true; }
    toast.error('Failed to update', res.error); return false;
  };

  const remove = async (id: number) => {
    const res = await api().deleteWebsite(id);
    if (res.success) { toast.success('Website deleted'); await load(); return true; }
    toast.error('Failed to delete', res.error); return false;
  };

  const toggleFavorite = async (id: number) => {
    await api().toggleWebsiteFavorite(id);
    await load();
  };

  return { websites, loading, create, update, remove, toggleFavorite, reload: load };
};
