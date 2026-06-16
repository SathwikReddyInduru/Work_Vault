// src/database/connection.ts
// SQLite connection manager for Electron main process

import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import { ALL_TABLES, ALL_TRIGGERS, DEFAULT_SETTINGS } from './schema';

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

export function initializeDatabase(): Database.Database {
  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'workvault.db');

  db = new Database(dbPath);

  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('synchronous = NORMAL');

  // Create all tables
  for (const tableSQL of ALL_TABLES) {
    db.exec(tableSQL);
  }

  // Create update triggers
  for (const triggerSQL of ALL_TRIGGERS) {
    db.exec(triggerSQL);
  }

  // Seed default settings if not present
  const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)
  `);

  for (const setting of DEFAULT_SETTINGS) {
    insertSetting.run(setting.key, setting.value);
  }

  console.log(`[WorkVault] Database initialized at: ${dbPath}`);
  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    console.log('[WorkVault] Database connection closed.');
  }
}

export function getDatabasePath(): string {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'workvault.db');
}
