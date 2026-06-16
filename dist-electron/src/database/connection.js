"use strict";
// src/database/connection.ts
// SQLite connection manager for Electron main process
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabase = getDatabase;
exports.initializeDatabase = initializeDatabase;
exports.closeDatabase = closeDatabase;
exports.getDatabasePath = getDatabasePath;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
const schema_1 = require("./schema");
let db = null;
function getDatabase() {
    if (!db) {
        throw new Error('Database not initialized. Call initializeDatabase() first.');
    }
    return db;
}
function initializeDatabase() {
    const userDataPath = electron_1.app.getPath('userData');
    const dbPath = path_1.default.join(userDataPath, 'workvault.db');
    db = new better_sqlite3_1.default(dbPath);
    // Enable WAL mode for better performance
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.pragma('synchronous = NORMAL');
    // Create all tables
    for (const tableSQL of schema_1.ALL_TABLES) {
        db.exec(tableSQL);
    }
    // Create update triggers
    for (const triggerSQL of schema_1.ALL_TRIGGERS) {
        db.exec(triggerSQL);
    }
    // Seed default settings if not present
    const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)
  `);
    for (const setting of schema_1.DEFAULT_SETTINGS) {
        insertSetting.run(setting.key, setting.value);
    }
    console.log(`[WorkVault] Database initialized at: ${dbPath}`);
    return db;
}
function closeDatabase() {
    if (db) {
        db.close();
        db = null;
        console.log('[WorkVault] Database connection closed.');
    }
}
function getDatabasePath() {
    const userDataPath = electron_1.app.getPath('userData');
    return path_1.default.join(userDataPath, 'workvault.db');
}
//# sourceMappingURL=connection.js.map