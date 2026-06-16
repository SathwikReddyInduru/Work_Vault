"use strict";
// src/database/migrations.ts
// Database migrations system for WorkVault
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigrations = runMigrations;
const migrations = [
    {
        version: 1,
        description: 'Initial schema - all core tables',
        up: (_db) => {
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
function runMigrations(db) {
    // Create migrations tracking table
    db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      version INTEGER PRIMARY KEY,
      description TEXT NOT NULL,
      applied_at TEXT DEFAULT (datetime('now'))
    )
  `);
    const getApplied = db.prepare('SELECT version FROM migrations WHERE version = ?');
    const markApplied = db.prepare('INSERT INTO migrations (version, description) VALUES (?, ?)');
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
//# sourceMappingURL=migrations.js.map