"use strict";
// src/database/repositories/website.repository.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsiteRepository = void 0;
const connection_1 = require("../connection");
const encryption_service_1 = require("../../services/encryption.service");
function encryptField(value) {
    if (!value)
        return null;
    return encryption_service_1.EncryptionService.encrypt(value);
}
function decryptField(value) {
    if (!value)
        return null;
    return encryption_service_1.EncryptionService.decrypt(value);
}
function rowToWebsite(row) {
    return {
        id: row.id,
        name: row.name,
        url: row.url,
        username: decryptField(row.username),
        email: decryptField(row.email),
        password: decryptField(row.password),
        notes: row.notes,
        tags: JSON.parse(row.tags || '[]'),
        is_favorite: row.is_favorite === 1,
        created_at: row.created_at,
        updated_at: row.updated_at,
    };
}
exports.WebsiteRepository = {
    findAll() {
        const db = (0, connection_1.getDatabase)();
        const rows = db
            .prepare('SELECT * FROM websites ORDER BY is_favorite DESC, updated_at DESC')
            .all();
        return rows.map(rowToWebsite);
    },
    findById(id) {
        const db = (0, connection_1.getDatabase)();
        const row = db.prepare('SELECT * FROM websites WHERE id = ?').get(id);
        if (!row)
            return null;
        return rowToWebsite(row);
    },
    search(query) {
        const db = (0, connection_1.getDatabase)();
        const like = `%${query}%`;
        const rows = db
            .prepare(`SELECT * FROM websites
         WHERE name LIKE ? OR url LIKE ? OR email LIKE ? OR notes LIKE ?
         ORDER BY is_favorite DESC, updated_at DESC`)
            .all(like, like, like, like);
        return rows.map(rowToWebsite);
    },
    findFavorites() {
        const db = (0, connection_1.getDatabase)();
        const rows = db
            .prepare('SELECT * FROM websites WHERE is_favorite = 1 ORDER BY updated_at DESC')
            .all();
        return rows.map(rowToWebsite);
    },
    create(data) {
        const db = (0, connection_1.getDatabase)();
        const stmt = db.prepare(`
      INSERT INTO websites (name, url, username, email, password, notes, tags, is_favorite)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
        const result = stmt.run(data.name, data.url, encryptField(data.username), encryptField(data.email), encryptField(data.password), data.notes ?? null, JSON.stringify(data.tags ?? []), data.is_favorite ? 1 : 0);
        return this.findById(result.lastInsertRowid);
    },
    update(data) {
        const db = (0, connection_1.getDatabase)();
        const existing = db
            .prepare('SELECT * FROM websites WHERE id = ?')
            .get(data.id);
        if (!existing)
            throw new Error(`Website with id ${data.id} not found`);
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
        stmt.run(data.name ?? existing.name, data.url ?? existing.url, data.username !== undefined ? encryptField(data.username) : existing.username, data.email !== undefined ? encryptField(data.email) : existing.email, data.password !== undefined ? encryptField(data.password) : existing.password, data.notes !== undefined ? data.notes : existing.notes, data.tags !== undefined ? JSON.stringify(data.tags) : existing.tags, data.is_favorite !== undefined ? (data.is_favorite ? 1 : 0) : existing.is_favorite, data.id);
        return this.findById(data.id);
    },
    toggleFavorite(id) {
        const db = (0, connection_1.getDatabase)();
        db.prepare('UPDATE websites SET is_favorite = CASE WHEN is_favorite = 1 THEN 0 ELSE 1 END WHERE id = ?').run(id);
        return this.findById(id);
    },
    delete(id) {
        const db = (0, connection_1.getDatabase)();
        const result = db.prepare('DELETE FROM websites WHERE id = ?').run(id);
        return result.changes > 0;
    },
    count() {
        const db = (0, connection_1.getDatabase)();
        const row = db.prepare('SELECT COUNT(*) as count FROM websites').get();
        return row.count;
    },
    getRecent(limit = 5) {
        const db = (0, connection_1.getDatabase)();
        const rows = db
            .prepare('SELECT * FROM websites ORDER BY created_at DESC LIMIT ?')
            .all(limit);
        return rows.map(rowToWebsite);
    },
};
//# sourceMappingURL=website.repository.js.map