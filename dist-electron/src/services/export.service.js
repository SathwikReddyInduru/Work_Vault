"use strict";
// src/services/export.service.ts
// JSON export and import of all WorkVault data
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportService = void 0;
const website_repository_1 = require("../database/repositories/website.repository");
const application_repository_1 = require("../database/repositories/application.repository");
const link_repository_1 = require("../database/repositories/link.repository");
const note_repository_1 = require("../database/repositories/note.repository");
const task_repository_1 = require("../database/repositories/task.repository");
exports.ExportService = {
    exportAll() {
        return {
            version: '1.0.0',
            exported_at: new Date().toISOString(),
            websites: website_repository_1.WebsiteRepository.findAll(),
            applications: application_repository_1.ApplicationRepository.findAll(),
            links: link_repository_1.LinkRepository.findAll(),
            notes: note_repository_1.NoteRepository.findAll(),
            tasks: task_repository_1.TaskRepository.findAll(),
        };
    },
    importAll(data) {
        const counts = {
            websites: 0,
            applications: 0,
            links: 0,
            notes: 0,
            tasks: 0,
        };
        const errors = [];
        // Import websites
        if (Array.isArray(data.websites)) {
            for (const item of data.websites) {
                try {
                    website_repository_1.WebsiteRepository.create({
                        name: item.name,
                        url: item.url,
                        username: item.username ?? undefined,
                        email: item.email ?? undefined,
                        password: item.password ?? undefined,
                        notes: item.notes ?? undefined,
                        tags: item.tags ?? [],
                        is_favorite: item.is_favorite,
                    });
                    counts.websites++;
                }
                catch (e) {
                    errors.push(`Website "${item.name}": ${e.message}`);
                }
            }
        }
        // Import applications
        if (Array.isArray(data.applications)) {
            for (const item of data.applications) {
                try {
                    application_repository_1.ApplicationRepository.create({
                        name: item.name,
                        url: item.url ?? undefined,
                        username: item.username ?? undefined,
                        password: item.password ?? undefined,
                        environment: item.environment,
                        notes: item.notes ?? undefined,
                        is_favorite: item.is_favorite,
                    });
                    counts.applications++;
                }
                catch (e) {
                    errors.push(`Application "${item.name}": ${e.message}`);
                }
            }
        }
        // Import links
        if (Array.isArray(data.links)) {
            for (const item of data.links) {
                try {
                    link_repository_1.LinkRepository.create({
                        title: item.title,
                        url: item.url,
                        category: item.category,
                        description: item.description ?? undefined,
                        is_favorite: item.is_favorite,
                    });
                    counts.links++;
                }
                catch (e) {
                    errors.push(`Link "${item.title}": ${e.message}`);
                }
            }
        }
        // Import notes
        if (Array.isArray(data.notes)) {
            for (const item of data.notes) {
                try {
                    note_repository_1.NoteRepository.create({
                        title: item.title,
                        content: item.content,
                        category: item.category,
                        tags: item.tags ?? [],
                        is_pinned: item.is_pinned,
                    });
                    counts.notes++;
                }
                catch (e) {
                    errors.push(`Note "${item.title}": ${e.message}`);
                }
            }
        }
        // Import tasks
        if (Array.isArray(data.tasks)) {
            for (const item of data.tasks) {
                try {
                    task_repository_1.TaskRepository.create({
                        name: item.name,
                        description: item.description ?? undefined,
                        priority: item.priority,
                        due_date: item.due_date ?? undefined,
                        status: item.status,
                    });
                    counts.tasks++;
                }
                catch (e) {
                    errors.push(`Task "${item.name}": ${e.message}`);
                }
            }
        }
        console.log('[ExportService] Import complete:', counts);
        if (errors.length > 0) {
            console.warn('[ExportService] Import errors:', errors);
        }
        return { imported: counts, errors };
    },
};
//# sourceMappingURL=export.service.js.map