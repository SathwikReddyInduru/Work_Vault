// src/database/repositories/note.repository.ts

import { getDatabase } from '../connection';

export interface NoteRow {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string;
  is_pinned: number;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteDTO {
  title: string;
  content?: string;
  category?: string;
  tags?: string[];
  is_pinned?: boolean;
}

export interface UpdateNoteDTO extends Partial<CreateNoteDTO> {
  id: number;
}

function rowToNote(row: NoteRow) {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category,
    tags: JSON.parse(row.tags || '[]') as string[],
    is_pinned: row.is_pinned === 1,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export const NoteRepository = {
  findAll() {
    const db = getDatabase();
    const rows = db
      .prepare('SELECT * FROM notes ORDER BY is_pinned DESC, updated_at DESC')
      .all() as NoteRow[];
    return rows.map(rowToNote);
  },

  findById(id: number) {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM notes WHERE id = ?').get(id) as NoteRow | undefined;
    if (!row) return null;
    return rowToNote(row);
  },

  search(query: string) {
    const db = getDatabase();
    const like = `%${query}%`;
    const rows = db
      .prepare(
        `SELECT * FROM notes
         WHERE title LIKE ? OR content LIKE ? OR category LIKE ? OR tags LIKE ?
         ORDER BY is_pinned DESC, updated_at DESC`
      )
      .all(like, like, like, like) as NoteRow[];
    return rows.map(rowToNote);
  },

  findByCategory(category: string) {
    const db = getDatabase();
    const rows = db
      .prepare('SELECT * FROM notes WHERE category = ? ORDER BY is_pinned DESC, updated_at DESC')
      .all(category) as NoteRow[];
    return rows.map(rowToNote);
  },

  findPinned() {
    const db = getDatabase();
    const rows = db
      .prepare('SELECT * FROM notes WHERE is_pinned = 1 ORDER BY updated_at DESC')
      .all() as NoteRow[];
    return rows.map(rowToNote);
  },

  getCategories() {
    const db = getDatabase();
    const rows = db
      .prepare('SELECT DISTINCT category FROM notes ORDER BY category ASC')
      .all() as { category: string }[];
    return rows.map((r) => r.category);
  },

  create(data: CreateNoteDTO) {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO notes (title, content, category, tags, is_pinned)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.title,
      data.content ?? '',
      data.category ?? 'General',
      JSON.stringify(data.tags ?? []),
      data.is_pinned ? 1 : 0
    );
    return this.findById(result.lastInsertRowid as number);
  },

  update(data: UpdateNoteDTO) {
    const db = getDatabase();
    const existing = db
      .prepare('SELECT * FROM notes WHERE id = ?')
      .get(data.id) as NoteRow | undefined;
    if (!existing) throw new Error(`Note with id ${data.id} not found`);

    const stmt = db.prepare(`
      UPDATE notes SET title = ?, content = ?, category = ?, tags = ?, is_pinned = ?
      WHERE id = ?
    `);

    stmt.run(
      data.title ?? existing.title,
      data.content !== undefined ? data.content : existing.content,
      data.category ?? existing.category,
      data.tags !== undefined ? JSON.stringify(data.tags) : existing.tags,
      data.is_pinned !== undefined ? (data.is_pinned ? 1 : 0) : existing.is_pinned,
      data.id
    );

    return this.findById(data.id);
  },

  togglePin(id: number) {
    const db = getDatabase();
    db.prepare(
      'UPDATE notes SET is_pinned = CASE WHEN is_pinned = 1 THEN 0 ELSE 1 END WHERE id = ?'
    ).run(id);
    return this.findById(id);
  },

  delete(id: number) {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM notes WHERE id = ?').run(id);
    return result.changes > 0;
  },

  count() {
    const db = getDatabase();
    const row = db.prepare('SELECT COUNT(*) as count FROM notes').get() as { count: number };
    return row.count;
  },

  getRecent(limit = 5) {
    const db = getDatabase();
    const rows = db
      .prepare('SELECT * FROM notes ORDER BY created_at DESC LIMIT ?')
      .all(limit) as NoteRow[];
    return rows.map(rowToNote);
  },
};
