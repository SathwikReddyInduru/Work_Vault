// src/services/backup.service.ts
// Database backup, restore, and migration utilities

import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import { getDatabase, getDatabasePath } from '../database/connection';
import { ExportService } from './export.service';

export const BackupService = {
  /**
   * Create a binary backup of the SQLite database file.
   * Returns the path where the backup was saved.
   */
  async backupDatabase(destinationPath: string): Promise<string> {
    const sourcePath = getDatabasePath();

    if (!fs.existsSync(sourcePath)) {
      throw new Error('Database file not found.');
    }

    // Use better-sqlite3 backup API for safe hot backup
    const db = getDatabase();
    await db.backup(destinationPath);

    console.log(`[BackupService] Database backed up to: ${destinationPath}`);
    return destinationPath;
  },

  /**
   * Restore database from a backup file.
   * This replaces the current database with the backup.
   */
  restoreDatabase(sourcePath: string): void {
    if (!fs.existsSync(sourcePath)) {
      throw new Error('Backup file not found.');
    }

    const dbPath = getDatabasePath();
    const tempPath = dbPath + '.restore_temp';

    // Validate the backup is a valid SQLite file
    const header = Buffer.alloc(16);
    const fd = fs.openSync(sourcePath, 'r');
    fs.readSync(fd, header, 0, 16, 0);
    fs.closeSync(fd);

    if (!header.toString('utf8', 0, 6).startsWith('SQLite')) {
      throw new Error('Invalid SQLite backup file.');
    }

    // Copy to temp first, then replace
    fs.copyFileSync(sourcePath, tempPath);

    // Close current db and swap
    fs.renameSync(tempPath, dbPath);

    console.log(`[BackupService] Database restored from: ${sourcePath}`);
  },

  /**
   * Export all data as a JSON file.
   */
  async exportToJSON(destinationPath: string): Promise<string> {
    const data = ExportService.exportAll();
    const json = JSON.stringify(data, null, 2);
    fs.writeFileSync(destinationPath, json, 'utf8');
    console.log(`[BackupService] Data exported to JSON: ${destinationPath}`);
    return destinationPath;
  },

  /**
   * Import data from a JSON export file.
   * This MERGES data — does not delete existing records.
   */
  importFromJSON(sourcePath: string): { imported: Record<string, number>; errors: string[] } {
    if (!fs.existsSync(sourcePath)) {
      throw new Error('Import file not found.');
    }

    const raw = fs.readFileSync(sourcePath, 'utf8');
    let data: ReturnType<typeof ExportService.exportAll>;

    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error('Invalid JSON import file.');
    }

    return ExportService.importAll(data);
  },

  /**
   * Get info about the database file.
   */
  getDatabaseInfo(): {
    path: string;
    size: number;
    sizeFormatted: string;
    exists: boolean;
    lastModified: string | null;
  } {
    const dbPath = getDatabasePath();
    const exists = fs.existsSync(dbPath);

    if (!exists) {
      return { path: dbPath, size: 0, sizeFormatted: '0 B', exists: false, lastModified: null };
    }

    const stats = fs.statSync(dbPath);
    const size = stats.size;
    const lastModified = stats.mtime.toISOString();

    let sizeFormatted: string;
    if (size < 1024) sizeFormatted = `${size} B`;
    else if (size < 1024 * 1024) sizeFormatted = `${(size / 1024).toFixed(1)} KB`;
    else sizeFormatted = `${(size / (1024 * 1024)).toFixed(2)} MB`;

    return { path: dbPath, size, sizeFormatted, exists, lastModified };
  },

  /**
   * Generate a timestamped backup filename.
   */
  generateBackupFilename(): string {
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
  getDefaultBackupDir(): string {
    return app.getPath('documents');
  },
};
