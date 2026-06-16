"use strict";
// electron/main.ts
// Electron main process — entry point for WorkVault
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const connection_1 = require("../src/database/connection");
const migrations_1 = require("../src/database/migrations");
const websites_ipc_1 = require("./ipc/websites.ipc");
const applications_ipc_1 = require("./ipc/applications.ipc");
const links_ipc_1 = require("./ipc/links.ipc");
const notes_ipc_1 = require("./ipc/notes.ipc");
const tasks_ipc_1 = require("./ipc/tasks.ipc");
const settings_ipc_1 = require("./ipc/settings.ipc");
const dashboard_ipc_1 = require("./ipc/dashboard.ipc");
const utility_ipc_1 = require("./ipc/utility.ipc");
const isDev = !electron_1.app.isPackaged;
let mainWindow = null;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 1024,
        minHeight: 640,
        show: false,
        frame: true,
        backgroundColor: '#0f172a',
        titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
            contextIsolation: true, // ✅ Security: isolate renderer context
            nodeIntegration: false, // ✅ Security: no Node in renderer
            sandbox: false, // needed for preload to use Node APIs
            webSecurity: true,
            allowRunningInsecureContent: false,
        },
        icon: path_1.default.join(__dirname, '../public/icon.png'),
    });
    // Load the app
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadFile(path_1.default.join(__dirname, '../dist/index.html'));
    }
    // Show window once ready to avoid flash
    mainWindow.once('ready-to-show', () => {
        mainWindow?.show();
        mainWindow?.focus();
    });
    // Open external links in default browser, not Electron
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        electron_1.shell.openExternal(url);
        return { action: 'deny' };
    });
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
function registerAllIPCHandlers() {
    (0, websites_ipc_1.registerWebsiteHandlers)();
    (0, applications_ipc_1.registerApplicationHandlers)();
    (0, links_ipc_1.registerLinkHandlers)();
    (0, notes_ipc_1.registerNoteHandlers)();
    (0, tasks_ipc_1.registerTaskHandlers)();
    (0, settings_ipc_1.registerSettingsHandlers)();
    (0, dashboard_ipc_1.registerDashboardHandlers)();
    (0, utility_ipc_1.registerUtilityHandlers)();
}
// ── App lifecycle ─────────────────────────────────────────────────────────────
electron_1.app.whenReady().then(() => {
    try {
        // Init DB first
        const db = (0, connection_1.initializeDatabase)();
        (0, migrations_1.runMigrations)(db);
        console.log('[WorkVault] Database ready.');
    }
    catch (err) {
        console.error('[WorkVault] Failed to initialize database:', err);
        electron_1.app.quit();
        return;
    }
    // Register all IPC handlers before creating window
    registerAllIPCHandlers();
    createWindow();
    electron_1.app.on('activate', () => {
        // macOS: re-create window if dock icon clicked and no windows open
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    (0, connection_1.closeDatabase)();
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('before-quit', () => {
    (0, connection_1.closeDatabase)();
});
// ── Security: block navigation to external URLs ───────────────────────────────
electron_1.app.on('web-contents-created', (_event, contents) => {
    contents.on('will-navigate', (event, url) => {
        const allowedOrigins = ['http://localhost:5173', `file://`];
        const isAllowed = allowedOrigins.some((origin) => url.startsWith(origin));
        if (!isAllowed) {
            event.preventDefault();
            electron_1.shell.openExternal(url);
        }
    });
});
//# sourceMappingURL=main.js.map