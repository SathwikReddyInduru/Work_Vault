// electron/ipc/utility.ipc.ts

import { shell, dialog } from 'electron';
import { handle } from './ipc.helper';
import { EncryptionService } from '../../src/services/encryption.service';
import type { PasswordOptions, SaveDialogOptions, OpenDialogOptions } from '../../src/types/electron.types';

export function registerUtilityHandlers(): void {
  // ── Open URL in default browser ───────────────────────────────────────────
  handle('utility:openExternal', async (url: unknown) => {
    await shell.openExternal(url as string);
    return true;
  });

  // ── Native Save Dialog ────────────────────────────────────────────────────
  handle('utility:showSaveDialog', async (options: unknown) => {
    const opts = options as SaveDialogOptions;
    const result = await dialog.showSaveDialog({
      title: opts.title,
      defaultPath: opts.defaultPath,
      filters: opts.filters,
    });
    return result.canceled ? null : result.filePath ?? null;
  });

  // ── Native Open Dialog ────────────────────────────────────────────────────
  handle('utility:showOpenDialog', async (options: unknown) => {
    const opts = options as OpenDialogOptions;
    const result = await dialog.showOpenDialog({
      title: opts.title,
      filters: opts.filters,
      properties: (opts.properties as Electron.OpenDialogOptions['properties']) ?? ['openFile'],
    });
    return result.canceled || result.filePaths.length === 0
      ? null
      : result.filePaths[0];
  });

  // ── Password Generator ────────────────────────────────────────────────────
  handle('utility:generatePassword', (options: unknown) => {
    const opts = options as PasswordOptions;
    return EncryptionService.generatePassword(opts);
  });

  // ── UUID v4 Generator ─────────────────────────────────────────────────────
  handle('utility:generateUUID', () => EncryptionService.generateUUID());
}
