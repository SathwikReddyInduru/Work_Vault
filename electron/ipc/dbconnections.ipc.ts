// electron/ipc/dbconnections.ipc.ts

import { handle } from './ipc.helper';
import { getDatabase } from '../../src/database/connection';
import { DbConnectionRepository } from '../../src/database/repositories/dbconnection.repository';
import type { CreateDbConnectionInput, UpdateDbConnectionInput } from '../../src/types/dbconnection.types';

function ensureTable(): void {
  const db = getDatabase();
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
}

export function registerDbConnectionHandlers(): void {
  ensureTable();

  handle('dbconnections:getAll', () => DbConnectionRepository.findAll());

  handle('dbconnections:getById', (id: unknown) =>
    DbConnectionRepository.findById(id as number)
  );

  handle('dbconnections:search', (query: unknown) =>
    DbConnectionRepository.search(query as string)
  );

  handle('dbconnections:create', (data: unknown) =>
    DbConnectionRepository.create(data as CreateDbConnectionInput)
  );

  handle('dbconnections:update', (data: unknown) =>
    DbConnectionRepository.update(data as UpdateDbConnectionInput)
  );

  handle('dbconnections:delete', (id: unknown) =>
    DbConnectionRepository.delete(id as number)
  );

  handle('dbconnections:toggleFavorite', (id: unknown) =>
    DbConnectionRepository.toggleFavorite(id as number)
  );
}