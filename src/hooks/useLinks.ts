import { useState, useEffect, useCallback } from 'react';
import type { QuickLink, CreateLinkInput, UpdateLinkInput } from '@/types/link.types';
import { useToast } from './useToast';

const api = () => (window as any).electronAPI;

export const useLinks = () => {
  const [links, setLinks] = useState<QuickLink[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api().getLinks();
      if (res.success) setLinks(res.data ?? []);
    } catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async (data: CreateLinkInput) => {
    const res = await api().createLink(data);
    if (res.success) { toast.success('Link added'); await load(); return true; }
    toast.error('Failed to add', res.error); return false;
  };

  const update = async (data: UpdateLinkInput) => {
    const res = await api().updateLink(data);
    if (res.success) { toast.success('Link updated'); await load(); return true; }
    toast.error('Failed to update', res.error); return false;
  };

  const remove = async (id: number) => {
    const res = await api().deleteLink(id);
    if (res.success) { toast.success('Link deleted'); await load(); return true; }
    toast.error('Failed to delete', res.error); return false;
  };

  const toggleFavorite = async (id: number) => {
    await api().toggleLinkFavorite(id); await load();
  };

  return { links, loading, create, update, remove, toggleFavorite, reload: load };
};
