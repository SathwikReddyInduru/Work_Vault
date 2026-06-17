// src/database/repositories/dbconnection.repository.ts

import { getDatabase } from '../connection';
import { EncryptionService } from '../../services/encryption.service';
import type { DbConnection, CreateDbConnectionInput, UpdateDbConnectionInput } from '../../types/dbconnection.types';

interface DbConnectionRow {
  id: number;
  name: string;
  type: string;
  user_schema: string;
  password: string | null;
  host: string | null;
  port: number | null;
  service_name: string | null;
  tns_alias: string | null;
  notes: string | null;
  is_favorite: number;
  created_at: string;
  updated_at: string;
}

function encryptField(value: string | undefined | null): string | null {
  if (value === undefined || value === null) return null;
  if (value === '') return '';
  return EncryptionService.encrypt(value);
}

function decryptField(value: string | undefined | null): string | null {
  if (!value) return null;
  return EncryptionService.decrypt(value);
}

function rowToConnection(row: DbConnectionRow): DbConnection {
  return {
    id: row.id,
    name: row.name,
    type: row.type as DbConnection['type'],
    user_schema: decryptField(row.user_schema) ?? row.user_schema,
    password: decryptField(row.password),
    host: row.host,
    port: row.port,
    service_name: row.service_name,
    tns_alias: row.tns_alias,
    notes: row.notes,
    is_favorite: row.is_favorite,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export const DbConnectionRepository = {
  findAll(): DbConnection[] {
    const db = getDatabase();
    const rows = db
      .prepare('SELECT * FROM db_connections ORDER BY is_favorite DESC, updated_at DESC')
      .all() as DbConnectionRow[];
    return rows.map(rowToConnection);
  },

  findById(id: number): DbConnection | null {
    const db = getDatabase();
    const row = db
      .prepare('SELECT * FROM db_connections WHERE id = ?')
      .get(id) as DbConnectionRow | undefined;
    if (!row) return null;
    return rowToConnection(row);
  },

  search(query: string): DbConnection[] {
    const db = getDatabase();
    const like = `%${query}%`;
    const rows = db
      .prepare(
        `SELECT * FROM db_connections
         WHERE name LIKE ? OR user_schema LIKE ? OR host LIKE ? OR service_name LIKE ?
         ORDER BY is_favorite DESC, updated_at DESC`
      )
      .all(like, like, like, like) as DbConnectionRow[];
    return rows.map(rowToConnection);
  },

  create(data: CreateDbConnectionInput): DbConnection | null {
    const db = getDatabase();
    const result = db
      .prepare(
        `INSERT INTO db_connections
          (name, type, user_schema, password, host, port, service_name, tns_alias, notes, is_favorite)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        data.name,
        data.type ?? 'direct',
        encryptField(data.user_schema) ?? data.user_schema,
        encryptField(data.password),
        data.host ?? null,
        data.port ?? null,
        data.service_name ?? null,
        data.tns_alias ?? null,
        data.notes ?? null,
        data.is_favorite ? 1 : 0
      );
    return this.findById(result.lastInsertRowid as number);
  },

  update(data: UpdateDbConnectionInput): DbConnection | null {
    const db = getDatabase();
    const existing = db
      .prepare('SELECT * FROM db_connections WHERE id = ?')
      .get(data.id) as DbConnectionRow | undefined;
    if (!existing) throw new Error(`DbConnection with id ${data.id} not found`);

    db.prepare(
      `UPDATE db_connections SET
        name = ?, type = ?, user_schema = ?, password = ?,
        host = ?, port = ?, service_name = ?, tns_alias = ?, notes = ?, is_favorite = ?
       WHERE id = ?`
    ).run(
      data.name ?? existing.name,
      data.type ?? existing.type,
      data.user_schema !== undefined ? encryptField(data.user_schema) : existing.user_schema,
      data.password !== undefined ? encryptField(data.password) : existing.password,
      data.host !== undefined ? data.host : existing.host,
      data.port !== undefined ? data.port : existing.port,
      data.service_name !== undefined ? data.service_name : existing.service_name,
      data.tns_alias !== undefined ? data.tns_alias : existing.tns_alias,
      data.notes !== undefined ? data.notes : existing.notes,
      data.is_favorite !== undefined ? (data.is_favorite ? 1 : 0) : existing.is_favorite,
      data.id
    );
    return this.findById(data.id);
  },

  toggleFavorite(id: number): DbConnection | null {
    const db = getDatabase();
    db.prepare(
      'UPDATE db_connections SET is_favorite = CASE WHEN is_favorite = 1 THEN 0 ELSE 1 END WHERE id = ?'
    ).run(id);
    return this.findById(id);
  },

  delete(id: number): boolean {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM db_connections WHERE id = ?').run(id);
    return result.changes > 0;
  },

  count(): number {
    const db = getDatabase();
    const row = db
      .prepare('SELECT COUNT(*) as count FROM db_connections')
      .get() as { count: number };
    return row.count;
  },
};