// src/store/notifications.store.ts
//
// Central notification store. This is the ONLY source of truth for:
//   1. What shows in the bell dropdown (TopBar)
//   2. Which sidebar items get a red dot (Sidebar)
//
// To add a new notification type in the future (weak passwords, untested
// DB connections, expired certs, etc.) — add a `compute*` function below
// and call it inside `refreshNotifications()`. Nothing in TopBar.tsx or
// Sidebar.tsx needs to change.

import { create } from 'zustand';

export type NotificationSeverity = 'critical' | 'warning' | 'info';

export interface AppNotification {
  id: string;            // stable, unique per notification instance
  title: string;
  description: string;
  route: string;         // which page this notification should navigate to
  severity: NotificationSeverity;
  createdAt: string;     // ISO timestamp, used for sorting
}

interface NotificationsState {
  notifications: AppNotification[];
  setNotifications: (notifications: AppNotification[]) => void;
  dismiss: (id: string) => void;
  /** Does any notification target this exact route or a route nested under it? */
  hasNotificationForRoute: (route: string) => boolean;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],

  setNotifications: (notifications) => set({ notifications }),

  dismiss: (id) =>
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),

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
  name: string;          // ← fixed: was "title", Task type uses "name"
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

    // Append T23:59:59 so a date-only string like "2026-06-19" is treated as
    // end-of-day in local time, not midnight UTC (which would be 5:30 AM IST
    // and look "overdue" the moment you open the app on the same day).
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
  const all: AppNotification[] = [
    ...computeAuthNotifications({ hasPin: input.hasPin }),
    ...computeTaskNotifications({ tasks: input.tasks ?? [] }),
  ];

  const severityRank: Record<NotificationSeverity, number> = { critical: 0, warning: 1, info: 2 };
  all.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);

  useNotificationsStore.getState().setNotifications(all);
}
