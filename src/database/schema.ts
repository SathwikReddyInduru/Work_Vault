// src/database/schema.ts
// Complete SQLite schema for WorkVault

export const CREATE_WEBSITES_TABLE = `
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

export const CREATE_APPLICATIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT,
    username TEXT,
    password TEXT,
    network_name TEXT,
    environment TEXT DEFAULT 'production',
    notes TEXT,
    is_favorite INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )
`;

export const CREATE_LINKS_TABLE = `
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

export const CREATE_NOTES_TABLE = `
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

export const CREATE_TASKS_TABLE = `
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

export const CREATE_SETTINGS_TABLE = `
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
  )
`;

export const CREATE_DB_CONNECTIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS db_connections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'direct',
    user_schema TEXT NOT NULL,
    password TEXT,
    host TEXT,
    port INTEGER,
    service_name TEXT,
    tns_alias TEXT,
    notes TEXT,
    is_favorite INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )
`;

export const CREATE_UPDATED_AT_TRIGGER = (tableName: string) => `
  CREATE TRIGGER IF NOT EXISTS update_${tableName}_updated_at
  AFTER UPDATE ON ${tableName}
  BEGIN
    UPDATE ${tableName} SET updated_at = datetime('now') WHERE id = NEW.id;
  END
`;

export const ALL_TABLES = [
  CREATE_WEBSITES_TABLE,
  CREATE_APPLICATIONS_TABLE,
  CREATE_LINKS_TABLE,
  CREATE_NOTES_TABLE,
  CREATE_TASKS_TABLE,
  CREATE_SETTINGS_TABLE,
  CREATE_DB_CONNECTIONS_TABLE,
];

export const ALL_TRIGGERS = [
  'websites',
  'applications',
  'links',
  'notes',
  'tasks',
  'db_connections',
].map(CREATE_UPDATED_AT_TRIGGER);

export const DEFAULT_SETTINGS = [
  { key: 'theme', value: 'dark' },
  { key: 'encryption_enabled', value: 'true' },
  { key: 'app_version', value: '1.0.0' },
];