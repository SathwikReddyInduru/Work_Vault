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
      // Handled by schema.ts on first run
      console.log('[Migration v1] Initial schema already applied via schema.ts');
    },
  },
  // Future migrations go here:
  // {
  //   version: 2,
  //   description: 'Add new column to websites',
  //   up: (db) => {
  //     db.exec(`ALTER TABLE websites ADD COLUMN icon_url TEXT`);
  //   },
  // },
];

export function runMigrations(db: Database.Database): void {
  // Create migrations tracking table
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
