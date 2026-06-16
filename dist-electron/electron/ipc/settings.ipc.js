"use strict";
// electron/ipc/settings.ipc.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSettingsHandlers = registerSettingsHandlers;
const ipc_helper_1 = require("./ipc.helper");
const connection_1 = require("../../src/database/connection");
const backup_service_1 = require("../../src/services/backup.service");
function registerSettingsHandlers() {
    // ── App settings (key/value store) ────────────────────────────────────────
    (0, ipc_helper_1.handle)('settings:get', (key) => {
        const db = (0, connection_1.getDatabase)();
        const row = db
            .prepare('SELECT value FROM settings WHERE key = ?')
            .get(key);
        return row?.value ?? null;
    });
    (0, ipc_helper_1.handle)('settings:set', (key, value) => {
        const db = (0, connection_1.getDatabase)();
        db.prepare(`
      INSERT INTO settings (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
    `).run(key, value);
        return true;
    });
    // ── Database info ─────────────────────────────────────────────────────────
    (0, ipc_helper_1.handle)('settings:getDatabaseInfo', () => backup_service_1.BackupService.getDatabaseInfo());
    // ── Backup / Restore ──────────────────────────────────────────────────────
    (0, ipc_helper_1.handle)('settings:backupDatabase', (destinationPath) => backup_service_1.BackupService.backupDatabase(destinationPath));
    (0, ipc_helper_1.handle)('settings:restoreDatabase', (sourcePath) => {
        backup_service_1.BackupService.restoreDatabase(sourcePath);
        return true;
    });
    // ── Export / Import JSON ──────────────────────────────────────────────────
    (0, ipc_helper_1.handle)('settings:exportJSON', (destinationPath) => backup_service_1.BackupService.exportToJSON(destinationPath));
    (0, ipc_helper_1.handle)('settings:importJSON', (sourcePath) => backup_service_1.BackupService.importFromJSON(sourcePath));
}
//# sourceMappingURL=settings.ipc.js.map