// src/database/repositories/website.repository.ts

import { getDatabase } from '../connection';
import { EncryptionService } from '../../services/encryption.service';

export interface WebsiteRow {
  id: number;
  name: string;
  url: string;
  username: string | null;
  email: string | null;
  password: string | null;
  notes: string | null;
  tags: string;
  is_favorite: number;
  created_at: string;
  updated_at: string;
}

export interface CreateWebsiteDTO {
  name: string;
  url: string;
  username?: string;
  email?: string;
  password?: string;
  notes?: string;
  tags?: string[];
  is_favorite?: boolean;
}

export interface UpdateWebsiteDTO extends Partial<CreateWebsiteDTO> {
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

function rowToWebsite(row: WebsiteRow) {
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    username: decryptField(row.username),
    email: decryptField(row.email),
    password: decryptField(row.password),
    notes: row.notes,
    tags: JSON.parse(row.tags || '[]') as string[],
    is_favorite: row.is_favorite === 1,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export const WebsiteRepository = {
  findAll() {
    const db = getDatabase();
    const rows = db
      .prepare('SELECT * FROM websites ORDER BY is_favorite DESC, updated_at DESC')
      .all() as WebsiteRow[];
    return rows.map(rowToWebsite);
  },

  findById(id: number) {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM websites WHERE id = ?').get(id) as
      | WebsiteRow
      | undefined;
    if (!row) return null;
    return rowToWebsite(row);
  },

  search(query: string) {
    const db = getDatabase();
    const like = `%${query}%`;
    const rows = db
      .prepare(
        `SELECT * FROM websites
         WHERE name LIKE ? OR url LIKE ? OR email LIKE ? OR notes LIKE ?
         ORDER BY is_favorite DESC, updated_at DESC`
      )
      .all(like, like, like, like) as WebsiteRow[];
    return rows.map(rowToWebsite);
  },

  findFavorites() {
    const db = getDatabase();
    const rows = db
      .prepare('SELECT * FROM websites WHERE is_favorite = 1 ORDER BY updated_at DESC')
      .all() as WebsiteRow[];
    return rows.map(rowToWebsite);
  },

  create(data: CreateWebsiteDTO) {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO websites (name, url, username, email, password, notes, tags, is_favorite)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.name,
      data.url,
      encryptField(data.username),
      encryptField(data.email),
      encryptField(data.password),
      data.notes ?? null,
      JSON.stringify(data.tags ?? []),
      data.is_favorite ? 1 : 0
    );
    return this.findById(result.lastInsertRowid as number);
  },

  update(data: UpdateWebsiteDTO) {
    const db = getDatabase();
    const existing = db
      .prepare('SELECT * FROM websites WHERE id = ?')
      .get(data.id) as WebsiteRow | undefined;
    if (!existing) throw new Error(`Website with id ${data.id} not found`);

    const stmt = db.prepare(`
      UPDATE websites SET
        name = ?,
        url = ?,
        username = ?,
        email = ?,
        password = ?,
        notes = ?,
        tags = ?,
        is_favorite = ?
      WHERE id = ?
    `);

    stmt.run(
      data.name ?? existing.name,
      data.url ?? existing.url,
      data.username !== undefined ? encryptField(data.username) : existing.username,
      data.email !== undefined ? encryptField(data.email) : existing.email,
      data.password !== undefined ? encryptField(data.password) : existing.password,
      data.notes !== undefined ? data.notes : existing.notes,
      data.tags !== undefined ? JSON.stringify(data.tags) : existing.tags,
      data.is_favorite !== undefined ? (data.is_favorite ? 1 : 0) : existing.is_favorite,
      data.id
    );

    return this.findById(data.id);
  },

  toggleFavorite(id: number) {
    const db = getDatabase();
    db.prepare(
      'UPDATE websites SET is_favorite = CASE WHEN is_favorite = 1 THEN 0 ELSE 1 END WHERE id = ?'
    ).run(id);
    return this.findById(id);
  },

  delete(id: number) {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM websites WHERE id = ?').run(id);
    return result.changes > 0;
  },

  count() {
    const db = getDatabase();
    const row = db.prepare('SELECT COUNT(*) as count FROM websites').get() as { count: number };
    return row.count;
  },

  getRecent(limit = 5) {
    const db = getDatabase();
    const rows = db
      .prepare('SELECT * FROM websites ORDER BY created_at DESC LIMIT ?')
      .all(limit) as WebsiteRow[];
    return rows.map(rowToWebsite);
  },
};
