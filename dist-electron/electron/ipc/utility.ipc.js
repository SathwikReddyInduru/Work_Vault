"use strict";
// electron/ipc/utility.ipc.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUtilityHandlers = registerUtilityHandlers;
const electron_1 = require("electron");
const ipc_helper_1 = require("./ipc.helper");
const encryption_service_1 = require("../../src/services/encryption.service");
function registerUtilityHandlers() {
    // ── Open URL in default browser ───────────────────────────────────────────
    (0, ipc_helper_1.handle)('utility:openExternal', async (url) => {
        await electron_1.shell.openExternal(url);
        return true;
    });
    // ── Native Save Dialog ────────────────────────────────────────────────────
    (0, ipc_helper_1.handle)('utility:showSaveDialog', async (options) => {
        const opts = options;
        const result = await electron_1.dialog.showSaveDialog({
            title: opts.title,
            defaultPath: opts.defaultPath,
            filters: opts.filters,
        });
        return result.canceled ? null : result.filePath ?? null;
    });
    // ── Native Open Dialog ────────────────────────────────────────────────────
    (0, ipc_helper_1.handle)('utility:showOpenDialog', async (options) => {
        const opts = options;
        const result = await electron_1.dialog.showOpenDialog({
            title: opts.title,
            filters: opts.filters,
            properties: opts.properties ?? ['openFile'],
        });
        return result.canceled || result.filePaths.length === 0
            ? null
            : result.filePaths[0];
    });
    // ── Password Generator ────────────────────────────────────────────────────
    (0, ipc_helper_1.handle)('utility:generatePassword', (options) => {
        const opts = options;
        return encryption_service_1.EncryptionService.generatePassword(opts);
    });
    // ── UUID v4 Generator ─────────────────────────────────────────────────────
    (0, ipc_helper_1.handle)('utility:generateUUID', () => encryption_service_1.EncryptionService.generateUUID());
}
//# sourceMappingURL=utility.ipc.js.map