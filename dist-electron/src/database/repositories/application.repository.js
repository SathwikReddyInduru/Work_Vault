"use strict";
// src/database/repositories/application.repository.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationRepository = void 0;
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
function rowToApplication(row) {
    return {
        id: row.id,
        name: row.name,
        url: row.url,
        username: decryptField(row.username),
        password: decryptField(row.password),
        environment: row.environment,
        notes: row.notes,
        is_favorite: row.is_favorite === 1,
        created_at: row.created_at,
        updated_at: row.updated_at,
    };
}
exports.ApplicationRepository = {
    findAll() {
        const db = (0, connection_1.getDatabase)();
        const rows = db
            .prepare('SELECT * FROM applications ORDER BY is_favorite DESC, updated_at DESC')
            .all();
        return rows.map(rowToApplication);
    },
    findById(id) {
        const db = (0, connection_1.getDatabase)();
        const row = db
            .prepare('SELECT * FROM applications WHERE id = ?')
            .get(id);
        if (!row)
            return null;
        return rowToApplication(row);
    },
    search(query) {
        const db = (0, connection_1.getDatabase)();
        const like = `%${query}%`;
        const rows = db
            .prepare(`SELECT * FROM applications
         WHERE name LIKE ? OR url LIKE ? OR environment LIKE ? OR notes LIKE ?
         ORDER BY is_favorite DESC, updated_at DESC`)
            .all(like, like, like, like);
        return rows.map(rowToApplication);
    },
    findByEnvironment(environment) {
        const db = (0, connection_1.getDatabase)();
        const rows = db
            .prepare('SELECT * FROM applications WHERE environment = ? ORDER BY name ASC')
            .all(environment);
        return rows.map(rowToApplication);
    },
    findFavorites() {
        const db = (0, connection_1.getDatabase)();
        const rows = db
            .prepare('SELECT * FROM applications WHERE is_favorite = 1 ORDER BY updated_at DESC')
            .all();
        return rows.map(rowToApplication);
    },
    create(data) {
        const db = (0, connection_1.getDatabase)();
        const stmt = db.prepare(`
      INSERT INTO applications (name, url, username, password, environment, notes, is_favorite)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
        const result = stmt.run(data.name, data.url ?? null, encryptField(data.username), encryptField(data.password), data.environment ?? 'production', data.notes ?? null, data.is_favorite ? 1 : 0);
        return this.findById(result.lastInsertRowid);
    },
    update(data) {
        const db = (0, connection_1.getDatabase)();
        const existing = db
            .prepare('SELECT * FROM applications WHERE id = ?')
            .get(data.id);
        if (!existing)
            throw new Error(`Application with id ${data.id} not found`);
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
        stmt.run(data.name ?? existing.name, data.url !== undefined ? data.url : existing.url, data.username !== undefined ? encryptField(data.username) : existing.username, data.password !== undefined ? encryptField(data.password) : existing.password, data.environment ?? existing.environment, data.notes !== undefined ? data.notes : existing.notes, data.is_favorite !== undefined ? (data.is_favorite ? 1 : 0) : existing.is_favorite, data.id);
        return this.findById(data.id);
    },
    toggleFavorite(id) {
        const db = (0, connection_1.getDatabase)();
        db.prepare('UPDATE applications SET is_favorite = CASE WHEN is_favorite = 1 THEN 0 ELSE 1 END WHERE id = ?').run(id);
        return this.findById(id);
    },
    delete(id) {
        const db = (0, connection_1.getDatabase)();
        const result = db.prepare('DELETE FROM applications WHERE id = ?').run(id);
        return result.changes > 0;
    },
    count() {
        const db = (0, connection_1.getDatabase)();
        const row = db
            .prepare('SELECT COUNT(*) as count FROM applications')
            .get();
        return row.count;
    },
    getRecent(limit = 5) {
        const db = (0, connection_1.getDatabase)();
        const rows = db
            .prepare('SELECT * FROM applications ORDER BY created_at DESC LIMIT ?')
            .all(limit);
        return rows.map(rowToApplication);
    },
};
//# sourceMappingURL=application.repository.js.map