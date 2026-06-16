// src/database/repositories/link.repository.ts

import { getDatabase } from '../connection';

export interface LinkRow {
  id: number;
  title: string;
  url: string;
  category: string;
  description: string | null;
  is_favorite: number;
  created_at: string;
  updated_at: string;
}

export interface CreateLinkDTO {
  title: string;
  url: string;
  category?: string;
  description?: string;
  is_favorite?: boolean;
}

export interface UpdateLinkDTO extends Partial<CreateLinkDTO> {
  id: number;
}

function rowToLink(row: LinkRow) {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    category: row.category,
    description: row.description,
    is_favorite: row.is_favorite === 1,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export const LinkRepository = {
  findAll() {
    const db = getDatabase();
    const rows = db
      .prepare('SELECT * FROM links ORDER BY is_favorite DESC, category ASC, title ASC')
      .all() as LinkRow[];
    return rows.map(rowToLink);
  },

  findById(id: number) {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM links WHERE id = ?').get(id) as LinkRow | undefined;
    if (!row) return null;
    return rowToLink(row);
  },

  search(query: string) {
    const db = getDatabase();
    const like = `%${query}%`;
    const rows = db
      .prepare(
        `SELECT * FROM links
         WHERE title LIKE ? OR url LIKE ? OR category LIKE ? OR description LIKE ?
         ORDER BY is_favorite DESC, category ASC`
      )
      .all(like, like, like, like) as LinkRow[];
    return rows.map(rowToLink);
  },

  findByCategory(category: string) {
    const db = getDatabase();
    const rows = db
      .prepare('SELECT * FROM links WHERE category = ? ORDER BY title ASC')
      .all(category) as LinkRow[];
    return rows.map(rowToLink);
  },

  findFavorites() {
    const db = getDatabase();
    const rows = db
      .prepare('SELECT * FROM links WHERE is_favorite = 1 ORDER BY title ASC')
      .all() as LinkRow[];
    return rows.map(rowToLink);
  },

  getCategories() {
    const db = getDatabase();
    const rows = db
      .prepare('SELECT DISTINCT category FROM links ORDER BY category ASC')
      .all() as { category: string }[];
    return rows.map((r) => r.category);
  },

  create(data: CreateLinkDTO) {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO links (title, url, category, description, is_favorite)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.title,
      data.url,
      data.category ?? 'General',
      data.description ?? null,
      data.is_favorite ? 1 : 0
    );
    return this.findById(result.lastInsertRowid as number);
  },

  update(data: UpdateLinkDTO) {
    const db = getDatabase();
    const existing = db
      .prepare('SELECT * FROM links WHERE id = ?')
      .get(data.id) as LinkRow | undefined;
    if (!existing) throw new Error(`Link with id ${data.id} not found`);

    const stmt = db.prepare(`
      UPDATE links SET title = ?, url = ?, category = ?, description = ?, is_favorite = ?
      WHERE id = ?
    `);

    stmt.run(
      data.title ?? existing.title,
      data.url ?? existing.url,
      data.category ?? existing.category,
      data.description !== undefined ? data.description : existing.description,
      data.is_favorite !== undefined ? (data.is_favorite ? 1 : 0) : existing.is_favorite,
      data.id
    );

    return this.findById(data.id);
  },

  toggleFavorite(id: number) {
    const db = getDatabase();
    db.prepare(
      'UPDATE links SET is_favorite = CASE WHEN is_favorite = 1 THEN 0 ELSE 1 END WHERE id = ?'
    ).run(id);
    return this.findById(id);
  },

  delete(id: number) {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM links WHERE id = ?').run(id);
    return result.changes > 0;
  },

  count() {
    const db = getDatabase();
    const row = db.prepare('SELECT COUNT(*) as count FROM links').get() as { count: number };
    return row.count;
  },

  getRecent(limit = 5) {
    const db = getDatabase();
    const rows = db
      .prepare('SELECT * FROM links ORDER BY created_at DESC LIMIT ?')
      .all(limit) as LinkRow[];
    return rows.map(rowToLink);
  },
};
