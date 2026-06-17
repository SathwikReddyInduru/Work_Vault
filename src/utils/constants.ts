// src/utils/constants.ts

export const APP_NAME = 'WorkVault';
export const APP_VERSION = '1.0.0';

// ── Navigation ───────────────────────────────────────────────────────────────
export const ROUTES = {
  DASHBOARD: '/',
  WEBSITES: '/websites',
  APPLICATIONS: '/applications',
  NOTES: '/notes',
  QUICK_LINKS: '/quick-links',
  TASKS: '/tasks',
  DB_CONNECTIONS: '/db-connections',
  TOOLS: '/tools',
  SETTINGS: '/settings',
} as const;

// ── Task enums ────────────────────────────────────────────────────────────────
export const TASK_PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
] as const;

export const TASK_STATUSES = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
] as const;

// ── Application environments ──────────────────────────────────────────────────
export const APP_ENVIRONMENTS = [
  { value: 'production', label: 'Production' },
  { value: 'staging', label: 'Staging' },
  { value: 'development', label: 'Development' },
  { value: 'testing', label: 'Testing' },
  { value: 'local', label: 'Local' },
] as const;

// ── Link categories ───────────────────────────────────────────────────────────
export const LINK_CATEGORIES = [
  'General',
  'Portal',
  'Documentation',
  'Dashboard',
  'Team',
  'Tool',
  'Reference',
  'Other',
] as const;

// ── Note categories ───────────────────────────────────────────────────────────
export const NOTE_CATEGORIES = [
  'General',
  'Technical',
  'Meeting',
  'Commands',
  'Troubleshooting',
  'Reference',
  'Ideas',
  'Other',
] as const;

// ── UI ────────────────────────────────────────────────────────────────────────
export const ITEMS_PER_PAGE = 20;
export const SEARCH_DEBOUNCE_MS = 300;
export const TOAST_DURATION_MS = 3000;
export const RECENT_ITEMS_COUNT = 5;

// ── Priority colours (Tailwind classes) ──────────────────────────────────────
export const PRIORITY_COLORS: Record<string, string> = {
  low: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  high: 'text-red-400 bg-red-400/10 border-red-400/20',
};

export const STATUS_COLORS: Record<string, string> = {
  todo: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
  in_progress: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  done: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
};

export const ENV_COLORS: Record<string, string> = {
  production: 'text-red-400 bg-red-400/10 border-red-400/20',
  staging: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  development: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  testing: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  local: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
};