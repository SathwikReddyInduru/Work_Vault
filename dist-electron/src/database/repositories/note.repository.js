"use strict";
// src/database/repositories/note.repository.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoteRepository = void 0;
const connection_1 = require("../connection");
function rowToNote(row) {
    return {
        id: row.id,
        title: row.title,
        content: row.content,
        category: row.category,
        tags: JSON.parse(row.tags || '[]'),
        is_pinned: row.is_pinned === 1,
        created_at: row.created_at,
        updated_at: row.updated_at,
    };
}
exports.NoteRepository = {
    findAll() {
        const db = (0, connection_1.getDatabase)();
        const rows = db
            .prepare('SELECT * FROM notes ORDER BY is_pinned DESC, updated_at DESC')
            .all();
        return rows.map(rowToNote);
    },
    findById(id) {
        const db = (0, connection_1.getDatabase)();
        const row = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
        if (!row)
            return null;
        return rowToNote(row);
    },
    search(query) {
        const db = (0, connection_1.getDatabase)();
        const like = `%${query}%`;
        const rows = db
            .prepare(`SELECT * FROM notes
         WHERE title LIKE ? OR content LIKE ? OR category LIKE ? OR tags LIKE ?
         ORDER BY is_pinned DESC, updated_at DESC`)
            .all(like, like, like, like);
        return rows.map(rowToNote);
    },
    findByCategory(category) {
        const db = (0, connection_1.getDatabase)();
        const rows = db
            .prepare('SELECT * FROM notes WHERE category = ? ORDER BY is_pinned DESC, updated_at DESC')
            .all(category);
        return rows.map(rowToNote);
    },
    findPinned() {
        const db = (0, connection_1.getDatabase)();
        const rows = db
            .prepare('SELECT * FROM notes WHERE is_pinned = 1 ORDER BY updated_at DESC')
            .all();
        return rows.map(rowToNote);
    },
    getCategories() {
        const db = (0, connection_1.getDatabase)();
        const rows = db
            .prepare('SELECT DISTINCT category FROM notes ORDER BY category ASC')
            .all();
        return rows.map((r) => r.category);
    },
    create(data) {
        const db = (0, connection_1.getDatabase)();
        const stmt = db.prepare(`
      INSERT INTO notes (title, content, category, tags, is_pinned)
      VALUES (?, ?, ?, ?, ?)
    `);
        const result = stmt.run(data.title, data.content ?? '', data.category ?? 'General', JSON.stringify(data.tags ?? []), data.is_pinned ? 1 : 0);
        return this.findById(result.lastInsertRowid);
    },
    update(data) {
        const db = (0, connection_1.getDatabase)();
        const existing = db
            .prepare('SELECT * FROM notes WHERE id = ?')
            .get(data.id);
        if (!existing)
            throw new Error(`Note with id ${data.id} not found`);
        const stmt = db.prepare(`
      UPDATE notes SET title = ?, content = ?, category = ?, tags = ?, is_pinned = ?
      WHERE id = ?
    `);
        stmt.run(data.title ?? existing.title, data.content !== undefined ? data.content : existing.content, data.category ?? existing.category, data.tags !== undefined ? JSON.stringify(data.tags) : existing.tags, data.is_pinned !== undefined ? (data.is_pinned ? 1 : 0) : existing.is_pinned, data.id);
        return this.findById(data.id);
    },
    togglePin(id) {
        const db = (0, connection_1.getDatabase)();
        db.prepare('UPDATE notes SET is_pinned = CASE WHEN is_pinned = 1 THEN 0 ELSE 1 END WHERE id = ?').run(id);
        return this.findById(id);
    },
    delete(id) {
        const db = (0, connection_1.getDatabase)();
        const result = db.prepare('DELETE FROM notes WHERE id = ?').run(id);
        return result.changes > 0;
    },
    count() {
        const db = (0, connection_1.getDatabase)();
        const row = db.prepare('SELECT COUNT(*) as count FROM notes').get();
        return row.count;
    },
    getRecent(limit = 5) {
        const db = (0, connection_1.getDatabase)();
        const rows = db
            .prepare('SELECT * FROM notes ORDER BY created_at DESC LIMIT ?')
            .all(limit);
        return rows.map(rowToNote);
    },
};
//# sourceMappingURL=note.repository.js.map