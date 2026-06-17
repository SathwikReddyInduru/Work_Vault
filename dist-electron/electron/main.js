"use strict";
const electron = require("electron");
const path = require("path");
const Database = require("better-sqlite3");
const crypto = require("crypto");
const fs = require("fs");
const CREATE_WEBSITES_TABLE = `
  CREATE TABLE IF NOT EXISTS websites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    username TEXT,
    email TEXT,
    password TEXT,
    notes TEXT,
    tags TEXT DEFAULT '[]',
    is_favorite INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )
`;
const CREATE_APPLICATIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT,
    username TEXT,
    password TEXT,
    environment TEXT DEFAULT 'production',
    notes TEXT,
    is_favorite INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )
`;
const CREATE_LINKS_TABLE = `
  CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    description TEXT,
    is_favorite INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )
`;
const CREATE_NOTES_TABLE = `
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    category TEXT DEFAULT 'General',
    tags TEXT DEFAULT '[]',
    is_pinned INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )
`;
const CREATE_TASKS_TABLE = `
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium',
    due_date TEXT,
    status TEXT DEFAULT 'todo',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )
`;
const CREATE_SETTINGS_TABLE = `
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
  )
`;
const CREATE_DB_CONNECTIONS_TABLE = `
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
`;
const CREATE_UPDATED_AT_TRIGGER = (tableName) => `
  CREATE TRIGGER IF NOT EXISTS update_${tableName}_updated_at
  AFTER UPDATE ON ${tableName}
  BEGIN
    UPDATE ${tableName} SET updated_at = datetime('now') WHERE id = NEW.id;
  END
