// electron/ipc/index.ts
// Barrel export for all IPC handler registrars

export { registerWebsiteHandlers } from './websites.ipc';
export { registerApplicationHandlers } from './applications.ipc';
export { registerLinkHandlers } from './links.ipc';
export { registerNoteHandlers } from './notes.ipc';
export { registerTaskHandlers } from './tasks.ipc';
export { registerSettingsHandlers } from './settings.ipc';
export { registerDashboardHandlers } from './dashboard.ipc';
export { registerUtilityHandlers } from './utility.ipc';
export { registerDbConnectionHandlers } from './dbconnections.ipc';