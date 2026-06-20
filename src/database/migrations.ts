// src/database/migrations.ts
// Database migrations system for WorkVault

import Database from 'better-sqlite3';

interface Migration {
  version: number;
  description: string;
  up: (db: Database.Database) => void;
}

const migrations: Migration[] = [
  {
    version: 1,
    description: 'Initial schema - all core tables',
    up: (_db: Database.Database) => {
      console.log('[Migration v1] Initial schema already applied via schema.ts');
    },
  },
  {
    version: 2,
    description: 'Add db_connections table',
    up: (db: Database.Database) => {
      db.exec(`
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
      `);
      db.exec(`
        CREATE TRIGGER IF NOT EXISTS update_db_connections_updated_at
        AFTER UPDATE ON db_connections
        BEGIN
          UPDATE db_connections SET updated_at = datetime('now') WHERE id = NEW.id;
        END
      `);
      console.log('[Migration v2] db_connections table created');
    },
  },
  {
    version: 3,
    description: 'Add icon column to links table',
    up: (db: Database.Database) => {
      db.exec(`ALTER TABLE links ADD COLUMN icon TEXT`);
      console.log('[Migration v3] icon column added to links');
    },
  },
  {
    version: 4,
    description: 'Add network_name column to applications table',
    up: (db: Database.Database) => {
      db.exec(`ALTER TABLE applications ADD COLUMN network_name TEXT`);
      console.log('[Migration v4] network_name column added to applications');
    },
  },
];

export function runMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      version INTEGER PRIMARY KEY,
      description TEXT NOT NULL,
      applied_at TEXT DEFAULT (datetime('now'))
    )
  `);

  const getApplied = db.prepare('SELECT version FROM migrations WHERE version = ?');
  const markApplied = db.prepare(
    'INSERT INTO migrations (version, description) VALUES (?, ?)'
  );

  for (const migration of migrations) {
    const applied = getApplied.get(migration.version);
    if (!applied) {
      console.log(`[WorkVault] Running migration v${migration.version}: ${migration.description}`);
      const runMigration = db.transaction(() => {
        migration.up(db);
        markApplied.run(migration.version, migration.description);
      });
      runMigration();
      console.log(`[WorkVault] Migration v${migration.version} applied successfully.`);
    }
  }
}