// electron/preload.ts
// Preload script — runs in a privileged context with access to Node APIs.
// Exposes a typed, minimal API surface to the renderer via contextBridge.
// Never expose ipcRenderer directly — only named, validated channels.

import { contextBridge, ipcRenderer } from 'electron';
import type { ElectronAPI } from '../src/types/electron.types';

// Helper to invoke a channel and return the result
function invoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  return ipcRenderer.invoke(channel, ...args);
}

const api: ElectronAPI = {
  // ── Websites ──────────────────────────────────────────────────────────────
  getWebsites: () => invoke('websites:getAll'),
  getWebsite: (id) => invoke('websites:getById', id),
  searchWebsites: (query) => invoke('websites:search', query),
  createWebsite: (data) => invoke('websites:create', data),
  updateWebsite: (data) => invoke('websites:update', data),
  deleteWebsite: (id) => invoke('websites:delete', id),
  toggleWebsiteFavorite: (id) => invoke('websites:toggleFavorite', id),

  // ── Applications ──────────────────────────────────────────────────────────
  getApplications: () => invoke('applications:getAll'),
  getApplication: (id) => invoke('applications:getById', id),
  searchApplications: (query) => invoke('applications:search', query),
  createApplication: (data) => invoke('applications:create', data),
  updateApplication: (data) => invoke('applications:update', data),
  deleteApplication: (id) => invoke('applications:delete', id),
  toggleApplicationFavorite: (id) => invoke('applications:toggleFavorite', id),

  // ── Quick Links ───────────────────────────────────────────────────────────
  getLinks: () => invoke('links:getAll'),
  getLink: (id) => invoke('links:getById', id),
  searchLinks: (query) => invoke('links:search', query),
  createLink: (data) => invoke('links:create', data),
  updateLink: (data) => invoke('links:update', data),
  deleteLink: (id) => invoke('links:delete', id),
  toggleLinkFavorite: (id) => invoke('links:toggleFavorite', id),

  // ── Notes ─────────────────────────────────────────────────────────────────
  getNotes: () => invoke('notes:getAll'),
  getNote: (id) => invoke('notes:getById', id),
  searchNotes: (query) => invoke('notes:search', query),
  createNote: (data) => invoke('notes:create', data),
  updateNote: (data) => invoke('notes:update', data),
  deleteNote: (id) => invoke('notes:delete', id),
  toggleNotePin: (id) => invoke('notes:togglePin', id),

  // ── Tasks ─────────────────────────────────────────────────────────────────
  getTasks: () => invoke('tasks:getAll'),
  getTask: (id) => invoke('tasks:getById', id),
  searchTasks: (query) => invoke('tasks:search', query),
  createTask: (data) => invoke('tasks:create', data),
  updateTask: (data) => invoke('tasks:update', data),
  deleteTask: (id) => invoke('tasks:delete', id),
  updateTaskStatus: (id, status) => invoke('tasks:updateStatus', id, status),

  // ── Dashboard ─────────────────────────────────────────────────────────────
  getDashboardStats: () => invoke('dashboard:getStats'),

  // ── Settings & Backup ─────────────────────────────────────────────────────
  getSetting: (key) => invoke('settings:get', key),
  setSetting: (key, value) => invoke('settings:set', key, value),
  getDatabaseInfo: () => invoke('settings:getDatabaseInfo'),
  backupDatabase: (destinationPath) => invoke('settings:backupDatabase', destinationPath),
  restoreDatabase: (sourcePath) => invoke('settings:restoreDatabase', sourcePath),
  exportToJSON: (destinationPath) => invoke('settings:exportJSON', destinationPath),
  importFromJSON: (sourcePath) => invoke('settings:importJSON', sourcePath),

  // ── Shell / Dialog ────────────────────────────────────────────────────────
  openExternal: (url) => invoke('utility:openExternal', url),
  showSaveDialog: (options) => invoke('utility:showSaveDialog', options),
  showOpenDialog: (options) => invoke('utility:showOpenDialog', options),

  // ── Crypto / Tools ────────────────────────────────────────────────────────
  generatePassword: (options) => invoke('utility:generatePassword', options),
  generateUUID: () => invoke('utility:generateUUID'),
};

// Expose only `electronAPI` — nothing else from Node/Electron world
contextBridge.exposeInMainWorld('electronAPI', api);
