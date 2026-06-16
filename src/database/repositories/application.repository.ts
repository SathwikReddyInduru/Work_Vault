// src/database/repositories/application.repository.ts

import { getDatabase } from '../connection';
import { EncryptionService } from '../../services/encryption.service';
import type { Application, AppEnvironment } from '../../types/application.types';

export interface ApplicationRow {
  id: number;
  name: string;
  url: string | null;
  username: string | null;
  password: string | null;
  environment: string;
  notes: string | null;
  is_favorite: number;
  created_at: string;
  updated_at: string;
}

export interface CreateApplicationDTO {
  name: string;
  url?: string;
  username?: string;
  password?: string;
  environment?: string;
  notes?: string;
  is_favorite?: boolean;
}

export interface UpdateApplicationDTO extends Partial<CreateApplicationDTO> {
  id: number;
}

function encryptField(value: string | undefined | null): string | null {
  if (!value) return null;
  return EncryptionService.encrypt(value);
}

function decryptField(value: string | undefined | null): string | null {
  if (!value) return null;
  return EncryptionService.decrypt(value);
}

function rowToApplication(row: ApplicationRow): Application {
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    username: decryptField(row.username),
    password: decryptField(row.password),
    environment: row.environment as AppEnvironment,
    notes: row.notes,
    is_favorite: row.is_favorite === 1,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export const ApplicationRepository = {
  findAll() {
    const db = getDatabase();
    const rows = db
      .prepare('SELECT * FROM applications ORDER BY is_favorite DESC, updated_at DESC')
      .all() as ApplicationRow[];
    return rows.map(rowToApplication);
  },

  findById(id: number) {
    const db = getDatabase();
    const row = db
      .prepare('SELECT * FROM applications WHERE id = ?')
      .get(id) as ApplicationRow | undefined;
    if (!row) return null;
    return rowToApplication(row);
  },

  search(query: string) {
    const db = getDatabase();
    const like = `%${query}%`;
    const rows = db
      .prepare(
        `SELECT * FROM applications
         WHERE name LIKE ? OR url LIKE ? OR environment LIKE ? OR notes LIKE ?
         ORDER BY is_favorite DESC, updated_at DESC`
      )
      .all(like, like, like, like) as ApplicationRow[];
    return rows.map(rowToApplication);
  },

  findByEnvironment(environment: string) {
    const db = getDatabase();
    const rows = db
      .prepare('SELECT * FROM applications WHERE environment = ? ORDER BY name ASC')
      .all(environment) as ApplicationRow[];
    return rows.map(rowToApplication);
  },

  findFavorites() {
    const db = getDatabase();
    const rows = db
      .prepare('SELECT * FROM applications WHERE is_favorite = 1 ORDER BY updated_at DESC')
      .all() as ApplicationRow[];
    return rows.map(rowToApplication);
  },

  create(data: CreateApplicationDTO) {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO applications (name, url, username, password, environment, notes, is_favorite)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.name,
      data.url ?? null,
      encryptField(data.username),
      encryptField(data.password),
      data.environment ?? 'production',
      data.notes ?? null,
      data.is_favorite ? 1 : 0
    );
    return this.findById(result.lastInsertRowid as number);
  },

  update(data: UpdateApplicationDTO) {
    const db = getDatabase();
    const existing = db
      .prepare('SELECT * FROM applications WHERE id = ?')
      .get(data.id) as ApplicationRow | undefined;
    if (!existing) throw new Error(`Application with id ${data.id} not found`);

    const stmt = db.prepare(`
      UPDATE applications SET
        name = ?,
        url = ?,
        username = ?,
        password = ?,
        environment = ?,
        notes = ?,
        is_favorite = ?
      WHERE id = ?
    `);

    stmt.run(
      data.name ?? existing.name,
      data.url !== undefined ? data.url : existing.url,
      data.username !== undefined ? encryptField(data.username) : existing.username,
      data.password !== undefined ? encryptField(data.password) : existing.password,
      data.environment ?? existing.environment,
      data.notes !== undefined ? data.notes : existing.notes,
      data.is_favorite !== undefined ? (data.is_favorite ? 1 : 0) : existing.is_favorite,
      data.id
    );

    return this.findById(data.id);
  },

  toggleFavorite(id: number) {
    const db = getDatabase();
    db.prepare(
      'UPDATE applications SET is_favorite = CASE WHEN is_favorite = 1 THEN 0 ELSE 1 END WHERE id = ?'
    ).run(id);
    return this.findById(id);
  },

  delete(id: number) {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM applications WHERE id = ?').run(id);
    return result.changes > 0;
  },

  count() {
    const db = getDatabase();
    const row = db
      .prepare('SELECT COUNT(*) as count FROM applications')
      .get() as { count: number };
    return row.count;
  },

  getRecent(limit = 5) {
    const db = getDatabase();
    const rows = db
      .prepare('SELECT * FROM applications ORDER BY created_at DESC LIMIT ?')
      .all(limit) as ApplicationRow[];
    return rows.map(rowToApplication);
  },
};
