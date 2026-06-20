// src/types/electron.types.ts
// Types for safe IPC communication between Electron main and React renderer

import type { Application, CreateApplicationInput, UpdateApplicationInput } from './application.types';
import type { CreateDbConnectionInput, DbConnection, UpdateDbConnectionInput } from './dbconnection.types';
import type { CreateLinkInput, QuickLink, UpdateLinkInput } from './link.types';
import type { CreateNoteInput, Note, UpdateNoteInput } from './note.types';
import type { CreateTaskInput, Task, TaskStatus, UpdateTaskInput } from './task.types';
import type { CreateWebsiteInput, UpdateWebsiteInput, Website } from './website.types';

// Generic IPC response wrapper
export interface IPCResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Dashboard stats returned to renderer
export interface DashboardStats {
  totalWebsites: number;
  totalApplications: number;
  totalLinks: number;
  totalNotes: number;
  totalTasks: number;
  pendingTasks: number;
  totalDbConnections: number;
  recentWebsites: Website[];
  recentApplications: Application[];
  recentNotes: Note[];
  recentLinks: QuickLink[];
  recentDbConnections: DbConnection[];
  favoritesWebsites: Website[];
  favoritesLinks: QuickLink[];
  favoritesApplications: Application[];
  favoritesDbConnections: DbConnection[];
}

// Database info for settings page
export interface DatabaseInfo {
  path: string;
  size: number;
  sizeFormatted: string;
  exists: boolean;
  lastModified: string | null;
}

// Import result summary
export interface ImportResult {
  imported: Record<string, number>;
  errors: string[];
}

// The full IPC API exposed on window.electronAPI
export interface ElectronAPI {
  // ── Login ──────────────────────────────────────────────────────────────
  authHasPin: () => Promise<boolean>;
  authVerifyPin: (pin: string) => Promise<boolean>;
  authSetPin: (pin: string) => Promise<boolean>;
  authRemovePin: () => Promise<boolean>;

  // ── Websites ──────────────────────────────────────────────────────────────
  getWebsites: () => Promise<IPCResponse<Website[]>>;
  getWebsite: (id: number) => Promise<IPCResponse<Website>>;
  searchWebsites: (query: string) => Promise<IPCResponse<Website[]>>;
  createWebsite: (data: CreateWebsiteInput) => Promise<IPCResponse<Website>>;
  updateWebsite: (data: UpdateWebsiteInput) => Promise<IPCResponse<Website>>;
  deleteWebsite: (id: number) => Promise<IPCResponse<boolean>>;
  toggleWebsiteFavorite: (id: number) => Promise<IPCResponse<Website>>;

  // ── Applications ──────────────────────────────────────────────────────────
  getApplications: () => Promise<IPCResponse<Application[]>>;
  getApplication: (id: number) => Promise<IPCResponse<Application>>;
  searchApplications: (query: string) => Promise<IPCResponse<Application[]>>;
  createApplication: (data: CreateApplicationInput) => Promise<IPCResponse<Application>>;
  updateApplication: (data: UpdateApplicationInput) => Promise<IPCResponse<Application>>;
  deleteApplication: (id: number) => Promise<IPCResponse<boolean>>;
  toggleApplicationFavorite: (id: number) => Promise<IPCResponse<Application>>;

  // ── Quick Links ───────────────────────────────────────────────────────────
  getLinks: () => Promise<IPCResponse<QuickLink[]>>;
  getLink: (id: number) => Promise<IPCResponse<QuickLink>>;
  searchLinks: (query: string) => Promise<IPCResponse<QuickLink[]>>;
  createLink: (data: CreateLinkInput) => Promise<IPCResponse<QuickLink>>;
  updateLink: (data: UpdateLinkInput) => Promise<IPCResponse<QuickLink>>;
  deleteLink: (id: number) => Promise<IPCResponse<boolean>>;
  toggleLinkFavorite: (id: number) => Promise<IPCResponse<QuickLink>>;

  // ── Notes ────────────────────────────────────────────────────────────────
  getNotes: () => Promise<IPCResponse<Note[]>>;
  getNote: (id: number) => Promise<IPCResponse<Note>>;
  searchNotes: (query: string) => Promise<IPCResponse<Note[]>>;
  createNote: (data: CreateNoteInput) => Promise<IPCResponse<Note>>;
  updateNote: (data: UpdateNoteInput) => Promise<IPCResponse<Note>>;
  deleteNote: (id: number) => Promise<IPCResponse<boolean>>;
  toggleNotePin: (id: number) => Promise<IPCResponse<Note>>;

  // ── Tasks ────────────────────────────────────────────────────────────────
  getTasks: () => Promise<IPCResponse<Task[]>>;
  getTask: (id: number) => Promise<IPCResponse<Task>>;
  searchTasks: (query: string) => Promise<IPCResponse<Task[]>>;
  createTask: (data: CreateTaskInput) => Promise<IPCResponse<Task>>;
  updateTask: (data: UpdateTaskInput) => Promise<IPCResponse<Task>>;
  deleteTask: (id: number) => Promise<IPCResponse<boolean>>;
  updateTaskStatus: (id: number, status: TaskStatus) => Promise<IPCResponse<Task>>;

  // ── Dashboard ─────────────────────────────────────────────────────────────
  getDashboardStats: () => Promise<IPCResponse<DashboardStats>>;

  // ── Settings & Utilities ──────────────────────────────────────────────────
  getSetting: (key: string) => Promise<IPCResponse<string>>;
  setSetting: (key: string, value: string) => Promise<IPCResponse<boolean>>;
  getDatabaseInfo: () => Promise<IPCResponse<DatabaseInfo>>;
  backupDatabase: (destinationPath: string) => Promise<IPCResponse<string>>;
  restoreDatabase: (sourcePath: string) => Promise<IPCResponse<boolean>>;
  exportToJSON: (destinationPath: string) => Promise<IPCResponse<string>>;
  importFromJSON: (sourcePath: string) => Promise<IPCResponse<ImportResult>>;
  openExternal: (url: string) => Promise<IPCResponse<boolean>>;
  showSaveDialog: (options: SaveDialogOptions) => Promise<IPCResponse<string | null>>;
  showOpenDialog: (options: OpenDialogOptions) => Promise<IPCResponse<string | null>>;

  // ── Crypto / Tools ────────────────────────────────────────────────────────
  generatePassword: (options: PasswordOptions) => Promise<IPCResponse<string>>;
  generateUUID: () => Promise<IPCResponse<string>>;

  // ── DB Connections ────────────────────────────────────────────────────────
  getDbConnections: () => Promise<IPCResponse<DbConnection[]>>;
  getDbConnection: (id: number) => Promise<IPCResponse<DbConnection>>;
  searchDbConnections: (query: string) => Promise<IPCResponse<DbConnection[]>>;
  createDbConnection: (data: CreateDbConnectionInput) => Promise<IPCResponse<DbConnection>>;
  updateDbConnection: (data: UpdateDbConnectionInput) => Promise<IPCResponse<DbConnection>>;
  deleteDbConnection: (id: number) => Promise<IPCResponse<boolean>>;
  toggleDbConnectionFavorite: (id: number) => Promise<IPCResponse<DbConnection>>;
}

export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

export interface SaveDialogOptions {
  title?: string;
  defaultPath?: string;
  filters?: { name: string; extensions: string[] }[];
}

export interface OpenDialogOptions {
  title?: string;
  filters?: { name: string; extensions: string[] }[];
  properties?: string[];
}

// Augment the global Window interface so TypeScript knows about window.electronAPI
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}