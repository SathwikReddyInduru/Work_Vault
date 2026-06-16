import { useState, useEffect, useCallback } from 'react';
import type { Task, CreateTaskInput, UpdateTaskInput, TaskStatus } from '@/types/task.types';
import { useToast } from './useToast';

const api = () => (window as any).electronAPI;

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api().getTasks();
      if (res.success) setTasks(res.data ?? []);
    } catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async (data: CreateTaskInput) => {
    const res = await api().createTask(data);
    if (res.success) { toast.success('Task created'); await load(); return true; }
    toast.error('Failed to create', res.error); return false;
  };

  const update = async (data: UpdateTaskInput) => {
    const res = await api().updateTask(data);
    if (res.success) { toast.success('Task updated'); await load(); return true; }
    toast.error('Failed to update', res.error); return false;
  };

  const remove = async (id: number) => {
    const res = await api().deleteTask(id);
    if (res.success) { toast.success('Task deleted'); await load(); return true; }
    toast.error('Failed to delete', res.error); return false;
  };

  const updateStatus = async (id: number, status: TaskStatus) => {
    await api().updateTaskStatus(id, status); await load();
  };

  return { tasks, loading, create, update, remove, updateStatus, reload: load };
};
