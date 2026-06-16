"use strict";
// electron/ipc/index.ts
// Barrel export for all IPC handler registrars
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUtilityHandlers = exports.registerDashboardHandlers = exports.registerSettingsHandlers = exports.registerTaskHandlers = exports.registerNoteHandlers = exports.registerLinkHandlers = exports.registerApplicationHandlers = exports.registerWebsiteHandlers = void 0;
var websites_ipc_1 = require("./websites.ipc");
Object.defineProperty(exports, "registerWebsiteHandlers", { enumerable: true, get: function () { return websites_ipc_1.registerWebsiteHandlers; } });
var applications_ipc_1 = require("./applications.ipc");
Object.defineProperty(exports, "registerApplicationHandlers", { enumerable: true, get: function () { return applications_ipc_1.registerApplicationHandlers; } });
var links_ipc_1 = require("./links.ipc");
Object.defineProperty(exports, "registerLinkHandlers", { enumerable: true, get: function () { return links_ipc_1.registerLinkHandlers; } });
var notes_ipc_1 = require("./notes.ipc");
Object.defineProperty(exports, "registerNoteHandlers", { enumerable: true, get: function () { return notes_ipc_1.registerNoteHandlers; } });
var tasks_ipc_1 = require("./tasks.ipc");
Object.defineProperty(exports, "registerTaskHandlers", { enumerable: true, get: function () { return tasks_ipc_1.registerTaskHandlers; } });
var settings_ipc_1 = require("./settings.ipc");
Object.defineProperty(exports, "registerSettingsHandlers", { enumerable: true, get: function () { return settings_ipc_1.registerSettingsHandlers; } });
var dashboard_ipc_1 = require("./dashboard.ipc");
Object.defineProperty(exports, "registerDashboardHandlers", { enumerable: true, get: function () { return dashboard_ipc_1.registerDashboardHandlers; } });
var utility_ipc_1 = require("./utility.ipc");
Object.defineProperty(exports, "registerUtilityHandlers", { enumerable: true, get: function () { return utility_ipc_1.registerUtilityHandlers; } });
//# sourceMappingURL=index.js.map