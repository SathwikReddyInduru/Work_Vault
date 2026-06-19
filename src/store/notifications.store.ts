// src/store/notifications.store.ts
//
// Central notification store. This is the ONLY source of truth for:
//   1. What shows in the bell dropdown (TopBar)
//   2. Which sidebar items get a red dot (Sidebar)
//
// Dismissed IDs are kept in a session-only Set (memory, no DB/localStorage).
// refreshNotifications() always recomputes from live data but skips any ID
// the user has dismissed. On app restart dismissed IDs reset — intentional,
// since the user should re-evaluate unresolved tasks on a new session.

import { create } from 'zustand';

export type NotificationSeverity = 'critical' | 'warning' | 'info';

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  route: string;
  severity: NotificationSeverity;
  createdAt: string;
}

interface NotificationsState {
  notifications: AppNotification[];
  dismissedIds: Set<string>;
  setNotifications: (notifications: AppNotification[]) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  hasNotificationForRoute: (route: string) => boolean;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  dismissedIds: new Set(),

  setNotifications: (notifications) => set({ notifications }),

  dismiss: (id) =>
    set((s) => {
      const dismissedIds = new Set(s.dismissedIds);
      dismissedIds.add(id);
      return {
        dismissedIds,
        notifications: s.notifications.filter((n) => n.id !== id),
      };
    }),

  dismissAll: () =>
    set((s) => {
      const dismissedIds = new Set(s.dismissedIds);
      s.notifications.forEach((n) => dismissedIds.add(n.id));
      return { dismissedIds, notifications: [] };
    }),

  hasNotificationForRoute: (route) => {
    const { notifications } = get();
    return notifications.some(
      (n) => n.route === route || (route !== '/' && n.route.startsWith(route))
    );
  },
}));

// ── Individual notification computers ────────────────────────────────────────

interface ComputeAuthNotificationsInput {
  hasPin: boolean;
}

function computeAuthNotifications({ hasPin }: ComputeAuthNotificationsInput): AppNotification[] {
  if (hasPin) return [];
  return [
    {
      id: 'auth:no-pin',
      title: 'Set up a PIN',
      description: 'Protect your credentials with a PIN lock.',
      route: '/settings',
      severity: 'warning',
      createdAt: new Date(0).toISOString(),
    },
  ];
}

interface TaskLike {
  id: number;
  name: string;
  due_date: string | null;
  status: string;
}

interface ComputeTaskNotificationsInput {
  tasks: TaskLike[];
}

function computeTaskNotifications({ tasks }: ComputeTaskNotificationsInput): AppNotification[] {
  const now = Date.now();
  const notifications: AppNotification[] = [];

  for (const task of tasks) {
    if (!task.due_date || task.status === 'done') continue;

    const dueDateStr = task.due_date.length === 10
      ? `${task.due_date}T23:59:59`
      : task.due_date;

    const dueTime = new Date(dueDateStr).getTime();
    if (Number.isNaN(dueTime)) continue;

    const isOverdue = dueTime < now;
    const isDueSoon = !isOverdue && dueTime - now < 24 * 60 * 60 * 1000;

    if (isOverdue) {
      notifications.push({
        id: `task:overdue:${task.id}`,
        title: 'Task overdue',
        description: `"${task.name}" was due ${new Date(dueDateStr).toLocaleDateString()}.`,
        route: '/tasks',
        severity: 'critical',
        createdAt: task.due_date,
      });
    } else if (isDueSoon) {
      notifications.push({
        id: `task:due-soon:${task.id}`,
        title: 'Task due soon',
        description: `"${task.name}" is due ${new Date(dueDateStr).toLocaleDateString()}.`,
        route: '/tasks',
        severity: 'warning',
        createdAt: task.due_date,
      });
    }
  }

  return notifications;
}

// ── Public refresh function ──────────────────────────────────────────────────

interface RefreshNotificationsInput {
  hasPin: boolean;
  tasks?: TaskLike[];
}

export function refreshNotifications(input: RefreshNotificationsInput): void {
  const { dismissedIds } = useNotificationsStore.getState();

  const all: AppNotification[] = [
    ...computeAuthNotifications({ hasPin: input.hasPin }),
    ...computeTaskNotifications({ tasks: input.tasks ?? [] }),
  ].filter((n) => !dismissedIds.has(n.id));  // ← skip dismissed

  const severityRank: Record<NotificationSeverity, number> = { critical: 0, warning: 1, info: 2 };
  all.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);

  useNotificationsStore.getState().setNotifications(all);
}
