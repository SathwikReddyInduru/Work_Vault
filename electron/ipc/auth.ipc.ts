// electron/ipc/auth.ipc.ts
import { createHash } from 'crypto';
import { getDatabase } from '../../src/database/connection';
import { handle } from './ipc.helper';

function hashPin(pin: string): string {
  return createHash('sha256').update(`workvault:${pin}`).digest('hex');
}

export function registerAuthHandlers(): void {
  handle('auth:hasPin', () => {
    const db = getDatabase();
    const row = db
      .prepare("SELECT value FROM settings WHERE key = 'auth_pin'")
      .get() as { value: string } | undefined;
    return !!row?.value;
  });

  handle('auth:verifyPin', (pin: unknown) => {
    const db = getDatabase();
    const row = db
      .prepare("SELECT value FROM settings WHERE key = 'auth_pin'")
      .get() as { value: string } | undefined;
    if (!row?.value) return false; // No PIN stored — shouldn't happen, deny access
    return row.value === hashPin(pin as string);
  });

  handle('auth:setPin', (pin: unknown) => {
    const db = getDatabase();
    db.prepare(`
      INSERT INTO settings (key, value)
      VALUES ('auth_pin', ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
    `).run(hashPin(pin as string));
    return true;
  });

  handle('auth:removePin', () => {
    const db = getDatabase();
    db.prepare("DELETE FROM settings WHERE key = 'auth_pin'").run();
    return true;
  });
}