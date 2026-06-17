// electron/main.ts
// Electron main process — entry point for WorkVault

import { app, BrowserWindow, shell, ipcMain } from 'electron';
import path from 'path';
import { initializeDatabase, closeDatabase } from '../src/database/connection';
import { runMigrations } from '../src/database/migrations';
import { registerWebsiteHandlers } from './ipc/websites.ipc';
import { registerApplicationHandlers } from './ipc/applications.ipc';
import { registerLinkHandlers } from './ipc/links.ipc';
import { registerNoteHandlers } from './ipc/notes.ipc';
import { registerTaskHandlers } from './ipc/tasks.ipc';
import { registerSettingsHandlers } from './ipc/settings.ipc';
import { registerDashboardHandlers } from './ipc/dashboard.ipc';
import { registerUtilityHandlers } from './ipc/utility.ipc';
import { registerDbConnectionHandlers } from './ipc/dbconnections.ipc';

const isDev = !app.isPackaged;

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 640,
    show: false,
    frame: true,
    backgroundColor: '#0f172a',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,       // ✅ Security: isolate renderer context
      nodeIntegration: false,        // ✅ Security: no Node in renderer
      sandbox: false,                // needed for preload to use Node APIs
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
    icon: path.join(__dirname, '../public/icon.png'),
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Show window once ready to avoid flash
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });

  // Open external links in default browser, not Electron
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function registerAllIPCHandlers(): void {
  registerWebsiteHandlers();
  registerApplicationHandlers();
  registerLinkHandlers();
  registerNoteHandlers();
  registerTaskHandlers();
  registerSettingsHandlers();
  registerDashboardHandlers();
  registerUtilityHandlers();
  registerDbConnectionHandlers();
}

// ── App lifecycle ─────────────────────────────────────────────────────────────

app.whenReady().then(() => {
  try {
    // Init DB first
    const db = initializeDatabase();
    runMigrations(db);
    console.log('[WorkVault] Database ready.');
  } catch (err) {
    console.error('[WorkVault] Failed to initialize database:', err);
    app.quit();
    return;
  }

  // Register all IPC handlers before creating window
  registerAllIPCHandlers();

  createWindow();

  app.on('activate', () => {
    // macOS: re-create window if dock icon clicked and no windows open
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  closeDatabase();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  closeDatabase();
});

// ── Security: block navigation to external URLs ───────────────────────────────
app.on('web-contents-created', (_event, contents) => {
  contents.on('will-navigate', (event, url) => {
    const allowedOrigins = ['http://localhost:5173', `file://`];
    const isAllowed = allowedOrigins.some((origin) => url.startsWith(origin));
    if (!isAllowed) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
});