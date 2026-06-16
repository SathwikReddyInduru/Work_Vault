"use strict";
// src/database/repositories/link.repository.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkRepository = void 0;
const connection_1 = require("../connection");
function rowToLink(row) {
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
exports.LinkRepository = {
    findAll() {
        const db = (0, connection_1.getDatabase)();
        const rows = db
            .prepare('SELECT * FROM links ORDER BY is_favorite DESC, category ASC, title ASC')
            .all();
        return rows.map(rowToLink);
    },
    findById(id) {
        const db = (0, connection_1.getDatabase)();
        const row = db.prepare('SELECT * FROM links WHERE id = ?').get(id);
        if (!row)
            return null;
        return rowToLink(row);
    },
    search(query) {
        const db = (0, connection_1.getDatabase)();
        const like = `%${query}%`;
        const rows = db
            .prepare(`SELECT * FROM links
         WHERE title LIKE ? OR url LIKE ? OR category LIKE ? OR description LIKE ?
         ORDER BY is_favorite DESC, category ASC`)
            .all(like, like, like, like);
        return rows.map(rowToLink);
    },
    findByCategory(category) {
        const db = (0, connection_1.getDatabase)();
        const rows = db
            .prepare('SELECT * FROM links WHERE category = ? ORDER BY title ASC')
            .all(category);
        return rows.map(rowToLink);
    },
    findFavorites() {
        const db = (0, connection_1.getDatabase)();
        const rows = db
            .prepare('SELECT * FROM links WHERE is_favorite = 1 ORDER BY title ASC')
            .all();
        return rows.map(rowToLink);
    },
    getCategories() {
        const db = (0, connection_1.getDatabase)();
        const rows = db
            .prepare('SELECT DISTINCT category FROM links ORDER BY category ASC')
            .all();
        return rows.map((r) => r.category);
    },
    create(data) {
        const db = (0, connection_1.getDatabase)();
        const stmt = db.prepare(`
      INSERT INTO links (title, url, category, description, is_favorite)
      VALUES (?, ?, ?, ?, ?)
    `);
        const result = stmt.run(data.title, data.url, data.category ?? 'General', data.description ?? null, data.is_favorite ? 1 : 0);
        return this.findById(result.lastInsertRowid);
    },
    update(data) {
        const db = (0, connection_1.getDatabase)();
        const existing = db
            .prepare('SELECT * FROM links WHERE id = ?')
            .get(data.id);
        if (!existing)
            throw new Error(`Link with id ${data.id} not found`);
        const stmt = db.prepare(`
      UPDATE links SET title = ?, url = ?, category = ?, description = ?, is_favorite = ?
      WHERE id = ?
    `);
        stmt.run(data.title ?? existing.title, data.url ?? existing.url, data.category ?? existing.category, data.description !== undefined ? data.description : existing.description, data.is_favorite !== undefined ? (data.is_favorite ? 1 : 0) : existing.is_favorite, data.id);
        return this.findById(data.id);
    },
    toggleFavorite(id) {
        const db = (0, connection_1.getDatabase)();
        db.prepare('UPDATE links SET is_favorite = CASE WHEN is_favorite = 1 THEN 0 ELSE 1 END WHERE id = ?').run(id);
        return this.findById(id);
    },
    delete(id) {
        const db = (0, connection_1.getDatabase)();
        const result = db.prepare('DELETE FROM links WHERE id = ?').run(id);
        return result.changes > 0;
    },
    count() {
        const db = (0, connection_1.getDatabase)();
        const row = db.prepare('SELECT COUNT(*) as count FROM links').get();
        return row.count;
    },
    getRecent(limit = 5) {
        const db = (0, connection_1.getDatabase)();
        const rows = db
            .prepare('SELECT * FROM links ORDER BY created_at DESC LIMIT ?')
            .all(limit);
        return rows.map(rowToLink);
    },
};
//# sourceMappingURL=link.repository.js.map