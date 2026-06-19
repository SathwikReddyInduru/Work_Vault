// src/hooks/useNotificationsSync.ts
//
// Mounts once near the app root (inside AppLayout). Watches the pieces of
// app state that notifications depend on, and recomputes the central
// notification list whenever they change.
//
// useTasks() now writes to the shared useTasksStore on every fetch, so any
// task mutation on the Tasks page updates the store, which triggers a re-render
// here and causes refreshNotifications() to run with the latest data.

import { useAuth } from '@/contexts/AuthContext';
import { useTasks } from '@/hooks/useTasks';
import { refreshNotifications } from '@/store/notifications.store';
import { useEffect } from 'react';

export function useNotificationsSync(): void {
  const { hasPin } = useAuth();
  const { tasks } = useTasks();

  useEffect(() => {
    refreshNotifications({ hasPin, tasks });
  }, [hasPin, tasks]);
}
