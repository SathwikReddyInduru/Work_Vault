// electron/ipc/ipc.helper.ts
// Shared utility: wraps any handler in try/catch and returns IPCResponse shape

import { ipcMain } from 'electron';
import type { IPCResponse } from '../../src/types/electron.types';

/**
 * Register an ipcMain handler that always returns { success, data, error }.
 * Catches any thrown error and returns it as { success: false, error: message }.
 */
export function handle<T>(
  channel: string,
  fn: (...args: unknown[]) => T | Promise<T>
): void {
  ipcMain.handle(channel, async (_event, ...args: unknown[]): Promise<IPCResponse<T>> => {
    try {
      const data = await fn(...args);
      return { success: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[IPC:${channel}] Error:`, message);
      return { success: false, error: message };
    }
  });
}
