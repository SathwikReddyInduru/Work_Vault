"use strict";
// src/services/backup.service.ts
// Database backup, restore, and migration utilities
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupService = void 0;
const fs_1 = __importDefault(require("fs"));
const electron_1 = require("electron");
const connection_1 = require("../database/connection");
const export_service_1 = require("./export.service");
exports.BackupService = {
    /**
     * Create a binary backup of the SQLite database file.
     * Returns the path where the backup was saved.
     */
    async backupDatabase(destinationPath) {
        const sourcePath = (0, connection_1.getDatabasePath)();
        if (!fs_1.default.existsSync(sourcePath)) {
            throw new Error('Database file not found.');
        }
        // Use better-sqlite3 backup API for safe hot backup
        const db = (0, connection_1.getDatabase)();
        await db.backup(destinationPath);
        console.log(`[BackupService] Database backed up to: ${destinationPath}`);
        return destinationPath;
    },
    /**
     * Restore database from a backup file.
     * This replaces the current database with the backup.
     */
    restoreDatabase(sourcePath) {
        if (!fs_1.default.existsSync(sourcePath)) {
            throw new Error('Backup file not found.');
        }
        const dbPath = (0, connection_1.getDatabasePath)();
        const tempPath = dbPath + '.restore_temp';
        // Validate the backup is a valid SQLite file
        const header = Buffer.alloc(16);
        const fd = fs_1.default.openSync(sourcePath, 'r');
        fs_1.default.readSync(fd, header, 0, 16, 0);
        fs_1.default.closeSync(fd);
        if (!header.toString('utf8', 0, 6).startsWith('SQLite')) {
            throw new Error('Invalid SQLite backup file.');
        }
        // Copy to temp first, then replace
        fs_1.default.copyFileSync(sourcePath, tempPath);
        // Close current db and swap
        fs_1.default.renameSync(tempPath, dbPath);
        console.log(`[BackupService] Database restored from: ${sourcePath}`);
    },
    /**
     * Export all data as a JSON file.
     */
    async exportToJSON(destinationPath) {
        const data = export_service_1.ExportService.exportAll();
        const json = JSON.stringify(data, null, 2);
        fs_1.default.writeFileSync(destinationPath, json, 'utf8');
        console.log(`[BackupService] Data exported to JSON: ${destinationPath}`);
        return destinationPath;
    },
    /**
     * Import data from a JSON export file.
     * This MERGES data — does not delete existing records.
     */
    importFromJSON(sourcePath) {
        if (!fs_1.default.existsSync(sourcePath)) {
            throw new Error('Import file not found.');
        }
        const raw = fs_1.default.readFileSync(sourcePath, 'utf8');
        let data;
        try {
            data = JSON.parse(raw);
        }
        catch {
            throw new Error('Invalid JSON import file.');
        }
        return export_service_1.ExportService.importAll(data);
    },
    /**
     * Get info about the database file.
     */
    getDatabaseInfo() {
        const dbPath = (0, connection_1.getDatabasePath)();
        const exists = fs_1.default.existsSync(dbPath);
        if (!exists) {
            return { path: dbPath, size: 0, sizeFormatted: '0 B', exists: false, lastModified: null };
        }
        const stats = fs_1.default.statSync(dbPath);
        const size = stats.size;
        const lastModified = stats.mtime.toISOString();
        let sizeFormatted;
        if (size < 1024)
            sizeFormatted = `${size} B`;
        else if (size < 1024 * 1024)
            sizeFormatted = `${(size / 1024).toFixed(1)} KB`;
        else
            sizeFormatted = `${(size / (1024 * 1024)).toFixed(2)} MB`;
        return { path: dbPath, size, sizeFormatted, exists, lastModified };
    },
    /**
     * Generate a timestamped backup filename.
     */
    generateBackupFilename() {
        const now = new Date();
        const timestamp = now
            .toISOString()
            .replace(/[:.]/g, '-')
            .replace('T', '_')
            .slice(0, 19);
        return `workvault_backup_${timestamp}.db`;
    },
    /**
     * Get the default backup directory.
     */
    getDefaultBackupDir() {
        return electron_1.app.getPath('documents');
    },
};
//# sourceMappingURL=backup.service.js.map