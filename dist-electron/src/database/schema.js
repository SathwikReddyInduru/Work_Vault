"use strict";
// src/database/schema.ts
// Complete SQLite schema for WorkVault
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SETTINGS = exports.ALL_TRIGGERS = exports.ALL_TABLES = exports.CREATE_UPDATED_AT_TRIGGER = exports.CREATE_SETTINGS_TABLE = exports.CREATE_TASKS_TABLE = exports.CREATE_NOTES_TABLE = exports.CREATE_LINKS_TABLE = exports.CREATE_APPLICATIONS_TABLE = exports.CREATE_WEBSITES_TABLE = void 0;
exports.CREATE_WEBSITES_TABLE = `
  CREATE TABLE IF NOT EXISTS websites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    username TEXT,
    email TEXT,
    password TEXT,
    notes TEXT,
    tags TEXT DEFAULT '[]',
    is_favorite INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )
`;
exports.CREATE_APPLICATIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT,
    username TEXT,
    password TEXT,
    environment TEXT DEFAULT 'production',
    notes TEXT,
    is_favorite INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )
`;
exports.CREATE_LINKS_TABLE = `
  CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    description TEXT,
    is_favorite INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )
`;
exports.CREATE_NOTES_TABLE = `
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    category TEXT DEFAULT 'General',
    tags TEXT DEFAULT '[]',
    is_pinned INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )
`;
exports.CREATE_TASKS_TABLE = `
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium',
    due_date TEXT,
    status TEXT DEFAULT 'todo',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )
`;
exports.CREATE_SETTINGS_TABLE = `
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
  )
`;
const CREATE_UPDATED_AT_TRIGGER = (tableName) => `
  CREATE TRIGGER IF NOT EXISTS update_${tableName}_updated_at
  AFTER UPDATE ON ${tableName}
  BEGIN
    UPDATE ${tableName} SET updated_at = datetime('now') WHERE id = NEW.id;
  END
`;
exports.CREATE_UPDATED_AT_TRIGGER = CREATE_UPDATED_AT_TRIGGER;
exports.ALL_TABLES = [
    exports.CREATE_WEBSITES_TABLE,
    exports.CREATE_APPLICATIONS_TABLE,
    exports.CREATE_LINKS_TABLE,
    exports.CREATE_NOTES_TABLE,
    exports.CREATE_TASKS_TABLE,
    exports.CREATE_SETTINGS_TABLE,
];
exports.ALL_TRIGGERS = [
    'websites',
    'applications',
    'links',
    'notes',
    'tasks',
].map(exports.CREATE_UPDATED_AT_TRIGGER);
exports.DEFAULT_SETTINGS = [
    { key: 'theme', value: 'dark' },
    { key: 'encryption_enabled', value: 'true' },
    { key: 'app_version', value: '1.0.0' },
];
//# sourceMappingURL=schema.js.map