// src/store/tasks.store.ts
//
// Single source of truth for tasks. All consumers (useTasks hook, 
// useNotificationsSync) share this store so notifications update
// automatically whenever tasks are created, edited, or deleted.

import { create } from 'zustand';
import type { Task } from '@/types/task.types';

interface TasksState {
  tasks: Task[];
  loading: boolean;
  setTasks: (tasks: Task[]) => void;
  setLoading: (v: boolean) => void;
}

export const useTasksStore = create<TasksState>((set) => ({
  tasks: [],
  loading: false,
  setTasks: (tasks) => set({ tasks }),
  setLoading: (loading) => set({ loading }),
}));
