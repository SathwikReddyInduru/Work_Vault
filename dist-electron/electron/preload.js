"use strict";
const electron = require("electron");
function invoke(channel, ...args) {
  return electron.ipcRenderer.invoke(channel, ...args);
}
const api = {
  // ── Websites ──────────────────────────────────────────────────────────────
  getWebsites: () => invoke("websites:getAll"),
  getWebsite: (id) => invoke("websites:getById", id),
  searchWebsites: (query) => invoke("websites:search", query),
  createWebsite: (data) => invoke("websites:create", data),
  updateWebsite: (data) => invoke("websites:update", data),
  deleteWebsite: (id) => invoke("websites:delete", id),
  toggleWebsiteFavorite: (id) => invoke("websites:toggleFavorite", id),
  // ── Applications ──────────────────────────────────────────────────────────
  getApplications: () => invoke("applications:getAll"),
  getApplication: (id) => invoke("applications:getById", id),
  searchApplications: (query) => invoke("applications:search", query),
  createApplication: (data) => invoke("applications:create", data),
  updateApplication: (data) => invoke("applications:update", data),
  deleteApplication: (id) => invoke("applications:delete", id),
  toggleApplicationFavorite: (id) => invoke("applications:toggleFavorite", id),
  // ── Quick Links ───────────────────────────────────────────────────────────
  getLinks: () => invoke("links:getAll"),
  getLink: (id) => invoke("links:getById", id),
  searchLinks: (query) => invoke("links:search", query),
  createLink: (data) => invoke("links:create", data),
  updateLink: (data) => invoke("links:update", data),
  deleteLink: (id) => invoke("links:delete", id),
  toggleLinkFavorite: (id) => invoke("links:toggleFavorite", id),
  // ── Notes ─────────────────────────────────────────────────────────────────
  getNotes: () => invoke("notes:getAll"),
  getNote: (id) => invoke("notes:getById", id),
  searchNotes: (query) => invoke("notes:search", query),
  createNote: (data) => invoke("notes:create", data),
  updateNote: (data) => invoke("notes:update", data),
  deleteNote: (id) => invoke("notes:delete", id),
  toggleNotePin: (id) => invoke("notes:togglePin", id),
  // ── Tasks ─────────────────────────────────────────────────────────────────
  getTasks: () => invoke("tasks:getAll"),
  getTask: (id) => invoke("tasks:getById", id),
  searchTasks: (query) => invoke("tasks:search", query),
  createTask: (data) => invoke("tasks:create", data),
  updateTask: (data) => invoke("tasks:update", data),
  deleteTask: (id) => invoke("tasks:delete", id),
  updateTaskStatus: (id, status) => invoke("tasks:updateStatus", id, status),
  // ── Dashboard ─────────────────────────────────────────────────────────────
  getDashboardStats: () => invoke("dashboard:getStats"),
  // ── Settings & Backup ─────────────────────────────────────────────────────
  getSetting: (key) => invoke("settings:get", key),
  setSetting: (key, value) => invoke("settings:set", key, value),
  getDatabaseInfo: () => invoke("settings:getDatabaseInfo"),
  backupDatabase: (destinationPath) => invoke("settings:backupDatabase", destinationPath),
  restoreDatabase: (sourcePath) => invoke("settings:restoreDatabase", sourcePath),
  exportToJSON: (destinationPath) => invoke("settings:exportJSON", destinationPath),
  importFromJSON: (sourcePath) => invoke("settings:importJSON", sourcePath),
  // ── Shell / Dialog ────────────────────────────────────────────────────────
  openExternal: (url) => invoke("utility:openExternal", url),
  showSaveDialog: (options) => invoke("utility:showSaveDialog", options),
  showOpenDialog: (options) => invoke("utility:showOpenDialog", options),
  // ── Crypto / Tools ────────────────────────────────────────────────────────
  generatePassword: (options) => invoke("utility:generatePassword", options),
  generateUUID: () => invoke("utility:generateUUID"),
  // ── DB Connections ────────────────────────────────────────────────────────
  getDbConnections: () => invoke("dbconnections:getAll"),
  getDbConnection: (id) => invoke("dbconnections:getById", id),
  searchDbConnections: (query) => invoke("dbconnections:search", query),
  createDbConnection: (data) => invoke("dbconnections:create", data),
  updateDbConnection: (data) => invoke("dbconnections:update", data),
  deleteDbConnection: (id) => invoke("dbconnections:delete", id),
  toggleDbConnectionFavorite: (id) => invoke("dbconnections:toggleFavorite", id),
  // ── Auth ──────────────────────────────────────────────────────────────────
  authHasPin: () => invoke("auth:hasPin").then((r) => r.data ?? false),
  authVerifyPin: (pin) => invoke("auth:verifyPin", pin).then((r) => r.data === true),
  authSetPin: (pin) => invoke("auth:setPin", pin).then((r) => r.data === true),
  authRemovePin: () => invoke("auth:removePin").then((r) => r.data === true)
};
electron.contextBridge.exposeInMainWorld("electronAPI", api);
//# sourceMappingURL=preload.js.map
