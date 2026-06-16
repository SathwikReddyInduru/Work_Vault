"use strict";
// electron/ipc/ipc.helper.ts
// Shared utility: wraps any handler in try/catch and returns IPCResponse shape
Object.defineProperty(exports, "__esModule", { value: true });
exports.handle = handle;
const electron_1 = require("electron");
/**
 * Register an ipcMain handler that always returns { success, data, error }.
 * Catches any thrown error and returns it as { success: false, error: message }.
 */
function handle(channel, fn) {
    electron_1.ipcMain.handle(channel, async (_event, ...args) => {
        try {
            const data = await fn(...args);
            return { success: true, data };
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            console.error(`[IPC:${channel}] Error:`, message);
            return { success: false, error: message };
        }
    });
}
//# sourceMappingURL=ipc.helper.js.map