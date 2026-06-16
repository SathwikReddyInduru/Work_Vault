"use strict";
// electron/ipc/dashboard.ipc.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDashboardHandlers = registerDashboardHandlers;
const ipc_helper_1 = require("./ipc.helper");
const website_repository_1 = require("../../src/database/repositories/website.repository");
const application_repository_1 = require("../../src/database/repositories/application.repository");
const link_repository_1 = require("../../src/database/repositories/link.repository");
const note_repository_1 = require("../../src/database/repositories/note.repository");
const task_repository_1 = require("../../src/database/repositories/task.repository");
function registerDashboardHandlers() {
    (0, ipc_helper_1.handle)('dashboard:getStats', () => {
        return {
            totalWebsites: website_repository_1.WebsiteRepository.count(),
            totalApplications: application_repository_1.ApplicationRepository.count(),
            totalLinks: link_repository_1.LinkRepository.count(),
            totalNotes: note_repository_1.NoteRepository.count(),
            totalTasks: task_repository_1.TaskRepository.count(),
            pendingTasks: task_repository_1.TaskRepository.countPending(),
            recentWebsites: website_repository_1.WebsiteRepository.getRecent(5),
            recentApplications: application_repository_1.ApplicationRepository.getRecent(5),
            recentNotes: note_repository_1.NoteRepository.getRecent(5),
            recentLinks: link_repository_1.LinkRepository.getRecent(5),
            favoritesWebsites: website_repository_1.WebsiteRepository.findFavorites(),
            favoritesLinks: link_repository_1.LinkRepository.findFavorites(),
        };
    });
}
//# sourceMappingURL=dashboard.ipc.js.map