`;
const ALL_TABLES = [
  CREATE_WEBSITES_TABLE,
  CREATE_APPLICATIONS_TABLE,
  CREATE_LINKS_TABLE,
  CREATE_NOTES_TABLE,
  CREATE_TASKS_TABLE,
  CREATE_SETTINGS_TABLE,
  CREATE_DB_CONNECTIONS_TABLE
];
const ALL_TRIGGERS = [
  "websites",
  "applications",
  "links",
  "notes",
  "tasks",
  "db_connections"
].map(CREATE_UPDATED_AT_TRIGGER);
const DEFAULT_SETTINGS = [
  { key: "theme", value: "dark" },
  { key: "encryption_enabled", value: "true" },
  { key: "app_version", value: "1.0.0" }
];
let db = null;
function getDatabase() {
  if (!db) {
    throw new Error("Database not initialized. Call initializeDatabase() first.");
  }
  return db;
}
function initializeDatabase() {
  const userDataPath = electron.app.getPath("userData");
  const dbPath = path.join(userDataPath, "workvault.db");
  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("synchronous = NORMAL");
  for (const tableSQL of ALL_TABLES) {
    db.exec(tableSQL);
  }
  for (const triggerSQL of ALL_TRIGGERS) {
    db.exec(triggerSQL);
  }
  const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)
  `);
  for (const setting of DEFAULT_SETTINGS) {
    insertSetting.run(setting.key, setting.value);
  }
  console.log(`[WorkVault] Database initialized at: ${dbPath}`);
  return db;
}
function closeDatabase() {
  if (db) {
    db.close();
    db = null;
    console.log("[WorkVault] Database connection closed.");
  }
}
function getDatabasePath() {
  const userDataPath = electron.app.getPath("userData");
  return path.join(userDataPath, "workvault.db");
}
const migrations = [
  {
    version: 1,
    description: "Initial schema - all core tables",
    up: (_db) => {
      console.log("[Migration v1] Initial schema already applied via schema.ts");
    }
  },
  {
    version: 2,
    description: "Add db_connections table",
    up: (db2) => {
      db2.exec(`
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
      db2.exec(`
        CREATE TRIGGER IF NOT EXISTS update_db_connections_updated_at
        AFTER UPDATE ON db_connections
        BEGIN
          UPDATE db_connections SET updated_at = datetime('now') WHERE id = NEW.id;
        END
      `);
      console.log("[Migration v2] db_connections table created");
    }
  },
  {
    version: 3,
    description: "Add icon column to links table",
    up: (db2) => {
      db2.exec(`ALTER TABLE links ADD COLUMN icon TEXT`);
      console.log("[Migration v3] icon column added to links");
    }
  }
];
function runMigrations(db2) {
  db2.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      version INTEGER PRIMARY KEY,
      description TEXT NOT NULL,
      applied_at TEXT DEFAULT (datetime('now'))
    )
  `);
  const getApplied = db2.prepare("SELECT version FROM migrations WHERE version = ?");
  const markApplied = db2.prepare(
    "INSERT INTO migrations (version, description) VALUES (?, ?)"
  );
  for (const migration of migrations) {
    const applied = getApplied.get(migration.version);
    if (!applied) {
      console.log(`[WorkVault] Running migration v${migration.version}: ${migration.description}`);
      const runMigration = db2.transaction(() => {
        migration.up(db2);
        markApplied.run(migration.version, migration.description);
      });
      runMigration();
      console.log(`[WorkVault] Migration v${migration.version} applied successfully.`);
    }
  }
}
function handle(channel, fn) {
  electron.ipcMain.handle(channel, async (_event, ...args) => {
    try {
      const data = await fn(...args);
      return { success: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[IPC:${channel}] Error:`, err instanceof Error ? err : message);
      return { success: false, error: message };
    }
  });
}
const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const ENCODING = "hex";
function deriveKey() {
  const secret = process.env.WORKVAULT_SECRET ?? "workvault-aes-key-v1-secure-local-storage";
  return crypto.scryptSync(secret, "workvault-salt-2024", KEY_LENGTH);
}
let _key = null;
function getKey() {
  if (!_key) {
    _key = deriveKey();
  }
  return _key;
}
const EncryptionService = {
  /**
   * Encrypt a plaintext string.
   * Returns a hex string: iv:authTag:ciphertext
   */
  encrypt(plaintext) {
    try {
      const key = getKey();
      const iv = crypto.randomBytes(IV_LENGTH);
      const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
      const encrypted = Buffer.concat([
        cipher.update(plaintext, "utf8"),
        cipher.final()
      ]);
      const authTag = cipher.getAuthTag();
      return [
        iv.toString(ENCODING),
        authTag.toString(ENCODING),
        encrypted.toString(ENCODING)
      ].join(":");
    } catch (error) {
      console.error("[EncryptionService] Encryption failed:", error);
      throw new Error("Failed to encrypt value");
    }
  },
  /**
   * Decrypt an encrypted string produced by encrypt().
   */
  decrypt(encryptedData) {
    try {
      const parts = encryptedData.split(":");
      if (parts.length !== 3) {
        return encryptedData;
      }
      const [ivHex, authTagHex, ciphertextHex] = parts;
      const key = getKey();
      const iv = Buffer.from(ivHex, ENCODING);
      const authTag = Buffer.from(authTagHex, ENCODING);
      const ciphertext = Buffer.from(ciphertextHex, ENCODING);
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(authTag);
      const decrypted = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final()
      ]);
      return decrypted.toString("utf8");
    } catch (error) {
      console.error("[EncryptionService] Decryption failed:", error);
      return encryptedData;
    }
  },
  /**
   * Check if a string appears to be encrypted by this service.
   */
  isEncrypted(value) {
    const parts = value.split(":");
    return parts.length === 3 && parts[0].length === IV_LENGTH * 2 && parts[1].length === TAG_LENGTH * 2;
  },
  /**
   * Generate a secure random password.
   */
  generatePassword(options) {
    const { length, uppercase, lowercase, numbers, symbols } = options;
    let charset = "";
    if (uppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (lowercase) charset += "abcdefghijklmnopqrstuvwxyz";
    if (numbers) charset += "0123456789";
    if (symbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";
    if (!charset) charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    const randomBytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
      password += charset[randomBytes[i] % charset.length];
    }
    return password;
  },
  /**
   * Generate a UUID v4.
   */
  generateUUID() {
    return crypto.randomUUID();
  }
};
function encryptField$2(value) {
  if (!value) return null;
  return EncryptionService.encrypt(value);
}
function decryptField$2(value) {
  if (!value) return null;
  return EncryptionService.decrypt(value);
}
function rowToWebsite(row) {
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    username: decryptField$2(row.username),
    network_name: decryptField$2(row.email),
    // stored in 'email' column
    password: decryptField$2(row.password),
    notes: row.notes,
    tags: JSON.parse(row.tags || "[]"),
    is_favorite: row.is_favorite === 1,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}
const WebsiteRepository = {
  findAll() {
    const db2 = getDatabase();
    const rows = db2.prepare("SELECT * FROM websites ORDER BY is_favorite DESC, updated_at DESC").all();
    return rows.map(rowToWebsite);
  },
  findById(id) {
    const db2 = getDatabase();
    const row = db2.prepare("SELECT * FROM websites WHERE id = ?").get(id);
    if (!row) return null;
    return rowToWebsite(row);
  },
  search(query) {
    const db2 = getDatabase();
    const like = `%${query}%`;
    const rows = db2.prepare(
      `SELECT * FROM websites
         WHERE name LIKE ? OR url LIKE ? OR email LIKE ? OR notes LIKE ?
         ORDER BY is_favorite DESC, updated_at DESC`
    ).all(like, like, like, like);
    return rows.map(rowToWebsite);
  },
  findFavorites() {
    const db2 = getDatabase();
    const rows = db2.prepare("SELECT * FROM websites WHERE is_favorite = 1 ORDER BY updated_at DESC").all();
    return rows.map(rowToWebsite);
  },
  create(data) {
    const db2 = getDatabase();
    const stmt = db2.prepare(`
      INSERT INTO websites (name, url, username, email, password, notes, tags, is_favorite)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.name,
      data.url,
      encryptField$2(data.username),
      encryptField$2(data.network_name),
      encryptField$2(data.password),
      data.notes ?? null,
      JSON.stringify(data.tags ?? []),
      data.is_favorite ? 1 : 0
    );
    return this.findById(result.lastInsertRowid);
  },
  update(data) {
    const db2 = getDatabase();
    const existing = db2.prepare("SELECT * FROM websites WHERE id = ?").get(data.id);
    if (!existing) throw new Error(`Website with id ${data.id} not found`);
    const stmt = db2.prepare(`
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
      data.username !== void 0 ? encryptField$2(data.username) : existing.username,
      data.network_name !== void 0 ? encryptField$2(data.network_name) : existing.email,
      data.password !== void 0 ? encryptField$2(data.password) : existing.password,
      data.notes !== void 0 ? data.notes : existing.notes,
      data.tags !== void 0 ? JSON.stringify(data.tags) : existing.tags,
      data.is_favorite !== void 0 ? data.is_favorite ? 1 : 0 : existing.is_favorite,
      data.id
    );
    return this.findById(data.id);
  },
  toggleFavorite(id) {
    const db2 = getDatabase();
    db2.prepare(
      "UPDATE websites SET is_favorite = CASE WHEN is_favorite = 1 THEN 0 ELSE 1 END WHERE id = ?"
    ).run(id);
    return this.findById(id);
  },
  delete(id) {
    const db2 = getDatabase();
    const result = db2.prepare("DELETE FROM websites WHERE id = ?").run(id);
    return result.changes > 0;
  },
  count() {
    const db2 = getDatabase();
    const row = db2.prepare("SELECT COUNT(*) as count FROM websites").get();
    return row.count;
  },
  getRecent(limit = 5) {
    const db2 = getDatabase();
    const rows = db2.prepare("SELECT * FROM websites ORDER BY created_at DESC LIMIT ?").all(limit);
    return rows.map(rowToWebsite);
  }
};
function registerWebsiteHandlers() {
  handle("websites:getAll", () => WebsiteRepository.findAll());
  handle(
    "websites:getById",
    (id) => WebsiteRepository.findById(id)
  );
  handle(
    "websites:search",
    (query) => WebsiteRepository.search(query)
  );
  handle(
    "websites:create",
    (data) => WebsiteRepository.create(data)
  );
  handle(
    "websites:update",
    (data) => WebsiteRepository.update(data)
  );
  handle(
    "websites:delete",
    (id) => WebsiteRepository.delete(id)
  );
  handle(
    "websites:toggleFavorite",
    (id) => WebsiteRepository.toggleFavorite(id)
  );
}
function encryptField$1(value) {
  if (!value) return null;
  return EncryptionService.encrypt(value);
}
function decryptField$1(value) {
  if (!value) return null;
  return EncryptionService.decrypt(value);
}
function rowToApplication(row) {
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    username: decryptField$1(row.username),
    password: decryptField$1(row.password),
    environment: row.environment,
    notes: row.notes,
    is_favorite: row.is_favorite === 1,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}
const ApplicationRepository = {
  findAll() {
    const db2 = getDatabase();
    const rows = db2.prepare("SELECT * FROM applications ORDER BY is_favorite DESC, updated_at DESC").all();
    return rows.map(rowToApplication);
  },
  findById(id) {
    const db2 = getDatabase();
    const row = db2.prepare("SELECT * FROM applications WHERE id = ?").get(id);
    if (!row) return null;
    return rowToApplication(row);
  },
  search(query) {
    const db2 = getDatabase();
    const like = `%${query}%`;
    const rows = db2.prepare(
      `SELECT * FROM applications
         WHERE name LIKE ? OR url LIKE ? OR environment LIKE ? OR notes LIKE ?
         ORDER BY is_favorite DESC, updated_at DESC`
    ).all(like, like, like, like);
    return rows.map(rowToApplication);
  },
  findByEnvironment(environment) {
    const db2 = getDatabase();
    const rows = db2.prepare("SELECT * FROM applications WHERE environment = ? ORDER BY name ASC").all(environment);
    return rows.map(rowToApplication);
  },
  findFavorites() {
    const db2 = getDatabase();
    const rows = db2.prepare("SELECT * FROM applications WHERE is_favorite = 1 ORDER BY updated_at DESC").all();
    return rows.map(rowToApplication);
  },
  create(data) {
    const db2 = getDatabase();
    const stmt = db2.prepare(`
      INSERT INTO applications (name, url, username, password, environment, notes, is_favorite)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.name,
      data.url ?? null,
      encryptField$1(data.username),
      encryptField$1(data.password),
      data.environment ?? "production",
      data.notes ?? null,
      data.is_favorite ? 1 : 0
    );
    return this.findById(result.lastInsertRowid);
  },
  update(data) {
    const db2 = getDatabase();
    const existing = db2.prepare("SELECT * FROM applications WHERE id = ?").get(data.id);
    if (!existing) throw new Error(`Application with id ${data.id} not found`);
    const stmt = db2.prepare(`
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
      data.url !== void 0 ? data.url : existing.url,
      data.username !== void 0 ? encryptField$1(data.username) : existing.username,
      data.password !== void 0 ? encryptField$1(data.password) : existing.password,
      data.environment ?? existing.environment,
      data.notes !== void 0 ? data.notes : existing.notes,
      data.is_favorite !== void 0 ? data.is_favorite ? 1 : 0 : existing.is_favorite,
      data.id
    );
    return this.findById(data.id);
  },
  toggleFavorite(id) {
    const db2 = getDatabase();
    db2.prepare(
      "UPDATE applications SET is_favorite = CASE WHEN is_favorite = 1 THEN 0 ELSE 1 END WHERE id = ?"
    ).run(id);
    return this.findById(id);
  },
  delete(id) {
    const db2 = getDatabase();
    const result = db2.prepare("DELETE FROM applications WHERE id = ?").run(id);
    return result.changes > 0;
  },
  count() {
    const db2 = getDatabase();
    const row = db2.prepare("SELECT COUNT(*) as count FROM applications").get();
    return row.count;
  },
  getRecent(limit = 5) {
    const db2 = getDatabase();
    const rows = db2.prepare("SELECT * FROM applications ORDER BY created_at DESC LIMIT ?").all(limit);
    return rows.map(rowToApplication);
  }
};
function registerApplicationHandlers() {
  handle("applications:getAll", () => ApplicationRepository.findAll());
  handle(
    "applications:getById",
    (id) => ApplicationRepository.findById(id)
  );
  handle(
    "applications:search",
    (query) => ApplicationRepository.search(query)
  );
  handle(
    "applications:create",
    (data) => ApplicationRepository.create(data)
  );
  handle(
    "applications:update",
    (data) => ApplicationRepository.update(data)
  );
  handle(
    "applications:delete",
    (id) => ApplicationRepository.delete(id)
  );
  handle(
    "applications:toggleFavorite",
    (id) => ApplicationRepository.toggleFavorite(id)
  );
}
function normalizeIcon(icon) {
  if (icon === void 0) return void 0;
  const trimmed = (icon == null ? void 0 : icon.trim()) ?? "";
  return trimmed.length > 0 ? trimmed : null;
}
function rowToLink(row) {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    category: row.category,
    description: row.description,
    icon: row.icon,
    is_favorite: row.is_favorite === 1,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}
const LinkRepository = {
  findAll() {
    const db2 = getDatabase();
    const rows = db2.prepare("SELECT * FROM links ORDER BY is_favorite DESC, category ASC, title ASC").all();
    return rows.map(rowToLink);
  },
  findById(id) {
    const db2 = getDatabase();
    const row = db2.prepare("SELECT * FROM links WHERE id = ?").get(id);
    if (!row) return null;
    return rowToLink(row);
  },
  search(query) {
    const db2 = getDatabase();
    const like = `%${query}%`;
    const rows = db2.prepare(
      `SELECT * FROM links
         WHERE title LIKE ? OR url LIKE ? OR category LIKE ? OR description LIKE ?
         ORDER BY is_favorite DESC, category ASC`
    ).all(like, like, like, like);
    return rows.map(rowToLink);
  },
  findByCategory(category) {
    const db2 = getDatabase();
    const rows = db2.prepare("SELECT * FROM links WHERE category = ? ORDER BY title ASC").all(category);
    return rows.map(rowToLink);
  },
  findFavorites() {
    const db2 = getDatabase();
    const rows = db2.prepare("SELECT * FROM links WHERE is_favorite = 1 ORDER BY title ASC").all();
    return rows.map(rowToLink);
  },
  getCategories() {
    const db2 = getDatabase();
    const rows = db2.prepare("SELECT DISTINCT category FROM links ORDER BY category ASC").all();
    return rows.map((r) => r.category);
  },
  create(data) {
    const db2 = getDatabase();
    const stmt = db2.prepare(`
      INSERT INTO links (title, url, category, description, icon, is_favorite)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.title,
      data.url,
      data.category ?? "General",
      data.description ?? null,
      normalizeIcon(data.icon) ?? null,
      data.is_favorite ? 1 : 0
    );
    return this.findById(result.lastInsertRowid);
  },
  update(data) {
    const db2 = getDatabase();
    const existing = db2.prepare("SELECT * FROM links WHERE id = ?").get(data.id);
    if (!existing) throw new Error(`Link with id ${data.id} not found`);
    const stmt = db2.prepare(`
      UPDATE links SET title = ?, url = ?, category = ?, description = ?, icon = ?, is_favorite = ?
      WHERE id = ?
    `);
    const icon = normalizeIcon(data.icon);
    stmt.run(
      data.title ?? existing.title,
      data.url ?? existing.url,
      data.category ?? existing.category,
      data.description !== void 0 ? data.description : existing.description,
      icon !== void 0 ? icon : existing.icon,
      data.is_favorite !== void 0 ? data.is_favorite ? 1 : 0 : existing.is_favorite,
      data.id
    );
    return this.findById(data.id);
  },
  toggleFavorite(id) {
    const db2 = getDatabase();
    db2.prepare(
      "UPDATE links SET is_favorite = CASE WHEN is_favorite = 1 THEN 0 ELSE 1 END WHERE id = ?"
    ).run(id);
    return this.findById(id);
  },
  delete(id) {
    const db2 = getDatabase();
    const result = db2.prepare("DELETE FROM links WHERE id = ?").run(id);
    return result.changes > 0;
  },
  count() {
    const db2 = getDatabase();
    const row = db2.prepare("SELECT COUNT(*) as count FROM links").get();
    return row.count;
  },
  getRecent(limit = 5) {
    const db2 = getDatabase();
    const rows = db2.prepare("SELECT * FROM links ORDER BY created_at DESC LIMIT ?").all(limit);
    return rows.map(rowToLink);
  }
};
function registerLinkHandlers() {
  handle("links:getAll", () => LinkRepository.findAll());
  handle(
    "links:getById",
    (id) => LinkRepository.findById(id)
  );
  handle(
    "links:search",
    (query) => LinkRepository.search(query)
  );
  handle(
    "links:create",
    (data) => LinkRepository.create(data)
  );
  handle(
    "links:update",
    (data) => LinkRepository.update(data)
  );
  handle(
    "links:delete",
    (id) => LinkRepository.delete(id)
  );
  handle(
    "links:toggleFavorite",
    (id) => LinkRepository.toggleFavorite(id)
  );
}
function rowToNote(row) {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category,
    tags: JSON.parse(row.tags || "[]"),
    is_pinned: row.is_pinned === 1,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}
const NoteRepository = {
  findAll() {
    const db2 = getDatabase();
    const rows = db2.prepare("SELECT * FROM notes ORDER BY is_pinned DESC, updated_at DESC").all();
    return rows.map(rowToNote);
  },
  findById(id) {
    const db2 = getDatabase();
    const row = db2.prepare("SELECT * FROM notes WHERE id = ?").get(id);
    if (!row) return null;
    return rowToNote(row);
  },
  search(query) {
    const db2 = getDatabase();
    const like = `%${query}%`;
    const rows = db2.prepare(
      `SELECT * FROM notes
         WHERE title LIKE ? OR content LIKE ? OR category LIKE ? OR tags LIKE ?
         ORDER BY is_pinned DESC, updated_at DESC`
    ).all(like, like, like, like);
    return rows.map(rowToNote);
  },
  findByCategory(category) {
    const db2 = getDatabase();
    const rows = db2.prepare("SELECT * FROM notes WHERE category = ? ORDER BY is_pinned DESC, updated_at DESC").all(category);
    return rows.map(rowToNote);
  },
  findPinned() {
    const db2 = getDatabase();
    const rows = db2.prepare("SELECT * FROM notes WHERE is_pinned = 1 ORDER BY updated_at DESC").all();
    return rows.map(rowToNote);
  },
  getCategories() {
    const db2 = getDatabase();
    const rows = db2.prepare("SELECT DISTINCT category FROM notes ORDER BY category ASC").all();
    return rows.map((r) => r.category);
  },
  create(data) {
    const db2 = getDatabase();
    const stmt = db2.prepare(`
      INSERT INTO notes (title, content, category, tags, is_pinned)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.title,
      data.content ?? "",
      data.category ?? "General",
      JSON.stringify(data.tags ?? []),
      data.is_pinned ? 1 : 0
    );
    return this.findById(result.lastInsertRowid);
  },
  update(data) {
    const db2 = getDatabase();
    const existing = db2.prepare("SELECT * FROM notes WHERE id = ?").get(data.id);
    if (!existing) throw new Error(`Note with id ${data.id} not found`);
    const stmt = db2.prepare(`
      UPDATE notes SET title = ?, content = ?, category = ?, tags = ?, is_pinned = ?
      WHERE id = ?
    `);
    stmt.run(
      data.title ?? existing.title,
      data.content !== void 0 ? data.content : existing.content,
      data.category ?? existing.category,
      data.tags !== void 0 ? JSON.stringify(data.tags) : existing.tags,
      data.is_pinned !== void 0 ? data.is_pinned ? 1 : 0 : existing.is_pinned,
      data.id
    );
    return this.findById(data.id);
  },
  togglePin(id) {
    const db2 = getDatabase();
    db2.prepare(
      "UPDATE notes SET is_pinned = CASE WHEN is_pinned = 1 THEN 0 ELSE 1 END WHERE id = ?"
    ).run(id);
    return this.findById(id);
  },
  delete(id) {
    const db2 = getDatabase();
    const result = db2.prepare("DELETE FROM notes WHERE id = ?").run(id);
    return result.changes > 0;
  },
  count() {
    const db2 = getDatabase();
    const row = db2.prepare("SELECT COUNT(*) as count FROM notes").get();
    return row.count;
  },
  getRecent(limit = 5) {
    const db2 = getDatabase();
    const rows = db2.prepare("SELECT * FROM notes ORDER BY created_at DESC LIMIT ?").all(limit);
    return rows.map(rowToNote);
  }
};
function registerNoteHandlers() {
  handle("notes:getAll", () => NoteRepository.findAll());
  handle(
    "notes:getById",
    (id) => NoteRepository.findById(id)
  );
  handle(
    "notes:search",
    (query) => NoteRepository.search(query)
  );
  handle(
    "notes:create",
    (data) => NoteRepository.create(data)
  );
  handle(
    "notes:update",
    (data) => NoteRepository.update(data)
  );
  handle(
    "notes:delete",
    (id) => NoteRepository.delete(id)
  );
  handle(
    "notes:togglePin",
    (id) => NoteRepository.togglePin(id)
  );
}
function rowToTask(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    priority: row.priority,
    due_date: row.due_date,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}
const TaskRepository = {
  findAll() {
    const db2 = getDatabase();
    const rows = db2.prepare(
      `SELECT * FROM tasks
         ORDER BY
           CASE status WHEN 'done' THEN 1 ELSE 0 END ASC,
           CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END ASC,
           due_date ASC NULLS LAST`
    ).all();
    return rows.map(rowToTask);
  },
  findById(id) {
    const db2 = getDatabase();
    const row = db2.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
    if (!row) return null;
    return rowToTask(row);
  },
  search(query) {
    const db2 = getDatabase();
    const like = `%${query}%`;
    const rows = db2.prepare(
      `SELECT * FROM tasks
         WHERE name LIKE ? OR description LIKE ?
         ORDER BY created_at DESC`
    ).all(like, like);
    return rows.map(rowToTask);
  },
  findByStatus(status) {
    const db2 = getDatabase();
    const rows = db2.prepare("SELECT * FROM tasks WHERE status = ? ORDER BY created_at DESC").all(status);
    return rows.map(rowToTask);
  },
  findByPriority(priority) {
    const db2 = getDatabase();
    const rows = db2.prepare("SELECT * FROM tasks WHERE priority = ? ORDER BY due_date ASC NULLS LAST").all(priority);
    return rows.map(rowToTask);
  },
  findPending() {
    const db2 = getDatabase();
    const rows = db2.prepare(
      `SELECT * FROM tasks WHERE status != 'done'
         ORDER BY CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END ASC`
    ).all();
    return rows.map(rowToTask);
  },
  create(data) {
    const db2 = getDatabase();
    const stmt = db2.prepare(`
      INSERT INTO tasks (name, description, priority, due_date, status)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.name,
      data.description ?? null,
      data.priority ?? "medium",
      data.due_date ?? null,
      data.status ?? "todo"
    );
    return this.findById(result.lastInsertRowid);
  },
  update(data) {
    const db2 = getDatabase();
    const existing = db2.prepare("SELECT * FROM tasks WHERE id = ?").get(data.id);
    if (!existing) throw new Error(`Task with id ${data.id} not found`);
    const stmt = db2.prepare(`
      UPDATE tasks SET name = ?, description = ?, priority = ?, due_date = ?, status = ?
      WHERE id = ?
    `);
    stmt.run(
      data.name ?? existing.name,
      data.description !== void 0 ? data.description : existing.description,
      data.priority ?? existing.priority,
      data.due_date !== void 0 ? data.due_date : existing.due_date,
      data.status ?? existing.status,
      data.id
    );
    return this.findById(data.id);
  },
  updateStatus(id, status) {
    const db2 = getDatabase();
    db2.prepare("UPDATE tasks SET status = ? WHERE id = ?").run(status, id);
    return this.findById(id);
  },
  delete(id) {
    const db2 = getDatabase();
    const result = db2.prepare("DELETE FROM tasks WHERE id = ?").run(id);
    return result.changes > 0;
  },
  count() {
    const db2 = getDatabase();
    const row = db2.prepare("SELECT COUNT(*) as count FROM tasks").get();
    return row.count;
  },
  countPending() {
    const db2 = getDatabase();
    const row = db2.prepare("SELECT COUNT(*) as count FROM tasks WHERE status != 'done'").get();
    return row.count;
  },
  getStatusCounts() {
    const db2 = getDatabase();
    const rows = db2.prepare("SELECT status, COUNT(*) as count FROM tasks GROUP BY status").all();
    const counts = { todo: 0, in_progress: 0, done: 0 };
    rows.forEach((r) => {
      counts[r.status] = r.count;
    });
    return counts;
  },
  getRecent(limit = 5) {
    const db2 = getDatabase();
    const rows = db2.prepare("SELECT * FROM tasks ORDER BY created_at DESC LIMIT ?").all(limit);
    return rows.map(rowToTask);
  }
};
function registerTaskHandlers() {
  handle("tasks:getAll", () => TaskRepository.findAll());
  handle(
    "tasks:getById",
    (id) => TaskRepository.findById(id)
  );
  handle(
    "tasks:search",
    (query) => TaskRepository.search(query)
  );
  handle(
    "tasks:create",
    (data) => TaskRepository.create(data)
  );
  handle(
    "tasks:update",
    (data) => TaskRepository.update(data)
  );
  handle(
    "tasks:delete",
    (id) => TaskRepository.delete(id)
  );
  handle(
    "tasks:updateStatus",
    (id, status) => TaskRepository.updateStatus(id, status)
  );
}
const ExportService = {
  exportAll() {
    return {
      version: "1.0.0",
      exported_at: (/* @__PURE__ */ new Date()).toISOString(),
      websites: WebsiteRepository.findAll(),
      applications: ApplicationRepository.findAll(),
      links: LinkRepository.findAll(),
      notes: NoteRepository.findAll(),
      tasks: TaskRepository.findAll()
    };
  },
  importAll(data) {
    const counts = {
      websites: 0,
      applications: 0,
      links: 0,
      notes: 0,
      tasks: 0
    };
    const errors = [];
    if (Array.isArray(data.websites)) {
      for (const item of data.websites) {
        try {
          WebsiteRepository.create({
            name: item.name,
            url: item.url,
            username: item.username ?? void 0,
            email: item.email ?? void 0,
            password: item.password ?? void 0,
            notes: item.notes ?? void 0,
            tags: item.tags ?? [],
            is_favorite: item.is_favorite
          });
          counts.websites++;
        } catch (e) {
          errors.push(`Website "${item.name}": ${e.message}`);
        }
      }
    }
    if (Array.isArray(data.applications)) {
      for (const item of data.applications) {
        try {
          ApplicationRepository.create({
            name: item.name,
            url: item.url ?? void 0,
            username: item.username ?? void 0,
            password: item.password ?? void 0,
            environment: item.environment,
            notes: item.notes ?? void 0,
            is_favorite: item.is_favorite
          });
          counts.applications++;
        } catch (e) {
          errors.push(`Application "${item.name}": ${e.message}`);
        }
      }
    }
    if (Array.isArray(data.links)) {
      for (const item of data.links) {
        try {
          LinkRepository.create({
            title: item.title,
            url: item.url,
            category: item.category,
            description: item.description ?? void 0,
            is_favorite: item.is_favorite
          });
          counts.links++;
        } catch (e) {
          errors.push(`Link "${item.title}": ${e.message}`);
        }
      }
    }
    if (Array.isArray(data.notes)) {
      for (const item of data.notes) {
        try {
          NoteRepository.create({
            title: item.title,
            content: item.content,
            category: item.category,
            tags: item.tags ?? [],
            is_pinned: item.is_pinned
          });
          counts.notes++;
        } catch (e) {
          errors.push(`Note "${item.title}": ${e.message}`);
        }
      }
    }
    if (Array.isArray(data.tasks)) {
      for (const item of data.tasks) {
        try {
          TaskRepository.create({
            name: item.name,
            description: item.description ?? void 0,
            priority: item.priority,
            due_date: item.due_date ?? void 0,
            status: item.status
          });
          counts.tasks++;
        } catch (e) {
          errors.push(`Task "${item.name}": ${e.message}`);
        }
      }
    }
    console.log("[ExportService] Import complete:", counts);
    if (errors.length > 0) {
      console.warn("[ExportService] Import errors:", errors);
    }
    return { imported: counts, errors };
  }
};
const BackupService = {
  /**
   * Create a binary backup of the SQLite database file.
   * Returns the path where the backup was saved.
   */
  async backupDatabase(destinationPath) {
    const sourcePath = getDatabasePath();
    if (!fs.existsSync(sourcePath)) {
      throw new Error("Database file not found.");
    }
    const db2 = getDatabase();
    await db2.backup(destinationPath);
    console.log(`[BackupService] Database backed up to: ${destinationPath}`);
    return destinationPath;
  },
  /**
   * Restore database from a backup file.
   * This replaces the current database with the backup.
   */
  restoreDatabase(sourcePath) {
    if (!fs.existsSync(sourcePath)) {
      throw new Error("Backup file not found.");
    }
    const dbPath = getDatabasePath();
    const tempPath = dbPath + ".restore_temp";
    const header = Buffer.alloc(16);
    const fd = fs.openSync(sourcePath, "r");
    fs.readSync(fd, header, 0, 16, 0);
    fs.closeSync(fd);
    if (!header.toString("utf8", 0, 6).startsWith("SQLite")) {
      throw new Error("Invalid SQLite backup file.");
    }
    fs.copyFileSync(sourcePath, tempPath);
    fs.renameSync(tempPath, dbPath);
    console.log(`[BackupService] Database restored from: ${sourcePath}`);
  },
  /**
   * Export all data as a JSON file.
   */
  async exportToJSON(destinationPath) {
    const data = ExportService.exportAll();
    const json = JSON.stringify(data, null, 2);
    fs.writeFileSync(destinationPath, json, "utf8");
    console.log(`[BackupService] Data exported to JSON: ${destinationPath}`);
    return destinationPath;
  },
  /**
   * Import data from a JSON export file.
   * This MERGES data — does not delete existing records.
   */
  importFromJSON(sourcePath) {
    if (!fs.existsSync(sourcePath)) {
      throw new Error("Import file not found.");
    }
    const raw = fs.readFileSync(sourcePath, "utf8");
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error("Invalid JSON import file.");
    }
    return ExportService.importAll(data);
  },
  /**
   * Get info about the database file.
   */
  getDatabaseInfo() {
    const dbPath = getDatabasePath();
    const exists = fs.existsSync(dbPath);
    if (!exists) {
      return { path: dbPath, size: 0, sizeFormatted: "0 B", exists: false, lastModified: null };
    }
    const stats = fs.statSync(dbPath);
    const size = stats.size;
    const lastModified = stats.mtime.toISOString();
    let sizeFormatted;
    if (size < 1024) sizeFormatted = `${size} B`;
    else if (size < 1024 * 1024) sizeFormatted = `${(size / 1024).toFixed(1)} KB`;
    else sizeFormatted = `${(size / (1024 * 1024)).toFixed(2)} MB`;
    return { path: dbPath, size, sizeFormatted, exists, lastModified };
  },
  /**
   * Generate a timestamped backup filename.
   */
  generateBackupFilename() {
    const now = /* @__PURE__ */ new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-").replace("T", "_").slice(0, 19);
    return `workvault_backup_${timestamp}.db`;
  },
  /**
   * Get the default backup directory.
   */
  getDefaultBackupDir() {
    return electron.app.getPath("documents");
  }
};
function registerSettingsHandlers() {
  handle("settings:get", (key) => {
    const db2 = getDatabase();
    const row = db2.prepare("SELECT value FROM settings WHERE key = ?").get(key);
    return (row == null ? void 0 : row.value) ?? null;
  });
  handle("settings:set", (key, value) => {
    const db2 = getDatabase();
    db2.prepare(`
      INSERT INTO settings (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
    `).run(key, value);
    return true;
  });
  handle("settings:getDatabaseInfo", () => BackupService.getDatabaseInfo());
  handle(
    "settings:backupDatabase",
    (destinationPath) => BackupService.backupDatabase(destinationPath)
  );
  handle("settings:restoreDatabase", (sourcePath) => {
    BackupService.restoreDatabase(sourcePath);
    return true;
  });
  handle(
    "settings:exportJSON",
    (destinationPath) => BackupService.exportToJSON(destinationPath)
  );
  handle(
    "settings:importJSON",
    (sourcePath) => BackupService.importFromJSON(sourcePath)
  );
}
function registerDashboardHandlers() {
  handle("dashboard:getStats", () => {
    return {
      totalWebsites: WebsiteRepository.count(),
      totalApplications: ApplicationRepository.count(),
      totalLinks: LinkRepository.count(),
      totalNotes: NoteRepository.count(),
      totalTasks: TaskRepository.count(),
      pendingTasks: TaskRepository.countPending(),
      recentWebsites: WebsiteRepository.getRecent(5),
      recentApplications: ApplicationRepository.getRecent(5),
      recentNotes: NoteRepository.getRecent(5),
      recentLinks: LinkRepository.getRecent(5),
      favoritesWebsites: WebsiteRepository.findFavorites(),
      favoritesLinks: LinkRepository.findFavorites()
    };
  });
}
function registerUtilityHandlers() {
  handle("utility:openExternal", async (url) => {
    await electron.shell.openExternal(url);
    return true;
  });
  handle("utility:showSaveDialog", async (options) => {
    const opts = options;
    const result = await electron.dialog.showSaveDialog({
      title: opts.title,
      defaultPath: opts.defaultPath,
      filters: opts.filters
    });
    return result.canceled ? null : result.filePath ?? null;
  });
  handle("utility:showOpenDialog", async (options) => {
    const opts = options;
    const result = await electron.dialog.showOpenDialog({
      title: opts.title,
      filters: opts.filters,
      properties: opts.properties ?? ["openFile"]
    });
    return result.canceled || result.filePaths.length === 0 ? null : result.filePaths[0];
  });
  handle("utility:generatePassword", (options) => {
    const opts = options;
    return EncryptionService.generatePassword(opts);
  });
  handle("utility:generateUUID", () => EncryptionService.generateUUID());
}
function encryptField(value) {
  if (value === void 0 || value === null) return null;
  if (value === "") return "";
  return EncryptionService.encrypt(value);
}
function decryptField(value) {
  if (!value) return null;
  return EncryptionService.decrypt(value);
}
function rowToConnection(row) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    user_schema: decryptField(row.user_schema) ?? row.user_schema,
    password: decryptField(row.password),
    host: row.host,
    port: row.port,
    service_name: row.service_name,
    tns_alias: row.tns_alias,
    notes: row.notes,
    is_favorite: row.is_favorite,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}
const DbConnectionRepository = {
  findAll() {
    const db2 = getDatabase();
    const rows = db2.prepare("SELECT * FROM db_connections ORDER BY is_favorite DESC, updated_at DESC").all();
    return rows.map(rowToConnection);
  },
  findById(id) {
    const db2 = getDatabase();
    const row = db2.prepare("SELECT * FROM db_connections WHERE id = ?").get(id);
    if (!row) return null;
    return rowToConnection(row);
  },
  search(query) {
    const db2 = getDatabase();
    const like = `%${query}%`;
    const rows = db2.prepare(
      `SELECT * FROM db_connections
         WHERE name LIKE ? OR user_schema LIKE ? OR host LIKE ? OR service_name LIKE ?
         ORDER BY is_favorite DESC, updated_at DESC`
    ).all(like, like, like, like);
    return rows.map(rowToConnection);
  },
  create(data) {
    const db2 = getDatabase();
    const result = db2.prepare(
      `INSERT INTO db_connections
          (name, type, user_schema, password, host, port, service_name, tns_alias, notes, is_favorite)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      data.name,
      data.type ?? "direct",
      encryptField(data.user_schema) ?? data.user_schema,
      encryptField(data.password),
      data.host ?? null,
      data.port ?? null,
      data.service_name ?? null,
      data.tns_alias ?? null,
      data.notes ?? null,
      data.is_favorite ? 1 : 0
    );
    return this.findById(result.lastInsertRowid);
  },
  update(data) {
    const db2 = getDatabase();
    const existing = db2.prepare("SELECT * FROM db_connections WHERE id = ?").get(data.id);
    if (!existing) throw new Error(`DbConnection with id ${data.id} not found`);
    db2.prepare(
      `UPDATE db_connections SET
        name = ?, type = ?, user_schema = ?, password = ?,
        host = ?, port = ?, service_name = ?, tns_alias = ?, notes = ?, is_favorite = ?
       WHERE id = ?`
    ).run(
      data.name ?? existing.name,
      data.type ?? existing.type,
      data.user_schema !== void 0 ? encryptField(data.user_schema) : existing.user_schema,
      data.password !== void 0 ? encryptField(data.password) : existing.password,
      data.host !== void 0 ? data.host : existing.host,
      data.port !== void 0 ? data.port : existing.port,
      data.service_name !== void 0 ? data.service_name : existing.service_name,
      data.tns_alias !== void 0 ? data.tns_alias : existing.tns_alias,
      data.notes !== void 0 ? data.notes : existing.notes,
      data.is_favorite !== void 0 ? data.is_favorite ? 1 : 0 : existing.is_favorite,
      data.id
    );
    return this.findById(data.id);
  },
  toggleFavorite(id) {
    const db2 = getDatabase();
    db2.prepare(
      "UPDATE db_connections SET is_favorite = CASE WHEN is_favorite = 1 THEN 0 ELSE 1 END WHERE id = ?"
    ).run(id);
    return this.findById(id);
  },
  delete(id) {
    const db2 = getDatabase();
    const result = db2.prepare("DELETE FROM db_connections WHERE id = ?").run(id);
    return result.changes > 0;
  },
  count() {
    const db2 = getDatabase();
    const row = db2.prepare("SELECT COUNT(*) as count FROM db_connections").get();
    return row.count;
  }
};
function ensureTable() {
  const db2 = getDatabase();
  db2.exec(`
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
  db2.exec(`
    CREATE TRIGGER IF NOT EXISTS update_db_connections_updated_at
    AFTER UPDATE ON db_connections
    BEGIN
      UPDATE db_connections SET updated_at = datetime('now') WHERE id = NEW.id;
    END
  `);
}
function registerDbConnectionHandlers() {
  ensureTable();
  handle("dbconnections:getAll", () => DbConnectionRepository.findAll());
  handle(
    "dbconnections:getById",
    (id) => DbConnectionRepository.findById(id)
  );
  handle(
    "dbconnections:search",
    (query) => DbConnectionRepository.search(query)
  );
  handle(
    "dbconnections:create",
    (data) => DbConnectionRepository.create(data)
  );
  handle(
    "dbconnections:update",
    (data) => DbConnectionRepository.update(data)
  );
  handle(
    "dbconnections:delete",
    (id) => DbConnectionRepository.delete(id)
  );
  handle(
    "dbconnections:toggleFavorite",
    (id) => DbConnectionRepository.toggleFavorite(id)
  );
}
const isDev = !electron.app.isPackaged;
let mainWindow = null;
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 640,
    show: false,
    frame: true,
    backgroundColor: "#0f172a",
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      // ✅ Security: isolate renderer context
      nodeIntegration: false,
      // ✅ Security: no Node in renderer
      sandbox: false,
      // needed for preload to use Node APIs
      webSecurity: true,
      allowRunningInsecureContent: false
    },
    icon: path.join(__dirname, "../public/icon.png")
  });
  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
  mainWindow.once("ready-to-show", () => {
    mainWindow == null ? void 0 : mainWindow.show();
    mainWindow == null ? void 0 : mainWindow.focus();
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    electron.shell.openExternal(url);
    return { action: "deny" };
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}
function registerAllIPCHandlers() {
  registerWebsiteHandlers();
  registerApplicationHandlers();
  registerLinkHandlers();
  registerNoteHandlers();
  registerTaskHandlers();
  registerSettingsHandlers();
  registerDashboardHandlers();
  registerUtilityHandlers();
  registerDbConnectionHandlers();
}
electron.app.whenReady().then(() => {
  try {
    const db2 = initializeDatabase();
    runMigrations(db2);
    console.log("[WorkVault] Database ready.");
  } catch (err) {
    console.error("[WorkVault] Failed to initialize database:", err);
    electron.app.quit();
    return;
  }
  registerAllIPCHandlers();
  createWindow();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
electron.app.on("window-all-closed", () => {
  closeDatabase();
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.app.on("before-quit", () => {
  closeDatabase();
});
electron.app.on("web-contents-created", (_event, contents) => {
  contents.on("will-navigate", (event, url) => {
    const allowedOrigins = ["http://localhost:5173", `file://`];
    const isAllowed = allowedOrigins.some((origin) => url.startsWith(origin));
    if (!isAllowed) {
      event.preventDefault();
      electron.shell.openExternal(url);
    }
  });
});
//# sourceMappingURL=main.js.map
