// electron/ipc/settings.ipc.ts

import { handle } from './ipc.helper';
import { getDatabase } from '../../src/database/connection';
import { BackupService } from '../../src/services/backup.service';

export function registerSettingsHandlers(): void {
  // ── App settings (key/value store) ────────────────────────────────────────
  handle('settings:get', (key: unknown) => {
    const db = getDatabase();
    const row = db
      .prepare('SELECT value FROM settings WHERE key = ?')
      .get(key as string) as { value: string } | undefined;
    return row?.value ?? null;
  });

  handle('settings:set', (key: unknown, value: unknown) => {
    const db = getDatabase();
    db.prepare(`
      INSERT INTO settings (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
    `).run(key as string, value as string);
    return true;
  });

  // ── Database info ─────────────────────────────────────────────────────────
  handle('settings:getDatabaseInfo', () => BackupService.getDatabaseInfo());

  // ── Backup / Restore ──────────────────────────────────────────────────────
  handle('settings:backupDatabase', (destinationPath: unknown) =>
    BackupService.backupDatabase(destinationPath as string)
  );

  handle('settings:restoreDatabase', (sourcePath: unknown) => {
    BackupService.restoreDatabase(sourcePath as string);
    return true;
  });

  // ── Export / Import JSON ──────────────────────────────────────────────────
  handle('settings:exportJSON', (destinationPath: unknown) =>
    BackupService.exportToJSON(destinationPath as string)
  );

  handle('settings:importJSON', (sourcePath: unknown) =>
    BackupService.importFromJSON(sourcePath as string)
  );
}
