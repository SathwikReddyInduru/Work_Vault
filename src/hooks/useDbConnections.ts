// src/hooks/useDbConnections.ts

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './useToast';
import type { DbConnection } from '@/types/dbconnection.types';
import type { DbConnectionFormValues } from '@/utils/validators';

const api = () => (window as any).electronAPI;

const log = {
  error: (operation: string, err: unknown) => {
    console.error(`[DbConnections:${operation}]`, err instanceof Error ? err : String(err));
  },
  ipc: (operation: string, channel: string, error: string) => {
    console.error(`[DbConnections:${operation}] IPC error on '${channel}':`, error);
  },
};

export function useDbConnections() {
  const [connections, setConnections] = useState<DbConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api().getDbConnections();
      if (res.success) {
        setConnections(res.data ?? []);
      } else {
        log.ipc('load', 'dbconnections:getAll', res.error);
        toast.error('Failed to load connections', res.error);
      }
    } catch (err) {
      log.error('load', err);
      toast.error('Failed to load connections', err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async (values: DbConnectionFormValues): Promise<boolean> => {
    try {
      const res = await api().createDbConnection({ ...values, port: values.port ?? undefined });
      if (res.success && res.data) {
        setConnections((prev) => [res.data!, ...prev]);
        toast.success('Connection saved');
        return true;
      }
      log.ipc('create', 'dbconnections:create', res.error);
      toast.error(res.error ?? 'Failed to create connection');
      return false;
    } catch (err) {
      log.error('create', err);
      toast.error(err instanceof Error ? err.message : 'Failed to create connection');
      return false;
    }
  };

  const update = async (id: number, values: DbConnectionFormValues): Promise<boolean> => {
    try {
      const res = await api().updateDbConnection({ id, ...values });
      if (res.success && res.data) {
        setConnections((prev) => prev.map((c) => (c.id === id ? res.data! : c)));
        toast.success('Connection updated');
        return true;
      }
      log.ipc('update', 'dbconnections:update', res.error);
      toast.error(res.error ?? 'Failed to update connection');
      return false;
    } catch (err) {
      log.error('update', err);
      toast.error(err instanceof Error ? err.message : 'Failed to update connection');
      return false;
    }
  };

  const remove = async (id: number): Promise<boolean> => {
    try {
      const res = await api().deleteDbConnection(id);
      if (res.success) {
        setConnections((prev) => prev.filter((c) => c.id !== id));
        toast.success('Connection deleted');
        return true;
      }
      log.ipc('remove', 'dbconnections:delete', res.error);
      toast.error(res.error ?? 'Failed to delete connection');
      return false;
    } catch (err) {
      log.error('remove', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete connection');
      return false;
    }
  };

  const toggleFavorite = async (id: number): Promise<void> => {
    try {
      const res = await api().toggleDbConnectionFavorite(id);
      if (res.success && res.data) {
        setConnections((prev) => prev.map((c) => (c.id === id ? res.data! : c)));
      } else if (!res.success) {
        log.ipc('toggleFavorite', 'dbconnections:toggleFavorite', res.error);
      }
    } catch (err) {
      log.error('toggleFavorite', err);
      toast.error('Failed to update favorite');
    }
  };

  return { connections, loading, create, update, remove, toggleFavorite, reload: load };
}